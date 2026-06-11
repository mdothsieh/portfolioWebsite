import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      colors: {
        // ---- Corsa — Apple × Ferrari: near-black base, one red ----
        // Themeable tokens resolve through RGB-channel CSS variables defined in
        // app/globals.css (`:root` = night, `html[data-theme='day']` = day) so
        // opacity modifiers (bg-surface/40 etc.) keep working in both themes.
        bg: 'rgb(var(--c-bg) / <alpha-value>)',       // night #08090b / day #f5f5f7
        surface: 'rgb(var(--c-surface) / <alpha-value>)',  // night #121419 / day #ffffff
        divider: 'rgb(var(--c-divider) / <alpha-value>)',  // night #20242b / day #d9dce1
        primary: 'rgb(var(--c-primary) / <alpha-value>)',  // night #f4f6f8 / day #1a1c20
        muted: 'rgb(var(--c-muted) / <alpha-value>)',      // night #9aa0a9 / day #5d646e
        // Signature accent override: every existing `rose-*` utility across the
        // site now renders as the Corsa red ramp (Apple system red ≈ Ferrari
        // Rosso), so the whole palette flips with no per-component changes.
        // Only the shades actually used site-wide (300/400/500) are themeable;
        // in day they deepen for contrast on white.
        rose: {
          50:  '#fff1f0',
          100: '#ffdcd9',
          200: '#ffb8b1',
          300: 'rgb(var(--c-rose-300) / <alpha-value>)', // night #ff8079 / day #b52018
          400: 'rgb(var(--c-rose-400) / <alpha-value>)', // ★ night #ff3b30 / day #e0281c
          500: 'rgb(var(--c-rose-500) / <alpha-value>)', // night #ec2b21 / day #c81f17
          600: '#c81f17',   // deep red
          700: '#3a1411',   // dark maroon panel
          800: '#26110f',   // deeper maroon-graphite
          900: '#160b0a',
        },
        accent: {
          project: '#ff3b30',     // red — the signature
          skill: '#c2c6cc',       // neutral silver
          experience: '#ff6a5a',  // light red
          hobby: '#9aa0a9',       // muted gray
          award: '#d4af37',       // gold (kept — premium badge accent)
          place: '#8b9099',       // graphite
          course: '#d0d3d8',      // pale steel
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [typography],
};

export default config;
