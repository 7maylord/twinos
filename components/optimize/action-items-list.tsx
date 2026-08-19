'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Trash2, User, Calendar } from 'lucide-react';

interface ActionItem {
  id: string;
  category: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done';
  assignee: string | null;
  dueDate: string | null;
}

export interface ActionItemsListHandle {
  refresh: () => void;
}

export const ActionItemsList = forwardRef<ActionItemsListHandle>((_props, ref) => {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/action-items');
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error('Error loading action items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useImperativeHandle(ref, () => ({ refresh: load }), [load]);

  const updateItem = async (id: string, data: Partial<Pick<ActionItem, 'status' | 'assignee' | 'dueDate'>>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
    try {
      await fetch(`/api/action-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('Error updating action item:', err);
    }
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/action-items/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting action item:', err);
    }
  };

  if (loading) return null;
  if (items.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center print:hidden">
        <p className="text-sm text-gray-400">No saved tasks yet. Run an optimization and save its plan as tasks to track them here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm print:hidden">
      <h3 className="text-black font-medium tracking-tight text-lg mb-4">Saved Action Items</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border ${item.status === 'done' ? 'bg-green-50/50 border-green-200' : 'bg-[#F5F5F5] border-gray-200'}`}>
            <input
              type="checkbox"
              checked={item.status === 'done'}
              onChange={(e) => updateItem(item.id, { status: e.target.checked ? 'done' : 'pending' })}
              className="mt-1 accent-black"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${item.status === 'done' ? 'text-gray-400 line-through' : 'text-black'}`}>{item.description}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Unassigned"
                    defaultValue={item.assignee || ''}
                    onBlur={(e) => e.target.value !== (item.assignee || '') && updateItem(item.id, { assignee: e.target.value })}
                    className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg text-black w-28 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-gray-400" />
                  <input
                    type="date"
                    defaultValue={item.dueDate ? item.dueDate.slice(0, 10) : ''}
                    onChange={(e) => updateItem(item.id, { dueDate: e.target.value || null })}
                    className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
            <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Remove">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

ActionItemsList.displayName = 'ActionItemsList';
