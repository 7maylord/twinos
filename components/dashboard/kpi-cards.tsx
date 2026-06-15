'use client'

import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

const kpis = [
  {
    title: 'Total Revenue',
    value: '$2.4M',
    change: '+12.5%',
    icon: DollarSign,
    color: 'from-primary to-primary-light',
    bgColor: 'from-primary/10 to-primary-light/10',
  },
  {
    title: 'Active Users',
    value: '1,254',
    change: '+8.2%',
    icon: Users,
    color: 'from-accent to-cyan-400',
    bgColor: 'from-accent/10 to-cyan-400/10',
  },
  {
    title: 'Profit Margin',
    value: '34.2%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-500/10 to-emerald-500/10',
  },
  {
    title: 'Conversion Rate',
    value: '3.24%',
    change: '+0.8%',
    icon: Activity,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-500/10 to-pink-500/10',
  },
]

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <div
            key={kpi.title}
            className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-md hover:border-primary transition-all duration-300 group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${kpi.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-6 h-6 bg-gradient-to-r ${kpi.color} bg-clip-text text-transparent`} />
            </div>
            <p className="text-sm text-muted font-medium mb-1">{kpi.title}</p>
            <p className="text-2xl font-bold text-foreground mb-2">{kpi.value}</p>
            <p className="text-xs text-green-400 font-semibold">{kpi.change} from last month</p>
          </div>
        )
      })}
    </div>
  )
}
