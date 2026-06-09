'use client';

// Global ⌘K command palette (client). Mounted once in app/layout.tsx so it's
// available on every route; provides keyboard navigation to sections and routes.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Action {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const actions = useMemo<Action[]>(() => {
    const go = (href: string) => () => {
      setOpen(false);
      router.push(href);
    };
    const ext = (href: string) => () => {
      setOpen(false);
      window.open(href, '_blank', 'noopener,noreferrer');
    };
    return [
      { id: 'about', label: 'About', hint: 'section', keywords: 'bio intro', run: go('/#about') },
      { id: 'projects', label: 'Builds / Projects', hint: 'page', keywords: 'work portfolio', run: go('/projects') },
      { id: 'stack', label: 'Stack', hint: 'section', keywords: 'skills tools', run: go('/#stack') },
      { id: 'off-hours', label: 'Off-Hours', hint: 'section', keywords: 'hobbies', run: go('/#off-hours') },
      { id: 'listening', label: 'Listening', hint: 'section', keywords: 'spotify netease music', run: go('/#listening') },
      { id: 'now', label: '/now', hint: 'page', keywords: 'current weekly', run: go('/now') },
      { id: 'tea', label: 'Tea Atlas', hint: 'page', keywords: 'map boba', run: go('/tea') },
      { id: 'cv', label: 'Download CV', hint: 'pdf', keywords: 'resume', run: () => { setOpen(false); window.location.href = '/cv.pdf'; } },
      { id: 'email', label: 'Copy email', hint: 'mdothsieh@gmail.com', keywords: 'contact', run: () => { navigator.clipboard?.writeText('mdothsieh@gmail.com'); setOpen(false); } },
      { id: 'gh', label: 'GitHub', hint: 'external', keywords: 'code', run: ext('https://github.com/mdothsieh') },
      { id: 'li', label: 'LinkedIn', hint: 'external', keywords: 'profile', run: ext('https://www.linkedin.com/in/martin-hsieh/') },
      { id: 'top', label: 'Back to top', hint: 'scroll', keywords: 'home hero', run: () => { setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    ];
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.hint?.toLowerCase().includes(q) ||
        a.keywords?.toLowerCase().includes(q),
    );
  }, [query, actions]);

  // global hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="fixed bottom-5 right-5 z-[55] hidden md:flex items-center gap-2 rounded-full border border-divider bg-surface/80 backdrop-blur px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary hover:border-muted transition-colors"
      >
        <kbd className="font-sans">⌘</kbd>K
      </button>
    );
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[18vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" aria-hidden />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-divider bg-surface/95 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Jump to…  (sections, pages, CV, email)"
          className="w-full bg-transparent px-5 py-4 text-sm outline-none placeholder:text-muted border-b border-divider"
        />
        <ul className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <li className="px-5 py-3 text-xs font-mono text-muted">no matches</li>
          )}
          {filtered.map((a, i) => (
            <li key={a.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => a.run()}
                className={`w-full flex items-center justify-between gap-4 px-5 py-2.5 text-left transition-colors ${
                  i === active ? 'bg-rose-500/10 text-primary' : 'text-muted hover:text-primary'
                }`}
              >
                <span className="text-sm">{a.label}</span>
                {a.hint && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted shrink-0">
                    {a.hint}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="px-5 py-2.5 border-t border-divider flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
