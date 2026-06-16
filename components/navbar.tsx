'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LogoIcon } from './logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#F5F5F5]/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-[88rem] mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <LogoIcon className="w-7 h-7 text-black" />
            <span className="text-2xl font-medium tracking-tight text-black">TwinOS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-base text-gray-600 hover:text-black font-medium transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/dashboard"
              className="inline-block bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200"
            >
              Start Simulating
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-200/50 rounded-full transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/dashboard"
                className="mt-2 text-center bg-black text-white px-4 py-2.5 rounded-full font-medium"
              >
                Start Simulating
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
