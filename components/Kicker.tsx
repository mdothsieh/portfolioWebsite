'use client';

import { useZhText } from './i18n';

// Bilingual section kicker: always shows a Chinese numeral ornament, then the
// label in English ("04 — Builds"), 简体 or 繁體 (converted from the 简体 label),
// driven by the site-wide language state that LangToggle controls (see
// components/i18n.tsx).
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
  zh: string; // simplified chinese label (traditional is auto-converted)
  className?: string;
}) {
  const label = useZhText(`${num} — ${en}`, zh);

  return (
    <div
      className={`text-[10px] font-mono uppercase tracking-widest text-muted mb-6 ${className}`}
    >
      <span className="cn-numeral">{cn}</span>
      {label}
    </div>
  );
}
