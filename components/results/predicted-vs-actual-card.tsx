'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

interface PredictedVsActualProps {
  projectedRevenue: number;
  projectedProfit: number;
  actualRevenue: number;
  actualProfit: number;
  actualCapturedAt: string;
}

export function PredictedVsActualCard({
  projectedRevenue,
  projectedProfit,
  actualRevenue,
  actualProfit,
  actualCapturedAt,
}: PredictedVsActualProps) {
  const revenueErrorPct = projectedRevenue !== 0 ? ((actualRevenue - projectedRevenue) / Math.abs(projectedRevenue)) * 100 : 0;
  const profitErrorPct = projectedProfit !== 0 ? ((actualProfit - projectedProfit) / Math.abs(projectedProfit)) * 100 : 0;
  const withinTenPercent = Math.abs(revenueErrorPct) <= 10;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black font-medium tracking-tight text-lg">Predicted vs. Actual</h3>
        <span className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 ${
          withinTenPercent ? 'text-green-700 bg-green-50 border border-green-200' : 'text-amber-700 bg-amber-50 border border-amber-200'
        }`}>
          {withinTenPercent ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {withinTenPercent ? 'On target' : 'Off target'}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Compared against synced financials as of {new Date(actualCapturedAt).toLocaleDateString()}.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Revenue</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Predicted ${projectedRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-semibold text-black">${actualRevenue.toLocaleString()}</span>
            <span className={`text-xs font-semibold ${revenueErrorPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueErrorPct >= 0 ? '+' : ''}{revenueErrorPct.toFixed(1)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Profit</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Predicted ${projectedProfit.toLocaleString()}</span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-semibold text-black">${actualProfit.toLocaleString()}</span>
            <span className={`text-xs font-semibold ${profitErrorPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitErrorPct >= 0 ? '+' : ''}{profitErrorPct.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
