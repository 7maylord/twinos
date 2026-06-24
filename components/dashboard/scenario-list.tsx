'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Clock, CheckCircle, Plus } from 'lucide-react';
import Link from 'next/link';

interface SimulationResult {
  id: string;
  projectedRevenue: number;
  projectedProfit: number;
  projectedHeadcount: number;
  projectedInventoryRisk: number;
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
  simulationResults?: SimulationResult[];
}

export default function ScenarioList() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [baseline, setBaseline] = useState<{ revenue: number; profit: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [scenariosRes, businessRes] = await Promise.all([
          fetch('/api/scenarios'),
          fetch('/api/business'),
        ]);
        if (scenariosRes.ok) {
          setScenarios(await scenariosRes.json());
        }
        if (businessRes.ok) {
          const b = await businessRes.json();
          const totalPayroll = (b.employees || []).reduce((sum: number, e: any) => sum + e.salary, 0);
          setBaseline({
            revenue: b.baselineRevenue,
            profit: b.baselineRevenue - totalPayroll - b.baselineMarketing - b.baselineInventory - b.baselineFixedCosts,
          });
        }
      } catch (err) {
        console.error('Error fetching scenario list data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium tracking-tight text-black">Recent Scenarios</h2>
          <p className="text-sm text-gray-500">Your simulated business scenarios</p>
        </div>
        <Link 
          href="/scenario-builder"
          className="flex items-center gap-1.5 py-2 px-4 bg-black text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition-colors"
        >
          <Plus size={14} />
          New Scenario
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : scenarios.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm">No scenarios created yet.</p>
          <Link 
            href="/scenario-builder" 
            className="text-xs font-semibold text-[#2B2644] underline mt-1 inline-block"
          >
            Create your first simulation
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scenarios.map((scenario) => {
            const latestResult = scenario.simulationResults?.[0];
            
            const baselineRevenue = baseline?.revenue ?? 0;
            const projectedRevenue = latestResult ? latestResult.projectedRevenue : baselineRevenue;
            const revDeltaPercent = baselineRevenue > 0
              ? ((projectedRevenue - baselineRevenue) / baselineRevenue) * 100
              : 0;
            const impactText = revDeltaPercent >= 0 ? `+${revDeltaPercent.toFixed(1)}% rev` : `${revDeltaPercent.toFixed(1)}% rev`;

            return (
              <Link
                key={scenario.id}
                href={`/results?scenarioId=${scenario.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-150 hover:border-black/30 hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2B2644]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#2B2644]" />
                  </div>
                  <div>
                    <p className="font-medium text-black group-hover:text-[#2B2644] transition-colors">
                      {scenario.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDistanceToNow(scenario.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-medium text-green-600">
                      {latestResult ? impactText : '--'}
                    </p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      scenario.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : scenario.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-[#2B2644]/10 text-[#2B2644]'
                    }`}>
                      {scenario.status}
                    </span>
                  </div>
                  <div>
                    {scenario.status === 'COMPLETED' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
