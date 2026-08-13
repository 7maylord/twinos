import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from './helpers';

const { mockVerifyBusinessOwnership, mockGetActiveUserEmail, mockPrisma } = vi.hoisted(() => ({
  mockVerifyBusinessOwnership: vi.fn(),
  mockGetActiveUserEmail: vi.fn(),
  mockPrisma: {
    scenario: { findUnique: vi.fn() },
    scenarioComment: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  verifyBusinessOwnership: mockVerifyBusinessOwnership,
  getActiveUserEmail: mockGetActiveUserEmail,
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { GET, POST } from '@/app/api/scenarios/[id]/comments/route';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => vi.clearAllMocks());

describe('GET /api/scenarios/:id/comments', () => {
  it('returns comments for a scenario owned by the caller', async () => {
    mockPrisma.scenario.findUnique.mockResolvedValue({ businessId: 'biz-aaa' });
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.scenarioComment.findMany.mockResolvedValue([
      { id: 'c-1', scenarioId: 'sc-1', authorEmail: 'a@b.com', body: 'Looks good', createdAt: new Date() },
    ]);

    const res = await GET(new Request('http://localhost/api/scenarios/sc-1/comments'), makeParams('sc-1'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it('returns 404 when the scenario belongs to a different business (cross-tenant attack)', async () => {
    mockPrisma.scenario.findUnique.mockResolvedValue({ businessId: 'biz-not-mine' });
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const res = await GET(new Request('http://localhost/api/scenarios/sc-1/comments'), makeParams('sc-1'));

    expect(res.status).toBe(404);
    expect(mockPrisma.scenarioComment.findMany).not.toHaveBeenCalled();
  });

  it('returns 404 when the scenario does not exist', async () => {
    mockPrisma.scenario.findUnique.mockResolvedValue(null);

    const res = await GET(new Request('http://localhost/api/scenarios/sc-ghost/comments'), makeParams('sc-ghost'));

    expect(res.status).toBe(404);
  });
});

describe('POST /api/scenarios/:id/comments', () => {
  it('creates a comment for a scenario owned by the caller', async () => {
    mockPrisma.scenario.findUnique.mockResolvedValue({ businessId: 'biz-aaa' });
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockGetActiveUserEmail.mockResolvedValue('owner@company.com');
    mockPrisma.scenarioComment.create.mockResolvedValue({
      id: 'c-new', scenarioId: 'sc-1', authorEmail: 'owner@company.com', body: 'Great plan', createdAt: new Date(),
    });

    const req = makeRequest({ body: 'Great plan' }, 'http://localhost/api/scenarios/sc-1/comments');
    const res = await POST(req, makeParams('sc-1'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.body).toBe('Great plan');
    expect(mockPrisma.scenarioComment.create).toHaveBeenCalledWith({
      data: { scenarioId: 'sc-1', authorEmail: 'owner@company.com', body: 'Great plan' },
    });
  });

  it('returns 400 when the comment body is blank', async () => {
    const req = makeRequest({ body: '   ' }, 'http://localhost/api/scenarios/sc-1/comments');
    const res = await POST(req, makeParams('sc-1'));

    expect(res.status).toBe(400);
    expect(mockPrisma.scenarioComment.create).not.toHaveBeenCalled();
  });

  it('returns 400 when the comment exceeds the length limit', async () => {
    const req = makeRequest({ body: 'x'.repeat(2001) }, 'http://localhost/api/scenarios/sc-1/comments');
    const res = await POST(req, makeParams('sc-1'));

    expect(res.status).toBe(400);
    expect(mockPrisma.scenarioComment.create).not.toHaveBeenCalled();
  });

  it('returns 404 when the scenario belongs to a different business (cross-tenant attack)', async () => {
    mockPrisma.scenario.findUnique.mockResolvedValue({ businessId: 'biz-not-mine' });
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const req = makeRequest({ body: 'Trying to inject a note' }, 'http://localhost/api/scenarios/sc-1/comments');
    const res = await POST(req, makeParams('sc-1'));

    expect(res.status).toBe(404);
    expect(mockPrisma.scenarioComment.create).not.toHaveBeenCalled();
  });
});
