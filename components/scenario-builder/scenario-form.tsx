'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

export default function ScenarioForm() {
  const [scenarioName, setScenarioName] = useState('My Scenario');
  const [priceIncrease, setPriceIncrease] = useState(15);
  const [employeeCount, setEmployeeCount] = useState(45);
  const [marketingBudget, setMarketingBudget] = useState(75000);
  const [supplierDelay, setSupplierDelay] = useState('none');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-medium tracking-tight text-black mb-8">Configure Scenario</h2>

      {/* Scenario Name */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Scenario Name</label>
        <input
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
          placeholder="Enter scenario name"
        />
      </div>

      {/* Price Increase Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Price Increase</label>
          <span className="text-lg font-medium text-black">{priceIncrease}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={priceIncrease}
          onChange={(e) => setPriceIncrease(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>No increase</span>
          <span>Max increase</span>
        </div>
      </div>

      {/* Employee Count Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Employee Count</label>
          <span className="text-lg font-medium text-black">{employeeCount}</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          value={employeeCount}
          onChange={(e) => setEmployeeCount(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>10 employees</span>
          <span>200 employees</span>
        </div>
      </div>

      {/* Marketing Budget Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Marketing Budget</label>
          <span className="text-lg font-medium text-black">${(marketingBudget / 1000).toFixed(0)}K</span>
        </div>
        <input
          type="range"
          min="10000"
          max="500000"
          step="5000"
          value={marketingBudget}
          onChange={(e) => setMarketingBudget(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>$10K</span>
          <span>$500K</span>
        </div>
      </div>

      {/* Supplier Delay Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Supplier Delay</label>
        <select
          value={supplierDelay}
          onChange={(e) => setSupplierDelay(e.target.value)}
          className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors"
        >
          <option value="none">No Delay</option>
          <option value="minor">Minor (1-2 weeks)</option>
          <option value="moderate">Moderate (2-4 weeks)</option>
          <option value="severe">Severe (4+ weeks)</option>
        </select>
      </div>

      {/* Run Simulation Button */}
      <button className="w-full py-3 px-6 bg-black text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors duration-200">
        <Play className="w-4 h-4 fill-current" />
        Run Simulation
      </button>
    </div>
  );
}
