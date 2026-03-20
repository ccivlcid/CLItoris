import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { api, ApiError } from '../../api/client.js';
import type { ApiResponse, User } from '@clitoris/shared';

function Field({
  flag, value, onChange, placeholder, type = 'text',
}: {
  flag: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-gray-500 font-mono text-xs">$ set {flag}=</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 font-mono text-sm px-3 py-2 placeholder-gray-700 focus:outline-none focus:border-gray-500"
      />
    </div>
  );
}

export default function ProfileTab({ onToast }: { onToast: (msg: string) => void }) {
  const { user, updateProfile, logout } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [domain, setDomain] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      setDomain(user.domain ?? '');
      setBio(user.bio ?? '');
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ displayName, bio });
      await api.put<ApiResponse<User>>('/auth/me', {
        displayName, domain: domain || null, bio: bio || null, avatarUrl: avatarUrl || null,
      });
      onToast('Settings updated');
    } catch (err) {
      onToast(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await api.delete('/auth/me');
    await logout();
    window.location.href = '/';
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile fields */}
      <div className="border border-gray-700 bg-[#16213e] p-6 space-y-4">
        <p className="text-gray-600 text-xs font-mono">// profile</p>
        <Field flag="--display-name" value={displayName} onChange={setDisplayName} placeholder={user.displayName} />
        <Field flag="--domain" value={domain} onChange={setDomain} placeholder="yourdomain.dev" />
        <Field flag="--bio" value={bio} onChange={setBio} placeholder="Write something about yourself..." />
        <Field flag="--avatar-url" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://..." type="url" />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-400/10 text-green-400 border border-green-400/30 px-4 py-1.5 font-mono text-sm hover:bg-green-400/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? '$ applying...' : '[Apply changes]'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="border border-red-900/40 bg-[#16213e] p-6 space-y-3">
        <p className="text-gray-600 text-xs font-mono">// danger</p>
        <p className="text-gray-400 font-mono text-sm">$ delete --account</p>
        <p className="text-gray-500 font-sans text-sm">
          This action is irreversible. All posts, stars, and followers will be permanently deleted.
        </p>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="text-red-400/60 hover:text-red-400 border border-red-400/30 px-4 py-1.5 font-mono text-sm hover:border-red-400/60 transition-colors"
          >
            $ delete --confirm
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-red-400 font-mono text-sm">Are you sure?</span>
            <button
              onClick={handleDelete}
              className="bg-red-400/10 text-red-400 border border-red-400/30 px-4 py-1.5 font-mono text-sm hover:bg-red-400/20 transition-colors"
            >
              yes, delete
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="text-gray-500 hover:text-gray-300 font-mono text-sm transition-colors"
            >
              cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
