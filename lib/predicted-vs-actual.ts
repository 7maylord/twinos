import { prisma } from './db';

// Every persisted scenario run uses the default 6-month horizon (see
// app/api/scenarios/run/route.ts — horizon is never passed through), so a
// SimulationResult's final projected period always targets ~6 months after
// generatedAt. This is the only reliable target date available: the monthly
// labels in monthlyDataJson ('Jan', 'Feb', ...) are generic seasonal-curve
// positions, not real calendar dates.
const PREDICTION_HORIZON_MONTHS = 6;

// Called after an integration sync refreshes a business's financials. Finds
// any of that business's simulation runs whose 6-month target date has
// passed and backfills what actually happened, so predicted-vs-actual can be
// shown on the results page. Idempotent — already-backfilled rows are
// excluded by the actualRevenue: null filter.
export async function backfillActuals(
  businessId: string,
  actualRevenue: number,
  actualProfit: number
): Promise<void> {
  const targetCutoff = new Date();
  targetCutoff.setMonth(targetCutoff.getMonth() - PREDICTION_HORIZON_MONTHS);

  await prisma.simulationResult.updateMany({
    where: {
      actualRevenue: null,
      generatedAt: { lte: targetCutoff },
      scenario: { businessId },
    },
    data: {
      actualRevenue,
      actualProfit,
      actualCapturedAt: new Date(),
    },
  });
}
