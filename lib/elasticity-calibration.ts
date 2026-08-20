import { prisma } from './db';

// Calibrates price elasticity from a business's own predicted-vs-actual
// history (lib/predicted-vs-actual.ts) instead of the static industry
// default (lib/industry-profiles.ts) — the single best signal available,
// since it's what this specific business's customers actually did, not an
// industry-wide guess. Requires no new schema: every data point comes from
// SimulationResult rows already backfilled with real synced revenue.
//
// Math (first-order approximation, not a precision estimate — see below):
// the engine models revenueMultiplier = (1 + p/100) * (1 - (p/100)*E + m) * s
// where p = priceIncrease, E = elasticity, m = marketing demand impact, s =
// seasonal factor. Dropping the p^2 term (valid for the 0-50% price range
// this app allows) and assuming unchanged marketing (m=0) — which holds for
// most historical runs and is the honest limit of what a v1 can control
// for — this linearizes to:
//   revenueMultiplier - 1 ~= (p/100) * (1 - E)
// So an ordinary-least-squares fit of (p, revenueMultiplier) pairs gives a
// slope beta ~= (1-E)/100, and E ~= 1 - beta*100. This is a first-order
// approximation, not a precise elasticity estimate — it directionally
// reflects what happened, using the same model shape the engine already
// uses, but doesn't control for confounds (marketing changes, headcount
// changes, macro conditions) between when a scenario ran and when its
// actual was captured.
export interface CalibrationDataPoint {
  priceIncrease: number;
  revenueMultiplier: number; // actualRevenue / thatPeriod'sPredictedBaselineRevenue
}

export interface CalibrationResult {
  priceElasticityCoefficient: number;
  sampleSize: number;
}

const MIN_SAMPLE_SIZE = 2;
const MIN_PRICE_SPREAD = 1; // need at least 1 percentage point of variation to fit a slope

export function calibratePriceElasticity(points: CalibrationDataPoint[]): CalibrationResult | null {
  if (points.length < MIN_SAMPLE_SIZE) return null;

  const n = points.length;
  const meanP = points.reduce((sum, pt) => sum + pt.priceIncrease, 0) / n;
  const meanR = points.reduce((sum, pt) => sum + pt.revenueMultiplier, 0) / n;

  const spread = Math.max(...points.map((pt) => pt.priceIncrease)) - Math.min(...points.map((pt) => pt.priceIncrease));
  if (spread < MIN_PRICE_SPREAD) return null; // all runs used ~the same price increase — no slope to fit

  let covariance = 0;
  let variance = 0;
  for (const pt of points) {
    const dp = pt.priceIncrease - meanP;
    covariance += dp * (pt.revenueMultiplier - meanR);
    variance += dp * dp;
  }
  if (variance === 0) return null;

  const beta = covariance / variance; // slope: d(revenueMultiplier) / d(priceIncrease)
  const impliedElasticity = 1 - beta * 100;

  return {
    priceElasticityCoefficient: Math.min(2, Math.max(0, impliedElasticity)),
    sampleSize: n,
  };
}

// Extracts calibration data points from a business's own scenario history.
// Only scenarios with a backfilled actualRevenue (predicted-vs-actual has
// run its course — see lib/predicted-vs-actual.ts) carry real information;
// everything else is excluded. Scenarios with an explicit
// priceElasticityOverride are excluded too — they're not a genuine market
// response to price, they're the model being told what to assume.
export function extractCalibrationDataPoints(
  scenarios: {
    priceIncrease: number;
    priceElasticityOverride: number | null;
    simulationResults: { actualRevenue: number | null; monthlyDataJson: string }[];
  }[]
): CalibrationDataPoint[] {
  const points: CalibrationDataPoint[] = [];

  for (const scenario of scenarios) {
    if (scenario.priceElasticityOverride != null) continue;
    const result = scenario.simulationResults[0];
    if (!result || result.actualRevenue == null) continue;

    let monthlyData: { baselineRevenue: number }[];
    try {
      monthlyData = JSON.parse(result.monthlyDataJson);
    } catch {
      continue;
    }
    const finalPeriod = monthlyData[monthlyData.length - 1];
    if (!finalPeriod || !finalPeriod.baselineRevenue) continue;

    points.push({
      priceIncrease: scenario.priceIncrease,
      revenueMultiplier: result.actualRevenue / finalPeriod.baselineRevenue,
    });
  }

  return points;
}

// excludeScenarioId keeps a scenario being (re-)run from calibrating against
// its own not-yet-final outcome.
export async function getCalibratedElasticityForBusiness(
  businessId: string,
  excludeScenarioId?: string
): Promise<CalibrationResult | null> {
  const scenarios = await prisma.scenario.findMany({
    where: { businessId, ...(excludeScenarioId ? { id: { not: excludeScenarioId } } : {}) },
    select: {
      priceIncrease: true,
      priceElasticityOverride: true,
      simulationResults: {
        orderBy: { generatedAt: 'desc' },
        take: 1,
        select: { actualRevenue: true, monthlyDataJson: true },
      },
    },
  });

  return calibratePriceElasticity(extractCalibrationDataPoints(scenarios));
}
