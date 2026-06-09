import { NextResponse } from 'next/server';

// Cache the JSON for 1 hour on Vercel's edge.
export const revalidate = 3600;

/**
 * Returns the user's last-year GitHub contribution graph as JSON.
 *
 * We proxy a public, no-auth endpoint (github-contributions-api.jogruber.de)
 * to keep this dead-simple. If you ever need finer-grained stats, swap to the
 * official GraphQL API and add a GITHUB_TOKEN env var.
 */
export async function GET() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? 'mdothsieh';

  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: 'upstream_failed', status: res.status },
        { status: 502 }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    // Log the detail server-side; don't leak internal error/network detail to the client.
    console.error('github contributions fetch failed:', e);
    return NextResponse.json({ error: 'network' }, { status: 500 });
  }
}
