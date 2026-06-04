import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Martin Hsieh — CS @ USC',
  description:
    'CS undergrad at USC building full-stack and applied-AI systems. Los Angeles · Taipei.',
  metadataBase: new URL('https://martinhsieh.com'),
  openGraph: {
    title: 'Martin Hsieh',
    description: 'CS @ USC. Systems that move data, music, and the occasional latte order.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} ${serif.variable}`}
    >
      <body className="bg-bg text-primary font-sans antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
