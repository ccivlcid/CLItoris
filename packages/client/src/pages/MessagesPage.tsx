import { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.js';
import { useMessageStore } from '../stores/messageStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useUiStore } from '../stores/uiStore.js';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function MessagesPage() {
  const { username: paramUsername } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useUiStore();
  const {
    conversations, messages, activeUsername, isLoading, isSending, draft,
    fetchInbox, fetchConversation, sendMessage, setDraft,
  } = useMessageStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchInbox();
  }, [isAuthenticated]);

  useEffect(() => {
    if (paramUsername) fetchConversation(paramUsername);
  }, [paramUsername]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input when conversation opens
  useEffect(() => {
    if (activeUsername) setTimeout(() => inputRef.current?.focus(), 100);
  }, [activeUsername]);

  const handleSend = () => {
    if (!activeUsername) return;
    sendMessage(activeUsername);
  };

  const showConversation = !!activeUsername;

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-48px)]">

        {/* ── Inbox ── */}
        <div className={`w-full sm:w-72 border-r border-[var(--border)]/20 flex flex-col sm:shrink-0 ${
          showConversation ? 'hidden sm:flex' : 'flex'
        }`}>
          {/* Inbox header */}
          <div className="px-5 py-4 border-b border-[var(--border)]/15">
            <h2 className="text-[15px] font-medium text-[var(--text)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Messages
            </h2>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && conversations.length === 0 && (
              <div className="p-5 animate-pulse space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-[var(--border)]/20 rounded" />)}
              </div>
            )}
            {!isLoading && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-5">
                <p className="text-[14px] text-[var(--text-faint)]/40 mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
                  {t('msg.noConversations')}
                </p>
                <p className="text-[12px] text-[var(--text-faint)]/25" style={{ fontFamily: 'var(--font-sans)' }}>
                  visit a profile to send a message
                </p>
              </div>
            )}
            {conversations.map((conv) => {
              const isActive = activeUsername === conv.otherUser.username;
              return (
                <Link
                  key={conv.otherUser.username}
                  to={`/messages/${conv.otherUser.username}`}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors border-b border-[var(--border)]/8 ${
                    isActive ? 'bg-white/[0.03]' : 'hover:bg-white/[0.015]'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      backgroundColor: 'var(--accent-amber)',
                      color: 'var(--bg-void)',
                      opacity: 0.8,
                    }}
                  >
                    {conv.otherUser.username[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[13px] text-[var(--text)]">
                        @{conv.otherUser.username}
                      </span>
                      <span className="text-[11px] text-[var(--text-faint)]/40 shrink-0 ml-2" style={{ fontFamily: 'var(--font-sans)' }}>
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[13px] text-[var(--text-faint)]/60 truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] shrink-0" />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Conversation ── */}
        <div className={`flex-1 flex flex-col ${
          showConversation ? 'flex' : 'hidden sm:flex'
        }`}>
          {activeUsername ? (
            <>
              {/* Conversation header */}
              <div className="px-5 py-3.5 border-b border-[var(--border)]/15 flex items-center gap-3">
                <button
                  onClick={() => navigate('/messages')}
                  className="sm:hidden text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
                >
                  <span className="text-[16px]">←</span>
                </button>

                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    backgroundColor: 'var(--accent-amber)',
                    color: 'var(--bg-void)',
                    opacity: 0.8,
                  }}
                >
                  {activeUsername[0]?.toUpperCase()}
                </div>

                <Link
                  to={`/@${activeUsername}`}
                  className="font-mono text-[14px] text-[var(--text)] hover:text-[var(--accent-amber)] transition-colors"
                >
                  @{activeUsername}
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
                {isLoading && messages.length === 0 && (
                  <div className="flex justify-center py-8">
                    <span className="text-[13px] text-[var(--text-faint)]/30 animate-pulse" style={{ fontFamily: 'var(--font-sans)' }}>
                      {t('msg.loading')}
                    </span>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMine = msg.senderId === user?.id;
                  const prevMsg = messages[i - 1];
                  const sameSender = prevMsg && prevMsg.senderId === msg.senderId;
                  const gap = !sameSender;

                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${gap ? 'pt-3' : 'pt-0.5'}`}>
                      <div className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 ${
                        isMine
                          ? 'bg-[var(--accent-green)]/[0.08] border border-[var(--accent-green)]/10 rounded-2xl rounded-br-sm'
                          : 'bg-[var(--bg-surface)] border border-[var(--border)]/20 rounded-2xl rounded-bl-sm'
                      }`}>
                        <p className="text-[14px] leading-relaxed break-words text-[var(--text)]" style={{ fontFamily: 'var(--font-sans)' }}>
                          {msg.message}
                        </p>
                        <span className={`text-[10px] block mt-1 ${isMine ? 'text-right' : 'text-left'} text-[var(--text-faint)]/30`} style={{ fontFamily: 'var(--font-sans)' }}>
                          {timeAgo(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="px-4 sm:px-5 py-3 border-t border-[var(--border)]/15">
                <div className="flex items-center gap-2 border border-[var(--border)]/30 focus-within:border-[var(--accent-green)]/30 transition-colors bg-[var(--bg-surface)]">
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={t('msg.placeholder')}
                    disabled={isSending}
                    className="flex-1 bg-transparent text-[var(--text)] text-[14px] outline-none placeholder:text-[var(--text-faint)]/30 disabled:opacity-40 px-4 py-3"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isSending || !draft.trim()}
                    className="text-[var(--accent-green)] hover:text-green-300 disabled:opacity-20 transition-colors px-4 py-3 shrink-0 font-mono text-[13px]"
                  >
                    {t('msg.send')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[15px] text-[var(--text-faint)]/30 mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
                  {t('msg.selectConversation')}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
