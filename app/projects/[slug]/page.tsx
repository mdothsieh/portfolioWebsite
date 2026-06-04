import { MDXRemote } from 'next-mdx-remote/rsc';
import { getProjectBySlug, getAllProjects } from '@/lib/projects';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
  return getAllProjects().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.frontmatter.title} · Martin Hsieh`,
    description: project.frontmatter.tagline,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { frontmatter, content } = project;

  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">
      <Link
        href="/projects"
        className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors"
      >
        ← Projects
      </Link>

      <header className="mt-8 mb-10">
        <h1 className="font-serif text-5xl leading-[1.05] mb-3">{frontmatter.title}</h1>
        <p className="text-xl text-muted leading-snug">{frontmatter.tagline}</p>
      </header>

      {frontmatter.metrics && frontmatter.metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {frontmatter.metrics.map((m, i) => (
            <div key={i} className="bg-surface border border-divider rounded p-4">
              <div className="font-serif text-2xl tabular leading-none">{m.value}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-2 leading-tight">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-10">
        {frontmatter.stack?.map(s => (
          <span
            key={s}
            className="text-[10px] font-mono uppercase tracking-wider text-muted bg-surface border border-divider px-2 py-1 rounded"
          >
            {s}
          </span>
        ))}
      </div>

      {frontmatter.github_repo && (
        <a
          href={`https://github.com/${frontmatter.github_repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors mb-12"
        >
          github.com/{frontmatter.github_repo} ↗
        </a>
      )}

      <article
        className="
          prose prose-invert prose-lg max-w-none
          prose-headings:font-serif prose-headings:font-normal
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8
          prose-p:text-primary/90 prose-p:leading-relaxed
          prose-a:text-accent-project prose-a:no-underline hover:prose-a:underline
          prose-code:text-accent-skill prose-code:bg-surface prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-surface prose-pre:border prose-pre:border-divider
          prose-blockquote:border-l-accent-project prose-blockquote:text-muted prose-blockquote:not-italic
          prose-strong:text-primary
        "
      >
        <MDXRemote source={content} />
      </article>
    </main>
  );
}
