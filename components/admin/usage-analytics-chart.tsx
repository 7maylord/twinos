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
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6 animate-fade-up">
      <h3 className="text-white font-semibold mb-6">API Usage (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line
            type="monotone"
            dataKey="requests"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            fillOpacity={1}
            fill="url(#colorUsage)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
