// /now page — "what I'm doing now" (Derek Sivers convention).
// Pure content render from data/now.ts (nowSections + lastUpdated).
import Link from 'next/link';
import { lastUpdated, nowSections } from '@/data/now';
import { T } from '@/components/i18n';

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
      <h1 className="font-serif text-5xl mb-3">
        <T en="What I'm doing right now." zh="我现在在做什么。" />
      </h1>
      <p className="text-muted mb-2">
        <T
          en="A snapshot. Updated when the snapshot stops being true."
          zh="一张快照。当它不再真实的时候就会更新。"
        />
      </p>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-12">
        <T en="Last updated" zh="最近更新" /> · {updated}
      </p>

      <div className="space-y-10">
        {nowSections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-rose-400 mb-3">
              <T en={s.heading} zh={s.heading_zh} />
            </h2>
            <ul className="space-y-2 text-primary/90">
              {s.items.map((item, i) => (
                <li key={i} className="leading-relaxed pl-4 -indent-4">
                  <span className="text-muted">—</span>{' '}
                  <T en={item} zh={s.items_zh[i]} />
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
          <T en="← back home" zh="← 回主页" />
        </Link>
        <p className="text-[10px] font-mono text-muted mt-4 leading-relaxed">
          <T en="This is a " zh="这是一个 " />
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-rose-300 transition-colors underline"
          >
            /now page
          </a>
          {' '}
          <T
            en="— Derek Sivers' convention for showing what someone is actually working on without scrolling LinkedIn or guessing."
            zh="——Derek Sivers 提出的惯例：直接展示一个人真正在做的事，不用翻 LinkedIn，也不用猜。"
          />
        </p>
      </div>
    </main>
  );
}
