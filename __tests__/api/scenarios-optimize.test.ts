import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, makeRequest } from './helpers';

const { mockGetActiveBusiness } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
}));

vi.mock('@/lib/auth-helpers', () => ({ getActiveBusiness: mockGetActiveBusiness }));
vi.mock('@/lib/db', () => ({ prisma: {} }));
vi.mock('@/lib/dynamodb', () => ({ logOptimizationRun: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/simulation-engine', () => ({
  runSimulation: vi.fn().mockReturnValue({
    projectedRevenue: 600000,
    projectedProfit: 80000,
    projectedHeadcount: 10,
    projectedInventoryRisk: 0.1,
    monthlyData: [],
  }),
  optimizeScenario: vi.fn().mockReturnValue({
    targetValue: 96000,
    baselineValue: 80000,
    bestAdjustments: { priceIncrease: 5 },
    optimalOutput: {
      projectedRevenue: 650000,
      projectedProfit: 96000,
      projectedHeadcount: 10,
      projectedInventoryRisk: 0.1,
    },
    actionPlan: ['Increase price by 5%'],
  }),
}));

import { POST } from '@/app/api/scenarios/optimize/route';

beforeEach(() => vi.clearAllMocks());

describe('POST /api/scenarios/optimize', () => {
  it('uses getActiveBusiness — never calls prisma.business.findFirst', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);

    const req = makeRequest({ targetType: 'profit', targetGrowthPct: 20 });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockGetActiveBusiness).toHaveBeenCalled();
  });

  it('returns 404 when no active business found', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeRequest({ targetType: 'profit', targetGrowthPct: 20 });
    const res = await POST(req);

    expect(res.status).toBe(404);
  });

  it('returns 400 when targetType is missing', async () => {
    const req = makeRequest({ targetGrowthPct: 20 });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 400 when targetGrowthPct is missing', async () => {
    const req = makeRequest({ targetType: 'revenue' });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns optimized metrics and action plan', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);

    const req = makeRequest({ targetType: 'revenue', targetGrowthPct: 15 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('optimizedMetrics');
    expect(data).toHaveProperty('actionPlan');
    expect(data.targetType).toBe('revenue');
    expect(data.targetGrowthPct).toBe(15);
  });
});
