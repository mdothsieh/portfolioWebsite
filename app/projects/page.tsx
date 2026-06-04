import Link from 'next/link';
import { getAllProjects } from '@/lib/projects';

export const metadata = {
  title: 'Projects · Martin Hsieh',
  description: 'Selected builds.',
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-6">
        03 — Builds
      </div>
      <h1 className="font-serif text-5xl mb-3">Selected projects.</h1>
      <p className="text-muted mb-16">
        Each entry leads with the metric that moved, then the stack, then the regret.
      </p>

      {projects.length === 0 ? (
        <div className="border border-dashed border-divider rounded p-8 text-center">
          <div className="text-sm text-muted font-mono">
            No projects yet. Drop an MDX file in <code className="text-primary px-1">content/projects/</code> to add one.
          </div>
        </div>
      ) : (
        <ol className="space-y-12">
          {projects.map(p => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`} className="block group">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                  <div className="font-serif text-3xl group-hover:text-accent-project transition-colors">
                    {p.frontmatter.title}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    {p.frontmatter.date}
                  </div>
                </div>
                <div className="text-muted mb-3">{p.frontmatter.tagline}</div>
                {p.frontmatter.stack && (
                  <div className="flex gap-2 flex-wrap">
                    {p.frontmatter.stack.map(s => (
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
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
