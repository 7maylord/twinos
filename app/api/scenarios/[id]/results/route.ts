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
        business: {
          include: {
            employees: true,
            products: true,
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

    return NextResponse.json({
      scenario,
      result: latestResult,
      monthlyData,
    });
  } catch (error: any) {
    console.error('Error fetching scenario results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
