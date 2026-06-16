'use client';

import Sidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/header';
import ScenarioForm from '@/components/scenario-builder/scenario-form';
import ImpactCards from '@/components/scenario-builder/impact-cards';

export default function ScenarioBuilderPage() {
  return (
    <div className="flex h-screen bg-[#F5F5F5] text-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardHeader />
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 
              className="text-3xl font-medium tracking-tight text-black mb-2"
              style={{ letterSpacing: '-0.03em' }}
            >
              Scenario Simulator
            </h1>
            <p className="text-gray-550 text-sm">Build and test different business scenarios to understand their impact</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <ScenarioForm />
            </div>

            {/* Right: Impact Cards */}
            <div>
              <ImpactCards />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
