import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, makeRequest } from './helpers';

const { mockGetActiveBusiness, mockVerifyBusinessOwnership, mockGetActiveUserEmail, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockVerifyBusinessOwnership: vi.fn(),
  mockGetActiveUserEmail: vi.fn(),
  mockPrisma: {
    teamMember: { findMany: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), upsert: vi.fn() },
    invite: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), delete: vi.fn() },
    business: { findUnique: vi.fn() },
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
import { GET as PREVIEW_INVITE, POST as ACCEPT } from '@/app/api/team/accept/route';

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

describe('GET /api/team/accept (preview — safe, no side effects)', () => {
  it('returns the business name for a valid, unexpired, unaccepted token without mutating anything', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue({
      acceptedAt: null, expiresAt: new Date(Date.now() + 100000), business: { name: BUSINESS_A.name },
    });

    const res = await PREVIEW_INVITE(new Request('http://localhost/api/team/accept?token=tok-1'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.businessName).toBe(BUSINESS_A.name);
    expect(mockPrisma.invite.updateMany).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown token', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue(null);

    const res = await PREVIEW_INVITE(new Request('http://localhost/api/team/accept?token=bogus'));

    expect(res.status).toBe(404);
  });

  it('returns 410 for an already-accepted token', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue({
      acceptedAt: new Date(), expiresAt: new Date(Date.now() + 100000), business: { name: BUSINESS_A.name },
    });

    const res = await PREVIEW_INVITE(new Request('http://localhost/api/team/accept?token=tok-1'));

    expect(res.status).toBe(410);
  });

  it('returns 410 for an expired token', async () => {
    mockPrisma.invite.findUnique.mockResolvedValue({
      acceptedAt: null, expiresAt: new Date(Date.now() - 1000), business: { name: BUSINESS_A.name },
    });

    const res = await PREVIEW_INVITE(new Request('http://localhost/api/team/accept?token=tok-1'));

    expect(res.status).toBe(410);
  });
});

describe('POST /api/team/accept', () => {
  it('grants viewer access for a valid, unexpired, unaccepted token by atomically claiming it first', async () => {
    mockPrisma.invite.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.invite.findUnique.mockResolvedValue({
      businessId: BUSINESS_A.id, role: 'viewer', business: { name: BUSINESS_A.name, owner: { email: 'owner@company.com' } },
    });
    mockGetActiveUserEmail.mockResolvedValue('newviewer@company.com');

    const res = await ACCEPT(makeRequest({ token: 'tok-1' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.businessId).toBe(BUSINESS_A.id);
    // The claim (WHERE token AND acceptedAt IS NULL AND expiresAt > now) must
    // happen before any TeamMember is created — that ordering is what makes
    // concurrent accepts of the same single-use token safe.
    expect(mockPrisma.invite.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ token: 'tok-1', acceptedAt: null }) })
    );
    expect(mockPrisma.teamMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { businessId_email: { businessId: BUSINESS_A.id, email: 'newviewer@company.com' } },
      })
    );
  });

  it('rejects a second concurrent accept of the same token (race-condition regression guard)', async () => {
    // Simulates two requests racing for the same single-use token: only one
    // atomic updateMany can ever match and flip acceptedAt, so the loser
    // must see count: 0 and be rejected, never reaching teamMember.upsert.
    mockPrisma.invite.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.invite.findUnique.mockResolvedValue({
      acceptedAt: new Date(), acceptedByEmail: 'first-viewer@company.com', expiresAt: new Date(Date.now() + 100000),
    });
    mockGetActiveUserEmail.mockResolvedValue('second-viewer@company.com');

    const res = await ACCEPT(makeRequest({ token: 'tok-1' }));

    expect(res.status).toBe(410);
    expect(mockPrisma.teamMember.upsert).not.toHaveBeenCalled();
  });

  it('treats a duplicate request from the same caller who already claimed it as success, not a conflict', async () => {
    mockPrisma.invite.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.invite.findUnique.mockResolvedValue({
      businessId: BUSINESS_A.id, role: 'viewer', acceptedAt: new Date(), acceptedByEmail: 'newviewer@company.com',
      expiresAt: new Date(Date.now() + 100000), business: { name: BUSINESS_A.name, owner: { email: 'owner@company.com' } },
    });
    mockGetActiveUserEmail.mockResolvedValue('newviewer@company.com');

    const res = await ACCEPT(makeRequest({ token: 'tok-1' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.businessId).toBe(BUSINESS_A.id);
  });

  it('rejects an unknown token', async () => {
    mockPrisma.invite.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.invite.findUnique.mockResolvedValue(null);

    const res = await ACCEPT(makeRequest({ token: 'bogus' }));

    expect(res.status).toBe(404);
    expect(mockPrisma.teamMember.upsert).not.toHaveBeenCalled();
  });

  it('rejects an expired token', async () => {
    mockPrisma.invite.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.invite.findUnique.mockResolvedValue({
      acceptedAt: null, acceptedByEmail: null, expiresAt: new Date(Date.now() - 1000),
    });
    mockGetActiveUserEmail.mockResolvedValue('someone@company.com');

    const res = await ACCEPT(makeRequest({ token: 'tok-1' }));

    expect(res.status).toBe(410);
    expect(mockPrisma.teamMember.upsert).not.toHaveBeenCalled();
  });

  it('does not create a TeamMember row when the accepting caller is already the owner', async () => {
    mockPrisma.invite.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.invite.findUnique.mockResolvedValue({
      businessId: BUSINESS_A.id, role: 'viewer', business: { name: BUSINESS_A.name, owner: { email: 'owner@company.com' } },
    });
    mockGetActiveUserEmail.mockResolvedValue('owner@company.com');

    const res = await ACCEPT(makeRequest({ token: 'tok-1' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.alreadyOwner).toBe(true);
    expect(mockPrisma.teamMember.upsert).not.toHaveBeenCalled();
  });
});
