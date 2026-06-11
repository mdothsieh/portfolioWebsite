// Experience/timeline content (internships, founder + leadership roles).
// Consumed by components/ExperienceTimeline.tsx. Edit freely to update the
// resume timeline. Every display string carries a `_zh` Simplified-Chinese
// twin (繁體 is auto-converted at runtime — see components/i18n.tsx); proper
// nouns (company names) stay in Latin script in every language.
export interface Experience {
  id: string;
  org: string;
  role: string;
  role_zh: string;
  location: string;
  location_zh: string;
  period: string;
  period_zh: string;
  bullets: string[];
  bullets_zh: string[];
  current?: boolean;
  upcoming?: boolean;
}

export const experiences: Experience[] = [
  {
    id: 'flex-2026',
    org: 'Flex Ltd',
    role: 'SWE Intern',
    role_zh: '软件工程实习生',
    location: 'Suzhou, China',
    location_zh: '中国苏州',
    period: 'Summer 2026',
    period_zh: '2026 年夏',
    upcoming: true,
    bullets: [
      'Joining the hardware–software integration team in Suzhou. Details land here once the internship starts.',
    ],
    bullets_zh: [
      '即将加入苏州的硬件–软件集成团队。实习开始后这里会更新细节。',
    ],
  },
  {
    id: 'kenmou-2025',
    org: 'Kenmou Enterprise',
    role: 'SWE Intern',
    role_zh: '软件工程实习生',
    location: 'Taipei, Taiwan',
    location_zh: '台湾台北',
    period: 'May – Sep 2025',
    period_zh: '2025 年 5 月 – 9 月',
    bullets: [
      'Shipped a React + Node order-processing dashboard the production floor ran on daily — order throughput up 40%.',
      'Wired ArtiosCAD into the internal approval workflow so packaging prototypes stopped waiting on email chains.',
      'Authored the team’s first Docker-based CI/CD pipeline; releases went from a manual afternoon to a push.',
      'Replaced paper inspection sheets with a digital checklist. Measurable: −12% paper usage. Immeasurable: −100% lost forms.',
    ],
    bullets_zh: [
      '交付了一套 React + Node 订单处理仪表盘，生产车间每天都在用——订单吞吐量提升 40%。',
      '把 ArtiosCAD 接入内部审批流程，包装打样不再卡在邮件往来里。',
      '搭建了团队第一条基于 Docker 的 CI/CD 流水线；发布从一个手动的下午变成一次推送。',
      '用数字检查清单取代纸质检验单。可量化的：纸张用量 −12%。不可量化的：丢失的表单 −100%。',
    ],
  },
  {
    id: 'dulwich-2023',
    org: 'Dulwich College',
    role: 'Tech & Science Society Leader',
    role_zh: '科技社与科学社社长',
    location: 'Suzhou, China',
    location_zh: '中国苏州',
    period: 'Aug 2023 – Jun 2024',
    period_zh: '2023 年 8 月 – 2024 年 6 月',
    bullets: [
      'Led the school’s technology society (40+ members) — interactive lessons on coding fundamentals, hardware systems, and networking, plus hands-on workshops in programming and basic electronics.',
      'Ran the science society in parallel, growing it to 70+ active members — one of the largest student-led clubs in the school — across 50+ STEM sessions for Years 7–11.',
      'Adapted technical content for every experience level and worked with faculty advisors on session planning, participation, and lab safety.',
    ],
    bullets_zh: [
      '带领学校科技社（40+ 名成员）——围绕编程基础、硬件系统与网络概念设计互动课程，并组织编程与基础电子的动手工作坊。',
      '同时运营科学社，发展到 70+ 名活跃成员——全校最大的学生社团之一——为 7–11 年级开展了 50+ 场 STEM 课程。',
      '针对不同水平的学生调整技术内容，并与指导老师协作规划课程、提升参与度、保障实验安全。',
    ],
  },
  {
    id: 'feap-2023',
    org: 'Far Eastern Apparel',
    role: 'SWE Intern',
    role_zh: '软件工程实习生',
    location: 'Suzhou, China',
    location_zh: '中国苏州',
    period: 'Jul – Sep 2023',
    period_zh: '2023 年 7 月 – 9 月',
    bullets: [
      'Built four production tools for a 20-person team: UiPath RPA bots, a React engagement portal, an internal Android app with 300 users, and a Python data-quality pipeline.',
      'Designed the CI/CD that took deployments from a manual checklist to push-button.',
    ],
    bullets_zh: [
      '为一支 20 人团队构建了四个生产工具：UiPath RPA 机器人、React 员工互动门户、拥有 300 名用户的内部 Android 应用，以及 Python 数据质量管道。',
      '设计了 CI/CD，把部署从手动清单变成一键完成。',
    ],
  },
  {
    id: 'pulseprep',
    org: 'PulsePrep Academy',
    role: 'Founder',
    role_zh: '创始人',
    location: 'Suzhou, China',
    location_zh: '中国苏州',
    period: 'Mar 2022 – Mar 2024',
    period_zh: '2022 年 3 月 – 2024 年 3 月',
    bullets: [
      'Ran a tutoring micro-business: 200+ adaptive worksheets, 14 weekly contact hours, three IGCSE curricula, 50+ students.',
      'Average measured test-score lift of 15% within 3 months across the cohort.',
    ],
    bullets_zh: [
      '运营一家家教微型企业：200+ 份自适应练习册、每周 14 小时授课、三套 IGCSE 课程体系、50+ 名学生。',
      '三个月内学员平均测验成绩提升 15%。',
    ],
  },
];
