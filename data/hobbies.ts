// Personality vignettes. Each entry is one short editorial line + one
// specific artifact that grounds it. The voice is deliberately self-deprecating
// and specific — real gear, real names — that's the authenticity signal.

export interface HobbyVignette {
  id: string;
  label: string;        // e.g. "Horology"
  romanNumeral?: string; // optional decoration to match the watch theme
  body: string;          // 2-3 sentences max
  artifact: {
    label: string;       // e.g. "Currently studying"
    value: string;       // e.g. "Seiko 7S26 movement"
  };
}

export const hobbies: HobbyVignette[] = [
  {
    id: 'Golf',
    label: 'Golf',
    romanNumeral: 'I',
    body:
      'Attempting to be good',
    artifact: {
      label: 'What is in the bag',
      value: 'QI35 Driver',
    },
  },
  {
    id: 'markets',
    label: 'Markets',
    romanNumeral: 'II',
    body:
      'Trying to break even',
    artifact: {
      label: 'Watching',
      value: '$TSM · $NVDA · the IV term structure on $SPX',
    },
  },
  {
    id: 'djing',
    label: 'DJing',
    romanNumeral: 'III',
    body:
      'Still bad — but the transitions are getting smoother',
    artifact: {
      label: 'Setup',
      value: 'Pioneer REV-1 · Serato DJ Pro',
    },
  },

  {
    id:'basketball',
    label: 'Basketball',
    romanNumeral: 'IV',
    body:
      'Currently training with Oliver Xu (HK national team player)',
    artifact: {
      label: 'Focus',
      value: 'Ball-handling, shooting form, and defensive footwork.',
    },
  }
];
