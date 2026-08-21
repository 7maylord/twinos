import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, makeRequest } from './helpers';

const { mockGetActiveBusiness, mockVerifyBusinessOwnership, mockGetActiveUserEmail, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockVerifyBusinessOwnership: vi.fn(),
  mockGetActiveUserEmail: vi.fn(),
  mockPrisma: {
    teamMember: { findMany: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), upsert: vi.fn() },
    invite: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    business: { findUnique: vi.fn() },
    $transaction: vi.fn((ops: any[]) => Promise.all(ops)),
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  getActiveBusiness: mockGetActiveBusiness,
  verifyBusinessOwnership: mockVerifyBusinessOwnership,
  getActiveUserEmail: mockGetActiveUserEmail,
}));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { GET, POST } from '@/app/api/team/route';
import { DELETE as DELETE_MEMBER } from '@/app/api/team/[memberId]/route';
import { DELETE as DELETE_INVITE } from '@/app/api/team/invite/[inviteId]/route';
import { POST as ACCEPT } from '@/app/api/team/accept/route';

function makeMemberParams(memberId: string) {
  return { params: Promise.resolve({ memberId }) };
}
function makeInviteParams(inviteId: string) {
  return { params: Promise.resolve({ inviteId }) };
}

beforeEach(() => vi.clearAllMocks());

describe('GET /api/team', () => {
  it('lists members and pending invites for the active business (owner-only)', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.teamMember.findMany.mockResolvedValue([{ id: 'tm-1', email: 'viewer@company.com' }]);
    mockPrisma.invite.findMany.mockResolvedValue([{ id: 'inv-1', token: 'tok-1' }]);

    const res = await GET(new Request('http://localhost/api/team'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.members).toHaveLength(1);
    expect(data.invites).toHaveLength(1);
  });

  it('returns 404 for a businessId the caller does not own (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const res = await GET(new Request('http://localhost/api/team?businessId=biz-not-mine'));

    expect(res.status).toBe(404);
    expect(mockPrisma.teamMember.findMany).not.toHaveBeenCalled();
  });
});

describe('POST /api/team (create invite)', () => {
  it('creates an invite scoped to the active business with a future expiry', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.invite.create.mockResolvedValue({ id: 'inv-1', token: 'tok-1', businessId: BUSINESS_A.id });

    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.token).toBe('tok-1');
    const createCall = mockPrisma.invite.create.mock.calls[0][0];
    expect(createCall.data.businessId).toBe(BUSINESS_A.id);
    expect(createCall.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('returns 404 for a businessId the caller does not own (cross-tenant attack)', async () => {
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const res = await POST(makeRequest({ businessId: 'biz-not-mine' }));

    expect(res.status).toBe(404);
    expect(mockPrisma.invite.create).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/team/:memberId', () => {
  it('removes a team member belonging to a business the caller owns', async () => {
    mockPrisma.teamMember.findUnique.mockResolvedValue({ id: 'tm-1', businessId: BUSINESS_A.id });
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.teamMember.delete.mockResolvedValue({ id: 'tm-1' });

    const res = await DELETE_MEMBER(new Request('http://localhost/api/team/tm-1', { method: 'DELETE' }), makeMemberParams('tm-1'));

    expect(res.status).toBe(200);
    expect(mockPrisma.teamMember.delete).toHaveBeenCalledWith({ where: { id: 'tm-1' } });
  });

  it('returns 404 when the member belongs to a business the caller does not own (cross-tenant attack)', async () => {
    mockPrisma.teamMember.findUnique.mockResolvedValue({ id: 'tm-1', businessId: 'biz-not-mine' });
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const res = await DELETE_MEMBER(new Request('http://localhost/api/team/tm-1', { method: 'DELETE' }), makeMemberParams('tm-1'));

    expect(res.status).toBe(404);
    expect(mockPrisma.teamMember.delete).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/team/invite/:inviteId', () => {
  it('revokes a pending invite belonging to a business the caller owns', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue({ id: 'inv-1', businessId: BUSINESS_A.id });
    mockVerifyBusinessOwnership.mockResolvedValue(true);
    mockPrisma.invite.delete.mockResolvedValue({ id: 'inv-1' });

    const res = await DELETE_INVITE(new Request('http://localhost/api/team/invite/inv-1', { method: 'DELETE' }), makeInviteParams('inv-1'));

    expect(res.status).toBe(200);
    expect(mockPrisma.invite.delete).toHaveBeenCalledWith({ where: { id: 'inv-1' } });
  });

  it('returns 404 when the invite belongs to a business the caller does not own (cross-tenant attack)', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue({ id: 'inv-1', businessId: 'biz-not-mine' });
    mockVerifyBusinessOwnership.mockResolvedValue(false);

    const res = await DELETE_INVITE(new Request('http://localhost/api/team/invite/inv-1', { method: 'DELETE' }), makeInviteParams('inv-1'));

    expect(res.status).toBe(404);
    expect(mockPrisma.invite.delete).not.toHaveBeenCalled();
  });
});

describe('POST /api/team/accept', () => {
  it('grants viewer access for a valid, unexpired, unaccepted token', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60);
    mockPrisma.invite.findUnique.mockResolvedValue({
      id: 'inv-1', businessId: BUSINESS_A.id, token: 'tok-1', role: 'viewer', acceptedAt: null, expiresAt: futureDate,
    });
    mockPrisma.business.findUnique.mockResolvedValue({ name: BUSINESS_A.name, owner: { email: 'owner@company.com' } });
    mockGetActiveUserEmail.mockResolvedValue('newviewer@company.com');

    const res = await ACCEPT(makeRequest({ token: 'tok-1' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.businessId).toBe(BUSINESS_A.id);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('rejects an unknown token', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue(null);

    const res = await ACCEPT(makeRequest({ token: 'bogus' }));

    expect(res.status).toBe(404);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects an already-accepted token (single-use)', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue({
      id: 'inv-1', businessId: BUSINESS_A.id, token: 'tok-1', acceptedAt: new Date(), expiresAt: new Date(Date.now() + 100000),
    });

    const res = await ACCEPT(makeRequest({ token: 'tok-1' }));

    expect(res.status).toBe(410);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects an expired token', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue({
      id: 'inv-1', businessId: BUSINESS_A.id, token: 'tok-1', acceptedAt: null, expiresAt: new Date(Date.now() - 1000),
    });

    const res = await ACCEPT(makeRequest({ token: 'tok-1' }));

    expect(res.status).toBe(410);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('does not create a TeamMember row when the accepting caller is already the owner', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue({
      id: 'inv-1', businessId: BUSINESS_A.id, token: 'tok-1', acceptedAt: null, expiresAt: new Date(Date.now() + 100000),
    });
    mockPrisma.business.findUnique.mockResolvedValue({ name: BUSINESS_A.name, owner: { email: 'owner@company.com' } });
    mockGetActiveUserEmail.mockResolvedValue('owner@company.com');

    const res = await ACCEPT(makeRequest({ token: 'tok-1' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.alreadyOwner).toBe(true);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});
