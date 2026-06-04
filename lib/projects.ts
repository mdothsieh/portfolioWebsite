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
