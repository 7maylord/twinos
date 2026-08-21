import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, makeRequest } from './helpers';

const { mockGetActiveBusiness, mockVerifyBusinessOwnership, mockVerifyBusinessAccess, mockGetViewableActiveBusinessId, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockVerifyBusinessOwnership: vi.fn(),
  mockVerifyBusinessAccess: vi.fn(),
  mockGetViewableActiveBusinessId: vi.fn(),
  mockPrisma: {
    actionItem: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  getActiveBusiness: mockGetActiveBusiness,
  verifyBusinessOwnership: mockVerifyBusinessOwnership,
  verifyBusinessAccess: mockVerifyBusinessAccess,
  getViewableActiveBusinessId: mockGetViewableActiveBusinessId,
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { GET, POST } from '@/app/api/action-items/route';
import { PATCH, DELETE } from '@/app/api/action-items/[id]/route';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => vi.clearAllMocks());

describe('GET /api/action-items', () => {
  it('lists items for the active business when no businessId query param is given', async () => {
    mockGetViewableActiveBusinessId.mockResolvedValue({ businessId: BUSINESS_A.id, role: 'owner' });
    mockPrisma.actionItem.findMany.mockResolvedValue([{ id: 'ai-1' }]);

    const res = await GET(new Request('http://localhost/api/action-items'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it('returns an empty list — not another tenant\'s items — for an inaccessible businessId (cross-tenant attack)', async () => {
    mockVerifyBusinessAccess.mockResolvedValue(false);

    const res = await GET(new Request('http://localhost/api/action-items?businessId=biz-not-mine'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockPrisma.actionItem.findMany).not.toHaveBeenCalled();
  });

  it('lists items for a caller with only viewer access — read access is not owner-only', async () => {
    mockGetViewableActiveBusinessId.mockResolvedValue({ businessId: BUSINESS_A.id, role: 'viewer' });
    mockPrisma.actionItem.findMany.mockResolvedValue([{ id: 'ai-1' }]);

    const res = await GET(new Request('http://localhost/api/action-items'));

    expect(res.status).toBe(200);
  });
});

describe('POST /api/action-items', () => {
  it('batch-creates sanitized items for the active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.actionItem.createMany.mockResolvedValue({ count: 2 });

    const req = makeRequest({
      items: [
        { category: 'price', description: 'Raise prices by 10%' },
        { category: 'bogus-category', description: 'Hire 2 staff' }, // invalid category -> falls back to 'none'
        { category: 'marketing', description: '   ' }, // blank description -> dropped
      ],
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.actionItem.createMany).toHaveBeenCalledWith({
      data: [
        { businessId: BUSINESS_A.id, category: 'price', description: 'Raise prices by 10%' },
        { businessId: BUSINESS_A.id, category: 'none', description: 'Hire 2 staff' },
      ],
    });
  });

  it('returns 404 when the businessId does not belong to the caller (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const req = makeRequest({ businessId: 'biz-not-mine', items: [{ category: 'price', description: 'x' }] });
    const res = await POST(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.actionItem.createMany).not.toHaveBeenCalled();
  });

  it('returns 400 when items is missing or empty', async () => {
    const req = makeRequest({ items: [] });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(mockPrisma.actionItem.createMany).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/action-items/:id', () => {
  it('updates status for an item owned by the caller', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue({ id: 'ai-1', businessId: 'biz-aaa' });
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.actionItem.update.mockResolvedValue({ id: 'ai-1', status: 'done' });

    const req = makeRequest({ status: 'done' });
    const res = await PATCH(req, makeParams('ai-1'));

    expect(res.status).toBe(200);
    expect(mockPrisma.actionItem.update).toHaveBeenCalledWith({ where: { id: 'ai-1' }, data: { status: 'done' } });
  });

  it('returns 400 for an invalid status value', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue({ id: 'ai-1', businessId: 'biz-aaa' });
    mockVerifyBusinessOwnership.mockResolvedValue(true);

    const req = makeRequest({ status: 'not-a-real-status' });
    const res = await PATCH(req, makeParams('ai-1'));

    expect(res.status).toBe(400);
    expect(mockPrisma.actionItem.update).not.toHaveBeenCalled();
  });

  it('returns 404 when the item belongs to a different business (cross-tenant attack)', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue({ id: 'ai-1', businessId: 'biz-not-mine' });
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const req = makeRequest({ status: 'done' });
    const res = await PATCH(req, makeParams('ai-1'));

    expect(res.status).toBe(404);
    expect(mockPrisma.actionItem.update).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/action-items/:id', () => {
  it('deletes an item owned by the caller', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue({ id: 'ai-1', businessId: 'biz-aaa' });
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.actionItem.delete.mockResolvedValue({ id: 'ai-1' });

    const res = await DELETE(new Request('http://localhost/api/action-items/ai-1', { method: 'DELETE' }), makeParams('ai-1'));

    expect(res.status).toBe(200);
    expect(mockPrisma.actionItem.delete).toHaveBeenCalledWith({ where: { id: 'ai-1' } });
  });

  it('returns 404 when the item belongs to a different business (cross-tenant attack)', async () => {
    mockPrisma.actionItem.findUnique.mockResolvedValue({ id: 'ai-1', businessId: 'biz-not-mine' });
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const res = await DELETE(new Request('http://localhost/api/action-items/ai-1', { method: 'DELETE' }), makeParams('ai-1'));

    expect(res.status).toBe(404);
    expect(mockPrisma.actionItem.delete).not.toHaveBeenCalled();
  });
});
