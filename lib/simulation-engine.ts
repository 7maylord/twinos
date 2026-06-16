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

  // 2. Define seasonal factors for a 6-month projection
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const seasonalFactors = [0.95, 0.90, 1.00, 1.10, 1.15, 1.20];

  const monthlyData: MonthlyProjection[] = months.map((month, index) => {
    const sFactor = seasonalFactors[index];

    // Baseline calculation for this month
    const monthBaselineRevenue = baselineRevenue * sFactor;
    // Baseline payroll = headcount * avg salary
    const baselinePayroll = baselineHeadcount * averageEmployeeSalary;
    const monthBaselineProfit =
      monthBaselineRevenue -
      baselinePayroll -
      baselineMarketing -
      baselineInventory -
      baselineFixedCosts;

    // Projected calculation for this month
    const monthProjectedRevenue = baselineRevenue * priceMultiplier * demandMultiplier * sFactor;
    const projectedPayroll = employeeCount * averageEmployeeSalary;
    
    // Inventory costs scale with demand
    const projectedInventoryCost = baselineInventory * demandMultiplier;

    const monthProjectedProfit =
      monthProjectedRevenue -
      projectedPayroll -
      marketingBudget -
      projectedInventoryCost -
      baselineFixedCosts;

    return {
      month,
      baselineRevenue: Math.round(monthBaselineRevenue),
      projectedRevenue: Math.round(monthProjectedRevenue),
      baselineProfit: Math.round(monthBaselineProfit),
      projectedProfit: Math.round(monthProjectedProfit),
    };
  });

  // 3. Overall output values (using the final month, Month 6, as the headline projected values)
  const finalMonth = monthlyData[monthlyData.length - 1];
  
  // Calculate inventory risk score (0 to 1)
  // Higher demand + supplier delay = higher risk of stockout
  let delayFactor = 0;
  if (supplierDelay === 'minor') delayFactor = 0.15;
  else if (supplierDelay === 'moderate') delayFactor = 0.35;
  else if (supplierDelay === 'severe') delayFactor = 0.65;

  // Inventory risk scales up with demand and supplier delay, scales down if we spend more on inventory
  // Let's assume inventory stock scales with inventory budget. In the simulation, projected inventory cost scales with demandMultiplier.
  // So base risk is 0.5. Delay adds to it.
  const inventoryRiskRaw = 0.5 * demandMultiplier * (1 + delayFactor);
  const projectedInventoryRisk = Math.min(1.0, Math.max(0.05, inventoryRiskRaw));

  return {
    projectedRevenue: finalMonth.projectedRevenue,
    projectedProfit: finalMonth.projectedProfit,
    projectedHeadcount: employeeCount,
    projectedInventoryRisk: parseFloat(projectedInventoryRisk.toFixed(2)),
    monthlyData,
  };
}
