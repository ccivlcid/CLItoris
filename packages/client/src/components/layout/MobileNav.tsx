import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useUiStore();

  const isActive = (path: string) => location.pathname === path;
  const profilePath = isAuthenticated && user ? `/@${user.username}` : '/login';
  const isProfileActive = location.pathname.startsWith('/@');

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)]/95 backdrop-blur-sm border-t border-[var(--border)]/40 flex items-center h-12 shrink-0">
      {/* Feed */}
      <Link
        to="/"
        className={`group flex flex-col items-center justify-center flex-1 h-full font-mono transition-colors ${
          isActive('/') ? 'text-[var(--accent-green)]' : 'text-[var(--text-faint)] active:text-[var(--text-muted)]'
        }`}
      >
        <span className="text-[15px] leading-none">~</span>
        <span className={`text-[8px] leading-none mt-0.5 transition-opacity ${
          isActive('/') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>{t('mobile.feed')}</span>
      </Link>

      {/* Explore */}
      <Link
        to="/explore"
        className={`group flex flex-col items-center justify-center flex-1 h-full font-mono transition-colors ${
          isActive('/explore') || isActive('/search') || isActive('/leaderboard')
            ? 'text-[var(--accent-green)]'
            : 'text-[var(--text-faint)] active:text-[var(--text-muted)]'
        }`}
      >
        <span className="text-[15px] leading-none">◆</span>
        <span className={`text-[8px] leading-none mt-0.5 transition-opacity ${
          isActive('/explore') || isActive('/search') || isActive('/leaderboard') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>{t('mobile.explore')}</span>
      </Link>

      {/* Create post — center */}
      <button
        onClick={() => navigate('/new')}
        className="flex items-center justify-center w-10 h-8 mx-1 bg-[var(--accent-green)] text-[var(--bg-void)] font-mono text-[16px] font-bold active:bg-[var(--accent-green)]/80 transition-colors"
      >
        +
      </button>

      {/* Activity */}
      <Link
        to="/activity"
        className={`group flex flex-col items-center justify-center flex-1 h-full font-mono transition-colors ${
          isActive('/activity') ? 'text-[var(--accent-green)]' : 'text-[var(--text-faint)] active:text-[var(--text-muted)]'
        }`}
      >
        <span className="text-[15px] leading-none">●</span>
        <span className={`text-[8px] leading-none mt-0.5 transition-opacity ${
          isActive('/activity') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>{t('mobile.log')}</span>
      </Link>

      {/* Profile */}
      <Link
        to={profilePath}
        className={`group flex flex-col items-center justify-center flex-1 h-full font-mono transition-colors ${
          isProfileActive ? 'text-[var(--accent-amber)]' : 'text-[var(--text-faint)] active:text-[var(--text-muted)]'
        }`}
      >
        {isAuthenticated && user ? (
          <span className="text-[13px] leading-none font-bold">{user.username[0]?.toUpperCase()}</span>
        ) : (
          <span className="text-[15px] leading-none">⊡</span>
        )}
        <span className={`text-[8px] leading-none mt-0.5 transition-opacity ${
          isProfileActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>{t('mobile.me')}</span>
      </Link>
    </nav>
  );
}
