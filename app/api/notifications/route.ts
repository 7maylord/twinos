import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness, verifyBusinessOwnership } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryBusinessId = searchParams.get('businessId');

    let targetBusinessId = queryBusinessId;
    if (targetBusinessId) {
      if (!(await verifyBusinessOwnership(targetBusinessId))) {
        return NextResponse.json([]);
      }
    } else {
      const activeBusiness = await getActiveBusiness();
      if (activeBusiness) targetBusinessId = activeBusiness.id;
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
