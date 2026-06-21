import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, industry, baselineRevenue, baselineMarketing, baselineInventory, baselineFixedCosts } = body;

    if (!name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    // Determine owner email based on Clerk authentication state
    let ownerEmail = 'demo@twinos.com';
    try {
      if (process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        const clerkUser = await currentUser();
        if (clerkUser) {
          ownerEmail = clerkUser.emailAddresses[0]?.emailAddress || 'demo@twinos.com';
        }
      }
    } catch (e) {
      console.warn('Clerk is bypass mode or could not fetch current user, using fallback.');
    }

    // 1. Find or create the user record
    let user = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email: ownerEmail },
      });
    }

    // 2. Create the business twin
    const business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name,
        industry: industry || 'Other',
        baselineRevenue: Number(baselineRevenue || 100000),
        baselineMarketing: Number(baselineMarketing || 10000),
        baselineInventory: Number(baselineInventory || 20000),
        baselineFixedCosts: Number(baselineFixedCosts || 15000),
      },
    });



    return NextResponse.json({ business });
  } catch (error: any) {
    console.error('Error creating business twin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
