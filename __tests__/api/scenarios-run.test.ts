import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, makeRequest } from './helpers';

const { mockGetActiveBusiness, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockPrisma: {
    scenario: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    simulationResult: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({ getActiveBusiness: mockGetActiveBusiness }));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/dynamodb', () => ({ cacheForecast: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/simulation-engine', () => ({
  runSimulation: vi.fn().mockReturnValue({
    projectedRevenue: 600000,
    projectedProfit: 80000,
    projectedHeadcount: 10,
    projectedInventoryRisk: 0.1,
    monthlyData: [],
  }),
}));

import { POST } from '@/app/api/scenarios/run/route';

const BASE_SCENARIO = {
  id: 'sc-1',
  businessId: BUSINESS_A.id,
  name: 'Test',
  priceIncrease: 5,
  employeeCount: 10,
  marketingBudget: 30000,
  supplierDelay: 'none',
  status: 'PENDING',
  business: { ...BUSINESS_A },
};

beforeEach(() => vi.clearAllMocks());

describe('POST /api/scenarios/run — new scenario path', () => {
  it('uses the active business when businessId is not in the request body', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.scenario.create.mockResolvedValue(BASE_SCENARIO);
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({ name: 'Price Test', priceIncrease: 5 });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockGetActiveBusiness).toHaveBeenCalled();
    expect(mockPrisma.scenario.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ businessId: BUSINESS_A.id }) })
    );
  });

  it('uses the explicit businessId and skips getActiveBusiness', async () => {
    mockPrisma.scenario.create.mockResolvedValue(BASE_SCENARIO);
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({ name: 'Price Test', priceIncrease: 5, businessId: BUSINESS_A.id });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 400 when no active business and no businessId provided', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeRequest({ name: 'Price Test', priceIncrease: 5 });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
  });

  it('returns 400 when scenario name is missing', async () => {
    const req = makeRequest({ priceIncrease: 5, businessId: BUSINESS_A.id });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/scenarios/run — existing scenario path', () => {
  it('runs simulation for an existing scenario without calling getActiveBusiness', async () => {
    mockPrisma.scenario.findUnique.mockResolvedValue(BASE_SCENARIO);
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({ scenarioId: 'sc-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.scenario.id).toBe('sc-1');
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 404 when scenarioId does not exist', async () => {
    mockPrisma.scenario.findUnique.mockResolvedValue(null);

    const req = makeRequest({ scenarioId: 'sc-ghost' });
    const res = await POST(req);

    expect(res.status).toBe(404);
  });
});
