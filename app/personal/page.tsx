// Personal layer page (/personal). The site's second layer — everything that
// used to compete with projects on the homepage now lives here: a live status
// board (components/PersonalStatus — clocks, now playing, Claude msgs),
// Listening (Spotify + NetEase via components/ListeningSection), Off-Hours
// (components/Hobbies), and the Claude-usage telemetry strip
// (components/ClaudeUsageHeatmap), plus doorway cards to /now and /tea that
// preview real content from data/now.ts and data/tea.ts.
// Server-rendered with revalidate=30 like the homepage so the live feeds stay fresh.
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ListeningSection } from '@/components/ListeningSection';
import { Hobbies } from '@/components/Hobbies';
import { ClaudeUsageHeatmap } from '@/components/ClaudeUsageHeatmap';
import { PersonalStatus } from '@/components/PersonalStatus';
import { Reveal } from '@/components/Reveal';
import { RevealText } from '@/components/RevealText';
import { Kicker } from '@/components/Kicker';
import { T } from '@/components/i18n';
import { getClaudeUsage } from '@/lib/claude-usage';
import { getNowPlaying } from '@/lib/spotify';
import { lastUpdated, nowSections } from '@/data/now';
import { teaSpots } from '@/data/tea';

export const revalidate = 30;

export const metadata = {
  // The root layout's title template appends "· Martin Hsieh".
  title: 'Personal',
  description:
    "The personal layer of Martin Hsieh's site — what he's listening to on Spotify and NetEase Cloud Music, off-hours life, Claude usage telemetry, and pointers to /now and the tea atlas.",
};

function usageHeadingSuffix(startDate: string, dayCount: number): { en: string; zh: string } {
  if (!startDate) return { en: '', zh: '' };
  if (dayCount > 365) return { en: ', last 52 weeks', zh: '，最近 52 周' };
  const d = new Date(startDate + 'T00:00:00');
  const en = d.toLocaleString('en', { month: 'long', day: 'numeric' });
  const zh = d.toLocaleString('zh-CN', { month: 'long', day: 'numeric' });
  return { en: `, since ${en}`, zh: `，自${zh}起` };
}

export default async function PersonalPage() {
  const [usage, nowPlaying] = await Promise.all([
    getClaudeUsage(),
    getNowPlaying(),
  ]);
  const suffix = usageHeadingSuffix(usage.start_date, usage.days.length);
  const todayActivity =
    usage.days.length > 0 ? usage.days[usage.days.length - 1].count : 0;
  const nowPreview = nowSections[0]?.items[0];

  return (
    <main className="pt-32 pb-24">
      {/* header */}
      <header className="max-w-3xl mx-auto px-6 mb-8">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-6">
          <T en="Personal layer" zh="个人层" />
        </div>
        <h1 className="font-serif text-5xl mb-3">
          <T en="The quieter part." zh="更安静的部分。" />
        </h1>
        <p className="text-muted max-w-xl">
          <T
            en="What I'm listening to, drinking, learning, and doing outside of code. The recruiter-facing proof lives on the "
            zh="我在听什么、喝什么、学什么，以及代码之外的生活。面向招聘方的证据在"
          />
          <Link href="/" className="text-rose-400 hover:text-rose-300 transition-colors">
            <T en="homepage" zh="主页" />
          </Link>
          <T
            en="; this page is the personality. Everything below is real and live — the only thing I fake is confidence in my golf swing."
            zh="；这一页是性格。下面的一切都是真实、实时的——我唯一假装的，是对自己高尔夫挥杆的信心。"
          />
        </p>
      </header>

      {/* status board — live clocks + now playing + today's Claude count */}
      <div className="max-w-3xl mx-auto px-6 mb-4">
        <Reveal>
          <PersonalStatus
            isPlaying={nowPlaying.isPlaying}
            trackName={nowPlaying.track?.name}
            trackUrl={nowPlaying.track?.spotifyUrl}
            todayActivity={todayActivity}
          />
        </Reveal>
      </div>

      {/* 01 — Listening (Spotify + NetEase, both kept by design) */}
      <section id="listening" className="max-w-3xl mx-auto px-6 py-16">
        <Reveal>
          <Kicker cn="零一" num="01" en="Listening" zh="在听" />
          <h2 className="font-serif text-4xl md:text-5xl mb-3">
            <RevealText text="What I'm listening to." zh="我在听什么。" />
          </h2>
          <p className="text-muted mb-12 max-w-xl">
            <T
              en="A small feed from the two music libraries I actually use: Spotify when I'm in the US, 网易云音乐 when I'm in Chinese-language music mode. Switch sources with the toggle."
              zh="来自我真正在用的两个音乐库的小信息流：在美国时用 Spotify，进入中文歌模式时用网易云音乐。用开关切换来源。"
            />
          </p>
        </Reveal>
        <Reveal delay={120}>
          <ListeningSection />
        </Reveal>
      </section>

      {/* 02 — Off-Hours */}
      <Reveal><Hobbies /></Reveal>

      {/* Telemetry — Claude usage, kept as a quiet instrument strip:
          AI fluency as evidence, not identity. */}
      <section id="telemetry" className="max-w-3xl mx-auto px-6 py-16">
        <Reveal>
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6 border-t border-divider pt-8">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted">
              <T
                en={`Telemetry · Claude usage${suffix.en}`}
                zh={`遥测 · Claude 使用情况${suffix.zh}`}
              />
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted/60">
              <T en="quiet weeks are travel or exams" zh="安静的几周不是在旅行就是在考试" />
            </span>
          </div>
          <ClaudeUsageHeatmap data={usage} />
        </Reveal>
      </section>

      {/* doorways to the rest of the personal layer */}
      <section className="max-w-3xl mx-auto px-6 pt-8">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/now"
              className="group rounded-lg border border-divider bg-surface/40 p-5 hover:border-muted/60 hover:bg-surface/70 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-serif text-xl">/now</span>
                <ArrowUpRight
                  className="w-3.5 h-3.5 text-muted group-hover:text-rose-400 transition-colors"
                  strokeWidth={2}
                />
              </div>
              {nowPreview && (
                <p className="text-xs text-muted leading-relaxed mb-2 line-clamp-2">
                  <T
                    en={`${nowSections[0].heading.toLowerCase()}: “${nowPreview}”`}
                    zh={`${nowSections[0].heading_zh}：「${nowSections[0].items_zh[0]}」`}
                  />
                </p>
              )}
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted/70">
                <T
                  en={`updated ${lastUpdated} · the rest of the season inside`}
                  zh={`更新于 ${lastUpdated} · 这一季的其余内容在里面`}
                />
              </div>
            </Link>
            <Link
              href="/tea"
              className="group rounded-lg border border-divider bg-surface/40 p-5 hover:border-muted/60 hover:bg-surface/70 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-serif text-xl">
                  <T en="Tea atlas" zh="茶图鉴" />
                </span>
                <ArrowUpRight
                  className="w-3.5 h-3.5 text-muted group-hover:text-rose-400 transition-colors"
                  strokeWidth={2}
                />
              </div>
              <p className="text-xs text-muted leading-relaxed mb-2">
                <T
                  en={`${teaSpots.length} spots rated across LA ⇄ Taipei, down to the sugar percentage.`}
                  zh={`洛杉矶 ⇄ 台北共 ${teaSpots.length} 家评分，精确到几分糖。`}
                />
              </p>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted/70">
                <T en="strong opinions, accurately mapped" zh="强烈的主观意见，精准地标在图上" />
              </div>
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
