// Content-Security-Policy.
// - script/style allow 'unsafe-inline': Next.js hydration scripts and Tailwind's
//   injected styles are inline; locking these down would require a nonce-injecting
//   middleware. The other directives below still harden the app meaningfully.
// - img-src https: NetEase album art is served from rotating *.music.126.net hosts
//   and Leaflet map tiles from *.cartocdn.com; an allowlist would be brittle.
// - frame-src is scoped to the Spotify track embed (components/SpotifyPlayer.tsx).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src https://open.spotify.com https://*.spotify.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },          // Spotify album art CDN
      { protocol: 'https', hostname: 'mosaic.scdn.co' },     // Spotify mosaic playlists
      { protocol: 'https', hostname: 'image-cdn-ak.spotifycdn.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
