import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Navigate, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.js';
import PostCard from '../components/post/PostCard.js';
import { useAuthStore } from '../stores/authStore.js';
import { api, ApiError } from '../api/client.js';
import { toastError, toastSuccess } from '../stores/toastStore.js';
import ContributionGraph from '../components/profile/ContributionGraph.js';
import GithubFollowSync from '../components/profile/GithubFollowSync.js';
import ApiTab from '../components/settings/ApiTab.js';
import type { UserProfile, Post, ApiResponse } from '@forkverse/shared';
import InfluenceBadge from '../components/profile/InfluenceBadge.js';
import InfluenceDetail from '../components/profile/InfluenceDetail.js';
import { useInfluenceStore } from '../stores/influenceStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { Icon } from '../components/common/Icon.js';

type Tab = 'posts' | 'starred' | 'repos' | 'api';
const BASE_TABS = ['posts', 'starred', 'repos'] as const;
const SELF_TABS = ['api'] as const;

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function profileHandleFromParam(raw: string | undefined): string {
  if (!raw) return '';
  return raw.startsWith('@') ? raw.slice(1) : raw;
}

export default function UserProfilePage() {
  const { username: rawParam } = useParams<{ username: string }>();
  const username = profileHandleFromParam(rawParam);
  const navigate = useNavigate();
  const { user: me, logout } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [showFollowList, setShowFollowList] = useState<'followers' | 'following' | null>(null);
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);

  const isSelf = me?.username === username;
  const { t } = useUiStore();
  const { userScore, fetchUserScore, calculateScore, isCalculating } = useInfluenceStore();

  const rawTab = searchParams.get('tab') as Tab | null;
  const validTabs: Tab[] = isSelf ? [...BASE_TABS, ...SELF_TABS] : [...BASE_TABS];
  const tab: Tab = rawTab && validTabs.includes(rawTab) ? rawTab : 'posts';

  const handleTabChange = (t: Tab) => setSearchParams({ tab: t }, { replace: true });

  useEffect(() => {
    if (!username) return;
    setIsLoading(true);
    setNotFound(false);
    api.get<ApiResponse<UserProfile>>(`/users/@${username}`)
      .then((res) => {
        setProfile(res.data);
        setIsFollowing(res.data.isFollowing);
        setFollowerCount(res.data.followerCount);
        setBioDraft(res.data.bio ?? '');
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        setIsLoading(false);
      });
  }, [username]);

  useEffect(() => {
    if (username) fetchUserScore(username);
  }, [username, fetchUserScore]);

  const loadPosts = useCallback(async (reset = false, currentCursor: string | null = null) => {
    if (!username) return;
    setIsLoadingPosts(true);
    const c = reset ? undefined : currentCursor ?? undefined;
    const endpoint = tab === 'starred' ? 'starred' : 'posts';
    const path = `/users/@${username}/${endpoint}${c ? `?cursor=${encodeURIComponent(c)}` : ''}`;
    try {
      const res = await api.get<ApiResponse<Post[]>>(path);
      setPosts((prev) => reset ? res.data : [...prev, ...res.data]);
      setCursor(res.meta?.cursor ?? null);
      setHasMore(res.meta?.hasMore ?? false);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [username, tab]);

  useEffect(() => {
    if (tab === 'repos' || tab === 'api') return;
    setPosts([]); setCursor(null); setHasMore(true);
    void loadPosts(true, null);
  }, [username, tab, loadPosts]);

  useEffect(() => {
    if (tab !== 'repos' || !username || repos.length > 0) return;
    setIsLoadingRepos(true);
    api.get<ApiResponse<any[]>>(`/users/@${username}/repos`)
      .then((res) => setRepos(res.data))
      .catch(() => toastError('Failed to load repositories'))
      .finally(() => setIsLoadingRepos(false));
  }, [tab, username]);

  const handleBioSave = async () => {
    if (isSavingBio) return;
    setIsSavingBio(true);
    try {
      await api.put('/auth/me', { bio: bioDraft.trim() || null });
      setProfile((prev) => prev ? { ...prev, bio: bioDraft.trim() || null } : prev);
      setIsEditingBio(false);
      toastSuccess(t('post.updated'));
    } catch {
      toastError(t('post.saveFailed'));
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleFollow = async () => {
    if (!me) { navigate('/login'); return; }
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowerCount((c) => c + (next ? 1 : -1));
    try {
      await api.post(`/users/@${username}/follow`);
    } catch {
      setIsFollowing(!next);
      setFollowerCount((c) => c + (next ? -1 : 1));
    }
  };

  if (!username) return <Navigate to="/feed" replace />;

  if (notFound) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 px-6 max-w-md mx-auto text-center">
          <p className="text-red-400 font-mono text-sm">$ finger @{username} --not-found</p>
          <p className="text-[var(--text-muted)] text-[13px] mt-4 leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
            {t('profile.notFoundHint')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/feed')}
            className="mt-6 text-[var(--accent-green)] font-mono text-sm hover:underline"
          >
            ← {t('profile.goHome')}
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-16 space-y-16">
        
        {/* ── Follow List Overlay (Optimized) ── */}
        {showFollowList && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowFollowList(null)}>
            <div className="w-full max-w-lg bg-[#0d1117] border border-white/10 shadow-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center px-6 py-4 bg-white/[0.02] border-b border-white/5 font-mono text-xs text-gray-500 tracking-widest">
                <span>// NETWORK_EXPLORER: {showFollowList.toUpperCase()}</span>
                <button onClick={() => setShowFollowList(null)} className="hover:text-white transition-colors">
                  <Icon name="close" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-6">
                <GithubFollowSync defaultTab={showFollowList} />
              </div>
            </div>
          </div>
        )}

        {/* ── 1. Identity ── */}
        <section className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex-1 w-full space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#16213e] border border-white/5 rounded-full overflow-hidden grayscale shrink-0">
                {profile?.githubAvatarUrl ? <img src={profile.githubAvatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl text-gray-600">?</div>}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-white terminal-glow tracking-tighter truncate">@{username}</h1>
                <p className="text-base text-gray-500 font-mono mt-1">{profile?.displayName || '...'}</p>
              </div>
            </div>
            
            <div className="w-full">
              {isEditingBio ? (
                <div className="space-y-4 animate-fade-in">
                  <textarea 
                    value={bioDraft} 
                    onChange={(e) => setBioDraft(e.target.value)} 
                    className="w-full bg-white/[0.03] border border-white/10 text-[16px] text-white p-6 focus:border-[var(--accent-green)] outline-none rounded-sm leading-relaxed" 
                    rows={6} 
                    autoFocus 
                  />
                  <div className="flex justify-between items-center text-[11px] font-mono tracking-widest">
                    <span className="text-gray-600">{bioDraft.length} / 300</span>
                    <div className="flex gap-6">
                      <button onClick={() => setIsEditingBio(false)} className="text-gray-500 hover:text-white">CANCEL</button>
                      <button onClick={handleBioSave} className="text-[var(--accent-green)] font-bold">SAVE_CHANGES</button>
                    </div>
                  </div>
                </div>
              ) : (
                <p 
                  onClick={() => isSelf && setIsEditingBio(true)} 
                  className={`text-[15px] text-gray-400 leading-relaxed max-w-2xl ${isSelf ? 'cursor-pointer hover:text-gray-300 transition-colors' : ''}`}
                >
                  {profile?.bio || (isSelf ? t('profile.bioPlaceholder') : '...')}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 shrink-0">
            {userScore && <InfluenceBadge tier={userScore.tier} tierLabel={userScore.tierLabel} score={userScore.score} size="lg" />}
            {!isSelf && (
              <button onClick={handleFollow} className={`text-[11px] font-mono transition-colors uppercase tracking-widest ${isFollowing ? 'text-gray-600 hover:text-red-500' : 'text-[var(--accent-green)] font-bold'}`}>
                {isFollowing ? '[ Following ]' : '[ Follow ]'}
              </button>
            )}
          </div>
        </section>

        {/* ── 2. Vital Signs ── */}
        <section className="grid grid-cols-3 border-y border-white/5 py-8 font-mono tracking-tighter">
          <button onClick={() => setShowFollowList('followers')} className="text-center group">
            <span className="block text-2xl text-white group-hover:text-[var(--accent-green)] transition-all">{formatCount(followerCount)}</span>
            <span className="text-[11px] text-gray-600 uppercase tracking-widest mt-1 block">{t('profile.followers')}</span>
          </button>
          <button onClick={() => setShowFollowList('following')} className="text-center group border-x border-white/5">
            <span className="block text-2xl text-white group-hover:text-[var(--accent-green)] transition-all">{formatCount(profile?.followingCount || 0)}</span>
            <span className="text-[11px] text-gray-600 uppercase tracking-widest mt-1 block">{t('profile.following')}</span>
          </button>
          <div className="text-center">
            <span className="block text-2xl text-white">{formatCount(profile?.postCount || 0)}</span>
            <span className="text-[11px] text-gray-600 uppercase tracking-widest mt-1 block">{t('profile.posts')}</span>
          </div>
        </section>

        {/* ── 3. Action Tools ── */}
        <section className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] text-gray-500 uppercase tracking-[0.2em]">
          {isSelf ? (
            <>
              <Link to="/chat" className="hover:text-[var(--accent-green)] transition-colors">⊙ {t('profile.chat')}</Link>
              <Link to="/messages" className="hover:text-[var(--accent-cyan)] transition-colors">✉ {t('profile.messages')}</Link>
              {profile?.githubUsername && <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-blue)] transition-colors">⑂ Github</a>}
              <button onClick={async () => { await logout(); navigate('/login'); }} className="text-red-900 hover:text-red-500 transition-colors uppercase tracking-widest">∅ Logout</button>
            </>
          ) : (
            <button onClick={() => navigate(`/messages/${username}`)} className="hover:text-[var(--accent-cyan)] transition-colors">✉ {t('profile.messages')}</button>
          )}
        </section>

        {/* ── 4. Deep Insights ── */}
        {((isSelf && profile?.githubUsername) || userScore) && (
          <div className="space-y-12 pt-4">
            {profile?.githubUsername && (
              <div className="opacity-50 hover:opacity-100 transition-all duration-500 overflow-hidden">
                <div className="font-mono text-[10px] text-gray-700 mb-4 uppercase tracking-[0.3em]">// GitHub Activity Matrix</div>
                <ContributionGraph githubUsername={profile.githubUsername} />
              </div>
            )}

            {userScore && (
              <div className="bg-white/[0.01] border-l border-white/10 pl-8 py-4 transition-all hover:bg-white/[0.02]">
                <div className="font-mono text-[10px] text-gray-700 mb-6 uppercase tracking-[0.3em]">// Influence Metrics & Authority</div>
                <InfluenceDetail score={userScore} isOwnProfile={isSelf} onRecalculate={calculateScore} isCalculating={isCalculating} />
              </div>
            )}
          </div>
        )}

        {/* ── 5. The Feed ── */}
        <section className="space-y-10">
          <nav className="flex gap-8 font-mono text-[12px] tracking-[0.25em]">
            {validTabs.map((t_key) => (
              <button key={t_key} onClick={() => handleTabChange(t_key)} className={`transition-all ${tab === t_key ? 'text-[var(--accent-green)] font-bold' : 'text-gray-600 hover:text-gray-400'}`}>
                {tab === t_key ? '> ' : ''}{t_key.toUpperCase()}
              </button>
            ))}
          </nav>

          <div className="space-y-0 border-l border-white/5">
            {tab === 'api' && isSelf ? (
              <div className="pl-8"><ApiTab onToast={toastSuccess} /></div>
            ) : tab === 'repos' ? (
              <div className="divide-y divide-white/5">
                {repos.map((repo) => {
                  const repoOwner = repo.url.replace('https://github.com/', '').split('/')[0] ?? '';
                  return (
                    <div key={repo.name} className="flex items-center gap-6 py-5 pl-8 hover:bg-white/[0.02] transition-all group">
                      <span className="text-[11px] text-gray-700 font-mono w-24 shrink-0">{new Date(repo.updatedAt).toISOString().slice(0, 10)}</span>
                      <div className="flex-1 min-w-0">
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-base text-gray-400 group-hover:text-white transition-colors truncate font-mono block">
                          {repo.name} <span className="text-[11px] text-gray-700 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">[{repo.language || '?'}]</span>
                        </a>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <span className="text-[11px] text-gray-700 font-mono hidden sm:block">★ {formatCount(repo.stars)}</span>
                        {isSelf && (
                          <Link
                            to={`/analyze?repo=${repoOwner}/${repo.name}`}
                            className="text-[10px] font-mono text-gray-600 hover:text-[var(--accent-green)] border border-white/10 px-3 py-1 hover:border-[var(--accent-green)]/30 transition-all uppercase"
                          >
                            analyze
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => <PostCard key={post.id} post={post} />)}
                {hasMore && (
                  <button onClick={() => loadPosts(false, cursor)} className="w-full py-12 font-mono text-[11px] text-gray-700 hover:text-gray-400 uppercase tracking-[0.4em] transition-all">
                    [ {t('profile.loadMore')} ]
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
