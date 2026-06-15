'use client'

import { Brain, Zap, Shield, TrendingUp, Lock, Gauge } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms analyze your business patterns and predict outcomes with remarkable accuracy.',
    color: 'from-primary to-primary-light',
  },
  {
    icon: Zap,
    title: 'Real-Time Simulation',
    description: 'Run unlimited scenarios instantly. Test strategies without risk and see results in real-time.',
    color: 'from-accent to-cyan-400',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Military-grade encryption and compliance with GDPR, HIPAA, and SOC 2 standards.',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Insights',
    description: 'Get actionable recommendations based on historical data and market trends.',
    color: 'from-violet-400 to-primary',
  },
  {
    icon: Lock,
    title: 'Data Privacy',
    description: 'Your data stays yours. Zero third-party access with end-to-end encryption.',
    color: 'from-pink-400 to-rose-500',
  },
  {
    icon: Gauge,
    title: 'Custom Metrics',
    description: 'Define and track KPIs that matter most to your business success.',
    color: 'from-yellow-400 to-orange-500',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium background gradient */}
      <div className="absolute inset-0 mesh-gradient pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Premium Section Header */}
        <div className="text-center mb-20 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 glassmorphic-accent rounded-full mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Features</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Powerful Features,{' '}
            <span className="gradient-text-bright">Built for Scale</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            Everything you need to simulate, analyze, and optimize business decisions with enterprise-grade precision.
          </p>
        </div>

        {/* Premium Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group glassmorphic-light p-10 rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 animate-fade-up relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:shadow-lg transition-all duration-300`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                  <p className="text-foreground/70 leading-relaxed text-base">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
