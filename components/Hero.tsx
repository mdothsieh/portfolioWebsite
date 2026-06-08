import Link from 'next/link';
import { ArrowDownToLine, Mail } from 'lucide-react';
import { WatchFace } from './WatchFace';
import { Parallax } from './Parallax';
import { Aurora } from './Aurora';
import { DecodeText } from './DecodeText';

interface Props {
  isPlaying?: boolean;
  todayActivity?: number;
}

export function Hero({ isPlaying, todayActivity }: Props) {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <Aurora />
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-6 w-full">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-6">
          CS · USC · class of 2028 · open to Summer 2027 SWE / Applied AI
        </div>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] max-w-3xl">
          <DecodeText text="Martin Hsieh — I build full-stack systems and applied-AI tooling. Three internships shipped, joining " />
          <DecodeText text="Flex Ltd" className="text-rose-400" duration={900} />
          <DecodeText text=" for Summer 2026." duration={950} />
        </h1>

        <p className="text-muted mt-6 max-w-xl text-sm">
          USC computer science junior, originally from Taipei. The watch below is
          live — date, today&apos;s Claude activity, and Spotify pulse all from real
          feeds. Hover hour markers to inspect; click the crown to switch layers.
        </p>

        {/* CTAs */}
        <div className="mt-7 flex items-center gap-3 flex-wrap">
          <a
            href="/cv.pdf"
            download="martin-hsieh-cv.pdf"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-400 text-bg text-xs font-mono uppercase tracking-widest hover:bg-rose-300 transition-colors"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" strokeWidth={2} />
            Resume
          </a>
          <Link
            href="mailto:mdothsieh@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-divider text-muted text-xs font-mono uppercase tracking-widest hover:text-primary hover:border-muted transition-colors"
          >
            <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
            Get in touch
          </Link>
          <Link
            href="#projects"
            className="text-xs font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors px-2"
          >
            see the work ↓
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 pb-16 flex items-center justify-center">
        <Parallax speed={56} className="w-full flex items-center justify-center">
          <WatchFace isPlaying={isPlaying} todayActivity={todayActivity} />
        </Parallax>
      </div>
    </section>
  );
}
