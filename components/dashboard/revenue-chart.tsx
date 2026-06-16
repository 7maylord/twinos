'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 2400, target: 2200 },
  { month: 'Feb', revenue: 2210, target: 2290 },
  { month: 'Mar', revenue: 2290, target: 2000 },
  { month: 'Apr', revenue: 2000, target: 2181 },
  { month: 'May', revenue: 2181, target: 2500 },
  { month: 'Jun', revenue: 2500, target: 2100 },
  { month: 'Jul', revenue: 2400, target: 2300 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-medium tracking-tight text-black">Revenue Trend</h2>
        <p className="text-sm text-gray-500">Last 7 months performance</p>
      </div>

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
            formatter={(value) => [`$${value}k`, '']}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2B2644"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 1, fill: '#2B2644' }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#999999"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-6 mt-6 pt-6 border-t border-gray-150">
        <div>
          <p className="text-xs text-gray-500 mb-1">Actual Revenue</p>
          <p className="text-lg font-medium text-black">$2.4M</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Target</p>
          <p className="text-lg font-medium text-gray-600">$2.3M</p>
        </div>
      </div>
    </div>
  );
}
