// Section 01 hero (server). Headline + CTAs alongside the live <WatchFace>
// centerpiece. Receives isPlaying + todayActivity props from app/page.tsx to
// drive the watch's live registers.
import Link from 'next/link';
import { ArrowDownToLine, Mail } from 'lucide-react';
import { WatchFace } from './WatchFace';
import { Parallax } from './Parallax';
import { Aurora } from './Aurora';
import { RevealText } from './RevealText';

interface Props {
  isPlaying?: boolean;
  todayActivity?: number;
}

export function Hero({ isPlaying, todayActivity }: Props) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <Aurora />
      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full pt-32 pb-16 grid lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-10 items-center">
        {/* --- left: intro copy --- */}
        <div>
          <div
            className="hero-enter text-[10px] font-mono uppercase tracking-widest text-muted mb-6"
            style={{ animationDelay: '0ms' }}
          >
            Martin Hsieh · CS @ USC · class of 2028
          </div>

          <h1 className="font-serif text-4xl md:text-5xl leading-[1.04]">
            <RevealText
              text="I build full-stack systems and applied-AI tooling."
              accentWords={['applied-AI']}
              startDelay={120}
              stagger={34}
            />
          </h1>

          <p
            className="hero-enter text-muted mt-6 max-w-md text-sm leading-relaxed"
            style={{ animationDelay: '320ms' }}
          >
            Junior at USC, originally from Taipei. I&apos;ve shipped production
            software at two manufacturers — Kenmou in Taipei and Far Eastern in
            Suzhou — and join Flex Ltd&apos;s Suzhou facility next summer. Open to
            Summer 2027 SWE / applied-AI internships.
          </p>

          {/* CTAs */}
          <div
            className="hero-enter mt-8 flex items-center gap-3 flex-wrap"
            style={{ animationDelay: '460ms' }}
          >
            <a
              href="/cv.pdf"
              download="martin-hsieh-cv.pdf"
              className="btn-glow inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-400 text-bg text-xs font-mono uppercase tracking-widest hover:bg-rose-300 transition-colors"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" strokeWidth={2} />
              Resume
            </a>
            <a
              href="mailto:mdothsieh@gmail.com"
              className="btn-glow inline-flex items-center gap-2 px-4 py-2 rounded-full border border-divider text-muted text-xs font-mono uppercase tracking-widest hover:text-primary hover:border-muted"
            >
              <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
              Get in touch
            </a>
            <Link
              href="#projects"
              className="group text-xs font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors px-2"
            >
              see the work{' '}
              <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </Link>
          </div>
        </div>

        {/* --- right: live watch --- */}
        <div
          className="hero-enter relative w-full flex flex-col items-center lg:items-end gap-4"
          style={{ animationDelay: '600ms' }}
        >
          <Parallax speed={40} className="w-full flex items-center justify-center">
            <WatchFace isPlaying={isPlaying} todayActivity={todayActivity} />
          </Parallax>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted/60 text-center lg:text-right max-w-xs">
            The dial is live — date, today&apos;s Claude activity, a Spotify pulse.
            Press the pushers to switch layers.
          </p>
        </div>
      </div>
    </section>
  );
}
