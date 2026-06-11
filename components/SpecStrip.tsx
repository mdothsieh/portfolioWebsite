import { Reveal } from './Reveal';
import { T } from './i18n';

interface Spec {
  /** Big value. Wrap the red part in {red:'...'} via the `accent` field. */
  value: string;
  accent?: string;     // optional trailing/leading red fragment
  accentFirst?: boolean;
  label: string;
  label_zh: string;
  sub: string;
  sub_zh: string;
  small?: boolean;     // smaller value type for multi-word values
}

// Recruiter proof strip — Apple-style spec row. Big numbers, hairline dividers,
// generous air. The first thing a fast big-tech skim lands on under the hero.
// Labels/subs are bilingual via <T>; the big values stay language-neutral.
const SPECS: Spec[] = [
  { value: '02', label: 'internships shipped', label_zh: '段实习经历', sub: 'Kenmou · Far Eastern — Flex ’26 next', sub_zh: 'Kenmou · Far Eastern — 下一站 Flex ’26' },
  { value: '+40%', accent: '+40%', accentFirst: true, label: 'throughput', label_zh: '吞吐量提升', sub: 'order dashboard, Kenmou 2025', sub_zh: '订单仪表盘，Kenmou 2025' },
  { value: 'TS · React · Next\nNode · Python', label: 'core stack', label_zh: '核心技术栈', sub: '+ agentic AI frameworks', sub_zh: '+ 智能体 AI 框架', small: true },
  { value: 'Summer 2027', accent: '2027', label: 'available', label_zh: '可实习时间', sub: 'Los Angeles ⇄ Taipei', sub_zh: '洛杉矶 ⇄ 台北', small: true },
];

function renderValue(s: Spec) {
  if (!s.accent) return s.value;
  const parts = s.value.split(s.accent);
  // value === accent (e.g. "+40%") → whole thing red
  if (parts.length === 2 && parts[0] === '' && parts[1] === '') {
    return <span className="text-rose-400">{s.accent}</span>;
  }
  return (
    <>
      {parts[0]}
      <span className="text-rose-400">{s.accent}</span>
      {parts[1]}
    </>
  );
}

export function SpecStrip() {
  return (
    <Reveal as="section" className="max-w-5xl mx-auto px-6">
      {/* gap-px over a divider-coloured background paints uniform 1px rules
          between every cell; each cell is the same height with the label block
          pinned to the bottom, so the four labels line up across the row. */}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-divider border-y border-divider">
        {SPECS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col justify-between gap-5 bg-bg px-6 py-7 md:py-8 min-h-[8.5rem]"
          >
            <dd
              className={`font-serif leading-[1.05] whitespace-pre-line ${
                s.small ? 'text-xl md:text-2xl' : 'text-4xl md:text-5xl'
              }`}
            >
              {renderValue(s)}
            </dd>
            <div>
              <dt className="text-[11px] font-mono tracking-wide text-muted">
                <T en={s.label} zh={s.label_zh} />
              </dt>
              <div className="mt-1.5 text-[10.5px] font-mono text-muted/60">
                <T en={s.sub} zh={s.sub_zh} />
              </div>
            </div>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
