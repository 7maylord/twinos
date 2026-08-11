import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, BUSINESS_B } from './helpers';

const { mockGetActiveBusiness, mockVerifyBusinessOwnership, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockVerifyBusinessOwnership: vi.fn(),
  mockPrisma: {
    business: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    employee: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  getActiveBusiness: mockGetActiveBusiness,
  verifyBusinessOwnership: mockVerifyBusinessOwnership,
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/integrations/quickbooks', () => ({
  getValidQboToken: vi.fn().mockResolvedValue('mock-token-abc'),
}));
vi.mock('@/lib/encryption', () => ({
  encrypt: vi.fn((v: string) => `enc:${v}`),
  decrypt: vi.fn((v: string) => v.replace('enc:', '')),
}));

import { POST as qboPost } from '@/app/api/integrations/quickbooks/sync/route';
import { POST as shopifyPost } from '@/app/api/integrations/shopify/sync/route';
import { POST as squarePost } from '@/app/api/integrations/square/sync/route';

function makeJsonRequest(body: unknown) {
  return new Request('http://localhost/api/integrations/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => vi.clearAllMocks());

// ─── QuickBooks ───────────────────────────────────────────────────────────────

describe('POST /api/integrations/quickbooks/sync', () => {
  it('uses explicit businessId when ownership is verified, without calling getActiveBusiness', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.business.findUnique.mockResolvedValue(BUSINESS_A);
    mockPrisma.business.update.mockResolvedValue(BUSINESS_A);

    const req = makeJsonRequest({ businessId: BUSINESS_A.id });
    const res = await qboPost(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({ where: { id: BUSINESS_A.id } });
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 404 when the businessId does not belong to the caller (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const req = makeJsonRequest({ businessId: 'biz-not-mine' });
    const res = await qboPost(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.business.findUnique).not.toHaveBeenCalled();
  });

  it('falls back to getActiveBusiness when no businessId in request', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.business.update.mockResolvedValue(BUSINESS_A);

    const req = makeJsonRequest({});
    const res = await qboPost(req);

    expect(res.status).toBe(200);
    expect(mockGetActiveBusiness).toHaveBeenCalled();
    expect(mockPrisma.business.findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 when active business resolves to null', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeJsonRequest({});
    const res = await qboPost(req);

    expect(res.status).toBe(404);
  });
});

// ─── Shopify ──────────────────────────────────────────────────────────────────

describe('POST /api/integrations/shopify/sync', () => {
  const shopifyBiz = {
    ...BUSINESS_A,
    shopifyAccessToken: 'enc:shpua_mock_token_123',
    shopifyStoreDomain: 'test.myshopify.com',
  };

  it('uses explicit businessId when ownership is verified, without calling getActiveBusiness', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.business.findUnique.mockResolvedValue(shopifyBiz);
    mockPrisma.business.update.mockResolvedValue(shopifyBiz);
    mockPrisma.product.findFirst.mockResolvedValue({ id: 'p-existing' });

    const req = makeJsonRequest({ businessId: BUSINESS_A.id });
    const res = await shopifyPost(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({ where: { id: BUSINESS_A.id } });
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 404 when the businessId does not belong to the caller (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const req = makeJsonRequest({ businessId: 'biz-not-mine' });
    const res = await shopifyPost(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.business.findUnique).not.toHaveBeenCalled();
  });

  it('falls back to getActiveBusiness when no businessId', async () => {
    mockGetActiveBusiness.mockResolvedValue(shopifyBiz);
    mockPrisma.product.findFirst.mockResolvedValue({ id: 'p-existing' });

    const req = makeJsonRequest({});
    const res = await shopifyPost(req);

    expect(res.status).toBe(200);
    expect(mockGetActiveBusiness).toHaveBeenCalled();
    expect(mockPrisma.business.findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 when active business resolves to null', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeJsonRequest({});
    const res = await shopifyPost(req);

    expect(res.status).toBe(404);
  });
});

// ─── Square ───────────────────────────────────────────────────────────────────

describe('POST /api/integrations/square/sync', () => {
  const squareBiz = {
    ...BUSINESS_A,
    squareAccessToken: 'enc:sq_mock_token_123',
    squareLocationId: 'loc-1',
  };

  it('uses explicit businessId when ownership is verified, without calling getActiveBusiness', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.business.findUnique.mockResolvedValue(squareBiz);
    mockPrisma.business.update.mockResolvedValue(squareBiz);
    mockPrisma.employee.findFirst.mockResolvedValue({ id: 'e-existing' });

    const req = makeJsonRequest({ businessId: BUSINESS_A.id });
    const res = await squarePost(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({ where: { id: BUSINESS_A.id } });
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 404 when the businessId does not belong to the caller (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const req = makeJsonRequest({ businessId: 'biz-not-mine' });
    const res = await squarePost(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.business.findUnique).not.toHaveBeenCalled();
  });

  it('falls back to getActiveBusiness when no businessId', async () => {
    mockGetActiveBusiness.mockResolvedValue(squareBiz);
    mockPrisma.employee.findFirst.mockResolvedValue({ id: 'e-existing' });

    const req = makeJsonRequest({});
    const res = await squarePost(req);

    expect(res.status).toBe(200);
    expect(mockGetActiveBusiness).toHaveBeenCalled();
    expect(mockPrisma.business.findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 when active business resolves to null', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeJsonRequest({});
    const res = await squarePost(req);

    expect(res.status).toBe(404);
  });
});
