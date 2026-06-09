'use client';

// Client card for the listening section. Rendered by ListeningSection with
// server-fetched Spotify/NetEase data; owns the source-toggle UI between them.
import { useState } from 'react';
import Image from 'next/image';
import { SpotifyPlayer, type PlayerEntry, type PlayerTrack } from './SpotifyPlayer';
import { NeteaseTopTracks, type NeteaseTrackView } from './NeteaseTopTracks';

type Source = 'spotify' | 'netease';

interface Props {
  spotify: {
    connected: boolean;
    nowPlaying?: PlayerTrack;
    plays: PlayerEntry[];
  };
  netease: {
    weekly: NeteaseTrackView[];
    allTime: NeteaseTrackView[];
  };
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

export function ListeningCard({ spotify, netease }: Props) {
  const neteaseConnected = netease.weekly.length > 0 || netease.allTime.length > 0;
  const [source, setSource] = useState<Source>(
    spotify.connected || !neteaseConnected ? 'spotify' : 'netease',
  );

  // Spotify history rows (skip the entry the player is currently focused on)
  const spotifyHistory = spotify.plays.slice(spotify.nowPlaying ? 0 : 1, spotify.nowPlaying ? 5 : 6);

  return (
    <div className="space-y-4">
      {/* === Source switch === */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-full border border-divider bg-surface/60 p-1 backdrop-blur-sm">
          <SourceTab
            active={source === 'spotify'}
            onClick={() => setSource('spotify')}
            dotClass="bg-green-500"
            label="Spotify"
            activeClass="bg-green-500/15 text-green-300"
          />
          <SourceTab
            active={source === 'netease'}
            onClick={() => setSource('netease')}
            dotClass="bg-red-600"
            label="网易云"
            activeClass="bg-red-600/15 text-red-300"
          />
        </div>

        <span className="text-[10px] font-mono lowercase tracking-wider text-muted">
          {source === 'spotify'
            ? spotify.nowPlaying
              ? 'now playing'
              : 'recent · spotify'
            : 'top tracks · 网易云'}
        </span>
      </div>

      {/* === Spotify view === */}
      {source === 'spotify' &&
        (spotify.connected ? (
          <div className="space-y-4">
            <SpotifyPlayer plays={spotify.plays} nowPlaying={spotify.nowPlaying} />

            {spotifyHistory.length > 0 && (
              <div className="bg-surface/40 border border-divider rounded-2xl overflow-hidden">
                <div className="px-5 py-3 flex items-center justify-between border-b border-divider">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    Earlier — chronological tail
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-green-500/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>live</span>
                  </div>
                </div>
                <div className="divide-y divide-divider">
                  {spotifyHistory.map((play, i) => (
                    <a
                      key={`${play.track.id}-${play.playedAt}-${i}`}
                      href={play.track.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-3 hover:bg-divider/30 transition-colors group"
                    >
                      {play.track.albumImage && (
                        <Image
                          src={play.track.albumImage}
                          alt=""
                          aria-hidden
                          width={36}
                          height={36}
                          unoptimized
                          className="w-9 h-9 rounded shrink-0 object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-serif text-base leading-tight truncate group-hover:text-green-200 transition-colors">
                          {play.track.name}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-0.5 truncate">
                          {play.track.artists}
                        </div>
                      </div>
                      <div
                        className="text-[10px] font-mono uppercase tracking-widest text-muted shrink-0 tabular-nums"
                        suppressHydrationWarning
                      >
                        {timeAgo(play.playedAt)}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface/60 border border-divider rounded-2xl p-6 text-xs font-mono text-muted leading-relaxed">
            Spotify not connected. Fill in the{' '}
            <code className="text-green-400">SPOTIFY_*</code> env vars and re-run{' '}
            <code className="text-green-400">npm run spotify:auth</code>.
          </div>
        ))}

      {/* === NetEase view === */}
      {source === 'netease' && (
        <div className="bg-surface/40 border border-divider rounded-2xl overflow-hidden">
          <NeteaseTopTracks weekly={netease.weekly} allTime={netease.allTime} />
        </div>
      )}
    </div>
  );
}

function SourceTab({
  active,
  onClick,
  dotClass,
  label,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  dotClass: string;
  label: string;
  activeClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3.5 py-1.5 rounded-full
        text-[11px] font-mono lowercase tracking-widest transition-colors
        ${active ? activeClass : 'text-muted hover:text-primary'}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} ${active ? '' : 'opacity-50'}`} />
      {label}
    </button>
  );
}
