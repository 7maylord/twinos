'use client'

import { TrendingUp, Clock, CheckCircle } from 'lucide-react'

const scenarios = [
  {
    name: 'Q3 Growth Strategy',
    impact: '+18.5%',
    status: 'Active',
    date: '2 days ago',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Price Optimization',
    impact: '+12.3%',
    status: 'Completed',
    date: '1 week ago',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Market Expansion',
    impact: '+25.7%',
    status: 'Pending',
    date: '3 days ago',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Cost Reduction',
    impact: '+8.2%',
    status: 'Completed',
    date: '2 weeks ago',
    color: 'from-orange-500 to-red-500',
  },
]

export default function ScenarioList() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-md animate-fade-up" style={{ animationDelay: '0.2s' }}>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">Recent Scenarios</h2>
        <p className="text-sm text-muted">Your simulated business scenarios</p>
      </div>

      <div className="space-y-4">
        {scenarios.map((scenario, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg border border-card-border hover:border-primary hover:bg-card-border/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${scenario.color} flex items-center justify-center`}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{scenario.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{scenario.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-green-400">{scenario.impact}</p>
                <p className="text-xs text-muted">{scenario.status}</p>
              </div>
              <div>
                {scenario.status === 'Completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2 px-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all">
        View All Scenarios
      </button>
    </div>
  )
}
