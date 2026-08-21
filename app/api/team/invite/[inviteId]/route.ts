import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyBusinessOwnership } from '@/lib/auth-helpers';

// Owner-only: revokes a pending invite link before it's accepted.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;

    const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
    if (!invite || !(await verifyBusinessOwnership(invite.businessId))) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    await prisma.invite.delete({ where: { id: inviteId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error revoking invite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
