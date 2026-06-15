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
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6 animate-fade-up">
      <h3 className="text-white font-semibold mb-6">Revenue Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            name="Baseline"
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            name="Projected (with scenario)"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
