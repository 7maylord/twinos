import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const scenarios = await prisma.scenario.findMany({
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
    if (!targetBusinessId) {
      const defaultBusiness = await prisma.business.findFirst();
      if (!defaultBusiness) {
        return NextResponse.json({ error: 'No business found in database. Seed the database first.' }, { status: 400 });
      }
      targetBusinessId = defaultBusiness.id;
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
