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
        // ---- Aston Martin F1 — dark racing-green base ----
        bg: '#08160f',       // near-black, deep racing-green tint
        surface: '#0e2219',  // dark green panel
        divider: '#1b3a2c',  // green-tinted border
        primary: '#eaf2ee',  // soft off-white
        muted: '#7f978b',    // sage muted
        // Signature accent override: every existing `rose-*` utility across the
        // site now renders as the Aston Martin lime → racing-green ramp, so the
        // whole palette flips to AM colors without touching each component.
        rose: {
          50:  '#f6fbd5',
          100: '#ecf4a8',
          200: '#e0ee72',
          300: '#d4e84a',   // light lime (secondary accent)
          400: '#cedc00',   // ★ Aston Martin lime — the signature
          500: '#b4c200',
          600: '#93a300',   // deep olive-lime
          700: '#0d6d57',   // racing green
          800: '#0c3a2e',   // deep racing green
          900: '#08231b',
        },
        accent: {
          project: '#cedc00',     // lime
          skill: '#21b6a8',       // teal
          experience: '#34d399',  // emerald
          hobby: '#7fb800',       // yellow-green
          award: '#d4af37',       // gold (AM badge accent)
          place: '#5bc8e0',       // sky-teal
          course: '#3ddc97',      // mint
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
