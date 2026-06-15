'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', baseline: 45000, projected: 45000 },
  { month: 'Feb', baseline: 52000, projected: 56000 },
  { month: 'Mar', baseline: 48000, projected: 62000 },
  { month: 'Apr', baseline: 60000, projected: 85000 },
  { month: 'May', baseline: 66000, projected: 105000 },
  { month: 'Jun', baseline: 71000, projected: 140000 },
  { month: 'Jul', baseline: 78000, projected: 168000 },
];

export function ProfitComparisonChart() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6 animate-fade-up">
      <h3 className="text-white font-semibold mb-6">Profit Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Bar dataKey="baseline" fill="#6366f1" name="Baseline Profit" radius={[8, 8, 0, 0]} />
          <Bar dataKey="projected" fill="#06b6d4" name="Projected Profit" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
