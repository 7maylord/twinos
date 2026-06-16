'use client';

import { Settings, Bell, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function AdminHeader() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard"
          className="p-2.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-full transition-colors duration-200"
        >
          <ArrowLeft size={18} className="text-black" />
        </Link>
        <div>
          <h1 
            className="text-3xl md:text-4xl font-medium tracking-tight text-black mb-1"
            style={{ letterSpacing: '-0.03em' }}
          >
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm">Platform overview & analytics</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2.5 hover:bg-gray-200/50 rounded-full transition-colors">
          <Bell className="text-gray-700" size={20} />
        </button>
        <button className="p-2.5 hover:bg-gray-200/50 rounded-full transition-colors">
          <Settings className="text-gray-700" size={20} />
        </button>
      </div>
    </div>
  );
}
