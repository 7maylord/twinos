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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        const isPositive = kpi.change.startsWith('+')
        return (
          <div
            key={index}
            className={`glassmorphic p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 animate-fade-up hover-lift group`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <p className="text-foreground/60 text-xs font-bold uppercase tracking-wider">{kpi.title}</p>
                <h3 className="text-4xl font-black mt-3">{kpi.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${kpi.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={28} className={`text-transparent bg-gradient-to-br ${kpi.color} bg-clip-text`} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-6 border-t border-white/5">
              <span className={`text-sm font-bold ${isPositive ? 'text-accent-bright' : 'text-red-500'}`}>{kpi.change}</span>
              <span className="text-xs text-foreground/50">from last month</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
