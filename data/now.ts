// What I'm currently doing. Edit freely.
// Pattern stolen from Derek Sivers' /now page convention.
// `heading_zh` / `items_zh` are Simplified Chinese twins (繁體 auto-converted;
// see components/i18n.tsx). Keep the arrays parallel.

export const lastUpdated = '2026-05-29';

export const nowSections: {
  heading: string;
  heading_zh: string;
  items: string[];
  items_zh: string[];
}[] = [
  {
    heading: 'This week',
    heading_zh: '本周',
    items: [
      'Polishing public portfolio.',
      'Prepping for Flex Ltd onboarding in Suzhou — Summer 2026 internship starts soon.',
    ],
    items_zh: [
      '打磨公开的作品集。',
      '为 Flex 苏州的入职做准备——2026 年夏季实习马上开始。',
    ],
  },
  {
    heading: 'This semester',
    heading_zh: '本学期',
    items: [
      'Algorithms & Theory of Computing',
      'Embedded Systems',
      'Probability Theory',
      'Independent reading on agentic frameworks',
    ],
    items_zh: [
      '算法与计算理论',
      '嵌入式系统',
      '概率论',
      '智能体框架的自主阅读',
    ],
  },
  {
    heading: 'Building',
    heading_zh: '在做',
    items: [
      'Internal tooling for the Flex Ltd manufacturing-software bridge (pre-internship).',
      'Side experiments with multi-step agent workflows + tool-use APIs.',
    ],
    items_zh: [
      'Flex 制造软件桥接的内部工具（实习前预热）。',
      '多步智能体工作流 + 工具调用 API 的业余实验。',
    ],
  },
  {
    heading: 'Listening to',
    heading_zh: '在听',
    items: [
      'Whatever shows up in the section below — pulled live from Spotify.',
    ],
    items_zh: [
      '下面那个版块里出现的任何东西——从 Spotify 实时拉取。',
    ],
  },
  {
    heading: 'Not doing',
    heading_zh: '不做',
    items: [
      'Twitter. Anything in crypto.',
    ],
    items_zh: [
      '推特。任何加密货币相关的事。',
    ],
  },
];
