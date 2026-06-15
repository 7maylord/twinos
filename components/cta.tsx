'use client'

import { ArrowRight, CheckCircle } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-3xl blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-glow pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="glassmorphic border border-primary/50 p-12 sm:p-16 rounded-3xl text-center backdrop-blur-xl">
          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 animate-fade-up">
            Ready to Transform Your{' '}
            <span className="gradient-text">Decision-Making?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Join leading enterprises that use TwinOS to simulate strategies, reduce risk, and accelerate growth.
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {[
              'Free 14-day trial',
              'No credit card required',
              'Full platform access',
              'Dedicated support team',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle size={20} className="text-accent flex-shrink-0" />
                <span className="text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <button className="px-10 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 group w-full sm:w-auto justify-center">
              Start Simulating Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-4 glassmorphic rounded-xl font-semibold hover:bg-card/80 transition-colors w-full sm:w-auto">
              Schedule Demo
            </button>
          </div>

          {/* Trust Badge */}
          <p className="mt-8 text-sm text-foreground/60">
            🔒 Enterprise-grade security • GDPR compliant • ISO 27001 certified
          </p>
        </div>
      </div>
    </section>
  )
}
