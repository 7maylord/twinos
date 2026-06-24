import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BUSINESS_A, BUSINESS_B, makeRequest, makeDeleteRequest } from './helpers';

const { mockGetActiveBusiness, mockPrisma } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
  mockPrisma: {
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({ getActiveBusiness: mockGetActiveBusiness }));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma }));

import { POST, PUT, DELETE } from '@/app/api/products/route';

beforeEach(() => vi.clearAllMocks());

// --------------- POST ---------------

describe('POST /api/products', () => {
  it('creates a product scoped to the active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.product.create.mockResolvedValue({
      id: 'prod-new', businessId: BUSINESS_A.id, name: 'Gadget', price: 199, cost: 60,
    });

    const req = makeRequest({ name: 'Gadget', price: 199, cost: 60 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe('Gadget');
    expect(mockPrisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ businessId: BUSINESS_A.id }) })
    );
  });

  it('returns 400 when name is missing', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);

    const req = makeRequest({ price: 10, cost: 3 });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(mockPrisma.product.create).not.toHaveBeenCalled();
  });

  it('returns 400 when no active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeRequest({ name: 'Gadget', price: 199, cost: 60 });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('bulk-creates products from an array', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.product.create.mockResolvedValue({ id: 'prod-x' });

    const req = makeRequest([
      { name: 'A', price: 10, cost: 3 },
      { name: 'B', price: 20, cost: 5 },
    ]);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.count).toBe(2);
  });
});

// --------------- PUT ---------------

describe('PUT /api/products', () => {
  it('updates a product belonging to the active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.product.findUnique.mockResolvedValue(BUSINESS_A.products[0]);
    mockPrisma.product.update.mockResolvedValue({ ...BUSINESS_A.products[0], price: 149 });

    const req = makeRequest({ id: 'prod-1', price: 149 });
    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.price).toBe(149);
  });

  it('returns 404 when product belongs to a different business (cross-tenant attack)', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod-other', businessId: BUSINESS_B.id });

    const req = makeRequest({ id: 'prod-other', price: 999 });
    const res = await PUT(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.product.update).not.toHaveBeenCalled();
  });

  it('returns 401 when no active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeRequest({ id: 'prod-1', price: 149 });
    const res = await PUT(req);

    expect(res.status).toBe(401);
    expect(mockPrisma.product.update).not.toHaveBeenCalled();
  });

  it('returns 400 when id is missing', async () => {
    const req = makeRequest({ price: 149 });
    const res = await PUT(req);

    expect(res.status).toBe(400);
  });
});

// --------------- DELETE ---------------

describe('DELETE /api/products', () => {
  it('deletes a product belonging to the active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.product.findUnique.mockResolvedValue(BUSINESS_A.products[0]);
    mockPrisma.product.delete.mockResolvedValue(BUSINESS_A.products[0]);

    const req = makeDeleteRequest('prod-1', '/api/products');
    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('returns 404 when product belongs to a different business (cross-tenant attack)', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod-other', businessId: BUSINESS_B.id });

    const req = makeDeleteRequest('prod-other', '/api/products');
    const res = await DELETE(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.product.delete).not.toHaveBeenCalled();
  });

  it('returns 401 when no active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeDeleteRequest('prod-1', '/api/products');
    const res = await DELETE(req);

    expect(res.status).toBe(401);
    expect(mockPrisma.product.delete).not.toHaveBeenCalled();
  });

  it('returns 404 when product does not exist', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const req = makeDeleteRequest('prod-ghost', '/api/products');
    const res = await DELETE(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.product.delete).not.toHaveBeenCalled();
  });

  it('returns 400 when id param is missing', async () => {
    const req = new Request('http://localhost/api/products', { method: 'DELETE' });
    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });
});
