'use client';

import Link from 'next/link';
import { LogoIcon } from './logo';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Scenario Builder', href: '/scenario-builder' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Results', href: '/results' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#F5F5F5] border-t border-gray-200/50">
      <div className="max-w-[88rem] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <LogoIcon className="w-6 h-6 text-black" />
              <span className="text-xl font-semibold tracking-tight text-black">TwinOS</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              The operating system for business decisions. 
              Simulate, analyze, and optimize before you commit.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-gray-200/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} TwinOS. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-gray-400 hover:text-black transition-colors">Twitter</a>
            <a href="#" className="text-xs text-gray-400 hover:text-black transition-colors">LinkedIn</a>
            <a href="#" className="text-xs text-gray-400 hover:text-black transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
