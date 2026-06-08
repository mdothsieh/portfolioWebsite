'use client';

import dynamic from 'next/dynamic';

// Leaflet touches `window` at import time, which crashes the server prerender.
// Loading TeaAtlas with ssr:false keeps it strictly client-side. This wrapper
// is a Client Component because `ssr: false` isn't allowed from a Server one.
const TeaAtlas = dynamic(
  () => import('./TeaAtlas').then((m) => m.TeaAtlas),
  {
    ssr: false,
    loading: () => (
      <div className="h-[60vh] rounded-lg border border-divider bg-surface/50 animate-pulse" />
    ),
  },
);

export function TeaAtlasClient() {
  return <TeaAtlas />;
}
