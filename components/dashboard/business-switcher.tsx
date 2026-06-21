'use client';

import { useState, useTransition } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { switchBusiness } from '@/app/actions/business-actions';

interface Business {
  id: string;
  name: string;
}

interface BusinessSwitcherProps {
  businesses: Business[];
  activeBusinessId: string;
}

export default function BusinessSwitcher({ businesses, activeBusinessId }: BusinessSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || businesses[0];

  if (!businesses || businesses.length <= 1) return null; // Hide if only 1 or 0 businesses

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md transition-colors bg-white text-sm ${isPending ? 'opacity-50' : 'hover:bg-gray-50'}`}
      >
        <Building2 className="w-4 h-4 text-gray-700" />
        <span className="font-medium text-gray-900 truncate max-w-[150px]">{activeBusiness?.name || 'Select Business'}</span>
        <ChevronsUpDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 lg:left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Switch Business
          </div>
          {businesses.map((business) => (
            <button
              key={business.id}
              onClick={async () => {
                setIsOpen(false);
                await switchBusiness(business.id);
                window.location.reload();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
            >
              <span className="truncate text-gray-900">{business.name}</span>
              {business.id === activeBusiness?.id && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
