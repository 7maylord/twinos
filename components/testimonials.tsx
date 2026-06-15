'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    title: 'VP of Operations',
    company: 'TechFlow Industries',
    image: '🧠',
    quote: 'TwinOS helped us reduce decision-making time by 60%. We can now test strategies before implementation with confidence.',
    rating: 5,
  },
  {
    name: 'Michael Rodriguez',
    title: 'CEO',
    company: 'Global Supply Co',
    image: '🚀',
    quote: 'The ROI was immediate. We identified and prevented a costly supply chain disruption that would have cost millions.',
    rating: 5,
  },
  {
    name: 'Emma Watson',
    title: 'Director of Analytics',
    company: 'DataVision Corp',
    image: '💡',
    quote: 'The predictive insights are incredibly accurate. It&apos;s like having a crystal ball for your business decisions.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Trusted by Industry{' '}
            <span className="gradient-text">Leaders</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            See how companies worldwide are transforming their decision-making process with TwinOS.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="glassmorphic p-8 rounded-2xl hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1 animate-fade-up flex flex-col"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/80 mb-6 flex-grow leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-foreground/60">
                    {testimonial.title} • {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          {[
            { value: '500+', label: 'Companies Worldwide' },
            { value: '50M+', label: 'Simulations Run' },
            { value: '$2.3B', label: 'Risk Prevented' },
          ].map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </p>
              <p className="text-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
