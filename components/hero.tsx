'use client'

import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-20 animate-glow"></div>
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl opacity-20 animate-glow" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/30 mb-6 animate-fade-up">
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-semibold gradient-text">AI-Powered Digital Twins</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Stop Guessing.{' '}
          <span className="gradient-text">Simulate Business Decisions</span> Before They Cost Money
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
          TwinOS creates intelligent digital replicas of your business processes. Simulate decisions, reduce risk, and maximize ROI with AI-powered insights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <button className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 group">
            Start Simulating
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 glassmorphic rounded-xl font-semibold hover:bg-card/80 transition-colors flex items-center gap-2">
            Watch Demo
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-card-border/50 flex flex-col sm:flex-row items-center justify-center gap-8 text-foreground/60 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-primary">✓</span>
            </div>
            <span className="text-sm">Trusted by 500+ Companies</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-card-border/50"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-accent">✓</span>
            </div>
            <span className="text-sm">99.9% Uptime SLA</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-card-border/50"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-light/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-primary-light">✓</span>
            </div>
            <span className="text-sm">ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </section>
  )
}
