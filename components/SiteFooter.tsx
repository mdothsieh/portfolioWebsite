// Site footer (server). Hosts the compact <AskAI> row and a colophon line with
// the deploy date (evaluated server-side at build/revalidate — no client JS).
// Mounted in app/layout.tsx.
import { AskAI } from './AskAI';
import { T } from './i18n';

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
            <T en="Designed & built by me · updated" zh="由我亲自设计与构建 · 更新于" /> {UPDATED} ·{' '}
            <a
              href="https://github.com/mdothsieh"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <T en="source ↗" zh="源码 ↗" />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
