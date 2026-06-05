'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Star,
  ExternalLink,
} from 'lucide-react';

// Minimal track shape — mirrors lib/spotify.ts SpotifyTrack
export interface PlayerTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage: string | null;
  spotifyUrl: string;
  previewUrl: string | null;
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

export function SpotifyPlayer({ plays, nowPlaying }: Props) {
  // Stitch nowPlaying (if any) to the head, but de-dup if it already matches the most recent.
  const queue: PlayerTrack[] = useMemo(() => {
    const base = plays.map((p) => p.track);
    if (nowPlaying && base[0]?.id !== nowPlaying.id) return [nowPlaying, ...base];
    return base;
  }, [plays, nowPlaying]);

  const [idx, setIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const track = queue[idx];

  // Reset playback state when the track changes
  useEffect(() => {
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [idx]);

  // Sync volume to the audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol;
  }, [vol]);

  if (!track) return null;

  const canPreview = !!track.previewUrl;

  const togglePlay = async () => {
    if (!canPreview || !audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch {
        // autoplay blocked or fetch failed — silent fail, UI just doesn't toggle
      }
    }
  };

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

      {/* === Compact header — always visible === */}
      <div className="relative flex items-center gap-3 p-3">
        {/* play / pause */}
        <button
          onClick={togglePlay}
          disabled={!canPreview}
          aria-label={playing ? 'Pause preview' : 'Play 30-second preview'}
          className={`
            shrink-0 w-11 h-11 rounded-full flex items-center justify-center
            transition-all
            ${canPreview
              ? 'bg-primary text-bg hover:scale-105 active:scale-95'
              : 'bg-divider text-muted cursor-not-allowed'
            }
          `}
        >
          {playing ? (
            <Pause className="w-5 h-5 fill-current" strokeWidth={0} />
          ) : (
            <Play className="w-5 h-5 fill-current ml-[2px]" strokeWidth={0} />
          )}
        </button>

        {/* album thumb */}
        {track.albumImage && (
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
            aria-label={`Open ${track.name} in Spotify`}
          >
            <Image
              src={track.albumImage}
              alt={track.album}
              width={44}
              height={44}
              className="w-11 h-11 rounded-md object-cover"
              unoptimized
            />
          </a>
        )}

        {/* track meta */}
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 group"
        >
          <div className="font-serif text-base leading-tight truncate group-hover:text-rose-300 transition-colors">
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
          className="shrink-0 p-2 text-muted hover:text-primary transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
          ) : (
            <ChevronUp className="w-4 h-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* === Expanded body === */}
      <div
        className={`
          relative grid transition-[grid-template-rows] duration-300 ease-out
          ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
        `}
      >
        <div className="overflow-hidden">
          <div className="border-t border-divider p-4 space-y-4">
            {/* prev / next row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={prev}
                disabled={idx === 0}
                className="
                  py-2.5 rounded-md border border-divider
                  font-mono text-[11px] lowercase tracking-widest
                  text-muted hover:text-primary hover:border-muted
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
                  text-muted hover:text-primary hover:border-muted
                  transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                next →
              </button>
            </div>

            {/* Ferrari-red volume slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted shrink-0">
                vol
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={vol}
                onChange={(e) => setVol(parseFloat(e.target.value))}
                className="
                  flex-1 h-1 rounded-full appearance-none cursor-pointer
                  bg-divider
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(251,113,133,0.4)]
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:w-3
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-primary
                  [&::-moz-range-thumb]:border-0
                "
                style={{
                  background: `linear-gradient(to right, rgb(244 63 94) 0%, rgb(244 63 94) ${vol * 100}%, rgb(31 31 36) ${vol * 100}%, rgb(31 31 36) 100%)`,
                }}
              />
            </div>

            {/* meta row */}
            <div className="flex items-center justify-between text-[10px] font-mono lowercase tracking-wider text-muted">
              <span>
                spotify preview {canPreview ? '· 30s' : '· unavailable'} ·{' '}
                <Star className="inline w-3 h-3 -mt-0.5 fill-rose-400 text-rose-400" strokeWidth={0} />
              </span>
              <span className="tabular">
                {idx + 1}/{queue.length}
              </span>
            </div>

            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center gap-1.5
                text-[11px] font-mono lowercase tracking-widest
                text-rose-400 hover:text-rose-300 transition-colors
                border-b border-rose-400/60 hover:border-rose-300 pb-0.5 w-fit
              "
            >
              <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
              open on spotify
            </a>
          </div>
        </div>
      </div>

      {/* hidden audio element drives the actual preview playback */}
      {canPreview && (
        <audio
          ref={audioRef}
          src={track.previewUrl!}
          preload="none"
          onEnded={() => {
            setPlaying(false);
            // auto-advance to next preview when one ends
            if (idx < queue.length - 1) {
              setIdx((i) => i + 1);
              setTimeout(() => audioRef.current?.play().then(() => setPlaying(true)).catch(() => {}), 100);
            }
          }}
        />
      )}
    </div>
  );
}
