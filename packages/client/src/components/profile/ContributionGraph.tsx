import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import type { ApiResponse } from '@clitoris/shared';

interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionData {
  total: number;
  weeks: ContributionWeek[];
}

// Map GitHub's contribution colors to our dark theme
function levelColor(count: number): string {
  if (count === 0) return '#0d0d1e';
  if (count <= 2) return '#0f3d24';
  if (count <= 5) return '#1a6b3a';
  if (count <= 10) return '#26994f';
  return '#3dd68c';
}

export default function ContributionGraph({ githubUsername }: { githubUsername: string }) {
  const [data, setData] = useState<ContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get<ApiResponse<ContributionData>>(`/github/contributions/${githubUsername}`)
      .then((res) => setData(res.data))
      .catch(() => {/* silently fail — graph is optional */})
      .finally(() => setIsLoading(false));
  }, [githubUsername]);

  if (isLoading) {
    return (
      <div className="h-[72px] animate-pulse bg-[#0a0a14] border border-[#1c1c30]" />
    );
  }

  if (!data) return null;

  // Show last 26 weeks for compact display
  const weeks = data.weeks.slice(-26);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[#525270] font-mono text-[10px]">// contributions</span>
        <span className="text-[#7a8898] font-mono text-[10px]">{data.total.toLocaleString()} this year</span>
      </div>
      <div className="flex gap-[3px]" role="img" aria-label={`${data.total} contributions this year`}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.contributionDays.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.contributionCount} contributions`}
                style={{ backgroundColor: levelColor(day.contributionCount) }}
                className="w-[10px] h-[10px] rounded-[2px] transition-colors hover:opacity-80"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
