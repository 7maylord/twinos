'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
}

interface Business {
  id: string;
  name: string;
  industry: string;
  baselineRevenue: number;
  baselineMarketing: number;
  baselineInventory: number;
  baselineFixedCosts: number;
  products: Product[];
  employees: Employee[];
}

export default function KPICards() {
  const [business, setBusiness] = useState<Business | null>(null);
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
        console.error('Error fetching business metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-7 rounded-2xl border border-gray-200 bg-white min-h-[180px] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
        Failed to load business twin. Make sure database is seeded.
      </div>
    );
  }

  const payroll = business.employees.reduce((sum, emp) => sum + emp.salary, 0);
  const totalExpenses = payroll + business.baselineMarketing + business.baselineInventory + business.baselineFixedCosts;
  const netProfit = business.baselineRevenue - totalExpenses;
  const profitMargin = (netProfit / business.baselineRevenue) * 100;

  const kpis = [
    {
      title: 'Baseline Revenue',
      value: `$${(business.baselineRevenue / 1000).toFixed(0)}K`,
      change: 'Static baseline',
      isPositive: true,
      icon: DollarSign,
      isFeatured: true,
    },
    {
      title: 'Active Employees',
      value: business.employees.length.toString(),
      change: `Payroll: $${(payroll / 1000).toFixed(1)}K`,
      isPositive: true,
      icon: Users,
      isFeatured: false,
    },
    {
      title: 'Profit Margin',
      value: `${profitMargin.toFixed(1)}%`,
      change: netProfit < 0 ? 'Operating at loss' : 'Profitable operations',
      isPositive: netProfit >= 0,
      icon: TrendingUp,
      isFeatured: false,
    },
    {
      title: 'Operating Costs',
      value: `$${(totalExpenses / 1000).toFixed(0)}K`,
      change: `Fixed: $${(business.baselineFixedCosts / 1000).toFixed(0)}K`,
      isPositive: false,
      icon: Activity,
      isFeatured: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
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
              <span className={`text-sm font-semibold ${kpi.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.change}
              </span>
              <span className={`text-xs ${kpi.isFeatured ? 'text-white/50' : 'text-gray-500'}`}>
                {kpi.isFeatured ? 'monthly' : 'baseline'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
