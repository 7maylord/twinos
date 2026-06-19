'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Employee {
  salary: number;
}

interface Business {
  baselineRevenue: number;
  baselineMarketing: number;
  baselineInventory: number;
  baselineFixedCosts: number;
  employees: Employee[];
}

export default function ProfitChart() {
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
        console.error('Error fetching business for profit chart:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const seasonalFactors = [0.95, 0.90, 1.00, 1.10, 1.15, 1.20];

  const baseRev = business?.baselineRevenue || 0;
  const marketing = business?.baselineMarketing || 0;
  const inventory = business?.baselineInventory || 0;
  const fixedCosts = business?.baselineFixedCosts || 0;
  const payroll = business?.employees.reduce((sum, emp) => sum + emp.salary, 0) || 0;

  const totalCosts = payroll + marketing + inventory + fixedCosts;

  const chartData = months.map((month, index) => {
    const sFactor = seasonalFactors[index];
    const revenue = baseRev * sFactor;
    const profit = Math.round((revenue - totalCosts) / 1000); // in Thousands
    const cost = Math.round(totalCosts / 1000); // in Thousands
    return { month, profit, cost };
  });

  const totalProfit = chartData.reduce((sum, item) => sum + item.profit, 0);
  const totalCostVal = chartData.reduce((sum, item) => sum + item.cost, 0);

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
        <h2 className="text-lg font-medium tracking-tight text-black">Profit Analysis</h2>
        <p className="text-sm text-gray-500">Baseline Profit vs Cost Breakdown</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
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
          <Bar dataKey="profit" fill="#2B2644" radius={[6, 6, 0, 0]} name="Profit" isAnimationActive={true} />
          <Bar dataKey="cost" fill="#CCCCCC" radius={[6, 6, 0, 0]} name="Operating Costs" isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-6 mt-6 pt-6 border-t border-gray-150">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Baseline Profit</p>
          <p className="text-lg font-medium text-black">
            {totalProfit >= 0 ? '' : '-'}${(Math.abs(totalProfit) / 1000).toFixed(1)}M
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Operating Costs</p>
          <p className="text-lg font-medium text-gray-600">${(totalCostVal / 1000).toFixed(1)}M</p>
        </div>
      </div>
    </div>
  );
}
