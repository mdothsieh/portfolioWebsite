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

// Cache the access token until shortly before it expires. Without this we hit
// Spotify's token endpoint on every server render (the token is valid ~1h), an
// avoidable network round-trip that slowed each page load.
let tokenCache: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.exp) return tokenCache.token;

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
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;
  // Refresh 60s early to avoid races against expiry.
  const ttlMs = ((json.expires_in ?? 3600) - 60) * 1000;
  tokenCache = { token: json.access_token, exp: Date.now() + ttlMs };
  return json.access_token;
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

// Short memo so the Nav + page (and rapid navigations) share one fetch instead
// of hitting Spotify on every server render. 15s is well within "now playing"
// freshness; the client SpotifyPill still polls the API route for live updates.
const NOW_TTL_MS = 15_000;
let nowCache: { at: number; data: NowPlaying } | null = null;

export async function getNowPlaying(): Promise<NowPlaying> {
  if (nowCache && Date.now() - nowCache.at < NOW_TTL_MS) return nowCache.data;

  const token = await getAccessToken();
  if (!token) return { isPlaying: false };
  const res = await fetch(NOW_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 204 || res.status >= 400) return { isPlaying: false };
  const data = await res.json();
  if (!data?.item) return { isPlaying: false };
  const result: NowPlaying = {
    isPlaying: Boolean(data.is_playing),
    track: normalizeTrack(data.item),
  };
  nowCache = { at: Date.now(), data: result };
  return result;
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
