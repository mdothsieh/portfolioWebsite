// Generates /sitemap.xml: static routes + one entry per project (from lib/projects).
import type { MetadataRoute } from 'next';
import { getAllProjects } from '@/lib/projects';

const SITE_URL = 'https://martinhsieh.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/now`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/tea`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((p) => {
    // Frontmatter dates are ranges like '2026-06 -> current', not parseable
    // timestamps — try the leading token and fall back to the build date.
    const parsed = new Date(p.frontmatter.date?.split(/\s*->\s*/)[0] ?? '');
    return {
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: Number.isNaN(parsed.getTime()) ? now : parsed,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...projectRoutes];
}
