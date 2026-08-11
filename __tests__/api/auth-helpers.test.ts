import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BUSINESS_A, BUSINESS_B } from './helpers';

const { mockCookiesGet, mockPrisma } = vi.hoisted(() => ({
  mockCookiesGet: vi.fn(),
  mockPrisma: {
    user: { findUnique: vi.fn() },
    business: { findFirst: vi.fn(), findUnique: vi.fn() },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
vi.mock('@clerk/nextjs/server', () => ({ currentUser: vi.fn().mockResolvedValue(null) }));

import { getActiveBusiness, verifyBusinessOwnership } from '@/lib/auth-helpers';
import { currentUser } from '@clerk/nextjs/server';

beforeEach(() => {
  vi.clearAllMocks();
  mockCookiesGet.mockReturnValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getActiveBusiness — demo mode (no Clerk)', () => {
  it('returns the business matching the active-business-id cookie', async () => {
    mockCookiesGet.mockReturnValue({ value: BUSINESS_B.id });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue(BUSINESS_B);

    const result = await getActiveBusiness();

    expect(result?.id).toBe(BUSINESS_B.id);
    expect(mockPrisma.business.findFirst).not.toHaveBeenCalled();
  });

  it('falls back to findFirst when cookie is set but business is not found', async () => {
    mockCookiesGet.mockReturnValue({ value: 'biz-stale' });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue(null);
    mockPrisma.business.findFirst.mockResolvedValue(BUSINESS_A);

    const result = await getActiveBusiness();

    expect(result?.id).toBe(BUSINESS_A.id);
    expect(mockPrisma.business.findFirst).toHaveBeenCalled();
  });

  it('falls back to findFirst when no cookie is set', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findFirst.mockResolvedValue(BUSINESS_A);

    const result = await getActiveBusiness();

    expect(result?.id).toBe(BUSINESS_A.id);
    expect(mockPrisma.business.findFirst).toHaveBeenCalled();
  });
});

describe('getActiveBusiness — user with multiple businesses', () => {
  const user = {
    email: 'owner@company.com',
    businesses: [BUSINESS_A, BUSINESS_B],
  };

  it('returns the business matching the active-business-id cookie', async () => {
    mockCookiesGet.mockReturnValue({ value: BUSINESS_B.id });
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await getActiveBusiness();

    expect(result?.id).toBe(BUSINESS_B.id);
  });

  it('returns the first (most recently created) business when no cookie is set', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await getActiveBusiness();

    expect(result?.id).toBe(BUSINESS_A.id);
  });

  it('returns the first business when cookie does not match any owned business', async () => {
    mockCookiesGet.mockReturnValue({ value: 'biz-not-mine' });
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await getActiveBusiness();

    expect(result?.id).toBe(BUSINESS_A.id);
  });

  // NOTE: Testing the null path for a non-demo user requires real Clerk keys (CLERK_SECRET_KEY)
  // since getActiveUserEmail() falls back to 'demo@twinos.com' when Clerk is not configured.
  // That path is covered by integration tests run against a staging environment.
});

describe('verifyBusinessOwnership', () => {
  it('trusts any existing business in genuinely keyless demo mode (no Clerk configured)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue({ id: BUSINESS_A.id });

    const result = await verifyBusinessOwnership(BUSINESS_A.id);

    expect(result).toBe(true);
  });

  it('rejects a businessId that does not exist, even in demo mode', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue(null);

    const result = await verifyBusinessOwnership('biz-ghost');

    expect(result).toBe(false);
  });

  it('does NOT fall back to demo-mode trust when Clerk is configured but the session is missing (regression guard)', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_x');
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.mocked(currentUser).mockResolvedValueOnce(null);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue({ id: BUSINESS_A.id }); // business genuinely exists

    const result = await verifyBusinessOwnership(BUSINESS_A.id);

    // Even though the business exists, no identity was resolved — must deny, not
    // silently grant ownership the way a Clerk-unconfigured deployment would.
    expect(result).toBe(false);
  });

  it('does NOT fall back to demo-mode trust when Clerk is configured but currentUser() throws (regression guard)', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_x');
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.mocked(currentUser).mockRejectedValueOnce(new Error('Clerk unavailable'));
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue({ id: BUSINESS_A.id });

    const result = await verifyBusinessOwnership(BUSINESS_A.id);

    expect(result).toBe(false);
  });

  it('scopes a real user strictly to businesses they own', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      email: 'owner@company.com',
      businesses: [{ id: BUSINESS_A.id }],
    });

    expect(await verifyBusinessOwnership(BUSINESS_A.id)).toBe(true);
    expect(await verifyBusinessOwnership(BUSINESS_B.id)).toBe(false);
  });
});
