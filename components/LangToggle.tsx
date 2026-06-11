'use client';

import { useEffect, useState } from 'react';
import type { Lang } from './i18n';

// EN / 简 / 繁 segmented language switch. Sets
// document.documentElement.dataset.lang (+ the html lang attribute for a11y)
// and fires the 'langchange' event that useLang() (components/i18n.tsx)
// subscribes to. Persists in localStorage; the bootstrap script in
// app/layout.tsx restores the choice before first paint. 简体 is the default
// Chinese — 繁體 sits one click away.
const OPTIONS: { value: Lang; label: string; title: string }[] = [
  { value: 'en', label: 'EN', title: 'English' },
  { value: 'zh-hans', label: '简', title: '简体中文' },
  { value: 'zh-hant', label: '繁', title: '繁體中文' },
];

const HTML_LANG: Record<Lang, string> = {
  en: 'en',
  'zh-hans': 'zh-Hans',
  'zh-hant': 'zh-Hant',
};

export function LangToggle() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    let saved = localStorage.getItem('lang');
    if (saved === 'zh') saved = 'zh-hans'; // migrate the old two-state value
    apply(
      saved === 'zh-hans' || saved === 'zh-hant' ? (saved as Lang) : 'en',
    );
  }, []);

  const apply = (next: Lang) => {
    setLang(next);
    document.documentElement.dataset.lang = next;
    document.documentElement.lang = HTML_LANG[next];
    localStorage.setItem('lang', next);
    window.dispatchEvent(new Event('langchange'));
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center text-[10px] font-mono uppercase tracking-widest text-muted"
    >
      {OPTIONS.map((o, i) => (
        <span key={o.value} className="flex items-center">
          {i > 0 && <span className="mx-1 text-divider">/</span>}
          <button
            onClick={() => apply(o.value)}
            aria-pressed={lang === o.value}
            title={o.title}
            className={`transition-colors hover:text-primary ${
              lang === o.value ? 'text-primary' : ''
            }`}
          >
            {o.label}
          </button>
        </span>
      ))}
    </div>
  );
}
