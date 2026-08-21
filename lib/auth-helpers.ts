import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';
import { cookies } from 'next/headers';

export async function getActiveUserEmail(): Promise<string> {
  let ownerEmail = 'demo@twinos.com';
  try {
    if (process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        ownerEmail = clerkUser.emailAddresses[0]?.emailAddress || 'demo@twinos.com';
      }
    }
  } catch (e) {
    console.warn('[auth-helpers] Clerk is bypass mode or could not fetch current user, using fallback.');
  }
  return ownerEmail;
}

export async function getActiveBusiness() {
  const email = await getActiveUserEmail();
  const cookieStore = await cookies();
  const activeBusinessId = cookieStore.get('active-business-id')?.value;
  
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      businesses: {
        include: {
          products: true,
          employees: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user || user.businesses.length === 0) {
    // Fallback: If no business is linked to this user (e.g. demo mode or reset DB),
    // respect the active-business-id cookie first, then fall back to the first business.
    if (email === 'demo@twinos.com') {
      if (activeBusinessId) {
        const byId = await prisma.business.findUnique({
          where: { id: activeBusinessId },
          include: { products: true, employees: true },
        });
        if (byId) return byId;
      }
      return await prisma.business.findFirst({
        include: {
          products: true,
          employees: true,
        },
      });
    }
    return null;
  }

  // If a specific business is selected via cookie, try to find it among the user's businesses
  if (activeBusinessId) {
    const selectedBusiness = user.businesses.find(b => b.id === activeBusinessId);
    if (selectedBusiness) {
      return selectedBusiness;
    }
  }

  // Fallback to the most recently created business
  return user.businesses[0];
}

export async function getUserBusinesses() {
  const email = await getActiveUserEmail();
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      businesses: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
  const owned = (user?.businesses || []).map((b) => ({ ...b, role: 'owner' as const }));

  const memberships = await prisma.teamMember.findMany({
    where: { email },
    select: { business: { select: { id: true, name: true } } },
    orderBy: { joinedAt: 'desc' },
  });
  const viewed = memberships.map((m) => ({ ...m.business, role: 'viewer' as const }));

  return [...owned, ...viewed];
}

// Confirms a client-supplied businessId actually belongs to the caller, before
// it's trusted to scope a create/read/write. Mirrors getActiveBusiness()'s trust
// model: real users are scoped strictly to businesses they own; the keyless demo
// deployment (no Clerk keys configured at all — no login required) trusts any
// business that exists, same as today.
//
// getActiveUserEmail() silently falls back to 'demo@twinos.com' whenever Clerk
// can't resolve an identity — including when Clerk IS configured but the call
// errored or the session is missing. So the demo-mode trust bypass below must be
// gated on Clerk actually being unconfigured, not merely on the resolved email —
// otherwise a Clerk hiccup in production would grant ownership of every business.
export async function verifyBusinessOwnership(businessId: string): Promise<boolean> {
  if (!businessId) return false;

  const email = await getActiveUserEmail();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { businesses: { select: { id: true } } },
  });

  if (user && user.businesses.length > 0) {
    return user.businesses.some((b) => b.id === businessId);
  }

  const clerkConfigured = !!(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (!clerkConfigured && email === 'demo@twinos.com') {
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
    return !!business;
  }

  return false;
}

// Resolves owner-or-viewer access for read-only routes. Deliberately NOT
// built on top of verifyBusinessOwnership (duplicates its owner + demo-mode
// check instead) — this function is the read-access answer, and every
// mutation route in the app still calls verifyBusinessOwnership directly, so
// that function must stay exactly as it was before team access existed. Never
// use this to gate a write.
export async function getBusinessRole(businessId: string): Promise<'owner' | 'viewer' | null> {
  if (!businessId) return null;

  if (await verifyBusinessOwnership(businessId)) return 'owner';

  const email = await getActiveUserEmail();
  const membership = await prisma.teamMember.findUnique({
    where: { businessId_email: { businessId, email } },
  });
  return membership ? 'viewer' : null;
}

export async function verifyBusinessAccess(businessId: string): Promise<boolean> {
  return (await getBusinessRole(businessId)) !== null;
}

// The viewer-inclusive counterpart to getActiveBusiness() for read-only
// routes. getActiveBusiness() only ever resolves OWNED businesses and every
// mutation route trusts its result implicitly with no further ownership
// check — widening it in place would let a viewer with no businessId in the
// request body silently operate on a business they can only view. This is a
// separate function so that trust boundary never moves.
//
// Not composed from getActiveBusiness() either: when the caller owns at
// least one business but the active-business-id cookie points to one they
// only view, getActiveBusiness() falls back to their most-recently-created
// OWNED business instead of respecting the cookie — reusing that here would
// silently show an owner their own business instead of the viewed one they
// actually selected. So this re-checks the cookie against both owned and
// viewed businesses directly.
export async function getViewableActiveBusinessId(): Promise<{ businessId: string; role: 'owner' | 'viewer' } | null> {
  const email = await getActiveUserEmail();
  const cookieStore = await cookies();
  const activeBusinessId = cookieStore.get('active-business-id')?.value;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { businesses: { select: { id: true }, orderBy: { createdAt: 'desc' } } },
  });
  const ownedIds = user?.businesses.map((b) => b.id) || [];

  if (activeBusinessId) {
    if (ownedIds.includes(activeBusinessId)) {
      return { businessId: activeBusinessId, role: 'owner' };
    }
    const membership = await prisma.teamMember.findUnique({
      where: { businessId_email: { businessId: activeBusinessId, email } },
    });
    if (membership) return { businessId: activeBusinessId, role: 'viewer' };
  }

  if (ownedIds.length > 0) {
    return { businessId: ownedIds[0], role: 'owner' };
  }

  const clerkConfigured = !!(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (!clerkConfigured && email === 'demo@twinos.com') {
    if (activeBusinessId) {
      const byId = await prisma.business.findUnique({ where: { id: activeBusinessId }, select: { id: true } });
      if (byId) return { businessId: byId.id, role: 'owner' };
    }
    const first = await prisma.business.findFirst({ select: { id: true } });
    return first ? { businessId: first.id, role: 'owner' } : null;
  }

  const anyMembership = await prisma.teamMember.findFirst({ where: { email }, orderBy: { joinedAt: 'desc' } });
  return anyMembership ? { businessId: anyMembership.businessId, role: 'viewer' } : null;
}
