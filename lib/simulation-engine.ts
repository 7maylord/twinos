export interface BaselineMetrics {
  baselineRevenue: number;
  baselineMarketing: number;
  baselineInventory: number;
  baselineFixedCosts: number;
  baselineHeadcount: number;
  averageEmployeeSalary: number;
}

export interface ScenarioAdjustments {
  priceIncrease: number;     // 0 - 100%
  employeeCount: number;     // Target employee count
  marketingBudget: number;   // Monthly marketing budget
  supplierDelay: string;     // 'none' | 'minor' | 'moderate' | 'severe'
  horizon?: '30d' | '90d' | '6m' | '12m';
}

export interface MonthlyProjection {
  month: string;
  baselineRevenue: number;
  projectedRevenue: number;
  baselineProfit: number;
  projectedProfit: number;
}

export interface SimulationOutput {
  projectedRevenue: number;
  projectedProfit: number;
  projectedHeadcount: number;
  projectedInventoryRisk: number;
  monthlyData: MonthlyProjection[];
}

export function runSimulation(
  baseline: BaselineMetrics,
  adjustments: ScenarioAdjustments
): SimulationOutput {
  const {
    baselineRevenue,
    baselineMarketing,
    baselineInventory,
    baselineFixedCosts,
    baselineHeadcount,
    averageEmployeeSalary,
  } = baseline;

  const {
    priceIncrease,
    employeeCount,
    marketingBudget,
    supplierDelay,
  } = adjustments;

  // 1. Calculate multipliers
  // Price Multiplier: 1 + (priceIncrease / 100)
  const priceMultiplier = 1 + priceIncrease / 100;

  // Demand Elasticity: assume elasticity of 0.4 (demand drops by 4% for every 10% price increase)
  // But marketing budget increases demand! Let's say +10% marketing spend over baseline increases demand by 1%
  const marketingDeltaPercent = (marketingBudget - baselineMarketing) / (baselineMarketing || 1);
  const marketingDemandImpact = marketingDeltaPercent * 0.1; // 10% elasticity for marketing

  // Combined demand multiplier
  const priceDemandImpact = -(priceIncrease / 100) * 0.45;
  const demandMultiplier = Math.max(0.2, 1 + priceDemandImpact + marketingDemandImpact);

  // 2. Define seasonal factors and scale divisor based on forecast horizon selection
  const horizon = adjustments.horizon || '6m';
  let periods: string[] = [];
  let seasonalFactors: number[] = [];
  let divisor = 1.0;

  if (horizon === '30d') {
    periods = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
    seasonalFactors = [0.98, 0.99, 1.01, 1.02];
    divisor = 4.33; // Average weeks in a month
  } else if (horizon === '90d') {
    periods = ['Month 1', 'Month 2', 'Month 3'];
    seasonalFactors = [0.95, 0.90, 1.00];
    divisor = 1.0;
  } else if (horizon === '12m') {
    periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    seasonalFactors = [0.95, 0.90, 1.00, 1.10, 1.15, 1.20, 1.25, 1.30, 1.10, 1.05, 0.95, 1.00];
    divisor = 1.0;
  } else {
    // Default to '6m'
    periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    seasonalFactors = [0.95, 0.90, 1.00, 1.10, 1.15, 1.20];
    divisor = 1.0;
  }

  const monthlyData: MonthlyProjection[] = periods.map((month, index) => {
    const sFactor = seasonalFactors[index];

    // Baseline calculation for this period
    const monthBaselineRevenue = (baselineRevenue / divisor) * sFactor;
    const baselinePayroll = (baselineHeadcount * averageEmployeeSalary) / divisor;
    
    const monthBaselineProfit =
      monthBaselineRevenue -
      baselinePayroll -
      (baselineMarketing / divisor) -
      (baselineInventory / divisor) -
      (baselineFixedCosts / divisor);

    // Projected calculation for this period
    const monthProjectedRevenue = (baselineRevenue / divisor) * priceMultiplier * demandMultiplier * sFactor;
    const projectedPayroll = (employeeCount * averageEmployeeSalary) / divisor;
    
    // Inventory costs scale with demand
    const projectedInventoryCost = (baselineInventory / divisor) * demandMultiplier;

    const monthProjectedProfit =
      monthProjectedRevenue -
      projectedPayroll -
      (marketingBudget / divisor) -
      projectedInventoryCost -
      (baselineFixedCosts / divisor);

    return {
      month,
      baselineRevenue: Math.round(monthBaselineRevenue),
      projectedRevenue: Math.round(monthProjectedRevenue),
      baselineProfit: Math.round(monthBaselineProfit),
      projectedProfit: Math.round(monthProjectedProfit),
    };
  });

  // 3. Overall output values (using the final period as the basis, scaled to monthly equivalent if weekly)
  const finalMonth = monthlyData[monthlyData.length - 1];
  
  // Calculate inventory risk score (0 to 1)
  let delayFactor = 0;
  if (supplierDelay === 'minor') delayFactor = 0.15;
  else if (supplierDelay === 'moderate') delayFactor = 0.35;
  else if (supplierDelay === 'severe') delayFactor = 0.65;

  const inventoryRiskRaw = 0.5 * demandMultiplier * (1 + delayFactor);
  const projectedInventoryRisk = Math.min(1.0, Math.max(0.05, inventoryRiskRaw));

  return {
    projectedRevenue: divisor > 1 ? Math.round(finalMonth.projectedRevenue * divisor) : finalMonth.projectedRevenue,
    projectedProfit: divisor > 1 ? Math.round(finalMonth.projectedProfit * divisor) : finalMonth.projectedProfit,
    projectedHeadcount: employeeCount,
    projectedInventoryRisk: parseFloat(projectedInventoryRisk.toFixed(2)),
    monthlyData,
  };
}

export function getChangeCost(
  adj: ScenarioAdjustments,
  baselineMarketing: number,
  baselineHeadcount: number
): number {
  const pDiff = adj.priceIncrease - 0;
  const eDiff = adj.employeeCount - baselineHeadcount;
  const mDiff = (adj.marketingBudget - baselineMarketing) / 1000;

  return (pDiff * pDiff * 1.0) + (eDiff * eDiff * 5.0) + (mDiff * mDiff * 1.5);
}

export interface OptimizationResult {
  targetValue: number;
  baselineValue: number;
  bestAdjustments: ScenarioAdjustments;
  optimalOutput: SimulationOutput;
  actionPlan: string[];
}

export function optimizeScenario(
  baselineMetrics: BaselineMetrics,
  targetType: 'profit' | 'revenue',
  targetGrowthPct: number
): OptimizationResult {
  const baseOutput = runSimulation(baselineMetrics, {
    priceIncrease: 0,
    employeeCount: baselineMetrics.baselineHeadcount,
    marketingBudget: baselineMetrics.baselineMarketing,
    supplierDelay: 'none',
  });

  const baselineValue = targetType === 'profit' ? baseOutput.projectedProfit : baseOutput.projectedRevenue;
  
  // Calculate target value
  let targetValue = 0;
  if (baselineValue > 0) {
    targetValue = baselineValue * (1 + targetGrowthPct / 100);
  } else {
    // If profit is negative, calculate increase relative to baseline revenue to avoid negative math issues
    targetValue = baselineValue + (baselineMetrics.baselineRevenue * targetGrowthPct / 100);
  }

  // Hill climbing state
  let currentAdjustments: ScenarioAdjustments = {
    priceIncrease: 0,
    employeeCount: baselineMetrics.baselineHeadcount,
    marketingBudget: baselineMetrics.baselineMarketing,
    supplierDelay: 'none',
  };

  const maxIterations = 800;
  const getScore = (adj: ScenarioAdjustments) => {
    const out = runSimulation(baselineMetrics, adj);
    const val = targetType === 'profit' ? out.projectedProfit : out.projectedRevenue;
    const cost = getChangeCost(adj, baselineMetrics.baselineMarketing, baselineMetrics.baselineHeadcount);

    if (val < targetValue) {
      // Penalize not meeting target. We want to maximize the metric value.
      // We subtract a very large penalty based on distance to target, plus a tiny penalty for cost so it doesn't drift.
      return -Math.pow(targetValue - val, 2) - (cost * 0.01);
    } else {
      // Once target is met, we want to maximize the negative change cost (i.e. minimize the change cost)
      return -cost;
    }
  };

  let bestScore = getScore(currentAdjustments);
  let bestAdjustments = { ...currentAdjustments };

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

  const eDiff = bestAdjustments.employeeCount - baselineMetrics.baselineHeadcount;
  if (eDiff > 0) {
    actionPlan.push(`Hire ${eDiff} additional staff member${eDiff > 1 ? 's' : ''} to scale service capacity.`);
  } else if (eDiff < 0) {
    actionPlan.push(`Reduce operational headcount by ${Math.abs(eDiff)} staff member${Math.abs(eDiff) > 1 ? 's' : ''} to save payroll expenses.`);
  }

  const mDiff = bestAdjustments.marketingBudget - baselineMetrics.baselineMarketing;
  if (mDiff > 0) {
    actionPlan.push(`Increase monthly marketing budget by $${mDiff.toLocaleString()} to accelerate customer traction.`);
  } else if (mDiff < 0) {
    actionPlan.push(`Trim monthly marketing budget by $${Math.abs(mDiff).toLocaleString()} to eliminate inefficient marketing spend.`);
  }

  if (actionPlan.length === 0) {
    actionPlan.push("No adjustments needed. The baseline setup currently satisfies your target.");
  }

  return {
    targetValue,
    baselineValue,
    bestAdjustments,
    optimalOutput,
    actionPlan,
  };
}

export interface RecommendationInput {
  business: {
    name: string;
    industry: string | null;
    baselineRevenue: number;
    baselineMarketing: number;
    baselineInventory: number;
    baselineFixedCosts: number;
  };
  baselineHeadcount: number;
  baselinePayroll: number;
  scenario: {
    name: string;
    priceIncrease: number;
    employeeCount: number;
    marketingBudget: number;
    supplierDelay: string;
  };
  latestResult: {
    projectedRevenue: number;
    projectedProfit: number;
    projectedHeadcount: number;
    projectedInventoryRisk: number;
  };
}

export interface RecommendationResult {
  summary: string;
  headline: string;
  details: string;
  considerations: string[];
}

export function generateRuleBasedRecommendation(input: RecommendationInput): RecommendationResult {
  const { business, baselineHeadcount, baselinePayroll, scenario, latestResult } = input;

  const baselineExpenses = baselinePayroll + business.baselineMarketing + business.baselineInventory + business.baselineFixedCosts;
  const baselineProfit = business.baselineRevenue - baselineExpenses;

  const projectedRevenue = latestResult.projectedRevenue;
  const projectedProfit = latestResult.projectedProfit;
  const projectedHeadcount = latestResult.projectedHeadcount;
  const projectedInventoryRisk = latestResult.projectedInventoryRisk;

  const profitDelta = projectedProfit - baselineProfit;
  const revenueDelta = projectedRevenue - business.baselineRevenue;
  const payrollDelta = (projectedHeadcount - baselineHeadcount) * (baselineHeadcount > 0 ? (baselinePayroll / baselineHeadcount) : 4000);

  const isProfitable = projectedProfit > baselineProfit;
  const isNetPositive = projectedProfit > 0;
  
  let summaryText = '';
  let recommendationHeadline = '';
  let recommendationDetails = '';
  const keyConsiderations: string[] = [];

  // 1. Summary
  if (isProfitable && isNetPositive) {
    summaryText = `Based on the simulation results, "${scenario.name}" shows strong potential. The projected revenue increase of $${revenueDelta.toLocaleString()} would significantly improve profitability while maintaining acceptable margins.`;
  } else if (isProfitable) {
    summaryText = `This scenario reduces your operating deficit by $${profitDelta.toLocaleString()} compared to the baseline, but the business remains in a net monthly loss. Consider raising prices further or reducing overheads.`;
  } else {
    summaryText = `Caution: "${scenario.name}" projects a profit drop of $${Math.abs(profitDelta).toLocaleString()} compared to the baseline. Operating costs (such as payroll adjustments) have outpaced your price adjustment gains.`;
  }

  // 2. Headline & Details
  if (isNetPositive && isProfitable) {
    recommendationHeadline = 'Proceed with Confidence';
    recommendationDetails = `This strategy successfully moves the business to net profitability. The projected revenue of $${projectedRevenue.toLocaleString()} validates the price adjustment despite small demand drops.`;
  } else if (isNetPositive) {
    recommendationHeadline = 'Revise Staffing & Prices';
    recommendationDetails = `Operating profit remains positive but is lower than baseline. We recommend scaling back the headcount additions or increasing prices by another 3-5% to cover salaries.`;
  } else {
    recommendationHeadline = 'Simulation Projects Net Loss';
    recommendationDetails = `The business is projected to run a net monthly loss of $${Math.abs(projectedProfit).toLocaleString()}. We recommend postponing this rollout and revising your employee count adjustments.`;
  }

  // 3. Considerations
  if (revenueDelta > 0) {
    keyConsiderations.push('Revenue is projected to grow due to adjustments.');
  } else {
    keyConsiderations.push('Revenue contracts due to price elasticity.');
  }

  if (projectedHeadcount > baselineHeadcount) {
    keyConsiderations.push(`Hiring timeline for ${projectedHeadcount - baselineHeadcount} staff members is realistic.`);
  } else if (projectedHeadcount < baselineHeadcount) {
    keyConsiderations.push(`Workforce reduction of ${baselineHeadcount - projectedHeadcount} will reduce baseline payroll by $${Math.abs(payrollDelta).toLocaleString()}.`);
  } else {
    keyConsiderations.push('Hiring overhead is maintained at baseline level.');
  }

  if (scenario.supplierDelay === 'none') {
    keyConsiderations.push('Supply chain operates smoothly without delay risks.');
  } else {
    keyConsiderations.push(`Inventory delay (${scenario.supplierDelay}) raises stockout risk to ${(projectedInventoryRisk * 100).toFixed(0)}%.`);
  }

  return {
    summary: summaryText,
    headline: recommendationHeadline,
    details: recommendationDetails,
    considerations: keyConsiderations,
  };
}


