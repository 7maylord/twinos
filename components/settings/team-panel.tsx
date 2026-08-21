'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface Invite {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export default function TeamPanel() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setInvites(data.invites || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const inviteLink = (token: string) => `${window.location.origin}/invite/${token}`;

  const copyLink = async (id: string, token: string) => {
    await navigator.clipboard.writeText(inviteLink(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateInvite = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/team', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create invite');
      setInvites((prev) => [data, ...prev]);
      await copyLink(data.id, data.token);
      toast.success('Invite link created and copied to your clipboard.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invite');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    const res = await fetch(`/api/team/invite/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setInvites((prev) => prev.filter((i) => i.id !== id));
      toast.success('Invite revoked.');
    } else {
      toast.error('Failed to revoke invite');
    }
  };

  const handleRemoveMember = async (id: string) => {
    const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success('Access removed.');
    } else {
      toast.error('Failed to remove access');
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading team...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-medium text-black">Team Access</h3>
            <p className="text-gray-500 text-sm mt-1">
              Invite people to view scenarios and results as a read-only Viewer. Viewers never see raw salaries, product
              costs, or connected account credentials — the same aggregate view a public share link shows.
            </p>
          </div>
          <button
            onClick={handleGenerateInvite}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full font-medium text-sm transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <UserPlus size={16} />
            {generating ? 'Generating...' : 'Invite Viewer'}
          </button>
        </div>

        {invites.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Pending Invites</h4>
            <div className="space-y-2">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-sm text-gray-600">
                    Expires {new Date(invite.expiresAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(invite.id, invite.token)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {copiedId === invite.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === invite.id ? 'Copied' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => handleRevokeInvite(invite.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Viewers ({members.length})
          </h4>
          {members.length === 0 ? (
            <p className="text-sm text-gray-400">No one else has access yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-black">{member.email}</div>
                    <div className="text-xs text-gray-500">
                      Viewer since {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
