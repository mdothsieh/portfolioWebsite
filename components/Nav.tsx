import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { getNowPlaying } from '@/lib/spotify';
import { getClaudeUsage } from '@/lib/claude-usage';

const SOCIALS = {
  github: 'https://github.com/mdothsieh',
  linkedin: 'https://www.linkedin.com/in/martin-hsieh/',
  email: 'mailto:mdothsieh@gmail.com',
};

export async function Nav() {
  // Fetched here (not in page.tsx) so the LiveStrip row below is always
  // glued to the nav row — no fragile pixel positioning across components.
  const [usage, nowPlaying] = await Promise.all([
    getClaudeUsage(),
    getNowPlaying(),
  ]);

  const todayActivity =
    usage.days.length > 0 ? usage.days[usage.days.length - 1].count : 0;
  const totalSessions = usage.stats.sessions;
  const today = new Date().toLocaleString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-bg/75 border-b border-divider">
      {/* ============ Row 1 — wordmark + links + socials ============ */}
      <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.2em] hover:text-muted transition-colors"
        >
          MARTIN HSIEH
        </Link>

        <div className="flex items-center gap-5">
          {/* page links */}
          <div className="hidden md:flex items-center gap-5 text-[10px] font-mono uppercase tracking-widest text-muted">
            <Link href="/#about" className="hover:text-primary transition-colors">about</Link>
            <Link href="/projects" className="hover:text-primary transition-colors">builds</Link>
            <Link href="/#stack" className="hover:text-primary transition-colors">stack</Link>
            <Link href="/#off-hours" className="hover:text-primary transition-colors">off-hours</Link>
            <Link href="/now" className="hover:text-primary transition-colors">/now</Link>
            <Link href="/tea" className="hover:text-primary transition-colors">tea</Link>
            <a href="/cv.pdf" className="hover:text-primary transition-colors" download>cv</a>
          </div>

          <span className="hidden md:inline text-divider" aria-hidden>·</span>

          {/* social cluster */}
          <div className="flex items-center gap-1 rounded-full bg-surface/80 border border-divider px-1.5 py-1">
            <a
              href={SOCIALS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-divider/60 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" strokeWidth={1.75} />
            </a>
            <a
              href={SOCIALS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-divider/60 transition-colors"
            >
              <Github className="w-3.5 h-3.5" strokeWidth={1.75} />
            </a>
            <a
              href={SOCIALS.email}
              aria-label="Email"
              className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-divider/60 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </nav>

      {/* ============ Row 2 — live strip ============ */}
      <div className="border-t border-divider/60">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest text-muted">
          {/* left — date + locale */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-primary tabular shrink-0">{today}</span>
            <span className="text-divider hidden sm:inline">·</span>
            <span className="hidden sm:inline tabular">LAX ↔ TPE</span>
          </div>

          {/* right — live signals */}
          <div className="flex items-center gap-3 min-w-0">
            {nowPlaying.isPlaying && nowPlaying.track ? (
              <a
                href={nowPlaying.track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors min-w-0"
                title={nowPlaying.track.name}
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <span className="hidden md:inline truncate max-w-[160px] normal-case font-sans tracking-normal">
                  {nowPlaying.track.name}
                </span>
                <span className="md:hidden">live</span>
              </a>
            ) : (
              <span className="flex items-center gap-1.5 opacity-60">
                <span className="h-1.5 w-1.5 rounded-full bg-divider" />
                <span>spotify quiet</span>
              </span>
            )}

            <span className="text-divider hidden md:inline">·</span>
            <span className="hidden md:flex items-center gap-1.5">
              <span className="text-rose-400 tabular">{todayActivity}</span>
              <span>msgs today</span>
            </span>

            <span className="text-divider hidden md:inline">·</span>
            <span className="hidden md:flex items-center gap-1.5">
              <span className="text-primary tabular">{totalSessions}</span>
              <span>sessions</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
