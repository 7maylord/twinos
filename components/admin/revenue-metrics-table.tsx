'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const metrics = [
  { id: 1, category: 'Enterprise Plan', mrrValue: '$145K', growth: '+12%', trend: 'up' },
  { id: 2, category: 'Professional Plan', mrrValue: '$89K', growth: '+8%', trend: 'up' },
  { id: 3, category: 'Starter Plan', mrrValue: '$34K', growth: '+2%', trend: 'up' },
  { id: 4, category: 'Add-ons & Services', mrrValue: '$12K', growth: '-1%', trend: 'down' },
  { id: 5, category: 'Annual Subscriptions', mrrValue: '$18K', growth: '+5%', trend: 'up' },
];

export function RevenueMetricsTable() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6 animate-fade-up">
      <h3 className="text-white font-semibold mb-6">Revenue Breakdown (MRR)</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Category</th>
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">MRR</th>
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Growth</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                <td className="py-4 px-4 text-slate-200">{metric.category}</td>
                <td className="py-4 px-4 text-white font-semibold">{metric.mrrValue}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    {metric.trend === 'up' ? (
                      <>
                        <ArrowUpRight size={16} className="text-green-400" />
                        <span className="text-green-400 text-sm">{metric.growth}</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight size={16} className="text-red-400" />
                        <span className="text-red-400 text-sm">{metric.growth}</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-slate-300 font-medium">Total MRR</span>
          <span className="text-2xl font-bold text-white">$298K</span>
        </div>
      </div>
    </div>
  );
}
