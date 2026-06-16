'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { day: '1', requests: 2400 },
  { day: '2', requests: 2210 },
  { day: '3', requests: 2290 },
  { day: '4', requests: 2000 },
  { day: '5', requests: 2181 },
  { day: '6', requests: 2500 },
  { day: '7', requests: 2100 },
];

export function UsageAnalyticsChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-black font-medium tracking-tight text-lg mb-6">API Usage (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
          <XAxis dataKey="day" stroke="#999999" style={{ fontSize: '12px' }} />
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
          <Line
            type="monotone"
            dataKey="requests"
            stroke="#2B2644"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2B2644' }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
