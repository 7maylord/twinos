'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

export default function ImpactCards() {
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
        console.error('Error fetching business for impact cards:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  const impacts = [
    {
      title: 'Revenue Impact',
      value: business ? '+$450K' : '$0',
      description: business ? 'Projected increase' : 'No active twin',
      icon: DollarSign,
      isHighlighted: true,
    },
    {
      title: 'Headcount Impact',
      value: business ? '+35' : '0',
      description: business ? 'Additional team members' : 'No active twin',
      icon: Users,
      isHighlighted: false,
    },
    {
      title: 'Timeline',
      value: business ? '6 months' : '--',
      description: business ? 'To reach goals' : 'No active twin',
      icon: Clock,
      isHighlighted: false,
    },
    {
      title: 'ROI',
      value: business ? '340%' : '0%',
      description: business ? 'Return on investment' : 'No active twin',
      icon: TrendingUp,
      isHighlighted: false,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-250 border border-gray-200 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium tracking-tight text-black mb-4">Live Projections</h3>
      {impacts.map((impact) => {
        const Icon = impact.icon;
        return (
          <div
            key={impact.title}
            className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[120px] ${
              impact.isHighlighted
                ? 'bg-[#2B2644] border-transparent text-white shadow-md shadow-[#2B2644]/10'
                : 'bg-white border-gray-200 text-black hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                impact.isHighlighted ? 'bg-white/10' : 'bg-gray-100'
              }`}>
                <Icon className={`w-4 h-4 ${impact.isHighlighted ? 'text-white' : 'text-gray-700'}`} />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${
                  impact.isHighlighted ? 'text-white/60' : 'text-gray-500'
                }`}>
                  {impact.title}
                </p>
                <p 
                  className="text-2xl font-medium tracking-tight mt-1"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {impact.value}
                </p>
              </div>
            </div>
            <p className={`text-xs mt-3 ${impact.isHighlighted ? 'text-white/75' : 'text-gray-500'}`}>
              {impact.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
