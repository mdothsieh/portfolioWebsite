// Section 03 "Experience" (server). Vertical timeline built from
// data/experience.ts (bilingual — every string has a `_zh` twin rendered via
// the <T> i18n leaf). Uses the shared <Kicker> + <RevealText> heading.
import { experiences } from '@/data/experience';
import { Kicker } from './Kicker';
import { RevealText } from './RevealText';
import { T } from './i18n';

export function ExperienceTimeline() {
  return (
    <section id="experience" className="max-w-3xl mx-auto px-6 py-24">
      <Kicker cn="零三" num="03" en="Experience" zh="经历" />
      <h2 className="font-serif text-4xl md:text-5xl mb-3">
        <RevealText text="Three summers, three cities." zh="三个夏天，三座城市。" />
      </h2>
      <p className="text-muted mb-16 max-w-xl">
        <T
          en="Hardware-floor pragmatism in Suzhou, full-stack iteration speed in Taipei, applied-AI ambition in Los Angeles."
          zh="苏州的硬件现场实用主义，台北的全栈迭代速度，洛杉矶的应用 AI 雄心。"
        />
      </p>

      <ol className="relative border-l border-divider pl-8 space-y-14">
        {experiences.map(exp => (
          <li key={exp.id} className="relative">
            <span
              className={`absolute -left-[37px] top-2 h-3 w-3 rounded-full border-2 border-accent-experience ${
                exp.upcoming ? 'bg-bg' : 'bg-accent-experience'
              }`}
              aria-hidden
            />
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
              <div className="font-serif text-2xl leading-tight">
                <T en={exp.role} zh={exp.role_zh} />{' '}
                <span className="text-muted">·</span> {exp.org}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                <T en={exp.period} zh={exp.period_zh} />
              </div>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4">
              <T en={exp.location} zh={exp.location_zh} />
              {exp.upcoming && (
                <span className="ml-2 text-accent-experience">
                  <T en="· upcoming" zh="· 即将开始" />
                </span>
              )}
            </div>
            <ul className="space-y-2 text-sm text-primary/90">
              {exp.bullets.map((b, i) => (
                <li key={i} className="leading-relaxed pl-4 -indent-4">
                  <span className="text-muted">—</span>{' '}
                  <T en={b} zh={exp.bullets_zh[i]} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
