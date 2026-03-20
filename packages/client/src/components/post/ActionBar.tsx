import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useFeedStore } from '../../stores/feedStore.js';
import { useUiStore } from '../../stores/uiStore.js';
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

  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    starPost(postId, !isStarred);
    try {
      await api.post<ApiResponse<{ isStarred: boolean; starCount: number }>>(`/posts/${postId}/star`);
    } catch {
      starPost(postId, isStarred);
    }
  };

  const handleFork = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    setLocalForkCount((c) => c + 1);
    try {
      await api.post(`/posts/${postId}/fork`);
    } catch {
      setLocalForkCount((c) => c - 1);
    }
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/post/${postId}`);
  };

  return (
    <div className="flex gap-6 px-5 py-3 border-t border-[#111120]">
      <button
        data-testid="reply-button"
        onClick={handleReply}
        className="font-mono text-[12px] text-[#7a8898] hover:text-[#3dd68c] transition-colors"
        aria-label="Reply to post"
      >
        {t('post.action.reply')}
        {replyCount > 0 && <span className="ml-1.5 text-[#9aacbf]">{replyCount}</span>}
      </button>
      <button
        data-testid="fork-button"
        onClick={handleFork}
        className="font-mono text-[12px] text-[#7a8898] hover:text-[#60a5fa] transition-colors"
        aria-label="Fork post"
      >
        {t('post.action.fork')}
        {localForkCount > 0 && <span className="ml-1.5 text-[#9aacbf]">{localForkCount}</span>}
      </button>
      <button
        data-testid="star-button"
        onClick={handleStar}
        className={`font-mono text-[12px] transition-colors ${
          isStarred ? 'text-[#f59e0b]' : 'text-[#7a8898] hover:text-[#f59e0b]'
        }`}
        aria-pressed={isStarred}
        aria-label="Star post"
      >
        {isStarred ? t('post.action.star') : t('post.action.unstar')}
        {starCount > 0 && (
          <span
            data-testid="star-count"
            className={`ml-1.5 ${isStarred ? 'text-[#f59e0b]/70' : 'text-[#9aacbf]'}`}
          >
            {starCount}
          </span>
        )}
      </button>
    </div>
  );
}
