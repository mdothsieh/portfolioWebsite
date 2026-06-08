'use client';

import { useEffect, useState } from 'react';

// Bilingual section kicker: always shows a Chinese numeral ornament, then the
// label in either English ("04 — Builds") or Chinese ("作品"), driven by the
// site-wide lang flag that LangToggle controls.
export function Kicker({
  cn,
  num,
  en,
  zh,
  className = '',
}: {
  cn: string; // chinese numeral, e.g. 零四
  num: string; // arabic index, e.g. 04
  en: string; // english label
  zh: string; // chinese label
  className?: string;
}) {
  const [lang, setLang] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    const read = () =>
      setLang(document.documentElement.dataset.lang === 'zh' ? 'zh' : 'en');
    read();
    window.addEventListener('langchange', read);
    return () => window.removeEventListener('langchange', read);
  }, []);

  return (
    <div
      className={`text-[10px] font-mono uppercase tracking-widest text-muted mb-6 ${className}`}
    >
      <span className="cn-numeral">{cn}</span>
      {lang === 'zh' ? zh : `${num} — ${en}`}
    </div>
  );
}
