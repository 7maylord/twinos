'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

export default function ScenarioForm() {
  const [scenarioName, setScenarioName] = useState('My Scenario')
  const [priceIncrease, setPriceIncrease] = useState(15)
  const [employeeCount, setEmployeeCount] = useState(45)
  const [marketingBudget, setMarketingBudget] = useState(75000)
  const [supplierDelay, setSupplierDelay] = useState('none')

  return (
    <div className="bg-card border border-card-border rounded-xl p-8 backdrop-blur-md animate-fade-up">
      <h2 className="text-2xl font-bold text-foreground mb-8">Configure Scenario</h2>

      {/* Scenario Name */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-foreground mb-3">Scenario Name</label>
        <input
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          className="w-full px-4 py-3 bg-background border border-card-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
          placeholder="Enter scenario name"
        />
      </div>

      {/* Price Increase Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">Price Increase</label>
          <span className="text-lg font-bold text-primary">{priceIncrease}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={priceIncrease}
          onChange={(e) => setPriceIncrease(Number(e.target.value))}
          className="w-full h-2 bg-card-border rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-muted mt-2">
          <span>No increase</span>
          <span>Max increase</span>
        </div>
      </div>

      {/* Employee Count Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">Employee Count</label>
          <span className="text-lg font-bold text-accent">{employeeCount}</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          value={employeeCount}
          onChange={(e) => setEmployeeCount(Number(e.target.value))}
          className="w-full h-2 bg-card-border rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-muted mt-2">
          <span>10 employees</span>
          <span>200 employees</span>
        </div>
      </div>

      {/* Marketing Budget Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">Marketing Budget</label>
          <span className="text-lg font-bold text-green-500">${(marketingBudget / 1000).toFixed(0)}K</span>
        </div>
        <input
          type="range"
          min="10000"
          max="500000"
          step="5000"
          value={marketingBudget}
          onChange={(e) => setMarketingBudget(Number(e.target.value))}
          className="w-full h-2 bg-card-border rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-muted mt-2">
          <span>$10K</span>
          <span>$500K</span>
        </div>
      </div>

      {/* Supplier Delay Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-foreground mb-3">Supplier Delay</label>
        <select
          value={supplierDelay}
          onChange={(e) => setSupplierDelay(e.target.value)}
          className="w-full px-4 py-3 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="none">No Delay</option>
          <option value="minor">Minor (1-2 weeks)</option>
          <option value="moderate">Moderate (2-4 weeks)</option>
          <option value="severe">Severe (4+ weeks)</option>
        </select>
      </div>

      {/* Run Simulation Button */}
      <button className="w-full py-3 px-6 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/50 transition-all transform hover:scale-105">
        <Play className="w-5 h-5" />
        Run Simulation
      </button>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        .slider::-webkit-slider-runnable-track {
          height: 8px;
          background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%);
          border-radius: 4px;
        }

        .slider::-moz-range-track {
          background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%);
          border-radius: 4px;
          height: 8px;
        }
      `}</style>
    </div>
  )
}
