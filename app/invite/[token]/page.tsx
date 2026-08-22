'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { LogoIcon } from '@/components/logo';

// Loading/confirm/accepting/success/error. The GET preview on mount is safe
// (no side effects) — it exists specifically so accepting stays behind an
// explicit click. Link unfurlers and corporate mail scanners routinely visit
// URLs with no real user behind them; auto-accepting on page load would let
// any of those silently burn this single-use invite before a real person
// ever saw it.
type Status = 'loading' | 'confirm' | 'accepting' | 'success' | 'error';

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    async function preview() {
      try {
        const res = await fetch(`/api/team/accept?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'This invite link could not be used.');
          return;
        }
        setBusinessName(data.businessName || 'this business');
        setStatus('confirm');
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    }
    preview();
  }, [token]);

  async function handleAccept() {
    setStatus('accepting');
    try {
      const res = await fetch('/api/team/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'This invite link could not be used.');
        return;
      }
      setBusinessName(data.businessName || businessName);
      setStatus('success');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="flex justify-center mb-6">
          <LogoIcon className="w-9 h-9 text-black" />
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Checking your invite...</p>
          </>
        )}

        {status === 'confirm' && (
          <>
            <h1 className="text-xl font-medium text-black mb-2">You've been invited</h1>
            <p className="text-gray-500 text-sm mb-6">
              Join <span className="font-medium text-black">{businessName}</span> as a viewer? You'll be able to see
              scenarios and results, but not edit anything.
            </p>
            <button
              onClick={handleAccept}
              className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white rounded-full font-medium text-sm transition-colors"
            >
              Accept & Join
            </button>
          </>
        )}

        {status === 'accepting' && (
          <>
            <Loader2 className="w-10 h-10 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Joining...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-medium text-black mb-2">You're in</h1>
            <p className="text-gray-500 text-sm mb-6">
              You now have viewer access to <span className="font-medium text-black">{businessName}</span>.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white rounded-full font-medium text-sm transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-medium text-black mb-2">Invite not valid</h1>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
