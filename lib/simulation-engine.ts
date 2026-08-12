import { getIndustryProfile } from './industry-profiles';

export interface BaselineMetrics {
  baselineRevenue: number;
  baselineMarketing: number;
  baselineInventory: number;
  baselineFixedCosts: number;
  baselineHeadcount: number;
  averageEmployeeSalary: number;
  industry?: string | null;
  // Explicit elasticity overrides take precedence over the industry-derived
  // defaults. Used both for user-editable assumptions and internally by
  // runSimulationWithConfidenceBand() to perturb the assumption.
  priceElasticityOverride?: number | null;
  marketingElasticityOverride?: number | null;
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
    industry,
    priceElasticityOverride,
    marketingElasticityOverride,
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

  // Demand elasticity varies by industry (see lib/industry-profiles.ts); falls
  // back to the universal 0.45 / 0.1 constants when industry is unset/unknown.
  // An explicit override (user-edited assumption, or a confidence-band probe)
  // always wins over the industry default.
  const industryProfile = getIndustryProfile(industry);
  const priceElasticityCoefficient = priceElasticityOverride ?? industryProfile.priceElasticityCoefficient;
  const marketingElasticityCoefficient = marketingElasticityOverride ?? industryProfile.marketingElasticityCoefficient;

  // But marketing budget increases demand! Let's say +10% marketing spend over baseline increases demand by 1%
  const marketingDeltaPercent = (marketingBudget - baselineMarketing) / (baselineMarketing || 1);
  const marketingDemandImpact = marketingDeltaPercent * marketingElasticityCoefficient;

  // Combined demand multiplier
  const priceDemandImpact = -(priceIncrease / 100) * priceElasticityCoefficient;
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

export interface MonthlyProjectionBand extends MonthlyProjection {
  projectedRevenueLow: number;
  projectedRevenueHigh: number;
  projectedProfitLow: number;
  projectedProfitHigh: number;
}

export interface ConfidenceBandOutput {
  expected: SimulationOutput;
  monthlyDataBand: MonthlyProjectionBand[];
  projectedRevenueLow: number;
  projectedRevenueHigh: number;
  projectedProfitLow: number;
  projectedProfitHigh: number;
}

// Runs the simulation three times: once at the nominal elasticity assumption,
// and twice more with the price/marketing elasticity coefficients perturbed by
// +/- `uncertainty` in opposite directions. Per period (and for the headline
// figures), the two perturbed runs are compared and the lower/higher revenue
// and profit values are reported as the band — rather than assuming a fixed
// "pessimistic" direction, since whether higher or lower elasticity is worse
// depends on the sign of the scenario's price/marketing deltas.
export function runSimulationWithConfidenceBand(
  baseline: BaselineMetrics,
  adjustments: ScenarioAdjustments,
  uncertainty: number = 0.25
): ConfidenceBandOutput {
  const expected = runSimulation(baseline, adjustments);

  const industryProfile = getIndustryProfile(baseline.industry);
  const basePriceElasticity = baseline.priceElasticityOverride ?? industryProfile.priceElasticityCoefficient;
  const baseMarketingElasticity = baseline.marketingElasticityOverride ?? industryProfile.marketingElasticityCoefficient;

  const variantA = runSimulation(
    {
      ...baseline,
      priceElasticityOverride: basePriceElasticity * (1 + uncertainty),
      marketingElasticityOverride: baseMarketingElasticity * (1 - uncertainty),
    },
    adjustments
  );
  const variantB = runSimulation(
    {
      ...baseline,
      priceElasticityOverride: basePriceElasticity * (1 - uncertainty),
      marketingElasticityOverride: baseMarketingElasticity * (1 + uncertainty),
    },
    adjustments
  );

  const monthlyDataBand: MonthlyProjectionBand[] = expected.monthlyData.map((month, i) => {
    const a = variantA.monthlyData[i];
    const b = variantB.monthlyData[i];
    return {
      ...month,
      projectedRevenueLow: Math.min(a.projectedRevenue, b.projectedRevenue),
      projectedRevenueHigh: Math.max(a.projectedRevenue, b.projectedRevenue),
      projectedProfitLow: Math.min(a.projectedProfit, b.projectedProfit),
      projectedProfitHigh: Math.max(a.projectedProfit, b.projectedProfit),
    };
  });

  return {
    expected,
    monthlyDataBand,
    projectedRevenueLow: Math.min(variantA.projectedRevenue, variantB.projectedRevenue),
    projectedRevenueHigh: Math.max(variantA.projectedRevenue, variantB.projectedRevenue),
    projectedProfitLow: Math.min(variantA.projectedProfit, variantB.projectedProfit),
    projectedProfitHigh: Math.max(variantA.projectedProfit, variantB.projectedProfit),
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
  const {
    baselineRevenue,
    baselineMarketing,
    baselineHeadcount,
    averageEmployeeSalary,
  } = baselineMetrics;

  const baseOutput = runSimulation(baselineMetrics, {
    priceIncrease: 0,
    employeeCount: baselineHeadcount,
    marketingBudget: baselineMarketing,
    supplierDelay: 'none',
  });

  // Use the average across all projected months for a more accurate baseline,
  // rather than the final (peak-season) month alone.
  const avgBaselineRevenue = baseOutput.monthlyData.reduce((s, m) => s + m.baselineRevenue, 0) / baseOutput.monthlyData.length;
  const avgBaselineProfit  = baseOutput.monthlyData.reduce((s, m) => s + m.baselineProfit,  0) / baseOutput.monthlyData.length;
  const baselineValue = targetType === 'profit' ? avgBaselineProfit : avgBaselineRevenue;

  // Target: if baseline is negative (e.g. a loss-making business), grow relative to revenue
  // to avoid negative-times-negative yielding a smaller target.
  let targetValue: number;
  if (baselineValue > 0) {
    targetValue = baselineValue * (1 + targetGrowthPct / 100);
  } else {
    targetValue = baselineValue + (baselineRevenue * targetGrowthPct / 100);
  }

  // Constraints — prevent the optimizer from recommending destructive extremes.
  // Headcount floor: never drop below 60% of baseline (service quality floor).
  const minHeadcount = Math.max(1, Math.ceil(baselineHeadcount * 0.6));
  // Marketing ceiling: marketing > 25% of revenue has diminishing / negative ROI for most businesses.
  const marketingCeilingRatio = 0.25;

  const getScore = (adj: ScenarioAdjustments): number => {
    const out = runSimulation(baselineMetrics, adj);

    // Score against the average across all periods, consistent with baselineValue.
    const avgVal = targetType === 'profit'
      ? out.monthlyData.reduce((s, m) => s + m.projectedProfit,  0) / out.monthlyData.length
      : out.monthlyData.reduce((s, m) => s + m.projectedRevenue, 0) / out.monthlyData.length;

    const cost = getChangeCost(adj, baselineMarketing, baselineHeadcount);

    // Hard-penalise violations of the business constraints.
    const headcountPenalty = adj.employeeCount < minHeadcount ? 1e12 : 0;
    const marketingCeiling = marketingCeilingRatio * (out.projectedRevenue || baselineRevenue);
    const marketingPenalty  = adj.marketingBudget > marketingCeiling ? Math.pow(adj.marketingBudget - marketingCeiling, 2) * 0.01 : 0;

    if (avgVal < targetValue) {
      return -Math.pow(targetValue - avgVal, 2) - (cost * 0.01) - headcountPenalty - marketingPenalty;
    } else {
      return -cost - headcountPenalty - marketingPenalty;
    }
  };

  let bestScore = getScore({
    priceIncrease: 0,
    employeeCount: baselineHeadcount,
    marketingBudget: baselineMarketing,
    supplierDelay: 'none',
  });
  let bestAdjustments: ScenarioAdjustments = {
    priceIncrease: 0,
    employeeCount: baselineHeadcount,
    marketingBudget: baselineMarketing,
    supplierDelay: 'none',
  };

  const maxIterations = 800;
  const stepP = 0.5;
  const stepE = 1;
  const stepM = 500;

  for (let iter = 0; iter < maxIterations; iter++) {
    let improved = false;

    const pVals = [bestAdjustments.priceIncrease - stepP, bestAdjustments.priceIncrease, bestAdjustments.priceIncrease + stepP];
    const eVals = [bestAdjustments.employeeCount - stepE, bestAdjustments.employeeCount, bestAdjustments.employeeCount + stepE];
    const mVals = [bestAdjustments.marketingBudget - stepM, bestAdjustments.marketingBudget, bestAdjustments.marketingBudget + stepM];

    for (const p of pVals) {
      for (const e of eVals) {
        for (const m of mVals) {
          if (p < 0 || p > 50) continue;
          if (e < 1 || e > 50) continue;
          if (m < 0 || m > 100000) continue;

          const candidate: ScenarioAdjustments = {
            priceIncrease: parseFloat(p.toFixed(2)),
            employeeCount: Math.round(e),
            marketingBudget: Math.round(m),
            supplierDelay: 'none',
          };
          const score = getScore(candidate);
          if (score > bestScore) {
            bestScore = score;
            bestAdjustments = candidate;
            improved = true;
          }
        }
      }
    }

    if (!improved) break;
  }

  const optimalOutput = runSimulation(baselineMetrics, bestAdjustments);

  // --- Contextual action plan ---
  // Compute the deltas and their financial impact so each recommendation explains WHY.
  const actionPlan: string[] = [];

  const pDiff = bestAdjustments.priceIncrease;
  const eDiff = bestAdjustments.employeeCount - baselineHeadcount;
  const mDiff = bestAdjustments.marketingBudget - baselineMarketing;

  // Price change
  if (pDiff >= 0.5) {
    const revenueUplift = optimalOutput.projectedRevenue - baseOutput.projectedRevenue;
    const riskNote = pDiff > 15
      ? ` Price increases above 15% typically trigger meaningful churn — validate with a short pilot before full rollout.`
      : '';
    actionPlan.push(
      `Raise prices by ${pDiff.toFixed(1)}% — the elasticity model projects this adds ~$${Math.round(revenueUplift / 1000)}K revenue in the final period despite the small demand dip.${riskNote}`
    );
  }

  // Headcount change — only surface for profit targets or if the optimizer made a meaningful move.
  const headcountChanged = Math.abs(eDiff) >= 1;
  if (headcountChanged && (targetType === 'profit' || Math.abs(eDiff) >= 2)) {
    const payrollImpact = Math.abs(eDiff) * averageEmployeeSalary;
    if (eDiff < 0) {
      const floorNote = bestAdjustments.employeeCount <= Math.ceil(minHeadcount * 1.1)
        ? ` This is near the operational floor — consider natural attrition before active cuts.`
        : '';
      actionPlan.push(
        `Reduce headcount by ${Math.abs(eDiff)} — saves ~$${Math.round(payrollImpact / 1000)}K/mo in payroll.${floorNote}`
      );
    } else {
      actionPlan.push(
        `Hire ${eDiff} additional staff — adds ~$${Math.round(payrollImpact / 1000)}K/mo in payroll cost, justified by the projected revenue growth.`
      );
    }
  }

  // Marketing change — show ROI, not just direction.
  if (Math.abs(mDiff) >= 500) {
    const currentMarketingRatio = (bestAdjustments.marketingBudget / (optimalOutput.projectedRevenue || baselineRevenue)) * 100;
    if (mDiff > 0) {
      if (currentMarketingRatio > 20) {
        actionPlan.push(
          `Reallocate your $${bestAdjustments.marketingBudget.toLocaleString()} marketing budget toward higher-ROI channels — at ${currentMarketingRatio.toFixed(0)}% of projected revenue, further raw spend increases yield diminishing returns.`
        );
      } else {
        actionPlan.push(
          `Increase marketing spend by $${mDiff.toLocaleString()}/mo (to $${bestAdjustments.marketingBudget.toLocaleString()} total, ${currentMarketingRatio.toFixed(0)}% of projected revenue) — modelled to drive incremental demand beyond price alone.`
        );
      }
    } else {
      actionPlan.push(
        `Cut marketing spend by $${Math.abs(mDiff).toLocaleString()}/mo — the current budget's demand return is too low to justify the cost for this target.`
      );
    }
  }

  if (actionPlan.length === 0) {
    actionPlan.push('No adjustments required — your current baseline already satisfies this target.');
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


