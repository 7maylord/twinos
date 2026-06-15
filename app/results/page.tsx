'use client';

import { ArrowUpRight, ArrowDownLeft, Download, Zap } from 'lucide-react';
import { RevenueComparisonChart } from '@/components/results/revenue-comparison-chart';
import { ProfitComparisonChart } from '@/components/results/profit-comparison-chart';
import { ImpactMetrics } from '@/components/results/impact-metrics';
import { AIRecommendationCard } from '@/components/results/ai-recommendation-card';

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Simulation Results</h1>
            <p className="text-slate-400">Scenario: "Q3 Growth Initiative" • Run: 14 Jun 2024</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-medium transition-all">
            <Download size={18} />
            Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/60 transition-colors">
            <p className="text-slate-400 text-sm mb-2">Revenue Impact</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">+$450K</span>
              <span className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUpRight size={16} /> +18.2%
              </span>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/60 transition-colors">
            <p className="text-slate-400 text-sm mb-2">Profit Margin</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">+6.2%</span>
              <span className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUpRight size={16} /> +2.1pp
              </span>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/60 transition-colors">
            <p className="text-slate-400 text-sm mb-2">Inventory Risk</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">-$125K</span>
              <span className="flex items-center gap-1 text-red-400 text-sm">
                <ArrowDownLeft size={16} /> -9.3%
              </span>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/60 transition-colors">
            <p className="text-slate-400 text-sm mb-2">ROI</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">340%</span>
              <span className="flex items-center gap-1 text-green-400 text-sm">
                <Zap size={16} /> Excellent
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueComparisonChart />
          <ProfitComparisonChart />
        </div>

        {/* Impact Metrics */}
        <ImpactMetrics />

        {/* AI Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIRecommendationCard />
          </div>
          
          {/* Next Steps */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Next Steps
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-cyan-400 font-semibold">1.</span>
                <span className="text-slate-300 text-sm">Review profit margins and adjust pricing strategy</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-semibold">2.</span>
                <span className="text-slate-300 text-sm">Implement inventory management improvements</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-semibold">3.</span>
                <span className="text-slate-300 text-sm">Scale marketing budget across new channels</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-semibold">4.</span>
                <span className="text-slate-300 text-sm">Plan hiring timeline for 35 new employees</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
