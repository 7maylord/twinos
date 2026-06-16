'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[88rem] mx-auto px-6">
        <div className="relative bg-[#2B2644] rounded-3xl p-12 md:p-20 text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-20 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Sparkles size={14} className="text-purple-300" />
              <span className="text-sm text-white/80 font-medium">Free to Start</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-white mb-5 max-w-3xl mx-auto leading-tight">
              Ready to Transform
              <br />
              Your Business Decisions?
            </h2>

            <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
              Join thousands of companies already using TwinOS to simulate, 
              optimize, and execute business strategies with confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 bg-white text-[#2B2644] text-base font-semibold px-8 py-3.5 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl shadow-black/20"
              >
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white text-base font-medium transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
