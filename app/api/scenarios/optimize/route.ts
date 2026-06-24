import { NextResponse } from 'next/server';
import { getActiveBusiness } from '@/lib/auth-helpers';
import { runSimulation, BaselineMetrics, ScenarioAdjustments, optimizeScenario } from '@/lib/simulation-engine';
import { logOptimizationRun } from '@/lib/dynamodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetType, targetGrowthPct } = body; // targetType: 'profit' | 'revenue', targetGrowthPct: number (e.g. 20)

    if (!targetType || targetGrowthPct === undefined) {
      return NextResponse.json({ error: 'targetType and targetGrowthPct are required' }, { status: 400 });
    }

    const business = await getActiveBusiness();

    if (!business) {
      return NextResponse.json({ error: 'No active business found. Onboarding required.' }, { status: 404 });
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

    const {
      targetValue,
      baselineValue,
      bestAdjustments,
      optimalOutput,
      actionPlan,
    } = optimizeScenario(baselineMetrics, targetType, targetGrowthPct);

    // Limit maximum iterations in response log (for backwards compatibility/telemetry log)
    const maxIterations = 800;

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
