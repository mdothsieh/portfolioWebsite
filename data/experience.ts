// Experience/timeline content (internships, founder roles). Consumed by
// components/ExperienceTimeline.tsx. Edit freely to update the resume timeline.
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
      'Joining the hardware–software integration team in Suzhou. Details land here once the internship starts.',
    ],
  },
  {
    id: 'kenmou-2025',
    org: 'Kenmou Enterprise',
    role: 'SWE Intern',
    location: 'Taipei, Taiwan',
    period: 'May – Sep 2025',
    bullets: [
      'Shipped a React + Node order-processing dashboard the production floor ran on daily — order throughput up 40%.',
      'Wired ArtiosCAD into the internal approval workflow so packaging prototypes stopped waiting on email chains.',
      'Authored the team’s first Docker-based CI/CD pipeline; releases went from a manual afternoon to a push.',
      'Replaced paper inspection sheets with a digital checklist. Measurable: −12% paper usage. Immeasurable: −100% lost forms.',
    ],
  },
  {
    id: 'feap-2023',
    org: 'Far Eastern Apparel',
    role: 'SWE Intern',
    location: 'Suzhou, China',
    period: 'Jul – Sep 2023',
    bullets: [
      'Built four production tools for a 20-person team: UiPath RPA bots, a React engagement portal, an internal Android app with 300 users, and a Python data-quality pipeline.',
      'Designed the CI/CD that took deployments from a manual checklist to push-button.',
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
    ],
  },
];
