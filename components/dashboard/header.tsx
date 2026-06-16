'use client';

import { Menu, Bell, User } from 'lucide-react';
import { Show, UserButton } from '@clerk/nextjs';

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 bg-[#F5F5F5]/80 backdrop-blur border-b border-gray-200 px-6 lg:px-8 py-5 flex items-center justify-between z-40">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 hover:bg-gray-200/50 rounded-full transition-colors">
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-xl font-medium tracking-tight text-black">Analytics</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2.5 hover:bg-gray-200/50 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-gray-700" />
        </button>
        
        <Show
          when="signed-in"
          fallback={
            <button className="p-2.5 hover:bg-gray-200/50 rounded-full transition-colors">
              <User className="w-5 h-5 text-gray-700" />
            </button>
          }
        >
          <div className="p-1 hover:bg-gray-200/50 rounded-full transition-colors flex items-center justify-center">
            <UserButton />
          </div>
        </Show>
      </div>
    </header>
  );
}
