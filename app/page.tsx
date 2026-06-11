// Landing page (/). The recruiter-first composition root: fetches projects
// (lib/projects), Claude usage (lib/claude-usage, for the watch's live register)
// and Spotify now-playing (lib/spotify) on the server, then lays out the
// numbered sections from components/* in proof-first order: Hero → SpecStrip →
// Work → Experience → Stack → About → resume card → Personal-layer teaser.
// Listening, Off-hours, and the Claude heatmap live on /personal now.
// revalidate=30 serves a cached snapshot while keeping live feeds fresh.
// Full section order is documented in overview.md §3.
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { ExperienceTimeline } from '@/components/ExperienceTimeline';
import { BoardingPass } from '@/components/BoardingPass';
import { SkillsDashboard } from '@/components/SkillsDashboard';
import { SpecStrip } from '@/components/SpecStrip';
import { PersonalLayer } from '@/components/PersonalLayer';
import { ProjectSpecCard } from '@/components/ProjectSpecCard';
import { Reveal } from '@/components/Reveal';
import { RevealText } from '@/components/RevealText';
import { Kicker } from '@/components/Kicker';
import { T } from '@/components/i18n';
import { getFeaturedProjects } from '@/lib/projects';
import { getClaudeUsage } from '@/lib/claude-usage';
import { getNowPlaying } from '@/lib/spotify';

// Revalidate the homepage every 30 seconds. Fresh enough that the live feeds
// reflect new activity quickly, fast enough that recruiters get a snappy TTFB
// (the served HTML is a cached snapshot until revalidation).
export const revalidate = 30;

export default async function Home() {
  const projects = getFeaturedProjects();
  const [usage, nowPlaying] = await Promise.all([
    getClaudeUsage(),
    getNowPlaying(),
  ]);
  const todayActivity =
    usage.days.length > 0 ? usage.days[usage.days.length - 1].count : 0;

  return (
    <main>
      {/* 01 — Hero (positioning + availability + CTAs) */}
      <Hero isPlaying={nowPlaying.isPlaying} todayActivity={todayActivity} />

      {/* Recruiter proof strip — scannable above-the-fold spec row */}
      <SpecStrip />

      {/* 02 — Work (featured projects, mini-spec cards) */}
      <section id="projects" className="max-w-3xl mx-auto px-6 py-24">
        <Reveal>
          <Kicker cn="零二" num="02" en="Work" zh="作品" />
          <div className="flex items-end justify-between flex-wrap gap-4 mb-3">
            <h2 className="font-serif text-4xl md:text-5xl">
              <RevealText text="Selected work." zh="精选作品。" />
            </h2>
            <Link
              href="/projects"
              className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors"
            >
              <T en="all projects ↗" zh="全部项目 ↗" />
            </Link>
          </div>
          <p className="text-muted mb-12 max-w-xl">
            <T
              en="A few systems I've built across music, manufacturing, campus life, and internal operations — each one documented as a spec: problem, what I built, stack, proof."
              zh="横跨音乐、制造、校园与内部运营的一些系统——每个项目都以规格说明的方式呈现：问题、构建内容、技术栈、佐证。"
            />
          </p>
        </Reveal>

        {projects.length === 0 ? (
          <div className="border border-dashed border-divider rounded p-8 text-center text-sm text-muted font-mono">
            No projects yet. Drop an MDX file in{' '}
            <code className="text-primary px-1">content/projects/</code>.
          </div>
        ) : (
          <ol className="space-y-8">
            {projects.slice(0, 5).map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 90}>
                <ProjectSpecCard project={p} index={i + 1} />
              </Reveal>
            ))}
          </ol>
        )}
      </section>

      {/* 03 — Experience */}
      <Reveal><ExperienceTimeline /></Reveal>

      {/* 04 — Stack */}
      <Reveal><SkillsDashboard /></Reveal>

      {/* 05 — About + Currently */}
      <Reveal><About /></Reveal>

      {/* Resume — the boarding pass, demoted to a compact download interlude */}
      <Reveal as="section" className="max-w-3xl mx-auto px-6 pb-24">
        <BoardingPass />
      </Reveal>

      {/* Personal layer — doorway to /personal, /now, /tea */}
      <Reveal><PersonalLayer /></Reveal>
    </main>
  );
}
