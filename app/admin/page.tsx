'use client';

import { TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import { BusinessMetricsGrid } from '@/components/admin/business-metrics-grid';
import { SimulationStatsChart } from '@/components/admin/simulation-stats-chart';
import { UsageAnalyticsChart } from '@/components/admin/usage-analytics-chart';
import { ActiveBusinessesList } from '@/components/admin/active-businesses-list';
import { RevenueMetricsTable } from '@/components/admin/revenue-metrics-table';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <AdminHeader />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/60 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Active Businesses</p>
                <p className="text-3xl font-bold text-white">142</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg group-hover:from-indigo-500/30 group-hover:to-indigo-600/30 transition-colors">
                <Users className="text-indigo-400" size={24} />
              </div>
            </div>
            <p className="text-green-400 text-sm">+12 this month</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/60 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Monthly Simulations</p>
                <p className="text-3xl font-bold text-white">847</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg group-hover:from-cyan-500/30 group-hover:to-cyan-600/30 transition-colors">
                <Activity className="text-cyan-400" size={24} />
              </div>
            </div>
            <p className="text-green-400 text-sm">+23% vs last month</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/60 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-white">$2.4M</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg group-hover:from-green-500/30 group-hover:to-green-600/30 transition-colors">
                <TrendingUp className="text-green-400" size={24} />
              </div>
            </div>
            <p className="text-green-400 text-sm">+18% YoY growth</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/60 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">API Requests</p>
                <p className="text-3xl font-bold text-white">12.4M</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-colors">
                <BarChart3 className="text-purple-400" size={24} />
              </div>
            </div>
            <p className="text-green-400 text-sm">+31% this month</p>
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
