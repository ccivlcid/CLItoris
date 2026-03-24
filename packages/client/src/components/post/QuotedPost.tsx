import { Link } from 'react-router-dom';

interface QuotedPostProps {
  id: string;
  messageRaw: string;
  messageCli: string;
  user: {
    username: string;
    domain: string | null;
    displayName: string;
    avatarUrl: string | null;
  };
  /** Client demo card — avoid navigating to non-existent post IDs */
  demo?: boolean;
}

export default function QuotedPost({ id, messageRaw, messageCli, user, demo = false }: QuotedPostProps) {
  const inner = (
    <>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)]">
        <span className="font-mono text-[10px] text-[var(--accent-amber)]">@{user.username}</span>
        <span className="font-mono text-[9px] text-[var(--text-faint)]">quoted</span>
      </div>
      <div className="px-3 py-2">
        <div className="font-mono text-[11px] text-[var(--text-muted)] line-clamp-2">{messageRaw}</div>
        <div className="font-mono text-[10px] text-[var(--accent-green)]/60 mt-1 truncate">{messageCli}</div>
      </div>
    </>
  );

  if (demo) {
    return (
      <div
        className="block mx-5 mb-3 border border-[var(--border)] opacity-90 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={`/post/${id}`}
      onClick={(e) => e.stopPropagation()}
      className="block mx-5 mb-3 border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors"
    >
      {inner}
    </Link>
  );
}
