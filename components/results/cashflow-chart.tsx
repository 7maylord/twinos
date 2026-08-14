'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import type { CashFlowProjection } from '@/lib/cashflow-engine';

export function CashFlowChart({ cashFlow }: { cashFlow: CashFlowProjection }) {
  const formatYAxis = (value: number) => {
    if (value === 0) return '$0';
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const isBurning = cashFlow.monthsOfRunwayAtCurrentBurn !== null;
  const goesNegative = cashFlow.minCashOnHand < 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-black font-medium tracking-tight text-lg">Cash Flow &amp; Runway</h3>
        {isBurning && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <AlertTriangle size={12} />
            {cashFlow.monthsOfRunwayAtCurrentBurn!.toFixed(1)} months of runway
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Estimated cash position over time — accounts for the timing gap between booking revenue/expenses and
        actually collecting/paying cash, not just accrual profit.
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={cashFlow.months}>
          <defs>
            <linearGradient id="cashOnHandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2B2644" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2B2644" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
          <XAxis dataKey="month" stroke="#999999" style={{ fontSize: '12px' }} />
          <YAxis stroke="#999999" style={{ fontSize: '12px' }} tickFormatter={formatYAxis} />
          <Tooltip
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Cash on Hand']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              color: '#000000',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          />
          <ReferenceLine y={0} stroke="#DC2626" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="cashOnHand"
            stroke="#2B2644"
            strokeWidth={2}
            fill="url(#cashOnHandFill)"
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Starting Cash</p>
          <p className="text-sm font-semibold text-black">${cashFlow.startingCashOnHand.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Minimum Cash Position</p>
          <p className={`text-sm font-semibold ${goesNegative ? 'text-red-600' : 'text-black'}`}>
            ${cashFlow.minCashOnHand.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
