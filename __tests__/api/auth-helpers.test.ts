import { describe, it, expect, vi, beforeEach } from 'vitest';
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

import { getActiveBusiness } from '@/lib/auth-helpers';

beforeEach(() => {
  vi.clearAllMocks();
  mockCookiesGet.mockReturnValue(undefined);
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
