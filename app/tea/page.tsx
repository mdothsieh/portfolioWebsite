import Link from 'next/link';
import { TeaAtlasClient } from '@/components/TeaAtlasClient';
import { T } from '@/components/i18n';

// The Leaflet map is client-only (ssr:false). Rendering this route on demand
// instead of statically prerendering it avoids pulling Leaflet's window-touching
// code into the build-time prerender, which crashes static generation.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tea Atlas',
  description:
    "Martin Hsieh's interactive bubble-tea atlas — rated boba spots mapped across Los Angeles and Taipei, the two cities he moves between.",
};

export default function TeaPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-6">
        <T en="Tea Atlas" zh="茶图鉴" />
      </div>
      <h1 className="font-serif text-5xl mb-3">
        <T en="Where I actually drink." zh="我真正会去喝的店。" />
      </h1>
      <p className="text-muted mb-12 max-w-2xl">
        <T
          en="Pinned across the two cities I move between. Pin color is my rating — red = 9+, light red = solid, muted = situational. Hover a pin for the card; click a card to fly the map there."
          zh="标在我往返的两座城市之间。图钉颜色是我的评分——红色 = 9 分以上，浅红 = 稳定发挥，灰色 = 看情况。悬停图钉看卡片；点卡片让地图飞过去。"
        />
      </p>

      <TeaAtlasClient />

      <div className="mt-16 pt-8 border-t border-divider">
        <Link
          href="/"
          className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors"
        >
          <T en="← back home" zh="← 回主页" />
        </Link>
        <p className="text-[10px] font-mono text-muted mt-3 leading-relaxed max-w-2xl">
          <T en="The map is " zh="地图基于 " />
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
