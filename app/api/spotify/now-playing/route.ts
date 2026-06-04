import { NextResponse } from 'next/server';
import { getNowPlaying } from '@/lib/spotify';

export async function GET() {
  const data = await getNowPlaying();
  if (!data.isPlaying || !data.track) {
    return NextResponse.json({ isPlaying: false });
  }
  return NextResponse.json({
    isPlaying: true,
    title: data.track.name,
    artist: data.track.artists,
    album: data.track.album,
    cover: data.track.albumImage,
    url: data.track.spotifyUrl,
  });
}
