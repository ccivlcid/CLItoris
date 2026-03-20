import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { usePostStore } from '../../stores/postStore.js';
import type { ApiResponse } from '@clitoris/shared';

interface CliToolStatus {
  id: string;
  name: string;
  installed: boolean;
  version: string | null;
  authenticated: boolean;
  models: string[];
  installCmd: string | null;
}

const TOOL_ICONS: Record<string, string> = {
  'claude-code': '*',
  'codex': '◎',
  'gemini-cli': '◇',
  'opencode': '○',
  'cursor': '◧',
};

const TOOL_ICON_COLORS: Record<string, string> = {
  'claude-code': 'text-orange-400',
  'codex': 'text-emerald-400',
  'gemini-cli': 'text-sky-400',
  'opencode': 'text-purple-400',
  'cursor': 'text-blue-400',
};

const STORAGE_KEY = 'clitoris:cli-model-settings';
const CLI_SETTINGS_KEY = 'clitoris:cli-settings';

interface ModelSettings {
  [toolId: string]: {
    main: string;
  };
}

function loadModelSettings(): ModelSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ModelSettings;
  } catch { /* ignore */ }
  return {};
}

function saveModelSettings(s: ModelSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function loadDefaultTool(): string {
  try {
    const raw = localStorage.getItem(CLI_SETTINGS_KEY);
    if (raw) return (JSON.parse(raw) as { defaultTool: string }).defaultTool ?? '';
  } catch { /* ignore */ }
  return '';
}

function saveDefaultTool(toolId: string) {
  localStorage.setItem(CLI_SETTINGS_KEY, JSON.stringify({ defaultTool: toolId }));
}

export default function CliTab({ onToast }: { onToast: (msg: string) => void }) {
  const [tools, setTools] = useState<CliToolStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [modelSettings, setModelSettings] = useState<ModelSettings>(loadModelSettings);
  const [defaultTool, setDefaultToolState] = useState<string>(loadDefaultTool);
  const selectModel = usePostStore((s) => s.selectModel);

  const fetchStatus = async (refresh = false) => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<CliToolStatus[]>>(`/llm/cli/status${refresh ? '?refresh=1' : ''}`);
      setTools(res.data);
      // Init model settings for newly detected tools
      setModelSettings((prev) => {
        const next = { ...prev };
        for (const tool of res.data) {
          const firstModel = tool.models[0];
          if (tool.installed && firstModel && !next[tool.id]) {
            next[tool.id] = { main: firstModel };
          }
        }
        saveModelSettings(next);
        return next;
      });
      // Auto-set defaultTool if none saved yet
      setDefaultToolState((prev) => {
        if (prev) return prev;
        const first = res.data.find((t) => t.installed);
        if (first) {
          saveDefaultTool(first.id);
          return first.id;
        }
        return prev;
      });
    } catch {
      onToast('Failed to fetch CLI status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchStatus(); }, []);

  const handleInstall = async (tool: CliToolStatus) => {
    if (!tool.installCmd) return;
    setInstalling(tool.id);
    try {
      await api.post('/llm/cli/install', { id: tool.id });
      onToast(`${tool.name} installed`);
      await fetchStatus();
    } catch {
      onToast(`Install failed — run manually: ${tool.installCmd}`);
    } finally {
      setInstalling(null);
    }
  };

  const setModel = (toolId: string, value: string) => {
    setModelSettings((prev) => {
      const next = { ...prev, [toolId]: { main: value } };
      saveModelSettings(next);
      return next;
    });
    // If this tool is the current default, sync postStore immediately
    if (toolId === defaultTool) {
      selectModel(toolId, value);
    }
  };

  const handleSetDefault = (toolId: string) => {
    saveDefaultTool(toolId);
    setDefaultToolState(toolId);
    const model = modelSettings[toolId]?.main ?? '';
    selectModel(toolId, model);
    onToast(`기본 CLI 도구: ${toolId}`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-700 bg-[#16213e] p-5 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 font-mono text-xs">// CLI STATUS</span>
        <button
          onClick={() => void fetchStatus(true)}
          className="text-gray-600 hover:text-gray-300 font-mono text-xs border border-gray-700 hover:border-gray-600 px-2 py-1 transition-colors"
          title="Refresh"
        >
          [↺]
        </button>
      </div>

      {tools.map((tool) => {
        const icon = TOOL_ICONS[tool.id] ?? '○';
        const iconColor = TOOL_ICON_COLORS[tool.id] ?? 'text-gray-400';
        const settings = modelSettings[tool.id] ?? { main: tool.models[0] ?? '' };

        return (
          <div key={tool.id} className="border border-gray-700 bg-[#16213e] p-5 space-y-3">
            {/* Tool header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <span className={`font-mono text-base leading-none mt-0.5 ${iconColor}`}>{icon}</span>
                <div>
                  <p className="text-gray-200 font-mono text-sm font-semibold">{tool.name}</p>
                  <p className="text-gray-600 font-mono text-xs mt-0.5">
                    {tool.installed
                      ? tool.version ?? '버전 확인 불가'
                      : '미설치'}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2 shrink-0">
                {tool.installed && defaultTool === tool.id && (
                  <span className="text-green-400 border border-green-400/40 bg-green-400/5 font-mono text-[10px] px-2 py-0.5">
                    기본
                  </span>
                )}
                {tool.installed && defaultTool !== tool.id && (
                  <button
                    onClick={() => handleSetDefault(tool.id)}
                    className="text-gray-600 hover:text-gray-300 border border-gray-700 hover:border-gray-500 font-mono text-[10px] px-2 py-0.5 transition-colors"
                  >
                    기본으로 설정
                  </button>
                )}
                {tool.installed ? (
                  <span className="text-emerald-400 border border-emerald-400/40 bg-emerald-400/5 font-mono text-[10px] px-2 py-0.5">
                    설치됨
                  </span>
                ) : (
                  <span className="text-gray-500 border border-gray-600 font-mono text-[10px] px-2 py-0.5">
                    미설치
                  </span>
                )}
                {tool.installed && (
                  tool.authenticated ? (
                    <span className="text-sky-400 border border-sky-400/40 bg-sky-400/5 font-mono text-[10px] px-2 py-0.5">
                      인증됨
                    </span>
                  ) : (
                    <span className="text-amber-400 border border-amber-400/40 bg-amber-400/5 font-mono text-[10px] px-2 py-0.5">
                      미인증
                    </span>
                  )
                )}
              </div>
            </div>

            {/* If installed: model selectors */}
            {tool.installed && tool.models.length > 0 && (
              <div className="space-y-2 pt-1">
                {/* Main model */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-500 font-mono text-xs w-20 shrink-0">모델:</label>
                  <select
                    value={settings.main}
                    onChange={(e) => setModel(tool.id, e.target.value)}
                    className="flex-1 bg-[#0d1117] border border-gray-700 text-gray-300 font-mono text-xs px-3 py-1.5 focus:outline-none focus:border-gray-500"
                  >
                    {tool.models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* If not installed: install button */}
            {!tool.installed && tool.installCmd && (
              <div className="flex items-center gap-3 pt-1">
                {tool.installCmd.startsWith('http') ? (
                  <a
                    href={tool.installCmd}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-sky-400 border border-gray-700 hover:border-sky-400/30 font-mono text-xs px-3 py-1.5 transition-colors"
                  >
                    다운로드
                  </a>
                ) : (
                  <button
                    onClick={() => void handleInstall(tool)}
                    disabled={installing === tool.id}
                    className="text-gray-400 hover:text-emerald-400 border border-gray-700 hover:border-emerald-400/30 font-mono text-xs px-3 py-1.5 transition-colors disabled:opacity-40"
                  >
                    {installing === tool.id ? '설치 중...' : 'npm 설치'}
                  </button>
                )}
                <code className="text-gray-700 font-mono text-[10px]">{tool.installCmd}</code>
              </div>
            )}

            {/* Installed but no models: show warning */}
            {tool.installed && tool.models.length === 0 && (
              <p className="text-amber-400/60 font-mono text-xs">
                &gt; 모델 목록을 가져올 수 없습니다.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
