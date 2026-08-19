import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    simulationResult: { findMany: vi.fn() },
    notification: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { GET } from '@/app/api/cron/check-stale-predictions/route';

function makeCronRequest(secret?: string) {
  const headers: Record<string, string> = {};
  if (secret !== undefined) headers['authorization'] = `Bearer ${secret}`;
  return new Request('http://localhost/api/cron/check-stale-predictions', { headers });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('CRON_SECRET', 'test-cron-secret');
  mockPrisma.simulationResult.findMany.mockResolvedValue([]);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('GET /api/cron/check-stale-predictions', () => {
  it('returns 401 when the bearer token does not match CRON_SECRET', async () => {
    const res = await GET(makeCronRequest('wrong-secret'));
    expect(res.status).toBe(401);
    expect(mockPrisma.simulationResult.findMany).not.toHaveBeenCalled();
  });

  it('returns 401 when no authorization header is present', async () => {
    const res = await GET(makeCronRequest());
    expect(res.status).toBe(401);
  });

  it('returns 500 and refuses to run when CRON_SECRET is not configured', async () => {
    vi.stubEnv('CRON_SECRET', '');
    const res = await GET(makeCronRequest('anything'));
    expect(res.status).toBe(500);
    expect(mockPrisma.simulationResult.findMany).not.toHaveBeenCalled();
  });

  it('creates a reminder for a stale, unsynced scenario with the correct bearer token', async () => {
    mockPrisma.simulationResult.findMany.mockResolvedValue([
      { id: 'sr-1', scenario: { id: 'sc-1', name: 'Old Plan', businessId: 'biz-aaa' } },
    ]);
    mockPrisma.notification.findFirst.mockResolvedValue(null);
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif-1' });

    const res = await GET(makeCronRequest('test-cron-secret'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.remindersCreated).toBe(1);
    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ businessId: 'biz-aaa', scenarioId: 'sc-1', type: 'reminder' }),
    });
  });

  it('does not create a duplicate reminder for a scenario already reminded once', async () => {
    mockPrisma.simulationResult.findMany.mockResolvedValue([
      { id: 'sr-1', scenario: { id: 'sc-1', name: 'Old Plan', businessId: 'biz-aaa' } },
    ]);
    mockPrisma.notification.findFirst.mockResolvedValue({ id: 'existing-reminder' });

    const res = await GET(makeCronRequest('test-cron-secret'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.remindersCreated).toBe(0);
    expect(mockPrisma.notification.create).not.toHaveBeenCalled();
  });
});
