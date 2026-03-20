import { useEffect, useCallback } from 'react';
import { useFeedStore } from '../../stores/feedStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import PostCard from '../post/PostCard.js';
import InfiniteScrollTrigger from './InfiniteScrollTrigger.js';

function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="border border-gray-700 overflow-hidden animate-pulse"
    >
      <div className="px-4 py-2 bg-[#16213e] flex items-center justify-between">
        <div className="flex gap-2">
          <div className="h-3 w-24 bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-700 rounded" />
        </div>
        <div className="h-3 w-12 bg-gray-700 rounded" />
      </div>
      <div className="grid grid-cols-2">
        <div className="bg-[#16213e] p-4 space-y-2">
          <div className="h-3 w-full bg-gray-700 rounded" />
          <div className="h-3 w-4/5 bg-gray-700 rounded" />
          <div className="h-3 w-full bg-gray-700 rounded" />
          <div className="h-3 w-3/5 bg-gray-700 rounded" />
        </div>
        <div className="bg-[#0d1117] p-4 space-y-2">
          <div className="h-3 w-full bg-gray-700 rounded" />
          <div className="h-3 w-4/5 bg-gray-700 rounded" />
          <div className="h-3 w-full bg-gray-700 rounded" />
          <div className="h-3 w-3/5 bg-gray-700 rounded" />
        </div>
      </div>
      <div className="border-t border-gray-700 px-4 py-2 flex gap-6">
        <div className="h-3 w-10 bg-gray-700 rounded" />
        <div className="h-3 w-10 bg-gray-700 rounded" />
        <div className="h-3 w-10 bg-gray-700 rounded" />
      </div>
    </div>
  );
}

interface FeedListProps {
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyBody?: string;
}

export default function FeedList({ emptyTitle, emptySubtitle, emptyBody }: FeedListProps = {}) {
  const { posts, isLoading, isLoadingMore, hasMore, error, cursor, focusedPostId, fetchGlobalFeed, fetchNextPage } =
    useFeedStore();
  const { t } = useUiStore();

  useEffect(() => {
    fetchGlobalFeed();
  }, [fetchGlobalFeed]);

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  if (isLoading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-0">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div
        data-testid="feed-error"
        className="border border-red-400/30 bg-[#16213e] p-8 max-w-md mx-auto mt-8"
      >
        <p className="text-green-400 font-mono text-sm">{t('feed.error.title')}</p>
        <p className="text-red-400 font-mono text-sm">{t('feed.error.message')}</p>
        <p className="text-gray-400 font-sans text-sm mt-2 whitespace-pre-line">
          {t('feed.error.body')}
        </p>
        <button
          data-testid="feed-retry"
          onClick={fetchGlobalFeed}
          className="mt-4 bg-green-400/10 text-green-400 border border-green-400/30 px-4 py-1.5 font-mono text-sm hover:bg-green-400/20 transition-colors"
        >
          {t('feed.error.retry')}
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        data-testid="feed-empty"
        className="border border-gray-700 bg-[#16213e] p-8 max-w-md mx-auto mt-8 text-center"
      >
        <p className="text-green-400 font-mono text-sm">{emptyTitle ?? t('feed.empty.title')}</p>
        <p className="text-orange-400 font-mono text-sm">{emptySubtitle ?? t('feed.empty.subtitle')}</p>
        <p className="text-gray-400 font-sans text-sm mt-3 whitespace-pre-line">
          {emptyBody ?? t('feed.empty.body')}
        </p>
        {!emptyTitle && (
          <>
            <p className="text-green-400 font-mono text-sm mt-4">{t('feed.empty.help')}</p>
            <p className="text-gray-500 font-sans text-sm whitespace-pre-line">
              {t('feed.empty.helpBody')}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div aria-live="polite" className="flex flex-col gap-0">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} focused={focusedPostId === post.id} />
      ))}

      {isLoadingMore && (
        <div
          data-testid="feed-loading"
          className="border border-gray-700 bg-[#16213e] px-4 py-3"
        >
          <span className="text-gray-500 font-mono text-xs">
            {t('feed.loading', { cursor: cursor ?? '...' })}
          </span>
        </div>
      )}

      {hasMore && !isLoadingMore && (
        <InfiniteScrollTrigger onTrigger={handleLoadMore} />
      )}
    </div>
  );
}
