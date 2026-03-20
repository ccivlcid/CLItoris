import { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePostStore } from '../stores/postStore.js';
import { useFeedStore } from '../stores/feedStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { api } from '../api/client.js';
import type { ApiResponse } from '@clitoris/shared';
import PostEditor, { type PostEditorHandle } from '../components/composer/PostEditor.js';

const LANGS = ['auto', 'en', 'ko', 'zh', 'ja'] as const;
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime';

interface LlmProviderRow { provider: string; source: string }
interface LlmEntry { id: string; model: string }

interface QuickProvider { id: string; label: string; placeholder: string; noKey?: boolean }

const QUICK_PROVIDERS: QuickProvider[] = [
  { id: 'anthropic',   label: 'Anthropic',   placeholder: 'sk-ant-...' },
  { id: 'openai',      label: 'OpenAI',      placeholder: 'sk-...' },
  { id: 'gemini',      label: 'Google AI',   placeholder: 'AIza...' },
  { id: 'ollama',      label: 'Ollama',      placeholder: 'ollama', noKey: true },
  { id: 'openrouter',  label: 'OpenRouter',  placeholder: 'sk-or-...' },
  { id: 'together',    label: 'Together',    placeholder: 'api key...' },
  { id: 'groq',        label: 'Groq',        placeholder: 'gsk_...' },
  { id: 'cerebras',    label: 'Cerebras',    placeholder: 'csk-...' },
];

function shortModel(model: string): string {
  return model
    .replace(/^claude-/, '')
    .replace(/-\d{8,}$/, '')
    .replace(/^gpt-/, '')
    .slice(0, 20);
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    draft, cliPreview, selectedLang, selectedModel,
    isTransforming, isSubmitting, isUploading, transformError,
    attachedRepo, attachedMedia,
    setDraft, setLang, removeRepo, attachRepo,
    uploadMedia, removeMedia, submitPost, selectModel,
  } = usePostStore();
  const { prependPost } = useFeedStore();
  const { t } = useUiStore();
  const editorRef = useRef<PostEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [repoInput, setRepoInput] = useState('');
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [posted, setPosted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [llmEntries, setLlmEntries] = useState<LlmEntry[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [keyProvider, setKeyProvider] = useState(QUICK_PROVIDERS[0]!);
  const [keyValue, setKeyValue] = useState('');
  const [keySaving, setKeySaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Load available LLM models
  const loadModels = () => {
    api.get<ApiResponse<LlmProviderRow[]>>('/llm/providers').then(async (res) => {
      const apiKeys = res.data.filter((p) => p.source === 'user-settings');
      const entries: LlmEntry[] = [];
      await Promise.all(
        apiKeys.map(async ({ provider }) => {
          try {
            const m = await api.get<ApiResponse<string[]>>(`/llm/models/${provider}`);
            const first = m.data[0];
            if (first) entries.push({ id: provider, model: first });
          } catch { /* */ }
        }),
      );
      setLlmEntries(entries);
      if (entries.length > 0 && !selectedModel) {
        selectModel(entries[0]!.model);
      }
    }).catch(() => { /* silent */ });
  };

  useEffect(() => {
    if (isAuthenticated) loadModels();
  }, [isAuthenticated]);

  const handleKeySave = async () => {
    if (!keyValue.trim() && !keyProvider.noKey) return;
    if (keySaving) return;
    setKeySaving(true);
    try {
      await api.post('/llm/keys', {
        provider: keyProvider.id,
        apiKey: keyValue.trim() || 'local',
        label: keyProvider.label,
      });
      setKeyValue('');
      setShowKeySetup(false);
      loadModels();
    } catch { /* silent */ } finally {
      setKeySaving(false);
    }
  };

  useEffect(() => {
    setTimeout(() => editorRef.current?.focus(), 100);
  }, []);

  const isBusy = isTransforming || isSubmitting || isUploading;
  const noModel = !selectedModel;
  const canSubmit = draft.trim().length > 0 && !isBusy && !noModel;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const post = await submitPost();
    if (post) {
      prependPost(post);
      setPosted(true);
      setTimeout(() => navigate('/'), 600);
    }
  };

  const handleRepoAttach = () => {
    const match = repoInput.trim().match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (!match?.[1] || !match?.[2]) return;
    attachRepo(match[1], match[2]);
    setRepoInput('');
    setShowRepoInput(false);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadMedia(Array.from(files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.activeElement?.tagName !== 'INPUT') navigate(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === 'file' && (item.type.startsWith('image/') || item.type.startsWith('video/'))) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) { e.preventDefault(); uploadMedia(files); }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [uploadMedia]);

  const apiBase = import.meta.env.VITE_API_URL ?? '/api';
  const mediaUrl = (url: string) => `${apiBase.replace(/\/api$/, '')}${url}`;

  if (posted) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="text-center font-mono">
          <div className="text-[var(--accent-green)] text-lg mb-2">$ post --commit</div>
          <div className="text-[var(--text-muted)] text-sm">published successfully.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex flex-col">
      {/* Header */}
      <header className="h-11 sm:h-12 bg-[var(--bg-surface)] border-b border-[var(--border)]/60 flex items-center justify-between px-3 sm:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="font-mono text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors px-2 py-1"
          >
            ←
          </button>
          <span className="font-mono text-[12px] text-[var(--text-faint)]">
            <span className="text-[var(--accent-green)]">$</span> post --new
          </span>
        </div>

        {/* Submit — always visible in header on mobile */}
        <button
          data-testid="composer-submit"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className={`font-mono text-[12px] px-4 py-1.5 transition-all ${
            canSubmit
              ? 'text-[var(--bg-surface)] bg-[var(--accent-green)] active:bg-[var(--accent-green)]/80'
              : 'text-[var(--text-faint)] bg-[var(--bg-elevated)] border border-[var(--border)]'
          }`}
        >
          {isSubmitting ? '...' : t('composer.button.submit')}
        </button>
      </header>

      <main className="flex-1 flex justify-center px-0 sm:px-4 py-0 sm:py-8">
        <div className="w-full max-w-[720px] flex flex-col">

          {/* ── Model selector — prominent on mobile ── */}
          <div className="bg-[var(--bg-surface)] sm:border sm:border-[var(--border)] border-b border-[var(--border)]/40">
            {llmEntries.length > 0 ? (
              <div className="relative">
                <button
                  onClick={() => setShowModelPicker((v) => !v)}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-2.5 font-mono text-[12px] transition-colors"
                >
                  <span className="text-[var(--text-faint)]">
                    <span className="text-[var(--accent-green)]">$</span> export LLM=
                  </span>
                  <span className={selectedModel ? 'text-[var(--accent-green)]' : 'text-[var(--accent-amber)] animate-pulse'}>
                    {selectedModel ? shortModel(selectedModel) : 'select model ▾'}
                  </span>
                </button>

                {showModelPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
                    <div className="absolute left-0 right-0 top-full z-50 bg-[var(--bg-surface)] border border-[var(--border)] shadow-xl shadow-black/60">
                      {llmEntries.map(({ id, model }) => (
                        <button
                          key={id}
                          onClick={() => { selectModel(model); setShowModelPicker(false); }}
                          className={`w-full text-left px-4 sm:px-5 py-3 sm:py-2 font-mono text-[12px] transition-colors flex items-center justify-between ${
                            selectedModel === model
                              ? 'text-[var(--accent-green)] bg-[var(--accent-green)]/[0.05]'
                              : 'text-[var(--text-muted)] hover:bg-white/[0.03] active:bg-white/[0.04]'
                          }`}
                        >
                          <span>{id}</span>
                          <span className="text-[var(--text-faint)] text-[10px]">{shortModel(model)}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* No API key — setup prompt */
              <div className="px-4 sm:px-5 py-3">
                {!showKeySetup ? (
                  <button
                    onClick={() => setShowKeySetup(true)}
                    className="w-full flex items-center justify-between font-mono text-[12px]"
                  >
                    <span className="text-[var(--text-faint)]">
                      <span className="text-[var(--accent-amber)]">!</span> {t('composer.noModel')}
                    </span>
                    <span className="text-[var(--accent-amber)]">
                      {t('composer.addKey')} →
                    </span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[var(--text-faint)]">
                        <span className="text-[var(--accent-amber)]">$</span> export LLM_KEY=
                      </span>
                      <button
                        onClick={() => setShowKeySetup(false)}
                        className="font-mono text-[10px] text-[var(--text-faint)]"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_PROVIDERS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setKeyProvider(p)}
                          className={`font-mono text-[11px] px-2 py-1.5 sm:py-1 border transition-colors ${
                            keyProvider.id === p.id
                              ? 'text-[var(--accent-green)] border-[var(--accent-green)]/30 bg-[var(--accent-green)]/5'
                              : 'text-[var(--text-muted)] border-[var(--border)]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={keyValue}
                        onChange={(e) => setKeyValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleKeySave(); }}
                        placeholder={keyProvider.placeholder}
                        className="flex-1 bg-[var(--bg-void)] border border-[var(--border)] text-[var(--text)] font-mono text-[12px] px-3 py-2.5 sm:py-2 outline-none focus:border-[var(--accent-green)]/30 placeholder:text-[var(--text-faint)]/40 transition-colors"
                        autoFocus
                      />
                      <button
                        onClick={handleKeySave}
                        disabled={(!keyValue.trim() && !keyProvider.noKey) || keySaving}
                        className={`shrink-0 font-mono text-[12px] px-4 py-2.5 sm:py-2 transition-all ${
                          (!keyValue.trim() && !keyProvider.noKey) || keySaving
                            ? 'text-[var(--text-faint)] bg-[var(--bg-elevated)]'
                            : 'text-[var(--bg-surface)] bg-[var(--accent-green)]'
                        }`}
                      >
                        {keySaving ? '...' : 'save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Writing area ── */}
          <div
            className={`bg-[var(--bg-surface)] sm:border sm:border-t-0 sm:border-[var(--border)] flex flex-col flex-1 transition-colors ${
              dragOver ? 'bg-[var(--accent-green)]/[0.02]' : ''
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {/* Editor header */}
            <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--border)]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {user && (
                  <Link to={`/@${user.username}`} className="font-mono text-[12px] text-[var(--accent-amber)]">
                    @{user.username}
                  </Link>
                )}
              </div>
              <select
                value={selectedLang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-[var(--bg-void)] border border-[var(--border)] text-[var(--text-muted)] text-[11px] px-2 py-1 font-mono outline-none cursor-pointer"
              >
                {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Editor */}
            <div className="px-4 sm:px-5 py-4 flex-1" data-testid="composer-input">
              <PostEditor
                ref={editorRef}
                value={draft}
                onChange={setDraft}
                placeholder={t('composer.placeholder')}
                disabled={isBusy}
                onSubmit={() => void handleSubmit()}
              />
            </div>

            {/* Media preview */}
            {attachedMedia.length > 0 && (
              <div className={`mx-4 sm:mx-5 mb-4 grid gap-2 ${attachedMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {attachedMedia.map((media) => (
                  <div key={media.id} className="relative group border border-[var(--border)] bg-[var(--bg-void)] overflow-hidden">
                    {media.mimeType.startsWith('video/') ? (
                      <video src={mediaUrl(media.url)} className="w-full h-32 object-cover" muted playsInline />
                    ) : (
                      <img src={mediaUrl(media.url)} alt="" className="w-full h-32 object-cover" />
                    )}
                    <button
                      onClick={() => removeMedia(media.id)}
                      className="absolute top-1 right-1 bg-black/70 text-white font-mono text-[10px] w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isUploading && (
              <div className="mx-4 sm:mx-5 mb-4 font-mono text-[11px] text-[var(--text-faint)] animate-pulse">
                uploading...
              </div>
            )}

            {/* Repo attachment */}
            {attachedRepo && (
              <div className="mx-4 sm:mx-5 mb-4 flex items-center gap-2 bg-[var(--bg-void)] border border-[var(--border)] px-3 py-2 font-mono text-[11px]">
                <span className="text-[var(--accent-blue)]">{attachedRepo.owner}/{attachedRepo.name}</span>
                <button onClick={removeRepo} className="text-[var(--text-faint)] hover:text-[var(--color-error)] ml-auto">×</button>
              </div>
            )}

            {showRepoInput && (
              <div className="px-4 sm:px-5 pb-4 flex items-center gap-2">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRepoAttach();
                    if (e.key === 'Escape') { setShowRepoInput(false); setRepoInput(''); }
                  }}
                  placeholder="owner/repo"
                  className="flex-1 bg-[var(--bg-void)] border border-[var(--border)] text-[var(--text)] font-mono text-[11px] px-3 py-2 outline-none focus:border-[var(--accent-blue)]/30 placeholder:text-[var(--text-faint)]"
                  autoFocus
                />
                <button onClick={handleRepoAttach} disabled={!repoInput.match(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/)} className="text-[var(--accent-blue)] font-mono text-[11px] disabled:opacity-40">
                  ↵
                </button>
                <button onClick={() => { setShowRepoInput(false); setRepoInput(''); }} className="text-[var(--text-faint)] font-mono text-[11px]">
                  ×
                </button>
              </div>
            )}

            {transformError && (
              <p className="mx-4 sm:mx-5 mb-4 px-3 py-2 bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)] font-mono text-[11px]">
                {transformError}
              </p>
            )}

            {/* Toolbar — tools row */}
            <div className="border-t border-[var(--border)]/30 px-4 sm:px-5 py-2.5 flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={attachedMedia.length >= 4 || isUploading}
                className="font-mono text-[11px] px-2.5 py-1.5 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-40 transition-colors"
              >
                media
              </button>
              <input ref={fileInputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />

              {!attachedRepo && (
                <button
                  onClick={() => setShowRepoInput((v) => !v)}
                  className={`font-mono text-[11px] px-2.5 py-1.5 border transition-colors ${
                    showRepoInput
                      ? 'text-[var(--accent-blue)] border-[var(--accent-blue)]/30'
                      : 'text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
                  }`}
                >
                  repo
                </button>
              )}
            </div>
          </div>

          {/* CLI Preview */}
          {cliPreview && (
            <div className="bg-[var(--bg-cli)] sm:border sm:border-t-0 sm:border-[var(--border)] px-4 sm:px-5 py-4">
              <pre className="text-[var(--accent-green)] font-mono text-[13px] leading-[1.7] whitespace-pre-wrap">
                <span className="text-[var(--text-faint)]">$ </span>{cliPreview}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
