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
        bg: '#08090b',       // near-black, faint cool tint
        surface: '#121419',  // graphite panel
        divider: '#20242b',  // neutral hairline border
        primary: '#f4f6f8',  // crisp off-white
        muted: '#9aa0a9',    // neutral secondary gray
        // Signature accent override: every existing `rose-*` utility across the
        // site now renders as the Corsa red ramp (Apple system red ≈ Ferrari
        // Rosso), so the whole palette flips with no per-component changes.
        rose: {
          50:  '#fff1f0',
          100: '#ffdcd9',
          200: '#ffb8b1',
          300: '#ff8079',   // light red (secondary accent)
          400: '#ff3b30',   // ★ Apple system red ≈ Ferrari Rosso — the signature
          500: '#ec2b21',
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
