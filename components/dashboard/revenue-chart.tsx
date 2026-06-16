'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Business {
  baselineRevenue: number;
}

export default function RevenueChart() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await fetch('/api/business');
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
        }
      } catch (err) {
        console.error('Error fetching business for revenue chart:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const seasonalFactors = [0.95, 0.90, 1.00, 1.10, 1.15, 1.20];

  const baseRev = business?.baselineRevenue || 180000;
  const chartData = months.map((month, index) => {
    const sFactor = seasonalFactors[index];
    const revenue = Math.round((baseRev * sFactor) / 1000); // in Thousands
    const target = Math.round((baseRev * 1.1 * sFactor) / 1000); // 10% target growth
    return { month, revenue, target };
  });

  const totalActual = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalTarget = chartData.reduce((sum, item) => sum + item.target, 0);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse min-h-[440px]">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded mb-6"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-medium tracking-tight text-black">Revenue Trend</h2>
        <p className="text-sm text-gray-500">6-Month Baseline Trend (Adjusted for Seasonality)</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
          <XAxis dataKey="month" stroke="#999999" style={{ fontSize: '12px' }} />
          <YAxis stroke="#999999" style={{ fontSize: '12px' }} tickFormatter={(value) => `$${value}K`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              color: '#000000',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
            formatter={(value) => [`$${value}K`, '']}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2B2644"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 1, fill: '#2B2644' }}
            activeDot={{ r: 6 }}
            name="Baseline Rev"
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#999999"
            strokeWidth={2}
            dot={false}
            name="Target (+10%)"
            isAnimationActive={true}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-6 mt-6 pt-6 border-t border-gray-150">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Baseline</p>
          <p className="text-lg font-medium text-black">${(totalActual / 1000).toFixed(1)}M</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Target</p>
          <p className="text-lg font-medium text-gray-600">${(totalTarget / 1000).toFixed(1)}M</p>
        </div>
      </div>
    </div>
  );
}
