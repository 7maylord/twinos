import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyBusinessOwnership } from '@/lib/auth-helpers';

const VALID_STATUSES = new Set(['pending', 'in_progress', 'done']);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignee, dueDate } = body;

    const existing = await prisma.actionItem.findUnique({ where: { id } });
    if (!existing || !(await verifyBusinessOwnership(existing.businessId))) {
      return NextResponse.json({ error: 'Action item not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.has(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
    }
    if (assignee !== undefined) updateData.assignee = assignee || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updated = await prisma.actionItem.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating action item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.actionItem.findUnique({ where: { id } });
    if (!existing || !(await verifyBusinessOwnership(existing.businessId))) {
      return NextResponse.json({ error: 'Action item not found' }, { status: 404 });
    }

    await prisma.actionItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting action item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
