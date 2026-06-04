'use client';

import { useEffect, useState } from 'react';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface Contributions {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

const LEVEL_BG = [
  'bg-divider',
  'bg-emerald-900/80',
  'bg-emerald-700',
  'bg-emerald-500',
  'bg-emerald-300',
];

interface Props {
  username?: string;
}

export function GitHubHeatmap({ username = 'mdothsieh' }: Props) {
  const [data, setData] = useState<Contributions | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/github/contributions')
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setData)
      .catch(() => setError('Could not load contributions'));
  }, []);

  if (error) {
    return (
      <div className="bg-surface border border-divider rounded-lg p-6 text-xs font-mono text-muted">
        {error}. Check that <code className="text-primary">NEXT_PUBLIC_GITHUB_USERNAME</code> is set.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="bg-surface border border-divider rounded-lg p-6 text-xs font-mono text-muted">
        Loading contributions…
      </div>
    );
  }

  const recent = data.contributions.slice(-365);
  const total = recent.reduce((s, d) => s + d.count, 0);

  // Group days into weeks, padding the first week's leading empty cells.
  const weeks: ContributionDay[][] = [];
  let week: ContributionDay[] = [];
  recent.forEach((day, i) => {
    if (i === 0) {
      const weekday = new Date(day.date).getDay();
      for (let j = 0; j < weekday; j++) {
        week.push({ date: '', count: 0, level: 0 });
      }
    }
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);

  return (
    <div className="bg-surface border border-divider rounded-lg p-6">
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
            GitHub · Last 365 days
          </div>
          <div className="font-serif text-3xl leading-none tabular">
            {total} <span className="text-muted text-base">contributions</span>
          </div>
        </div>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors"
        >
          @{username} ↗
        </a>
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-[3px] shrink-0">
            {w.map((day, di) => (
              <div
                key={di}
                title={day.date ? `${day.count} on ${day.date}` : ''}
                className={`h-[10px] w-[10px] rounded-[2px] ${LEVEL_BG[day.level]}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4 text-[10px] font-mono uppercase tracking-widest text-muted">
        <span>less</span>
        {LEVEL_BG.map((c, i) => (
          <span key={i} className={`h-[10px] w-[10px] rounded-[2px] ${c}`} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}
