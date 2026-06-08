'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { UsageData, UsageDay } from '@/lib/claude-usage';

interface Props {
  data: UsageData;
}

// Inverted intensity scale: pale pink = quiet day, deep crimson = heavy day.
// Smooth single-hue green → lime ramp (GitHub-style, AM-tinted). Monotonic in
// lightness with no muddy olive midtone, so it reads cleanly on the dark dial.
const LEVEL_BG: string[] = [
  'bg-divider',     // 0 — no activity
  'bg-[#1a5236]',   // 1 — deep racing green
  'bg-[#237d4a]',   // 2 — emerald
  'bg-[#4cae57]',   // 3 — fresh green
  'bg-[#bcd62e]',   // 4 — lime (most intense)
];

const CELL_PX = 11;
const GAP_PX = 3;
const STEP_PX = CELL_PX + GAP_PX;

function formatTokens(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

function formatDateLong(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface TooltipState {
  day: UsageDay;
  x: number;
  y: number;
}

export function ClaudeUsageHeatmap({ data }: Props) {
  const { days, stats } = data;
  const [tip, setTip] = useState<TooltipState | null>(null);

  const onEnter = useCallback((day: UsageDay, e: React.MouseEvent) => {
    setTip({ day, x: e.clientX, y: e.clientY });
  }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    setTip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
  }, []);

  const onLeave = useCallback(() => setTip(null), []);

  if (data.empty || days.length === 0) {
    return (
      <div className="bg-surface/60 border border-divider rounded-xl p-6 text-xs font-mono text-muted">
        No Claude sessions found yet. Once you chat with Cowork or run Claude Code,
        the heatmap fills in automatically on the next page refresh.
      </div>
    );
  }

  // Group days into 7-row weeks, padding the first week so weekdays align.
  const weeks: (UsageDay | null)[][] = [];
  let week: (UsageDay | null)[] = [];
  days.forEach((day, i) => {
    if (i === 0) {
      const weekday = new Date(day.date + 'T00:00:00').getDay();
      for (let j = 0; j < weekday; j++) week.push(null);
    }
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // Month labels — emit one label per month boundary.
  const monthLabels: { week: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, wi) => {
    const firstReal = w.find((d): d is UsageDay => !!d?.date);
    if (!firstReal) return;
    const m = new Date(firstReal.date + 'T00:00:00').getMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        week: wi,
        label: new Date(firstReal.date + 'T00:00:00').toLocaleString('en', {
          month: 'short',
        }),
      });
      lastMonth = m;
    }
  });

  return (
    <div className="bg-surface/60 border border-divider rounded-xl p-6 relative">
      {/* --- Stats row --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <Stat
          value={String(stats.active_days)}
          label={`active day${stats.active_days === 1 ? '' : 's'}`}
        />
        <Stat value={`${stats.current_streak}d`} label="current streak" />
        <Stat
          value={String(stats.sessions)}
          label={`session${stats.sessions === 1 ? '' : 's'}`}
        />
        <Stat value={formatTokens(stats.tokens)} label="tokens processed" />
      </div>

      {/* --- Source breakdown --- */}
      <SourceBreakdown
        data={data}
        className="mb-8 -mt-1 pt-4 border-t border-divider/60"
      />

      {/* --- Heatmap --- */}
      <div className="overflow-x-auto" onMouseLeave={onLeave}>
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div
            className="relative ml-7 mb-1"
            style={{ height: '12px', width: `${weeks.length * STEP_PX}px` }}
          >
            {monthLabels.map((m) => (
              <span
                key={`${m.label}-${m.week}`}
                className="absolute top-0 text-[10px] font-mono uppercase tracking-widest text-muted"
                style={{ left: `${m.week * STEP_PX}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Weekday column + cell grid */}
          <div className="flex items-start">
            <div
              className="flex flex-col mr-2 text-[10px] font-mono uppercase tracking-widest text-muted"
              style={{ gap: `${GAP_PX}px` }}
            >
              {['', 'M', '', 'W', '', 'F', ''].map((d, i) => (
                <span
                  key={i}
                  style={{ height: `${CELL_PX}px`, lineHeight: `${CELL_PX}px` }}
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="flex" style={{ gap: `${GAP_PX}px` }}>
              {weeks.map((w, wi) => (
                <div key={wi} className="flex flex-col shrink-0" style={{ gap: `${GAP_PX}px` }}>
                  {w.map((day, di) => (
                    <div
                      key={di}
                      onMouseEnter={day ? (e) => onEnter(day, e) : undefined}
                      onMouseMove={day ? onMove : undefined}
                      className={`rounded-[2px] transition-transform ${
                        day
                          ? `${LEVEL_BG[day.level]} cursor-crosshair hover:ring-1 hover:ring-rose-300/60 hover:scale-125`
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${CELL_PX}px`, width: `${CELL_PX}px` }}
                      aria-label={
                        day
                          ? `${day.date}, ${day.count} messages, ${formatTokens(day.tokens)} tokens`
                          : undefined
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Footer --- */}
      <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
        <div className="text-[10px] font-mono text-muted">
          Hover for details
          <span className="text-divider mx-1.5">·</span>
          scanned <ScannedAgo iso={data.generated_at} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted">
          <span>less</span>
          {LEVEL_BG.map((c, i) => (
            <span
              key={i}
              className={`rounded-[2px] ${c}`}
              style={{ height: `${CELL_PX}px`, width: `${CELL_PX}px` }}
            />
          ))}
          <span>more</span>
        </div>
      </div>

      {/* --- Floating hover tooltip --- */}
      {tip && <HoverTooltip day={tip.day} x={tip.x} y={tip.y} />}
    </div>
  );
}

/**
 * 3-column source breakdown — Cowork / Claude Code / claude.ai.
 * Sources with no data render in muted style with a tiny CTA where helpful.
 */
function SourceBreakdown({ data, className = '' }: { data: UsageData; className?: string }) {
  const s = data.by_source;
  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      <SourceCard
        label="Cowork"
        active={s.cowork.transcripts > 0}
        primary={String(s.cowork.sessions)}
        primaryLabel={`session${s.cowork.sessions === 1 ? '' : 's'}`}
        sub={`${s.cowork.transcripts} transcript${s.cowork.transcripts === 1 ? '' : 's'}`}
      />
      <SourceCard
        label="Claude Code"
        active={s.code.transcripts > 0}
        primary={String(s.code.sessions)}
        primaryLabel={`session${s.code.sessions === 1 ? '' : 's'}`}
        sub={
          s.code.transcripts > 0
            ? `${s.code.transcripts} transcript${s.code.transcripts === 1 ? '' : 's'}`
            : 'install claude code →'
        }
      />
      <SourceCard
        label="claude.ai"
        active={s.chat.messages > 0}
        primary={s.chat.messages > 0 ? String(s.chat.messages) : '—'}
        primaryLabel={s.chat.messages > 0 ? 'chat msgs' : 'not imported'}
        sub={s.chat.messages > 0 ? `${s.chat.sessions} conversations` : 'drop conversations.json →'}
      />
    </div>
  );
}

function SourceCard({
  label,
  primary,
  primaryLabel,
  sub,
  active,
}: {
  label: string;
  primary: string;
  primaryLabel: string;
  sub: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2.5 ${
        active ? 'bg-bg/40 border-divider' : 'bg-transparent border-divider/60'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active ? 'bg-rose-400' : 'bg-divider'
          }`}
          aria-hidden
        />
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-serif text-xl tabular leading-none ${
            active ? 'text-primary' : 'text-muted'
          }`}
        >
          {primary}
        </span>
        <span className="text-[9px] font-mono lowercase tracking-wider text-muted">
          {primaryLabel}
        </span>
      </div>
      <div className="text-[9px] font-mono lowercase tracking-wider text-muted mt-1">
        {sub}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-4xl md:text-5xl text-rose-400 tabular leading-none">
        {value}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-2 leading-tight">
        {label}
      </div>
    </div>
  );
}

/**
 * Live-updating "X seconds ago" indicator so you can verify the scan is fresh.
 * Updates every second client-side, but the underlying value is whatever the
 * server's last scan timestamp was when the page was rendered.
 */
function ScannedAgo({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!iso) return <span className="text-primary">just now</span>;
  const diff = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  let label: string;
  if (diff < 5) label = 'just now';
  else if (diff < 60) label = `${diff}s ago`;
  else if (diff < 3600) label = `${Math.floor(diff / 60)}m ago`;
  else label = `${Math.floor(diff / 3600)}h ago`;
  return <span className="text-primary">{label}</span>;
}

function HoverTooltip({ day, x, y }: { day: UsageDay; x: number; y: number }) {
  // Estimated tooltip size — used to keep it on-screen.
  const W = 240;
  const H = 96;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Default: above-right of cursor. Flip/clamp so it stays on-screen.
  let left = x + 14;
  let top = y - H - 14;
  if (left + W > vw - 12) left = x - W - 14;
  if (top < 12) top = y + 18;
  if (top + H > vh - 12) top = vh - H - 12;

  const isEmpty = day.count === 0;

  // Render into <body> via a portal. The heatmap lives inside a `.reveal`
  // wrapper whose `will-change: transform` makes it a containing block for
  // fixed-position descendants — so a `fixed` tooltip rendered in-tree would be
  // offset relative to that wrapper instead of the viewport (clientX/clientY).
  // Portaling to body, which has no such ancestor, keeps fixed coords correct.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed z-50 pointer-events-none w-[240px] rounded-lg border border-divider bg-bg/95 backdrop-blur p-4 shadow-2xl"
      style={{ left, top }}
      role="tooltip"
    >
      {/* date header */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
        {formatDateLong(day.date)}
      </div>

      {isEmpty ? (
        <div className="font-serif text-base text-muted">no activity</div>
      ) : (
        <>
          {/* primary metric: tokens */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="font-serif text-2xl text-rose-400 tabular leading-none">
              {formatTokens(day.tokens)}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              tokens
            </span>
          </div>

          {/* secondary metrics: messages + sessions */}
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted">
            <span>
              <span className="text-primary tabular">{day.count}</span> message
              {day.count === 1 ? '' : 's'}
            </span>
            <span className="text-divider">·</span>
            <span>
              <span className="text-primary tabular">{day.sessions}</span> session
              {day.sessions === 1 ? '' : 's'}
            </span>
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
