'use client'

import { Lightbulb, ArrowRight } from 'lucide-react'

const recommendations = [
  {
    title: 'Increase Marketing',
    description: 'Boost budget by 15% for Q3',
    impact: '+$200K',
    priority: 'high',
  },
  {
    title: 'Optimize Pricing',
    description: 'Adjust tier pricing strategy',
    impact: '+$150K',
    priority: 'medium',
  },
  {
    title: 'Expand Team',
    description: 'Hire 3 more engineers',
    impact: '+$300K',
    priority: 'high',
  },
]

export default function RecommendationPanel() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-md animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          AI Recommendations
        </h2>
        <p className="text-sm text-muted mt-1">Based on your simulations</p>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all cursor-pointer group ${
              rec.priority === 'high'
                ? 'border-red-500/50 bg-red-500/5 hover:border-red-500 hover:bg-red-500/10'
                : 'border-yellow-500/50 bg-yellow-500/5 hover:border-yellow-500 hover:bg-yellow-500/10'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-foreground text-sm">{rec.title}</p>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  rec.priority === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {rec.priority.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted mb-3">{rec.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-green-400">{rec.impact}</p>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2 px-4 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors">
        View Full Report
      </button>
    </div>
  )
}
