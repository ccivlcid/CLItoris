import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client.js';
import type { ApiResponse } from '@clitoris/shared';

interface ReviewPR {
  id: number;
  number: number;
  title: string;
  url: string;
  author: string;
  authorAvatar: string;
  repoFullName: string;
  labels: Array<{ name: string; color: string }>;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function GithubTab({ onToast: _onToast }: { onToast: (msg: string) => void }) {
  const [reviews, setReviews] = useState<ReviewPR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await api.get<ApiResponse<ReviewPR[]> & { meta?: { total?: number } }>('/github/reviews');
      setReviews(res.data);
      setTotal(res.meta?.total ?? res.data.length);
    } catch {
      setError('PR 리뷰 목록을 불러오지 못했습니다. 토큰 또는 repo scope를 확인하세요.');
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border border-[#1c1c30] bg-[#0a0a14] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#c9d1d9] font-mono text-[13px]">$ gh pr list --review-requested=@me</p>
            <p className="text-[#525270] font-mono text-[11px] mt-0.5">내가 리뷰 요청받은 PR</p>
          </div>
          {!isLoading && !error && (
            <span className="font-mono text-[11px] text-[#7a8898] border border-[#1c1c30] px-2 py-0.5">
              {total} open
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-400/20 bg-red-400/5 px-5 py-4 font-mono text-[12px] text-red-400/80 flex items-center justify-between">
          {error}
          <button onClick={() => void load()} className="underline hover:text-red-300 transition-colors ml-3">retry</button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-1">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="border border-[#1c1c30] h-14 animate-pulse bg-[#0a0a14]" />
          ))}
        </div>
      )}

      {/* PR list */}
      {!isLoading && !error && reviews.length > 0 && (
        <div className="space-y-0">
          {reviews.map((pr) => (
            <a
              key={pr.id}
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 border-b border-[#0f0f1e] px-4 py-3 hover:bg-[#0d0d1e] transition-colors group"
            >
              <img src={pr.authorAvatar} alt={pr.author} className="w-6 h-6 rounded-sm shrink-0 mt-0.5 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#525270] font-mono text-[10px]">{pr.repoFullName}</span>
                  <span className="text-[#525270] font-mono text-[10px]">#{pr.number}</span>
                  {pr.isDraft && (
                    <span className="font-mono text-[9px] px-1 border border-[#525270]/40 text-[#525270]">draft</span>
                  )}
                </div>
                <p className="text-[#c9d1d9] font-mono text-[12px] mt-0.5 group-hover:text-white transition-colors truncate">
                  {pr.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[#7a8898] font-mono text-[10px]">by {pr.author}</span>
                  <span className="text-[#525270] font-mono text-[10px]">updated {timeAgo(pr.updatedAt)} ago</span>
                  {pr.labels.map((l) => (
                    <span
                      key={l.name}
                      className="font-mono text-[9px] px-1 border"
                      style={{ borderColor: `#${l.color}40`, color: `#${l.color}` }}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[#525270] font-mono text-[11px] shrink-0 group-hover:text-[#9aacbf] transition-colors mt-0.5">
                →
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && reviews.length === 0 && (
        <div className="border border-[#1c1c30] px-5 py-8 text-center space-y-2">
          <p className="text-[#9aacbf] font-mono text-[13px]">$ reviews --pending</p>
          <p className="text-[#3dd68c] font-mono text-[12px]">&gt; 0 reviews pending.</p>
          <p className="text-[#525270] font-mono text-[11px]">리뷰 요청받은 PR이 없습니다.</p>
        </div>
      )}

      {/* Webhook info */}
      <div className="border border-[#1c1c30] bg-[#0a0a14] px-5 py-4 space-y-2">
        <p className="text-[#525270] font-mono text-[10px]">// webhook auto-post</p>
        <p className="text-[#9aacbf] font-mono text-[12px]">GitHub repo에 webhook을 등록하면 push/PR/release 이벤트가 자동으로 CLItoris 포스트가 됩니다.</p>
        <div className="bg-[#06060e] border border-[#1c1c30] px-3 py-2 font-mono text-[11px] text-[#3dd68c] space-y-1">
          <p>Payload URL: <span className="text-[#9aacbf]">{window.location.origin.replace('7878', '3771')}/api/webhook/github</span></p>
          <p>Content type: <span className="text-[#9aacbf]">application/json</span></p>
          <p>Secret: <span className="text-[#9aacbf]">GITHUB_WEBHOOK_SECRET (서버 .env)</span></p>
        </div>
      </div>
    </div>
  );
}
