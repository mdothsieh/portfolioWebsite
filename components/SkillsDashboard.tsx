// Section 04 "Stack" (server). Evidence-based skill buckets from data/skills.ts
// — production-ready / shipped-with / exploring / supporting — instead of
// self-rated levels. Uses the shared <Kicker> + <RevealText> heading.
import { productionReady, shippedWith, exploring, supporting, type Skill } from '@/data/skills';
import { Kicker } from './Kicker';
import { RevealText } from './RevealText';
import { T } from './i18n';

// Corsa palette: red signature + gold + steel, kept deliberately monochrome-ish
// so the stack reads premium rather than like a rainbow legend.
const KIND_DOT: Record<Skill['kind'], string> = {
  language: 'bg-rose-400',          // signature red
  framework: 'bg-[#d4af37]',        // gold
  tool: 'bg-[#8b9099]',             // graphite steel
  domain: 'bg-rose-300',            // light red
};

export function SkillsDashboard() {
  return (
    <section id="stack" className="max-w-3xl mx-auto px-6 py-24">
      <Kicker cn="零四" num="04" en="Stack" zh="技术栈" />
      <h2 className="font-serif text-4xl md:text-5xl mb-3">
        <RevealText text="Stack." zh="技术栈。" />
      </h2>
      <p className="text-muted mb-12 max-w-xl">
        <T
          en="Organized by evidence, not self-ratings: what I'd use in production today, what real projects shipped with, and what I'm exploring now."
          zh="按证据组织，而不是自我评分：今天就敢用在生产环境的，真实项目交付过的，以及我正在探索的。"
        />
      </p>

      <div className="space-y-10">
        <Tier
          label="Production-ready"
          labelZh="生产可用"
          sub="I'd reach for these in production without hesitation"
          subZh="在生产环境里会毫不犹豫地使用"
          accent="text-rose-400"
          skills={productionReady}
        />
        <Tier
          label="Shipped with"
          labelZh="实战交付"
          sub="Real projects shipped with these — proof in /projects"
          subZh="真实项目用它们交付过——佐证见 /projects"
          accent="text-primary"
          skills={shippedWith}
        />
        <Tier
          label="Exploring"
          labelZh="探索中"
          sub="Actively building with these right now"
          subZh="现在正用它们做东西"
          accent="text-muted"
          skills={exploring}
          dimmed
        />
        <Tier
          label="Supporting"
          labelZh="辅助工具"
          sub="The everyday tooling around the core stack"
          subZh="核心技术栈周边的日常工具"
          accent="text-muted"
          skills={supporting}
          dimmed
        />
      </div>

      {/* Legend */}
      <div className="mt-12 pt-6 border-t border-divider flex items-center justify-between flex-wrap gap-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
          <T en="Dot color = category" zh="圆点颜色 = 类别" />
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted">
          {(
            [
              ['language', 'language', '语言'],
              ['framework', 'framework', '框架'],
              ['tool', 'tool', '工具'],
              ['domain', 'domain', '领域'],
            ] as const
          ).map(([kind, label, labelZh]) => (
            <span key={kind} className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${KIND_DOT[kind]}`} />
              <T en={label} zh={labelZh} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tier({
  label,
  labelZh,
  sub,
  subZh,
  accent,
  skills,
  dimmed = false,
}: {
  label: string;
  labelZh: string;
  sub: string;
  subZh: string;
  accent: string;
  skills: Skill[];
  dimmed?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
        <div className={`font-serif text-2xl ${accent}`}>
          <T en={label} zh={labelZh} />
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
          <T en={sub} zh={subZh} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s.name}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-mono lowercase tracking-wider ${
              dimmed
                ? 'border-divider bg-bg/40 text-muted'
                : 'border-divider bg-surface text-primary'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${KIND_DOT[s.kind]}`} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
