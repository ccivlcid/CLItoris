import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import type { ApiResponse } from '@clitoris/shared';

interface ProviderConfig {
  id: string;
  label: string;
  baseUrl: string;
  keyPlaceholder: string;
  noKey?: boolean;
}

const PROVIDERS: ProviderConfig[] = [
  { id: 'openai',      label: 'OpenAI',      baseUrl: 'https://api.openai.com/v1',                       keyPlaceholder: 'sk-...' },
  { id: 'anthropic',   label: 'Anthropic',   baseUrl: 'https://api.anthropic.com',                        keyPlaceholder: 'sk-ant-...' },
  { id: 'gemini',      label: 'Google AI',   baseUrl: 'https://generativelanguage.googleapis.com/v1beta', keyPlaceholder: 'AIza...' },
  { id: 'ollama',      label: 'Ollama',      baseUrl: 'http://localhost:11434/v1',                        keyPlaceholder: 'ollama', noKey: true },
  { id: 'openrouter',  label: 'OpenRouter',  baseUrl: 'https://openrouter.ai/api/v1',                    keyPlaceholder: 'sk-or-...' },
  { id: 'together',    label: 'Together',    baseUrl: 'https://api.together.xyz/v1',                     keyPlaceholder: 'api key...' },
  { id: 'groq',        label: 'Groq',        baseUrl: 'https://api.groq.com/openai/v1',                  keyPlaceholder: 'gsk_...' },
  { id: 'cerebras',    label: 'Cerebras',    baseUrl: 'https://api.cerebras.ai/v1',                      keyPlaceholder: 'csk-...' },
  { id: 'api',         label: 'Custom',      baseUrl: '',                                                 keyPlaceholder: 'api key...' },
];

const defaultProvider = PROVIDERS[0]!;

interface SavedProvider {
  provider: string;
  label: string | null;
  base_url: string | null;
}

export default function ApiTab({ onToast }: { onToast?: (msg: string) => void }) {
  const [saved, setSaved] = useState<SavedProvider[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Form state
  const [selectedType, setSelectedType] = useState<ProviderConfig>(defaultProvider);
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState(defaultProvider.baseUrl);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSaved = () => {
    api.get<ApiResponse<SavedProvider[]>>('/llm/providers/list')
      .then((res) => setSaved(res.data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  };

  useEffect(() => { fetchSaved(); }, []);

  const selectType = (p: ProviderConfig) => {
    setSelectedType(p);
    setBaseUrl(p.baseUrl);
    setName(p.label === 'Custom' ? '' : p.label);
    setApiKey('');
  };

  const handleAdd = async () => {
    if (!apiKey.trim() && !selectedType.noKey) return;
    setSaving(true);
    try {
      await api.post('/llm/keys', {
        provider: selectedType.id,
        apiKey: apiKey.trim() || 'local',
        label: name.trim() || selectedType.label,
        baseUrl: baseUrl.trim() || undefined,
      });
      onToast?.('Provider added');
      setApiKey('');
      setName('');
      fetchSaved();
    } catch {
      onToast?.('Failed to add provider');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (provider: string) => {
    await api.delete(`/llm/keys/${provider}`);
    setSaved((prev) => prev.filter((p) => p.provider !== provider));
    onToast?.('Provider removed');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 font-mono text-xs">// API PROVIDERS</span>
        <button
          onClick={fetchSaved}
          className="text-gray-600 hover:text-gray-300 font-mono text-xs border border-gray-700 hover:border-gray-600 px-2 py-1 transition-colors"
        >
          [↺]
        </button>
      </div>

      <p className="text-gray-400 font-sans text-sm leading-relaxed">
        로컬 모델(Ollama 등), 프론티어 모델(OpenAI, Anthropic 등), 기타 서비스의 API를 등록하여 언어모델에 접근합니다.
      </p>

      {/* Add Provider Form */}
      <div className="border border-gray-700 bg-[#16213e] p-5 space-y-4">
        <p className="text-amber-600/80 font-mono text-[10px] uppercase tracking-widest">
          <span className="text-amber-700">▌</span> // ADD PROVIDER
        </p>

        {/* Provider type buttons */}
        <div className="space-y-1">
          <p className="text-gray-600 font-mono text-[10px]">// 유형</p>
          <div className="flex flex-wrap gap-1.5">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => selectType(p)}
                className={`px-3 py-1 font-mono text-xs border transition-colors ${
                  selectedType.id === p.id
                    ? 'bg-amber-700/20 text-amber-400 border-amber-600/50'
                    : 'text-gray-400 border-gray-700 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1">
          <p className="text-gray-600 font-mono text-[10px]">// 이름</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={selectedType.label}
            className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 font-mono text-sm px-3 py-2 placeholder-gray-700 focus:outline-none focus:border-gray-500"
          />
        </div>

        {/* Base URL */}
        <div className="space-y-1">
          <p className="text-gray-600 font-mono text-[10px]">// BASE URL</p>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 font-mono text-sm px-3 py-2 placeholder-gray-700 focus:outline-none focus:border-gray-500"
          />
        </div>

        {/* API Key */}
        {!selectedType.noKey && (
          <div className="space-y-1">
            <p className="text-gray-600 font-mono text-[10px]">// API KEY</p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={selectedType.keyPlaceholder}
              className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 font-mono text-sm px-3 py-2 placeholder-gray-700 focus:outline-none focus:border-gray-500"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAdd}
            disabled={saving || (!selectedType.noKey && !apiKey.trim())}
            className="bg-amber-700/80 hover:bg-amber-700 text-amber-100 px-5 py-1.5 font-mono text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '저장 중...' : '추가'}
          </button>
          <button
            onClick={() => { setApiKey(''); setName(''); setBaseUrl(selectedType.baseUrl); }}
            className="text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600 px-5 py-1.5 font-mono text-sm transition-colors"
          >
            취소
          </button>
        </div>
      </div>

      {/* Saved providers list */}
      {loaded && saved.length > 0 && (
        <div className="border border-gray-700 bg-[#16213e] p-5 space-y-3">
          <p className="text-gray-600 font-mono text-[10px]">// 등록된 프로바이더</p>
          <div className="space-y-2">
            {saved.map((p) => (
              <div key={p.provider} className="flex items-center justify-between font-mono text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 text-[10px]">●</span>
                  <span className="text-gray-300">{p.label ?? p.provider}</span>
                  {p.base_url && (
                    <span className="text-gray-600 text-[10px]">{p.base_url}</span>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(p.provider)}
                  className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                >
                  [× 제거]
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loaded && saved.length === 0 && (
        <p className="text-gray-700 font-mono text-xs text-center py-4">
          &gt; 등록된 프로바이더가 없습니다.
        </p>
      )}
    </div>
  );
}
