// Mini-spec project card (server). Renders one project in the "product spec"
// format from the redesign brief: index / title, metrics strip (the frontmatter
// `metrics` recruiters scan for — also shown big on the case-study page),
// problem, what-I-built bullets, stack chips, and real links only (case study
// always; GitHub/demo when they exist; a "proprietary" note for work projects
// with no public code). Shows a
// cover screenshot when frontmatter.cover exists (drop a file at
// public/projects/<slug>/cover.png) and degrades to text-only when it doesn't.
// Used by app/page.tsx (02 — Work) and app/projects/page.tsx (full index).
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Lock } from 'lucide-react';
import type { Project } from '@/lib/projects';
import { T } from './i18n';

export function ProjectSpecCard({
  project,
  index,
}: {
  project: Project;
  /** 1-based position for the "01 /" spec numbering. */
  index: number;
}) {
  const { frontmatter: fm, slug } = project;
  const num = String(index).padStart(2, '0');

  return (
    <article className="group rounded-xl border border-divider bg-surface/40 overflow-hidden transition-colors hover:border-muted/60">
      {fm.cover && (
        <Link href={`/projects/${slug}`} className="block">
          <div className="relative aspect-video border-b border-divider bg-surface">
            <Image
              src={fm.cover}
              alt={`${fm.title} — screenshot`}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 672px, 100vw"
            />
          </div>
        </Link>
      )}

      <div className="p-6 md:p-8">
        {/* header — "01 / Title" + date */}
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
          <Link
            href={`/projects/${slug}`}
            className="font-serif text-2xl md:text-3xl leading-tight group-hover:text-rose-300 transition-colors"
          >
            <span className="font-mono text-sm text-muted mr-2 align-middle">
              {num} /
            </span>
            {fm.title}
          </Link>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
            {fm.date}
          </div>
        </div>

        <p className="text-sm text-muted leading-relaxed mb-5 max-w-2xl">
          <T en={fm.tagline} zh={fm.tagline_zh} />
        </p>

        {/* metrics strip — scannable label:value pairs from frontmatter */}
        {fm.metrics && fm.metrics.length > 0 && (
          <dl className="flex flex-wrap gap-x-6 gap-y-2 mb-5 text-[10px] font-mono uppercase tracking-widest">
            {fm.metrics.map((m, i) => (
              <div key={i} className="flex items-baseline gap-1.5">
                <dt className="text-muted">{m.label}</dt>
                <dd className="text-primary tabular">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* problem row */}
        {fm.problem && (
          <div className="mb-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1.5">
              <T en="Problem" zh="问题" />
            </div>
            <p className="text-sm text-primary/90 leading-relaxed max-w-2xl">
              <T en={fm.problem} zh={fm.problem_zh} />
            </p>
          </div>
        )}

        {/* what I built */}
        {fm.built && fm.built.length > 0 && (
          <div className="mb-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1.5">
              <T en="Built" zh="构建" />
            </div>
            <ul className="space-y-1.5 text-sm text-primary/90">
              {fm.built.map((b, i) => (
                <li key={i} className="leading-relaxed pl-4 -indent-4">
                  <span className="text-muted">—</span>{' '}
                  <T en={b} zh={fm.built_zh?.[i]} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* stack chips */}
        {fm.stack && (
          <div className="flex gap-2 flex-wrap mb-6">
            {fm.stack.map((s) => (
              <span
                key={s}
                className="text-[10px] font-mono uppercase tracking-wider text-muted bg-surface border border-divider px-2 py-1 rounded"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* links — only ever real ones */}
        <div className="flex items-center gap-5 flex-wrap pt-4 border-t border-divider text-[10px] font-mono uppercase tracking-widest">
          <Link
            href={`/projects/${slug}`}
            className="text-rose-400 hover:text-rose-300 transition-colors"
          >
            <T en="Case study →" zh="案例研究 →" />
          </Link>
          {fm.github_repo && (
            <a
              href={`https://github.com/${fm.github_repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-primary transition-colors"
            >
              GitHub <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </a>
          )}
          {fm.demo && (
            <a
              href={fm.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-primary transition-colors"
            >
              <T en="Demo" zh="演示" /> <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </a>
          )}
          {fm.proprietary && (
            <span className="inline-flex items-center gap-1.5 text-muted/70">
              <Lock className="w-3 h-3" strokeWidth={1.75} />
              <T en="proprietary · no public code" zh="专有项目 · 代码不公开" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
