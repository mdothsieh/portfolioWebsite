// Sticky top navigation (server). Two stacked rows in one fixed container:
// nav links (<NavLinks>) + lang/theme toggles + socials + a persistent red
// Resume pill (/cv.pdf), then a live strip. Fetches now-playing via lib/spotify
// for the live row. Mounted in app/layout.tsx. (Replaced the retired LiveStrip.)
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { getNowPlaying } from '@/lib/spotify';
import { getClaudeUsage } from '@/lib/claude-usage';
import { NavLinks } from './NavLinks';
import { LangToggle } from './LangToggle';
import { ThemeToggle } from './ThemeToggle';
import { T } from './i18n';

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
          {/* page links (with active-section highlighting) */}
          <NavLinks />

          <span className="hidden md:inline text-divider" aria-hidden>·</span>

          <LangToggle />

          {/* utility cluster — theme switch + socials */}
          <div className="flex items-center gap-1 rounded-full bg-surface/80 border border-divider px-1.5 py-1">
            <ThemeToggle />
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

          {/* persistent resume CTA — recruiters never scroll to find it */}
          <a
            href="/cv.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono uppercase tracking-widest rounded-full border border-rose-400/50 text-rose-400 px-3 py-1.5 hover:bg-rose-400 hover:text-bg transition-colors"
          >
            <T en="Resume" zh="简历" />
          </a>
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
                <span><T en="spotify quiet" zh="spotify 安静中" /></span>
              </span>
            )}

            <span className="text-divider hidden md:inline">·</span>
            <span className="hidden md:flex items-center gap-1.5">
              <span className="text-rose-400 tabular">{todayActivity}</span>
              <span><T en="msgs today" zh="条今日消息" /></span>
            </span>

            <span className="text-divider hidden md:inline">·</span>
            <span className="hidden md:flex items-center gap-1.5">
              <span className="text-primary tabular">{totalSessions}</span>
              <span><T en="sessions" zh="次会话" /></span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
