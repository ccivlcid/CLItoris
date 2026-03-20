import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import type { ApiResponse } from '@clitoris/shared';

interface FollowingEntry {
  githubUsername: string;
  avatarUrl: string;
  profileUrl: string;
  clitorisUsername: string | null;
  isFollowing: boolean;
}

interface FollowerEntry {
  githubUsername: string;
  avatarUrl: string;
  profileUrl: string;
  clitorisUsername: string | null;
  iFollow: boolean;
}

type SubTab = 'following' | 'followers';

export default function GithubFollowSync({ onToast }: { onToast?: (msg: string) => void }) {
  const [subTab, setSubTab] = useState<SubTab>('following');
  const [following, setFollowing] = useState<FollowingEntry[]>([]);
  const [followers, setFollowers] = useState<FollowerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [inFlight, setInFlight] = useState<Set<string>>(new Set());

  const loadFollowing = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<FollowingEntry[]>>('/github/following');
      setFollowing(res.data);
    } catch { /* no token or error — show empty */ }
    finally { setIsLoading(false); }
  }, []);

  const loadFollowers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<FollowerEntry[]>>('/github/followers');
      setFollowers(res.data);
    } catch { /* no token or error — show empty */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (subTab === 'following') void loadFollowing();
    else void loadFollowers();
  }, [subTab, loadFollowing, loadFollowers]);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post<ApiResponse<{ followed: number; alreadyFollowing: number }>>('/github/sync-follows');
      const { followed, alreadyFollowing } = res.data;
      onToast?.(`${followed}명 팔로우 완료 (이미: ${alreadyFollowing}명)`);
      setFollowing((prev) => prev.map((e) => e.clitorisUsername ? { ...e, isFollowing: true } : e));
    } catch {
      onToast?.('동기화 실패');
    } finally { setIsSyncing(false); }
  };

  const toggleFollow = async (username: string, currently: boolean, src: SubTab) => {
    setInFlight((s) => new Set(s).add(username));
    const next = !currently;
    if (src === 'following') {
      setFollowing((p) => p.map((e) => e.clitorisUsername === username ? { ...e, isFollowing: next } : e));
    } else {
      setFollowers((p) => p.map((e) => e.clitorisUsername === username ? { ...e, iFollow: next } : e));
    }
    try {
      await api.post(`/users/@${username}/follow`);
    } catch {
      if (src === 'following') {
        setFollowing((p) => p.map((e) => e.clitorisUsername === username ? { ...e, isFollowing: !next } : e));
      } else {
        setFollowers((p) => p.map((e) => e.clitorisUsername === username ? { ...e, iFollow: !next } : e));
      }
    } finally {
      setInFlight((s) => { const ns = new Set(s); ns.delete(username); return ns; });
    }
  };

  const list = subTab === 'following' ? following : followers;
  const onClit = list.filter((e) => e.clitorisUsername);
  const notOnClit = list.filter((e) => !e.clitorisUsername);
  const unsynced = following.filter((e) => e.clitorisUsername && !e.isFollowing);

  return (
    <div className="border border-[#1c1c30] bg-[#0a0a14]">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-[#1c1c30]">
        <div>
          <span className="text-[#9aacbf] font-mono text-[12px]">github follows</span>
          <span className="text-[#525270] font-mono text-[11px] ml-2">
            {following.filter((e) => e.clitorisUsername).length} on CLItoris
          </span>
        </div>
        {subTab === 'following' && !isLoading && unsynced.length > 0 && (
          <button
            onClick={() => void handleSyncAll()}
            disabled={isSyncing}
            className="font-mono text-[11px] px-3 py-1 bg-[#3dd68c]/10 text-[#3dd68c] border border-[#3dd68c]/20 hover:bg-[#3dd68c]/20 disabled:opacity-30 transition-colors"
          >
            {isSyncing ? 'syncing...' : `sync all (${unsynced.length})`}
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-[#1c1c30]">
        {(['following', 'followers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-4 py-2 font-mono text-[11px] border-b-2 -mb-px transition-colors ${
              subTab === t
                ? 'text-[#3dd68c] border-[#3dd68c]'
                : 'text-[#7a8898] border-transparent hover:text-[#c9d1d9]'
            }`}
          >
            {t === 'following' ? `내가 팔로우 (${following.length})` : `나를 팔로우 (${followers.length})`}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-px p-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-10 animate-pulse bg-[#0d0d1e]" />
          ))}
        </div>
      )}

      {/* CLItoris 가입자 */}
      {!isLoading && onClit.length > 0 && (
        <div>
          <p className="text-[#525270] font-mono text-[10px] px-4 pt-2 pb-1">CLItoris 가입 ({onClit.length})</p>
          {onClit.map((entry) => {
            const isFollowing = subTab === 'following'
              ? (entry as FollowingEntry).isFollowing
              : (entry as FollowerEntry).iFollow;
            return (
              <div key={entry.githubUsername} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#0f0f1e] hover:bg-[#0d0d1e] transition-colors">
                <img src={entry.avatarUrl} alt={entry.githubUsername} className="w-6 h-6 rounded-sm shrink-0 object-cover" />
                <div className="flex-1 min-w-0">
                  <Link to={`/@${entry.clitorisUsername}`} className="font-mono text-[12px] text-[#f59e0b] hover:text-amber-300 transition-colors">
                    @{entry.clitorisUsername}
                  </Link>
                  <span className="text-[#525270] font-mono text-[10px] ml-2">{entry.githubUsername}</span>
                </div>
                <button
                  onClick={() => void toggleFollow(entry.clitorisUsername!, isFollowing, subTab)}
                  disabled={inFlight.has(entry.clitorisUsername!)}
                  className={`font-mono text-[10px] px-2.5 py-0.5 border transition-colors disabled:opacity-40 shrink-0 ${
                    isFollowing
                      ? 'text-[#7a8898] border-[#1c1c30] hover:text-red-400 hover:border-red-400/30'
                      : 'text-[#3dd68c] border-[#3dd68c]/20 bg-[#3dd68c]/5 hover:bg-[#3dd68c]/15'
                  }`}
                >
                  {inFlight.has(entry.clitorisUsername!) ? '...' : isFollowing ? 'unfollow' : 'follow'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* CLItoris 미가입자 */}
      {!isLoading && notOnClit.length > 0 && (
        <div>
          <p className="text-[#525270] font-mono text-[10px] px-4 pt-2 pb-1">CLItoris 미가입 ({notOnClit.length})</p>
          {notOnClit.slice(0, 5).map((entry) => (
            <div key={entry.githubUsername} className="flex items-center gap-3 px-4 py-2 border-b border-[#0f0f1e] opacity-40">
              <img src={entry.avatarUrl} alt={entry.githubUsername} className="w-6 h-6 rounded-sm shrink-0 object-cover" />
              <a href={entry.profileUrl} target="_blank" rel="noopener noreferrer"
                className="font-mono text-[12px] text-[#9aacbf] hover:text-white transition-colors">
                {entry.githubUsername}
              </a>
            </div>
          ))}
          {notOnClit.length > 5 && (
            <p className="text-[#363655] font-mono text-[10px] px-4 py-2">+{notOnClit.length - 5}명 더</p>
          )}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="px-5 py-6 text-center">
          <p className="text-[#525270] font-mono text-[11px]">&gt; 0 {subTab} found.</p>
        </div>
      )}
    </div>
  );
}
