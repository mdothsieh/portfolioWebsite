// Personality vignettes. Each entry is one short editorial line + one
// specific artifact that grounds it. The voice is deliberately self-deprecating
// and specific — real gear, real names — that's the authenticity signal.
// `_zh` fields are Simplified Chinese (繁體 auto-converted; see components/i18n.tsx).

export interface HobbyVignette {
  id: string;
  label: string;        // e.g. "Horology"
  label_zh: string;
  romanNumeral?: string; // optional decoration to match the watch theme
  body: string;          // 2-3 sentences max
  body_zh: string;
  artifact: {
    label: string;       // e.g. "Currently studying"
    label_zh: string;
    value: string;       // e.g. "Seiko 7S26 movement"
    value_zh: string;
  };
}

export const hobbies: HobbyVignette[] = [
  {
    id: 'Golf',
    label: 'Golf',
    label_zh: '高尔夫',
    romanNumeral: 'I',
    body: 'Attempting to be good',
    body_zh: '正在努力变厉害',
    artifact: {
      label: 'What is in the bag',
      label_zh: '球包里有什么',
      value: 'QI35 Driver',
      value_zh: 'QI35 一号木',
    },
  },
  {
    id: 'markets',
    label: 'Markets',
    label_zh: '市场',
    romanNumeral: 'II',
    body: 'Trying to break even',
    body_zh: '争取不亏钱',
    artifact: {
      label: 'Watching',
      label_zh: '在看',
      value: '$TSM · $NVDA · the IV term structure on $SPX',
      value_zh: '$TSM · $NVDA · $SPX 的隐含波动率期限结构',
    },
  },
  {
    id: 'djing',
    label: 'DJing',
    label_zh: '打碟',
    romanNumeral: 'III',
    body: 'Still bad — but the transitions are getting smoother',
    body_zh: '还是很菜——但过渡越来越顺了',
    artifact: {
      label: 'Setup',
      label_zh: '设备',
      value: 'Pioneer REV-1 · Serato DJ Pro',
      value_zh: 'Pioneer REV-1 · Serato DJ Pro',
    },
  },
  {
    id: 'basketball',
    label: 'Basketball',
    label_zh: '篮球',
    romanNumeral: 'IV',
    body: 'Currently training with Oliver Xu (HK national team player)',
    body_zh: '目前跟 Oliver Xu（香港代表队球员）一起训练',
    artifact: {
      label: 'Focus',
      label_zh: '重点',
      value: 'Ball-handling, shooting form, and defensive footwork.',
      value_zh: '控球、投篮姿势和防守脚步。',
    },
  },
];
