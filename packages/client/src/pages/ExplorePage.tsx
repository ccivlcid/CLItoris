import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.js';
import FeedList from '../components/feed/FeedList.js';
import { useFeedStore } from '../stores/feedStore.js';
import { api } from '../api/client.js';
import type { ApiResponse, TrendingTag, TrendingRepo } from '@clitoris/shared';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get('tag') ?? undefined;
  const { reset } = useFeedStore();
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);

  // Load trending tags + repos once
  useEffect(() => {
    api.get<ApiResponse<TrendingTag[]>>('/posts/trending/tags')
      .then((res) => setTrendingTags(res.data))
      .catch(() => {/* silent */})
      .finally(() => setTagsLoading(false));

    api.get<ApiResponse<TrendingRepo[]>>('/posts/trending/repos')
      .then((res) => setTrendingRepos(res.data))
      .catch(() => {/* silent */})
      .finally(() => setReposLoading(false));
  }, []);

  // Reload explore feed when tag changes
  useEffect(() => {
    reset();
    const path = activeTag
      ? `/posts/feed/explore?tag=${encodeURIComponent(activeTag)}`
      : '/posts/feed/explore';

    useFeedStore.setState({ isLoading: true, error: null, posts: [], cursor: null, hasMore: true, feedEndpoint: 'explore' });
    api.get<ApiResponse<import('@clitoris/shared').Post[]>>(path)
      .then((res) => {
        useFeedStore.setState({
          posts: res.data,
          cursor: res.meta?.cursor ?? null,
          hasMore: res.meta?.hasMore ?? false,
          isLoading: false,
        });
      })
      .catch(() => {
        useFeedStore.setState({ isLoading: false, error: 'Failed to load explore.' });
      });
  }, [activeTag, reset]);

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      searchParams.delete('tag');
    } else {
      searchParams.set('tag', tag);
    }
    setSearchParams(searchParams);
  };

  const clearTag = () => {
    searchParams.delete('tag');
    setSearchParams(searchParams);
  };

  return (
    <AppShell breadcrumb="explore">
      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Trending Tags */}
        <div className="border border-gray-700 bg-[#16213e] p-4">
          <p className="text-gray-600 text-xs font-mono mb-3">// trending tags</p>
          {tagsLoading ? (
            <div className="flex flex-wrap gap-2 animate-pulse">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-5 bg-gray-700 rounded" style={{ width: `${50 + i * 10}px` }} />
              ))}
            </div>
          ) : trendingTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-2 py-0.5 font-mono text-xs transition-colors ${
                    activeTag === tag
                      ? 'text-cyan-300 border border-cyan-400/50 bg-cyan-400/10'
                      : 'text-cyan-400 hover:text-cyan-300 border border-transparent hover:border-cyan-400/30'
                  }`}
                >
                  #{tag}
                  <span className="text-gray-600 ml-1">{count}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 font-mono text-xs">&gt; no trending tags yet.</p>
          )}
        </div>

        {/* Trending Repos */}
        {(reposLoading || trendingRepos.length > 0) && (
          <div className="border border-gray-700 bg-[#16213e] p-4">
            <p className="text-gray-600 text-xs font-mono mb-3">// trending repos this week</p>
            {reposLoading ? (
              <div className="space-y-2 animate-pulse">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-8 bg-gray-700 rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {trendingRepos.map((repo) => (
                  <a
                    key={`${repo.owner}/${repo.name}`}
                    href={`https://github.com/${repo.owner}/${repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-700/30 transition-colors group"
                  >
                    <span className="text-gray-700 font-mono text-[10px] shrink-0 group-hover:text-gray-500">■</span>
                    <span className="text-sky-400 font-mono text-xs flex-1 min-w-0 truncate">
                      {repo.owner}/<span className="font-semibold">{repo.name}</span>
                    </span>
                    {repo.language && (
                      <span className="text-gray-600 font-mono text-[10px] shrink-0">{repo.language}</span>
                    )}
                    <span className="text-gray-600 font-mono text-[10px] shrink-0">★ {formatCount(repo.stars)}</span>
                    <span className="text-orange-400/70 font-mono text-[10px] shrink-0">
                      ×{repo.mentionCount}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active tag filter */}
        {activeTag && (
          <div className="flex items-center justify-between border border-cyan-400/20 bg-cyan-400/5 px-4 py-2">
            <span className="text-cyan-400 font-mono text-sm">
              $ explore --tag={activeTag}
            </span>
            <button
              onClick={clearTag}
              className="text-gray-600 hover:text-gray-300 font-mono text-xs transition-colors"
            >
              [× clear]
            </button>
          </div>
        )}

        {/* Posts */}
        <FeedList
          emptyTitle="$ explore --sort=stars"
          emptySubtitle="> 0 posts found."
          emptyBody={activeTag ? `No posts tagged #${activeTag} yet.` : 'No posts found. Be the first to post!'}
        />

      </div>
    </AppShell>
  );
}
