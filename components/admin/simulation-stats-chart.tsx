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
  { month: 'Jan', simulations: 450, users: 32 },
  { month: 'Feb', simulations: 520, users: 45 },
  { month: 'Mar', simulations: 480, users: 38 },
  { month: 'Apr', simulations: 610, users: 52 },
  { month: 'May', simulations: 720, users: 68 },
  { month: 'Jun', simulations: 847, users: 85 },
];

export function SimulationStatsChart() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6 animate-fade-up">
      <h3 className="text-white font-semibold mb-6">Monthly Simulations</h3>
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
          <Bar dataKey="simulations" fill="#06b6d4" name="Simulations Run" radius={[8, 8, 0, 0]} />
          <Bar dataKey="users" fill="#6366f1" name="Active Users" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
