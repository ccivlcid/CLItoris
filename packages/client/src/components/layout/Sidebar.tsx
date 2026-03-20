import { Link, useLocation, type Location } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { usePostStore } from '../../stores/postStore.js';
import { api } from '../../api/client.js';
import type { ApiResponse } from '@clitoris/shared';

const TOOL_ICONS: Record<string, string> = {
  'claude-code': '*',
  'codex': '◎',
  'gemini-cli': '◇',
  'opencode': '○',
  'cursor': '◧',
};

interface LlmProviderRow { provider: string; source: string }
interface LlmEntry { id: string; model: string; isApi?: boolean }

function shortModel(model: string): string {
  return model
    .replace(/^claude-/, '')
    .replace(/-\d{8,}$/, '');
}

const NAV = [
  { to: '/',           label: 'feed --global' },
  { to: '/feed/local', label: 'feed --local'  },
  { to: '/explore',    label: 'explore'        },
  { to: '/github',     label: 'github'         },
];

const ME_NAV: Array<{
  label: string;
  href: (username: string) => string;
  isActive: (loc: Location, username: string) => boolean;
}> = [
  {
    label: 'my posts',
    href: (u) => `/@${u}`,
    isActive: (loc, u) => {
      if (loc.pathname !== `/@${u}`) return false;
      const t = new URLSearchParams(loc.search).get('tab');
      return t == null || t === 'posts';
    },
  },
  {
    label: 'analyze',
    href: () => '/analyze',
    isActive: (loc) => loc.pathname === '/analyze',
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { selectedCliTool, selectModel } = usePostStore();
  const [llmEntries, setLlmEntries] = useState<LlmEntry[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const cliEntries: LlmEntry[] = [];
    try {
      const raw = localStorage.getItem('clitoris:cli-model-settings');
      if (raw) {
        const settings = JSON.parse(raw) as Record<string, { main: string }>;
        for (const [id, s] of Object.entries(settings)) {
          cliEntries.push({ id, model: s.main });
        }
      }
    } catch { /* ignore */ }

    let cancelled = false;
    api
      .get<ApiResponse<LlmProviderRow[]>>('/llm/providers')
      .then(async (res) => {
        const apiKeys = res.data.filter((p) => p.source === 'user-settings');
        const apiEntries: LlmEntry[] = [];
        await Promise.all(
          apiKeys.map(async ({ provider }) => {
            try {
              const m = await api.get<ApiResponse<string[]>>(`/llm/models/${provider}`);
              const first = m.data[0];
              if (first) apiEntries.push({ id: provider, model: first, isApi: true });
            } catch {
              /* no key or list failed */
            }
          }),
        );
        if (cancelled) return;
        setLlmEntries([...cliEntries, ...apiEntries]);
      })
      .catch(() => {
        if (!cancelled) setLlmEntries([...cliEntries]);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-[200px] bg-[#0a0a14] border-r border-[#1c1c30] flex flex-col shrink-0 overflow-y-auto">

      {/* Primary nav */}
      <nav className="flex flex-col pt-4 pb-2">
        {NAV.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`py-2 px-4 font-mono text-[12px] border-l-2 transition-colors ${
              isActive(to)
                ? 'text-[#3dd68c] border-[#3dd68c] bg-[#3dd68c]/[0.06]'
                : 'text-[#9aacbf] border-transparent hover:text-white hover:border-[#4a5568]'
            }`}
          >
            {isActive(to) ? (
              <><span className="text-[#f59e0b]">$</span> {label}</>
            ) : (
              label
            )}
          </Link>
        ))}
      </nav>

      {/* LLM selector */}
      {isAuthenticated && (
        <div className="border-t border-[#1c1c30] pt-3 pb-2">
          {llmEntries.length > 0 ? (
            llmEntries.map(({ id, model, isApi }) => {
              const isSelected = selectedCliTool === id;
              const icon = isApi ? '⌗' : (TOOL_ICONS[id] ?? '○');
              return (
                <button
                  key={id}
                  onClick={() => selectModel(id, model)}
                  title={`${id} — ${model}`}
                  className={`w-full flex items-center gap-2 py-1.5 px-4 font-mono text-[11px] border-l-2 text-left transition-colors ${
                    isSelected
                      ? 'text-[#3dd68c] border-[#3dd68c] bg-[#3dd68c]/[0.06]'
                      : 'text-[#7a8898] border-transparent hover:text-[#c9d1d9]'
                  }`}
                >
                  <span className={isSelected ? 'text-[#3dd68c]' : 'text-[#6b7a8d]'}>{icon}</span>
                  <span>{id}</span>
                  <span className={`ml-auto ${isSelected ? 'text-[#3dd68c]/60' : 'text-[#4e5d6e]'}`}>
                    {shortModel(model)}
                  </span>
                </button>
              );
            })
          ) : (
            <Link
              to={user ? `/@${user.username}?tab=cli` : '/login'}
              className="block py-1.5 px-4 font-mono text-[11px] text-[#7a8898] hover:text-[#c9d1d9] transition-colors border-l-2 border-transparent"
            >
              + connect LLM
            </Link>
          )}
        </div>
      )}

      {/* Me section */}
      {isAuthenticated && user ? (
        <div className="border-t border-[#1c1c30] pt-3 mt-auto">
          <div className="px-4 pb-2">
            <Link
              to={`/@${user.username}`}
              className="font-mono text-[12px] text-[#f59e0b] hover:text-amber-300 transition-colors"
            >
              @{user.username}
            </Link>
          </div>
          {ME_NAV.map(({ label, href, isActive }) => {
            const to = href(user.username);
            const active = isActive(location, user.username);
            return (
              <Link
                key={label}
                to={to}
                className={`block py-1.5 px-4 font-mono text-[12px] border-l-2 transition-colors ${
                  active
                    ? 'text-[#3dd68c] border-[#3dd68c] bg-[#3dd68c]/[0.06]'
                    : 'text-[#9aacbf] border-transparent hover:text-white hover:border-[#4a5568]'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <div className="pb-4" />
        </div>
      ) : (
        <div className="mt-auto px-4 py-5 border-t border-[#1c1c30]">
          <Link
            to="/login"
            className="block text-center border border-[#2d3748] text-[#9aacbf] hover:text-[#3dd68c] hover:border-[#3dd68c]/40 font-mono text-[12px] py-2 transition-colors"
          >
            $ login
          </Link>
        </div>
      )}
    </aside>
  );
}
