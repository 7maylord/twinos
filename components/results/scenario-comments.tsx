'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface Comment {
  id: string;
  authorEmail: string;
  body: string;
  createdAt: string;
}

export function ScenarioComments({ scenarioId }: { scenarioId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/scenarios/${scenarioId}/comments`);
      if (res.ok) setComments(await res.json());
    } catch (err) {
      console.error('Error loading scenario comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/scenarios/${scenarioId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setDraft('');
      }
    } catch (err) {
      console.error('Error posting scenario comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm no-print">
      <h3 className="text-black font-medium tracking-tight mb-5 flex items-center gap-2">
        <MessageSquare size={16} className="text-[#2B2644]" />
        Notes &amp; Comments
      </h3>

      {loading ? (
        <p className="text-xs text-gray-400">Loading comments...</p>
      ) : (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400">No comments yet — leave a note for whoever reviews this scenario next.</p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="bg-[#F5F5F5] rounded-xl p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-700">{comment.authorEmail}</span>
                <span className="text-[11px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.body}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={draft}
          disabled={submitting}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note..."
          maxLength={2000}
          className="flex-1 px-3 py-2 bg-[#F5F5F5] border border-gray-200 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={submitting || !draft.trim()}
          className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300"
          aria-label="Post comment"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
