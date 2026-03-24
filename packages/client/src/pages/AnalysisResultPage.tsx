import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.js';
import { useUiStore } from '../stores/uiStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { api } from '../api/client.js';
import { toastError } from '../stores/toastStore.js';
import { AsciiBarChart } from '../components/common/AsciiChart.js';
import { Icon } from '../components/common/Icon.js';
import type { ApiResponse, AnalysisWithSections, AnalysisSectionKey } from '@forkverse/shared';

const SECTION_KEYS: AnalysisSectionKey[] = [
  'summary', 'techStack', 'architecture', 'strengths', 'risks', 'improvements', 'cliView',
];

const SECTION_ICONS: Record<AnalysisSectionKey, string> = {
  summary: '◈',
  techStack: '⚙',
  architecture: '◫',
  strengths: '▲',
  risks: '⚠',
  improvements: '↑',
  cliView: '$',
};

function SectionCard({
  sectionKey,
  content,
  label,
  t,
}: {
  sectionKey: AnalysisSectionKey;
  content: string;
  label: string;
  t: (k: string) => string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError('Failed to copy');
    }
  };

  if (!content) return null;

  return (
    <div
      id={`section-${sectionKey}`}
      className="border border-[var(--border)] bg-[var(--bg-elevated)] scroll-mt-20 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent-green)] font-mono text-sm terminal-glow">{SECTION_ICONS[sectionKey]}</span>
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">{label}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--text-faint)] hover:text-[var(--accent-green)] transition-colors group"
        >
          {copied ? 'DONE' : (
            <>
              <Icon name="copy" className="opacity-50 group-hover:opacity-100" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>
      <div className={`px-5 py-5 font-sans text-[14px] text-[var(--text)] whitespace-pre-wrap leading-[1.8] ${sectionKey === 'cliView' ? 'font-mono text-[var(--accent-green)] bg-[#05060a] border-l-2 border-[var(--accent-green)]/30' : ''}`}>
        {content}
      </div>
    </div>
  );
}

export default function AnalysisResultPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useUiStore();
  const { isAuthenticated } = useAuthStore();
  const [analysis, setAnalysis] = useState<AnalysisWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AnalysisSectionKey>('summary');
  const [starring, setStarring] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<ApiResponse<AnalysisWithSections>>(`/analyze/detail/${id}`)
      .then((res) => {
        setAnalysis(res.data);
        setError(null);
      })
      .catch(() => setError('Analysis not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!analysis?.sections) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = entry.target.id.replace('section-', '') as AnalysisSectionKey;
            setActiveSection(key);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );

    for (const key of SECTION_KEYS) {
      const el = document.getElementById(`section-${key}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [analysis?.sections]);

  const handleStar = async () => {
    if (!analysis || starring) return;
    setStarring(true);
    try {
      const res = await api.post<ApiResponse<{ starred: boolean; starCount: number }>>(`/analyze/${analysis.id}/star`);
      setAnalysis({
        ...analysis,
        isStarred: res.data.starred,
        starCount: res.data.starCount,
      });
    } catch {
      toastError('Failed to star');
    } finally {
      setStarring(false);
    }
  };

  const scrollToSection = (key: AnalysisSectionKey) => {
    const el = document.getElementById(`section-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <AppShell breadcrumb="analysis">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[40vh]">
          <div className="font-mono text-sm text-[var(--accent-green)] terminal-glow animate-pulse">
            $ FETCHING ANALYSIS REPORT --VERBOSE ...
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !analysis) {
    return (
      <AppShell breadcrumb="analysis">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <div className="font-mono text-sm text-red-400">$ FATAL ERROR: {error ?? 'REPORT_NOT_FOUND'}</div>
          <Link to="/analyze" className="font-mono text-sm text-[var(--accent-green)] hover:underline">
            ← [ ESCAPE ] BACK TO ANALYZE
          </Link>
        </div>
      </AppShell>
    );
  }

  const sections = analysis.sections;

  return (
    <AppShell breadcrumb="analysis">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        
        {/* HTOP-style Header Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[var(--border)] bg-[#0d1117] p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-faint)]">
              <span>REPO_URL</span>
              <span className="text-[var(--accent-blue)] truncate ml-4">github.com/{analysis.repoOwner}/{analysis.repoName}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-faint)]">
              <span>REPORT_ID</span>
              <span className="text-[var(--text-muted)]">{analysis.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-faint)]">
              <span>DURATION</span>
              <span className="text-emerald-400">{(analysis.durationMs || 0) / 1000}s</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <AsciiBarChart data={[
              { label: 'COMPLEXITY', value: 65, color: 'var(--accent-amber)' },
              { label: 'MAINTAIN', value: 82, color: 'var(--accent-green)' },
              { label: 'HEALTH', value: 45, color: 'var(--accent-red)' },
            ]} />
          </div>
        </div>

        {/* Status Bar / Breadcrumb */}
        <div className="bg-[#1e293b] px-4 py-1 flex items-center justify-between font-mono text-[10px] text-white/80">
          <div className="flex items-center gap-4">
            <span className="font-bold text-[var(--accent-green)] terminal-glow">FORKVERSE SYSTEM v1.0.2</span>
            <span>REPORT: {analysis.repoName}</span>
            <span>USER: @{analysis.user?.username || 'anonymous'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleStar} className={`transition-colors ${analysis.isStarred ? 'text-[var(--accent-amber)]' : 'hover:text-white'}`}>
              STAR [{analysis.starCount}]
            </button>
          </div>
        </div>

        {/* HTOP Main Layout: Table-style Nav + Content */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Table-style Navigation (HTOP Sidebar) */}
          <div className="w-full md:w-56 shrink-0 space-y-4">
            <div className="border border-[var(--border)] bg-[#0d1117] overflow-hidden">
              <div className="bg-[var(--accent-green)] text-[#0f172a] font-mono text-[10px] font-bold px-3 py-1 uppercase tracking-tighter">
                Section List
              </div>
              <div className="flex flex-col">
                {SECTION_KEYS.map((key) => {
                  if (!sections?.[key]) return null;
                  const isActive = activeSection === key;
                  return (
                    <button
                      key={key}
                      onClick={() => scrollToSection(key)}
                      className={`px-3 py-1.5 font-mono text-[11px] text-left transition-colors flex items-center justify-between group ${
                        isActive 
                          ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]' 
                          : 'text-gray-500 hover:bg-[#1e293b] hover:text-gray-200'
                      }`}
                    >
                      <span>{SECTION_ICONS[key]} {t(`analysis.section.${key}`)}</span>
                      {isActive && <span className="animate-pulse">_</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* F-Key Quick Actions (Desktop Sidebar Bottom) */}
            <div className="hidden md:block space-y-1">
              <div className="font-mono text-[9px] text-[var(--text-faint)] mb-2 uppercase tracking-widest px-1">Quick Actions</div>
              <button onClick={() => window.print()} className="flex items-center gap-2 w-full px-1 font-mono text-[11px] text-gray-500 hover:text-white">
                <span className="bg-gray-700 text-gray-200 px-1 rounded-sm text-[9px]">F5</span>
                <span>Export PDF</span>
              </button>
              <button onClick={() => window.location.href='/analyze'} className="flex items-center gap-2 w-full px-1 font-mono text-[11px] text-gray-500 hover:text-white">
                <span className="bg-gray-700 text-gray-200 px-1 rounded-sm text-[9px]">F10</span>
                <span>Quit Result</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-6 pb-20">
            {sections ? (
              SECTION_KEYS.map((key) => (
                <SectionCard
                  key={key}
                  sectionKey={key}
                  content={sections[key]}
                  label={t(`analysis.section.${key}`)}
                  t={t}
                />
              ))
            ) : (
              <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-6 font-mono text-[13px] text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                {analysis.resultSummary}
              </div>
            )}
            
            <div className="flex items-center gap-4 pt-6 border-t border-[var(--border)]/30">
              <Link to="/analyze" className="font-mono text-xs text-[var(--text-faint)] hover:text-[var(--accent-green)] transition-colors">
                $ cd ..
              </Link>
              <Link to="/feed" className="font-mono text-xs text-[var(--text-faint)] hover:text-[var(--accent-green)] transition-colors">
                $ cd /home/feed
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Function Key Footer (Mobile Persistent) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-[#1a1a2e] border-t border-gray-800 px-4 py-2 flex justify-between items-center font-mono text-[10px]">
        <div className="flex items-center gap-3">
          <span className="text-[#0f172a] bg-gray-400 px-1">F1</span>
          <span className="text-gray-400">Help</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#0f172a] bg-gray-400 px-1">F5</span>
          <span className="text-gray-400">Export</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#0f172a] bg-gray-400 px-1">F10</span>
          <span className="text-gray-400">Quit</span>
        </div>
      </div>
    </AppShell>
  );
}
