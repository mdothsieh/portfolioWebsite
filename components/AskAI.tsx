'use client';

import { useState } from 'react';

// The visitor-facing prompt. Kept verbatim so every provider gets the same ask.
const NAME = 'Martin Hsieh';
const DOMAIN = 'martinhsieh.com';
const PROMPT = `Tell me about ${NAME} based on ${DOMAIN}. Summarize who they are, what they do and how to get in touch.`;

interface Provider {
  id: string;
  name: string;
  dot: string;
  // Most providers accept a ?q= prefill, so the prompt rides in the href and the
  // link works with no JS. Gemini has no URL param — there we fall back to the
  // clipboard copy (the visitor pastes the prompt into the open Gemini tab).
  href: string;
  prefills: boolean;
}

const PROVIDERS: Provider[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    dot: '#10A37F',
    href: `https://chatgpt.com/?q=${encodeURIComponent(PROMPT)}`,
    prefills: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    dot: '#D97757',
    href: `https://claude.ai/new?q=${encodeURIComponent(PROMPT)}`,
    prefills: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    dot: '#20B8CD',
    href: `https://www.perplexity.ai/search?q=${encodeURIComponent(PROMPT)}`,
    prefills: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    dot: '#4285F4',
    href: 'https://gemini.google.com/app',
    prefills: false,
  },
];

export function AskAI() {
  const [toast, setToast] = useState<string | null>(null);

  // Progressive enhancement: copy the prompt on click (the prefill mechanism for
  // Gemini, a convenience for the rest). The anchor's native navigation still
  // fires — we never preventDefault — so the links work even without JS.
  function handleClick(p: Provider) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(PROMPT).then(
        () =>
          setToast(
            p.prefills
              ? `Prompt copied — opening ${p.name}…`
              : `Prompt copied — paste it into ${p.name}.`,
          ),
        () => undefined,
      );
      window.setTimeout(() => setToast(null), 3200);
    }
  }

  return (
    <section
      aria-labelledby="ask-ai-heading"
      className="max-w-3xl mx-auto px-6 py-20 border-t border-divider"
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4">
        Ask AI
      </div>
      <h2 id="ask-ai-heading" className="font-serif text-3xl md:text-4xl mb-3">
        Ask an AI about me.
      </h2>
      <p className="text-muted text-sm max-w-xl mb-8 leading-relaxed">
        Rather than read every page, ask your assistant of choice. It opens in a
        new tab with a prompt about who I am, what I build, and how to reach me —
        already filled in.
      </p>

      <nav aria-label="Ask an AI assistant about Martin Hsieh">
        <ul className="flex flex-wrap gap-3">
          {PROVIDERS.map((p) => (
            <li key={p.id}>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleClick(p)}
                aria-label={`Ask ${p.name} about ${NAME}`}
                className="group inline-flex items-center gap-2.5 rounded-full border border-divider bg-surface/80 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-muted hover:text-primary hover:border-muted transition-colors"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.dot }}
                />
                {p.name}
                <span
                  aria-hidden
                  className="text-divider group-hover:text-muted transition-colors"
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Live region so the clipboard feedback is announced, not just shown */}
      <div aria-live="polite" className="min-h-[1.25rem] mt-4">
        {toast && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400">
            {toast}
          </span>
        )}
      </div>
    </section>
  );
}
