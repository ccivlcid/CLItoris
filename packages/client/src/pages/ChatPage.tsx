import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.js';
import { useAuthStore } from '../stores/authStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { useChatStore, type ChatMessage } from '../stores/chatStore.js';

// ── Presets for quick agent setup ──────────────────────────

const PRESETS = [
  { name: 'OpenClaw',    endpoint: 'https://api.openclaw.com/v1', protocol: 'openai' as const, icon: '🐾' },
  { name: 'Dify',        endpoint: 'https://api.dify.ai/v1',     protocol: 'openai' as const, icon: '◈' },
  { name: 'Coze',        endpoint: 'https://api.coze.com/v1',    protocol: 'openai' as const, icon: '⬡' },
  { name: 'OpenAI',      endpoint: 'https://api.openai.com/v1',  protocol: 'openai' as const, icon: '◉' },
  { name: 'Anthropic',   endpoint: 'https://api.anthropic.com',  protocol: 'anthropic' as const, icon: '◬' },
  { name: 'Ollama',      endpoint: 'http://localhost:11434/v1',   protocol: 'openai' as const, icon: '🦙' },
  { name: 'Custom',      endpoint: '',                            protocol: 'custom' as const, icon: '⊞' },
];

// ── Message Bubble ─────────────────────────────────────────

function Bubble({ msg, isLast, isStreaming }: { msg: ChatMessage; isLast: boolean; isStreaming: boolean }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] sm:max-w-[70%] ${
        isUser
          ? 'bg-[var(--accent-green)]/[0.06] border border-[var(--accent-green)]/12'
          : 'bg-[var(--bg-surface)] border border-[var(--border)]/40'
      }`}>
        <div
          className="px-3 py-2.5 text-[14px] text-[var(--text)] leading-[1.7] whitespace-pre-wrap break-words"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {msg.content}
          {isLast && isStreaming && msg.role === 'assistant' && (
            msg.content ? <span className="text-[var(--accent-green)] animate-blink">▌</span>
                        : <span className="text-[var(--text-faint)] animate-pulse">...</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add Agent Form ─────────────────────────────────────────

function AddAgentForm({ onDone }: { onDone: () => void }) {
  const { addAgent } = useChatStore();
  const { t } = useUiStore();
  const [preset, setPreset] = useState(PRESETS[0]!);
  const [name, setName] = useState(preset.name);
  const [endpoint, setEndpoint] = useState(preset.endpoint);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePreset = (p: typeof PRESETS[0]) => {
    setPreset(p);
    setName(p.name === 'Custom' ? '' : p.name);
    setEndpoint(p.endpoint);
  };

  const handleSave = async () => {
    if (!name.trim() || !endpoint.trim()) return;
    setSaving(true);
    const result = await addAgent({
      name: name.trim(),
      endpointUrl: endpoint.trim(),
      protocol: preset.protocol,
      apiKey: apiKey.trim() || null,
      model: model.trim() || null,
      systemPrompt: null,
      icon: preset.icon,
    });
    setSaving(false);
    if (result) onDone();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-[var(--text-faint)]">
          <span className="text-[var(--accent-green)]">$</span> agent --connect
        </span>
        <button onClick={onDone} className="font-mono text-[11px] text-[var(--text-faint)]">×</button>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => handlePreset(p)}
            className={`font-mono text-[11px] px-2.5 py-1.5 border transition-colors ${
              preset.name === p.name
                ? 'text-[var(--accent-green)] border-[var(--accent-green)]/30 bg-[var(--accent-green)]/[0.06]'
                : 'text-[var(--text-muted)] border-[var(--border)]'
            }`}
          >
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('chat.agentName')}
          className="w-full bg-[var(--bg-void)] border border-[var(--border)] text-[var(--text)] font-mono text-[12px] px-3 py-2.5 sm:py-2 outline-none focus:border-[var(--accent-green)]/30 placeholder:text-[var(--text-faint)]/40"
        />
        <input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder={t('chat.agentEndpoint')}
          className="w-full bg-[var(--bg-void)] border border-[var(--border)] text-[var(--text)] font-mono text-[12px] px-3 py-2.5 sm:py-2 outline-none focus:border-[var(--accent-green)]/30 placeholder:text-[var(--text-faint)]/40"
        />
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={t('chat.agentApiKey')}
          className="w-full bg-[var(--bg-void)] border border-[var(--border)] text-[var(--text)] font-mono text-[12px] px-3 py-2.5 sm:py-2 outline-none focus:border-[var(--accent-green)]/30 placeholder:text-[var(--text-faint)]/40"
        />
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={t('chat.agentModel')}
          className="w-full bg-[var(--bg-void)] border border-[var(--border)] text-[var(--text)] font-mono text-[12px] px-3 py-2.5 sm:py-2 outline-none focus:border-[var(--accent-green)]/30 placeholder:text-[var(--text-faint)]/40"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim() || !endpoint.trim() || saving}
        className={`w-full font-mono text-[12px] py-2.5 transition-all ${
          name.trim() && endpoint.trim() && !saving
            ? 'text-[var(--bg-surface)] bg-[var(--accent-green)] active:bg-[var(--accent-green)]/80'
            : 'text-[var(--text-faint)] bg-[var(--bg-elevated)]'
        }`}
      >
        {saving ? '...' : t('chat.connect')}
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function ChatPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { t } = useUiStore();
  const {
    agents, activeAgentId, messages, isStreaming, error, agentsLoading,
    fetchAgents, setActiveAgent, sendMessage, clearChat, stopStreaming, removeAgent,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showAgentList, setShowAgentList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeAgent = agents.find(a => a.id === activeAgentId);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login?redirect=/chat', { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => { if (isAuthenticated) fetchAgents(); }, [isAuthenticated]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming || !activeAgentId) return;
    setInput('');
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  if (authLoading) return <AppShell><div /></AppShell>;

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100dvh-44px)] sm:h-[calc(100dvh-48px)] max-w-[760px] mx-auto w-full">

        {/* ── Header ── */}
        <div className="shrink-0 border-b border-[var(--border)]/30 px-3 sm:px-4 py-2 flex items-center justify-between bg-[var(--bg-void)]">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Agent selector */}
            {activeAgent ? (
              <button
                onClick={() => setShowAgentList(v => !v)}
                className="flex items-center gap-1.5 font-mono text-[12px] text-[var(--text)] hover:text-[var(--accent-green)] transition-colors min-w-0"
              >
                <span>{activeAgent.icon ?? '◉'}</span>
                <span className="truncate">{activeAgent.name}</span>
                <span className="text-[var(--text-faint)] text-[10px]">▾</span>
              </button>
            ) : (
              <span className="font-mono text-[12px] text-[var(--text-faint)]">
                <span className="text-[var(--accent-green)]">$</span> chat
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setShowAdd(true); setShowAgentList(false); }}
              className="font-mono text-[11px] text-[var(--accent-green)] hover:text-[var(--accent-green)]/80 transition-colors"
            >
              +
            </button>
            {messages.length > 0 && (
              <button onClick={clearChat} className="font-mono text-[11px] text-[var(--text-faint)] hover:text-[var(--color-error)] transition-colors">
                {t('chat.clear')}
              </button>
            )}
          </div>
        </div>

        {/* Agent list dropdown */}
        {showAgentList && agents.length > 0 && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowAgentList(false)} />
            <div className="relative z-50">
              <div className="absolute left-0 right-0 top-0 bg-[var(--bg-surface)] border-b border-[var(--border)] shadow-xl shadow-black/60 max-h-[300px] overflow-y-auto">
                {agents.map((a) => (
                  <div key={a.id} className="flex items-center border-b border-[var(--border)]/20 last:border-b-0">
                    <button
                      onClick={() => { setActiveAgent(a.id); setShowAgentList(false); }}
                      className={`flex-1 flex items-center gap-2 px-4 py-3 sm:py-2.5 font-mono text-[12px] text-left transition-colors ${
                        activeAgentId === a.id
                          ? 'text-[var(--accent-green)] bg-[var(--accent-green)]/[0.05]'
                          : 'text-[var(--text-muted)] hover:bg-white/[0.03]'
                      }`}
                    >
                      <span>{a.icon ?? '◉'}</span>
                      <span className="truncate">{a.name}</span>
                      <span className="text-[var(--text-faint)] text-[10px] ml-auto shrink-0">{a.protocol}</span>
                    </button>
                    <button
                      onClick={() => removeAgent(a.id)}
                      className="px-3 py-3 text-[var(--text-faint)] hover:text-[var(--color-error)] font-mono text-[10px] transition-colors shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4">

          {/* Add agent form */}
          {showAdd && (
            <div className="mb-4 bg-[var(--bg-surface)] border border-[var(--border)] p-4">
              <AddAgentForm onDone={() => setShowAdd(false)} />
            </div>
          )}

          {/* No agents */}
          {!agentsLoading && agents.length === 0 && !showAdd && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 px-4">
                <p className="font-mono text-[13px] text-[var(--text-faint)]">
                  <span className="text-[var(--accent-green)]">$</span> chat --connect
                </p>
                <p className="text-[var(--text-faint)]/50 text-[13px]" style={{ fontFamily: 'var(--font-sans)' }}>
                  {t('chat.noAgent')}
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="font-mono text-[12px] text-[var(--bg-surface)] bg-[var(--accent-green)] px-5 py-2.5 active:bg-[var(--accent-green)]/80 transition-colors"
                >
                  {t('chat.addAgent')}
                </button>
              </div>
            </div>
          )}

          {/* Empty chat */}
          {activeAgent && messages.length === 0 && !showAdd && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-[20px]">{activeAgent.icon ?? '◉'}</p>
                <p className="font-mono text-[12px] text-[var(--text-muted)]">{activeAgent.name}</p>
                <p className="text-[var(--text-faint)]/40 text-[12px]" style={{ fontFamily: 'var(--font-sans)' }}>
                  {t('chat.empty')}
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <Bubble key={msg.id} msg={msg} isLast={i === messages.length - 1} isStreaming={isStreaming} />
          ))}

          {error && (
            <div className="mb-3 px-3 py-2 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] font-mono text-[11px] text-[var(--color-error)]">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        {activeAgent && (
          <div className="shrink-0 border-t border-[var(--border)]/30 px-3 sm:px-4 py-3 bg-[var(--bg-void)]">
            <div className="flex items-end gap-2 bg-[var(--bg-surface)] border border-[var(--border)]/40 focus-within:border-[var(--accent-green)]/30 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.inputPlaceholder')}
                rows={1}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-[var(--text)] text-[14px] leading-[1.6] resize-none outline-none placeholder:text-[var(--text-faint)]/40 px-3 py-3 sm:py-2.5 disabled:opacity-40 max-h-[120px]"
                style={{ fontFamily: 'var(--font-sans)' }}
              />
              {isStreaming ? (
                <button onClick={stopStreaming} className="shrink-0 font-mono text-[12px] px-4 py-3 sm:py-2.5 text-[var(--color-error)]">■</button>
              ) : (
                <button
                  onClick={() => void handleSend()}
                  disabled={!input.trim()}
                  className={`shrink-0 font-mono text-[12px] px-4 py-3 sm:py-2.5 transition-all ${
                    input.trim() ? 'text-[var(--bg-surface)] bg-[var(--accent-green)]' : 'text-[var(--text-faint)]'
                  }`}
                >
                  ↵
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
