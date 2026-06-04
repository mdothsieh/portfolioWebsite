// Server-only Spotify helpers. Used by:
//   - app/api/spotify/now-playing/route.ts (consumed by the SpotifyPill client component)
//   - components/RecentPlays.tsx (server component)
//
// Requires SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN.
// The refresh token must be issued for these scopes (see scripts/spotify-auth.mjs):
//   user-read-currently-playing user-read-recently-played

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage: string | null;
  spotifyUrl: string;
  previewUrl: string | null;
  durationMs: number;
}

export interface NowPlaying {
  isPlaying: boolean;
  track?: SpotifyTrack;
}

export interface RecentPlay {
  playedAt: string; // ISO 8601
  track: SpotifyTrack;
}

async function getAccessToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) return null;

  const basic = Buffer.from(`${id}:${secret}`).toString('base64');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh,
    }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

function normalizeTrack(t: any): SpotifyTrack {
  return {
    id: String(t?.id ?? ''),
    name: String(t?.name ?? ''),
    artists: Array.isArray(t?.artists)
      ? t.artists.map((a: { name: string }) => a.name).join(', ')
      : '',
    album: String(t?.album?.name ?? ''),
    albumImage: t?.album?.images?.[0]?.url ?? null,
    spotifyUrl: t?.external_urls?.spotify ?? '',
    previewUrl: t?.preview_url ?? null,
    durationMs: Number(t?.duration_ms ?? 0),
  };
}

export async function getNowPlaying(): Promise<NowPlaying> {
  const token = await getAccessToken();
  if (!token) return { isPlaying: false };
  const res = await fetch(NOW_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 204 || res.status >= 400) return { isPlaying: false };
  const data = await res.json();
  if (!data?.item) return { isPlaying: false };
  return { isPlaying: Boolean(data.is_playing), track: normalizeTrack(data.item) };
}

export async function getRecentlyPlayed(limit = 10): Promise<RecentPlay[]> {
  const token = await getAccessToken();
  if (!token) return [];
  const res = await fetch(`${RECENT_URL}?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.items ?? []).map((item: any) => ({
    playedAt: String(item?.played_at ?? ''),
    track: normalizeTrack(item?.track),
  }));
}
