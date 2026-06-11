// Bio + "currently" content. Edit freely — every line here is yours to rewrite.
// `bio` / `bio_zh` are parallel arrays (same paragraph order); `_zh` values are
// Simplified Chinese — 繁體 is auto-converted at runtime (components/i18n.tsx).

export const bio: string[] = [
  // Para 1 — who you are
  "I'm a rising junior at USC studying computer science. I grew up in Taipei, spent the last two summers shipping software in Taiwan and mainland China, and now spend most of my days somewhere between LA and a laptop.",

  // Para 2 — what you build
  "My instinct is to build the system, not just the screen. At Kenmou Enterprise in Taipei I wired a React + Node order-processing dashboard into the production floor — the kind of tool people stop noticing because it just runs. At Far Eastern Apparel in Suzhou, I shipped four internal tools — RPA bots, a React engagement portal, an Android app, and a Python data pipeline — for a 20-person team. Those environments shaped how I think about software: it has to be reliable, understandable, and useful to people who are not engineers. Before college I founded PulsePrep Academy, teaching 50+ students across three IGCSE curricula for two years.",

  // Para 3 — what you're after
  "Joining Flex Ltd's Suzhou facility for Summer 2026 as an engineering intern. Looking for Summer 2027 roles in software engineering or applied AI — teams that ship things, measure them, and iterate. Especially drawn to agentic systems, full-stack work where the line between front and back is intentionally blurred, and infrastructure that quietly makes ten other engineers faster.",
];

export const bio_zh: string[] = [
  '我是南加州大学（USC）计算机科学专业的大三学生。在台北长大，过去两个夏天在台湾和中国大陆做软件，如今大部分时间在洛杉矶和一台笔记本电脑之间度过。',

  '我的本能是构建整个系统，而不只是界面。在台北的 Kenmou Enterprise，我把一套 React + Node 订单处理仪表盘接入了生产车间——那种好用到没人再注意它的工具。在苏州的 Far Eastern Apparel，我为一支 20 人团队交付了四个内部工具——RPA 机器人、React 互动门户、Android 应用和 Python 数据管道。这些环境塑造了我对软件的理解：它必须可靠、易懂，并且对非工程师同样有用。大学之前，我创办了 PulsePrep Academy，用两年时间教了 50+ 名学生、横跨三套 IGCSE 课程体系。',

  '2026 年夏天将以工程实习生身份加入 Flex 苏州园区。正在寻找 2027 年夏季的软件工程或应用 AI 实习——那种把东西做出来、量化它、再迭代的团队。尤其喜欢智能体系统、前后端边界刻意模糊的全栈工作，以及能默默让另外十个工程师更快的基础设施。',
];

export interface CurrentlyItem {
  label: string;  // e.g., "This week"
  label_zh: string;
  value: string;  // e.g., "Shipping the v1 of this portfolio"
  value_zh: string;
}

export const currently: CurrentlyItem[] = [
  {
    label: 'This week',
    label_zh: '本周',
    value: 'Launching This Portfolio · Building CrateMate',
    value_zh: '上线这个作品集 · 开发 CrateMate',
  },
  {
    label: 'This semester',
    label_zh: '本学期',
    value: 'Software Engineering · AI: Principles and Foundations · Western Music as Sounding History · Beach Volleyball · Introduction to American Popular Culture · Weight Training',
    value_zh: '软件工程 · AI：原理与基础 · 西方音乐与声音中的历史 · 沙滩排球 · 美国流行文化导论 · 力量训练',
  },
  {
    label: 'Reading',
    label_zh: '在读',
    value: 'Mostly documentation, honestly',
    value_zh: '说实话，主要是技术文档',
  },
  {
    label: 'Learning',
    label_zh: '在学',
    value: 'Agentic frameworks · System design at scale · Making LLMs do the boring parts',
    value_zh: '智能体框架 · 大规模系统设计 · 让 LLM 去干无聊的部分',
  },
];
