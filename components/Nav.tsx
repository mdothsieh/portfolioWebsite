import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

// Single source of truth for your handles. Tweak these in one place.
const SOCIALS = {
  github: 'https://github.com/mdothsieh',
  linkedin: 'https://www.linkedin.com/in/martin-hsieh/',
  email: 'mailto:mdothsieh@gmail.com',
};

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-bg/70 border-b border-divider">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.2em] hover:text-muted transition-colors"
        >
          MARTIN HSIEH
        </Link>

        <div className="flex items-center gap-5">
          {/* page links */}
          <div className="hidden md:flex items-center gap-5 text-[10px] font-mono uppercase tracking-widest text-muted">
            <Link href="/#about" className="hover:text-primary transition-colors">
              about
            </Link>
            <Link href="/projects" className="hover:text-primary transition-colors">
              builds
            </Link>
            <Link href="/#stack" className="hover:text-primary transition-colors">
              stack
            </Link>
            <Link href="/#off-hours" className="hover:text-primary transition-colors">
              off-hours
            </Link>
            <a href="/cv.pdf" className="hover:text-primary transition-colors" download>
              cv
            </a>
          </div>

          <span className="hidden md:inline text-divider" aria-hidden>·</span>

          {/* social cluster — Apple-style soft pill */}
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
      </div>
    </nav>
  );
}
