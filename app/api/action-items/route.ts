import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness, verifyBusinessOwnership, verifyBusinessAccess, getViewableActiveBusinessId } from '@/lib/auth-helpers';

// GET is read-only, so viewers (not just owners) can see the plan here.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryBusinessId = searchParams.get('businessId');

    let targetBusinessId = queryBusinessId;
    if (targetBusinessId) {
      if (!(await verifyBusinessAccess(targetBusinessId))) {
        return NextResponse.json([]);
      }
    } else {
      const resolved = await getViewableActiveBusinessId();
      if (resolved) targetBusinessId = resolved.businessId;
    }

    if (!targetBusinessId) {
      return NextResponse.json([]);
    }

    const items = await prisma.actionItem.findMany({
      where: { businessId: targetBusinessId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching action items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Batch-creates action items from an optimizer run's action plan. The user
// explicitly triggers this ("Save as Tasks") rather than it happening
// automatically on every optimizer call, so re-running the optimizer with a
// different target doesn't silently pile up duplicate to-dos.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    let targetBusinessId = businessId;
    if (targetBusinessId) {
      if (!(await verifyBusinessOwnership(targetBusinessId))) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
    } else {
      const activeBusiness = await getActiveBusiness();
      if (!activeBusiness) {
        return NextResponse.json({ error: 'No active business found.' }, { status: 400 });
      }
      targetBusinessId = activeBusiness.id;
    }

    const validCategories = new Set(['price', 'headcount', 'marketing', 'none']);
    const sanitized = items
      .filter((item: any) => typeof item?.description === 'string' && item.description.trim())
      .slice(0, 50)
      .map((item: any) => ({
        businessId: targetBusinessId,
        category: validCategories.has(item.category) ? item.category : 'none',
        description: item.description.trim(),
      }));

    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'No valid items provided' }, { status: 400 });
    }

    const created = await prisma.actionItem.createMany({ data: sanitized });
    return NextResponse.json({ success: true, count: created.count });
  } catch (error: any) {
    console.error('Error creating action items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
