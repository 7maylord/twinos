'use client';

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative flex-1 flex items-center justify-center overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Decorative gradient orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-[#2B2644]/8 via-purple-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[88rem] w-full mx-auto px-6 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-700 font-medium">Digital Twin Technology</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] text-black leading-[0.95] mb-6 max-w-5xl mx-auto">
          Stop Guessing.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2B2644] to-gray-700">
            Simulate First.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Model your business decisions before they cost money. 
          TwinOS creates a digital replica of your operations, letting you 
          test scenarios with real-time AI-powered insights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 bg-black text-white text-base font-medium px-8 py-3.5 rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15"
          >
            Start Free Simulation
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="group inline-flex items-center gap-2 bg-white text-black text-base font-medium px-8 py-3.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            <Play size={16} className="text-gray-500" />
            See How It Works
          </a>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {[
            { value: '10K+', label: 'Simulations Run' },
            { value: '94%', label: 'Prediction Accuracy' },
            { value: '3.2x', label: 'Average ROI' },
            { value: '<5min', label: 'Setup Time' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-semibold tracking-tight text-black">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
