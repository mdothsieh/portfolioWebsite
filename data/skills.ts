// Three-tier skills inventory. Edit freely.
//
// Philosophy: instead of fake 10/10 expert ratings, just three honest buckets:
//   strong     — I'd reach for this in production without hesitation
//   proficient — I've shipped with it, but I look things up
//   learning   — actively studying / using on side projects
//
// Each entry has a `kind` so we can color-code if we want later.

export type SkillKind = 'language' | 'framework' | 'tool' | 'domain';

export interface Skill {
  name: string;
  kind: SkillKind;
}

export const strong: Skill[] = [
  { name: 'React', kind: 'framework' },
  { name: 'Node.js', kind: 'framework' },
  { name: 'JavaScript', kind: 'language' },
  { name: 'Python', kind: 'language' },
  { name: 'Java', kind: 'language' },
  { name: 'SQL', kind: 'tool' },
  { name: 'Git', kind: 'tool' },
];

export const proficient: Skill[] = [
  { name: 'TypeScript', kind: 'language' },
  { name: 'Next.js', kind: 'framework' },
  { name: 'C++', kind: 'language' },
  { name: 'Docker', kind: 'tool' },
  { name: 'HTML / CSS', kind: 'framework' },
  { name: 'Full-Stack Web', kind: 'domain' },
  { name: 'Algorithms', kind: 'domain' },
  { name: 'Prompt Engineering', kind: 'domain' },
];

export const learning: Skill[] = [
  { name: 'LLM / Agent Workflows', kind: 'domain' },
  { name: 'Computer Vision', kind: 'domain' },
  { name: 'System Design at Scale', kind: 'domain' },
  { name: 'Embedded Systems', kind: 'domain' },
];
