import { AskAI } from './AskAI';

export function SiteFooter() {
  return (
    <footer className="mt-12">
      <AskAI />

      <div className="border-t border-divider">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between gap-4 flex-wrap text-[10px] font-mono uppercase tracking-widest text-muted">
          <span>© 2026 Martin Hsieh</span>
          <span>
            Built with Next.js · Tailwind ·{' '}
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
