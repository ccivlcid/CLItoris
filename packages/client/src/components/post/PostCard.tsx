import { Link, useNavigate } from 'react-router-dom';
import type { Post } from '@clitoris/shared';
import LangBadge from './LangBadge.js';
import DualPanel from './DualPanel.js';
import ActionBar from './ActionBar.js';
import RepoCard from './RepoCard.js';
import { useUiStore } from '../../stores/uiStore.js';

interface PostCardProps {
  post: Post;
  focused?: boolean;
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const AVATAR_COLORS = [
  '#3dd68c', '#f59e0b', '#60a5fa', '#c084fc', '#f87171', '#34d399', '#fb923c',
];

function avatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) & 0xffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

export default function PostCard({ post, focused = false }: PostCardProps) {
  const navigate = useNavigate();
  const { lang: uiLang } = useUiStore();
  const { user } = post;
  const showTranslate = post.lang !== uiLang;
  const color = avatarColor(user.username);

  return (
    <article
      data-testid="post-card"
      data-post-id={post.id}
      role="article"
      aria-labelledby={`post-header-${post.id}`}
      onClick={() => navigate(`/post/${post.id}`)}
      className={`cursor-pointer border-b transition-colors ${
        focused
          ? 'border-[#3dd68c]/20 bg-[#3dd68c]/[0.02]'
          : 'border-[#13132a] hover:bg-[#0d0d1e]'
      }`}
    >
      {/* Header */}
      <div
        id={`post-header-${post.id}`}
        className="flex items-center gap-3 px-5 pt-4 pb-3"
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 shrink-0 flex items-center justify-center font-mono text-[13px] font-bold text-[#090912]"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        >
          {user.username[0]?.toUpperCase()}
        </div>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link
            to={`/@${user.username}`}
            data-testid="post-username"
            className="font-mono text-[13px] font-semibold hover:text-[#f5c264] transition-colors shrink-0"
            style={{ color }}
            onClick={(e) => e.stopPropagation()}
          >
            @{user.username}
          </Link>
          <span className="text-[#525270] text-[11px] font-mono">·</span>
          <span className="text-[#7a8898] text-[11px] font-mono shrink-0">{timeAgo(post.createdAt)}</span>

          {post.intent && post.intent !== 'casual' && (
            <span className="text-[#525270] text-[10px] font-mono shrink-0 hidden sm:inline">
              --{post.intent}
            </span>
          )}
          {post.emotion && post.emotion !== 'neutral' && (
            <span className="text-[#525270] text-[10px] font-mono shrink-0 hidden sm:inline">
              --{post.emotion}
            </span>
          )}
        </div>

        <LangBadge lang={post.lang} />
      </div>

      {/* Dual Panel */}
      <DualPanel
        postId={post.id}
        messageRaw={post.messageRaw}
        messageCli={post.messageCli}
        tags={post.tags}
        postLang={post.lang}
        showTranslate={showTranslate}
        uiLang={uiLang}
      />

      {/* Repo attachment */}
      {post.repoAttachment && <RepoCard repo={post.repoAttachment} />}

      {/* Action Bar */}
      <ActionBar
        postId={post.id}
        replyCount={post.replyCount}
        forkCount={post.forkCount}
        starCount={post.starCount}
        isStarred={post.isStarred}
      />
    </article>
  );
}
