'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import { SimulationStatsChart } from '@/components/admin/simulation-stats-chart';
import { UsageAnalyticsChart } from '@/components/admin/usage-analytics-chart';
import { ActiveBusinessesList } from '@/components/admin/active-businesses-list';
import { RevenueMetricsTable } from '@/components/admin/revenue-metrics-table';

interface AdminStats {
  activeBusinessesCount: number;
  monthlySimulationsCount: number;
  totalMRR: number;
  businesses: Array<{
    id: string | number;
    name: string;
    simulations: number;
    users: number;
    status: string;
  }>;
  recentSimulations: Array<{
    id: string | number;
    category: string;
    mrrValue: string;
    growth: string;
    trend: 'up' | 'down';
  }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) {
          throw new Error('Failed to fetch admin stats');
        }
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching admin stats:', err);
        setError(err.message || 'An error occurred while loading stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-black p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <AdminHeader />
          {/* Skeleton KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse min-h-[140px]">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
          {/* Skeleton Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 h-[350px]"></div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 h-[350px]"></div>
          </div>
        </div>
      </div>
    );
  }

  const activeBusinesses = stats?.activeBusinessesCount ?? 0;
  const monthlySimulations = stats?.monthlySimulationsCount ?? 0;
  const totalMRR = stats?.totalMRR ?? 0;
  const businesses = stats?.businesses ?? [];
  const recentSimulations = stats?.recentSimulations ?? [];

  const totalRevenueFormatted = `$${(totalMRR / 1000).toFixed(0)}K`;
  const apiRequests = activeBusinesses > 0 ? `${(activeBusinesses * 0.08 + 12.4).toFixed(1)}M` : '0M';

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <AdminHeader />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
            {error}
          </div>
        )}

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
                  {activeBusinesses}
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-full">
                <Users className="text-white" size={20} />
              </div>
            </div>
            <p className="text-green-400 text-xs font-semibold">Live database twins</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Simulations</p>
                <p 
                  className="text-3xl font-medium tracking-tight text-black"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {monthlySimulations}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Activity className="text-gray-700" size={20} />
              </div>
            </div>
            <p className="text-green-600 text-xs font-semibold">Active simulation runs</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Twin Baseline MRR</p>
                <p 
                  className="text-3xl font-medium tracking-tight text-black"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {totalRevenueFormatted}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <TrendingUp className="text-gray-700" size={20} />
              </div>
            </div>
            <p className="text-green-600 text-xs font-semibold">Aggregated twin MRR</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Simulated API Load</p>
                <p 
                  className="text-3xl font-medium tracking-tight text-black"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {apiRequests}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <BarChart3 className="text-gray-700" size={20} />
              </div>
            </div>
            <p className="text-green-600 text-xs font-semibold">Calculated traffic</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimulationStatsChart isEmpty={activeBusinesses === 0} />
          <UsageAnalyticsChart isEmpty={activeBusinesses === 0} />
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveBusinessesList businesses={businesses} />
          <RevenueMetricsTable metrics={recentSimulations} totalMRR={totalMRR} />
        </div>
      </div>
    </div>
  );
}
