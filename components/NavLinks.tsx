'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Desktop nav links with active-section highlighting. The hash links point at
// on-page sections; as each scrolls into view its label lights up.
const LINKS: { href: string; label: string; section?: string; download?: boolean }[] = [
  { href: '/#about', label: 'about', section: 'about' },
  { href: '/projects', label: 'builds' },
  { href: '/#stack', label: 'stack', section: 'stack' },
  { href: '/#off-hours', label: 'off-hours', section: 'off-hours' },
  { href: '/#listening', label: 'listening', section: 'listening' },
  { href: '/now', label: '/now' },
  { href: '/tea', label: 'tea' },
  { href: '/cv.pdf', label: 'cv', download: true },
];

export function NavLinks() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = LINKS.map((l) => l.section).filter(Boolean) as string[];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="hidden md:flex items-center gap-5 text-[10px] font-mono uppercase tracking-widest text-muted">
      {LINKS.map((l) => {
        const isActive = Boolean(l.section && active === l.section);
        const cls = `relative transition-colors ${
          isActive ? 'text-primary' : 'hover:text-primary'
        }`;
        const underline = (
          <span
            className={`absolute -bottom-1 left-0 h-px bg-rose-400 transition-all duration-300 ${
              isActive ? 'w-full' : 'w-0'
            }`}
          />
        );

        if (l.download) {
          return (
            <a key={l.href} href={l.href} download className={cls}>
              {l.label}
              {underline}
            </a>
          );
        }
        return (
          <Link key={l.href} href={l.href} className={cls}>
            {l.label}
            {underline}
          </Link>
        );
      })}
    </div>
  );
}
