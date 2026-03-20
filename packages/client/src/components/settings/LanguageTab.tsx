import { useUiStore, type UiLang } from '../../stores/uiStore.js';

const UI_LANGS: { value: UiLang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
];

const POST_LANGS = ['auto', 'en', 'ko', 'zh', 'ja'] as const;

export default function LanguageTab() {
  const { lang, setLang } = useUiStore();

  return (
    <div className="space-y-4">
      <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-6 space-y-6">
        <p className="text-[var(--text-faint)] text-xs font-mono">// language</p>

        {/* UI Language */}
        <div className="space-y-3">
          <p className="text-[var(--text-muted)] font-mono text-xs">$ set --ui-lang=</p>
          <div className="space-y-2 pl-4">
            {UI_LANGS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLang(value)}
                className={`flex items-center gap-3 w-full text-left font-mono text-sm transition-colors ${
                  lang === value ? 'text-[var(--accent-green)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <span>{lang === value ? '●' : '○'}</span>
                <span className="text-[var(--text-faint)]">{value}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Default post language */}
        <div className="space-y-3">
          <p className="text-[var(--text-muted)] font-mono text-xs">$ set --default-post-lang=</p>
          <div className="space-y-2 pl-4">
            {POST_LANGS.map((l) => (
              <button
                key={l}
                className="flex items-center gap-3 w-full text-left font-mono text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <span>{l === 'auto' ? '●' : '○'}</span>
                <span className="text-[var(--text-faint)]">{l}</span>
                {l === 'auto' && <span className="text-[var(--text-faint)] text-xs">— detect from input</span>}
              </button>
            ))}
          </div>
          <p className="text-[var(--text-faint)] font-mono text-xs pl-4">// default post lang is always auto (client-side)</p>
        </div>
      </div>
    </div>
  );
}
