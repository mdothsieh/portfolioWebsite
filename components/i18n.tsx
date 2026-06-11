'use client';

// Client-side i18n core. Three language modes — 'en' (default), 'zh-hans'
// (简体, the default Chinese), 'zh-hant' (繁體) — stored on
// document.documentElement.dataset.lang by LangToggle (persisted in
// localStorage, restored pre-paint by the bootstrap script in app/layout.tsx).
//
// Authoring model: every string is written once in English and once in
// Simplified Chinese (the `zh` prop / `*_zh` data fields). Traditional is
// generated on the fly from Simplified via opencc-js (dynamically imported
// only when 繁 is selected, so the dictionaries never load for EN/简 visitors).
//
// Use the <T en zh> leaf component inside server components, or the
// useZhText() hook inside client components. Strings without a zh value
// stay English in every mode.
import { useEffect, useState } from 'react';

export type Lang = 'en' | 'zh-hans' | 'zh-hant';

export function readLang(): Lang {
  if (typeof document === 'undefined') return 'en';
  const l = document.documentElement.dataset.lang;
  if (l === 'zh-hans' || l === 'zh-hant') return l;
  if (l === 'zh') return 'zh-hans'; // legacy value from the old two-state toggle
  return 'en';
}

/** Current language; re-renders on the global 'langchange' event. */
export function useLang(): Lang {
  // Initial state is 'en' to match the server-rendered HTML; the effect swaps
  // to the stored language right after hydration.
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    const read = () => setLang(readLang());
    read();
    window.addEventListener('langchange', read);
    return () => window.removeEventListener('langchange', read);
  }, []);
  return lang;
}

// --- Simplified → Traditional conversion (lazy singleton) ---
type Convert = (s: string) => string;
let converterPromise: Promise<Convert> | null = null;
function getConverter(): Promise<Convert> {
  if (!converterPromise) {
    converterPromise = import('opencc-js').then((OpenCC) =>
      OpenCC.Converter({ from: 'cn', to: 'tw' }),
    );
  }
  return converterPromise;
}

/**
 * Resolve a bilingual string for the current language. Returns `en` in
 * English mode (or when no zh provided), `zh` in 简体, and the OpenCC
 * conversion of `zh` in 繁體 (falling back to 简体 until the converter loads).
 */
export function useZhText(en: string, zh?: string): string {
  const lang = useLang();
  const [hant, setHant] = useState<string | null>(null);

  useEffect(() => {
    if (lang !== 'zh-hant' || !zh) {
      setHant(null);
      return;
    }
    let alive = true;
    getConverter().then((convert) => {
      if (alive) setHant(convert(zh));
    });
    return () => {
      alive = false;
    };
  }, [lang, zh]);

  if (lang === 'en' || !zh) return en;
  if (lang === 'zh-hant') return hant ?? zh;
  return zh;
}

/** Bilingual text leaf — usable inside server components. */
export function T({ en, zh }: { en: string; zh?: string }) {
  return <>{useZhText(en, zh)}</>;
}
