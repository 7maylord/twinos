import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch counts
    const activeBusinessesCount = await prisma.business.count();
    const monthlySimulationsCount = await prisma.scenario.count();

    // 2. Fetch businesses with their relations
    const businessesRaw = await prisma.business.findMany({
      include: {
        employees: true,
        products: true,
        scenarios: true,
      },
    });

    const businesses = businessesRaw.map((biz) => ({
      id: biz.id,
      name: biz.name,
      simulations: biz.scenarios.length,
      users: biz.employees.length,
      status: biz.scenarios.length > 0 ? 'Active' : 'Inactive',
    }));

    // 3. Fetch the most recent 10 scenarios with their simulation results and business context
    const scenariosRaw = await prisma.scenario.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        business: {
          include: {
            employees: true,
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

    // 4. Map recent simulations to metrics format for RevenueMetricsTable
    const recentSimulations = scenariosRaw.map((scen) => {
      const biz = scen.business;
      const totalSalary = biz.employees.reduce((sum, emp) => sum + emp.salary, 0);
      
      const baselineProfit = biz.baselineRevenue - totalSalary - biz.baselineMarketing - biz.baselineInventory - biz.baselineFixedCosts;
      
      const latestResult = scen.simulationResults[0];
      const projectedProfit = latestResult ? latestResult.projectedProfit : baselineProfit;
      const profitDelta = projectedProfit - baselineProfit;
      
      // Calculate growth percent
      const growthPercent = baselineProfit !== 0 ? (profitDelta / Math.abs(baselineProfit)) * 100 : 0;
      const growthSign = profitDelta >= 0 ? '+' : '';
      
      return {
        id: scen.id,
        category: `${biz.name} - ${scen.name}`,
        mrrValue: `$${(projectedProfit / 1000).toFixed(0)}K`,
        growth: `${growthSign}${growthPercent.toFixed(1)}%`,
        trend: profitDelta >= 0 ? 'up' : 'down',
      };
    });

    // Calculate dynamic "Total MRR" based on total business baseline revenues or active projected profits
    const totalBaselineRevenue = businessesRaw.reduce((sum, biz) => sum + biz.baselineRevenue, 0);
    const totalMRR = totalBaselineRevenue;

    return NextResponse.json({
      activeBusinessesCount,
      monthlySimulationsCount,
      totalMRR,
      businesses,
      recentSimulations,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
