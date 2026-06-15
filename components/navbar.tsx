'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 glassmorphic-light border-b border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Premium Logo */}
          <Link href="#" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary via-accent to-accent-bright rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <span className="text-white font-black text-xl">T</span>
            </div>
            <span className="text-xl font-black gradient-text-bright">TwinOS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors text-sm font-semibold relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>

          {/* Premium CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 transform hover:scale-105 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <span className="relative">Start Simulating</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-card rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-foreground/80 hover:text-primary hover:bg-card rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors mt-2 w-full">
                Start Simulating
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
