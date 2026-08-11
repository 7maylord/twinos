import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, makeRequest } from './helpers';

const { mockGetActiveBusiness, mockVerifyBusinessOwnership, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockVerifyBusinessOwnership: vi.fn(),
  mockPrisma: {
    scenario: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  getActiveBusiness: mockGetActiveBusiness,
  verifyBusinessOwnership: mockVerifyBusinessOwnership,
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { GET, POST } from '@/app/api/scenarios/route';

beforeEach(() => vi.clearAllMocks());

describe('GET /api/scenarios', () => {
  it('lists scenarios for the active business when no businessId query param is given', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.scenario.findMany.mockResolvedValue([{ id: 'sc-1', businessId: BUSINESS_A.id }]);

    const res = await GET(new Request('http://localhost/api/scenarios'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it('lists scenarios for an explicit businessId when ownership is verified', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.scenario.findMany.mockResolvedValue([{ id: 'sc-1', businessId: BUSINESS_A.id }]);

    const res = await GET(new Request(`http://localhost/api/scenarios?businessId=${BUSINESS_A.id}`));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns an empty list — not another tenant\'s scenarios — when businessId is not owned (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const res = await GET(new Request('http://localhost/api/scenarios?businessId=biz-not-mine'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockPrisma.scenario.findMany).not.toHaveBeenCalled();
  });
});

describe('POST /api/scenarios', () => {
  it('creates a scenario scoped to the active business when no businessId is given', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.scenario.create.mockResolvedValue({ id: 'sc-new', businessId: BUSINESS_A.id, name: 'Test' });

    const req = makeRequest({ name: 'Test' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.scenario.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ businessId: BUSINESS_A.id }) })
    );
  });

  it('uses the explicit businessId when ownership is verified', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.scenario.create.mockResolvedValue({ id: 'sc-new', businessId: BUSINESS_A.id, name: 'Test' });

    const req = makeRequest({ name: 'Test', businessId: BUSINESS_A.id });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 404 when the explicit businessId does not belong to the caller (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const req = makeRequest({ name: 'Test', businessId: 'biz-not-mine' });
    const res = await POST(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
  });

  it('returns 400 when name is missing', async () => {
    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
  });
});
