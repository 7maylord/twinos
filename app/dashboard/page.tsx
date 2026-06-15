'use client'

import Sidebar from '@/components/dashboard/sidebar'
import DashboardHeader from '@/components/dashboard/header'
import KPICards from '@/components/dashboard/kpi-cards'
import RevenueChart from '@/components/dashboard/revenue-chart'
import ProfitChart from '@/components/dashboard/profit-chart'
import ScenarioList from '@/components/dashboard/scenario-list'
import RecommendationPanel from '@/components/dashboard/recommendation-panel'

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardHeader />
        <div className="p-6 lg:p-8 space-y-6">
          {/* KPI Cards */}
          <KPICards />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart />
            <ProfitChart />
          </div>

          {/* Bottom Section: Scenarios and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ScenarioList />
            </div>
            <RecommendationPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
