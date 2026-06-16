'use client';

import { Package, Users } from 'lucide-react';

interface ImpactMetricsProps {
  baselineHeadcount: number;
  projectedHeadcount: number;
  baselineInventory: number;
  projectedInventory: number;
  supplierDelay: string;
}

export function ImpactMetrics({
  baselineHeadcount,
  projectedHeadcount,
  baselineInventory,
  projectedInventory,
  supplierDelay,
}: ImpactMetricsProps) {
  const headcountDiff = projectedHeadcount - baselineHeadcount;
  const isHeadcountIncrease = headcountDiff >= 0;

  const inventoryDiff = projectedInventory - baselineInventory;
  const inventoryChangePercent = ((projectedInventory - baselineInventory) / (baselineInventory || 1)) * 100;

  // Render a friendly explanation of the supplier delay impact
  let delayMessage = 'No supply chain delay adjustments applied.';
  if (supplierDelay === 'minor') {
    delayMessage = 'Warning: Minor supplier delay (1-2 weeks) increases stockout risk by 15%.';
  } else if (supplierDelay === 'moderate') {
    delayMessage = 'Caution: Moderate supplier delay (2-4 weeks) increases stockout risk by 35%.';
  } else if (supplierDelay === 'severe') {
    delayMessage = 'Critical Warning: Severe supplier delay (4+ weeks) increases stockout risk by 65%.';
  }

  // Calculate percentage of width for progress bars
  const maxHeadcount = Math.max(baselineHeadcount, projectedHeadcount, 10);
  const baselineHeadcountPct = (baselineHeadcount / maxHeadcount) * 100;
  const projectedHeadcountPct = (projectedHeadcount / maxHeadcount) * 100;

  const maxInventory = Math.max(baselineInventory, projectedInventory, 1000);
  const baselineInventoryPct = (baselineInventory / maxInventory) * 100;
  const projectedInventoryPct = (projectedInventory / maxInventory) * 100;

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
              <span className="text-gray-600 text-sm">Baseline Stock Cost</span>
              <span className="text-black font-medium">${baselineInventory.toLocaleString()}</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-1.5">
              <div 
                className="bg-gray-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${baselineInventoryPct}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Projected Stock Cost</span>
              <span className="text-black font-medium">${projectedInventory.toLocaleString()}</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-1.5">
              <div 
                className="bg-[#2B2644] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${projectedInventoryPct}%` }}
              ></div>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            {inventoryDiff >= 0 
              ? `Stock investment increased by $${Math.abs(inventoryDiff).toLocaleString()} (${inventoryChangePercent.toFixed(0)}%) to meet projected demand.`
              : `Stock costs reduced by $${Math.abs(inventoryDiff).toLocaleString()} (${Math.abs(inventoryChangePercent).toFixed(0)}%) due to demand adjustments.`
            }
          </p>
          <p className="text-amber-600 text-xs font-semibold mt-1">{delayMessage}</p>
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
              <span className="text-gray-600 text-sm">Baseline Headcount</span>
              <span className="text-black font-medium">{baselineHeadcount}</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-1.5">
              <div 
                className="bg-gray-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${baselineHeadcountPct}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Projected Headcount</span>
              <span className="text-black font-medium">{projectedHeadcount}</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-1.5">
              <div 
                className="bg-[#2B2644] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${projectedHeadcountPct}%` }}
              ></div>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            {isHeadcountIncrease 
              ? `Requires onboarding ${headcountDiff} new team member${headcountDiff !== 1 ? 's' : ''} to manage simulated capacity.`
              : `Workforce reduction of ${Math.abs(headcountDiff)} employee${Math.abs(headcountDiff) !== 1 ? 's' : ''} simulated.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
