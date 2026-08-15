import assert from 'assert';
import { runSimulation, runSimulationWithConfidenceBand, getChangeCost, optimizeScenario, generateRuleBasedRecommendation, computeRoleSalaries } from '../lib/simulation-engine';
import { logOptimizationRun, cacheForecast } from '../lib/dynamodb';
import fs from 'fs';
import path from 'path';

// Color logging helpers
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`${green('✓')} ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`${red('✗')} ${name}`);
    console.error(err);
    failed++;
  }
}

async function main() {
  console.log('\n--- Running TwinOS Platform Tests ---\n');

  // 1. Simulation Engine Tests
  await test('Simulation Engine - Baseline calculations', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
    };
    
    const adjustments = {
      priceIncrease: 0,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
    };

    const output = runSimulation(baseline, adjustments);
    
    // Baseline Profit = 100000 - (10 * 4000) - 10000 - 15000 - 20000 = 15000 (excluding seasonal profiles)
    assert.ok(output.projectedRevenue > 0);
    assert.ok(output.projectedProfit !== undefined);
    assert.strictEqual(output.projectedHeadcount, 10);
  });

  await test('Simulation Engine - Pricing elasticity impact', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
    };
    
    // Raise price by 20%
    const outputHigherPrice = runSimulation(baseline, {
      priceIncrease: 20,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
    });

    const outputBase = runSimulation(baseline, {
      priceIncrease: 0,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
    });

    // With 20% price increase and 0.45 elasticity, demand multiplier is 1 - (20/100 * 0.45) = 0.91
    // Revenue multiplier is 1.2 * 0.91 = 1.092. So revenue should increase by 9.2%.
    assert.ok(outputHigherPrice.projectedRevenue > outputBase.projectedRevenue);
  });

  await test('Simulation Engine - Supplier delay inventory risk limits', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
    };

    const outputNone = runSimulation(baseline, {
      priceIncrease: 0,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
    });

    const outputSevere = runSimulation(baseline, {
      priceIncrease: 0,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'severe',
    });

    assert.ok(outputSevere.projectedInventoryRisk > outputNone.projectedInventoryRisk);
    assert.ok(outputSevere.projectedInventoryRisk <= 1.0);
    assert.ok(outputNone.projectedInventoryRisk >= 0.05);
  });

  await test('Simulation Engine - Seasonality toggles are dividing correctly', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
    };

    const output30d = runSimulation(baseline, {
      priceIncrease: 0,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
      horizon: '30d',
    });

    const output12m = runSimulation(baseline, {
      priceIncrease: 0,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
      horizon: '12m',
    });

    // Verify monthlyData lengths correspond to weekly (4) vs monthly (12)
    assert.strictEqual(output30d.monthlyData.length, 4);
    assert.strictEqual(output12m.monthlyData.length, 12);
  });

  await test('Simulation Engine - Industry elasticity profile affects demand response', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
    };

    const adjustments = {
      priceIncrease: 20,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
    };

    // No industry set: preserves the original universal 0.45 elasticity constant.
    const outputDefault = runSimulation(baseline, adjustments);

    // E-commerce (0.65 elasticity) is more price-sensitive than the default —
    // the same 20% price increase should yield lower revenue than the default.
    const outputEcommerce = runSimulation({ ...baseline, industry: 'E-commerce' }, adjustments);

    // Software / SaaS (0.20 elasticity) is less price-sensitive than the default —
    // the same 20% price increase should yield higher revenue than the default.
    const outputSaas = runSimulation({ ...baseline, industry: 'Software / SaaS' }, adjustments);

    assert.ok(outputEcommerce.projectedRevenue < outputDefault.projectedRevenue);
    assert.ok(outputSaas.projectedRevenue > outputDefault.projectedRevenue);

    // Unrecognized industry string falls back to the same default as no industry at all.
    const outputUnknown = runSimulation({ ...baseline, industry: 'Nonexistent Sector' }, adjustments);
    assert.strictEqual(outputUnknown.projectedRevenue, outputDefault.projectedRevenue);
  });

  await test('Simulation Engine - Confidence band brackets the point estimate', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
      industry: 'E-commerce',
    };

    const adjustments = {
      priceIncrease: 15,
      employeeCount: 10,
      marketingBudget: 15000,
      supplierDelay: 'none',
    };

    const band = runSimulationWithConfidenceBand(baseline, adjustments);

    // Low <= expected <= High for the headline figures.
    assert.ok(band.projectedRevenueLow <= band.expected.projectedRevenue);
    assert.ok(band.expected.projectedRevenue <= band.projectedRevenueHigh);
    assert.ok(band.projectedProfitLow <= band.expected.projectedProfit);
    assert.ok(band.expected.projectedProfit <= band.projectedProfitHigh);

    // Same per-period guarantee across the whole monthly series.
    for (let i = 0; i < band.expected.monthlyData.length; i++) {
      const expectedMonth = band.expected.monthlyData[i];
      const bandMonth = band.monthlyDataBand[i];
      assert.ok(bandMonth.projectedRevenueLow <= expectedMonth.projectedRevenue);
      assert.ok(expectedMonth.projectedRevenue <= bandMonth.projectedRevenueHigh);
    }

    // A wider uncertainty parameter should never produce a narrower band.
    const widerBand = runSimulationWithConfidenceBand(baseline, adjustments, 0.5);
    const defaultSpread = band.projectedRevenueHigh - band.projectedRevenueLow;
    const widerSpread = widerBand.projectedRevenueHigh - widerBand.projectedRevenueLow;
    assert.ok(widerSpread >= defaultSpread);
  });

  await test('Simulation Engine - Explicit elasticity override wins over industry default', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
      industry: 'Software / SaaS', // default price elasticity 0.20
    };

    const adjustments = {
      priceIncrease: 20,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
    };

    const withIndustryDefault = runSimulation(baseline, adjustments);
    // Override to a much higher elasticity (0.65, like E-commerce) — should
    // reduce projected revenue relative to the SaaS default despite the same industry.
    const withOverride = runSimulation({ ...baseline, priceElasticityOverride: 0.65 }, adjustments);

    assert.ok(withOverride.projectedRevenue < withIndustryDefault.projectedRevenue);
  });

  await test('Simulation Engine - Explain breakdown reconstructs the headline figures', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
    };

    const adjustments = {
      priceIncrease: 10,
      employeeCount: 12,
      marketingBudget: 12000,
      supplierDelay: 'none',
    };

    const output = runSimulation(baseline, adjustments);

    // explain carries the assumption chain used to derive every period's revenue.
    assert.strictEqual(output.explain.priceMultiplier, 1.1);
    assert.ok(output.explain.demandMultiplier > 0);

    // Each month's cost breakdown must actually sum to that month's projectedProfit.
    for (const month of output.monthlyData) {
      const reconstructedProfit =
        month.projectedRevenue -
        month.projectedPayroll -
        month.projectedMarketingCost -
        month.projectedInventoryCost -
        month.projectedFixedCosts;
      // Allow rounding slack since each component is independently rounded.
      assert.ok(Math.abs(reconstructedProfit - month.projectedProfit) <= 4);
    }
  });

  await test('Simulation Engine - computeRoleSalaries averages salary per role', () => {
    const employees = [
      { role: 'Barista', salary: 3000 },
      { role: 'Barista', salary: 4000 },
      { role: 'Manager', salary: 8000 },
    ];
    const averages = computeRoleSalaries(employees);
    assert.strictEqual(averages['Barista'], 3500);
    assert.strictEqual(averages['Manager'], 8000);
  });

  await test('Simulation Engine - role-targeted headcount costs payroll per-role, not blended', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000, // blended average across all employees
      roleSalaries: { Barista: 3000, Manager: 8000 },
    };

    // Same headcount (2), but roleTargets should cost this using the actual
    // per-role salaries (3000 + 8000 = 11000), not 2 x the blended average (8000).
    const withRoleTargets = runSimulation(baseline, {
      priceIncrease: 0,
      employeeCount: 2,
      marketingBudget: 10000,
      supplierDelay: 'none',
      roleTargets: [{ role: 'Barista', count: 1 }, { role: 'Manager', count: 1 }],
    });

    const withBlended = runSimulation(baseline, {
      priceIncrease: 0,
      employeeCount: 2,
      marketingBudget: 10000,
      supplierDelay: 'none',
    });

    assert.strictEqual(withRoleTargets.projectedHeadcount, 2);
    // Role-costed payroll (11000/mo) is higher than blended (2 x 4000 = 8000/mo),
    // so profit should be correspondingly lower.
    assert.ok(withRoleTargets.projectedProfit < withBlended.projectedProfit);
  });

  await test('Simulation Engine - unmapped role in roleTargets falls back to averageEmployeeSalary', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 5000,
      roleSalaries: { Barista: 3000 },
    };

    const output = runSimulation(baseline, {
      priceIncrease: 0,
      employeeCount: 1,
      marketingBudget: 10000,
      supplierDelay: 'none',
      roleTargets: [{ role: 'Unknown Role', count: 1 }],
    });

    // Payroll for the final period should equal exactly the fallback salary (5000).
    const finalMonth = output.monthlyData[output.monthlyData.length - 1];
    assert.strictEqual(finalMonth.projectedPayroll, 5000);
  });

  await test('Simulation Engine - product catalog absent behaves identically to before (regression guard)', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
    };
    const adjustments = { priceIncrease: 10, employeeCount: 10, marketingBudget: 10000, supplierDelay: 'none' };

    const withoutProductsKey = runSimulation(baseline, adjustments);
    const withEmptyProducts = runSimulation({ ...baseline, products: [] }, adjustments);

    assert.strictEqual(withoutProductsKey.projectedRevenue, withEmptyProducts.projectedRevenue);
    assert.strictEqual(withEmptyProducts.productInventory, undefined);
    assert.strictEqual(withEmptyProducts.monthlyData[0].productBreakdown, undefined);
  });

  await test('Simulation Engine - product catalog revenue sums per-product price x volume', () => {
    const baseline = {
      baselineRevenue: 999999, // should be ignored entirely when a product catalog is present
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
      products: [
        { id: 'p1', name: 'Espresso', price: 4.5, unitsSoldPerMonth: 1000 },
        { id: 'p2', name: 'Latte', price: 5.5, unitsSoldPerMonth: 800 },
      ],
    };
    const adjustments = { priceIncrease: 0, employeeCount: 10, marketingBudget: 10000, supplierDelay: 'none' };

    const output = runSimulation(baseline, adjustments);
    const finalMonth = output.monthlyData[output.monthlyData.length - 1];

    // At 0% price increase and 0 marketing delta, demand multiplier is 1, so
    // baseline revenue for the final month (seasonal factor 1.20 for Jun in
    // the default 6m curve) should equal exactly (4.5*1000 + 5.5*800) * 1.20.
    const expectedRevenue = Math.round((4.5 * 1000 + 5.5 * 800) * 1.20);
    assert.strictEqual(finalMonth.projectedRevenue, expectedRevenue);
    assert.ok(finalMonth.productBreakdown);
    assert.strictEqual(finalMonth.productBreakdown!.length, 2);
  });

  await test('Simulation Engine - per-product price override only affects that product, blanket rate applies to the rest', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
      products: [
        { id: 'p1', name: 'Espresso', price: 4.5, unitsSoldPerMonth: 1000 },
        { id: 'p2', name: 'Latte', price: 5.5, unitsSoldPerMonth: 800 },
      ],
    };
    const adjustments = {
      priceIncrease: 5, // blanket rate for products without an override
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
      productAdjustments: [{ productId: 'p1', priceIncrease: 20 }],
    };

    const output = runSimulation(baseline, adjustments);
    const finalMonth = output.monthlyData[output.monthlyData.length - 1];
    const espresso = finalMonth.productBreakdown!.find((p) => p.productId === 'p1')!;
    const latte = finalMonth.productBreakdown!.find((p) => p.productId === 'p2')!;

    assert.strictEqual(espresso.priceIncrease, 20);
    assert.strictEqual(latte.priceIncrease, 5); // falls back to the blanket rate
  });

  await test('Simulation Engine - per-product stockout risk flags products correctly, skips products with no inventory data', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
      products: [
        // Sells 300/month, only 20 units in stock, 14-day lead time -> will stock out before reorder arrives.
        { id: 'p1', name: 'Croissant', price: 4.0, unitsSoldPerMonth: 300, unitsInStock: 20, reorderPoint: 50, leadTimeDays: 14 },
        // Plenty of runway.
        { id: 'p2', name: 'Tote Bag', price: 15.0, unitsSoldPerMonth: 10, unitsInStock: 500, reorderPoint: 20, leadTimeDays: 14 },
        // No inventory data at all — should be excluded entirely.
        { id: 'p3', name: 'Consulting Hour', price: 100.0, unitsSoldPerMonth: 20 },
      ],
    };
    const adjustments = { priceIncrease: 0, employeeCount: 10, marketingBudget: 10000, supplierDelay: 'none' };

    const output = runSimulation(baseline, adjustments);

    assert.strictEqual(output.productInventory!.length, 2);
    const croissant = output.productInventory!.find((p) => p.productId === 'p1')!;
    const toteBag = output.productInventory!.find((p) => p.productId === 'p2')!;

    assert.strictEqual(croissant.atRisk, true);
    assert.strictEqual(croissant.belowReorderPoint, true); // 20 in stock <= 50 reorder point
    assert.strictEqual(toteBag.atRisk, false);
    assert.strictEqual(toteBag.belowReorderPoint, false);
    assert.strictEqual(output.productInventory!.some((p) => p.productId === 'p3'), false);
  });

  await test('Simulation Engine - a supplier delay lengthens the effective lead time, increasing stockout risk', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
      products: [
        { id: 'p1', name: 'Widget', price: 10, unitsSoldPerMonth: 300, unitsInStock: 160, reorderPoint: 50, leadTimeDays: 14 },
      ],
    };

    const noDelay = runSimulation(baseline, { priceIncrease: 0, employeeCount: 10, marketingBudget: 10000, supplierDelay: 'none' });
    const severeDelay = runSimulation(baseline, { priceIncrease: 0, employeeCount: 10, marketingBudget: 10000, supplierDelay: 'severe' });

    // Same stock and burn rate, but a severe delay lengthens the effective
    // lead time enough to flip a previously-safe product to at-risk.
    assert.strictEqual(noDelay.productInventory![0].atRisk, false);
    assert.strictEqual(severeDelay.productInventory![0].atRisk, true);
  });

  // 2. Hill Climbing & Optimization Engine Tests
  await test('Hill Climbing - Change cost calculation penalties', () => {
    const baseMarketing = 10000;
    const baseHeadcount = 10;

    // Case A: 5% price increase, 0 headcount change, 0 marketing change
    const costA = getChangeCost({
      priceIncrease: 5,
      employeeCount: 10,
      marketingBudget: 10000,
      supplierDelay: 'none',
    }, baseMarketing, baseHeadcount);
    // Cost = (5 * 5 * 1.0) + (0 * 0 * 5.0) + (0 * 0 * 1.5) = 25
    assert.strictEqual(costA, 25);

    // Case B: 0 price increase, 1 headcount increase, 0 marketing change
    const costB = getChangeCost({
      priceIncrease: 0,
      employeeCount: 11,
      marketingBudget: 10000,
      supplierDelay: 'none',
    }, baseMarketing, baseHeadcount);
    // Cost = (0 * 1.0) + (1 * 1 * 5.0) + (0 * 1.5) = 5
    assert.strictEqual(costB, 5);

    // Hiring/firing (weight 5.0) is more heavily penalized than price adjustments of similar magnitude.
    // Changing employee count by 3 (3 * 3 * 5 = 45) is heavier than 5% price increase (25).
    const costC = getChangeCost({
      priceIncrease: 0,
      employeeCount: 13,
      marketingBudget: 10000,
      supplierDelay: 'none',
    }, baseMarketing, baseHeadcount);
    assert.ok(costC > costA);
  });

  await test('Hill Climbing - Local search optimizer satisfies target', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
    };

    // Run optimizer with 15% revenue growth target
    const result = optimizeScenario(baseline, 'revenue', 15);

    // Ensure optimized revenue target is met
    assert.ok(result.optimalOutput.projectedRevenue >= result.targetValue);
    
    // Best adjustments should be within search limits
    assert.ok(result.bestAdjustments.priceIncrease >= 0 && result.bestAdjustments.priceIncrease <= 50);
    assert.ok(result.bestAdjustments.employeeCount >= 1 && result.bestAdjustments.employeeCount <= 50);
    assert.ok(result.bestAdjustments.marketingBudget >= 0 && result.bestAdjustments.marketingBudget <= 100000);
  });

  await test('Hill Climbing - Action-step narrative generation deltas', () => {
    const baseline = {
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
      baselineHeadcount: 10,
      averageEmployeeSalary: 4000,
    };

    // Target high profit growth forcing adjustments
    const result = optimizeScenario(baseline, 'profit', 30);

    assert.ok(result.actionPlan.length > 0);

    // Verify that recommendations describe actions corresponding to bestAdjustments
    const hasPriceAction = result.actionPlan.some(plan => plan.includes('prices'));
    const hasHireAction = result.actionPlan.some(plan => plan.includes('Hire'));
    const hasReduceAction = result.actionPlan.some(plan => plan.includes('Reduce') || plan.includes('headcount'));
    const hasMarketingAction = result.actionPlan.some(plan => plan.includes('marketing'));

    if (result.bestAdjustments.priceIncrease > 0) {
      assert.ok(hasPriceAction, 'Should recommend price action');
    }
    if (result.bestAdjustments.employeeCount > baseline.baselineHeadcount) {
      assert.ok(hasHireAction, 'Should recommend hiring action');
    } else if (result.bestAdjustments.employeeCount < baseline.baselineHeadcount) {
      assert.ok(hasReduceAction, 'Should recommend reduction action');
    }
    if (result.bestAdjustments.marketingBudget !== baseline.baselineMarketing) {
      assert.ok(hasMarketingAction, 'Should recommend marketing action');
    }
  });

  // 3. Database Mock Telemetry Sync Tests
  await test('Database Mock - Telemetry logging and cache sync checks', async () => {
    const runId = `test-run-${Date.now()}`;
    const mockLog = {
      runId,
      timestamp: new Date().toISOString(),
      targetMetric: 'profit - 20% Growth',
      exploredScenarios: 800,
      recommendedChanges: ['Test action plan step.'],
    };

    // Log to local file mock (since hasAwsCredentials will be false in test env)
    await logOptimizationRun(mockLog);

    const mockFilePath = path.join(process.cwd(), 'prisma/dynamodb_mock.json');
    assert.ok(fs.existsSync(mockFilePath), 'Mock DynamoDB JSON file should exist');

    const fileData = JSON.parse(fs.readFileSync(mockFilePath, 'utf-8'));
    assert.ok(Array.isArray(fileData.optimizationRuns));
    
    // Check that our logged run is in the list
    const found = fileData.optimizationRuns.find((r: any) => r.runId === runId);
    assert.ok(found, 'Logged optimization run should be found in mock db');
    assert.strictEqual(found.targetMetric, 'profit - 20% Growth');

    // Test caching forecast
    const cacheData = {
      businessId: 'test-biz',
      metricType: 'monthly-projections',
      forecastData: { profit: 5000 },
      generatedAt: new Date().toISOString(),
    };

    await cacheForecast(cacheData);

    const fileDataAfterCache = JSON.parse(fs.readFileSync(mockFilePath, 'utf-8'));
    assert.ok(Array.isArray(fileDataAfterCache.forecastCache));

    const foundCache = fileDataAfterCache.forecastCache.find(
      (c: any) => c.businessId === 'test-biz' && c.metricType === 'monthly-projections'
    );
    assert.ok(foundCache, 'Cached forecast should be found in mock db');
    assert.strictEqual(foundCache.forecastData.profit, 5000);
  });

  // 4. AI Recommendation Engine Tests
  await test('AI Recommendation - Fallback rule-based generation scenarios', () => {
    const business = {
      name: 'Coffee Cafe',
      industry: 'Food & Beverage',
      baselineRevenue: 100000,
      baselineMarketing: 10000,
      baselineInventory: 15000,
      baselineFixedCosts: 20000,
    };
    const baselinePayroll = 40000;
    const baselineHeadcount = 10;

    const scenario = {
      name: 'Price adjustment & Hiring',
      priceIncrease: 10,
      employeeCount: 11,
      marketingBudget: 12000,
      supplierDelay: 'none',
    };

    // Scenario A: Profitable and Net Positive
    const recResultPositive = generateRuleBasedRecommendation({
      business,
      baselineHeadcount,
      baselinePayroll,
      scenario,
      latestResult: {
        projectedRevenue: 110000,
        projectedProfit: 25000,
        projectedHeadcount: 11,
        projectedInventoryRisk: 0.1,
      },
    });

    assert.strictEqual(recResultPositive.headline, 'Proceed with Confidence');
    assert.ok(recResultPositive.summary.includes('shows strong potential'));
    assert.ok(recResultPositive.considerations.some(c => c.includes('Revenue is projected to grow')));
    assert.ok(recResultPositive.considerations.some(c => c.includes('Hiring timeline for 1 staff members')));

    // Scenario B: Deficit reduction (Profitable but remains in net loss)
    const recResultDeficitReduction = generateRuleBasedRecommendation({
      business: {
        ...business,
        baselineFixedCosts: 60000,
      },
      baselineHeadcount,
      baselinePayroll,
      scenario,
      latestResult: {
        projectedRevenue: 105000,
        projectedProfit: -5000,
        projectedHeadcount: 11,
        projectedInventoryRisk: 0.2,
      },
    });

    assert.strictEqual(recResultDeficitReduction.headline, 'Simulation Projects Net Loss');
    assert.ok(recResultDeficitReduction.summary.includes('reduces your operating deficit'));

    // Scenario C: Negative profit delta (worse than baseline)
    const recResultNegativeDelta = generateRuleBasedRecommendation({
      business,
      baselineHeadcount,
      baselinePayroll,
      scenario,
      latestResult: {
        projectedRevenue: 95000,
        projectedProfit: 5000,
        projectedHeadcount: 11,
        projectedInventoryRisk: 0.3,
      },
    });

    assert.ok(recResultNegativeDelta.summary.includes('projects a profit drop'));
    assert.strictEqual(recResultNegativeDelta.headline, 'Revise Staffing & Prices');
  });

  console.log(`\n--- Test Execution Summary: ${passed} passed, ${failed} failed ---\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Test runner crash:', err);
  process.exit(1);
});
