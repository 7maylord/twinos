import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';

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
        take: 1,
      },
    },
  });

  const business = user?.businesses[0];
  
  if (!business) {
    // Fallback: If no business is linked to this user (e.g. they registered but database was reset/seeded),
    // and they are the demo user, return the seeded Halo Café business.
    if (email === 'demo@twinos.com') {
      return await prisma.business.findFirst({
        include: {
          products: true,
          employees: true,
        },
      });
    }
    return null;
  }

  return business;
}
