'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Pixels of travel per viewport scrolled. Positive = drifts up as you scroll down. */
  speed?: number;
  className?: string;
}

// Scroll-linked parallax. Translates the child based on its position relative
// to the viewport center, on a rAF loop. No-ops under prefers-reduced-motion.
export function Parallax({ children, speed = 40, className = '' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 (below) → 0 (centered) → 1 (above)
      const progress = (vh / 2 - (rect.top + rect.height / 2)) / vh;
      el.style.transform = `translate3d(0, ${(progress * speed).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
