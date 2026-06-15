'use client';

import { Settings, Bell } from 'lucide-react';

export function AdminHeader() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-slate-400">Platform overview & analytics</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="text-slate-400 hover:text-slate-200" size={20} />
        </button>
        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Settings className="text-slate-400 hover:text-slate-200" size={20} />
        </button>
      </div>
    </div>
  );
}
