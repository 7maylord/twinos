import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PREDICTION_HORIZON_MONTHS } from '@/lib/predicted-vs-actual';

// Scheduled by vercel.json (see the `crons` entry) — Vercel invokes this on a
// schedule with no Clerk session, so it authenticates via a shared secret
// instead of the usual cookie-based auth (see proxy.ts, which deliberately
// excludes /api/cron routes from Clerk protection for the same reason).
// Nudges an owner to sync when a scenario's 6-month prediction window has
// lapsed with nothing to compare it against yet — distinct from the
// event-driven drift alert in lib/predicted-vs-actual.ts, which fires
// immediately when a sync *does* bring in fresh actuals.
export async function GET(request: Request) {
  try {
    if (process.env.CRON_SECRET) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      console.warn('[Cron] CRON_SECRET is not set — refusing to run unauthenticated.');
      return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
    }

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - PREDICTION_HORIZON_MONTHS);

    const stale = await prisma.simulationResult.findMany({
      where: {
        actualRevenue: null,
        generatedAt: { lte: cutoff },
      },
      include: { scenario: { select: { id: true, name: true, businessId: true } } },
    });

    let created = 0;
    for (const result of stale) {
      // At most one reminder per scenario — don't re-nag on every cron run.
      const alreadyReminded = await prisma.notification.findFirst({
        where: { scenarioId: result.scenario.id, type: 'reminder' },
        select: { id: true },
      });
      if (alreadyReminded) continue;

      await prisma.notification.create({
        data: {
          businessId: result.scenario.businessId,
          scenarioId: result.scenario.id,
          type: 'reminder',
          severity: 'info',
          title: `Time to check "${result.scenario.name}" against reality`,
          message: `It's been ${PREDICTION_HORIZON_MONTHS} months since this scenario was run. Sync QuickBooks to see how the prediction held up.`,
        },
      });
      created++;
    }

    return NextResponse.json({ success: true, checked: stale.length, remindersCreated: created });
  } catch (error: any) {
    console.error('Error running stale-prediction check:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
