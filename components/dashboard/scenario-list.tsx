'use client';

import { TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const scenarios = [
  {
    name: 'Q3 Growth Strategy',
    impact: '+18.5%',
    status: 'Active',
    date: '2 days ago',
  },
  {
    name: 'Price Optimization',
    impact: '+12.3%',
    status: 'Completed',
    date: '1 week ago',
  },
  {
    name: 'Market Expansion',
    impact: '+25.7%',
    status: 'Pending',
    date: '3 days ago',
  },
  {
    name: 'Cost Reduction',
    impact: '+8.2%',
    status: 'Completed',
    date: '2 weeks ago',
  },
];

export default function ScenarioList() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-medium tracking-tight text-black">Recent Scenarios</h2>
        <p className="text-sm text-gray-500">Your simulated business scenarios</p>
      </div>

      <div className="space-y-3">
        {scenarios.map((scenario, index) => {
          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-150 hover:border-black/30 hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#2B2644]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#2B2644]" />
                </div>
                <div>
                  <p className="font-medium text-black group-hover:text-[#2B2644] transition-colors">{scenario.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{scenario.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-medium text-green-600">{scenario.impact}</p>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    scenario.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
                      : scenario.status === 'Active'
                      ? 'bg-[#2B2644]/10 text-[#2B2644]'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {scenario.status}
                  </span>
                </div>
                <div>
                  {scenario.status === 'Completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link 
        href="/results"
        className="w-full inline-block text-center mt-6 py-3 px-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
      >
        View Results Screen
      </Link>
    </div>
  );
}
