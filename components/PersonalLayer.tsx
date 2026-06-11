// Homepage "Personal layer" teaser (server). The recruiter flow ends above this;
// this unnumbered section is the doorway to the personal depth — small link
// cards into /personal (listening, off-hours, telemetry anchors), /now, and
// /tea. Deliberately quiet: the personal features live on their own pages now
// instead of competing with projects and experience on the homepage.
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { T } from './i18n';

const CARDS: { href: string; title: string; title_zh: string; sub: string; sub_zh: string }[] = [
  { href: '/personal#listening', title: 'Listening', title_zh: '在听', sub: 'Spotify + 网易云音乐', sub_zh: 'Spotify + 网易云音乐' },
  { href: '/personal#off-hours', title: 'Off-hours', title_zh: '工余', sub: 'golf, markets, decks, hoops', sub_zh: '高尔夫、市场、打碟、篮球' },
  { href: '/now', title: '/now', title_zh: '/now', sub: 'what this season looks like', sub_zh: '这个季节在做什么' },
  { href: '/tea', title: 'Tea atlas', title_zh: '茶图鉴', sub: 'LA ⇄ Taipei, mapped', sub_zh: '洛杉矶 ⇄ 台北，逐家标注' },
  { href: '/personal#telemetry', title: 'Telemetry', title_zh: '遥测', sub: 'Claude usage heatmap', sub_zh: 'Claude 使用热力图' },
];

export function PersonalLayer() {
  return (
    <section id="personal" className="max-w-3xl mx-auto px-6 pb-24">
      <div className="border-t border-divider pt-10">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
          <T en="Personal layer" zh="个人层" />
        </div>
        <p className="text-sm text-muted mb-8 max-w-xl leading-relaxed">
          <T
            en="A quieter part of the site: what I'm listening to, drinking, learning, and doing outside of code. Personality is welcome; confusion is not."
            zh="这个网站安静的一面：我在听什么、喝什么、学什么，以及代码之外的生活。欢迎个性，拒绝混乱。"
          />
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-lg border border-divider bg-surface/40 p-4 hover:border-muted/60 hover:bg-surface/70 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-serif text-base">
                  <T en={c.title} zh={c.title_zh} />
                </span>
                <ArrowUpRight
                  className="w-3 h-3 text-muted group-hover:text-rose-400 transition-colors shrink-0"
                  strokeWidth={2}
                />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted/70 leading-snug">
                <T en={c.sub} zh={c.sub_zh} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
