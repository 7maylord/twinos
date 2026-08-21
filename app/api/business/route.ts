import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness, getViewableActiveBusinessId } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const resolved = await getViewableActiveBusinessId();
    if (!resolved) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (resolved.role === 'owner') {
      const business = await getActiveBusiness();
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
      return NextResponse.json(business);
    }

    // Viewer: same redaction as the public share link — no raw salaries or
    // product costs, only aggregates (see app/api/scenarios/[id]/results).
    const business = await prisma.business.findUnique({
      where: { id: resolved.businessId },
      select: {
        id: true,
        name: true,
        industry: true,
        tenantId: true,
        createdAt: true,
        baselineRevenue: true,
        baselineMarketing: true,
        baselineInventory: true,
        baselineFixedCosts: true,
        products: {
          select: { id: true, name: true, price: true, unitsSoldPerMonth: true, unitsInStock: true, reorderPoint: true, leadTimeDays: true },
        },
        employees: { select: { salary: true } },
      },
    });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    const { employees, ...rest } = business;
    return NextResponse.json({
      ...rest,
      employeeCount: employees.length,
      totalPayroll: employees.reduce((sum, e) => sum + e.salary, 0),
    });
  } catch (error: any) {
    console.error('Error fetching business:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
