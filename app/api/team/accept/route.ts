import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveUserEmail } from '@/lib/auth-helpers';

// Any signed-in user can call this — that's the point of an invite link.
// Real identity is enforced upstream: this route is listed in proxy.ts's
// protected-route matcher, so Clerk requires a real session before this
// handler runs at all whenever Clerk is configured. In keyless/demo mode
// (no Clerk keys — local dev) every caller resolves to the same
// 'demo@twinos.com' identity, same ceiling every other route in this app
// already accepts.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite) {
      return NextResponse.json({ error: 'This invite link is invalid.' }, { status: 404 });
    }
    if (invite.acceptedAt) {
      return NextResponse.json({ error: 'This invite link has already been used.' }, { status: 410 });
    }
    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This invite link has expired.' }, { status: 410 });
    }

    const email = await getActiveUserEmail();

    const business = await prisma.business.findUnique({
      where: { id: invite.businessId },
      select: { name: true, owner: { select: { email: true } } },
    });
    if (!business) {
      return NextResponse.json({ error: 'This invite link is invalid.' }, { status: 404 });
    }

    // Already the owner — nothing to grant, owners already have full access.
    if (business.owner.email === email) {
      return NextResponse.json({ businessId: invite.businessId, businessName: business.name, alreadyOwner: true });
    }

    await prisma.$transaction([
      prisma.teamMember.upsert({
        where: { businessId_email: { businessId: invite.businessId, email } },
        create: { businessId: invite.businessId, email, role: invite.role },
        update: {},
      }),
      prisma.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date(), acceptedByEmail: email } }),
    ]);

    return NextResponse.json({ businessId: invite.businessId, businessName: business.name });
  } catch (error: any) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
