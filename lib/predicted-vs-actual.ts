import { prisma } from './db';

// Every persisted scenario run uses the default 6-month horizon (see
// app/api/scenarios/run/route.ts — horizon is never passed through), so a
// SimulationResult's final projected period always targets ~6 months after
// generatedAt. This is the only reliable target date available: the monthly
// labels in monthlyDataJson ('Jan', 'Feb', ...) are generic seasonal-curve
// positions, not real calendar dates.
export const PREDICTION_HORIZON_MONTHS = 6;

// Alert when actual revenue diverges from the prediction by more than this,
// in either direction — a big miss either way is worth surfacing.
const DRIFT_THRESHOLD_PCT = 20;

// Called after an integration sync refreshes a business's financials. Finds
// any of that business's simulation runs whose 6-month target date has
// passed and backfills what actually happened, so predicted-vs-actual can be
// shown on the results page. Idempotent — already-backfilled rows are
// excluded by the actualRevenue: null filter. Immediately raises a "drift"
// notification for any run whose actual outcome missed the prediction by
// more than DRIFT_THRESHOLD_PCT — this is the event-driven half of drift
// watch; app/api/cron/check-stale-predictions is the scheduled half (nudges
// syncing when a window lapses with nothing to compare yet).
export async function backfillActuals(
  businessId: string,
  actualRevenue: number,
  actualProfit: number
): Promise<void> {
  const targetCutoff = new Date();
  targetCutoff.setMonth(targetCutoff.getMonth() - PREDICTION_HORIZON_MONTHS);

  const pending = await prisma.simulationResult.findMany({
    where: {
      actualRevenue: null,
      generatedAt: { lte: targetCutoff },
      scenario: { businessId },
    },
    include: { scenario: { select: { id: true, name: true } } },
  });

  for (const result of pending) {
    await prisma.simulationResult.update({
      where: { id: result.id },
      data: { actualRevenue, actualProfit, actualCapturedAt: new Date() },
    });

    if (result.projectedRevenue === 0) continue;
    const errorPct = (Math.abs(actualRevenue - result.projectedRevenue) / Math.abs(result.projectedRevenue)) * 100;
    if (errorPct <= DRIFT_THRESHOLD_PCT) continue;

    const direction = actualRevenue > result.projectedRevenue ? 'higher' : 'lower';
    await prisma.notification.create({
      data: {
        businessId,
        scenarioId: result.scenario.id,
        type: 'drift',
        severity: 'warning',
        title: `"${result.scenario.name}" diverged from plan`,
        message: `Actual revenue ($${Math.round(actualRevenue).toLocaleString()}) came in ${errorPct.toFixed(0)}% ${direction} than predicted ($${Math.round(result.projectedRevenue).toLocaleString()}).`,
      },
    });
  }
}
