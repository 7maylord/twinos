'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Zap, Home, Settings, LogOut } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-card-border flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-card-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">TwinOS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard')
              ? 'bg-primary text-white'
              : 'text-muted hover:bg-card-border'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link
          href="/scenario-builder"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/scenario-builder')
              ? 'bg-primary text-white'
              : 'text-muted hover:bg-card-border'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="font-medium">Scenario Builder</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:bg-card-border transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-card-border space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:bg-card-border transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:bg-card-border transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
