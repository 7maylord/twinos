'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/header';
import { Target, TrendingUp, RefreshCw, Sparkles, CheckSquare, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MetricDelta {
  revenue: number;
  profit: number;
  headcount: number;
  inventoryRisk: number;
}

interface OptimizationResult {
  targetValue: number;
  baselineValue: number;
  targetGrowthPct: number;
  targetType: string;
  baselineMetrics: MetricDelta;
  optimizedMetrics: MetricDelta;
  adjustments: {
    priceIncrease: number;
    employeeCount: number;
    marketingBudget: number;
    supplierDelay: string;
  };
  actionPlan: string[];
}

export default function OptimizePage() {
  const [targetType, setTargetType] = useState<'profit' | 'revenue'>('profit');
  const [targetGrowthPct, setTargetGrowthPct] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [stepMsg, setStepMsg] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const runOptimization = async () => {
    setLoading(true);
    setResult(null);

    // Simulate search iterations for premium AI visual effect
    const messages = [
      'Initializing Hill Climbing state space...',
      'Mapping baseline business metrics...',
      'Iteration 50: priceIncrease +2.5%, headcount +1, cost-benefit ratio = 1.15',
      'Iteration 150: priceIncrease +5.0%, headcount +2, cost-benefit ratio = 1.48',
      'Iteration 300: priceIncrease +8.5%, headcount +3, cost-benefit ratio = 1.95',
      'Iteration 500: priceIncrease +9.5%, marketingBudget +$4,500, margin met...',
      'Optimizing for minimum change cost... done.',
    ];

    for (let i = 0; i < messages.length; i++) {
      setStepMsg(messages[i]);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    try {
      const res = await fetch('/api/scenarios/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetGrowthPct,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const err = await res.json();
        toast.error(`Optimization search failed: ${err.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error running optimization.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const getChartData = () => {
    if (!result) return [];
    return [
      {
        name: 'Gross Revenue',
        Baseline: Math.round(result.baselineMetrics.revenue / 1000),
        Optimized: Math.round(result.optimizedMetrics.revenue / 1000),
      },
      {
        name: 'Net Profit',
        Baseline: Math.round(result.baselineMetrics.profit / 1000),
        Optimized: Math.round(result.optimizedMetrics.profit / 1000),
      },
    ];
  };

  const chartData = getChartData();

  return (
    <div className="flex h-screen bg-[#F5F5F5] text-black overflow-hidden print:overflow-visible print:h-auto print:bg-white">
      <div className="print:hidden h-full"><Sidebar /></div>
      <main className="flex-1 overflow-auto print:overflow-visible">
        <div className="print:hidden"><DashboardHeader /></div>
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="print:hidden">
            <h1 className="text-3xl font-medium tracking-tight text-black mb-2" style={{ letterSpacing: '-0.03em' }}>
              Counterfactual Explorer
            </h1>
            <p className="text-gray-500 text-sm">
              Define target financial targets to reverse-calculate the smallest operational and pricing updates needed to hit them.
            </p>
          </div>

          {/* Print Header */}
          <div className="hidden print:block mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-black mb-1">TwinOS Optimization Report</h1>
            <p className="text-gray-500 font-medium">Target Goal: Increase {targetType === 'profit' ? 'Profit' : 'Revenue'} by {targetGrowthPct}%</p>
          </div>

          {/* Goal Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm print:hidden">
            <div className="md:col-span-2 space-y-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Specify Financial Growth Goal
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex bg-[#F5F5F5] p-1 rounded-xl border border-gray-250/20">
                  <button
                    onClick={() => setTargetType('profit')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      targetType === 'profit' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Increase Profit
                  </button>
                  <button
                    onClick={() => setTargetType('revenue')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      targetType === 'revenue' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Increase Revenue
                  </button>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Target Growth Rate:</span>
                    <span className="font-bold text-[#2B2644] text-base">+{targetGrowthPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={targetGrowthPct}
                    onChange={(e) => setTargetGrowthPct(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={runOptimization}
                disabled={loading}
                className="w-full py-3.5 px-6 bg-[#2B2644] hover:bg-[#1f1b33] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-80 shadow-sm"
              >
                <Target size={18} />
                Calculate Optimal Path
              </button>
            </div>
          </div>

          {/* Search loader state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
              <RefreshCw className="animate-spin text-[#2B2644]" size={36} />
              <p className="font-semibold text-[#2B2644] text-sm">Running Optimization Search...</p>
              <p className="text-gray-500 text-xs animate-pulse">{stepMsg}</p>
            </div>
          )}

          {/* Results dashboard */}
          {result && !loading && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center print:hidden border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-black tracking-tight">Optimization Results</h2>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full font-medium transition-colors duration-200 shadow-sm"
                >
                  <Download size={18} />
                  Export Report
                </button>
              </div>

              {/* Card delta layouts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Revenue Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Revenue Projection</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-gray-50 pb-1.5">
                      <span className="text-gray-400">Baseline</span>
                      <span className="text-gray-700">${(result.baselineMetrics.revenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-semibold text-black">
                        ${(result.optimizedMetrics.revenue / 1000).toFixed(0)}K
                      </span>
                      <span className="text-xs font-bold text-green-600">
                        +{((result.optimizedMetrics.revenue - result.baselineMetrics.revenue) / result.baselineMetrics.revenue * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profit Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Profit Projection</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-gray-50 pb-1.5">
                      <span className="text-gray-400">Baseline</span>
                      <span className={`${result.baselineMetrics.profit >= 0 ? 'text-gray-700' : 'text-red-500'}`}>
                        {result.baselineMetrics.profit >= 0 ? '' : '-'}${(Math.abs(result.baselineMetrics.profit) / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-semibold text-black">
                        {result.optimizedMetrics.profit >= 0 ? '' : '-'}${(Math.abs(result.optimizedMetrics.profit) / 1000).toFixed(1)}K
                      </span>
                      <span className="text-xs font-bold text-green-600">
                        {result.optimizedMetrics.profit >= result.baselineMetrics.profit ? '+' : ''}
                        ${((result.optimizedMetrics.profit - result.baselineMetrics.profit) / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>

                {/* Headcount Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Headcount Allocation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-gray-50 pb-1.5">
                      <span className="text-gray-400">Baseline</span>
                      <span className="text-gray-700">{result.baselineMetrics.headcount} staff</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-semibold text-black">
                        {result.optimizedMetrics.headcount} staff
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {result.optimizedMetrics.headcount - result.baselineMetrics.headcount >= 0 ? '+' : ''}
                        {result.optimizedMetrics.headcount - result.baselineMetrics.headcount} staff
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stockout Risk Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Stockout Risk</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-gray-50 pb-1.5">
                      <span className="text-gray-400">Baseline</span>
                      <span className="text-gray-700">{(result.baselineMetrics.inventoryRisk * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className={`text-2xl font-semibold ${result.optimizedMetrics.inventoryRisk > 0.5 ? 'text-amber-600' : 'text-green-605 text-green-600'}`}>
                        {(result.optimizedMetrics.inventoryRisk * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {result.optimizedMetrics.inventoryRisk <= result.baselineMetrics.inventoryRisk ? 'Optimized' : 'Increased'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chart & Action Plan Checklist */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bar chart comparison */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-black" />
                    <h3 className="text-black font-medium tracking-tight text-lg">Financial Plan Comparison</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                      <XAxis dataKey="name" stroke="#999999" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#999999" style={{ fontSize: '12px' }} tickFormatter={(val) => `$${val}K`} />
                      <Tooltip
                        formatter={(value) => [`$${value}K`, '']}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E5E5',
                          borderRadius: '12px',
                          color: '#000000',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Baseline" fill="#999999" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Optimized" fill="#2B2644" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Recommended action items */}
                <div className="bg-[#2B2644] text-white border border-transparent rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="text-white" size={22} />
                      <h3 className="text-white font-medium tracking-tight text-lg">Recommended Action Plan</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-white/70 text-xs mb-4">
                        Tackle these step-by-step actions to satisfy the goal with minimal disruption.
                      </p>
                      
                      <div className="space-y-3">
                        {result.actionPlan.map((action, index) => (
                          <div key={index} className="flex gap-3 items-start bg-white/10 rounded-xl p-3 border border-white/10 hover:bg-white/15 transition-colors">
                            <CheckSquare className="text-white/60 flex-shrink-0 mt-0.5 cursor-pointer hover:text-white transition-colors" size={16} />
                            <p className="text-xs text-white/90 leading-relaxed font-medium">
                              {action}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/10 space-y-2">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Price Adj:</span>
                      <span className="font-semibold text-white">+{result.adjustments.priceIncrease.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Staff Headcount:</span>
                      <span className="font-semibold text-white">{result.adjustments.employeeCount} staff</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Marketing Budget:</span>
                      <span className="font-semibold text-white">${result.adjustments.marketingBudget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
