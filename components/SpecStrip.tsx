import { Reveal } from './Reveal';

interface Spec {
  /** Big value. Wrap the red part in {red:'...'} via the `accent` field. */
  value: string;
  accent?: string;     // optional trailing/leading red fragment
  accentFirst?: boolean;
  label: string;
  sub: string;
  small?: boolean;     // smaller value type for multi-word values
}

// Recruiter proof strip — Apple-style spec row. Big numbers, hairline dividers,
// generous air. The first thing a fast big-tech skim lands on under the hero.
const SPECS: Spec[] = [
  { value: '03', label: 'internships shipped', sub: 'Kenmou · Far Eastern · Flex ’26' },
  { value: '+40%', accent: '+40%', accentFirst: true, label: 'throughput', sub: 'order dashboard · −35% overhead' },
  { value: 'TS · React · Next\nNode · Python', label: 'core stack', sub: '+ agentic AI frameworks', small: true },
  { value: 'Summer 2027', accent: '2027', label: 'available', sub: 'Los Angeles ⇄ Taipei', small: true },
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
                {s.label}
              </dt>
              <div className="mt-1.5 text-[10.5px] font-mono text-muted/60">
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
