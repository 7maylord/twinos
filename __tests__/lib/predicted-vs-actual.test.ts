import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    simulationResult: { findMany: vi.fn(), update: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { backfillActuals } from '@/lib/predicted-vs-actual';

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.simulationResult.findMany.mockResolvedValue([]);
});

describe('backfillActuals', () => {
  it('only queries runs generated at least 6 months ago, for the given business, not yet backfilled', async () => {
    await backfillActuals('biz-aaa', 250000, 40000);

    expect(mockPrisma.simulationResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          actualRevenue: null,
          scenario: { businessId: 'biz-aaa' },
          generatedAt: expect.objectContaining({ lte: expect.any(Date) }),
        }),
      })
    );
  });

  it('uses a cutoff date roughly 6 months in the past', async () => {
    await backfillActuals('biz-aaa', 100000, 10000);

    const call = mockPrisma.simulationResult.findMany.mock.calls[0][0];
    const cutoff: Date = call.where.generatedAt.lte;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Within a few seconds of "now minus 6 months" (test execution time).
    expect(Math.abs(cutoff.getTime() - sixMonthsAgo.getTime())).toBeLessThan(5000);
  });

  it('backfills every pending run with the same actuals', async () => {
    mockPrisma.simulationResult.findMany.mockResolvedValue([
      { id: 'sr-1', projectedRevenue: 100000, scenario: { id: 'sc-1', name: 'Plan A' } },
      { id: 'sr-2', projectedRevenue: 100000, scenario: { id: 'sc-2', name: 'Plan B' } },
    ]);

    await backfillActuals('biz-aaa', 105000, 20000);

    expect(mockPrisma.simulationResult.update).toHaveBeenCalledTimes(2);
    expect(mockPrisma.simulationResult.update).toHaveBeenCalledWith({
      where: { id: 'sr-1' },
      data: expect.objectContaining({ actualRevenue: 105000, actualProfit: 20000 }),
    });
  });

  it('creates a drift notification when actual revenue misses the prediction by more than 20%', async () => {
    mockPrisma.simulationResult.findMany.mockResolvedValue([
      { id: 'sr-1', projectedRevenue: 100000, scenario: { id: 'sc-1', name: 'Aggressive Growth Plan' } },
    ]);

    await backfillActuals('biz-aaa', 60000, -5000); // 40% below prediction

    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        businessId: 'biz-aaa',
        scenarioId: 'sc-1',
        type: 'drift',
        severity: 'warning',
        title: expect.stringContaining('Aggressive Growth Plan'),
      }),
    });
  });

  it('does not create a notification when actual revenue is within the drift threshold', async () => {
    mockPrisma.simulationResult.findMany.mockResolvedValue([
      { id: 'sr-1', projectedRevenue: 100000, scenario: { id: 'sc-1', name: 'On-Track Plan' } },
    ]);

    await backfillActuals('biz-aaa', 108000, 20000); // 8% above prediction, within threshold

    expect(mockPrisma.notification.create).not.toHaveBeenCalled();
  });

  it('does not divide by zero when a prediction was exactly $0 revenue', async () => {
    mockPrisma.simulationResult.findMany.mockResolvedValue([
      { id: 'sr-1', projectedRevenue: 0, scenario: { id: 'sc-1', name: 'Zero Plan' } },
    ]);

    await backfillActuals('biz-aaa', 50000, 5000);

    expect(mockPrisma.simulationResult.update).toHaveBeenCalled();
    expect(mockPrisma.notification.create).not.toHaveBeenCalled();
  });
});
