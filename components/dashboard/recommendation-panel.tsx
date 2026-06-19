'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';

const recommendations = [
  {
    title: 'Increase Marketing',
    description: 'Boost budget by 15% for Q3',
    impact: '+$200K',
    priority: 'high',
  },
  {
    title: 'Optimize Pricing',
    description: 'Adjust tier pricing strategy',
    impact: '+$150K',
    priority: 'medium',
  },
  {
    title: 'Expand Team',
    description: 'Hire 3 more engineers',
    impact: '+$300K',
    priority: 'high',
  },
];

export default function RecommendationPanel() {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await fetch('/api/business');
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
        }
      } catch (err) {
        console.error('Error fetching business for recommendation panel:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[440px]">
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-medium tracking-tight text-black flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI Recommendations
          </h2>
          <p className="text-sm text-gray-500 mt-1">Based on your simulations</p>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        ) : !business ? (
          <div className="text-center py-12 border border-dashed border-gray-250 rounded-xl px-4 bg-gray-50/50">
            <p className="text-gray-500 font-medium text-sm">No recommendations yet</p>
            <p className="text-gray-400 text-xs mt-2 max-w-[200px] mx-auto">
              Please set up your digital twin profile to receive tailored AI recommendations.
            </p>
            <a 
              href="/onboarding" 
              className="text-xs font-semibold text-[#2B2644] hover:text-black transition-colors underline mt-4 inline-block"
            >
              Set up digital twin
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                  rec.priority === 'high'
                    ? 'border-red-100 bg-red-50/30 hover:border-red-200 hover:bg-red-50/50'
                    : 'border-amber-100 bg-amber-50/30 hover:border-amber-200 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-black text-sm">{rec.title}</p>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      rec.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-green-700">{rec.impact}</p>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors translate-x-0 group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        disabled={!business}
        className="w-full mt-6 py-2.5 px-4 border border-black text-black rounded-full font-medium hover:bg-gray-50 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        View Full Report
      </button>
    </div>
  );
}
