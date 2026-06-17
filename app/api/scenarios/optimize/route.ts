import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runSimulation, BaselineMetrics, ScenarioAdjustments } from '@/lib/simulation-engine';
import { logOptimizationRun } from '@/lib/dynamodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetType, targetGrowthPct } = body; // targetType: 'profit' | 'revenue', targetGrowthPct: number (e.g. 20)

    if (!targetType || targetGrowthPct === undefined) {
      return NextResponse.json({ error: 'targetType and targetGrowthPct are required' }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      include: {
        employees: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'No business profile found. Onboarding required.' }, { status: 404 });
    }

    const employees = business.employees;
    const baselinePayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const averageSalary = employees.length > 0 ? baselinePayroll / employees.length : 4000;

    const baselineMetrics: BaselineMetrics = {
      baselineRevenue: business.baselineRevenue,
      baselineMarketing: business.baselineMarketing,
      baselineInventory: business.baselineInventory,
      baselineFixedCosts: business.baselineFixedCosts,
      baselineHeadcount: employees.length,
      averageEmployeeSalary: averageSalary,
    };

    // Calculate baseline simulation results (priceIncrease=0, employeeCount=baseline, marketing=baseline, supplierDelay='none')
    const baseOutput = runSimulation(baselineMetrics, {
      priceIncrease: 0,
      employeeCount: employees.length,
      marketingBudget: business.baselineMarketing,
      supplierDelay: 'none',
    });

    const baselineValue = targetType === 'profit' ? baseOutput.projectedProfit : baseOutput.projectedRevenue;
    
    // Calculate target value
    let targetValue = 0;
    if (baselineValue > 0) {
      targetValue = baselineValue * (1 + targetGrowthPct / 100);
    } else {
      // If profit is negative, calculate increase relative to baseline revenue to avoid negative math issues
      targetValue = baselineValue + (business.baselineRevenue * targetGrowthPct / 100);
    }

    // Hill climbing state
    let currentAdjustments: ScenarioAdjustments = {
      priceIncrease: 0,
      employeeCount: employees.length,
      marketingBudget: business.baselineMarketing,
      supplierDelay: 'none',
    };

    const maxIterations = 800;
    let bestScore = -Infinity;
    let bestAdjustments = { ...currentAdjustments };

    // Cost weights: pricing (1.0), marketing (1.5 per $1K), headcount (5.0 per head)
    const getChangeCost = (adj: ScenarioAdjustments) => {
      const pDiff = adj.priceIncrease - 0;
      const eDiff = adj.employeeCount - employees.length;
      const mDiff = (adj.marketingBudget - business.baselineMarketing) / 1000;

      return (pDiff * pDiff * 1.0) + (eDiff * eDiff * 5.0) + (mDiff * mDiff * 1.5);
    };

    const getScore = (adj: ScenarioAdjustments) => {
      const out = runSimulation(baselineMetrics, adj);
      const val = targetType === 'profit' ? out.projectedProfit : out.projectedRevenue;
      const cost = getChangeCost(adj);

      if (val < targetValue) {
        // Penalize not meeting target. We want to maximize the metric value.
        // We subtract a very large penalty based on distance to target, plus a tiny penalty for cost so it doesn't drift.
        return -Math.pow(targetValue - val, 2) - (cost * 0.01);
      } else {
        // Once target is met, we want to maximize the negative change cost (i.e. minimize the change cost)
        return -cost;
      }
    };

    bestScore = getScore(currentAdjustments);

    // Run search
    for (let iter = 0; iter < maxIterations; iter++) {
      let improved = false;
      
      // Generate neighbors
      const stepP = 0.5; // price step
      const stepE = 1;   // employee count step
      const stepM = 500; // marketing budget step

      const pVals = [bestAdjustments.priceIncrease - stepP, bestAdjustments.priceIncrease, bestAdjustments.priceIncrease + stepP];
      const eVals = [bestAdjustments.employeeCount - stepE, bestAdjustments.employeeCount, bestAdjustments.employeeCount + stepE];
      const mVals = [bestAdjustments.marketingBudget - stepM, bestAdjustments.marketingBudget, bestAdjustments.marketingBudget + stepM];

      const neighbors: ScenarioAdjustments[] = [];
      for (const p of pVals) {
        for (const e of eVals) {
          for (const m of mVals) {
            // Bounds validation
            if (p < 0 || p > 50) continue;
            if (e < 1 || e > 50) continue;
            if (m < 0 || m > 100000) continue;

            neighbors.push({
              priceIncrease: parseFloat(p.toFixed(2)),
              employeeCount: Math.round(e),
              marketingBudget: Math.round(m),
              supplierDelay: 'none',
            });
          }
        }
      }

      // Evaluate neighbors
      for (const neighbor of neighbors) {
        const score = getScore(neighbor);
        if (score > bestScore) {
          bestScore = score;
          bestAdjustments = neighbor;
          improved = true;
        }
      }

      if (!improved) {
        // Converged
        break;
      }
    }

    // Run simulation for final selection
    const optimalOutput = runSimulation(baselineMetrics, bestAdjustments);

    // Construct recommendations list
    const actionPlan: string[] = [];
    
    const pDiff = bestAdjustments.priceIncrease;
    if (pDiff > 0) {
      actionPlan.push(`Raise menu prices baseline by ${pDiff.toFixed(1)}% to capture margin growth.`);
    }

    const eDiff = bestAdjustments.employeeCount - employees.length;
    if (eDiff > 0) {
      actionPlan.push(`Hire ${eDiff} additional staff member${eDiff > 1 ? 's' : ''} to scale service capacity.`);
    } else if (eDiff < 0) {
      actionPlan.push(`Reduce operational headcount by ${Math.abs(eDiff)} staff member${Math.abs(eDiff) > 1 ? 's' : ''} to save payroll expenses.`);
    }

    const mDiff = bestAdjustments.marketingBudget - business.baselineMarketing;
    if (mDiff > 0) {
      actionPlan.push(`Increase monthly marketing budget by $${mDiff.toLocaleString()} to accelerate customer traction.`);
    } else if (mDiff < 0) {
      actionPlan.push(`Trim monthly marketing budget by $${Math.abs(mDiff).toLocaleString()} to eliminate inefficient marketing spend.`);
    }

    if (actionPlan.length === 0) {
      actionPlan.push("No adjustments needed. The baseline setup currently satisfies your target.");
    }

    // Log optimization runs in DynamoDB / local mock storage
    const runId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `run-${Date.now()}`;
    try {
      await logOptimizationRun({
        runId,
        timestamp: new Date().toISOString(),
        targetMetric: `${targetType} - ${targetGrowthPct}% Growth`,
        exploredScenarios: maxIterations,
        recommendedChanges: actionPlan,
      });
    } catch (dbErr) {
      console.error('Failed logging optimization run:', dbErr);
    }

    return NextResponse.json({
      targetValue,
      baselineValue,
      targetGrowthPct,
      targetType,
      baselineMetrics: {
        revenue: baseOutput.projectedRevenue,
        profit: baseOutput.projectedProfit,
        headcount: baseOutput.projectedHeadcount,
        inventoryRisk: baseOutput.projectedInventoryRisk,
      },
      optimizedMetrics: {
        revenue: optimalOutput.projectedRevenue,
        profit: optimalOutput.projectedProfit,
        headcount: optimalOutput.projectedHeadcount,
        inventoryRisk: optimalOutput.projectedInventoryRisk,
      },
      adjustments: bestAdjustments,
      actionPlan,
    });
  } catch (error: any) {
    console.error('Error in scenario optimization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
