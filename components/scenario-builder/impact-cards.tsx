'use client';

import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

const impacts = [
  {
    title: 'Revenue Impact',
    value: '+$450K',
    description: 'Projected increase',
    icon: DollarSign,
    isHighlighted: true,
  },
  {
    title: 'Headcount Impact',
    value: '+35',
    description: 'Additional team members',
    icon: Users,
    isHighlighted: false,
  },
  {
    title: 'Timeline',
    value: '6 months',
    description: 'To reach goals',
    icon: Clock,
    isHighlighted: false,
  },
  {
    title: 'ROI',
    value: '340%',
    description: 'Return on investment',
    icon: TrendingUp,
    isHighlighted: false,
  },
];

export default function ImpactCards() {
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
