import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useFeedStore } from '../../stores/feedStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { toastError } from '../../stores/toastStore.js';
import type { ApiResponse } from '@clitoris/shared';

interface ActionBarProps {
  postId: string;
  replyCount: number;
  forkCount: number;
  starCount: number;
  isStarred: boolean;
}

export default function ActionBar({
  postId,
  replyCount,
  forkCount,
  starCount,
  isStarred,
}: ActionBarProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { starPost } = useFeedStore();
  const { t } = useUiStore();
  const [localForkCount, setLocalForkCount] = useState(forkCount);
  const starBusy = useRef(false);
  const forkBusy = useRef(false);

  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (starBusy.current) return;
    starBusy.current = true;
    starPost(postId, !isStarred);
    try {
      await api.post<ApiResponse<{ isStarred: boolean; starCount: number }>>(`/posts/${postId}/star`);
    } catch {
      starPost(postId, isStarred);
      toastError('Failed to star post');
    } finally {
      starBusy.current = false;
    }
  };

  const handleFork = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (forkBusy.current) return;
    forkBusy.current = true;
    setLocalForkCount((c) => c + 1);
    try {
      await api.post(`/posts/${postId}/fork`);
    } catch {
      setLocalForkCount((c) => c - 1);
      toastError('Failed to fork post');
    } finally {
      forkBusy.current = false;
    }
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/post/${postId}`);
  };

  return (
    <div className="flex gap-6 px-5 py-3 border-t border-[var(--border)]">
      <button
        data-testid="reply-button"
        onClick={handleReply}
        className="font-mono text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-green)] transition-colors"
        aria-label="Reply to post"
      >
        {t('post.action.reply')}
        {replyCount > 0 && <span className="ml-1.5 text-[var(--text-muted)]">{replyCount}</span>}
      </button>
      <button
        data-testid="fork-button"
        onClick={handleFork}
        className="font-mono text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
        aria-label="Fork post"
      >
        {t('post.action.fork')}
        {localForkCount > 0 && <span className="ml-1.5 text-[var(--text-muted)]">{localForkCount}</span>}
      </button>
      <button
        data-testid="star-button"
        onClick={handleStar}
        className={`font-mono text-[12px] transition-colors ${
          isStarred ? 'text-[var(--accent-amber)]' : 'text-[var(--text-muted)] hover:text-[var(--accent-amber)]'
        }`}
        aria-pressed={isStarred}
        aria-label="Star post"
      >
        {isStarred ? t('post.action.star') : t('post.action.unstar')}
        {starCount > 0 && (
          <span
            data-testid="star-count"
            className={`ml-1.5 ${isStarred ? 'text-[var(--accent-amber)]/70' : 'text-[var(--text-muted)]'}`}
          >
            {starCount}
          </span>
        )}
      </button>
    </div>
  );
}
