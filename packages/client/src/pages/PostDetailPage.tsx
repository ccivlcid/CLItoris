import { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.js';
import PostCard from '../components/post/PostCard.js';
import { usePostDetailStore } from '../stores/postDetailStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { api } from '../api/client.js';
import type { ApiResponse } from '@clitoris/shared';

// ── Skeleton ─────────────────────────────────────────────────

function SkeletonBlock({ lines }: { lines: number }) {
  return (
    <div className="border border-gray-700 animate-pulse">
      <div className="flex items-center justify-between px-4 py-2 bg-[#16213e]">
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 bg-gray-700 rounded" />
          <div className="h-3 w-12 bg-gray-700 rounded" />
        </div>
        <div className="h-3 w-14 bg-gray-700 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="bg-[#16213e] p-4 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-700 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
        <div className="bg-[#0d1117] p-4 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-800 rounded" style={{ width: `${60 + (i % 3) * 12}%` }} />
          ))}
        </div>
      </div>
      <div className="border-t border-gray-700 px-4 py-2 flex gap-6">
        <div className="h-3 w-12 bg-gray-700 rounded" />
        <div className="h-3 w-10 bg-gray-700 rounded" />
        <div className="h-3 w-10 bg-gray-700 rounded" />
      </div>
    </div>
  );
}

// ── Reply Composer ────────────────────────────────────────────

function ReplyComposer({ parentId, parentUsername }: { parentId: string; parentUsername: string }) {
  const { isAuthenticated } = useAuthStore();
  const { draft, cliPreview, isTransforming, isSubmitting, setDraft, transformReply, submitReply } =
    usePostDetailStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { t } = useUiStore();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void submitReply(parentId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        data-testid="login-prompt"
        className="border border-gray-700 bg-[#16213e] p-6 text-center"
      >
        <p className="text-orange-400 font-mono text-sm mb-3">
          &gt; Login to reply.
        </p>
        <button
          onClick={() => navigate(`/login?redirect=/post/${parentId}`)}
          className="bg-green-400/10 text-green-400 border border-green-400/30 px-4 py-1.5 font-mono text-sm hover:bg-green-400/20 transition-colors"
        >
          $ login
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-700 bg-[#16213e] p-4">
      <p className="text-gray-500 text-xs font-mono mb-3">
        &gt; {t('post.action.reply')} --to=@{parentUsername}
      </p>

      <textarea
        ref={textareaRef}
        data-testid="reply-composer-input"
        aria-label={`Write a reply to @${parentUsername}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your reply..."
        rows={3}
        className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 font-sans text-sm px-3 py-2 placeholder-gray-600 resize-none focus:outline-none focus:border-gray-500"
      />

      {cliPreview && (
        <pre className="mt-2 px-3 py-2 bg-[#0d1117] text-green-400 font-mono text-xs whitespace-pre-wrap border border-gray-700">
          {cliPreview}
        </pre>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs font-mono">Cmd+Enter · reply</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => transformReply(parentId)}
            disabled={!draft.trim() || isTransforming}
            className="bg-[#0d1117] text-gray-300 border border-gray-700 px-3 py-1.5 font-mono text-xs hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isTransforming ? 'transforming...' : 'LLM → CLI'}
          </button>
          <button
            data-testid="reply-composer-submit"
            onClick={() => submitReply(parentId)}
            disabled={!draft.trim() || isSubmitting}
            className="bg-green-400/10 text-green-400 border border-green-400/30 px-4 py-1.5 font-mono text-sm hover:bg-green-400/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'replying...' : 'reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { post, replies, forkedFrom, isLoading, error, starPost, fetchPost, reset } = usePostDetailStore();
  const replyThreadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      void fetchPost(id);
    }
    return () => reset();
  }, [id, fetchPost, reset]);

  // Keyboard shortcuts
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        navigate(-1);
      }
      if (e.key === 'r' || e.key === '/') {
        replyThreadRef.current?.querySelector('textarea')?.focus();
      }
      if (e.key === 's' && post) {
        void handleStar(post.id, !post.isStarred);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [post, navigate]);

  const handleStar = async (postId: string, starred: boolean) => {
    starPost(postId, starred);
    try {
      await api.post<ApiResponse<{ starred: boolean; starCount: number }>>(`/posts/${postId}/star`);
    } catch {
      starPost(postId, !starred); // revert
    }
  };

  const shortId = id ? id.slice(0, 8) : '';
  const breadcrumb = `post --id=${shortId}`;

  if (error) {
    return (
      <AppShell breadcrumb={breadcrumb}>
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <button
            data-testid="back-button"
            aria-label="Go back to feed"
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-300 font-mono text-sm transition-colors"
          >
            ← back to feed
          </button>
          <div
            data-testid="post-not-found"
            className="border border-red-400/30 bg-[#16213e] p-8 text-center space-y-3"
          >
            <p className="text-green-400 font-mono text-sm">$ post --id={shortId}</p>
            <p className="text-red-400 font-mono text-sm">error: 404 not found</p>
            <p className="text-gray-400 font-sans text-sm">
              This post doesn&apos;t exist or has been deleted.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 bg-green-400/10 text-green-400 border border-green-400/30 px-4 py-1.5 font-mono text-sm hover:bg-green-400/20 transition-colors"
            >
              $ feed --global
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumb={breadcrumb}>
      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Back button */}
        <button
          data-testid="back-button"
          aria-label="Go back to feed"
          aria-keyshortcuts="Backspace"
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-300 font-mono text-sm transition-colors"
        >
          ← back to feed
        </button>

        {/* Forked-from banner */}
        {!isLoading && forkedFrom && (
          <Link
            data-testid="forked-from-banner"
            role="link"
            aria-label={`View original post by @${forkedFrom.user.username}`}
            to={`/post/${forkedFrom.id}`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-700 bg-[#16213e] text-gray-400 text-xs font-mono hover:border-gray-600 hover:text-gray-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-blue-400">◇</span>
            <span>forked from</span>
            <span className="text-amber-400">@{forkedFrom.user.username}</span>
            <span className="text-gray-600 truncate">· {forkedFrom.messageRaw.slice(0, 60)}</span>
          </Link>
        )}

        {/* Main post */}
        {isLoading ? (
          <SkeletonBlock lines={6} />
        ) : post ? (
          <div data-testid="main-post-card">
            <PostCard post={post} focused />
          </div>
        ) : null}

        {/* Reply thread */}
        <div
          ref={replyThreadRef}
          data-testid="reply-thread"
          aria-label={`Reply thread with ${replies.length} replies`}
          aria-live="polite"
          className="space-y-3"
        >
          {/* Reply count header */}
          <div className="border-b border-gray-700 pb-2">
            <span
              data-testid="reply-count"
              className="text-gray-600 text-xs font-mono"
            >
              // {isLoading ? '…' : replies.length} replies
            </span>
          </div>

          {/* Skeleton replies */}
          {isLoading && (
            <>
              <SkeletonBlock lines={2} />
              <SkeletonBlock lines={2} />
              <SkeletonBlock lines={2} />
            </>
          )}

          {/* Empty state */}
          {!isLoading && replies.length === 0 && post && (
            <div className="border border-gray-700 bg-[#16213e] p-6 text-center space-y-2">
              <p className="text-green-400 font-mono text-sm">
                $ reply --to=@{post.user.username}
              </p>
              <p className="text-orange-400 font-mono text-sm">&gt; No replies yet.</p>
              <p className="text-gray-400 font-sans text-sm">
                Be the first to reply. Use the composer below.
              </p>
            </div>
          )}

          {/* Reply cards */}
          {!isLoading &&
            replies.map((reply) => (
              <div key={reply.id} data-testid="reply-card">
                <PostCard post={reply} />
              </div>
            ))}
        </div>

        {/* Reply composer */}
        {post && (
          <ReplyComposer
            parentId={post.id}
            parentUsername={post.user.username}
          />
        )}
        {/* Disabled composer placeholder while loading */}
        {isLoading && !post && (
          <div className="border border-gray-700 bg-[#16213e] p-4 opacity-40 cursor-not-allowed">
            <textarea
              disabled
              placeholder="Write your reply..."
              rows={3}
              className="w-full bg-[#0d1117] border border-gray-700 text-gray-600 font-sans text-sm px-3 py-2 placeholder-gray-700 resize-none"
            />
          </div>
        )}

      </div>
    </AppShell>
  );
}
