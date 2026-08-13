'use client';

import { useState, useEffect } from 'react';
import { Play, AlertTriangle, Sparkles, ChevronDown, ChevronUp, Siren, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { getScenarioTemplates, applyScenarioTemplate, CRISIS_TEMPLATES } from '@/lib/scenario-templates';
import { getIndustryProfile } from '@/lib/industry-profiles';

export default function ScenarioForm() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [scenarioName, setScenarioName] = useState('Menu Price Increase & Marketing Push');
  const [priceIncrease, setPriceIncrease] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [marketingBudget, setMarketingBudget] = useState(0);
  const [supplierDelay, setSupplierDelay] = useState('none');
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [templateMode, setTemplateMode] = useState<'growth' | 'crisis'>('growth');
  // Empty string = "use the industry default" (see lib/industry-profiles.ts).
  const [priceElasticityInput, setPriceElasticityInput] = useState('');
  const [marketingElasticityInput, setMarketingElasticityInput] = useState('');

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await fetch('/api/business');
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
          setEmployeeCount(data.employees?.length || 0);
          setMarketingBudget(data.baselineMarketing || 0);
        }
      } catch (err) {
        console.error('Error fetching business for scenario form:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  const handleApplyTemplate = (template: ReturnType<typeof getScenarioTemplates>[number]) => {
    if (!business) return;
    const applied = applyScenarioTemplate(template, {
      currentHeadcount: business.employees?.length || 0,
      baselineMarketing: business.baselineMarketing || 0,
    });
    setScenarioName(template.name);
    setPriceIncrease(applied.priceIncrease);
    setEmployeeCount(applied.employeeCount);
    setMarketingBudget(applied.marketingBudget);
    setSupplierDelay(applied.supplierDelay);
    setPriceElasticityInput('');
    setMarketingElasticityInput('');
  };

  const handleRunSimulation = async () => {
    if (!business || !scenarioName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/scenarios/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scenarioName,
          priceIncrease,
          employeeCount,
          marketingBudget,
          supplierDelay,
          businessId: business.id,
          priceElasticityOverride: priceElasticityInput === '' ? undefined : Number(priceElasticityInput),
          marketingElasticityOverride: marketingElasticityInput === '' ? undefined : Number(marketingElasticityInput),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to results screen with the generated scenarioId
        router.push(`/results?scenarioId=${data.result.scenarioId}`);
      } else {
        const errorData = await res.json();
        toast.error(`Failed to run simulation: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error submitting simulation:', err);
      toast.error('Network error while running simulation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm animate-pulse min-h-[500px]">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="space-y-6">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-14 bg-gray-200 rounded w-full"></div>
          <div className="h-14 bg-gray-200 rounded w-full"></div>
          <div className="h-14 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-medium tracking-tight text-black mb-8">Configure Scenario</h2>

      {!business && (
        <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm shadow-sm transition-all duration-300 mb-8">
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-950 text-base leading-none mb-1">No Active Digital Twin</h4>
              <p className="text-amber-900/80 text-xs font-medium">To simulate business scenarios, you need to set up your business profile first.</p>
            </div>
          </div>
          <a href="/onboarding" className="py-2.5 px-5 bg-amber-950 text-white text-xs font-semibold rounded-full hover:bg-amber-900 transition-colors shadow-sm self-start sm:self-auto shrink-0 text-center">
            Create Twin
          </a>
        </div>
      )}

      {/* Starter Templates / Crisis Playbooks */}
      {business && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              {templateMode === 'crisis' ? <Siren className="w-4 h-4 text-red-600" /> : <Sparkles className="w-4 h-4" />}
              {templateMode === 'crisis' ? 'Crisis Playbooks' : `Starter Templates for ${business.industry || 'Your Business'}`}
            </label>
            <div className="flex bg-[#F5F5F5] p-1 rounded-full border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTemplateMode('growth')}
                className={`px-3 py-1 rounded-full transition-colors ${templateMode === 'growth' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'}`}
              >
                Growth
              </button>
              <button
                type="button"
                onClick={() => setTemplateMode('crisis')}
                className={`px-3 py-1 rounded-full transition-colors ${templateMode === 'crisis' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-black'}`}
              >
                Crisis
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(templateMode === 'crisis' ? CRISIS_TEMPLATES : getScenarioTemplates(business.industry)).map((template) => (
              <button
                key={template.name}
                type="button"
                disabled={submitting}
                onClick={() => handleApplyTemplate(template)}
                title={template.description}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors disabled:opacity-60 border ${
                  templateMode === 'crisis'
                    ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800'
                    : 'bg-[#F5F5F5] hover:bg-gray-200 border-gray-200 text-gray-700'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>

          {templateMode === 'crisis' && (
            <div className="mt-4 flex items-center justify-between gap-4 p-4 bg-red-50/60 border border-red-200 rounded-xl">
              <p className="text-xs text-red-900">
                Picked a playbook? For a full recovery plan, tell the Counterfactual Optimizer your target and let it reverse-engineer the smallest set of changes needed.
              </p>
              <Link
                href="/dashboard/optimize"
                className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 shrink-0"
              >
                Open Optimizer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Scenario Name */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Scenario Name</label>
        <input
          type="text"
          value={business ? scenarioName : ''}
          disabled={submitting || !business}
          onChange={(e) => setScenarioName(e.target.value)}
          className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors disabled:opacity-60"
          placeholder={business ? "Enter scenario name" : "No active business twin"}
        />
      </div>

      {/* Price Increase Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Price Increase</label>
          <span className="text-lg font-medium text-black">{priceIncrease}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          disabled={submitting || !business}
          value={priceIncrease}
          onChange={(e) => setPriceIncrease(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-60"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>0% (Baseline)</span>
          <span>50% Max</span>
        </div>
      </div>

      {/* Employee Count Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Simulated Headcount</label>
          <span className="text-lg font-medium text-black">{employeeCount} employees</span>
        </div>
        <input
          type="range"
          min={business ? 5 : 0}
          max="50"
          disabled={submitting || !business}
          value={employeeCount}
          onChange={(e) => setEmployeeCount(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-60"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{business ? '5 employees (Min)' : '0 employees'}</span>
          <span>{business ? `${business.employees?.length} (Baseline)` : '0 (Baseline)'}</span>
          <span>50 employees (Max)</span>
        </div>
      </div>

      {/* Marketing Budget Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Marketing Budget</label>
          <span className="text-lg font-medium text-black">${(marketingBudget / 1000).toFixed(0)}K</span>
        </div>
        <input
          type="range"
          min="0"
          max="100000"
          step="2500"
          disabled={submitting || !business}
          value={marketingBudget}
          onChange={(e) => setMarketingBudget(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-60"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>$0 (None)</span>
          <span>{business ? `$${(business.baselineMarketing / 1000).toFixed(0)}K (Baseline)` : '$0 (Baseline)'}</span>
          <span>$100K Max</span>
        </div>
      </div>

      {/* Supplier Delay Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Supplier Delay</label>
        <select
          value={supplierDelay}
          disabled={submitting || !business}
          onChange={(e) => setSupplierDelay(e.target.value)}
          className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors disabled:opacity-60"
        >
          <option value="none">No Delay</option>
          <option value="minor">Minor (1-2 weeks)</option>
          <option value="moderate">Moderate (2-4 weeks)</option>
          <option value="severe">Severe (4+ weeks)</option>
        </select>
      </div>

      {/* Advanced Assumptions */}
      {business && (
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"
          >
            Advanced Assumptions
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showAdvanced && (() => {
            const defaults = getIndustryProfile(business.industry);
            return (
              <div className="mt-4 space-y-4 p-4 bg-[#F5F5F5] rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500">
                  Override the demand-elasticity assumptions the engine uses for this scenario.
                  Leave blank to use the {business.industry || 'default'} industry default.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Price Elasticity Coefficient
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.05"
                    disabled={submitting}
                    value={priceElasticityInput}
                    onChange={(e) => setPriceElasticityInput(e.target.value)}
                    placeholder={`Default: ${defaults.priceElasticityCoefficient.toFixed(2)}`}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-black text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Marketing Elasticity Coefficient
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.05"
                    disabled={submitting}
                    value={marketingElasticityInput}
                    onChange={(e) => setMarketingElasticityInput(e.target.value)}
                    placeholder={`Default: ${defaults.marketingElasticityCoefficient.toFixed(2)}`}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-black text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-60"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Run Simulation Button */}
      <button
        onClick={handleRunSimulation}
        disabled={submitting || !business}
        className="w-full py-3 px-6 bg-black text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-400"
      >
        <Play className="w-4 h-4 fill-current" />
        {!business ? 'No Active Twin' : submitting ? 'Calculating Scenarios...' : 'Run Simulation'}
      </button>
    </div>
  );
}
