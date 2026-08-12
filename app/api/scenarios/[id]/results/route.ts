import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runSimulationWithConfidenceBand } from '@/lib/simulation-engine';

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
    const employeeCount = employees.length;
    const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
    const business = { ...businessRest, employeeCount, totalPayroll };

    // Confidence band: reruns the deterministic engine with the elasticity
    // assumption perturbed +/-25% to show a low/high range alongside the
    // point-estimate projection, rather than false precision on a single number.
    const averageEmployeeSalary = employeeCount > 0 ? totalPayroll / employeeCount : 4000;
    const confidenceBand = runSimulationWithConfidenceBand(
      {
        baselineRevenue: business.baselineRevenue,
        baselineMarketing: business.baselineMarketing,
        baselineInventory: business.baselineInventory,
        baselineFixedCosts: business.baselineFixedCosts,
        baselineHeadcount: employeeCount || 24,
        averageEmployeeSalary,
        industry: business.industry,
      },
      {
        priceIncrease: scenario.priceIncrease,
        employeeCount: scenario.employeeCount,
        marketingBudget: scenario.marketingBudget,
        supplierDelay: scenario.supplierDelay,
      }
    );

    const monthlyDataWithBand = monthlyData.map((month: any, i: number) => ({
      ...month,
      projectedRevenueLow: confidenceBand.monthlyDataBand[i]?.projectedRevenueLow,
      projectedRevenueHigh: confidenceBand.monthlyDataBand[i]?.projectedRevenueHigh,
      projectedProfitLow: confidenceBand.monthlyDataBand[i]?.projectedProfitLow,
      projectedProfitHigh: confidenceBand.monthlyDataBand[i]?.projectedProfitHigh,
    }));

    return NextResponse.json({
      scenario: { ...scenario, business },
      result: latestResult,
      monthlyData: monthlyDataWithBand,
      confidenceBand: {
        projectedRevenueLow: confidenceBand.projectedRevenueLow,
        projectedRevenueHigh: confidenceBand.projectedRevenueHigh,
        projectedProfitLow: confidenceBand.projectedProfitLow,
        projectedProfitHigh: confidenceBand.projectedProfitHigh,
      },
    });
  } catch (error: any) {
    console.error('Error fetching scenario results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
