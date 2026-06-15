'use client'

import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react'

const impacts = [
  {
    title: 'Revenue Impact',
    value: '+$450K',
    description: 'Projected increase',
    icon: DollarSign,
    color: 'from-primary to-primary-light',
    bgColor: 'from-primary/10 to-primary-light/10',
  },
  {
    title: 'Headcount Impact',
    value: '+35',
    description: 'Additional team members',
    icon: Users,
    color: 'from-accent to-cyan-400',
    bgColor: 'from-accent/10 to-cyan-400/10',
  },
  {
    title: 'Timeline',
    value: '6 months',
    description: 'To reach goals',
    icon: Clock,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-500/10 to-emerald-500/10',
  },
  {
    title: 'ROI',
    value: '340%',
    description: 'Return on investment',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-500/10 to-pink-500/10',
  },
]

export default function ImpactCards() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground mb-4">Live Projections</h3>
      {impacts.map((impact) => {
        const Icon = impact.icon
        return (
          <div
            key={impact.title}
            className="bg-card border border-card-border rounded-xl p-4 backdrop-blur-md hover:border-primary transition-all animate-fade-up"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${impact.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 bg-gradient-to-r ${impact.color} bg-clip-text text-transparent`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted font-medium">{impact.title}</p>
                <p className="text-lg font-bold text-foreground">{impact.value}</p>
              </div>
            </div>
            <p className="text-xs text-muted">{impact.description}</p>
          </div>
        )
      })}
    </div>
  )
}
