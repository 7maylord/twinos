'use client';

import { Package, Users } from 'lucide-react';

export function ImpactMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Inventory Impact */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-full">
            <Package className="text-gray-700" size={20} />
          </div>
          <h3 className="text-black font-medium tracking-tight text-lg">Inventory Impact</h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Current Stock Level</span>
              <span className="text-black font-medium">$450K</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-1.5">
              <div className="bg-gray-400 h-1.5 rounded-full w-3/4"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Projected Stock Level</span>
              <span className="text-black font-medium">$325K</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-1.5">
              <div className="bg-[#2B2644] h-1.5 rounded-full w-1/2"></div>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">Risk reduction of 28% through better demand forecasting</p>
        </div>
      </div>

      {/* Staffing Impact */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-full">
            <Users className="text-gray-700" size={20} />
          </div>
          <h3 className="text-black font-medium tracking-tight text-lg">Staffing Impact</h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Current Headcount</span>
              <span className="text-black font-medium">248</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-1.5">
              <div className="bg-gray-400 h-1.5 rounded-full w-2/3"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Projected Headcount</span>
              <span className="text-black font-medium">283</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-1.5">
              <div className="bg-[#2B2644] h-1.5 rounded-full w-3/4"></div>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">Need to hire 35 employees over next 6 months</p>
        </div>
      </div>
    </div>
  );
}
