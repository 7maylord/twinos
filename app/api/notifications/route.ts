import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyBusinessAccess, getViewableActiveBusinessId } from '@/lib/auth-helpers';

// GET is read-only, so viewers (not just owners) can see notifications here.
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

    const notifications = await prisma.notification.findMany({
      where: { businessId: targetBusinessId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
