'use client';

import { Sparkles, Check } from 'lucide-react';

export function AIRecommendationCard() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-cyan-400" size={24} />
        <h3 className="text-white font-semibold">AI Recommendation</h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-slate-300 leading-relaxed">
          Based on the simulation results, this scenario shows strong potential. The projected revenue increase of $450K would significantly improve profitability while maintaining acceptable inventory levels.
        </p>
        
        <div className="bg-slate-700/40 rounded-lg p-4 border border-slate-600">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-xs font-bold text-white">✓</span>
            Proceed with Confidence
          </h4>
          <p className="text-slate-300 text-sm">
            This strategy aligns with your business goals. The 340% ROI on marketing spend indicates strong market demand. Recommend immediate implementation with phased rollout.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-semibold text-sm">Key Considerations:</h4>
          <ul className="space-y-2">
            <li className="flex gap-2 text-sm text-slate-300">
              <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span>Supply chain can handle increased volume</span>
            </li>
            <li className="flex gap-2 text-sm text-slate-300">
              <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span>Hiring timeline is realistic (6 months)</span>
            </li>
            <li className="flex gap-2 text-sm text-slate-300">
              <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span>Cash flow impact remains positive</span>
            </li>
          </ul>
        </div>

        <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-lg font-medium transition-all">
          Approve Scenario
        </button>
      </div>
    </div>
  );
}
