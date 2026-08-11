import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness, verifyBusinessOwnership } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryBusinessId = searchParams.get('businessId');
    
    let targetBusinessId = queryBusinessId;
    if (!targetBusinessId) {
      const activeBusiness = await getActiveBusiness();
      if (activeBusiness) {
        targetBusinessId = activeBusiness.id;
      }
    }

    if (!targetBusinessId) {
      return NextResponse.json([]);
    }

    const scenarios = await prisma.scenario.findMany({
      where: {
        businessId: targetBusinessId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        simulationResults: true,
      },
    });
    return NextResponse.json(scenarios);
  } catch (error: any) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, priceIncrease, employeeCount, marketingBudget, supplierDelay, businessId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Scenario name is required' }, { status: 400 });
    }

    // Resolve business ID
    let targetBusinessId = businessId;
    if (targetBusinessId) {
      if (!(await verifyBusinessOwnership(targetBusinessId))) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
    } else {
      const activeBusiness = await getActiveBusiness();
      if (!activeBusiness) {
        return NextResponse.json({ error: 'No business found in database. Seed the database first.' }, { status: 400 });
      }
      targetBusinessId = activeBusiness.id;
    }

    const scenario = await prisma.scenario.create({
      data: {
        businessId: targetBusinessId,
        name,
        priceIncrease: Number(priceIncrease || 0),
        employeeCount: Number(employeeCount || 10),
        marketingBudget: Number(marketingBudget || 0),
        supplierDelay: supplierDelay || 'none',
        status: 'PENDING',
      },
    });

    return NextResponse.json(scenario);
  } catch (error: any) {
    console.error('Error creating scenario:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
