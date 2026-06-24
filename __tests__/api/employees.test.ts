import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, BUSINESS_B, makeRequest, makeDeleteRequest } from './helpers';

const { mockGetActiveBusiness, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockPrisma: {
    employee: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({ getActiveBusiness: mockGetActiveBusiness }));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { POST, PUT, DELETE } from '@/app/api/employees/route';

beforeEach(() => vi.clearAllMocks());

// --------------- POST ---------------

describe('POST /api/employees', () => {
  it('creates an employee scoped to the active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.employee.create.mockResolvedValue({
      id: 'emp-new', businessId: BUSINESS_A.id, name: 'Carol', role: 'PM', salary: 7000, department: null,
    });

    const req = makeRequest({ name: 'Carol', role: 'PM', salary: 7000 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe('Carol');
    expect(mockPrisma.employee.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ businessId: BUSINESS_A.id }) })
    );
  });

  it('returns 400 when name is missing', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);

    const req = makeRequest({ role: 'PM', salary: 5000 });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(mockPrisma.employee.create).not.toHaveBeenCalled();
  });

  it('returns 400 when no active business exists', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeRequest({ name: 'Carol', role: 'PM', salary: 7000 });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('bulk-creates employees from an array', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.employee.create.mockResolvedValue({ id: 'emp-x' });

    const req = makeRequest([
      { name: 'Dave', role: 'Dev', salary: 6500 },
      { name: 'Eve', role: 'QA', salary: 5500 },
    ]);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.count).toBe(2);
    expect(mockPrisma.employee.create).toHaveBeenCalledTimes(2);
  });
});

// --------------- PUT ---------------

describe('PUT /api/employees', () => {
  it('updates an employee belonging to the active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.employee.findUnique.mockResolvedValue(BUSINESS_A.employees[0]);
    mockPrisma.employee.update.mockResolvedValue({ ...BUSINESS_A.employees[0], salary: 9000 });

    const req = makeRequest({ id: 'emp-1', salary: 9000 });
    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.salary).toBe(9000);
    expect(mockPrisma.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'emp-1' } })
    );
  });

  it('returns 404 when employee belongs to a different business (cross-tenant attack)', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.employee.findUnique.mockResolvedValue({ id: 'emp-other', businessId: BUSINESS_B.id });

    const req = makeRequest({ id: 'emp-other', salary: 9000 });
    const res = await PUT(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.employee.update).not.toHaveBeenCalled();
  });

  it('returns 401 when no active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeRequest({ id: 'emp-1', salary: 9000 });
    const res = await PUT(req);

    expect(res.status).toBe(401);
    expect(mockPrisma.employee.update).not.toHaveBeenCalled();
  });

  it('returns 400 when id is missing', async () => {
    const req = makeRequest({ salary: 9000 });
    const res = await PUT(req);

    expect(res.status).toBe(400);
  });
});

// --------------- DELETE ---------------

describe('DELETE /api/employees', () => {
  it('deletes an employee belonging to the active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.employee.findUnique.mockResolvedValue(BUSINESS_A.employees[0]);
    mockPrisma.employee.delete.mockResolvedValue(BUSINESS_A.employees[0]);

    const req = makeDeleteRequest('emp-1', '/api/employees');
    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.employee.delete).toHaveBeenCalledWith({ where: { id: 'emp-1' } });
  });

  it('returns 404 when employee belongs to a different business (cross-tenant attack)', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.employee.findUnique.mockResolvedValue({ id: 'emp-other', businessId: BUSINESS_B.id });

    const req = makeDeleteRequest('emp-other', '/api/employees');
    const res = await DELETE(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.employee.delete).not.toHaveBeenCalled();
  });

  it('returns 401 when no active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeDeleteRequest('emp-1', '/api/employees');
    const res = await DELETE(req);

    expect(res.status).toBe(401);
    expect(mockPrisma.employee.delete).not.toHaveBeenCalled();
  });

  it('returns 404 when employee does not exist at all', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.employee.findUnique.mockResolvedValue(null);

    const req = makeDeleteRequest('emp-ghost', '/api/employees');
    const res = await DELETE(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.employee.delete).not.toHaveBeenCalled();
  });

  it('returns 400 when id query param is missing', async () => {
    const req = new Request('http://localhost/api/employees', { method: 'DELETE' });
    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });
});
