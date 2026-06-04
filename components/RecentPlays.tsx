import { getNowPlaying, getRecentlyPlayed } from '@/lib/spotify';
import { SpotifyPlayer, type PlayerEntry } from './SpotifyPlayer';

async function getFeed() {
  const [now, recent] = await Promise.all([getNowPlaying(), getRecentlyPlayed(10)]);
  return { now, recent };
}

function timeAgo(iso: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffS = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffS < 60) return `${diffS}s ago`;
  const m = Math.floor(diffS / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}

export async function RecentPlays() {
  const { now, recent } = await getFeed();

  if (!now.isPlaying && recent.length === 0) {
    return (
      <div className="bg-surface/60 border border-divider rounded-xl p-6 text-xs font-mono text-muted">
        Spotify not connected. Fill in the <code className="text-primary">SPOTIFY_*</code> env vars
        and re-run <code className="text-primary">npm run spotify:auth</code>.
      </div>
    );
  }

  const plays: PlayerEntry[] = recent.map((p) => ({
    playedAt: p.playedAt,
    track: p.track,
  }));

  // The "history" rendered below the player — skip whichever entry the player is currently focused on.
  const historyStart = now.isPlaying ? 0 : 1;
  const history = recent.slice(historyStart, historyStart + 5);

  return (
    <div className="space-y-4">
      {/* === Interactive player === */}
      <SpotifyPlayer
        plays={plays}
        nowPlaying={now.isPlaying ? now.track : undefined}
      />

      {/* === History feed below === */}
      {history.length > 0 && (
        <div className="bg-surface/40 border border-divider rounded-xl overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between border-b border-divider">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Earlier today / this week
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-green-500/80">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" aria-hidden>
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span>Live</span>
            </div>
          </div>
          <div className="divide-y divide-divider">
            {history.map((play, i) => (
              <a
                key={`${play.track.id}-${play.playedAt}-${i}`}
                href={play.track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-3 hover:bg-divider/30 transition-colors group"
              >
                {play.track.albumImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={play.track.albumImage}
                    alt=""
                    aria-hidden
                    className="w-9 h-9 rounded shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-base leading-tight truncate group-hover:text-rose-300 transition-colors">
                    {play.track.name}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-0.5 truncate">
                    {play.track.artists}
                  </div>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted shrink-0 tabular">
                  {timeAgo(play.playedAt)}
                </div>
                <span
                  aria-hidden
                  className="text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
