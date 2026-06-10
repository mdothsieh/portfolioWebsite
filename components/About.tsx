// Section 02 "About" (server). Renders the bio + "currently" lists from
// data/about.ts, plus a portrait (public/me.jpg) when present — the component
// checks the filesystem at render time and degrades to text-only if the photo
// hasn't been added yet. Uses the shared <Kicker> bilingual section header.
import { existsSync } from 'fs';
import path from 'path';
import Image from 'next/image';
import { bio, currently } from '@/data/about';
import { Kicker } from './Kicker';

export function About() {
  // Drop a portrait at public/me.jpg and it appears here — no code change.
  const hasPhoto = existsSync(path.join(process.cwd(), 'public', 'me.jpg'));

  return (
    <section id="about" className="max-w-5xl mx-auto px-6 py-24">
      <Kicker cn="零二" num="02" en="About" zh="关于" />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-12 lg:gap-16">
        {/* --- Bio paragraphs --- */}
        <div className="space-y-5 max-w-2xl">
          {bio.map((para, i) => (
            <p
              key={i}
              className={`font-serif text-lg md:text-xl leading-relaxed text-primary/90 ${
                i === 0 ? 'first-letter:font-serif first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:leading-[0.85] first-letter:mt-1' : ''
              }`}
            >
              {para}
            </p>
          ))}
        </div>

        {/* --- Portrait + Currently block --- */}
        <aside className="lg:pt-3 space-y-6">
          {hasPhoto && (
            <figure className="rounded-xl border border-divider bg-surface/40 overflow-hidden">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/me.jpg"
                  alt="Martin Hsieh"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 360px, 100vw"
                />
              </div>
              <figcaption className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-muted border-t border-divider">
                Taipei ⇄ Los Angeles
              </figcaption>
            </figure>
          )}

          <div className="sticky top-24 rounded-xl border border-divider bg-surface/40 p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                Currently
              </span>
            </div>

            <dl className="space-y-4">
              {currently.map((c) => (
                <div key={c.label}>
                  <dt className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                    {c.label}
                  </dt>
                  <dd className="font-serif text-base text-primary leading-snug">
                    {c.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
