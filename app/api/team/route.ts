import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness, verifyBusinessOwnership } from '@/lib/auth-helpers';

const INVITE_TTL_DAYS = 7;

// Owner-only: lists current viewers and pending (unexpired, unaccepted)
// invites for a business, so the settings page can render both.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryBusinessId = searchParams.get('businessId');

    let targetBusinessId = queryBusinessId;
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

    const [members, invites] = await Promise.all([
      prisma.teamMember.findMany({ where: { businessId: targetBusinessId }, orderBy: { joinedAt: 'desc' } }),
      prisma.invite.findMany({
        where: { businessId: targetBusinessId, acceptedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ members, invites });
  } catch (error: any) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Owner-only: generates a single-use, expiring invite link. Not bound to a
// target email — there's nothing to leak about who was invited, and the
// owner shares the link out-of-band (there's no email-sending capability in
// this app to build the alternative on).
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const queryBusinessId = body.businessId;

    let targetBusinessId = queryBusinessId;
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

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

    const invite = await prisma.invite.create({
      data: { businessId: targetBusinessId, expiresAt },
    });

    return NextResponse.json(invite);
  } catch (error: any) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
