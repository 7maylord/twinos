'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', baseline: 180000, projected: 180000 },
  { month: 'Feb', baseline: 210000, projected: 215000 },
  { month: 'Mar', baseline: 195000, projected: 225000 },
  { month: 'Apr', baseline: 240000, projected: 285000 },
  { month: 'May', baseline: 265000, projected: 340000 },
  { month: 'Jun', baseline: 285000, projected: 415000 },
  { month: 'Jul', baseline: 310000, projected: 480000 },
];

export function RevenueComparisonChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-black font-medium tracking-tight text-lg mb-6">Revenue Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
          <XAxis dataKey="month" stroke="#999999" style={{ fontSize: '12px' }} />
          <YAxis stroke="#999999" style={{ fontSize: '12px' }} />
          <Tooltip
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
            dataKey="baseline"
            stroke="#999999"
            strokeWidth={2}
            dot={false}
            name="Baseline"
            isAnimationActive={true}
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#2B2644"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2B2644' }}
            name="Projected (with scenario)"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
