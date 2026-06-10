// Section 06 "Off-Hours" (server). Renders personality vignettes from
// data/hobbies.ts. Uses the shared <Kicker> + <RevealText> heading.
import { hobbies, type HobbyVignette } from '@/data/hobbies';
import { Kicker } from './Kicker';
import { RevealText } from './RevealText';

export function Hobbies() {
  return (
    <section id="off-hours" className="max-w-3xl mx-auto px-6 py-24">
      <Kicker cn="零六" num="06" en="Off-Hours" zh="工余" />
      <h2 className="font-serif text-4xl md:text-5xl mb-3">
        <RevealText text="Off hours." />
      </h2>
      <p className="text-muted mb-12 max-w-xl">
        Golf, markets, decks, and a basketball — none of it billable, all of it real.
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
          {h.label}
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
        {h.body}
      </p>

      <footer className="pt-4 border-t border-divider">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
          {h.artifact.label}
        </div>
        <div className="text-sm font-mono lowercase tracking-wider text-rose-400">
          {h.artifact.value}
        </div>
      </footer>
    </article>
  );
}
