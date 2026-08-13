import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/scenario-builder(.*)',
  '/results(.*)',
  '/admin(.*)',
  '/onboarding(.*)',
  // API routes that read or write tenant-owned data. Excludes
  // /api/scenarios/:id/results and /api/recommendations, which intentionally
  // stay public to back the unauthenticated share-link feature.
  '/api/business(.*)',
  '/api/employees(.*)',
  '/api/products(.*)',
  '/api/scenarios',
  '/api/scenarios/run',
  '/api/scenarios/optimize',
  '/api/scenarios/(.*)/comments',
  '/api/integrations(.*)',
  '/api/admin(.*)',
]);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // If Clerk secret key is missing, skip authentication route protection to allow local testing
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  // Otherwise, run Clerk middleware
  const clerkHandler = clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  });

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in query params
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
