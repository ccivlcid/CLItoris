import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeedStore } from '../stores/feedStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { api } from '../api/client.js';

export function useKeyboardShortcuts(onToggleHelp: () => void) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const { posts, focusedPostId, focusNext, focusPrev, focusPost, starPost } = useFeedStore();

  // Scroll focused post into view whenever it changes
  useEffect(() => {
    if (!focusedPostId) return;
    const el = document.querySelector<HTMLElement>(`[data-post-id="${focusedPostId}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusedPostId]);

  const gPending = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const isFeedPage = pathname === '/feed';

    const handler = (e: KeyboardEvent) => {
      // Never fire when user is typing
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) return;

      if (e.isComposing) return;
      // Keep Shift (for ? / G); block OS/browser chords
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;

      // ── g-prefix chord ───────────────────────────────────────────────
      if (gPending.current) {
        gPending.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        switch (key) {
          case 'g': // gg → scroll to top
            document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          case 'h': navigate('/'); break;
          case 'l': navigate('/feed/local'); break;
          case 'e': navigate('/explore'); break;
          case 'a': navigate('/analyze'); break;
          case 'p': if (user) navigate(`/@${user.username}`); break;
          case 's':
            if (user) navigate(`/@${user.username}?tab=cli`);
            break;
        }
        return;
      }

      // ── Single-key shortcuts ─────────────────────────────────────────
      switch (key) {
        case 'j':
          if (!isFeedPage) break;
          e.preventDefault();
          focusNext();
          break;

        case 'k':
          if (!isFeedPage) break;
          e.preventDefault();
          focusPrev();
          break;

        case 'g':
          gPending.current = true;
          gTimer.current = setTimeout(() => { gPending.current = false; }, 600);
          break;

        case 'G': {
          const main = document.querySelector('main');
          main?.scrollTo({ top: main.scrollHeight, behavior: 'smooth' });
          break;
        }

        case 'Enter':
        case 'o':
          if (!isFeedPage || !focusedPostId) break;
          e.preventDefault();
          navigate(`/post/${focusedPostId}`);
          break;

        case 's': {
          if (!isFeedPage || !focusedPostId) break;
          const post = posts.find((p) => p.id === focusedPostId);
          if (!post) break;
          if (!user) { navigate('/login'); break; }
          const next = !post.isStarred;
          starPost(focusedPostId, next);
          api.post(`/posts/${focusedPostId}/star`).catch(() => starPost(focusedPostId, !next));
          break;
        }

        case 'r':
          if (!isFeedPage || !focusedPostId) break;
          navigate(`/post/${focusedPostId}`);
          break;

        case 'u': {
          if (!isFeedPage || !focusedPostId) break;
          const post = posts.find((p) => p.id === focusedPostId);
          if (post) navigate(`/@${post.user.username}`);
          break;
        }

        case '/':
          // Explore: focus search; Post detail: focus reply — page handlers own '/'
          if (pathname === '/explore' || pathname.startsWith('/post/')) break;
          e.preventDefault();
          navigate('/new');
          break;

        case '?':
          onToggleHelp();
          break;

        case 'Escape':
          if (!isFeedPage) break;
          focusPost(null);
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, pathname, user, posts, focusedPostId, focusNext, focusPrev, focusPost, starPost, onToggleHelp]);
}
