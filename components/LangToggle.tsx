'use client';

import { useEffect, useState } from 'react';

// Tiny EN / 中 switch. Sets document.documentElement.dataset.lang and fires a
// 'langchange' event that every Kicker listens for. Persists in localStorage.
export function LangToggle() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    const saved = (localStorage.getItem('lang') as 'en' | 'zh' | null) ?? 'en';
    apply(saved);
  }, []);

  const apply = (next: 'en' | 'zh') => {
    setLang(next);
    document.documentElement.dataset.lang = next;
    localStorage.setItem('lang', next);
    window.dispatchEvent(new Event('langchange'));
  };

  return (
    <button
      onClick={() => apply(lang === 'en' ? 'zh' : 'en')}
      aria-label="Toggle language between English and Chinese"
      className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors"
      title={lang === 'en' ? '切换到中文标签' : 'Switch labels to English'}
    >
      <span className={lang === 'en' ? 'text-primary' : ''}>EN</span>
      <span className="mx-1 text-divider">/</span>
      <span className={lang === 'zh' ? 'text-primary' : ''}>中</span>
    </button>
  );
}
