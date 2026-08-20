import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runSimulationWithConfidenceBand, computeRoleSalaries, RoleTarget, ProductAdjustment, ProductBaseline } from '@/lib/simulation-engine';
import { projectCashFlow } from '@/lib/cashflow-engine';
import { getCalibratedElasticityForBusiness } from '@/lib/elasticity-calibration';

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
            // role is only used server-side to cost role-targeted headcount
            // scenarios (computeRoleSalaries below) — employees is destructured
            // out below and never reaches the response.
            employees: { select: { salary: true, role: true } },
            // cost is deliberately excluded (margin data) — products is
            // destructured out below and never reaches the response either;
            // only the derived productBreakdown/productInventory do.
            products: { select: { id: true, name: true, price: true, unitsSoldPerMonth: true, unitsInStock: true, reorderPoint: true, leadTimeDays: true } },
          },
        },
        simulationResults: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
        },
        productAdjustments: true,
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

    const { employees, products, ...businessRest } = scenario.business;
    const employeeCount = employees.length;
    const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
    const business = { ...businessRest, employeeCount, totalPayroll };

    const productsWithVolume: ProductBaseline[] = products
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

    // Confidence band: reruns the deterministic engine with the elasticity
    // assumption perturbed +/-25% to show a low/high range alongside the
    // point-estimate projection, rather than false precision on a single number.
    const averageEmployeeSalary = employeeCount > 0 ? totalPayroll / employeeCount : 4000;

    let storedRoleTargets: RoleTarget[] | undefined;
    if (scenario.roleTargetsJson) {
      try {
        storedRoleTargets = JSON.parse(scenario.roleTargetsJson);
      } catch {
        storedRoleTargets = undefined;
      }
    }

    const calibration = scenario.priceElasticityOverride == null
      ? await getCalibratedElasticityForBusiness(business.id, scenario.id)
      : null;

    const confidenceBand = runSimulationWithConfidenceBand(
      {
        baselineRevenue: business.baselineRevenue,
        baselineMarketing: business.baselineMarketing,
        baselineInventory: business.baselineInventory,
        baselineFixedCosts: business.baselineFixedCosts,
        baselineHeadcount: employeeCount || 24,
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

    // Merge in the low/high band and the freshly-computed cost breakdown
    // ("explain this number"). The headline baseline/projected figures stay
    // whatever was actually persisted when the scenario was run — only the
    // supplementary breakdown is recomputed live, since older stored results
    // predate these fields.
    const monthlyDataWithBand = monthlyData.map((month: any, i: number) => {
      const band = confidenceBand.monthlyDataBand[i];
      return {
        ...month,
        projectedRevenueLow: band?.projectedRevenueLow,
        projectedRevenueHigh: band?.projectedRevenueHigh,
        projectedProfitLow: band?.projectedProfitLow,
        projectedProfitHigh: band?.projectedProfitHigh,
        seasonalFactor: band?.seasonalFactor,
        projectedPayroll: band?.projectedPayroll,
        projectedMarketingCost: band?.projectedMarketingCost,
        projectedInventoryCost: band?.projectedInventoryCost,
        projectedFixedCosts: band?.projectedFixedCosts,
        productBreakdown: band?.productBreakdown,
      };
    });

    const cashFlow = projectCashFlow({ baselineRevenue: business.baselineRevenue }, monthlyData);

    return NextResponse.json({
      scenario: { ...scenario, business },
      result: latestResult,
      monthlyData: monthlyDataWithBand,
      productInventory: confidenceBand.expected.productInventory,
      confidenceBand: {
        projectedRevenueLow: confidenceBand.projectedRevenueLow,
        projectedRevenueHigh: confidenceBand.projectedRevenueHigh,
        projectedProfitLow: confidenceBand.projectedProfitLow,
        projectedProfitHigh: confidenceBand.projectedProfitHigh,
      },
      explain: confidenceBand.expected.explain,
      calibration: calibration ? { sampleSize: calibration.sampleSize } : null,
      cashFlow,
    });
  } catch (error: any) {
    console.error('Error fetching scenario results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
