'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "TwinOS completely changed how we approach expansion decisions. We simulated opening 3 new locations and avoided a $2M mistake.",
    name: 'Sarah Chen',
    role: 'VP of Strategy',
    company: 'RetailFlow Inc.',
    rating: 5,
  },
  {
    quote: "The scenario builder is incredible. We test pricing changes against 50+ variables in seconds instead of spending weeks on spreadsheets.",
    name: 'Marcus Johnson',
    role: 'CFO',
    company: 'NovaTech Solutions',
    rating: 5,
  },
  {
    quote: "We cut our decision-making cycle from 6 weeks to 3 days. The AI recommendations are surprisingly accurate — 94% match with actual outcomes.",
    name: 'Elena Rodriguez',
    role: 'Director of Operations',
    company: 'Meridian Healthcare',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 bg-[#F5F5F5]">
      <div className="max-w-[88rem] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-sm text-gray-700 font-medium">Trusted by Leaders</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-black mb-4">
            What Our Users
            <br />
            <span className="text-gray-400">Are Saying</span>
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col"
            >
              {/* Quote icon */}
              <Quote size={28} className="text-gray-200 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-gray-600 text-[15px] leading-relaxed mb-6 flex-1">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="border-t border-gray-100 pt-5">
                <div className="font-semibold text-black tracking-tight">{testimonial.name}</div>
                <div className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
