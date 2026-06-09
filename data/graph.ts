// Seed data for the Living Graph.
// Add a node: push to `nodes` with id, kind, label.
// Add an edge: push to `links` with { source, target }.
// Set `slug` on a project node to make it clickable to /projects/[slug].

export type NodeKind =
  | 'project'
  | 'skill'
  | 'experience'
  | 'award'
  | 'course'
  | 'hobby'
  | 'place';

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  slug?: string;
  weight?: number;
  meta?: Record<string, unknown>;
}

export interface GraphLink {
  source: string;
  target: string;
  kind?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const graphData: GraphData = {
  nodes: [
    // --- Experiences ---
    { id: 'flex-2026', kind: 'experience', label: 'Flex Ltd', weight: 8, meta: { period: 'Summer 2026', location: 'Suzhou', role: 'SWE Intern (incoming)' } },
    { id: 'kenmou-2025', kind: 'experience', label: 'Kenmou Enterprise', weight: 7, meta: { period: 'May–Sep 2025', location: 'Taipei' } },
    { id: 'feap-2023', kind: 'experience', label: 'Far Eastern Apparel', weight: 6, meta: { period: 'Jul–Sep 2023', location: 'Suzhou' } },
    { id: 'pulseprep', kind: 'experience', label: 'PulsePrep Academy', weight: 6, meta: { period: '2022–2024', role: 'Founder' } },
    { id: 'usc', kind: 'experience', label: 'USC CS', weight: 8, meta: { period: '2024–2028' } },

    // --- Courses ---
    { id: 'algorithms', kind: 'course', label: 'Algorithms & Theory', weight: 4 },
    { id: 'embedded', kind: 'course', label: 'Embedded Systems', weight: 4 },
    { id: 'probability', kind: 'course', label: 'Probability Theory', weight: 4 },
    { id: 'data-structures', kind: 'course', label: 'Data Structures', weight: 4 },

    // --- Projects (clickable when slug is set) ---
    { id: 'usc-fit', kind: 'project', slug: 'usc-fit', label: 'USC FIT', weight: 5, meta: { description: 'Java/JSP + MySQL — campus fitness matching' } },
    { id: 'basketball-stats', kind: 'project', label: "Coach K's Stat Console", weight: 5, meta: { description: 'Java/JavaFX + MySQL' } },

    // --- Skills ---
    { id: 'typescript', kind: 'skill', label: 'TypeScript', weight: 5 },
    { id: 'react', kind: 'skill', label: 'React', weight: 5 },
    { id: 'next', kind: 'skill', label: 'Next.js', weight: 5 },
    { id: 'node', kind: 'skill', label: 'Node.js', weight: 4 },
    { id: 'python', kind: 'skill', label: 'Python', weight: 5 },
    { id: 'cpp', kind: 'skill', label: 'C++', weight: 4 },
    { id: 'java', kind: 'skill', label: 'Java', weight: 4 },
    { id: 'docker', kind: 'skill', label: 'Docker', weight: 3 },
    { id: 'sql', kind: 'skill', label: 'SQL', weight: 4 },
    { id: 'llm', kind: 'skill', label: 'LLM / Agents', weight: 5 },
    { id: 'prompt-eng', kind: 'skill', label: 'Prompt Engineering', weight: 4 },
    { id: 'cv', kind: 'skill', label: 'Computer Vision', weight: 3 },

    // --- Hobbies ---
    { id: 'dj', kind: 'hobby', label: 'DJing', weight: 5, meta: { gear: 'Serato + Pioneer' } },
    { id: 'horology', kind: 'hobby', label: 'Horology', weight: 4 },
    { id: 'philosophy', kind: 'hobby', label: 'Philosophy', weight: 4 },
    { id: 'markets', kind: 'hobby', label: 'Markets', weight: 4 },
    { id: 'tea', kind: 'hobby', label: 'Tea Culture', weight: 5 },

    // --- Places (tea + cities) ---
    { id: 'yifang', kind: 'place', label: 'YiFang', weight: 3 },
    { id: '3cat', kind: 'place', label: '3CAT', weight: 3 },
    { id: 'cha-redefine', kind: 'place', label: 'Cha Redefine', weight: 3 },
    { id: 'la', kind: 'place', label: 'Los Angeles', weight: 5 },
    { id: 'taipei', kind: 'place', label: 'Taipei', weight: 5 },
    { id: 'suzhou', kind: 'place', label: 'Suzhou', weight: 4 },

  ],
  links: [
    // USC ↔ Courses ↔ LA
    { source: 'usc', target: 'algorithms' },
    { source: 'usc', target: 'data-structures' },
    { source: 'usc', target: 'embedded' },
    { source: 'usc', target: 'probability' },
    { source: 'usc', target: 'la' },

    // Experiences → places
    { source: 'flex-2026', target: 'suzhou' },
    { source: 'kenmou-2025', target: 'taipei' },
    { source: 'feap-2023', target: 'suzhou' },
    { source: 'pulseprep', target: 'suzhou' },

    // Experiences → skills
    { source: 'kenmou-2025', target: 'react' },
    { source: 'kenmou-2025', target: 'node' },
    { source: 'kenmou-2025', target: 'docker' },
    { source: 'feap-2023', target: 'react' },
    { source: 'feap-2023', target: 'python' },
    { source: 'feap-2023', target: 'docker' },

    // Projects → skills
    { source: 'basketball-stats', target: 'java' },
    { source: 'basketball-stats', target: 'sql' },
    { source: 'basketball-stats', target: 'algorithms' },

    // Skill clusters
    { source: 'react', target: 'next' },
    { source: 'react', target: 'typescript' },
    { source: 'next', target: 'typescript' },
    { source: 'node', target: 'typescript' },
    { source: 'llm', target: 'prompt-eng' },
    { source: 'llm', target: 'python' },
    { source: 'cv', target: 'python' },

    // Cross-disciplinary edges — the magic
    { source: 'dj', target: 'la' },
    { source: 'dj', target: 'taipei' },
    { source: 'dj', target: 'algorithms' },          // BPM matching as graph search
    { source: 'horology', target: 'embedded' },      // mechanical movement = state machine
    { source: 'philosophy', target: 'algorithms' },  // formal reasoning
    { source: 'markets', target: 'python' },
    { source: 'markets', target: 'probability' },

    // Tea graph
    { source: 'tea', target: 'yifang' },
    { source: 'tea', target: '3cat' },
    { source: 'tea', target: 'cha-redefine' },
    { source: 'yifang', target: 'la' },
    { source: 'yifang', target: 'taipei' },
    { source: '3cat', target: 'taipei' },
    { source: 'cha-redefine', target: 'la' },
    { source: 'tea', target: 'la' },
    { source: 'tea', target: 'taipei' },
  ],
};
