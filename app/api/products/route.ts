import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness, verifyBusinessOwnership } from '@/lib/auth-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let targetBusinessId = null;
    const activeBusiness = await getActiveBusiness();
    if (activeBusiness) {
      targetBusinessId = activeBusiness.id;
    }

    if (Array.isArray(body)) {
      if (!targetBusinessId) {
        return NextResponse.json({ error: 'No business profile found' }, { status: 400 });
      }

      const created = [];
      for (const item of body) {
        const { name, price, cost, businessId } = item;
        if (!name || price === undefined || cost === undefined) continue;
        if (businessId && !(await verifyBusinessOwnership(businessId))) continue;

        const product = await prisma.product.create({
          data: {
            businessId: businessId || targetBusinessId,
            name,
            price: Number(price),
            cost: Number(cost),
          },
        });
        created.push(product);
      }
      return NextResponse.json({ success: true, count: created.length, data: created });
    }

    const { name, price, cost, businessId } = body;

    if (!name || price === undefined || cost === undefined) {
      return NextResponse.json({ error: 'Name, price, and cost are required' }, { status: 400 });
    }

    if (businessId && !(await verifyBusinessOwnership(businessId))) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const targetId = businessId || targetBusinessId;
    if (!targetId) {
      return NextResponse.json({ error: 'No business profile found' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        businessId: targetId,
        name,
        price: Number(price),
        cost: Number(cost),
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, cost, unitsSoldPerMonth, unitsInStock, reorderPoint, leadTimeDays } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const activeBusiness = await getActiveBusiness();
    if (!activeBusiness) {
      return NextResponse.json({ error: 'No active business' }, { status: 401 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.businessId !== activeBusiness.id) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Empty string means "clear this optional field" (nullable columns).
    const parseOptionalNumber = (value: unknown): number | null | undefined => {
      if (value === undefined) return undefined;
      if (value === null || value === '') return null;
      const num = Number(value);
      return Number.isFinite(num) ? num : undefined;
    };

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (cost !== undefined) updateData.cost = Number(cost);
    if (unitsSoldPerMonth !== undefined) updateData.unitsSoldPerMonth = parseOptionalNumber(unitsSoldPerMonth);
    if (unitsInStock !== undefined) updateData.unitsInStock = parseOptionalNumber(unitsInStock);
    if (reorderPoint !== undefined) updateData.reorderPoint = parseOptionalNumber(reorderPoint);
    if (leadTimeDays !== undefined) {
      const parsed = parseOptionalNumber(leadTimeDays);
      updateData.leadTimeDays = parsed != null ? Math.round(parsed) : parsed;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const activeBusiness = await getActiveBusiness();
    if (!activeBusiness) {
      return NextResponse.json({ error: 'No active business' }, { status: 401 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.businessId !== activeBusiness.id) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
