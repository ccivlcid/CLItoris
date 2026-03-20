import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { useState } from 'react';

export default function HeaderBar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useUiStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-11 bg-[#0a0a14] border-b border-[#1c1c30] flex items-center justify-between px-5 shrink-0">
      <Link
        to="/"
        className="font-mono text-sm font-bold text-[#e2e8f0] tracking-tight hover:text-white transition-colors"
      >
        terminal<span className="text-[#3dd68c]">.</span>social
      </Link>

      <div className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              className="font-mono text-xs text-[#f59e0b] hover:text-amber-300 flex items-center gap-1 transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="text-[#9aacbf]">@</span>
              {user.username}
              <span className="text-[#7a8898] text-[10px] ml-0.5">▾</span>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 bg-[#0f0f1e] border border-[#1c1c30] w-36 z-50 py-1 shadow-xl shadow-black/60">
                  <Link
                    to={`/@${user.username}`}
                    className="block px-4 py-2 text-[#9aacbf] hover:text-white font-mono text-[11px] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('menu.profile')}
                  </Link>
                  <Link
                    to={`/@${user.username}?tab=cli`}
                    className="block px-4 py-2 text-[#9aacbf] hover:text-white font-mono text-[11px] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('menu.llm')}
                  </Link>
                  <div className="border-t border-[#1c1c30] my-0.5" />
                  <button
                    className="w-full text-left px-4 py-2 text-[#9aacbf] hover:text-red-400 font-mono text-[11px] transition-colors"
                    onClick={handleLogout}
                  >
                    {t('menu.logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="font-mono text-[12px] text-[#9aacbf] hover:text-white transition-colors"
          >
            connect
          </Link>
        )}

        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))}
          className="font-mono text-[11px] text-[#7a8898] hover:text-[#c9d1d9] transition-colors"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          [?]
        </button>
      </div>
    </header>
  );
}
