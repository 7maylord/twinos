'use client';

import { Upload, Sliders, Play, CheckCircle, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Connect Your Data',
    description: 'Upload historical data or connect your existing tools. TwinOS maps your business variables and builds your digital twin automatically.',
  },
  {
    number: '02',
    icon: Sliders,
    title: 'Configure Scenarios',
    description: 'Use the intuitive Scenario Builder to define what-if variables — pricing, headcount, market conditions — with simple drag-and-drop controls.',
  },
  {
    number: '03',
    icon: Play,
    title: 'Run Simulations',
    description: 'Execute thousands of simulations in seconds. Our AI engine models every possible outcome and surfaces the most likely results.',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Decide & Execute',
    description: 'Review AI-recommended optimal strategies, compare scenarios side-by-side, and make data-driven decisions with full confidence.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white">
      <div className="max-w-[88rem] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#F5F5F5] border border-gray-200 rounded-full px-4 py-1.5 mb-6">
            <ArrowRight size={14} className="text-[#2B2644]" />
            <span className="text-sm text-gray-700 font-medium">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-black mb-4">
            From Data to Decision
            <br />
            <span className="text-gray-400">in Four Steps</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            No complex setup required. Get from raw data to actionable insights faster than ever.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group">
              {/* Connector line (hidden on last) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-gray-200 to-transparent z-0" />
              )}

              <div className="relative z-10 bg-[#F5F5F5] rounded-2xl p-7 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 h-full">
                {/* Step number */}
                <div className="text-xs font-semibold text-gray-300 tracking-wider mb-4">STEP {step.number}</div>
                
                {/* Icon */}
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm border border-gray-100 group-hover:bg-[#2B2644] transition-colors duration-300">
                  <step.icon size={22} className="text-[#2B2644] group-hover:text-white transition-colors duration-300" />
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-black mb-2">
                  {step.title}
                </h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
