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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-black font-medium tracking-tight text-lg mb-6">Monthly Simulations</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Bar dataKey="simulations" fill="#2B2644" name="Simulations Run" radius={[4, 4, 0, 0]} />
          <Bar dataKey="users" fill="#CCCCCC" name="Active Users" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
