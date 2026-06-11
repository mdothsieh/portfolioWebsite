'use client';

// Personal-layer status board (client). A quiet four-cell instrument row under
// the /personal header: live Los Angeles + Taipei clocks (ticked client-side —
// rendered as em-dashes for no-JS visitors rather than a stale server time),
// the current Spotify track, and today's Claude message count. The two live
// values are fetched server-side by app/personal/page.tsx (revalidate=30) and
// passed in as props — no secrets or extra API calls reach the client.
import { useEffect, useState } from 'react';
import { T } from './i18n';

interface Props {
  isPlaying: boolean;
  trackName?: string;
  trackUrl?: string;
  todayActivity: number;
}

function useClock(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function fmt(now: Date | null, timeZone: string): string {
  if (!now) return '——:——:——';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone,
  }).format(now);
}

export function PersonalStatus({ isPlaying, trackName, trackUrl, todayActivity }: Props) {
  const now = useClock();

  return (
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-divider border-y border-divider">
      <Cell
        value={fmt(now, 'America/Los_Angeles')}
        label={<T en="Los Angeles" zh="洛杉矶" />}
        sub={<T en="where I am" zh="我在的地方" />}
      />
      <Cell
        value={fmt(now, 'Asia/Taipei')}
        label={<T en="Taipei" zh="台北" />}
        sub={<T en="where the tea is" zh="茶在的地方" />}
      />
      <Cell
        value={
          isPlaying && trackName ? (
            trackUrl ? (
              <a
                href={trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-rose-300 transition-colors"
              >
                {trackName}
              </a>
            ) : (
              trackName
            )
          ) : (
            <span className="text-muted">
              <T en="quiet" zh="安静" />
            </span>
          )
        }
        label={<T en="Now playing" zh="正在播放" />}
        sub={
          isPlaying ? (
            <T en="live from Spotify" zh="来自 Spotify 的实时信号" />
          ) : (
            <T en="spotify, between songs" zh="spotify，两首歌之间" />
          )
        }
        small
      />
      <Cell
        value={String(todayActivity)}
        label={<T en="Claude msgs today" zh="今日 Claude 消息" />}
        sub={<T en="quiet days are touch grass days" zh="安静的日子是出门摸草的日子" />}
      />
    </dl>
  );
}

function Cell({
  value,
  label,
  sub,
  small = false,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  sub: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 bg-bg px-5 py-5 min-h-[6.5rem]">
      <dd
        className={`font-serif tabular leading-tight ${
          small ? 'text-base md:text-lg line-clamp-2' : 'text-2xl md:text-3xl'
        }`}
      >
        {value}
      </dd>
      <div>
        <dt className="text-[10px] font-mono uppercase tracking-widest text-muted">
          {label}
        </dt>
        <div className="mt-1 text-[10px] font-mono text-muted/60">{sub}</div>
      </div>
    </div>
  );
}
