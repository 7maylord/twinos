import { describe, it, expect } from 'vitest';
import { projectCashFlow, DEFAULT_CASH_CUSHION_FRACTION_OF_REVENUE } from '@/lib/cashflow-engine';

const FLAT_MONTHLY_DATA = [
  { month: 'Jan', projectedRevenue: 100000, projectedProfit: 20000 },
  { month: 'Feb', projectedRevenue: 100000, projectedProfit: 20000 },
  { month: 'Mar', projectedRevenue: 100000, projectedProfit: 20000 },
];

describe('projectCashFlow', () => {
  it('uses a documented default cash cushion when none is provided', () => {
    const result = projectCashFlow({ baselineRevenue: 100000 }, FLAT_MONTHLY_DATA);
    expect(result.startingCashOnHand).toBe(100000 * DEFAULT_CASH_CUSHION_FRACTION_OF_REVENUE);
  });

  it('respects an explicit cashOnHand override over the default heuristic', () => {
    const result = projectCashFlow({ baselineRevenue: 100000, cashOnHand: 75000 }, FLAT_MONTHLY_DATA);
    expect(result.startingCashOnHand).toBe(75000);
  });

  it('produces one output row per input month, in order', () => {
    const result = projectCashFlow({ baselineRevenue: 100000 }, FLAT_MONTHLY_DATA);
    expect(result.months.map((m) => m.month)).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('reports no runway concern (null) when cash flow is flat/positive', () => {
    const result = projectCashFlow({ baselineRevenue: 100000, averageReceivableDays: 30, averagePayableDays: 30 }, FLAT_MONTHLY_DATA);
    expect(result.months[result.months.length - 1].netCashFlow).toBeGreaterThanOrEqual(0);
    expect(result.monthsOfRunwayAtCurrentBurn).toBeNull();
  });

  it('computes finite runway months when the business is burning cash but still solvent', () => {
    const burningData = [
      { month: 'Jan', projectedRevenue: 50000, projectedProfit: -30000 },
      { month: 'Feb', projectedRevenue: 50000, projectedProfit: -30000 },
    ];
    // Enough starting cash that the business hasn't run out by the end of
    // the projection window — a meaningful "months remaining" estimate.
    const result = projectCashFlow({ baselineRevenue: 50000, cashOnHand: 200000 }, burningData);
    expect(result.monthsOfRunwayAtCurrentBurn).not.toBeNull();
    expect(result.monthsOfRunwayAtCurrentBurn!).toBeGreaterThan(0);
  });

  it('reports zero runway once projected cash on hand has already gone negative', () => {
    const burningData = [
      { month: 'Jan', projectedRevenue: 50000, projectedProfit: -30000 },
      { month: 'Feb', projectedRevenue: 50000, projectedProfit: -30000 },
    ];
    const result = projectCashFlow({ baselineRevenue: 50000, cashOnHand: 40000 }, burningData);
    expect(result.months[result.months.length - 1].cashOnHand).toBeLessThan(0);
    expect(result.monthsOfRunwayAtCurrentBurn).toBe(0);
  });

  it('a longer receivable lag delays cash collection relative to a shorter one', () => {
    const rampingRevenue = [
      { month: 'Jan', projectedRevenue: 50000, projectedProfit: 10000 },
      { month: 'Feb', projectedRevenue: 150000, projectedProfit: 30000 },
    ];
    const fastCollection = projectCashFlow({ baselineRevenue: 50000, averageReceivableDays: 0 }, rampingRevenue);
    const slowCollection = projectCashFlow({ baselineRevenue: 50000, averageReceivableDays: 30 }, rampingRevenue);

    // With 0-day receivables, Feb's cash-in is fully this month's revenue (150000).
    // With 30-day receivables, some of Feb's cash-in is still last month's smaller revenue.
    expect(fastCollection.months[1].cashIn).toBeGreaterThan(slowCollection.months[1].cashIn);
  });

  it('minCashOnHand finds the lowest point across the whole projection, not just the end', () => {
    const dipThenRecover = [
      { month: 'Jan', projectedRevenue: 100000, projectedProfit: -80000 }, // big dip
      { month: 'Feb', projectedRevenue: 100000, projectedProfit: 50000 }, // recovers
    ];
    const result = projectCashFlow({ baselineRevenue: 100000, cashOnHand: 50000, averageReceivableDays: 0, averagePayableDays: 0 }, dipThenRecover);
    expect(result.minCashOnHand).toBeLessThan(result.months[result.months.length - 1].cashOnHand);
  });
});
