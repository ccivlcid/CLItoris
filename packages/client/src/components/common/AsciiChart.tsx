import React from 'react';

interface BarData {
  label: string;
  value: number; // percentage (0-100)
  color?: string;
}

export const AsciiBarChart: React.FC<{ data: BarData[] }> = ({ data }) => {
  const BAR_WIDTH = 20;

  return (
    <div className="space-y-1.5 font-mono text-[11px]">
      {data.map((item, i) => {
        const filledWidth = Math.round((item.value / 100) * BAR_WIDTH);
        const bar = '#'.repeat(filledWidth) + '-'.repeat(BAR_WIDTH - filledWidth);
        
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-20 truncate text-gray-400">{item.label}</span>
            <span className="text-[var(--text-faint)]/20">[
              <span style={{ color: item.color || 'var(--accent-green)' }}>
                {'#'.repeat(filledWidth)}
              </span>
              <span className="opacity-20">
                {'-'.repeat(BAR_WIDTH - filledWidth)}
              </span>
            ]</span>
            <span className="text-gray-500 w-8 text-right">{Math.round(item.value)}%</span>
          </div>
        );
      })}
    </div>
  );
};

export const AsciiTrend: React.FC<{ values: number[] }> = ({ values }) => {
  // Simple trend line visualization using unicode braille or basic characters
  // For now, let's use a very simple character-based one
  const getChar = (val: number, max: number) => {
    const ratio = val / (max || 1);
    if (ratio > 0.8) return '█';
    if (ratio > 0.6) return '▆';
    if (ratio > 0.4) return '▄';
    if (ratio > 0.2) return '▂';
    return ' ';
  };

  const max = Math.max(...values, 1);
  const sparkline = values.map(v => getChar(v, max)).join('');

  return (
    <div className="font-mono text-[11px] text-[var(--accent-green)] tracking-tighter">
      {sparkline}
    </div>
  );
};
