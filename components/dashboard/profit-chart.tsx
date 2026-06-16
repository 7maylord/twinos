'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', profit: 400, cost: 240 },
  { month: 'Feb', profit: 300, cost: 221 },
  { month: 'Mar', profit: 200, cost: 229 },
  { month: 'Apr', profit: 278, cost: 200 },
  { month: 'May', profit: 189, cost: 250 },
  { month: 'Jun', profit: 239, cost: 210 },
  { month: 'Jul', profit: 349, cost: 290 },
];

export default function ProfitChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-medium tracking-tight text-black">Profit Analysis</h2>
        <p className="text-sm text-gray-500">Profit vs Cost breakdown</p>
      </div>

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
            formatter={(value) => [`$${value}k`, '']}
          />
          <Bar dataKey="profit" fill="#2B2644" radius={[6, 6, 0, 0]} isAnimationActive={true} />
          <Bar dataKey="cost" fill="#CCCCCC" radius={[6, 6, 0, 0]} isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-6 mt-6 pt-6 border-t border-gray-150">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Profit</p>
          <p className="text-lg font-medium text-black">$1.9M</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Costs</p>
          <p className="text-lg font-medium text-gray-600">$1.6M</p>
        </div>
      </div>
    </div>
  );
}
