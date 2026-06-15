'use client'

import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden mesh-gradient">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-tl from-accent/20 to-primary/10 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-accent-bright/10 to-transparent rounded-full blur-3xl opacity-25" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 glassmorphic-accent rounded-full mb-8 animate-fade-up group hover-lift cursor-pointer">
          <Sparkles size={16} className="text-accent group-hover:animate-spin" />
          <span className="text-sm font-semibold bg-gradient-to-r from-accent to-accent-bright bg-clip-text text-transparent">Next Generation Digital Twins</span>
        </div>

        {/* Main Headline - Premium Typography */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-8 leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <span className="block mb-2">Stop Guessing.</span>
          <span className="gradient-text-bright text-glow inline-block">Simulate Business Decisions</span>
          <span className="block">Before They Cost Money</span>
        </h1>

        {/* Premium Subheadline */}
        <p className="text-lg sm:text-xl lg:text-2xl text-foreground/75 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Transform business decisions with AI-powered simulations. Reduce risk, accelerate growth, and unlock unprecedented ROI.
        </p>

        {/* Premium CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <button className="relative px-10 py-5 bg-gradient-to-r from-primary via-primary-light to-primary-dark text-white rounded-2xl font-bold text-lg flex items-center gap-3 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-glow rounded-2xl opacity-0 group-hover:opacity-100"></div>
            <span className="relative">Start Simulating Now</span>
            <ArrowRight size={22} className="relative group-hover:translate-x-2 transition-transform" />
          </button>
          <button className="relative px-10 py-5 glassmorphic-light rounded-2xl font-bold text-lg hover-lift group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent-bright/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            <span className="relative">See Live Demo</span>
          </button>
        </div>

        {/* Premium Trust Indicators */}
        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 text-foreground/70 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-accent/20 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
              <span className="text-sm font-black text-primary">500+</span>
            </div>
            <span className="text-sm font-medium">Enterprise Clients</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/10"></div>
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-accent/30 to-accent-bright/20 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent/20 transition-all">
              <span className="text-sm font-black text-accent">99.9%</span>
            </div>
            <span className="text-sm font-medium">Uptime SLA</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/10"></div>
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-bright/30 to-primary/20 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent-bright/20 transition-all">
              <span className="text-sm font-black text-accent-bright">ISO</span>
            </div>
            <span className="text-sm font-medium">27001 Certified</span>
          </div>
        </div>
      </div>
    </section>
  )
}
