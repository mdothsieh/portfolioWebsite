'use client';

import { useEffect, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>';

// Renders text that resolves from scrambled glyphs into the final string on
// mount. SSR/no-JS and reduced-motion both render the final text immediately,
// so it's SEO-safe and accessible. Day theme also skips the scramble — the
// effect belongs to the night atmosphere (calmer day mode, see globals.css).
export function DecodeText({
  text,
  className = '',
  duration = 750,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.dataset.theme === 'day') return;

    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const locked = Math.floor(p * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (i < locked || ch === ' ') out += ch;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration]);

  return <span className={className}>{display}</span>;
}
