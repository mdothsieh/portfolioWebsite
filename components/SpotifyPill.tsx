'use client';

import { useEffect, useState } from 'react';

interface NowPlaying {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  url?: string;
}

export function SpotifyPill() {
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch('/api/spotify/now-playing');
        if (!res.ok) return;
        const json = (await res.json()) as NowPlaying;
        if (!cancelled) setData(json);
      } catch {
        /* silent — spotify is optional */
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!data?.isPlaying) return null;

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${data.title} — ${data.artist}`}
      className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full bg-surface border border-divider hover:border-muted transition-colors max-w-[180px]"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-[10px] truncate normal-case font-sans tracking-normal">
        {data.title}
      </span>
    </a>
  );
}
