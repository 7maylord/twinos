import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyBusinessOwnership } from '@/lib/auth-helpers';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing || !(await verifyBusinessOwnership(existing.businessId))) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: body.read !== undefined ? !!body.read : true },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
