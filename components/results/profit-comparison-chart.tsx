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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-black font-medium tracking-tight text-lg mb-6">Profit Analysis</h3>
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
          <Bar dataKey="baseline" fill="#CCCCCC" name="Baseline Profit" radius={[4, 4, 0, 0]} />
          <Bar dataKey="projected" fill="#2B2644" name="Projected Profit" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
