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
    id: 'horology',
    label: 'Horology',
    romanNumeral: 'XII',
    body:
      'There is a quiet appeal in mechanical complications — escapements counting fractions of a second through two hundred tiny parts that have to agree. I service the cheap ones to learn what the expensive ones are doing.',
    artifact: {
      label: 'Currently studying',
      value: 'Seiko 7S26 movement · saving for a Grand Seiko spring drive',
    },
  },
  {
    id: 'philosophy',
    label: 'Philosophy',
    romanNumeral: 'III',
    body:
      'I reconstruct arguments in metaphysics, ethics, and epistemology whenever I need to think slowly. The discipline of finding the weakest premise in a long chain rewires how I review code, write specs, debate trades.',
    artifact: {
      label: 'On the desk',
      value: 'Parfit · Reasons and Persons',
    },
  },
  {
    id: 'markets',
    label: 'Markets',
    romanNumeral: 'VI',
    body:
      'Discretionary equities across TW50 and S&P sectors. Mostly technical — EMA crossovers, RSI divergence, volume profile. The point is not the trade; it is the practice of probabilistic thinking under real consequences.',
    artifact: {
      label: 'Watching',
      value: '$TSM · $NVDA · the IV term structure on $SPX',
    },
  },
  {
    id: 'djing',
    label: 'DJing',
    romanNumeral: 'IX',
    body:
      'Performance mixing through Serato DJ Pro on a Pioneer REV-7. Genre-agnostic — house in the first half, whatever the room asks for in the second. The rule I keep: tight transitions, no wasted bars.',
    artifact: {
      label: 'Rig',
      value: 'Pioneer REV-7 · Serato DJ Pro',
    },
  },
];
