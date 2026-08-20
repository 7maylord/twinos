import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness, verifyBusinessOwnership } from '@/lib/auth-helpers';
import { runSimulation, computeRoleSalaries, RoleTarget, ProductAdjustment, ProductBaseline } from '@/lib/simulation-engine';
import { cacheForecast } from '@/lib/dynamodb';
import { getCalibratedElasticityForBusiness } from '@/lib/elasticity-calibration';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { scenarioId, name, priceIncrease, employeeCount, marketingBudget, supplierDelay, businessId, priceElasticityOverride, marketingElasticityOverride, roleTargets, productAdjustments } = body;

    // Sanitize role targets: drop malformed entries rather than reject the
    // whole request, and cap the list length as a defensive bound.
    const sanitizedRoleTargets: RoleTarget[] | undefined = Array.isArray(roleTargets)
      ? roleTargets
          .filter((rt: any) => typeof rt?.role === 'string' && rt.role.trim() && Number.isFinite(Number(rt.count)) && Number(rt.count) >= 0)
          .slice(0, 20)
          .map((rt: any) => ({ role: rt.role.trim(), count: Math.round(Number(rt.count)) }))
      : undefined;
    const roleTargetsJson = sanitizedRoleTargets && sanitizedRoleTargets.length > 0 ? JSON.stringify(sanitizedRoleTargets) : undefined;

    // Sanitize product adjustments the same way — drop malformed entries,
    // cap the list length. Ownership of each productId is verified below by
    // scoping the create to products actually belonging to the target business.
    const sanitizedProductAdjustments: ProductAdjustment[] = Array.isArray(productAdjustments)
      ? productAdjustments
          .filter((pa: any) => typeof pa?.productId === 'string' && pa.productId.trim() && Number.isFinite(Number(pa.priceIncrease)))
          .slice(0, 50)
          .map((pa: any) => ({ productId: pa.productId.trim(), priceIncrease: Math.min(50, Math.max(0, Number(pa.priceIncrease))) }))
      : [];

    // Elasticity coefficients are conceptually 0 (fully inelastic) to ~2 (highly
    // elastic); clamp so a bad/adversarial input can't push economically
    // nonsensical values (e.g. negative elasticity) into the engine.
    const clampElasticity = (value: unknown): number | undefined => {
      if (value === undefined || value === null || value === '') return undefined;
      const num = Number(value);
      if (Number.isNaN(num)) return undefined;
      return Math.min(2, Math.max(0, num));
    };
    priceElasticityOverride = clampElasticity(priceElasticityOverride);
    marketingElasticityOverride = clampElasticity(marketingElasticityOverride);

    let scenario;
    if (scenarioId) {
      scenario = await prisma.scenario.findUnique({
        where: { id: scenarioId },
        include: {
          business: { include: { employees: true, products: true } },
          productAdjustments: true,
        },
      });
      if (!scenario || !(await verifyBusinessOwnership(scenario.businessId))) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
      }
    } else {
      if (!name) {
        return NextResponse.json({ error: 'Scenario name is required' }, { status: 400 });
      }
      let targetBusinessId = businessId;
      if (targetBusinessId) {
        if (!(await verifyBusinessOwnership(targetBusinessId))) {
          return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }
      } else {
        const activeBusiness = await getActiveBusiness();
        if (!activeBusiness) {
          return NextResponse.json({ error: 'No active business found.' }, { status: 400 });
        }
        targetBusinessId = activeBusiness.id;
      }

      // Only keep adjustments for products that actually belong to this
      // business — a stray/foreign productId would just never match anything
      // in the engine's own product loop, but there's no reason to persist it.
      const ownedProducts = await prisma.product.findMany({
        where: { businessId: targetBusinessId },
        select: { id: true },
      });
      const ownedProductIds = new Set(ownedProducts.map((p) => p.id));
      const validProductAdjustments = sanitizedProductAdjustments.filter((pa) => ownedProductIds.has(pa.productId));

      scenario = await prisma.scenario.create({
        data: {
          businessId: targetBusinessId,
          name,
          priceIncrease: Number(priceIncrease || 0),
          employeeCount: Number(employeeCount || 10),
          marketingBudget: Number(marketingBudget || 0),
          supplierDelay: supplierDelay || 'none',
          priceElasticityOverride,
          marketingElasticityOverride,
          roleTargetsJson,
          status: 'PENDING',
          productAdjustments: {
            create: validProductAdjustments.map((pa) => ({ productId: pa.productId, priceIncrease: pa.priceIncrease })),
          },
        },
        include: {
          business: { include: { employees: true, products: true } },
          productAdjustments: true,
        },
      });
      scenarioId = scenario.id;
    }

    const business = scenario.business;
    const employees = business.employees;
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const averageEmployeeSalary = employees.length > 0 ? (totalSalary / employees.length) : 4000.0;

    let storedRoleTargets: RoleTarget[] | undefined;
    if (scenario.roleTargetsJson) {
      try {
        storedRoleTargets = JSON.parse(scenario.roleTargetsJson);
      } catch {
        storedRoleTargets = undefined;
      }
    }

    // Only products with real sales volume participate in per-product revenue.
    const productsWithVolume: ProductBaseline[] = business.products
      .filter((p) => p.unitsSoldPerMonth != null)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        unitsSoldPerMonth: p.unitsSoldPerMonth!,
        unitsInStock: p.unitsInStock,
        reorderPoint: p.reorderPoint,
        leadTimeDays: p.leadTimeDays,
      }));
    const storedProductAdjustments: ProductAdjustment[] = scenario.productAdjustments.map((pa) => ({
      productId: pa.productId,
      priceIncrease: pa.priceIncrease,
    }));

    // User-set override always wins; otherwise, if this business has enough
    // of its own price-change-vs-actual-outcome history, calibrate from that
    // instead of falling straight to the static industry default.
    const calibration = scenario.priceElasticityOverride == null
      ? await getCalibratedElasticityForBusiness(business.id, scenario.id)
      : null;

    // Run the simulation calculations
    const simulationOutput = runSimulation(
      {
        baselineRevenue: business.baselineRevenue,
        baselineMarketing: business.baselineMarketing,
        baselineInventory: business.baselineInventory,
        baselineFixedCosts: business.baselineFixedCosts,
        baselineHeadcount: employees.length || 24,
        averageEmployeeSalary,
        industry: business.industry,
        priceElasticityOverride: scenario.priceElasticityOverride ?? calibration?.priceElasticityCoefficient,
        marketingElasticityOverride: scenario.marketingElasticityOverride,
        roleSalaries: computeRoleSalaries(employees),
        products: productsWithVolume,
      },
      {
        priceIncrease: scenario.priceIncrease,
        employeeCount: scenario.employeeCount,
        marketingBudget: scenario.marketingBudget,
        supplierDelay: scenario.supplierDelay,
        roleTargets: storedRoleTargets,
        productAdjustments: storedProductAdjustments,
      }
    );

    // Save simulation result in DB
    const resultRecord = await prisma.simulationResult.create({
      data: {
        scenarioId: scenario.id,
        projectedRevenue: simulationOutput.projectedRevenue,
        projectedProfit: simulationOutput.projectedProfit,
        projectedHeadcount: simulationOutput.projectedHeadcount,
        projectedInventoryRisk: simulationOutput.projectedInventoryRisk,
        monthlyDataJson: JSON.stringify(simulationOutput.monthlyData),
      },
    });

    // Mark scenario as completed
    await prisma.scenario.update({
      where: { id: scenario.id },
      data: { status: 'COMPLETED' },
    });

    // Cache forecast results in DynamoDB / local mock storage
    try {
      await cacheForecast({
        businessId: business.id,
        metricType: `scenario-run-${scenario.id}`,
        forecastData: {
          projectedRevenue: simulationOutput.projectedRevenue,
          projectedProfit: simulationOutput.projectedProfit,
          projectedHeadcount: simulationOutput.projectedHeadcount,
          projectedInventoryRisk: simulationOutput.projectedInventoryRisk,
          monthlyData: simulationOutput.monthlyData,
        },
        generatedAt: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.error('Failed caching forecast output:', dbErr);
    }

    return NextResponse.json({
      scenario,
      result: resultRecord,
      monthlyData: simulationOutput.monthlyData,
    });
  } catch (error: any) {
    console.error('Error running simulation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
