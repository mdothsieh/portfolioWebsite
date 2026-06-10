// Bio + "currently" content. Edit freely — every line here is yours to rewrite.

export const bio: string[] = [
  // Para 1 — who you are
  "I'm a rising junior at USC studying computer science. I grew up in Taipei, spent the last two summers shipping software in Taiwan and mainland China, and now spend most of my days somewhere between LA and a laptop.",

  // Para 2 — what you build
  "My instinct is to build the system, not just the screen. Last summer at Kenmou Enterprise in Taipei I wired a React + Node order-processing dashboard into the production floor — the kind of tool people stop noticing because it just runs. The summer before, at Far Eastern Apparel in Suzhou, I shipped four internal tools — RPA bots, a React engagement portal, an Android app, and a Python data pipeline — for a 20-person team. Before college I founded PulsePrep Academy, teaching 50+ middle and high schoolers across three IGCSE curricula for two years.",

  // Para 3 — what you're after
  "Joining Flex Ltd's Suzhou facility for Summer 2026 as an engineering intern. Looking for Summer 2027 roles in software engineering or applied AI — teams that ship things, measure them, and iterate. Especially drawn to agentic systems, full-stack work where the line between front and back is intentionally blurred, and infrastructure that quietly makes ten other engineers faster.",
];

export interface CurrentlyItem {
  label: string;  // e.g., "This week"
  value: string;  // e.g., "Shipping the v1 of this portfolio"
}

export const currently: CurrentlyItem[] = [
  {
    label: 'This week',
    value: 'Launching This Portfolio · Building CrateMate',
  },
  {
    label: 'This semester',
    value: 'Software Engineering · AI: Principles and Foundations · Western Music as Sounding History · Beach Volleyball · Introduction to American Popular Culture · Weight Training',
  },
  {
    label: 'Reading',
    value: 'Mostly documentation, honestly',
  },
  {
    label: 'Learning',
    value: 'Agentic frameworks · System design at scale · Making LLMs do the boring parts',
  },
];
