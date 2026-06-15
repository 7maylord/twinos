'use client'

import Link from 'next/link'
import { Mail, Linkedin, Twitter, Github } from 'lucide-react'

const footerSections = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Security', 'Roadmap', 'Status'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Docs', 'Guides', 'Community', 'Support'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Compliance', 'Cookies', 'License'],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-card-border/50 py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="#" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold gradient-text">TwinOS</span>
            </Link>
            <p className="text-foreground/60 text-sm mb-6">
              AI-powered digital twin platform for smarter business decisions.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Github, href: '#' },
                { icon: Mail, href: '#' },
              ].map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    className="w-10 h-10 glassmorphic rounded-lg flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all group"
                  >
                    <Icon size={18} className="text-foreground/60 group-hover:text-primary transition-colors" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-foreground">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-foreground/60 hover:text-primary transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-card-border/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground/60">
              © 2024 TwinOS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
