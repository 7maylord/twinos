import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness, verifyBusinessOwnership } from '@/lib/auth-helpers';
import { runSimulation } from '@/lib/simulation-engine';
import { cacheForecast } from '@/lib/dynamodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { scenarioId, name, priceIncrease, employeeCount, marketingBudget, supplierDelay, businessId, priceElasticityOverride, marketingElasticityOverride } = body;

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
        include: { business: { include: { employees: true } } },
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
          status: 'PENDING',
        },
        include: { business: { include: { employees: true } } },
      });
      scenarioId = scenario.id;
    }

    const business = scenario.business;
    const employees = business.employees;
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const averageEmployeeSalary = employees.length > 0 ? (totalSalary / employees.length) : 4000.0;

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
        priceElasticityOverride: scenario.priceElasticityOverride,
        marketingElasticityOverride: scenario.marketingElasticityOverride,
      },
      {
        priceIncrease: scenario.priceIncrease,
        employeeCount: scenario.employeeCount,
        marketingBudget: scenario.marketingBudget,
        supplierDelay: scenario.supplierDelay,
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
