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
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Powerful Features,{' '}
            <span className="gradient-text">Built for Scale</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Everything you need to simulate, analyze, and optimize your business decisions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group glassmorphic p-8 rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
