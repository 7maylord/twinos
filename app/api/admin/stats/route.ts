import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveUserEmail } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const email = await getActiveUserEmail();

    // Fetch user and their specific businesses/relations
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        businesses: {
          include: {
            employees: true,
            products: true,
            scenarios: {
              include: {
                simulationResults: {
                  orderBy: { generatedAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.businesses || user.businesses.length === 0) {
      return NextResponse.json({
        activeBusinessesCount: 0,
        monthlySimulationsCount: 0,
        totalMRR: 0,
        businesses: [],
        recentSimulations: [],
      });
    }

    const userBusinesses = user.businesses;
    const activeBusinessesCount = userBusinesses.length;
    
    let monthlySimulationsCount = 0;
    const businesses = [];
    const recentSimulations: any[] = [];

    for (const biz of userBusinesses) {
      monthlySimulationsCount += biz.scenarios.length;
      
      businesses.push({
        id: biz.id,
        name: biz.name,
        simulations: biz.scenarios.length,
        users: biz.employees.length,
        status: biz.scenarios.length > 0 ? 'Active' : 'Inactive',
      });

      for (const scen of biz.scenarios) {
        const totalSalary = biz.employees.reduce((sum, emp) => sum + emp.salary, 0);
        const baselineProfit = biz.baselineRevenue - totalSalary - biz.baselineMarketing - biz.baselineInventory - biz.baselineFixedCosts;
        
        const latestResult = scen.simulationResults[0];
        const projectedProfit = latestResult ? latestResult.projectedProfit : baselineProfit;
        const profitDelta = projectedProfit - baselineProfit;
        
        const growthPercent = baselineProfit !== 0 ? (profitDelta / Math.abs(baselineProfit)) * 100 : 0;
        const growthSign = profitDelta >= 0 ? '+' : '';
        
        recentSimulations.push({
          id: scen.id,
          category: `${biz.name} - ${scen.name}`,
          mrrValue: `$${(projectedProfit / 1000).toFixed(0)}K`,
          growth: `${growthSign}${growthPercent.toFixed(1)}%`,
          trend: profitDelta >= 0 ? 'up' : 'down',
          createdAt: scen.createdAt,
        });
      }
    }

    // Sort recent simulations by date desc and take top 10
    recentSimulations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const topRecentSimulations = recentSimulations.slice(0, 10).map(({ id, category, mrrValue, growth, trend }) => ({
      id, category, mrrValue, growth, trend
    }));

    const totalMRR = userBusinesses.reduce((sum, biz) => sum + biz.baselineRevenue, 0);

    return NextResponse.json({
      activeBusinessesCount,
      monthlySimulationsCount,
      totalMRR,
      businesses,
      recentSimulations: topRecentSimulations,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
