'use client';

import { TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';

export function BusinessMetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm mb-1">Active Businesses</p>
            <p className="text-3xl font-bold text-white">142</p>
          </div>
          <Users className="text-indigo-400" size={24} />
        </div>
        <p className="text-green-400 text-sm mt-3">+12 this month</p>
      </div>
    </div>
  );
}
