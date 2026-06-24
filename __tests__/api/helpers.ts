// Shared test fixtures and request factory for API route tests.

export const BUSINESS_A = {
  id: 'biz-aaa',
  name: 'Acme Tech',
  baselineRevenue: 500000,
  baselineMarketing: 30000,
  baselineInventory: 50000,
  baselineFixedCosts: 40000,
  employees: [
    { id: 'emp-1', businessId: 'biz-aaa', name: 'Alice', role: 'Engineer', salary: 8000, department: 'Eng' },
    { id: 'emp-2', businessId: 'biz-aaa', name: 'Bob', role: 'Designer', salary: 6000, department: 'Design' },
  ],
  products: [
    { id: 'prod-1', businessId: 'biz-aaa', name: 'Widget', price: 99, cost: 30 },
  ],
  qboCompanyId: null,
  shopifyStoreDomain: null,
  shopifyAccessToken: null,
  squareAccessToken: null,
  squareLocationId: null,
  squareTokenExpiresAt: null,
};

export const BUSINESS_B = {
  id: 'biz-bbb',
  name: 'Halo Café',
  baselineRevenue: 180000,
  baselineMarketing: 25000,
  baselineInventory: 40000,
  baselineFixedCosts: 30000,
  employees: [],
  products: [],
  qboCompanyId: null,
  shopifyStoreDomain: null,
  shopifyAccessToken: null,
  squareAccessToken: null,
  squareLocationId: null,
  squareTokenExpiresAt: null,
};

export function makeRequest(body?: unknown, url = 'http://localhost/api/test'): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function makeDeleteRequest(id: string, path: string): Request {
  return new Request(`http://localhost${path}?id=${id}`, { method: 'DELETE' });
}
