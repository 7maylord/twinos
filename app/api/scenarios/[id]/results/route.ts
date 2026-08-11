import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const scenario = await prisma.scenario.findUnique({
      where: { id },
      include: {
        // This endpoint backs the public share link, so it must only ever surface
        // aggregate forecast numbers — never raw employee names/salaries or product
        // cost/pricing data.
        business: {
          select: {
            id: true,
            name: true,
            industry: true,
            baselineRevenue: true,
            baselineMarketing: true,
            baselineInventory: true,
            baselineFixedCosts: true,
            employees: { select: { salary: true } },
          },
        },
        simulationResults: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const latestResult = scenario.simulationResults[0];
    if (!latestResult) {
      return NextResponse.json({ error: 'No simulation results found for this scenario' }, { status: 404 });
    }

    // Parse monthly projections
    let monthlyData = [];
    try {
      monthlyData = JSON.parse(latestResult.monthlyDataJson);
    } catch (e) {
      console.error('Failed to parse monthly data json:', e);
    }

    const { employees, ...businessRest } = scenario.business;
    const business = {
      ...businessRest,
      employeeCount: employees.length,
      totalPayroll: employees.reduce((sum, e) => sum + e.salary, 0),
    };

    return NextResponse.json({
      scenario: { ...scenario, business },
      result: latestResult,
      monthlyData,
    });
  } catch (error: any) {
    console.error('Error fetching scenario results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
