// Evidence-based skills inventory. Edit freely.
//
// Philosophy: no self-ratings ("strong / 8-out-of-10"). Four practical buckets
// organized by evidence instead:
//   productionReady — I'd reach for this in production today, no hesitation
//   shippedWith     — real projects shipped with it (see /projects for proof)
//   exploring       — actively building with / studying right now
//   supporting      — the everyday tooling around the core stack
//
// Each entry has a `kind` so the dashboard can color-code categories.
// Consumed by components/SkillsDashboard.tsx.

export type SkillKind = 'language' | 'framework' | 'tool' | 'domain';

export interface Skill {
  name: string;
  kind: SkillKind;
}

export const productionReady: Skill[] = [
  { name: 'React', kind: 'framework' },
  { name: 'Node.js', kind: 'framework' },
  { name: 'TypeScript', kind: 'language' },
  { name: 'JavaScript', kind: 'language' },
  { name: 'Python', kind: 'language' },
  { name: 'SQL', kind: 'tool' },
  { name: 'Git', kind: 'tool' },
];

export const shippedWith: Skill[] = [
  { name: 'Next.js', kind: 'framework' },
  { name: 'Electron', kind: 'framework' },
  { name: 'Java', kind: 'language' },
  { name: 'C++', kind: 'language' },
  { name: 'MySQL', kind: 'tool' },
  { name: 'Docker', kind: 'tool' },
  { name: 'Tailwind', kind: 'framework' },
  { name: 'JSP / Servlets', kind: 'framework' },
  { name: 'Android', kind: 'framework' },
];

export const exploring: Skill[] = [
  { name: 'LLM / Agent Workflows', kind: 'domain' },
  { name: 'Applied AI Systems', kind: 'domain' },
  { name: 'Computer Vision', kind: 'domain' },
  { name: 'Embedded Systems', kind: 'domain' },
  { name: 'System Design at Scale', kind: 'domain' },
];

export const supporting: Skill[] = [
  { name: 'UiPath RPA', kind: 'tool' },
  { name: 'Data Pipelines', kind: 'domain' },
  { name: 'API Integrations', kind: 'domain' },
  { name: 'CI/CD', kind: 'tool' },
  { name: 'Vitest', kind: 'tool' },
];
