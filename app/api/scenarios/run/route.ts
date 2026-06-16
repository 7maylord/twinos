import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runSimulation } from '@/lib/simulation-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { scenarioId, name, priceIncrease, employeeCount, marketingBudget, supplierDelay, businessId } = body;

    let scenario;
    if (scenarioId) {
      scenario = await prisma.scenario.findUnique({
        where: { id: scenarioId },
        include: { business: { include: { employees: true } } },
      });
      if (!scenario) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
      }
    } else {
      if (!name) {
        return NextResponse.json({ error: 'Scenario name is required' }, { status: 400 });
      }
      let targetBusinessId = businessId;
      if (!targetBusinessId) {
        const defaultBusiness = await prisma.business.findFirst();
        if (!defaultBusiness) {
          return NextResponse.json({ error: 'No business found in database.' }, { status: 400 });
        }
        targetBusinessId = defaultBusiness.id;
      }
      scenario = await prisma.scenario.create({
        data: {
          businessId: targetBusinessId,
          name,
          priceIncrease: Number(priceIncrease || 0),
          employeeCount: Number(employeeCount || 10),
          marketingBudget: Number(marketingBudget || 0),
          supplierDelay: supplierDelay || 'none',
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
