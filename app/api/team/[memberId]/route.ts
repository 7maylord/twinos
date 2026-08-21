import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyBusinessOwnership } from '@/lib/auth-helpers';

// Owner-only: revokes a viewer's standing access.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;

    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member || !(await verifyBusinessOwnership(member.businessId))) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    await prisma.teamMember.delete({ where: { id: memberId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
