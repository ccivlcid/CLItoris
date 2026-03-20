import { useEffect } from 'react';

interface KeyboardHelpModalProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { section: 'navigation', items: [
    { key: 'j / k',   desc: 'next / prev post' },
    { key: 'o / Enter', desc: 'open focused post' },
    { key: 'u',        desc: "go to author's profile" },
    { key: 'G',        desc: 'scroll to bottom' },
    { key: 'Esc',      desc: 'unfocus post' },
  ]},
  { section: 'post actions', items: [
    { key: 's',   desc: 'star / unstar post' },
    { key: 'r',   desc: 'reply (opens post)' },
    { key: '/',   desc: 'focus composer' },
  ]},
  { section: 'go to page  (g+)', items: [
    { key: 'g g', desc: 'scroll to top' },
    { key: 'g h', desc: 'home (global feed)' },
    { key: 'g l', desc: 'local feed' },
    { key: 'g e', desc: 'explore' },
    { key: 'g a', desc: 'analyze' },
    { key: 'g p', desc: 'my profile' },
    { key: 'g s', desc: 'LLM / CLI (profile tab)' },
  ]},
  { section: 'other', items: [
    { key: '?', desc: 'toggle this help' },
  ]},
];

export default function KeyboardHelpModal({ onClose }: KeyboardHelpModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') { e.stopImmediatePropagation(); onClose(); }
    };
    window.addEventListener('keydown', handler, true); // capture phase → runs before global handler
    return () => window.removeEventListener('keydown', handler, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Modal */}
      <div
        className="relative bg-[#0d1117] border border-gray-700 w-full max-w-lg mx-4 font-mono text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 bg-[#16213e]">
          <span className="text-gray-400 text-xs">$ help --keyboard-shortcuts</span>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-300 text-xs transition-colors"
            aria-label="Close help"
          >
            [Esc]
          </button>
        </div>

        {/* Shortcut list */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {SHORTCUTS.map(({ section, items }) => (
            <div key={section}>
              <p className="text-gray-600 text-[10px] mb-2">// {section}</p>
              <div className="space-y-1.5">
                {items.map(({ key, desc }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="shrink-0 w-20 text-right">
                      {key.split(' / ').map((k, i) => (
                        <span key={i}>
                          {i > 0 && <span className="text-gray-700"> / </span>}
                          <kbd className="inline-block bg-[#1a1a2e] border border-gray-700 px-1.5 py-0.5 text-green-400 text-[11px] rounded-sm">
                            {k}
                          </kbd>
                        </span>
                      ))}
                    </span>
                    <span className="text-gray-400 text-xs">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-700 text-gray-700 text-[10px]">
          // shortcuts disabled while typing in input fields
        </div>
      </div>
    </div>
  );
}
