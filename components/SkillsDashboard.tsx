import { strong, proficient, learning, type Skill } from '@/data/skills';

const KIND_DOT: Record<Skill['kind'], string> = {
  language: 'bg-rose-400',
  framework: 'bg-amber-400',
  tool: 'bg-indigo-400',
  domain: 'bg-emerald-400',
};

export function SkillsDashboard() {
  return (
    <section id="stack" className="max-w-3xl mx-auto px-6 py-24">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-6">
        05 — Stack
      </div>
      <h2 className="font-serif text-4xl md:text-5xl mb-3">The honest stack.</h2>
      <p className="text-muted mb-12 max-w-xl">
        No 10-out-of-10 expert ratings. Three buckets only — what I&apos;d reach for in
        production, what I&apos;ve shipped with, what I&apos;m actively learning.
      </p>

      <div className="space-y-10">
        <Tier
          label="Strong"
          sub="I'd reach for these in production without hesitation"
          accent="text-rose-400"
          skills={strong}
        />
        <Tier
          label="Proficient"
          sub="Shipped with these, look things up when needed"
          accent="text-primary"
          skills={proficient}
        />
        <Tier
          label="Learning"
          sub="Actively studying / using on side projects"
          accent="text-muted"
          skills={learning}
          dimmed
        />
      </div>

      {/* Legend */}
      <div className="mt-12 pt-6 border-t border-divider flex items-center justify-between flex-wrap gap-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
          Dot color = category
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted">
          {(
            [
              ['language', 'language'],
              ['framework', 'framework'],
              ['tool', 'tool'],
              ['domain', 'domain'],
            ] as const
          ).map(([kind, label]) => (
            <span key={kind} className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${KIND_DOT[kind]}`} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tier({
  label,
  sub,
  accent,
  skills,
  dimmed = false,
}: {
  label: string;
  sub: string;
  accent: string;
  skills: Skill[];
  dimmed?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
        <div className={`font-serif text-2xl ${accent}`}>{label}</div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
          {sub}
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
