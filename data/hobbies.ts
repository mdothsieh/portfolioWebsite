// Personality vignettes. Each entry is one short editorial paragraph + one
// specific artifact that grounds it.
//
// PLACEHOLDERS BELOW — swap with your actual current obsessions:
//   - horology: which movement/reference are you studying right now?
//   - philosophy: which paper / thinker are you reading?
//   - markets: which platform + which strategy?
//   - djing: which controller, which sets are you spinning?

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
      'I play at USC frat Parties and Student orgs, best set was at a Club',
    artifact: {
      label: 'Setup',
      value: 'Pioneer REV-7 · Serato DJ Pro',
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
