import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetActiveBusiness, mockGetViewableActiveBusinessId, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockGetViewableActiveBusinessId: vi.fn(),
  mockPrisma: {
    business: { findUnique: vi.fn() },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  getActiveBusiness: mockGetActiveBusiness,
  getViewableActiveBusinessId: mockGetViewableActiveBusinessId,
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { GET } from '@/app/api/business/route';

beforeEach(() => vi.clearAllMocks());

describe('GET /api/business', () => {
  it('returns the full business, including raw employee/product data, for the owner', async () => {
    mockGetViewableActiveBusinessId.mockResolvedValue({ businessId: 'biz-aaa', role: 'owner' });
    mockGetActiveBusiness.mockResolvedValue({
      id: 'biz-aaa',
      name: 'Acme',
      employees: [{ id: 'emp-1', salary: 8000 }],
      products: [{ id: 'prod-1', price: 99, cost: 30 }],
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.employees[0].salary).toBe(8000);
    expect(data.products[0].cost).toBe(30);
  });

  it('redacts raw salaries and product costs for a viewer, returning only aggregates', async () => {
    mockGetViewableActiveBusinessId.mockResolvedValue({ businessId: 'biz-aaa', role: 'viewer' });
    mockPrisma.business.findUnique.mockResolvedValue({
      id: 'biz-aaa',
      name: 'Acme',
      employees: [{ salary: 8000 }, { salary: 6000 }],
      products: [{ id: 'prod-1', name: 'Widget', price: 99, unitsSoldPerMonth: 10, unitsInStock: null, reorderPoint: null, leadTimeDays: null }],
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.employees).toBeUndefined();
    expect(data.employeeCount).toBe(2);
    expect(data.totalPayroll).toBe(14000);
    expect(data.products[0].cost).toBeUndefined();
    expect(data.products[0].price).toBe(99);
    // The owner-only path must not have been used to serve a viewer.
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 404 for a caller with no access at all (cross-tenant attack)', async () => {
    mockGetViewableActiveBusinessId.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(404);
    expect(mockPrisma.business.findUnique).not.toHaveBeenCalled();
  });
});
