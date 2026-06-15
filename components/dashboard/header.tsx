'use client'

import { Menu, Bell, User } from 'lucide-react'

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 bg-card border-b border-card-border px-6 lg:px-8 py-4 flex items-center justify-between z-40">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 hover:bg-card-border rounded-lg transition-colors">
          <Menu className="w-5 h-5 text-muted" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-card-border rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-muted" />
        </button>
        <button className="p-2 hover:bg-card-border rounded-lg transition-colors">
          <User className="w-5 h-5 text-muted" />
        </button>
      </div>
    </header>
  )
}
