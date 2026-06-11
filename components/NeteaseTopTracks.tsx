'use client';

// Client view: NetEase (网易云音乐) most-played tracks, brand-red themed.
// Data originates in lib/netease and arrives via the ListeningSection server component.
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { useZhText } from './i18n';

export interface NeteaseTrackView {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage: string | null;
  neteaseUrl: string;
  playCount: number;
}

interface Props {
  weekly: NeteaseTrackView[];
  allTime: NeteaseTrackView[];
}

type Range = 'weekly' | 'allTime';

// NetEase brand red — gives this view its own identity, distinct from the
// site's rose accent and Spotify's green.
const RED = 'rgb(220 38 38)';

export function NeteaseTopTracks({ weekly, allTime }: Props) {
  const hasWeekly = weekly.length > 0;
  const hasAllTime = allTime.length > 0;

  const [range, setRange] = useState<Range>(hasWeekly ? 'weekly' : 'allTime');

  const tracks = range === 'weekly' ? weekly : allTime;
  const maxPlays = useMemo(
    () => tracks.reduce((m, t) => Math.max(m, t.playCount), 0) || 1,
    [tracks],
  );
  const byPlayCount = useZhText('by play count', '按播放次数');

  if (!hasWeekly && !hasAllTime) {
    return (
      <div className="px-5 py-8 text-xs font-mono text-muted leading-relaxed">
        网易云 not connected. Add{' '}
        <code className="text-red-400">NETEASE_UID</code> +{' '}
        <code className="text-red-400">NETEASE_COOKIE</code> to{' '}
        <code className="text-red-400">.env.local</code> and make your listen
        records public.
      </div>
    );
  }

  return (
    <div>
      {/* range toggle */}
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div className="inline-flex rounded-full border border-divider p-0.5 bg-bg/40">
          <RangeTab
            active={range === 'weekly'}
            disabled={!hasWeekly}
            onClick={() => setRange('weekly')}
            label="last 7 days"
            label_zh="最近 7 天"
          />
          <RangeTab
            active={range === 'allTime'}
            disabled={!hasAllTime}
            onClick={() => setRange('allTime')}
            label="all time"
            label_zh="所有时间"
          />
        </div>
        <span className="text-[10px] font-mono lowercase tracking-wider text-muted">
          {byPlayCount}
        </span>
      </div>

      {/* ranked list */}
      <ol className="divide-y divide-divider/70">
        {tracks.map((t, i) => {
          const pct = Math.max(6, Math.round((t.playCount / maxPlays) * 100));
          return (
            <li key={`${t.id}-${i}`}>
              <a
                href={t.neteaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 px-5 py-3 hover:bg-red-500/[0.06] transition-colors"
              >
                {/* rank */}
                <span
                  className="shrink-0 w-6 text-right font-mono text-sm tabular-nums"
                  style={{ color: i < 3 ? RED : undefined }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* art */}
                <span className="relative shrink-0">
                  {t.albumImage ? (
                    <Image
                      src={t.albumImage}
                      alt=""
                      aria-hidden
                      width={40}
                      height={40}
                      unoptimized
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <span className="w-10 h-10 rounded bg-divider block" />
                  )}
                </span>

                {/* title + artist + bar */}
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-base leading-tight truncate group-hover:text-red-300 transition-colors">
                    {t.name}
                  </span>
                  <span className="block text-[10px] font-mono lowercase tracking-wider text-muted truncate mt-0.5">
                    {t.artists}
                  </span>
                  {/* proportional play-count bar */}
                  <span className="mt-1.5 block h-[3px] w-full rounded-full bg-divider/80 overflow-hidden">
                    <span
                      className="block h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${pct}%`, backgroundColor: RED }}
                    />
                  </span>
                </span>

                {/* play count */}
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-sm tabular-nums text-primary/90">
                    {t.playCount.toLocaleString()}
                  </span>
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-muted">
                    plays
                  </span>
                </span>

                <ExternalLink
                  className="w-3.5 h-3.5 shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  strokeWidth={1.75}
                />
              </a>
            </li>
          );
        })}
      </ol>

      <div className="px-5 py-3 border-t border-divider/70 flex items-center justify-between text-[10px] font-mono lowercase tracking-wider text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RED }} />
          网易云音乐 · play records
        </span>
        <span>{tracks.length} tracks</span>
      </div>
    </div>
  );
}

function RangeTab({
  active,
  disabled,
  onClick,
  label,
  label_zh,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  label_zh?: string;
}) {
  const text = useZhText(label, label_zh);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-1 rounded-full text-[10px] font-mono lowercase tracking-widest transition-colors
        disabled:opacity-30 disabled:cursor-not-allowed
        ${active ? 'bg-red-600 text-white' : 'text-muted hover:text-primary'}
      `}
    >
      {text}
    </button>
  );
}
