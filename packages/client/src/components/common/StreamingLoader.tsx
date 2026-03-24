import React, { useState, useEffect } from 'react';

interface LogLine {
  text: string;
  status: 'pending' | 'active' | 'done';
}

interface StreamingLoaderProps {
  logs: LogLine[];
}

export const StreamingLoader: React.FC<StreamingLoaderProps> = ({ logs }) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Reveal lines one by one for effect
    const timer = setInterval(() => {
      setVisibleCount((prev) => (prev < logs.length ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(timer);
  }, [logs.length]);

  return (
    <div className="bg-[#0d1117] border border-gray-800 p-4 font-mono text-[12px] leading-[1.6] overflow-hidden min-h-[140px] flex flex-col justify-end">
      {logs.slice(0, visibleCount).map((log, i) => {
        const isActive = i === visibleCount - 1 && log.status !== 'done';
        return (
          <div key={i} className="flex justify-between gap-4">
            <div className="flex items-start gap-2 overflow-hidden">
              <span className="text-gray-600 shrink-0">{'>'}</span>
              <span className={`${
                log.status === 'done' ? 'text-green-400' : 
                log.status === 'active' ? 'text-amber-400' : 'text-gray-500'
              } truncate`}>
                {log.text}
                {isActive && <span className="animate-pulse ml-1">_</span>}
              </span>
            </div>
            <div className="shrink-0 text-[10px] uppercase tracking-tighter">
              {log.status === 'done' ? (
                <span className="text-green-400 font-bold">[DONE]</span>
              ) : log.status === 'active' ? (
                <span className="text-amber-400">[ACTIVE]</span>
              ) : (
                <span className="text-gray-700">[PENDING]</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
