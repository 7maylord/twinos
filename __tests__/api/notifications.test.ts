import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetActiveBusiness, mockVerifyBusinessOwnership, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockVerifyBusinessOwnership: vi.fn(),
  mockPrisma: {
    notification: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  getActiveBusiness: mockGetActiveBusiness,
  verifyBusinessOwnership: mockVerifyBusinessOwnership,
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { GET } from '@/app/api/notifications/route';
import { PATCH } from '@/app/api/notifications/[id]/route';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => vi.clearAllMocks());

describe('GET /api/notifications', () => {
  it('lists notifications for the active business when no businessId query param is given', async () => {
    mockGetActiveBusiness.mockResolvedValue({ id: 'biz-aaa' });
    mockPrisma.notification.findMany.mockResolvedValue([{ id: 'n-1' }]);

    const res = await GET(new Request('http://localhost/api/notifications'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it('returns an empty list — not another tenant\'s notifications — for an unowned businessId (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const res = await GET(new Request('http://localhost/api/notifications?businessId=biz-not-mine'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockPrisma.notification.findMany).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/notifications/:id', () => {
  it('marks a notification read for the caller who owns it', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({ id: 'n-1', businessId: 'biz-aaa' });
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.notification.update.mockResolvedValue({ id: 'n-1', read: true });

    const req = new Request('http://localhost/api/notifications/n-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
    const res = await PATCH(req, makeParams('n-1'));

    expect(res.status).toBe(200);
    expect(mockPrisma.notification.update).toHaveBeenCalledWith({ where: { id: 'n-1' }, data: { read: true } });
  });

  it('returns 404 when the notification belongs to a different business (cross-tenant attack)', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({ id: 'n-1', businessId: 'biz-not-mine' });
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const req = new Request('http://localhost/api/notifications/n-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
    const res = await PATCH(req, makeParams('n-1'));

    expect(res.status).toBe(404);
    expect(mockPrisma.notification.update).not.toHaveBeenCalled();
  });
});
