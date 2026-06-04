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
        bg: '#0a0a0b',
        surface: '#111114',
        divider: '#1f1f24',
        primary: '#ededf0',
        muted: '#8a8a93',
        accent: {
          project: '#f59e0b',
          skill: '#818cf8',
          experience: '#34d399',
          hobby: '#fb7185',
          award: '#fbbf24',
          place: '#7dd3fc',
          course: '#a78bfa',
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
