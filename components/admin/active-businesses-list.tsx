'use client';

import { MoreVertical } from 'lucide-react';

const businesses = [
  { id: 1, name: 'TechCore Industries', simulations: 45, status: 'Active', users: 12 },
  { id: 2, name: 'Retail Solutions Inc', simulations: 38, status: 'Active', users: 8 },
  { id: 3, name: 'Manufacturing Pro', simulations: 52, status: 'Active', users: 15 },
  { id: 4, name: 'Finance Analytics', simulations: 31, status: 'Active', users: 6 },
  { id: 5, name: 'Supply Chain Co', simulations: 29, status: 'Inactive', users: 4 },
];

export function ActiveBusinessesList() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-black font-medium tracking-tight text-lg mb-6">Active Businesses</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-150">
              <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Business Name</th>
              <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Simulations</th>
              <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Users</th>
              <th className="text-left py-3 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((business) => (
              <tr key={business.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0"></div>
                    <span className="text-black font-medium text-sm">{business.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-650 text-sm">{business.simulations}</td>
                <td className="py-4 px-4 text-gray-650 text-sm">{business.users}</td>
                <td className="py-4 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    business.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-650'
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
