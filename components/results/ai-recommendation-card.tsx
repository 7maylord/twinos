'use client';

import { Sparkles, Check } from 'lucide-react';

export function AIRecommendationCard() {
  return (
    <div className="bg-[#2B2644] text-white border border-transparent rounded-2xl p-6 shadow-md shadow-[#2B2644]/10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-white" size={24} />
        <h3 className="text-white font-medium tracking-tight text-lg">AI Recommendation</h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-white/80 leading-relaxed text-sm">
          Based on the simulation results, this scenario shows strong potential. The projected revenue increase of $450K would significantly improve profitability while maintaining acceptable inventory levels.
        </p>
        
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#2B2644]">✓</span>
            Proceed with Confidence
          </h4>
          <p className="text-white/85 text-xs leading-relaxed">
            This strategy aligns with your business goals. The 340% ROI on marketing spend indicates strong market demand. Recommend immediate implementation with phased rollout.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-white/60">Key Considerations:</h4>
          <ul className="space-y-2">
            <li className="flex gap-2 text-xs text-white/80">
              <Check size={14} className="text-white/60 flex-shrink-0 mt-0.5" />
              <span>Supply chain can handle increased volume</span>
            </li>
            <li className="flex gap-2 text-xs text-white/80">
              <Check size={14} className="text-white/60 flex-shrink-0 mt-0.5" />
              <span>Hiring timeline is realistic (6 months)</span>
            </li>
            <li className="flex gap-2 text-xs text-white/80">
              <Check size={14} className="text-white/60 flex-shrink-0 mt-0.5" />
              <span>Cash flow impact remains positive</span>
            </li>
          </ul>
        </div>

        <button className="w-full mt-4 px-4 py-2.5 bg-white text-[#2B2644] hover:bg-gray-100 rounded-full font-medium transition-colors duration-200 text-sm">
          Approve Scenario
        </button>
      </div>
    </div>
  );
}
