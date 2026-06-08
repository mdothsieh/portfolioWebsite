import Link from 'next/link';
import { TeaAtlasClient } from '@/components/TeaAtlasClient';

export const metadata = {
  title: 'Tea Atlas',
  description:
    "Martin Hsieh's interactive bubble-tea atlas — rated boba spots mapped across Los Angeles and Taipei, the two cities he moves between.",
};

export default function TeaPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-6">
        Tea Atlas
      </div>
      <h1 className="font-serif text-5xl mb-3">Where I actually drink.</h1>
      <p className="text-muted mb-12 max-w-2xl">
        Pinned across the two cities I move between. Pin color is my rating —
        rose = 9+, pink = solid, muted = situational. Hover a pin for the card;
        click a card to fly the map there.
      </p>

      <TeaAtlasClient />

      <div className="mt-16 pt-8 border-t border-divider">
        <Link
          href="/"
          className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors"
        >
          ← back home
        </Link>
        <p className="text-[10px] font-mono text-muted mt-3 leading-relaxed max-w-2xl">
          The map is{' '}
          <a
            href="https://leafletjs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-rose-300 transition-colors underline"
          >
            Leaflet
          </a>{' '}
          with{' '}
          <a
            href="https://carto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-rose-300 transition-colors underline"
          >
            CARTO
          </a>{' '}
          dark tiles over OpenStreetMap data — rendered from{' '}
          <code className="text-primary">data/tea.ts</code>. Swap the entries to
          add or replace spots.
        </p>
      </div>
    </main>
  );
}
