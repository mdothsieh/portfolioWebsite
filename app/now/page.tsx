// /now page — "what I'm doing now" (Derek Sivers convention).
// Pure content render from data/now.ts (nowSections + lastUpdated).
import Link from 'next/link';
import { lastUpdated, nowSections } from '@/data/now';

export const metadata = {
  title: '/now',
  description:
    'A /now page from Martin Hsieh — what he is actually working on, studying, and reading this week, kept current instead of curated.',
};

export default function NowPage() {
  const updated = new Date(lastUpdated + 'T00:00:00').toLocaleString('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-6">
        / now
      </div>
      <h1 className="font-serif text-5xl mb-3">What I&apos;m doing right now.</h1>
      <p className="text-muted mb-2">
        A snapshot. Updated when the snapshot stops being true.
      </p>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-12">
        Last updated · {updated}
      </p>

      <div className="space-y-10">
        {nowSections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-rose-400 mb-3">
              {s.heading}
            </h2>
            <ul className="space-y-2 text-primary/90">
              {s.items.map((item, i) => (
                <li key={i} className="leading-relaxed pl-4 -indent-4">
                  <span className="text-muted">—</span> {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-divider">
        <Link
          href="/"
          className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors"
        >
          ← back home
        </Link>
        <p className="text-[10px] font-mono text-muted mt-4 leading-relaxed">
          This is a{' '}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-rose-300 transition-colors underline"
          >
            /now page
          </a>
          {' '}— Derek Sivers&apos; convention for showing what someone is
          actually working on without scrolling LinkedIn or guessing.
        </p>
      </div>
    </main>
  );
}
