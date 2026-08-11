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
  return user?.businesses || [];
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
