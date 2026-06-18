'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/header';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Scenario {
  id: string;
  name: string;
  priceIncrease: number;
  employeeCount: number;
  marketingBudget: number;
  supplierDelay: string;
}

interface MonthlyData {
  month: string;
  baselineRevenue: number;
  projectedRevenue: number;
  baselineProfit: number;
  projectedProfit: number;
}

interface ScenarioDetails {
  scenario: Scenario;
  result: {
    projectedRevenue: number;
    projectedProfit: number;
    projectedHeadcount: number;
    projectedInventoryRisk: number;
  };
  monthlyData: MonthlyData[];
}

export default function ComparePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Selected scenario IDs
  const [selA, setSelA] = useState<string>('');
  const [selB, setSelB] = useState<string>('');

  // Details for A and B
  const [detailsA, setDetailsA] = useState<ScenarioDetails | null>(null);
  const [detailsB, setDetailsB] = useState<ScenarioDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch list of scenarios
  useEffect(() => {
    async function getScenarios() {
      try {
        const res = await fetch('/api/scenarios');
        if (res.ok) {
          const list = await res.json();
          setScenarios(list);
          if (list.length > 0) {
            setSelA(list[0].id);
            if (list.length > 1) {
              setSelB(list[1].id);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    }
    getScenarios();
  }, []);

  // Fetch details when selections change
  useEffect(() => {
    async function getDetails() {
      if (!selA) return;
      setLoadingDetails(true);
      try {
        const [resA, resB] = await Promise.all([
          fetch(`/api/scenarios/${selA}/results`),
          selB ? fetch(`/api/scenarios/${selB}/results`) : null,
        ]);

        if (resA.ok) {
          const dataA = await resA.json();
          setDetailsA(dataA);
        } else {
          setDetailsA(null);
        }

        if (resB && resB.ok) {
          const dataB = await resB.json();
          setDetailsB(dataB);
        } else {
          setDetailsB(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    }
    getDetails();
  }, [selA, selB]);

  // Combined chart data helper
  const getCombinedChartData = () => {
    if (!detailsA) return [];
    
    // Use A's monthly data structure
    return detailsA.monthlyData.map((item, index) => {
      const bItem = detailsB?.monthlyData?.[index];
      return {
        month: item.month,
        baseline: Math.round(item.baselineRevenue / 1000),
        scenarioA: Math.round(item.projectedRevenue / 1000),
        scenarioB: bItem ? Math.round(bItem.projectedRevenue / 1000) : null,
      };
    });
  };

  const chartData = getCombinedChartData();

  if (loadingList) {
    return (
      <div className="flex h-screen bg-[#F5F5F5] text-black overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <DashboardHeader />
          <div className="p-6 lg:p-8 flex items-center justify-center h-[calc(100vh-100px)]">
            <p className="font-semibold text-lg animate-pulse">Loading scenarios list...</p>
          </div>
        </main>
      </div>
    );
  }

  // Baseline values (referenced from seed Café details)
  const baseRevenue = 180000;
  const baseProfit = -11500;
  const baseHeadcount = 24;
  const baseInventoryRisk = 0.50;

  return (
    <div className="flex h-screen bg-[#F5F5F5] text-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardHeader />
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-black mb-2" style={{ letterSpacing: '-0.03em' }}>
              Scenario Comparison
            </h1>
            <p className="text-gray-500 text-sm">
              Select any two simulated scenarios to contrast their projected outcomes side-by-side.
            </p>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Scenario A (Primary)
              </label>
              <select
                value={selA}
                onChange={(e) => setSelA(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black font-medium focus:outline-none focus:border-black transition-colors"
              >
                {scenarios.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
                {scenarios.length === 0 && <option value="">No scenarios available</option>}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Scenario B (Comparison)
              </label>
              <select
                value={selB}
                onChange={(e) => setSelB(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black font-medium focus:outline-none focus:border-black transition-colors"
              >
                <option value="">-- None (Compare with Baseline Only) --</option>
                {scenarios
                  .filter((sc) => sc.id !== selA)
                  .map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-20 bg-white border border-gray-200 rounded-2xl animate-pulse">
              <RefreshCw className="animate-spin text-gray-400 mr-2" />
              <p className="font-semibold text-sm text-gray-500">Recalculating comparative timelines...</p>
            </div>
          ) : !detailsA ? (
            <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-400 text-sm">Please select scenarios above to run comparison.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Metric grid comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4">Revenue Projections</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 gap-2">
                      <span className="text-gray-500 truncate min-w-0" title="Baseline">Baseline</span>
                      <span className="font-medium text-gray-800 shrink-0">${(baseRevenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 gap-2">
                      <span className="font-medium text-black truncate min-w-0" title={`A: ${detailsA.scenario.name}`}>
                        A: {detailsA.scenario.name}
                      </span>
                      <span className="font-semibold text-[#2B2644] shrink-0">
                        ${(detailsA.result.projectedRevenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                    {detailsB && (
                      <div className="flex justify-between items-center text-sm pb-1 gap-2">
                        <span className="text-gray-600 truncate min-w-0" title={`B: ${detailsB.scenario.name}`}>
                          B: {detailsB.scenario.name}
                        </span>
                        <span className="font-semibold text-indigo-600 shrink-0">
                          ${(detailsB.result.projectedRevenue / 1000).toFixed(0)}K
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profit card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4">Profit Projections</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 gap-2">
                      <span className="text-gray-500 truncate min-w-0" title="Baseline">Baseline</span>
                      <span className="font-medium text-red-500 shrink-0">-${(Math.abs(baseProfit) / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 gap-2">
                      <span className="font-medium text-black truncate min-w-0" title={`A: ${detailsA.scenario.name}`}>
                        A: {detailsA.scenario.name}
                      </span>
                      <span className={`font-semibold shrink-0 ${detailsA.result.projectedProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {detailsA.result.projectedProfit >= 0 ? '' : '-'}${(Math.abs(detailsA.result.projectedProfit) / 1000).toFixed(1)}K
                      </span>
                    </div>
                    {detailsB && (
                      <div className="flex justify-between items-center text-sm pb-1 gap-2">
                        <span className="text-gray-650 truncate min-w-0" title={`B: ${detailsB.scenario.name}`}>
                          B: {detailsB.scenario.name}
                        </span>
                        <span className={`font-semibold shrink-0 ${detailsB.result.projectedProfit >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                          {detailsB.result.projectedProfit >= 0 ? '' : '-'}${(Math.abs(detailsB.result.projectedProfit) / 1000).toFixed(1)}K
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Staffing card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4">Simulated Headcount</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 gap-2">
                      <span className="text-gray-500 truncate min-w-0" title="Baseline">Baseline</span>
                      <span className="font-medium text-gray-800 shrink-0">{baseHeadcount} staff</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 gap-2">
                      <span className="font-medium text-black truncate min-w-0" title={`A: ${detailsA.scenario.name}`}>
                        A: {detailsA.scenario.name}
                      </span>
                      <span className="font-semibold text-[#2B2644] shrink-0">{detailsA.result.projectedHeadcount} staff</span>
                    </div>
                    {detailsB && (
                      <div className="flex justify-between items-center text-sm pb-1 gap-2">
                        <span className="text-gray-650 truncate min-w-0" title={`B: ${detailsB.scenario.name}`}>
                          B: {detailsB.scenario.name}
                        </span>
                        <span className="font-semibold text-indigo-600 shrink-0">{detailsB.result.projectedHeadcount} staff</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock risk card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4">Stockout Risk</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 gap-2">
                      <span className="text-gray-500 truncate min-w-0" title="Baseline">Baseline</span>
                      <span className="font-medium text-gray-800 shrink-0">{(baseInventoryRisk * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 gap-2">
                      <span className="font-medium text-black truncate min-w-0" title={`A: ${detailsA.scenario.name}`}>
                        A: {detailsA.scenario.name}
                      </span>
                      <span className={`font-semibold shrink-0 ${detailsA.result.projectedInventoryRisk > 0.5 ? 'text-amber-600' : 'text-green-600'}`}>
                        {(detailsA.result.projectedInventoryRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                    {detailsB && (
                      <div className="flex justify-between items-center text-sm pb-1 gap-2">
                        <span className="text-gray-650 truncate min-w-0" title={`B: ${detailsB.scenario.name}`}>
                          B: {detailsB.scenario.name}
                        </span>
                        <span className={`font-semibold shrink-0 ${detailsB.result.projectedInventoryRisk > 0.5 ? 'text-amber-600' : 'text-green-600'}`}>
                          {(detailsB.result.projectedInventoryRisk * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Combined Chart */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart2 className="w-5 h-5 text-black" />
                  <h3 className="text-black font-medium tracking-tight text-lg">Timeline Projections (Revenue Curves)</h3>
                </div>
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                    <XAxis dataKey="month" stroke="#999999" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#999999" style={{ fontSize: '12px' }} tickFormatter={(val) => `$${val}K`} />
                    <Tooltip
                      formatter={(value) => [`$${value}K`, '']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E5E5',
                        borderRadius: '12px',
                        color: '#000000',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      stroke="#999999"
                      strokeWidth={2}
                      dot={false}
                      name="Baseline Trend"
                      strokeDasharray="4 4"
                      isAnimationActive={true}
                    />
                    <Line
                      type="monotone"
                      dataKey="scenarioA"
                      stroke="#2B2644"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#2B2644' }}
                      name={`A: ${detailsA.scenario.name}`}
                      isAnimationActive={true}
                    />
                    {detailsB && (
                      <Line
                        type="monotone"
                        dataKey="scenarioB"
                        stroke="#A29BFE"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#A29BFE' }}
                        name={`B: ${detailsB.scenario.name}`}
                        isAnimationActive={true}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
