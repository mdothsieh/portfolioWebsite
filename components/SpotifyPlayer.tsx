'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

// Minimal track shape — mirrors lib/spotify.ts SpotifyTrack
export interface PlayerTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage: string | null;
  spotifyUrl: string;
  previewUrl: string | null; // kept for shape compatibility; no longer used
}

export interface PlayerEntry {
  playedAt?: string;
  track: PlayerTrack;
}

interface Props {
  /** Most recent ~10 plays, newest first. */
  plays: PlayerEntry[];
  /** If currently playing on Spotify, render this as the head of the queue. */
  nowPlaying?: PlayerTrack;
}

// Spotify deprecated 30-second preview_url in the Web API (Nov 2024), so the
// old <audio> preview no longer works. We embed Spotify's official iframe
// player instead — full track for logged-in Premium users, 30s otherwise,
// and it needs no preview_url.
export function SpotifyPlayer({ plays, nowPlaying }: Props) {
  const queue: PlayerTrack[] = useMemo(() => {
    const base = plays.map((p) => p.track);
    if (nowPlaying && base[0]?.id !== nowPlaying.id) return [nowPlaying, ...base];
    return base;
  }, [plays, nowPlaying]);

  const [idx, setIdx] = useState(0);
  const [expanded, setExpanded] = useState(true);

  const track = queue[idx];
  if (!track) return null;

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(queue.length - 1, i + 1));

  return (
    <div
      className="
        relative overflow-hidden
        rounded-2xl border border-divider
        bg-surface/70 backdrop-blur-md
        shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]
        transition-all duration-300
      "
    >
      {/* Blurred album halo backdrop */}
      {track.albumImage && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <Image
            src={track.albumImage}
            alt=""
            fill
            sizes="600px"
            className="object-cover scale-150 blur-3xl opacity-30"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/60 to-bg/85" />
        </div>
      )}

      {/* === Compact header === */}
      <div className="relative flex items-center gap-3 p-3">
        {/* album thumb + live dot */}
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 relative"
          aria-label={`Open ${track.name} in Spotify`}
        >
          {track.albumImage ? (
            <Image
              src={track.albumImage}
              alt={track.album}
              width={48}
              height={48}
              className="w-12 h-12 rounded-md object-cover"
              unoptimized
            />
          ) : (
            <span className="w-12 h-12 rounded-md bg-divider block" />
          )}
          {nowPlaying && idx === 0 && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
          )}
        </a>

        {/* track meta */}
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 group"
        >
          <span className="text-[9px] font-mono uppercase tracking-widest text-green-500/90">
            {nowPlaying && idx === 0 ? 'now playing' : 'from recent'}
          </span>
          <div className="font-serif text-lg leading-tight truncate group-hover:text-green-200 transition-colors mt-0.5">
            {track.name}
          </div>
          <div className="text-[10px] font-mono lowercase tracking-wider text-muted truncate mt-0.5">
            {track.artists}
          </div>
        </a>

        {/* expand toggle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? 'Collapse player' : 'Expand player'}
          className="shrink-0 p-2 text-muted hover:text-green-300 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
          ) : (
            <ChevronUp className="w-4 h-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* === Expanded body — official Spotify embed === */}
      <div
        className={`
          relative grid transition-[grid-template-rows] duration-300 ease-out
          ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
        `}
      >
        <div className="overflow-hidden">
          <div className="border-t border-divider p-4 space-y-4">
            {/* The real player — full track for Premium, 30s otherwise */}
            <iframe
              key={track.id}
              title={`Spotify player — ${track.name}`}
              src={`https://open.spotify.com/embed/track/${track.id}?theme=0`}
              width="100%"
              height={152}
              frameBorder={0}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="rounded-xl block w-full"
            />

            {/* queue nav */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={prev}
                disabled={idx === 0}
                className="
                  py-2.5 rounded-md border border-divider
                  font-mono text-[11px] lowercase tracking-widest
                  text-muted hover:text-green-300 hover:border-muted
                  transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                ← prev
              </button>
              <button
                onClick={next}
                disabled={idx === queue.length - 1}
                className="
                  py-2.5 rounded-md border border-divider
                  font-mono text-[11px] lowercase tracking-widest
                  text-muted hover:text-green-300 hover:border-muted
                  transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                next →
              </button>
            </div>

            {/* meta row */}
            <div className="flex items-center justify-between">
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center gap-1.5
                  text-[11px] font-mono lowercase tracking-widest
                  text-green-400 hover:text-green-300 transition-colors
                  border-b border-green-400/60 hover:border-green-300 pb-0.5
                "
              >
                <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                open on spotify
              </a>
              <span className="text-[10px] font-mono lowercase tracking-wider text-muted tabular-nums">
                {idx + 1}/{queue.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
