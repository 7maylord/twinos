'use client';

import { Sparkles, Check, AlertTriangle } from 'lucide-react';

interface AIRecommendationProps {
  scenarioName: string;
  projectedRevenue: number;
  projectedProfit: number;
  baselineRevenue: number;
  baselineProfit: number;
  recommendation?: {
    summary: string;
    headline: string;
    details: string;
    considerations: string[];
  } | null;
}

export function AIRecommendationCard({
  scenarioName,
  projectedRevenue,
  projectedProfit,
  baselineRevenue,
  baselineProfit,
  recommendation,
}: AIRecommendationProps) {
  const isProfitableDelta = projectedProfit > baselineProfit;
  const isNetPositive = projectedProfit > 0;
  
  const profitDelta = projectedProfit - baselineProfit;
  const revenueDelta = projectedRevenue - baselineRevenue;

  // Use AI values if present, else fallback to client-calculated defaults
  const summary = recommendation?.summary || (isProfitableDelta 
    ? `Based on the simulation results, "${scenarioName}" shows strong potential. The projected profit increase of $${profitDelta.toLocaleString()} improves your operating margins significantly compared to the baseline.`
    : `Caution: "${scenarioName}" projects a profit drop of $${Math.abs(profitDelta).toLocaleString()} compared to the baseline. Review your payroll additions or pricing models to protect margins.`);

  const headline = recommendation?.headline || (isNetPositive ? 'Proceed with Phased Rollout' : 'Simulation Projects Net Loss');
  
  const details = recommendation?.details || (isNetPositive 
    ? `This strategy successfully moves the business to net profitability. The projected revenue of $${projectedRevenue.toLocaleString()} validates the price adjustment despite small demand drops.`
    : `Even with price adjustments, the business is projected to run a net monthly loss of $${Math.abs(projectedProfit).toLocaleString()}. We recommend raising prices further or scaling back staffing levels.`);

  const considerations = recommendation?.considerations || [
    revenueDelta >= 0 ? 'Revenue is projected to grow' : 'Revenue is projected to contract',
    isNetPositive ? 'Monthly cashflow turns positive' : 'Monthly cashflow remains negative',
    'Inventory and staff levels are adjusted',
  ];

  return (
    <div className="bg-[#2B2644] text-white border border-transparent rounded-2xl p-6 shadow-md shadow-[#2B2644]/10 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-white" size={24} />
          <h3 className="text-white font-medium tracking-tight text-lg">AI Recommendation</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-white/80 leading-relaxed text-sm">
            {summary}
          </p>
          
          <div className={`rounded-xl p-4 border ${isNetPositive ? 'bg-white/10 border-white/10' : 'bg-red-500/10 border-red-500/20'}`}>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              {isNetPositive ? (
                <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#2B2644]">✓</span>
              ) : (
                <AlertTriangle size={18} className="text-red-400" />
              )}
              {headline}
            </h4>
            <p className="text-white/85 text-xs leading-relaxed">
              {details}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white/60 font-semibold text-xs uppercase tracking-wider">Key Considerations:</h4>
            <ul className="space-y-2">
              {considerations.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-white/80">
                  <Check size={14} className="text-white/60 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 px-4 py-2.5 bg-white text-[#2B2644] hover:bg-gray-100 rounded-full font-medium transition-colors duration-200 text-sm">
        {isNetPositive ? 'Approve & Deploy Scenario' : 'Revise Adjustments'}
      </button>
    </div>
  );
}
