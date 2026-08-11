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

import { POST } from '@/app/api/scenarios/route';

beforeEach(() => vi.clearAllMocks());

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
