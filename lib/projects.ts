// Server-only MDX project loader. Reads content/projects/*.mdx and parses
// frontmatter with gray-matter. getAllProjects() (drafts dropped, newest first),
// getFeaturedProjects() (recruiter-priority order via the `featured` field) and
// getProjectBySlug() back app/page.tsx, /projects, /projects/[slug], and sitemap.ts.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects');

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectFrontmatter {
  title: string;
  slug: string;
  tagline: string;
  date: string;
  stack?: string[];
  metrics?: ProjectMetric[];
  github_repo?: string;
  cover?: string;
  draft?: boolean;
  /** One-line problem statement for the mini-spec card ("Problem:" row). */
  problem?: string;
  /** "What I built" bullets for the mini-spec card. */
  built?: string[];
  /** Simplified-Chinese twins (繁體 auto-converted client-side). */
  tagline_zh?: string;
  problem_zh?: string;
  built_zh?: string[];
  /** Homepage/recruiter ordering: 1 = first. Unset projects sort after, by date. */
  featured?: number;
  /** Work project with no public repo — cards show a "proprietary" note instead of a GitHub link. */
  proprietary?: boolean;
  /** Optional live-demo URL. Only rendered when real — never fabricate. */
  demo?: string;
}

export interface Project {
  slug: string;
  frontmatter: ProjectFrontmatter;
  content: string;
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.mdx'));
  const projects: Project[] = files.map(file => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug,
      frontmatter: { ...(data as object), slug } as ProjectFrontmatter,
      content,
    };
  });
  return projects
    .filter(p => !p.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.date > b.frontmatter.date ? -1 : 1));
}

// Recruiter-priority ordering for the homepage: projects with a `featured`
// number come first (ascending), everything else follows in date order.
export function getFeaturedProjects(): Project[] {
  return [...getAllProjects()].sort((a, b) => {
    const fa = a.frontmatter.featured ?? Number.MAX_SAFE_INTEGER;
    const fb = b.frontmatter.featured ?? Number.MAX_SAFE_INTEGER;
    return fa - fb;
  });
}

export function getProjectBySlug(slug: string): Project | null {
  const filepath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) return null;
  const raw = fs.readFileSync(filepath, 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: { ...(data as object), slug } as ProjectFrontmatter,
    content,
  };
}
