'use client';

import { useState, useEffect, Suspense } from 'react';
import { ArrowUpRight, ArrowDownLeft, Download, Zap, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { RevenueComparisonChart } from '@/components/results/revenue-comparison-chart';
import { ProfitComparisonChart } from '@/components/results/profit-comparison-chart';
import { ImpactMetrics } from '@/components/results/impact-metrics';
import { AIRecommendationCard } from '@/components/results/ai-recommendation-card';
import { runSimulation } from '@/lib/simulation-engine';

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

interface Scenario {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  priceIncrease: number;
  employeeCount: number;
  marketingBudget: number;
  supplierDelay: string;
}

interface SimulationResultRecord {
  id: string;
  projectedRevenue: number;
  projectedProfit: number;
  projectedHeadcount: number;
  projectedInventoryRisk: number;
}

interface SimulationData {
  scenario: Scenario & { business: Business & { employees: Employee[] } };
  result: SimulationResultRecord;
  monthlyData: {
    month: string;
    baselineRevenue: number;
    projectedRevenue: number;
    baselineProfit: number;
    projectedProfit: number;
  }[];
  recommendation?: {
    summary: string;
    headline: string;
    details: string;
    considerations: string[];
  } | null;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('scenarioId');
  
  const [data, setData] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState<'30d' | '90d' | '6m' | '12m'>('6m');

  useEffect(() => {
    async function fetchResults() {
      try {
        let targetId = scenarioId;

        // If no scenarioId in URL, fetch list to find the latest completed scenario
        if (!targetId) {
          const listRes = await fetch('/api/scenarios');
          if (listRes.ok) {
            const scenarios = await listRes.json();
            if (scenarios.length > 0) {
              targetId = scenarios[0].id;
            }
          }
        }

        if (targetId) {
          const [detailRes, recoRes] = await Promise.all([
            fetch(`/api/scenarios/${targetId}/results`),
            fetch(`/api/recommendations?scenarioId=${targetId}`)
          ]);

          if (detailRes.ok) {
            const detailData = await detailRes.json();
            let recoData = null;
            if (recoRes && recoRes.ok) {
              recoData = await recoRes.json();
            }
            setData({
              ...detailData,
              recommendation: recoData,
            });
          }
        }
      } catch (err) {
        console.error('Error loading scenario results:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [scenarioId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center text-black">
        <TrendingUp className="w-10 h-10 text-[#2B2644] animate-bounce mb-4" />
        <p className="font-semibold text-lg tracking-tight">Calculating scenario projections...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center text-black p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md text-center shadow-sm">
          <h2 className="text-xl font-semibold mb-2">No Projections Found</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Please build and run a scenario simulation from the builder screen to view outcomes.
          </p>
          <Link 
            href="/scenario-builder"
            className="py-3 px-6 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors inline-block"
          >
            Go to Scenario Builder
          </Link>
        </div>
      </div>
    );
  }

  const { scenario, result, monthlyData } = data;
  const business = scenario.business;

  // Baseline calculations
  const baselineRevenue = business.baselineRevenue;
  const baselinePayroll = business.employees.reduce((sum, emp) => sum + emp.salary, 0);
  const baselineMarketing = business.baselineMarketing;
  const baselineInventory = business.baselineInventory;
  const baselineFixedCosts = business.baselineFixedCosts;
  
  const baselineExpenses = baselinePayroll + baselineMarketing + baselineInventory + baselineFixedCosts;
  const baselineProfit = baselineRevenue - baselineExpenses;
  const baselineProfitMargin = (baselineProfit / baselineRevenue) * 100;

  // Projected calculations
  const projectedRevenue = result.projectedRevenue;
  const projectedProfit = result.projectedProfit;
  const projectedProfitMargin = (projectedProfit / projectedRevenue) * 100;

  // Deltas
  const revDelta = projectedRevenue - baselineRevenue;
  const revDeltaPct = (revDelta / baselineRevenue) * 100;
  
  const profitMarginDelta = projectedProfitMargin - baselineProfitMargin;
  
  // Calculate inventory cost change (inventory scales with demandMultiplier)
  // Let's retrieve this month's projected inventory cost based on our simulation output
  const finalMonthData = monthlyData[monthlyData.length - 1];
  const projectedInventoryCost = baselineInventory * (finalMonthData.projectedRevenue / (baselineRevenue * (1 + scenario.priceIncrease / 100)));

  // ROI: change in profit divided by marketing budget change
  const profitDelta = projectedProfit - baselineProfit;
  const marketingDelta = scenario.marketingBudget - baselineMarketing;
  const roi = marketingDelta > 0 ? (profitDelta / marketingDelta) * 100 : 100;

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-full transition-colors duration-200 no-print"
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
              <p className="text-gray-500 text-sm">
                Scenario: "{scenario.name}" • Run: {new Date(scenario.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full font-medium transition-colors duration-200 no-print"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Revenue Impact</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-medium tracking-tight text-black">
                {revDelta >= 0 ? '+' : ''}${(revDelta / 1000).toFixed(0)}K
              </span>
              <span className={`flex items-center gap-0.5 text-sm font-semibold ${revDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revDelta >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />} 
                {revDeltaPct >= 0 ? '+' : ''}{revDeltaPct.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Projected Profit</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-medium tracking-tight text-black">
                {projectedProfit >= 0 ? '' : '-'}${(Math.abs(projectedProfit) / 1000).toFixed(1)}K
              </span>
              <span className={`flex items-center gap-0.5 text-sm font-semibold ${projectedProfit >= baselineProfit ? 'text-green-600' : 'text-red-600'}`}>
                {projectedProfit >= baselineProfit ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                {profitDelta >= 0 ? '+' : ''}${(profitDelta / 1000).toFixed(0)}K
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-gray-300 transition-colors">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Profit Margin</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-medium tracking-tight text-black">
                {projectedProfitMargin.toFixed(1)}%
              </span>
              <span className={`flex items-center gap-0.5 text-sm font-semibold ${profitMarginDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMarginDelta >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                {profitMarginDelta >= 0 ? '+' : ''}{profitMarginDelta.toFixed(1)}pp
              </span>
            </div>
          </div>

          <div className="bg-[#2B2644] text-white rounded-2xl p-6 shadow-md shadow-[#2B2644]/10">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Inventory Risk</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-medium tracking-tight text-white">
                {(result.projectedInventoryRisk * 100).toFixed(0)}%
              </span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${result.projectedInventoryRisk <= 0.5 ? 'text-green-400' : 'text-amber-400'}`}>
                {result.projectedInventoryRisk <= 0.5 ? 'Low' : 'Moderate'}
              </span>
            </div>
          </div>
        </div>

        {/* Forecast Horizon Tabs */}
        {(() => {
          // Calculate active projection data on-the-fly
          const getChartData = () => {
            if (horizon === '6m') return monthlyData;

            const totalSalary = business.employees.reduce((sum, emp) => sum + emp.salary, 0);
            const averageEmployeeSalary = business.employees.length > 0 ? totalSalary / business.employees.length : 4000;

            const output = runSimulation(
              {
                baselineRevenue: business.baselineRevenue,
                baselineMarketing: business.baselineMarketing,
                baselineInventory: business.baselineInventory,
                baselineFixedCosts: business.baselineFixedCosts,
                baselineHeadcount: business.employees.length || 24,
                averageEmployeeSalary,
              },
              {
                priceIncrease: scenario.priceIncrease,
                employeeCount: scenario.employeeCount,
                marketingBudget: scenario.marketingBudget,
                supplierDelay: scenario.supplierDelay,
                horizon,
              }
            );
            return output.monthlyData;
          };

          const chartData = getChartData();

          return (
            <>
              <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm no-print">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Forecast Projection Horizon
                </span>
                <div className="flex bg-[#F5F5F5] p-1 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setHorizon('30d')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      horizon === '30d' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    30d (Weekly)
                  </button>
                  <button
                    onClick={() => setHorizon('90d')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      horizon === '90d' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    90d
                  </button>
                  <button
                    onClick={() => setHorizon('6m')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      horizon === '6m' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    6 Months
                  </button>
                  <button
                    onClick={() => setHorizon('12m')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      horizon === '12m' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    12 Months
                  </button>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueComparisonChart data={chartData} />
                <ProfitComparisonChart data={chartData} />
              </div>
            </>
          );
        })()}

        {/* Impact Metrics */}
        <ImpactMetrics 
          baselineHeadcount={business.employees.length}
          projectedHeadcount={result.projectedHeadcount}
          baselineInventory={baselineInventory}
          projectedInventory={Math.round(projectedInventoryCost)}
          supplierDelay={scenario.supplierDelay}
        />

        {/* AI Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIRecommendationCard 
              scenarioName={scenario.name}
              projectedRevenue={projectedRevenue}
              projectedProfit={projectedProfit}
              baselineRevenue={baselineRevenue}
              baselineProfit={baselineProfit}
              recommendation={data.recommendation}
            />
          </div>
          
          {/* Next Steps */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-black font-medium tracking-tight mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2B2644]"></span>
              Execution Timeline
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <span className="text-[#2B2644] font-semibold text-sm">1.</span>
                <span className="text-gray-600 text-sm leading-relaxed">
                  {scenario.priceIncrease > 0 
                    ? `Initiate menu price adjustments up by ${scenario.priceIncrease}%`
                    : 'Maintain pricing structure'
                  }
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[#2B2644] font-semibold text-sm">2.</span>
                <span className="text-gray-600 text-sm leading-relaxed">
                  {scenario.employeeCount > business.employees.length
                    ? `Begin hiring campaign for ${scenario.employeeCount - business.employees.length} new employee(s)`
                    : scenario.employeeCount < business.employees.length
                    ? `Optimize staff rosters to target ${scenario.employeeCount} active headcount`
                    : 'Keep staffing levels constant'
                  }
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[#2B2644] font-semibold text-sm">3.</span>
                <span className="text-gray-600 text-sm leading-relaxed">
                  Adjust monthly marketing spend allocation to ${scenario.marketingBudget.toLocaleString()}
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[#2B2644] font-semibold text-sm">4.</span>
                <span className="text-gray-600 text-sm leading-relaxed">
                  {scenario.supplierDelay !== 'none'
                    ? 'Buffer supply inventory to mitigate delay risk'
                    : 'Maintain standard inventory replenishment frequency'
                  }
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center text-black">
        <TrendingUp className="w-10 h-10 text-[#2B2644] animate-bounce mb-4" />
        <p className="font-semibold text-lg tracking-tight">Loading simulation results...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
