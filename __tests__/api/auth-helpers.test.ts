import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BUSINESS_A, BUSINESS_B } from './helpers';

const { mockCookiesGet, mockPrisma } = vi.hoisted(() => ({
  mockCookiesGet: vi.fn(),
  mockPrisma: {
    user: { findUnique: vi.fn() },
    business: { findFirst: vi.fn(), findUnique: vi.fn() },
    teamMember: { findUnique: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
vi.mock('@clerk/nextjs/server', () => ({ currentUser: vi.fn().mockResolvedValue(null) }));

import {
  getActiveBusiness,
  verifyBusinessOwnership,
  getBusinessRole,
  verifyBusinessAccess,
  getViewableActiveBusinessId,
  getUserBusinesses,
} from '@/lib/auth-helpers';
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

describe('getBusinessRole / verifyBusinessAccess', () => {
  it('returns "owner" for a business the caller owns', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      email: 'owner@company.com',
      businesses: [{ id: BUSINESS_A.id }],
    });

    expect(await getBusinessRole(BUSINESS_A.id)).toBe('owner');
    expect(await verifyBusinessAccess(BUSINESS_A.id)).toBe(true);
    // Ownership already answers the question — must not also query team membership.
    expect(mockPrisma.teamMember.findUnique).not.toHaveBeenCalled();
  });

  it('returns "viewer" for a business the caller was invited to, not owns', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue(null); // not demo mode's any-business trust
    mockPrisma.teamMember.findUnique.mockResolvedValue({ id: 'tm-1', businessId: BUSINESS_A.id, email: 'viewer@company.com' });

    expect(await getBusinessRole(BUSINESS_A.id)).toBe('viewer');
    expect(await verifyBusinessAccess(BUSINESS_A.id)).toBe(true);
  });

  it('returns null (cross-tenant attack) for a business the caller neither owns nor was invited to', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      email: 'owner@company.com',
      businesses: [{ id: BUSINESS_A.id }],
    });
    mockPrisma.teamMember.findUnique.mockResolvedValue(null);

    expect(await getBusinessRole(BUSINESS_B.id)).toBeNull();
    expect(await verifyBusinessAccess(BUSINESS_B.id)).toBe(false);
  });

  it('does not grant viewer access from a TeamMember row on a different business (cross-tenant attack)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue(null);
    // Caller is a viewer of BUSINESS_A, but this call asks about BUSINESS_B —
    // the mock only returns a row when queried for BUSINESS_A's compound key,
    // matching real unique-key lookup semantics.
    mockPrisma.teamMember.findUnique.mockImplementation(({ where }: any) =>
      where.businessId_email.businessId === BUSINESS_A.id
        ? Promise.resolve({ id: 'tm-1', businessId: BUSINESS_A.id, email: 'viewer@company.com' })
        : Promise.resolve(null)
    );

    expect(await getBusinessRole(BUSINESS_B.id)).toBeNull();
  });
});

describe('getViewableActiveBusinessId', () => {
  it('resolves an owned business matching the cookie as role owner', async () => {
    mockCookiesGet.mockReturnValue({ value: BUSINESS_A.id });
    mockPrisma.user.findUnique.mockResolvedValue({ businesses: [{ id: BUSINESS_A.id }] });

    expect(await getViewableActiveBusinessId()).toEqual({ businessId: BUSINESS_A.id, role: 'owner' });
  });

  it('falls back to the first owned business when no cookie is set', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ businesses: [{ id: BUSINESS_A.id }, { id: BUSINESS_B.id }] });

    expect(await getViewableActiveBusinessId()).toEqual({ businessId: BUSINESS_A.id, role: 'owner' });
  });

  it('resolves a viewed (not owned) business matching the cookie as role viewer', async () => {
    mockCookiesGet.mockReturnValue({ value: BUSINESS_B.id });
    mockPrisma.user.findUnique.mockResolvedValue({ businesses: [] });
    mockPrisma.teamMember.findUnique.mockResolvedValue({ id: 'tm-1', businessId: BUSINESS_B.id, email: 'viewer@company.com' });

    expect(await getViewableActiveBusinessId()).toEqual({ businessId: BUSINESS_B.id, role: 'viewer' });
  });

  it('respects the cookie for a viewed business even when the caller also owns a different business (precedence regression guard)', async () => {
    // Caller owns BUSINESS_A but has switched to viewing BUSINESS_B. Composing
    // this from getActiveBusiness() would silently ignore the cookie and
    // return BUSINESS_A instead — this must not happen.
    mockCookiesGet.mockReturnValue({ value: BUSINESS_B.id });
    mockPrisma.user.findUnique.mockResolvedValue({ businesses: [{ id: BUSINESS_A.id }] });
    mockPrisma.teamMember.findUnique.mockResolvedValue({ id: 'tm-1', businessId: BUSINESS_B.id, email: 'owner@company.com' });

    expect(await getViewableActiveBusinessId()).toEqual({ businessId: BUSINESS_B.id, role: 'viewer' });
  });

  it('falls back to the first owned business when the cookie matches nothing the caller can access', async () => {
    mockCookiesGet.mockReturnValue({ value: 'biz-not-mine' });
    mockPrisma.user.findUnique.mockResolvedValue({ businesses: [{ id: BUSINESS_A.id }] });
    mockPrisma.teamMember.findUnique.mockResolvedValue(null);

    expect(await getViewableActiveBusinessId()).toEqual({ businessId: BUSINESS_A.id, role: 'owner' });
  });

  it('falls back to a viewer membership when the caller owns nothing and no cookie is set', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_x');
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.mocked(currentUser).mockResolvedValueOnce({ emailAddresses: [{ emailAddress: 'viewer@company.com' }] } as any);
    mockPrisma.user.findUnique.mockResolvedValue({ businesses: [] });
    mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'tm-1', businessId: BUSINESS_B.id, email: 'viewer@company.com' });

    expect(await getViewableActiveBusinessId()).toEqual({ businessId: BUSINESS_B.id, role: 'viewer' });
  });

  it('returns null for a caller with no owned businesses and no viewer memberships, outside demo mode', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_x');
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.mocked(currentUser).mockResolvedValueOnce({ emailAddresses: [{ emailAddress: 'nobody@company.com' }] } as any);
    mockPrisma.user.findUnique.mockResolvedValue({ businesses: [] });
    mockPrisma.teamMember.findFirst.mockResolvedValue(null);

    expect(await getViewableActiveBusinessId()).toBeNull();
  });

  it('trusts any existing business in genuinely keyless demo mode, same as getActiveBusiness', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.business.findFirst.mockResolvedValue({ id: BUSINESS_A.id });

    expect(await getViewableActiveBusinessId()).toEqual({ businessId: BUSINESS_A.id, role: 'owner' });
  });
});

describe('getUserBusinesses — includes viewer memberships', () => {
  it('tags owned businesses "owner" and invited businesses "viewer"', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ businesses: [{ id: BUSINESS_A.id, name: BUSINESS_A.name }] });
    mockPrisma.teamMember.findMany.mockResolvedValue([
      { business: { id: BUSINESS_B.id, name: BUSINESS_B.name } },
    ]);

    const result = await getUserBusinesses();

    expect(result).toEqual([
      { id: BUSINESS_A.id, name: BUSINESS_A.name, role: 'owner' },
      { id: BUSINESS_B.id, name: BUSINESS_B.name, role: 'viewer' },
    ]);
  });
});
