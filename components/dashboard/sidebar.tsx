'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Zap, Home, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { LogoIcon } from '../logo';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="hidden md:flex w-64 bg-[#F5F5F5] border-r border-gray-200 flex-col py-6">
      {/* Logo */}
      <div className="px-6 pb-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="w-7 h-7 text-black" />
          <span className="font-semibold text-xl tracking-tight text-black">TwinOS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${
            isActive('/dashboard')
              ? 'bg-black text-white rounded-full font-medium'
              : 'text-gray-600 hover:text-black hover:bg-gray-200/50 rounded-full'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium text-base">Dashboard</span>
        </Link>

        <Link
          href="/scenario-builder"
          className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${
            isActive('/scenario-builder')
              ? 'bg-black text-white rounded-full font-medium'
              : 'text-gray-600 hover:text-black hover:bg-gray-200/50 rounded-full'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="font-medium text-base">Scenario Simulator</span>
        </Link>

        <Link
          href="/admin"
          className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${
            isActive('/admin')
              ? 'bg-black text-white rounded-full font-medium'
              : 'text-gray-600 hover:text-black hover:bg-gray-200/50 rounded-full'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="font-medium text-base">Admin Panel</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-black hover:bg-gray-200/50 rounded-full transition-all duration-200"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium text-base">Home</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-4 pt-6 border-t border-gray-200 space-y-2">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${
            isActive('/dashboard/settings')
              ? 'bg-black text-white rounded-full font-medium'
              : 'text-gray-600 hover:text-black hover:bg-gray-200/50 rounded-full'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-base">Settings</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-black hover:bg-gray-200/50 rounded-full transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}
