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
