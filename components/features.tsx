'use client';

import { Box, Zap, Brain, TrendingUp, BarChart3, Shield, Layers, GitBranch } from 'lucide-react';

const features = [
  {
    icon: Box,
    title: 'Digital Twin Engine',
    description: 'Create a real-time virtual replica of your entire business, from supply chains to revenue models. Every variable is captured.',
  },
  {
    icon: GitBranch,
    title: 'Scenario Builder',
    description: 'Design unlimited what-if scenarios with adjustable parameters. Test pricing, staffing, expansion and market shifts risk-free.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Machine learning algorithms analyze your simulations and surface hidden patterns, risks, and opportunities you would miss.',
  },
  {
    icon: TrendingUp,
    title: 'Optimization Engine',
    description: 'Automatically find the optimal configuration for your business goals. Maximize revenue, minimize costs, or balance growth.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Live dashboards track every metric that matters — from profit margins to operational efficiency — updated in real-time.',
  },
  {
    icon: Shield,
    title: 'Risk Analysis',
    description: 'Stress-test your decisions against worst-case scenarios before committing resources. Protect your business from the unknown.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32 bg-[#F5F5F5]">
      <div className="max-w-[88rem] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Layers size={14} className="text-[#2B2644]" />
            <span className="text-sm text-gray-700 font-medium">Core Platform</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-black mb-4">
            Everything You Need to
            <br />
            <span className="text-gray-400">Decide with Confidence</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            A complete suite of tools to model, simulate, analyze and optimize your business decisions.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-[#F5F5F5] group-hover:bg-[#2B2644] rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                <feature.icon size={22} className="text-[#2B2644] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-black mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
