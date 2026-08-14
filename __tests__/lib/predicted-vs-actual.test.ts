import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    simulationResult: { updateMany: vi.fn() },
  },
}));

vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { backfillActuals } from '@/lib/predicted-vs-actual';

beforeEach(() => vi.clearAllMocks());

describe('backfillActuals', () => {
  it('only targets runs generated at least 6 months ago, for the given business, not yet backfilled', async () => {
    mockPrisma.simulationResult.updateMany.mockResolvedValue({ count: 2 });

    await backfillActuals('biz-aaa', 250000, 40000);

    expect(mockPrisma.simulationResult.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          actualRevenue: null,
          scenario: { businessId: 'biz-aaa' },
          generatedAt: expect.objectContaining({ lte: expect.any(Date) }),
        }),
        data: expect.objectContaining({ actualRevenue: 250000, actualProfit: 40000 }),
      })
    );
  });

  it('uses a cutoff date roughly 6 months in the past', async () => {
    mockPrisma.simulationResult.updateMany.mockResolvedValue({ count: 0 });

    await backfillActuals('biz-aaa', 100000, 10000);

    const call = mockPrisma.simulationResult.updateMany.mock.calls[0][0];
    const cutoff: Date = call.where.generatedAt.lte;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Within a few seconds of "now minus 6 months" (test execution time).
    expect(Math.abs(cutoff.getTime() - sixMonthsAgo.getTime())).toBeLessThan(5000);
  });
});
