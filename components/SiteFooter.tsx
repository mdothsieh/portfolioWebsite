// Site footer (server). Hosts the compact <AskAI> row and a colophon line with
// the deploy date (evaluated server-side at build/revalidate — no client JS).
// Mounted in app/layout.tsx.
import { AskAI } from './AskAI';

// Stamped when the page is rendered on the server (build or ISR revalidation).
// A dated, verifiable "last updated" is a small authenticity signal — templates
// and one-shot generated sites don't carry one.
const UPDATED = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'America/Los_Angeles',
});

export function SiteFooter() {
  return (
    <footer className="mt-12">
      <AskAI />

      <div className="border-t border-divider">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between gap-4 flex-wrap text-[10px] font-mono uppercase tracking-widest text-muted">
          <span>© 2026 Martin Hsieh</span>
          <span>
            Designed &amp; built by me · updated {UPDATED} ·{' '}
            <a
              href="https://github.com/mdothsieh"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              source ↗
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
