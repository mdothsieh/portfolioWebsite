export interface Experience {
  id: string;
  org: string;
  role: string;
  location: string;
  period: string;
  bullets: string[];
  current?: boolean;
  upcoming?: boolean;
}

export const experiences: Experience[] = [
  {
    id: 'flex-2026',
    org: 'Flex Ltd',
    role: 'SWE Intern (incoming)',
    location: 'Suzhou, China',
    period: 'Summer 2026',
    upcoming: true,
    bullets: [
      'Joining the hardware–software integration team. This section gets rewritten in real time from the factory floor.',
    ],
  },
  {
    id: 'kenmou-2025',
    org: 'Kenmou Enterprise',
    role: 'SWE Intern',
    location: 'Taipei, Taiwan',
    period: 'May – Sep 2025',
    bullets: [
      'Shipped a React + Node order-processing dashboard. Throughput +40%, cross-team coordination overhead −35%.',
      'Wired ArtiosCAD into the internal approval workflow. Prototype turnaround −30%, design-stage error rate −25%.',
      'Authored Docker-based CI/CD. Release cycles shortened 40%.',
      'Replaced paper inspection sheets with a digital checklist. Measurable −12% paper usage; immeasurable −100% lost forms.',
    ],
  },
  {
    id: 'feap-2023',
    org: 'Far Eastern Apparel',
    role: 'SWE Intern',
    location: 'Suzhou, China',
    period: 'Jul – Sep 2023',
    bullets: [
      'Built four production tools across a 20-person team: UiPath RPA bots (−20% workflow time), React engagement portal (+25% WAU), internal Android app (300 users), Python data-quality pipeline (−35% errors).',
      'Designed the CI/CD that dropped deployment cycles 40% and manual ops 60%.',
    ],
  },
  {
    id: 'pulseprep',
    org: 'PulsePrep Academy',
    role: 'Founder',
    location: 'Suzhou, China',
    period: 'Mar 2022 – Mar 2024',
    bullets: [
      'Ran a tutoring micro-business: 200+ adaptive worksheets, 14 weekly contact hours, three IGCSE curricula, 50+ students.',
      'Average measured test-score lift of 15% within 3 months across the cohort.',
      'Where I learned that pedagogy and API design are the same skill — both reduce cognitive load at the boundary.',
    ],
  },
];
