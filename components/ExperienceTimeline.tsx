import { experiences } from '@/data/experience';
import { Kicker } from './Kicker';
import { RevealText } from './RevealText';

export function ExperienceTimeline() {
  return (
    <section id="experience" className="max-w-3xl mx-auto px-6 py-24">
      <Kicker cn="零三" num="03" en="Experience" zh="经历" />
      <h2 className="font-serif text-4xl md:text-5xl mb-3">
        <RevealText text="Three summers, three cities." />
      </h2>
      <p className="text-muted mb-16 max-w-xl">
        Hardware-floor pragmatism in Suzhou, full-stack iteration speed in Taipei, applied-AI ambition in Los Angeles.
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
                {exp.role}{' '}
                <span className="text-muted">·</span> {exp.org}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                {exp.period}
              </div>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4">
              {exp.location}
              {exp.upcoming && <span className="ml-2 text-accent-experience">· upcoming</span>}
            </div>
            <ul className="space-y-2 text-sm text-primary/90">
              {exp.bullets.map((b, i) => (
                <li key={i} className="leading-relaxed pl-4 -indent-4">
                  <span className="text-muted">—</span> {b}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
