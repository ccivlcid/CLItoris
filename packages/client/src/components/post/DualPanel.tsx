import { useState, useRef, useEffect } from 'react';
import CliHighlighter from './CliHighlighter.js';
import { useUiStore } from '../../stores/uiStore.js';
import { api } from '../../api/client.js';
import { toastError } from '../../stores/toastStore.js';
import type { ApiResponse, TranslateResponse } from '@clitoris/shared';

interface DualPanelProps {
  postId: string;
  messageRaw: string;
  messageCli: string;
  tags: string[];
  postLang: string;
  showTranslate: boolean;
  uiLang: string;
}

export default function DualPanel({
  postId,
  messageRaw,
  messageCli,
  tags,
  postLang,
  showTranslate,
  uiLang,
}: DualPanelProps) {
  const { t } = useUiStore();
  const [copied, setCopied] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(messageCli);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      toastError('Failed to copy to clipboard');
    }
  };

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (translatedText !== null) {
      setTranslatedText(null);
      return;
    }
    setIsTranslating(true);
    try {
      const res = await api.post<ApiResponse<TranslateResponse>>(
        `/posts/${postId}/translate`,
        { targetLang: uiLang },
      );
      setTranslatedText(res.data.translatedText);
    } catch {
      toastError('Translation failed');
    }
    finally { setIsTranslating(false); }
  };

  const renderNatural = () => {
    const words = messageRaw.split(/(\s+|#\w+|@\w+)/);
    return words.map((word, i) => {
      if (word.startsWith('#')) {
        return (
          <a
            key={i}
            href={`/explore?tag=${word.slice(1)}`}
            data-testid="post-hashtag"
            className="text-[var(--accent-cyan)] hover:text-cyan-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {word}
          </a>
        );
      }
      if (word.startsWith('@')) {
        return (
          <a
            key={i}
            href={`/@${word.slice(1)}`}
            data-testid="post-username"
            className="text-[var(--accent-amber)] hover:text-amber-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {word}
          </a>
        );
      }
      return <span key={i}>{word}</span>;
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      {/* Natural language — warm, human */}
      <div
        data-testid="natural-panel"
        className="px-5 py-3 text-[#a0a8b8] text-[14px] leading-relaxed"
        style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
      >
        <p>{renderNatural()}</p>

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <a
                key={tag}
                href={`/explore?tag=${tag}`}
                className="text-[var(--accent-cyan)]/60 hover:text-[var(--accent-cyan)] text-[12px] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </a>
            ))}
          </div>
        )}

        {translatedText !== null && (
          <div className="mt-3 pl-3 border-l border-[var(--accent-purple)]/20">
            <span className="text-[var(--accent-purple)]/40 text-[10px] font-mono block mb-1">
              {t('post.translated.from', { lang: postLang })}
            </span>
            <p className="text-[var(--text-muted)] text-[13px] italic">{translatedText}</p>
          </div>
        )}

        {showTranslate && (
          <button
            data-testid="translate-button"
            onClick={handleTranslate}
            className="mt-3 text-[var(--text-muted)] hover:text-[var(--accent-purple)] text-[11px] font-mono transition-colors"
          >
            {isTranslating
              ? t('post.translating')
              : translatedText !== null
              ? '--hide'
              : t('post.translate', { lang: uiLang })}
          </button>
        )}
      </div>

      {/* CLI — cold, precise, terminal void */}
      <div
        data-testid="cli-panel"
        className="bg-[var(--bg-cli)] px-5 py-3 border-t border-[var(--border)] sm:border-t-0 sm:border-l sm:border-l-[var(--border)]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--text-faint)] text-[10px] font-mono">$</span>
          <button
            data-testid="copy-cli-button"
            onClick={handleCopy}
            className="text-[var(--text-muted)] hover:text-[var(--accent-green)] text-[10px] font-mono transition-colors"
            aria-label="Copy CLI command"
          >
            {copied ? <span className="text-[var(--accent-green)]">{t('post.copied')}</span> : 'copy'}
          </button>
        </div>
        <CliHighlighter code={messageCli} />
      </div>
    </div>
  );
}
