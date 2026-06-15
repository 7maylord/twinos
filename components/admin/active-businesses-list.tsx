'use client';

import { MoreVertical, TrendingUp } from 'lucide-react';

const businesses = [
  { id: 1, name: 'TechCore Industries', simulations: 45, status: 'Active', users: 12 },
  { id: 2, name: 'Retail Solutions Inc', simulations: 38, status: 'Active', users: 8 },
  { id: 3, name: 'Manufacturing Pro', simulations: 52, status: 'Active', users: 15 },
  { id: 4, name: 'Finance Analytics', simulations: 31, status: 'Active', users: 6 },
  { id: 5, name: 'Supply Chain Co', simulations: 29, status: 'Inactive', users: 4 },
];

export function ActiveBusinessesList() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6 animate-fade-up">
      <h3 className="text-white font-semibold mb-6">Active Businesses</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Business Name</th>
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Simulations</th>
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Users</th>
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((business) => (
              <tr key={business.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/20"></div>
                    <span className="text-slate-200">{business.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-300">{business.simulations}</td>
                <td className="py-4 px-4 text-slate-300">{business.users}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    business.status === 'Active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-600/20 text-slate-400'
                  }`}>
                    {business.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
