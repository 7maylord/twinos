'use client'

import { Upload, Settings, Play, BarChart3 } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Connect Your Data',
    description: 'Securely connect your business data sources and integrate with existing systems in minutes.',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configure Twin',
    description: 'Define your digital twin parameters and simulation scenarios with our intuitive no-code builder.',
  },
  {
    number: '03',
    icon: Play,
    title: 'Run Simulations',
    description: 'Execute unlimited what-if scenarios and watch your twin respond in real-time.',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Act on Insights',
    description: 'Get detailed reports and recommendations to make confident, data-driven decisions.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            How It Works,{' '}
            <span className="gradient-text">Simple & Intuitive</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Get up and running in four simple steps. No complex setup or technical expertise required.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-transparent pointer-events-none"></div>

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Step Card */}
                <div className="glassmorphic p-8 rounded-2xl h-full relative z-10">
                  {/* Number Badge */}
                  <div className="absolute -top-6 left-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-4 border-background">
                      <span className="text-white font-bold text-sm">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mt-6 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon className="text-primary" size={24} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-foreground/70 leading-relaxed text-sm">{step.description}</p>
                </div>

                {/* Vertical Line for Mobile */}
                {index !== steps.length - 1 && (
                  <div className="lg:hidden absolute left-6 top-24 w-0.5 h-12 bg-gradient-to-b from-primary to-accent/0"></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Feature Highlight */}
        <div className="mt-16 glassmorphic p-10 rounded-2xl text-center border border-primary/30 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-foreground/80 mb-4">
            Integrate with <span className="text-primary font-semibold">100+ platforms</span> including Salesforce, SAP, and custom APIs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Salesforce', 'SAP', 'Oracle', 'Tableau', 'Power BI'].map((platform) => (
              <span key={platform} className="px-4 py-2 bg-card rounded-full text-sm text-foreground/70">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
