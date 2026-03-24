import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.js';
import FeedList from '../components/feed/FeedList.js';
import { useAuthStore } from '../stores/authStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { useFeedStore } from '../stores/feedStore.js';
import { api } from '../api/client.js';
import { toastError } from '../stores/toastStore.js';

type FeedTab = 'global' | 'local';

export default function GlobalFeedPage() {
  const { isAuthenticated } = useAuthStore();
  const { lang, t } = useUiStore();
  const navigate = useNavigate();
  const { focusedPostId, fetchFeed, reset } = useFeedStore();

  const [tab, setTab] = useState<FeedTab>('global');

  // Set HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Fetch feed when tab changes
  useEffect(() => {
    if (tab === 'local' && !isAuthenticated) {
      setTab('global');
      return;
    }
    reset();
    fetchFeed(tab);
  }, [tab, reset, fetchFeed, isAuthenticated]);

  // Scroll focused post into view
  useEffect(() => {
    if (!focusedPostId) return;
    const el = document.querySelector(`[data-post-id="${focusedPostId}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusedPostId]);

  // Feed-only shortcuts (j/k/s/o etc. live in AppShell useKeyboardShortcuts)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      const tag = (document.activeElement as HTMLElement).tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;

      switch (e.key) {
        case 'f':
          if (focusedPostId && isAuthenticated) {
            void api.post(`/posts/${focusedPostId}/fork`).catch(() => toastError('Failed to fork post'));
          }
          break;
        case '1':
          setTab('global');
          break;
        case '2':
          if (isAuthenticated) setTab('local');
          break;
        default:
          break;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [focusedPostId, isAuthenticated]);

  const handleRefresh = useCallback(async () => {
    reset();
    await fetchFeed(tab);
  }, [tab, reset, fetchFeed]);

  return (
    <AppShell onRefresh={handleRefresh}>
      <div className="max-w-[680px] mx-auto">
        {/* Feed header — search + tabs */}
        <div className="sticky top-0 z-10 bg-[var(--bg-void)]/95 backdrop-blur-sm border-b border-[var(--border)]/30">
          {/* Search bar */}
          <div className="px-4 pt-3 pb-2">
            <button
              onClick={() => navigate('/search')}
              className="w-full flex items-center bg-[var(--bg-surface)] border border-[var(--border)]/50 hover:border-[var(--border-hover)] px-3 py-2 transition-colors"
            >
              <span className="font-mono text-[12px] text-[var(--text-faint)]">
                $ grep "<span className="text-[var(--text-muted)]">{t('feed.searchPlaceholder')}</span>"
              </span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'global'}
              onClick={() => setTab('global')}
              className={`flex-1 py-2.5 font-mono text-[12px] text-center transition-colors border-b-2 ${
                tab === 'global'
                  ? 'text-[var(--text)] border-[var(--accent-green)]'
                  : 'text-[var(--text-faint)] border-transparent hover:text-[var(--text-muted)]'
              }`}
            >
              {t('feed.tab.global')}
            </button>
            {isAuthenticated && (
              <button
                role="tab"
                aria-selected={tab === 'local'}
                onClick={() => setTab('local')}
                className={`flex-1 py-2.5 font-mono text-[12px] text-center transition-colors border-b-2 ${
                  tab === 'local'
                    ? 'text-[var(--text)] border-[var(--accent-green)]'
                    : 'text-[var(--text-faint)] border-transparent hover:text-[var(--text-muted)]'
                }`}
              >
                {t('feed.tab.local')}
              </button>
            )}
          </div>
        </div>

        <FeedList
          {...(tab === 'local' ? { emptyTitle: '$ feed --local', emptyBody: t('feed.local.emptyBody') } : {})}
        />
      </div>
    </AppShell>
  );
}
