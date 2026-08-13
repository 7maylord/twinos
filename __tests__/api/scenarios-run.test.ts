import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, makeRequest } from './helpers';
import { runSimulation } from '@/lib/simulation-engine';

const { mockGetActiveBusiness, mockVerifyBusinessOwnership, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockVerifyBusinessOwnership: vi.fn(),
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

vi.mock('@/lib/auth-helpers', () => ({
  getActiveBusiness: mockGetActiveBusiness,
  verifyBusinessOwnership: mockVerifyBusinessOwnership,
}));
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
  computeRoleSalaries: vi.fn().mockReturnValue({}),
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

  it('uses the explicit businessId and skips getActiveBusiness when ownership is verified', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.scenario.create.mockResolvedValue(BASE_SCENARIO);
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({ name: 'Price Test', priceIncrease: 5, businessId: BUSINESS_A.id });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockVerifyBusinessOwnership).toHaveBeenCalledWith(BUSINESS_A.id);
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 404 when the explicit businessId does not belong to the caller (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const req = makeRequest({ name: 'Price Test', priceIncrease: 5, businessId: 'biz-not-mine' });
    const res = await POST(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
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

  it('clamps out-of-range elasticity overrides and stores/passes the clamped values', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.scenario.create.mockResolvedValue({ ...BASE_SCENARIO, priceElasticityOverride: 2, marketingElasticityOverride: 0.3 });
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({
      name: 'Custom Elasticity Test',
      priceIncrease: 5,
      businessId: BUSINESS_A.id,
      priceElasticityOverride: 5, // out of the 0-2 range
      marketingElasticityOverride: 0.3,
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.scenario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priceElasticityOverride: 2, marketingElasticityOverride: 0.3 }),
      })
    );
    expect(vi.mocked(runSimulation)).toHaveBeenCalledWith(
      expect.objectContaining({ priceElasticityOverride: 2, marketingElasticityOverride: 0.3 }),
      expect.anything()
    );
  });

  it('ignores a blank/missing elasticity override instead of storing null-as-zero', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.scenario.create.mockResolvedValue(BASE_SCENARIO);
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({ name: 'No Override Test', priceIncrease: 5, businessId: BUSINESS_A.id });
    await POST(req);

    expect(mockPrisma.scenario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priceElasticityOverride: undefined, marketingElasticityOverride: undefined }),
      })
    );
  });

  it('sanitizes and stores role targets, passing them through to runSimulation', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    const expectedJson = JSON.stringify([{ role: 'Barista', count: 18 }, { role: 'Chef', count: 5 }]);
    mockPrisma.scenario.create.mockResolvedValue({ ...BASE_SCENARIO, roleTargetsJson: expectedJson });
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({
      name: 'Role Breakdown Test',
      businessId: BUSINESS_A.id,
      roleTargets: [
        { role: 'Barista', count: 18 },
        { role: 'Chef', count: 5 },
        { role: '   ', count: 3 }, // blank role — dropped
        { role: 'Ghost', count: -1 }, // negative count — dropped
      ],
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.scenario.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ roleTargetsJson: expectedJson }) })
    );
    expect(vi.mocked(runSimulation)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ roleTargets: [{ role: 'Barista', count: 18 }, { role: 'Chef', count: 5 }] })
    );
  });

  it('omits roleTargetsJson entirely when no valid role targets are provided', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.scenario.create.mockResolvedValue(BASE_SCENARIO);
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({ name: 'No Roles Test', priceIncrease: 5, businessId: BUSINESS_A.id });
    await POST(req);

    expect(mockPrisma.scenario.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ roleTargetsJson: undefined }) })
    );
  });
});

describe('POST /api/scenarios/run — existing scenario path', () => {
  it('runs simulation for an existing scenario owned by the caller, without calling getActiveBusiness', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.scenario.findUnique.mockResolvedValue(BASE_SCENARIO);
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({ scenarioId: 'sc-1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.scenario.id).toBe('sc-1');
    expect(mockVerifyBusinessOwnership).toHaveBeenCalledWith(BASE_SCENARIO.businessId);
    expect(mockGetActiveBusiness).not.toHaveBeenCalled();
  });

  it('returns 404 when scenarioId does not exist', async () => {
    mockPrisma.scenario.findUnique.mockResolvedValue(null);

    const req = makeRequest({ scenarioId: 'sc-ghost' });
    const res = await POST(req);

    expect(res.status).toBe(404);
  });

  it('returns 404 when the scenario belongs to a different business (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);
    mockPrisma.scenario.findUnique.mockResolvedValue(BASE_SCENARIO);

    const req = makeRequest({ scenarioId: 'sc-1' });
    const res = await POST(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.simulationResult.create).not.toHaveBeenCalled();
  });

  it('passes a previously-stored elasticity override through to runSimulation on re-run', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.scenario.findUnique.mockResolvedValue({
      ...BASE_SCENARIO,
      priceElasticityOverride: 0.55,
      marketingElasticityOverride: null,
    });
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({ scenarioId: 'sc-1' });
    await POST(req);

    expect(vi.mocked(runSimulation)).toHaveBeenCalledWith(
      expect.objectContaining({ priceElasticityOverride: 0.55, marketingElasticityOverride: null }),
      expect.anything()
    );
  });

  it('passes previously-stored role targets through to runSimulation on re-run', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.scenario.findUnique.mockResolvedValue({
      ...BASE_SCENARIO,
      roleTargetsJson: JSON.stringify([{ role: 'Barista', count: 18 }]),
    });
    mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sr-1', scenarioId: 'sc-1' });
    mockPrisma.scenario.update.mockResolvedValue({ ...BASE_SCENARIO, status: 'COMPLETED' });

    const req = makeRequest({ scenarioId: 'sc-1' });
    await POST(req);

    expect(vi.mocked(runSimulation)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ roleTargets: [{ role: 'Barista', count: 18 }] })
    );
  });
});
