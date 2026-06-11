// "Off-Hours" section (server) — section 02 of the /personal page (moved off
// the homepage in the recruiter-first redesign). Renders personality vignettes
// from data/hobbies.ts. Uses the shared <Kicker> + <RevealText> heading.
import { hobbies, type HobbyVignette } from '@/data/hobbies';
import { Kicker } from './Kicker';
import { RevealText } from './RevealText';
import { T } from './i18n';

export function Hobbies() {
  return (
    <section id="off-hours" className="max-w-3xl mx-auto px-6 py-24">
      <Kicker cn="零二" num="02" en="Off-Hours" zh="工余" />
      <h2 className="font-serif text-4xl md:text-5xl mb-3">
        <RevealText text="Off hours." zh="工余。" />
      </h2>
      <p className="text-muted mb-12 max-w-xl">
        <T
          en="Golf, markets, decks, and a basketball — none of it billable, all of it real."
          zh="高尔夫、市场、打碟台和一颗篮球——没有一样能开发票，每一样都是真的。"
        />
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-divider rounded-xl overflow-hidden border border-divider">
        {hobbies.map((h) => (
          <Vignette key={h.id} h={h} />
        ))}
      </div>
    </section>
  );
}

function Vignette({ h }: { h: HobbyVignette }) {
  return (
    <article className="bg-surface/60 p-7 md:p-8 group hover:bg-surface/90 transition-colors">
      <header className="flex items-baseline justify-between mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
          <T en={h.label} zh={h.label_zh} />
        </div>
        {h.romanNumeral && (
          <div
            className="font-serif text-xl text-rose-400/70 group-hover:text-rose-300 transition-colors"
            aria-hidden
          >
            {h.romanNumeral}
          </div>
        )}
      </header>

      <p className="font-serif text-base leading-relaxed text-primary/90 mb-6">
        <T en={h.body} zh={h.body_zh} />
      </p>

      <footer className="pt-4 border-t border-divider">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
          <T en={h.artifact.label} zh={h.artifact.label_zh} />
        </div>
        <div className="text-sm font-mono lowercase tracking-wider text-rose-400">
          <T en={h.artifact.value} zh={h.artifact.value_zh} />
        </div>
      </footer>
    </article>
  );
}
