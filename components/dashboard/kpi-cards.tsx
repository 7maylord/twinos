'use client';

import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const kpis = [
  {
    title: 'Total Revenue',
    value: '$2.4M',
    change: '+12.5%',
    icon: DollarSign,
    isFeatured: true,
  },
  {
    title: 'Active Users',
    value: '1,254',
    change: '+8.2%',
    icon: Users,
    isFeatured: false,
  },
  {
    title: 'Profit Margin',
    value: '34.2%',
    change: '+2.1%',
    icon: TrendingUp,
    isFeatured: false,
  },
  {
    title: 'Conversion Rate',
    value: '3.24%',
    change: '+0.8%',
    icon: Activity,
    isFeatured: false,
  },
];

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change.startsWith('+');
        return (
          <div
            key={index}
            className={`p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[180px] ${
              kpi.isFeatured
                ? 'bg-[#2B2644] border-transparent text-white shadow-lg shadow-[#2B2644]/15'
                : 'bg-white border-gray-200 text-black hover:border-gray-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <p 
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    kpi.isFeatured ? 'text-white/60' : 'text-gray-500'
                  }`}
                >
                  {kpi.title}
                </p>
                <Icon className={`w-5 h-5 ${kpi.isFeatured ? 'text-white/80' : 'text-gray-700'}`} />
              </div>
              <h3 
                className="text-4xl font-medium tracking-tight mt-4"
                style={{ letterSpacing: '-0.03em' }}
              >
                {kpi.value}
              </h3>
            </div>
            
            <div className={`flex items-center gap-2 pt-4 border-t ${kpi.isFeatured ? 'border-white/10' : 'border-gray-150'}`}>
              <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.change}
              </span>
              <span className={`text-xs ${kpi.isFeatured ? 'text-white/50' : 'text-gray-500'}`}>
                from last month
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
