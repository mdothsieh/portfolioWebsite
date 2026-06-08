import { getNowPlaying, getRecentlyPlayed } from '@/lib/spotify';
import { getPlayRecords } from '@/lib/netease';
import { ListeningCard } from './ListeningCard';
import type { PlayerEntry } from './SpotifyPlayer';

// Server component: fetches both sources in parallel, hands the data to the
// client ListeningCard which owns the Spotify / 网易云 source toggle.
export async function ListeningSection() {
  const [now, recent, netease] = await Promise.all([
    getNowPlaying(),
    getRecentlyPlayed(10),
    getPlayRecords(10),
  ]);

  const plays: PlayerEntry[] = recent.map((p) => ({
    playedAt: p.playedAt,
    track: p.track,
  }));

  const spotifyConnected = now.isPlaying || recent.length > 0;

  return (
    <ListeningCard
      spotify={{
        connected: spotifyConnected,
        nowPlaying: now.isPlaying ? now.track : undefined,
        plays,
      }}
      netease={{
        weekly: netease.weekly,
        allTime: netease.allTime,
      }}
    />
  );
}
