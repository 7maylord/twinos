'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricItem {
  id: string | number;
  category: string;
  mrrValue: string;
  growth: string;
  trend: 'up' | 'down';
}

interface RevenueMetricsTableProps {
  metrics?: MetricItem[];
  totalMRR?: number;
}

export function RevenueMetricsTable({ metrics = [], totalMRR = 298000 }: RevenueMetricsTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-black font-medium tracking-tight text-lg mb-6">Revenue Breakdown (MRR)</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-150">
              <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Category</th>
              <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">MRR</th>
              <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Growth</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-4 text-gray-700 text-sm">{metric.category}</td>
                <td className="py-4 px-4 text-black font-medium text-sm">{metric.mrrValue}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    {metric.trend === 'up' ? (
                      <>
                        <ArrowUpRight size={14} className="text-green-600" />
                        <span className="text-green-600 text-xs font-semibold">{metric.growth}</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight size={14} className="text-red-650" />
                        <span className="text-red-650 text-xs font-semibold">{metric.growth}</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-150">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium text-sm">Total MRR</span>
          <span className="text-2xl font-medium tracking-tight text-black">${(totalMRR / 1000).toFixed(0)}K</span>
        </div>
      </div>
    </div>
  );
}
