import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { ExperienceTimeline } from '@/components/ExperienceTimeline';
import { ClaudeUsageHeatmap } from '@/components/ClaudeUsageHeatmap';
import { ListeningSection } from '@/components/ListeningSection';
import { BoardingPass } from '@/components/BoardingPass';
import { SkillsDashboard } from '@/components/SkillsDashboard';
import { Hobbies } from '@/components/Hobbies';
import { Reveal } from '@/components/Reveal';
import { Kicker } from '@/components/Kicker';
import { getAllProjects } from '@/lib/projects';
import { getClaudeUsage } from '@/lib/claude-usage';
import { getNowPlaying } from '@/lib/spotify';

// Revalidate the homepage every 30 seconds. Fresh enough that the live feeds
// reflect new activity quickly, fast enough that recruiters get a snappy TTFB
// (the served HTML is a cached snapshot until revalidation).
export const revalidate = 30;

function usageHeadingSuffix(startDate: string, dayCount: number): string {
  if (!startDate) return '';
  if (dayCount > 365) return ', last 52 weeks';
  const d = new Date(startDate + 'T00:00:00');
  const label = d.toLocaleString('en', { month: 'long', day: 'numeric' });
  return `, since ${label}`;
}

export default async function Home() {
  const projects = getAllProjects();
  const [usage, nowPlaying] = await Promise.all([
    getClaudeUsage(),
    getNowPlaying(),
  ]);
  const suffix = usageHeadingSuffix(usage.start_date, usage.days.length);
  const todayActivity =
    usage.days.length > 0 ? usage.days[usage.days.length - 1].count : 0;

  return (
    <main>
      {/* 01 — Calibre (Watch hero) */}
      <Hero isPlaying={nowPlaying.isPlaying} todayActivity={todayActivity} />

      {/* 02 — About + Currently */}
      <Reveal><About /></Reveal>

      {/* 03 — Experience */}
      <Reveal><ExperienceTimeline /></Reveal>

      {/* Boarding-pass CV interlude */}
      <Reveal as="section" className="max-w-3xl mx-auto px-6 pb-12">
        <BoardingPass />
      </Reveal>

      {/* 04 — Builds */}
      <section id="projects" className="max-w-3xl mx-auto px-6 py-24">
        <Reveal>
          <Kicker cn="零四" num="04" en="Builds" zh="作品" />
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <h2 className="font-serif text-4xl md:text-5xl">Selected projects.</h2>
            <Link
              href="/projects"
              className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors"
            >
              all projects ↗
            </Link>
          </div>
        </Reveal>

        {projects.length === 0 ? (
          <div className="border border-dashed border-divider rounded p-8 text-center text-sm text-muted font-mono">
            No projects yet. Drop an MDX file in{' '}
            <code className="text-primary px-1">content/projects/</code>.
          </div>
        ) : (
          <ol className="space-y-10">
            {projects.slice(0, 4).map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 90}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="block group relative pl-0 hover:pl-5 transition-[padding] duration-300"
                >
                  {/* hover accent bar */}
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-rose-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                    <div className="font-serif text-2xl group-hover:text-rose-300 transition-colors">
                      {p.frontmatter.title}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                      {p.frontmatter.date}
                    </div>
                  </div>
                  <div className="text-sm text-muted mb-3">
                    {p.frontmatter.tagline}
                  </div>
                  {p.frontmatter.stack && (
                    <div className="flex gap-2 flex-wrap">
                      {p.frontmatter.stack.slice(0, 6).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-mono uppercase tracking-wider text-muted bg-surface border border-divider px-2 py-1 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </Reveal>
            ))}
          </ol>
        )}
      </section>

      {/* 05 — Stack */}
      <Reveal><SkillsDashboard /></Reveal>

      {/* 06 — Off-Hours */}
      <Reveal><Hobbies /></Reveal>

      {/* 07 — Claude usage */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <Reveal>
          <Kicker cn="零七" num="07" en="Claude usage" zh="Claude 使用" />
          <h2 className="font-serif text-4xl md:text-5xl mb-3">
            Claude usage{suffix}.
          </h2>
          <p className="text-muted mb-12 max-w-xl">
            How often Claude and I actually work together. Quiet weeks are usually travel
            or exams; spikes are hackathons and project crunches.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <ClaudeUsageHeatmap data={usage} />
        </Reveal>
      </section>

      {/* 08 — Listening */}
      <section id="listening" className="max-w-3xl mx-auto px-6 py-24">
        <Reveal>
          <Kicker cn="零八" num="08" en="Listening" zh="在听" />
          <h2 className="font-serif text-4xl md:text-5xl mb-3">
            What I&apos;m listening to.
          </h2>
          <p className="text-muted mb-12 max-w-xl">
            Two libraries, two languages. Spotify shows what&apos;s playing right now and
            the recent tail; 网易云音乐 shows my most-played tracks. Switch sources with
            the toggle.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <ListeningSection />
        </Reveal>
      </section>

      <footer className="border-t border-divider mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between gap-4 flex-wrap text-[10px] font-mono uppercase tracking-widest text-muted">
          <span>© 2026 Martin Hsieh</span>
          <span>
            Built with Next.js · Tailwind ·{' '}
            <a
              href="https://github.com/mdothsieh"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              source ↗
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}
