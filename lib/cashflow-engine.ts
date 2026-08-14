// Cash-flow/runway projection: revenue and profit are accrual figures — they
// say nothing about *when* cash actually moves. A business can be profitable
// on paper and still run out of cash because customers pay late while bills
// come due sooner. This module estimates that timing gap.
//
// ponytail: there's no per-business input UI for these assumptions yet (the
// settings page doesn't even expose editing the existing baseline financials,
// so adding one just for this would be a bigger feature than warranted here).
// Defaults below are documented, reasonable industry-agnostic assumptions —
// add Business.cashOnHand/averageReceivableDays/averagePayableDays columns +
// a settings editor when real per-business customization is needed; this
// module already accepts overrides so that's a pure additive change later.
export const DEFAULT_AVERAGE_RECEIVABLE_DAYS = 30;
export const DEFAULT_AVERAGE_PAYABLE_DAYS = 15;
// Cash cushion default: half a month... actually half of *monthly* baseline
// revenue, a rough "how much buffer does a typical small business keep"
// heuristic — not a real balance, just a starting point for the projection.
export const DEFAULT_CASH_CUSHION_FRACTION_OF_REVENUE = 0.5;

export interface CashFlowBaseline {
  baselineRevenue: number;
  cashOnHand?: number;
  averageReceivableDays?: number;
  averagePayableDays?: number;
}

export interface CashFlowMonth {
  month: string;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  cashOnHand: number; // running balance at the end of this period
}

export interface CashFlowProjection {
  months: CashFlowMonth[];
  startingCashOnHand: number;
  minCashOnHand: number;
  // Months of runway at the most recent period's burn rate. Null when the
  // business isn't burning cash in that period (flat or positive cash flow).
  monthsOfRunwayAtCurrentBurn: number | null;
}

// Linear lag model, not a full accounts-receivable/payable subledger: each
// period's cash-in is a blend of that period's revenue and the prior
// period's (weighted by how much of the receivable window falls outside the
// period), and similarly cash-out lags expenses by the payable window. This
// captures the direction and rough magnitude of the timing gap without
// modeling individual invoices — upgrade to per-invoice aging if more
// precision is needed.
export function projectCashFlow(
  baseline: CashFlowBaseline,
  monthlyData: { month: string; projectedRevenue: number; projectedProfit: number }[]
): CashFlowProjection {
  const receivableDays = baseline.averageReceivableDays ?? DEFAULT_AVERAGE_RECEIVABLE_DAYS;
  const payableDays = baseline.averagePayableDays ?? DEFAULT_AVERAGE_PAYABLE_DAYS;
  const startingCashOnHand = baseline.cashOnHand ?? baseline.baselineRevenue * DEFAULT_CASH_CUSHION_FRACTION_OF_REVENUE;

  const receivableLagFraction = Math.min(1, receivableDays / 30);
  const payableLagFraction = Math.min(1, payableDays / 30);

  let runningCash = startingCashOnHand;
  const months: CashFlowMonth[] = monthlyData.map((m, i) => {
    const expenses = m.projectedRevenue - m.projectedProfit;
    const prev = i > 0 ? monthlyData[i - 1] : m;
    const prevExpenses = i > 0 ? prev.projectedRevenue - prev.projectedProfit : expenses;

    const cashIn = m.projectedRevenue * (1 - receivableLagFraction) + prev.projectedRevenue * receivableLagFraction;
    const cashOut = expenses * (1 - payableLagFraction) + prevExpenses * payableLagFraction;
    const netCashFlow = cashIn - cashOut;
    runningCash += netCashFlow;

    return {
      month: m.month,
      cashIn: Math.round(cashIn),
      cashOut: Math.round(cashOut),
      netCashFlow: Math.round(netCashFlow),
      cashOnHand: Math.round(runningCash),
    };
  });

  const minCashOnHand = Math.min(startingCashOnHand, ...months.map((m) => m.cashOnHand));

  const lastMonth = months[months.length - 1];
  const monthsOfRunwayAtCurrentBurn =
    lastMonth && lastMonth.netCashFlow < 0
      ? Math.max(0, lastMonth.cashOnHand / Math.abs(lastMonth.netCashFlow))
      : null;

  return {
    months,
    startingCashOnHand: Math.round(startingCashOnHand),
    minCashOnHand: Math.round(minCashOnHand),
    monthsOfRunwayAtCurrentBurn,
  };
}
