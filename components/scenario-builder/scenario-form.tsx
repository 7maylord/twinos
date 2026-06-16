'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScenarioForm() {
  const router = useRouter();
  const [scenarioName, setScenarioName] = useState('Menu Price Increase & Marketing Push');
  const [priceIncrease, setPriceIncrease] = useState(15);
  const [employeeCount, setEmployeeCount] = useState(24);
  const [marketingBudget, setMarketingBudget] = useState(35000);
  const [supplierDelay, setSupplierDelay] = useState('none');
  const [submitting, setSubmitting] = useState(false);

  const handleRunSimulation = async () => {
    if (!scenarioName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/scenarios/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scenarioName,
          priceIncrease,
          employeeCount,
          marketingBudget,
          supplierDelay,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to results screen with the generated scenarioId
        router.push(`/results?scenarioId=${data.result.scenarioId}`);
      } else {
        const errorData = await res.json();
        alert(`Failed to run simulation: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error submitting simulation:', err);
      alert('Network error while running simulation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-medium tracking-tight text-black mb-8">Configure Scenario</h2>

      {/* Scenario Name */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Scenario Name</label>
        <input
          type="text"
          value={scenarioName}
          disabled={submitting}
          onChange={(e) => setScenarioName(e.target.value)}
          className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors disabled:opacity-60"
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
          max="50"
          disabled={submitting}
          value={priceIncrease}
          onChange={(e) => setPriceIncrease(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-60"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>0% (Baseline)</span>
          <span>50% Max</span>
        </div>
      </div>

      {/* Employee Count Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Simulated Headcount</label>
          <span className="text-lg font-medium text-black">{employeeCount} employees</span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          disabled={submitting}
          value={employeeCount}
          onChange={(e) => setEmployeeCount(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-60"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>5 employees (Min)</span>
          <span>24 (Baseline)</span>
          <span>50 employees (Max)</span>
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
          min="0"
          max="100000"
          step="2500"
          disabled={submitting}
          value={marketingBudget}
          onChange={(e) => setMarketingBudget(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-60"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>$0 (None)</span>
          <span>$25K (Baseline)</span>
          <span>$100K Max</span>
        </div>
      </div>

      {/* Supplier Delay Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Supplier Delay</label>
        <select
          value={supplierDelay}
          disabled={submitting}
          onChange={(e) => setSupplierDelay(e.target.value)}
          className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors disabled:opacity-60"
        >
          <option value="none">No Delay</option>
          <option value="minor">Minor (1-2 weeks)</option>
          <option value="moderate">Moderate (2-4 weeks)</option>
          <option value="severe">Severe (4+ weeks)</option>
        </select>
      </div>

      {/* Run Simulation Button */}
      <button
        onClick={handleRunSimulation}
        disabled={submitting}
        className="w-full py-3 px-6 bg-black text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-400"
      >
        <Play className="w-4 h-4 fill-current" />
        {submitting ? 'Calculating Scenarios...' : 'Run Simulation'}
      </button>
    </div>
  );
}
