import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useUiStore();
  const [showDropup, setShowDropup] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const profilePath = isAuthenticated && user ? `/@${user.username}` : '/login';
  const isProfileActive = location.pathname.startsWith('/@');

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)]/95 backdrop-blur-sm border-t border-[var(--border)]/40 flex items-center h-14 pb-safe shrink-0">

      {/* Dropup overlay */}
      {showDropup && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropup(false)} />
      )}

      {/* Dropup menu */}
      {showDropup && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-surface)] border border-[var(--border)] shadow-xl shadow-black/60 flex flex-col min-w-[160px]">
          <button
            onClick={() => { setShowDropup(false); navigate('/analyze'); }}
            className="flex items-center gap-2 px-4 py-3.5 font-mono text-[13px] text-[var(--text-muted)] hover:text-[var(--accent-green)] hover:bg-white/[0.03] transition-colors border-b border-[var(--border)]/40"
          >
            <span className="text-[var(--accent-green)]">▶</span>
            {t('feed.compose.analyze')}
          </button>
          <button
            onClick={() => { setShowDropup(false); navigate('/new'); }}
            className="flex items-center gap-2 px-4 py-3.5 font-mono text-[13px] text-[var(--text-muted)] hover:text-[var(--accent-amber)] hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-[var(--accent-amber)]">✎</span>
            {t('feed.compose.post')}
          </button>
        </div>
      )}

      {/* Feed */}
      <Link
        to="/feed"
        className={`group flex flex-col items-center justify-center flex-1 h-full font-mono transition-colors ${
          isActive('/feed') || isActive('/') ? 'text-[var(--accent-green)]' : 'text-[var(--text-faint)]'
        }`}
      >
        <span className="text-[17px] leading-none">~</span>
        <span className="text-[10px] leading-none mt-1 opacity-60">{t('mobile.feed')}</span>
      </Link>

      {/* Explore */}
      <Link
        to="/explore"
        className={`group flex flex-col items-center justify-center flex-1 h-full font-mono transition-colors ${
          isActive('/explore') || isActive('/search') || isActive('/leaderboard')
            ? 'text-[var(--accent-green)]'
            : 'text-[var(--text-faint)]'
        }`}
      >
        <span className="text-[17px] leading-none">◆</span>
        <span className="text-[10px] leading-none mt-1 opacity-60">{t('mobile.explore')}</span>
      </Link>

      {/* Center — dropup trigger (44×44 touch target) */}
      <button
        onClick={() => setShowDropup((v) => !v)}
        className={`flex items-center justify-center w-11 h-11 mx-1 font-mono text-[18px] font-bold transition-all active:scale-95 ${
          showDropup
            ? 'bg-[var(--accent-green)]/80 text-[var(--bg-void)]'
            : 'bg-[var(--accent-green)] text-[var(--bg-void)]'
        }`}
        aria-label="Create"
        aria-expanded={showDropup}
      >
        {showDropup ? '×' : '+'}
      </button>

      {/* Activity */}
      <Link
        to="/activity"
        className={`group flex flex-col items-center justify-center flex-1 h-full font-mono transition-colors ${
          isActive('/activity') ? 'text-[var(--accent-green)]' : 'text-[var(--text-faint)]'
        }`}
      >
        <span className="text-[17px] leading-none">●</span>
        <span className="text-[10px] leading-none mt-1 opacity-60">{t('mobile.log')}</span>
      </Link>

      {/* Profile */}
      <Link
        to={profilePath}
        className={`group flex flex-col items-center justify-center flex-1 h-full font-mono transition-colors ${
          isProfileActive ? 'text-[var(--accent-amber)]' : 'text-[var(--text-faint)]'
        }`}
      >
        {isAuthenticated && user ? (
          <span className="text-[15px] leading-none font-bold">{user.username[0]?.toUpperCase()}</span>
        ) : (
          <span className="text-[17px] leading-none">⊡</span>
        )}
        <span className="text-[10px] leading-none mt-1 opacity-60">{t('mobile.me')}</span>
      </Link>
    </nav>
  );
}
