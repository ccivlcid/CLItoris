import { useState } from 'react';
import CliHighlighter from './CliHighlighter.js';
import { useUiStore } from '../../stores/uiStore.js';
import { api } from '../../api/client.js';
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

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(messageCli);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
    } catch { /* silently fail */ }
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
            className="text-[#60a5fa] hover:text-[#93c5fd] transition-colors"
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
            className="text-[#f59e0b] hover:text-amber-300 transition-colors"
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
                className="text-[#60a5fa]/60 hover:text-[#60a5fa] text-[12px] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </a>
            ))}
          </div>
        )}

        {translatedText !== null && (
          <div className="mt-3 pl-3 border-l border-[#c084fc]/20">
            <span className="text-[#c084fc]/40 text-[10px] font-mono block mb-1">
              {t('post.translated.from', { lang: postLang })}
            </span>
            <p className="text-[#7d8590] text-[13px] italic">{translatedText}</p>
          </div>
        )}

        {showTranslate && (
          <button
            data-testid="translate-button"
            onClick={handleTranslate}
            className="mt-3 text-[#7a8898] hover:text-[#c084fc] text-[11px] font-mono transition-colors"
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
        className="bg-[#06060e] px-5 py-3 border-t border-[#13132a] sm:border-t-0 sm:border-l sm:border-l-[#13132a]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#525270] text-[10px] font-mono">$</span>
          <button
            data-testid="copy-cli-button"
            onClick={handleCopy}
            className="text-[#7a8898] hover:text-[#3dd68c] text-[10px] font-mono transition-colors"
            aria-label="Copy CLI command"
          >
            {copied ? <span className="text-[#3dd68c]">{t('post.copied')}</span> : 'copy'}
          </button>
        </div>
        <CliHighlighter code={messageCli} />
      </div>
    </div>
  );
}
