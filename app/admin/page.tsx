'use client';

import { TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import { SimulationStatsChart } from '@/components/admin/simulation-stats-chart';
import { UsageAnalyticsChart } from '@/components/admin/usage-analytics-chart';
import { ActiveBusinessesList } from '@/components/admin/active-businesses-list';
import { RevenueMetricsTable } from '@/components/admin/revenue-metrics-table';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <AdminHeader />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#2B2644] text-white rounded-2xl p-6 shadow-md shadow-[#2B2644]/10 group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Active Businesses</p>
                <p 
                  className="text-3xl font-medium tracking-tight text-white"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  142
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-full">
                <Users className="text-white" size={20} />
              </div>
            </div>
            <p className="text-green-400 text-xs font-semibold">+12 this month</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Monthly Simulations</p>
                <p 
                  className="text-3xl font-medium tracking-tight text-black"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  847
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Activity className="text-gray-700" size={20} />
              </div>
            </div>
            <p className="text-green-600 text-xs font-semibold">+23% vs last month</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Revenue</p>
                <p 
                  className="text-3xl font-medium tracking-tight text-black"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  $2.4M
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <TrendingUp className="text-gray-700" size={20} />
              </div>
            </div>
            <p className="text-green-600 text-xs font-semibold">+18% YoY growth</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">API Requests</p>
                <p 
                  className="text-3xl font-medium tracking-tight text-black"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  12.4M
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <BarChart3 className="text-gray-700" size={20} />
              </div>
            </div>
            <p className="text-green-600 text-xs font-semibold">+31% this month</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimulationStatsChart />
          <UsageAnalyticsChart />
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveBusinessesList />
          <RevenueMetricsTable />
        </div>
      </div>
    </div>
  );
}
