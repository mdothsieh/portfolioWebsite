import { WatchFace } from './WatchFace';

interface Props {
  isPlaying?: boolean;
  todayActivity?: number;
}

export function Hero({ isPlaying, todayActivity }: Props) {
  return (
    <section className="min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-8 w-full">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-6">
          01 — Calibre RM·CV-26
        </div>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] max-w-3xl">
          Computer science at USC. A skeletonized calibre, ticking through the systems
          I&apos;ve built, the work I&apos;m doing, and the things I&apos;m into.
        </h1>
        <p className="text-muted mt-6 max-w-xl text-sm">
          Tonneau case, exposed bridges. Each marker on the chapter ring is a project,
          an experience, or an interest. The subdials are live — date, today&apos;s
          Claude activity, and whether Spotify is playing. Click the crown to switch
          layers.
        </p>
      </div>
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 pb-16 flex items-center justify-center">
        <WatchFace isPlaying={isPlaying} todayActivity={todayActivity} />
      </div>
    </section>
  );
}
