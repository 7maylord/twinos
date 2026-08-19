import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BUSINESS_A, makeRequest } from './helpers';

const { mockGetActiveBusiness } = vi.hoisted(() => ({
  mockGetActiveBusiness: vi.fn(),
}));

vi.mock('@/lib/auth-helpers', () => ({ getActiveBusiness: mockGetActiveBusiness }));

import { POST } from '@/app/api/scenarios/parse-intent/route';

function geminiResponse(json: any) {
  return {
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(json) }] } }] }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('GEMINI_API_KEY', 'test-key-123');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('POST /api/scenarios/parse-intent', () => {
  it('returns 501 when GEMINI_API_KEY is not configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');

    const req = makeRequest({ text: 'raise prices 10%' });
    const res = await POST(req);

    expect(res.status).toBe(501);
  });

  it('returns 400 when text is missing', async () => {
    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when text exceeds the length limit', async () => {
    const req = makeRequest({ text: 'x'.repeat(501) });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 404 when there is no active business', async () => {
    mockGetActiveBusiness.mockResolvedValue(null);

    const req = makeRequest({ text: 'raise prices 10%' });
    const res = await POST(req);

    expect(res.status).toBe(404);
  });

  it('parses and returns a well-formed AI response as-is', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      geminiResponse({ scenarioName: 'Holiday Hiring Push', priceIncrease: 8, employeeCount: 15, marketingBudget: 20000, supplierDelay: 'minor' })
    ));

    const req = makeRequest({ text: 'hire a few more people for the holidays and raise prices 8%' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      scenarioName: 'Holiday Hiring Push',
      priceIncrease: 8,
      employeeCount: 15,
      marketingBudget: 20000,
      supplierDelay: 'minor',
    });
  });

  it('clamps out-of-range values to the same bounds the manual sliders enforce', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      geminiResponse({ scenarioName: 'Aggressive Plan', priceIncrease: 500, employeeCount: 1, marketingBudget: -50000, supplierDelay: 'catastrophic' })
    ));

    const req = makeRequest({ text: 'go all in' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.priceIncrease).toBe(50); // clamped to max
    expect(data.employeeCount).toBe(5); // clamped to min
    expect(data.marketingBudget).toBe(0); // clamped to min
    expect(data.supplierDelay).toBe('none'); // invalid enum falls back to none
  });

  it('falls back to the business baseline for fields the AI omits', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(geminiResponse({})));

    const req = makeRequest({ text: 'do something' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.employeeCount).toBe(BUSINESS_A.employees.length);
    expect(data.marketingBudget).toBe(BUSINESS_A.baselineMarketing);
    expect(data.supplierDelay).toBe('none');
    expect(data.scenarioName).toBe('AI-Suggested Scenario');
  });

  it('returns 502 when the Gemini API call fails', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, text: async () => 'quota exceeded' }));

    const req = makeRequest({ text: 'raise prices' });
    const res = await POST(req);

    expect(res.status).toBe(502);
  });

  it('returns 502 when Gemini returns unparseable content', async () => {
    mockGetActiveBusiness.mockResolvedValue(BUSINESS_A);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'not valid json' }] } }] }),
    }));

    const req = makeRequest({ text: 'raise prices' });
    const res = await POST(req);

    expect(res.status).toBe(502);
  });
});
