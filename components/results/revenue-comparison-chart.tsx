'use client';

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyRevenueData {
  month: string;
  baselineRevenue: number;
  projectedRevenue: number;
  projectedRevenueLow?: number;
  projectedRevenueHigh?: number;
}

export function RevenueComparisonChart({ data }: { data: MonthlyRevenueData[] }) {
  const formatYAxis = (value: number) => {
    if (value === 0) return '$0';
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const hasBand = data.some((d) => d.projectedRevenueLow !== undefined && d.projectedRevenueHigh !== undefined);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-black font-medium tracking-tight text-lg mb-6">Revenue Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
          <XAxis dataKey="month" stroke="#999999" style={{ fontSize: '12px' }} />
          <YAxis stroke="#999999" style={{ fontSize: '12px' }} tickFormatter={formatYAxis} />
          <Tooltip
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              color: '#000000',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="baselineRevenue"
            stroke="#999999"
            strokeWidth={2}
            dot={false}
            name="Baseline Revenue"
            isAnimationActive={true}
            strokeDasharray="4 4"
          />
          {hasBand && (
            <>
              <Line
                type="monotone"
                dataKey="projectedRevenueHigh"
                stroke="#2B2644"
                strokeWidth={1}
                strokeOpacity={0.4}
                dot={false}
                name="High Estimate"
                strokeDasharray="2 3"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="projectedRevenueLow"
                stroke="#2B2644"
                strokeWidth={1}
                strokeOpacity={0.4}
                dot={false}
                name="Low Estimate"
                strokeDasharray="2 3"
                isAnimationActive={false}
              />
            </>
          )}
          <Line
            type="monotone"
            dataKey="projectedRevenue"
            stroke="#2B2644"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2B2644' }}
            name="Projected Revenue"
            isAnimationActive={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
