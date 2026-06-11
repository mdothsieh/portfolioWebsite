'use client';

import { useEffect, useRef, useState } from 'react';
import { useZhText } from './i18n';

interface Props {
  /** The text to reveal, word by word. */
  text: string;
  /** Optional 简体中文 version — shown in Chinese modes (繁體 auto-converted),
   *  revealed character by character since CJK has no word spaces. */
  zh?: string;
  /** Extra classes on the wrapper (e.g. font + size utilities). */
  className?: string;
  /** Words rendered in the signature red. Matched case-insensitively, punctuation-trimmed. */
  accentWords?: string[];
  /** Per-word stagger in ms. */
  stagger?: number;
  /** Delay before the first word starts, ms. Use to sequence the hero. */
  startDelay?: number;
  /** Fraction of the element visible before it reveals. */
  threshold?: number;
}

// Splits text into words and reveals each with a small rise + fade, staggered
// left-to-right — the Apple-keynote feel. Triggers when the element scrolls into
// view (so it fires on load for above-the-fold copy, and on scroll for the rest).
//
// SEO / accessibility safe: the full text is always present in the DOM; the
// hidden-until-animated state only applies under html.js (set in app/layout.tsx),
// so no-JS visitors see everything, and prefers-reduced-motion shows every word
// instantly (see .rt-word rules in app/globals.css). Mirrors Reveal.tsx.
export function RevealText({
  text,
  zh,
  className = '',
  accentWords = [],
  stagger = 42,
  startDelay = 0,
  threshold = 0.2,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(false);
  const resolved = useZhText(text, zh);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const accentSet = new Set(accentWords.map((w) => normalize(w)));
  // CJK text has no word spaces — reveal it character by character instead.
  const isCjk = resolved !== text && /[㐀-鿿]/.test(resolved);
  const words = isCjk
    ? Array.from(resolved)
    : resolved.split(/(\s+)/); // keep whitespace tokens so wrapping stays natural

  let wordIndex = 0;
  return (
    <span
      ref={ref}
      className={`reveal-text ${className}`.trim()}
      data-shown={shown ? 'true' : 'false'}
    >
      {words.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        const isAccent = accentSet.has(normalize(token));
        const delay = startDelay + wordIndex * stagger;
        wordIndex += 1;
        return (
          <span
            key={i}
            className={`rt-word${isAccent ? ' text-rose-400' : ''}`}
            style={{ transitionDelay: `${delay}ms` }}
          >
            {token}
          </span>
        );
      })}
    </span>
  );
}

function normalize(w: string): string {
  return w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}
