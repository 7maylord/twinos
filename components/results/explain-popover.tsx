'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface ExplainRow {
  label: string;
  value: string;
}

export function ExplainPopover({ title, formula, rows }: { title: string; formula: string; rows: ExplainRow[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // This renders block content (divs, p tags) in its popover panel, so the
  // caller must not place it inside a <p> — use a <div> label wrapper instead.
  return (
    <div className="relative inline-block no-print" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-gray-400 hover:text-gray-600 transition-colors align-middle ml-1"
        aria-label={`Explain ${title}`}
      >
        <Info size={14} />
      </button>
      {open && (
        <div className="absolute z-20 top-6 left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-left">
          <p className="text-xs font-semibold text-gray-700 mb-1">{title}</p>
          <p className="text-[11px] text-gray-400 font-mono mb-3">{formula}</p>
          <div className="space-y-1.5">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-3 text-xs">
                <span className="text-gray-500">{row.label}</span>
                <span className="text-black font-medium text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
