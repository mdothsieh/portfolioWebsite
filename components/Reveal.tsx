'use client';

import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms applied once the element enters the viewport. */
  delay?: number;
  /** Element tag to render. Defaults to a div. */
  as?: 'div' | 'li' | 'section' | 'span';
  /** Fraction of the element visible before it reveals. */
  threshold?: number;
}

// Lightweight IntersectionObserver reveal — no animation library.
// Visual styling lives in .reveal (app/globals.css), which also disables
// itself under prefers-reduced-motion.
export function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion: reveal immediately, skip the observer.
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

  return createElement(
    as,
    {
      ref,
      'data-reveal': '',
      'data-shown': shown ? 'true' : 'false',
      style: { transitionDelay: shown ? `${delay}ms` : '0ms' },
      className: `reveal ${className}`.trim(),
    },
    children,
  );
}
