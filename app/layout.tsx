// Root layout for every route. Loads the three Google fonts (mapped to the
// legacy --font-inter/serif/mono CSS vars that Tailwind reads), defines site-wide
// SEO/OpenGraph metadata, and mounts the persistent chrome wrapping all pages:
// AmbientWash, Atmosphere, LiveFavicon, ScrollProgress, Nav, SiteFooter,
// CommandPalette. Per-navigation entrance animation lives in app/template.tsx.
import type { Metadata } from 'next';
import { Hanken_Grotesk, Spline_Sans_Mono, Schibsted_Grotesk } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Atmosphere } from '@/components/Atmosphere';
import { AmbientWash } from '@/components/AmbientWash';
import { LiveFavicon } from '@/components/LiveFavicon';
import { CommandPalette } from '@/components/CommandPalette';
import { SiteFooter } from '@/components/SiteFooter';

// Body: warm humanist grotesk (keeps the --font-inter var name so Tailwind's
// `sans` token resolves without further changes).
const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
// Mono: telemetry / instrument labels — engineered, even-width.
const mono = Spline_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
// Display: clean engineered grotesk for headings, big numerals, and the watch
// signature — Apple-crisp, Ferrari-precise. (Keeps the --font-serif var name so
// every existing `font-serif` heading resolves to it with no per-file changes.)
const serif = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-serif',
  display: 'swap',
});

const SITE_URL = 'https://martinhsieh.com';
const TITLE = 'Martin Hsieh — CS @ USC';
const DESCRIPTION =
  'USC computer science junior building full-stack systems and applied-AI tooling. Three internships shipped. Open to Summer 2027 roles.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s · Martin Hsieh',
  },
  description: DESCRIPTION,
  keywords: [
    'Martin Hsieh', 'USC Computer Science', 'software engineering intern',
    'applied AI', 'full-stack', 'Next.js', 'Taipei', 'Los Angeles',
  ],
  authors: [{ name: 'Martin Hsieh', url: SITE_URL }],
  creator: 'Martin Hsieh',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Martin Hsieh',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Martin Hsieh — CS @ USC',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${serif.variable}`}
    >
      <body className="relative bg-bg text-primary font-sans antialiased">
        <AmbientWash />
        <Atmosphere />
        <LiveFavicon />
        <ScrollProgress />
        <Nav />
        {children}
        <SiteFooter />
        <CommandPalette />
      </body>
    </html>
  );
}
