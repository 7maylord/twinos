import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveUserEmail } from '@/lib/auth-helpers';

// Safe, side-effect-free lookup so the accept page can show "Join {business}?"
// before anything is granted — see POST below for why granting access must
// wait for an explicit click rather than firing on page load.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = (searchParams.get('token') || '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({
      where: { token },
      select: { acceptedAt: true, expiresAt: true, business: { select: { name: true } } },
    });
    if (!invite) {
      return NextResponse.json({ error: 'This invite link is invalid.' }, { status: 404 });
    }
    if (invite.acceptedAt) {
      return NextResponse.json({ error: 'This invite link has already been used.' }, { status: 410 });
    }
    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This invite link has expired.' }, { status: 410 });
    }

    return NextResponse.json({ businessName: invite.business.name });
  } catch (error: any) {
    console.error('Error previewing invite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Any signed-in user can call this — that's the point of an invite link.
// Real identity is enforced upstream: this route is listed in proxy.ts's
// protected-route matcher, so Clerk requires a real session before this
// handler runs at all whenever Clerk is configured. In keyless/demo mode
// (no Clerk keys — local dev) every caller resolves to the same
// 'demo@twinos.com' identity, same ceiling every other route in this app
// already accepts.
//
// Only ever called from an explicit "Accept & Join" click (see
// app/invite/[token]/page.tsx) — never automatically on page load. An invite
// link is routinely visited without real user intent (Slack/email link
// unfurlers, corporate mail security scanners that pre-fetch every URL in an
// inbound message), and this route both grants access and burns a
// single-use token; firing it from a page-load effect would let any such
// prefetch silently consume the invite before the real recipient ever sees
// it.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 });
    }

    const email = await getActiveUserEmail();

    // Atomically claim the invite: the WHERE clause requires acceptedAt to
    // still be null and expiresAt to still be in the future, so of any
    // concurrent/replayed accept requests for the same token, only one can
    // ever match and flip acceptedAt. Doing the read-then-write as two
    // separate statements (as an earlier version of this route did) leaves a
    // window where two concurrent requests could both pass a "not yet
    // accepted" check and both proceed — defeating the single-use guarantee.
    const claim = await prisma.invite.updateMany({
      where: { token, acceptedAt: null, expiresAt: { gt: new Date() } },
      data: { acceptedAt: new Date(), acceptedByEmail: email },
    });

    if (claim.count === 0) {
      const invite = await prisma.invite.findUnique({ where: { token }, select: { acceptedAt: true, acceptedByEmail: true, expiresAt: true } });
      if (!invite) {
        return NextResponse.json({ error: 'This invite link is invalid.' }, { status: 404 });
      }
      if (invite.acceptedAt && invite.acceptedByEmail === email) {
        // Not a real conflict — the caller already claimed this invite
        // themselves (e.g. a duplicate request); fall through as success
        // below using the businessId already on the invite.
      } else if (invite.acceptedAt) {
        return NextResponse.json({ error: 'This invite link has already been used.' }, { status: 410 });
      } else {
        return NextResponse.json({ error: 'This invite link has expired.' }, { status: 410 });
      }
    }

    const invite = await prisma.invite.findUnique({
      where: { token },
      select: { businessId: true, role: true, business: { select: { name: true, owner: { select: { email: true } } } } },
    });
    if (!invite) {
      return NextResponse.json({ error: 'This invite link is invalid.' }, { status: 404 });
    }

    // Already the owner — nothing to grant, owners already have full access.
    if (invite.business.owner.email === email) {
      return NextResponse.json({ businessId: invite.businessId, businessName: invite.business.name, alreadyOwner: true });
    }

    await prisma.teamMember.upsert({
      where: { businessId_email: { businessId: invite.businessId, email } },
      create: { businessId: invite.businessId, email, role: invite.role },
      update: {},
    });

    return NextResponse.json({ businessId: invite.businessId, businessName: invite.business.name });
  } catch (error: any) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
