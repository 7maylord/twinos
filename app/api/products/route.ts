import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness } from '@/lib/auth-helpers';

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
    const { id, name, price, cost } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (cost !== undefined) updateData.cost = Number(cost);

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

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
