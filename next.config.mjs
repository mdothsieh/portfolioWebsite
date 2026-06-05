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
};

export default nextConfig;
