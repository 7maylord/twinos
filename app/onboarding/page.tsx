'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Cpu, Activity, Coins, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [baselineRevenue, setBaselineRevenue] = useState(150000);
  const [baselineFixedCosts, setBaselineFixedCosts] = useState(25000);
  const [baselineMarketing, setBaselineMarketing] = useState(15000);
  const [baselineInventory, setBaselineInventory] = useState(30000);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter your business name.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/business/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          industry,
          baselineRevenue,
          baselineFixedCosts,
          baselineMarketing,
          baselineInventory,
        }),
      });

      if (res.ok) {
        // Redirect to dashboard after successful twin construction
        router.push('/dashboard');
      } else {
        const errData = await res.json();
        toast.error(`Failed to create business: ${errData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error during onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black flex flex-col justify-between py-12 px-6 lg:px-8">
      {/* Top logo/branding */}
      <div className="max-w-xl mx-auto w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#2B2644] flex items-center justify-center text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#2B2644]">TwinOS</span>
        </div>
        <p className="text-gray-500 text-sm">Construct your business digital twin representation</p>
      </div>

      {/* Main card */}
      <div className="max-w-xl mx-auto w-full bg-white border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-sm mt-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? 'bg-[#2B2644] text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
            <span className="text-xs font-semibold text-gray-700">Profile</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-4">
            <div className={`h-0.5 bg-[#2B2644] transition-all duration-300`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 2 ? 'bg-[#2B2644] text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
            <span className="text-xs font-semibold text-gray-700">Financials</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-4">
            <div className={`h-0.5 bg-[#2B2644] transition-all duration-300`} style={{ width: step === 3 ? '100%' : '0%' }}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 3 ? 'bg-[#2B2644] text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
            <span className="text-xs font-semibold text-gray-700">Expenses</span>
          </div>
        </div>

        {/* Step 1 Form */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-black">Tell us about your business</h2>
            <p className="text-gray-500 text-sm">We'll initialize your digital twin based on your company parameters.</p>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Blue Bottle Cafe"
                className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors"
              >
                <option value="" disabled>Select an Industry</option>
                <option value="Software / SaaS">Software / SaaS</option>
                <option value="Restaurant">Restaurant & Food Service</option>
                <option value="E-commerce">E-commerce / Retailer</option>
                <option value="Logistics">Logistics & Supply Chain</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Education">Education</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Other">Other Sector</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-black">Financial Benchmarks</h2>
            <p className="text-gray-500 text-sm">Input your baseline monthly parameters to establish target predictions.</p>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Baseline Monthly Revenue</label>
                <span className="text-lg font-medium text-[#2B2644]">${(baselineRevenue / 1000).toFixed(0)}K</span>
              </div>
              <input
                type="range"
                min="10000"
                max="1000000"
                step="10000"
                value={baselineRevenue}
                onChange={(e) => setBaselineRevenue(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>$10K</span>
                <span>$1M Max</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Baseline Monthly Fixed Costs</label>
                <span className="text-lg font-medium text-black">${(baselineFixedCosts / 1000).toFixed(0)}K</span>
              </div>
              <input
                type="range"
                min="5000"
                max="300000"
                step="5000"
                value={baselineFixedCosts}
                onChange={(e) => setBaselineFixedCosts(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>$5K</span>
                <span>$300K Max</span>
              </div>
              <p className="text-gray-400 text-xs mt-2">Includes rent, utilities, insurance, software licenses, etc.</p>
            </div>
          </div>
        )}

        {/* Step 3 Form */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-black">Operating Budgets</h2>
            <p className="text-gray-500 text-sm">Define baseline allocations for products, suppliers, and media campaigns.</p>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Monthly Marketing Budget</label>
                <span className="text-lg font-medium text-black">${(baselineMarketing / 1000).toFixed(0)}K</span>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="5000"
                value={baselineMarketing}
                onChange={(e) => setBaselineMarketing(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>$0</span>
                <span>$200K Max</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Monthly Inventory/Stock Costs</label>
                <span className="text-lg font-medium text-black">${(baselineInventory / 1000).toFixed(0)}K</span>
              </div>
              <input
                type="range"
                min="2000"
                max="300000"
                step="2000"
                value={baselineInventory}
                onChange={(e) => setBaselineInventory(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>$2K</span>
                <span>$300K Max</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation actions */}
        <div className="flex items-center gap-4 mt-10">
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="flex-1 py-3 px-6 border border-gray-200 hover:bg-gray-50 text-black rounded-full font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && (!name.trim() || !industry)}
              className="flex-1 py-3 px-6 bg-black hover:bg-gray-800 text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 px-6 bg-[#2B2644] hover:bg-[#1f1b33] text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400"
            >
              {submitting ? 'Constructing Twin...' : 'Construct Digital Twin'}
              <Cpu size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-xl mx-auto w-full text-center mt-12">
        <p className="text-gray-400 text-xs">© 2026 TwinOS. Powered by Antigravity simulation models.</p>
      </div>
    </div>
  );
}
