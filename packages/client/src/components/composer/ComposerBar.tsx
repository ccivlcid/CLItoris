import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostStore } from '../../stores/postStore.js';
import { useFeedStore } from '../../stores/feedStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';
const LANGS = ['auto', 'en', 'ko', 'zh', 'ja'];

export default function ComposerBar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [repoInput, setRepoInput] = useState('');
  const [showRepoInput, setShowRepoInput] = useState(false);
  const {
    draft,
    cliPreview,
    selectedLang,
    selectedCliTool,
    selectedModel,
    isTransforming,
    isSubmitting,
    transformError,
    attachedRepo,
    setDraft,
    setLang,
    removeRepo,
    attachRepo,
    transformToCli,
    submitPost,
  } = usePostStore();
  const { prependPost } = useFeedStore();
  const { t } = useUiStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose focus via "/" hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      textareaRef.current?.blur();
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const post = await submitPost();
    if (post) {
      prependPost(post);
    }
  };

  const handleTransform = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await transformToCli();
  };

  const handleRepoAttach = () => {
    const trimmed = repoInput.trim();
    const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    const owner = match?.[1];
    const name = match?.[2];
    if (!owner || !name) return;
    attachRepo(owner, name);
    setRepoInput('');
    setShowRepoInput(false);
  };

  const isBusy = isTransforming || isSubmitting;

  return (
    <div className="bg-[#0e0e1c] border-b border-[#15152a]">
      {/* Textarea */}
      <div className="px-5 pt-4 pb-2">
        <textarea
          ref={textareaRef}
          data-testid="composer-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('composer.placeholder')}
          rows={3}
          disabled={isBusy}
          aria-label="Write a new post"
          className="w-full bg-transparent text-[#c9d1d9] text-[14px] leading-relaxed resize-none outline-none placeholder:text-[#1e1e2e] disabled:opacity-40"
          style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
        />
      </div>

      {/* Repo attachment preview */}
      {attachedRepo && (
        <div
          data-testid="repo-attach-preview"
          className="mx-5 mb-2 flex items-center gap-2 bg-[#0a0a14] border border-[#15152a] px-3 py-1.5 font-mono text-[11px]"
        >
          <span className="text-[#60a5fa]">📎 {attachedRepo.owner}/{attachedRepo.name}</span>
          <button
            data-testid="repo-remove-button"
            onClick={removeRepo}
            className="text-[#525270] hover:text-red-400 ml-auto transition-colors"
            aria-label="Remove attached repository"
          >
            {t('composer.repo.remove')}
          </button>
        </div>
      )}

      {/* CLI preview */}
      {cliPreview && (
        <div className="mx-5 mb-2 bg-[#06060e] border border-[#15152a] px-4 py-3">
          <span className="text-[#1e1e2e] text-[10px] font-mono block mb-1">$</span>
          <pre className="text-[#3dd68c] font-mono text-[12px] whitespace-pre-wrap">{cliPreview}</pre>
        </div>
      )}

      {/* Transform error */}
      {transformError && (
        <p className="mx-5 mb-2 text-red-400/60 font-mono text-[11px]">{transformError}</p>
      )}

      {/* Repo input */}
      {showRepoInput && (
        <div className="px-5 pb-2 flex items-center gap-2">
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRepoAttach();
              if (e.key === 'Escape') { setShowRepoInput(false); setRepoInput(''); }
            }}
            placeholder="owner/repo"
            className="flex-1 bg-[#0a0a14] border border-[#15152a] text-[#c9d1d9] font-mono text-[11px] px-3 py-1.5 outline-none focus:border-[#60a5fa]/30 placeholder:text-[#1e1e2e] transition-colors"
            autoFocus
          />
          <button
            onClick={handleRepoAttach}
            disabled={!repoInput.match(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/)}
            className="text-[#60a5fa] font-mono text-[11px] hover:text-[#93c5fd] disabled:opacity-30 transition-colors"
          >
            attach
          </button>
          <button
            onClick={() => { setShowRepoInput(false); setRepoInput(''); }}
            className="text-[#525270] hover:text-[#8b8baa] font-mono text-[11px] transition-colors"
          >
            cancel
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="border-t border-[#0f0f1e] px-5 py-2.5 flex items-center gap-3">
        <span className="text-[#7a8898] font-mono text-[10px] hidden sm:block">
          {t('composer.hint')}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          {(selectedCliTool || selectedModel) && (
            <span className="text-[#9aacbf] font-mono text-[10px] border border-[#252540] px-2 py-0.5">
              {selectedCliTool ?? selectedModel}
            </span>
          )}

          <select
            value={selectedLang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-[#0a0a14] border border-[#252540] text-[#9aacbf] text-[11px] px-2 py-1 font-mono outline-none hover:border-[#3a3a5a] transition-colors cursor-pointer"
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {!attachedRepo && (
            <button
              onClick={() => setShowRepoInput((v) => !v)}
              className={`font-mono text-[11px] px-2 py-1 border transition-colors ${
                showRepoInput
                  ? 'text-[#60a5fa] border-[#60a5fa]/30 bg-[#60a5fa]/5'
                  : 'text-[#7a8898] border-[#252540] hover:text-[#9aacbf]'
              }`}
              title="Attach GitHub repo"
            >
              {t('composer.repo.attach')}
            </button>
          )}

          <button
            onClick={() => void handleTransform()}
            disabled={!draft.trim() || isBusy}
            className="border border-[#252540] text-[#9aacbf] hover:text-[#c9d1d9] hover:border-[#3a3a5a] px-3 py-1.5 font-mono text-[11px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isTransforming ? t('composer.button.transforming') : t('composer.button.transform')}
          </button>

          <button
            data-testid="composer-submit"
            onClick={() => void handleSubmit()}
            disabled={!draft.trim() || isBusy}
            className="bg-[#3dd68c]/10 text-[#3dd68c] border border-[#3dd68c]/20 px-4 py-1.5 font-mono text-[12px] hover:bg-[#3dd68c]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? t('composer.button.submitting') : t('composer.button.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
