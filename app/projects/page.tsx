// Projects index (/projects). Lists every project from lib/projects
// getFeaturedProjects() (recruiter-priority order, drafts dropped) as
// mini-spec cards (components/ProjectSpecCard). Each entry links to /projects/[slug].
import { getFeaturedProjects } from '@/lib/projects';
import { ProjectSpecCard } from '@/components/ProjectSpecCard';
import { T } from '@/components/i18n';

export const metadata = {
  // The root layout's title template appends "· Martin Hsieh".
  title: 'Projects',
  description:
    'Software projects by Martin Hsieh — full-stack systems, applied-AI tooling, internal dashboards, and production software, each documented as a mini spec: problem, what was built, stack, and proof.',
};

export default function ProjectsPage() {
  const projects = getFeaturedProjects();

  return (
    <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-6">
        <T en="Work — all projects" zh="作品 — 全部项目" />
      </div>
      <h1 className="font-serif text-5xl mb-3">
        <T en="Projects." zh="项目。" />
      </h1>
      <p className="text-muted mb-16 max-w-xl">
        <T
          en="Every project documented the same way: the problem, what I built, the stack, and where the proof lives. Work projects without public code say so."
          zh="每个项目都用同一种方式记录：问题、构建内容、技术栈，以及佐证在哪里。没有公开代码的工作项目会如实标注。"
        />
      </p>

      {projects.length === 0 ? (
        <div className="border border-dashed border-divider rounded p-8 text-center">
          <div className="text-sm text-muted font-mono">
            No projects yet. Drop an MDX file in <code className="text-primary px-1">content/projects/</code> to add one.
          </div>
        </div>
      ) : (
        <ol className="space-y-10">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <ProjectSpecCard project={p} index={i + 1} />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
