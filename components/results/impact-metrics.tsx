'use client';

import { Package, Users, Clock, TrendingUp } from 'lucide-react';

export function ImpactMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Inventory Impact */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg">
            <Package className="text-orange-400" size={24} />
          </div>
          <h3 className="text-white font-semibold">Inventory Impact</h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Current Stock Level</span>
              <span className="text-white font-semibold">$450K</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Projected Stock Level</span>
              <span className="text-white font-semibold">$325K</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full w-1/2"></div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Risk reduction of 28% through better demand forecasting</p>
        </div>
      </div>

      {/* Staffing Impact */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
            <Users className="text-blue-400" size={24} />
          </div>
          <h3 className="text-white font-semibold">Staffing Impact</h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Current Headcount</span>
              <span className="text-white font-semibold">248</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full w-2/3"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Projected Headcount</span>
              <span className="text-white font-semibold">283</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Need to hire 35 employees over next 6 months</p>
        </div>
      </div>
    </div>
  );
}
