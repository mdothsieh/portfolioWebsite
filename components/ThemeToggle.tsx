'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// Night / day theme switch (sun–moon icon button). Night is the site default;
// day sets document.documentElement.dataset.theme = 'day', which flips the
// --c-* channel variables in app/globals.css (Tailwind tokens resolve through
// them). Persists in localStorage ('theme'); the bootstrap script in
// app/layout.tsx restores the choice before first paint. Fires 'themechange'
// for components that adapt per theme (e.g. DecodeText). Mounted in Nav.

type Theme = 'night' | 'day';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('night');

  useEffect(() => {
    // Sync with whatever the bootstrap script applied pre-paint.
    setTheme(document.documentElement.dataset.theme === 'day' ? 'day' : 'night');
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    if (next === 'day') {
      document.documentElement.dataset.theme = 'day';
    } else {
      delete document.documentElement.dataset.theme;
    }
    localStorage.setItem('theme', next);
    window.dispatchEvent(new Event('themechange'));
  };

  const isDay = theme === 'day';

  return (
    <button
      // Derive the current theme from the DOM at click time (not React state)
      // so a click can never double-fire or act on stale state mid-hydration.
      onClick={() =>
        apply(
          document.documentElement.dataset.theme === 'day' ? 'night' : 'day',
        )
      }
      aria-label={isDay ? 'Switch to night theme' : 'Switch to day theme'}
      aria-pressed={isDay}
      title={isDay ? 'Night theme' : 'Day theme'}
      className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-divider/60 transition-colors"
    >
      {isDay ? (
        <Moon className="w-3.5 h-3.5" strokeWidth={1.75} />
      ) : (
        <Sun className="w-3.5 h-3.5" strokeWidth={1.75} />
      )}
    </button>
  );
}
