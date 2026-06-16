'use client';

import { ArrowUpRight, ArrowDownLeft, Download, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RevenueComparisonChart } from '@/components/results/revenue-comparison-chart';
import { ProfitComparisonChart } from '@/components/results/profit-comparison-chart';
import { ImpactMetrics } from '@/components/results/impact-metrics';
import { AIRecommendationCard } from '@/components/results/ai-recommendation-card';

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-full transition-colors duration-200"
            >
              <ArrowLeft size={18} className="text-black" />
            </Link>
            <div>
              <h1 
                className="text-3xl md:text-4xl font-medium tracking-tight text-black mb-1"
                style={{ letterSpacing: '-0.03em' }}
              >
                Simulation Results
              </h1>
              <p className="text-gray-500 text-sm">Scenario: "Q3 Growth Initiative" • Run: 14 Jun 2024</p>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full font-medium transition-colors duration-200">
            <Download size={18} />
            Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Revenue Impact</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium tracking-tight text-black">+$450K</span>
              <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <ArrowUpRight size={16} /> +18.2%
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Profit Margin</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium tracking-tight text-black">+6.2%</span>
              <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <ArrowUpRight size={16} /> +2.1pp
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Inventory Risk</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium tracking-tight text-black">-$125K</span>
              <span className="flex items-center gap-1 text-red-650 text-sm font-semibold">
                <ArrowDownLeft size={16} /> -9.3%
              </span>
            </div>
          </div>
          <div className="bg-[#2B2644] text-white rounded-2xl p-6 shadow-md shadow-[#2B2644]/10">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">ROI</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium tracking-tight text-white">340%</span>
              <span className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                <Zap size={16} className="fill-current" /> Excellent
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
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-black font-medium tracking-tight mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2B2644]"></span>
              Next Steps
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <span className="text-[#2B2644] font-semibold text-sm">1.</span>
                <span className="text-gray-600 text-sm leading-relaxed">Review profit margins and adjust pricing strategy</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[#2B2644] font-semibold text-sm">2.</span>
                <span className="text-gray-600 text-sm leading-relaxed">Implement inventory management improvements</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[#2B2644] font-semibold text-sm">3.</span>
                <span className="text-gray-600 text-sm leading-relaxed">Scale marketing budget across new channels</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[#2B2644] font-semibold text-sm">4.</span>
                <span className="text-gray-600 text-sm leading-relaxed">Plan hiring timeline for 35 new employees</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
