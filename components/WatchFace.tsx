'use client';

import { useEffect, useMemo, useState } from 'react';
import { graphData, type GraphNode, type NodeKind } from '@/data/graph';

// ---------------------------------------------------------------------------
// Layers — what the 12 hour markers represent (switched via the chrono pushers)
// ---------------------------------------------------------------------------

type LayerKey = 'builds' | 'experience' | 'stack' | 'hobbies';

const LAYERS: Record<LayerKey, { label: string; kinds: NodeKind[] }> = {
  builds:     { label: 'builds',     kinds: ['project', 'award'] },
  experience: { label: 'experience', kinds: ['experience'] },
  stack:      { label: 'stack',      kinds: ['skill'] },
  hobbies:    { label: 'hobbies',    kinds: ['hobby', 'place'] },
};

const LAYER_ORDER: LayerKey[] = ['builds', 'experience', 'stack', 'hobbies'];

// ---------------------------------------------------------------------------
// Palette (Aston Martin F1 — racing green + acid lime)
// ---------------------------------------------------------------------------

const LIME = '#CEDC00';
const SILVER = '#eaf2ee';
const MUTED = '#7f978b';

// ---------------------------------------------------------------------------
// Geometry — round "Solaria" grand-complication case
// ---------------------------------------------------------------------------

const VB_W = 480;
const VB_H = 640;
const CX = 240;
const CY = 300;

const R_CASE = 198;     // outer case
const R_BEZEL_O = 190;  // bezel outer
const R_BEZEL_I = 172;  // bezel inner
const R_RING24 = 180;   // celestial / sidereal scale
const R_ZODIAC = 158;   // constellation ring
const R_CHAP = 150;     // hour-marker (data) chapter ring
const R_DIAL = 146;     // green dial disc

const R_HAND_HOUR = 64;
const R_HAND_MIN = 98;
const R_HAND_SEC = 120;

const SUB_R = 28;
const DATE_C = { x: CX, y: CY - 84 };
const WORK_C = { x: CX - 84, y: CY + 18 };
const PULSE_C = { x: CX + 84, y: CY + 18 };
const TOURB_C = { x: CX, y: CY + 92 };
const TOURB_R = 30;
const MOON_C = { x: CX - 58, y: CY - 44 };
const MOON_R = 15;
const SUN_C = { x: CX + 58, y: CY - 44 };
const SUN_R = 15;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Spread polar() as x/y/cx/cy props on an element (relative to the dial centre).
function polarObj(r: number, deg: number) {
  const p = polar(CX, CY, r, deg);
  return { x: p.x, y: p.y, cx: p.x, cy: p.y };
}

// ---------------------------------------------------------------------------
// Deterministic decorative geometry (precomputed once — never re-rendered)
// ---------------------------------------------------------------------------

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Starfield scattered across the dial.
const STARS = (() => {
  const rnd = seeded(7);
  const out: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = Math.sqrt(rnd()) * (R_DIAL - 12);
    out.push({
      x: CX + Math.cos(a) * rad,
      y: CY + Math.sin(a) * rad,
      r: rnd() * 1.0 + 0.3,
      o: rnd() * 0.45 + 0.2,
    });
  }
  return out;
})();

// Sunburst guilloché — faint radial lines from the centre.
const SUNBURST = Array.from({ length: 120 }, (_, i) => {
  const p = polar(CX, CY, R_DIAL - 2, i * 3);
  return { x: p.x, y: p.y, o: i % 2 ? 0.05 : 0.09 };
});

// Zodiac constellation clusters around the ring.
const ZODIAC = (() => {
  const rnd = seeded(19);
  return Array.from({ length: 12 }, (_, i) => {
    const c = polar(CX, CY, R_ZODIAC, i * 30 + 15);
    const stars = Array.from({ length: 3 }, () => ({
      x: c.x + (rnd() - 0.5) * 14,
      y: c.y + (rnd() - 0.5) * 14,
      r: rnd() * 0.9 + 0.5,
    }));
    return { stars };
  });
})();

// ---------------------------------------------------------------------------
// Moon phase (0 = new, 0.5 = full) — drives the moonphase aperture
// ---------------------------------------------------------------------------

function moonPhase(date: Date) {
  const synodic = 29.530588853;
  const ref = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
  const days = date.getTime() / 86400000 - ref;
  let phase = (days % synodic) / synodic;
  if (phase < 0) phase += 1;
  return phase;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WatchFaceProps {
  isPlaying?: boolean;
  todayActivity?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WatchFace({ isPlaying = false, todayActivity = 0 }: WatchFaceProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  const [layerKey, setLayerKey] = useState<LayerKey>('builds');
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [crownSpin, setCrownSpin] = useState(0);
  const [pressed, setPressed] = useState<null | 'next' | 'prev'>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setNow(new Date());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Arrow keys cycle layers (ignored while typing in inputs / the palette)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); cycleLayer(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); cycleLayer(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerKey]);

  const slots: (GraphNode | null)[] = useMemo(() => {
    const kinds = LAYERS[layerKey].kinds;
    const nodes = graphData.nodes.filter((n) => kinds.includes(n.kind)).slice(0, 12);
    const arr: (GraphNode | null)[] = Array(12).fill(null);
    nodes.forEach((n, i) => { arr[i] = n; });
    return arr;
  }, [layerKey]);

  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  const secondAngle = (seconds / 60) * 360;
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = (hours / 12) * 360;
  const dayNight = (now.getHours() + minutes / 60) / 24;

  const dateNum = now.getDate();
  const dayShort = now.toLocaleString('en', { weekday: 'short' }).toUpperCase();
  const phase = moonPhase(now);

  const hovered = hoveredHour != null ? slots[hoveredHour] : null;

  function cycleLayer(dir: number = 1) {
    const i = LAYER_ORDER.indexOf(layerKey);
    const next = (i + dir + LAYER_ORDER.length) % LAYER_ORDER.length;
    setLayerKey(LAYER_ORDER[next]);
    setHoveredHour(null);
    setCrownSpin((s) => s + dir * 30);
  }

  function pushLayer(dir: number) {
    setPressed(dir > 0 ? 'next' : 'prev');
    cycleLayer(dir);
    window.setTimeout(() => setPressed(null), 170);
  }

  // ----- Static art (case, bezel, celestial rings, dial, sub-dial frames,
  // tourbillon cage). None of this depends on time, so it is memoized and the
  // 60fps clock never re-renders it. ----------------------------------------
  const staticArt = useMemo(() => (
    <g>
      {/* lugs */}
      <g opacity="0.9">
        <rect x={CX - 26} y={70} width={52} height={26} rx={5} fill="url(#caseGrad)" />
        <rect x={CX - 26} y={VB_H - 96} width={52} height={26} rx={5} fill="url(#caseGrad)" />
      </g>

      {/* case + bezel */}
      <circle cx={CX} cy={CY} r={R_CASE} fill="url(#caseGrad)" />
      <circle cx={CX} cy={CY} r={R_BEZEL_O} fill="none" stroke="url(#bezelGrad)" strokeWidth="6" />
      <circle cx={CX} cy={CY} r={R_BEZEL_I} fill="none" stroke="#11271f" strokeWidth="1.5" />

      {/* sidereal / celestial scale on the bezel */}
      {Array.from({ length: 96 }, (_, i) => {
        const major = i % 8 === 0;
        const a = polar(CX, CY, R_RING24, i * (360 / 96));
        const b = polar(CX, CY, R_RING24 - (major ? 7 : 3.5), i * (360 / 96));
        return (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={major ? LIME : MUTED} strokeWidth={major ? 1.3 : 0.6}
            opacity={major ? 0.55 : 0.3} strokeLinecap="round" />
        );
      })}

      {/* slowly-rotating zodiac constellation ring */}
      <g>
        <animateTransform attributeName="transform" type="rotate"
          from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="300s" repeatCount="indefinite" />
        <circle cx={CX} cy={CY} r={R_ZODIAC} fill="none" stroke="#1b3a2c" strokeWidth="0.5" opacity="0.6" />
        {ZODIAC.map((z, i) => (
          <g key={i} opacity="0.5">
            {z.stars.map((s, j) => (
              <circle key={j} cx={s.x} cy={s.y} r={s.r} fill={SILVER} />
            ))}
            <line x1={z.stars[0].x} y1={z.stars[0].y} x2={z.stars[1].x} y2={z.stars[1].y}
              stroke={SILVER} strokeWidth="0.25" opacity="0.5" />
            <line x1={z.stars[1].x} y1={z.stars[1].y} x2={z.stars[2].x} y2={z.stars[2].y}
              stroke={SILVER} strokeWidth="0.25" opacity="0.5" />
          </g>
        ))}
      </g>

      {/* racing-green dial + sunburst + starfield */}
      <circle cx={CX} cy={CY} r={R_DIAL} fill="url(#dialGreen)" />
      <g opacity="0.9">
        {SUNBURST.map((l, i) => (
          <line key={i} x1={CX} y1={CY} x2={l.x} y2={l.y} stroke="#1e7a5e" strokeWidth="0.6" opacity={l.o} />
        ))}
      </g>
      <g>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={SILVER} opacity={s.o} />
        ))}
      </g>
      <circle cx={CX} cy={CY} r={R_DIAL} fill="none" stroke="#1b3a2c" strokeWidth="1" />

      {/* sub-dial frames */}
      {[DATE_C, WORK_C, PULSE_C].map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={SUB_R} fill="url(#subGreen)" stroke="#1f4636" strokeWidth="1" />
          <circle cx={c.x} cy={c.y} r={SUB_R - 3} fill="none" stroke="#0a2a20" strokeWidth="0.5" />
        </g>
      ))}

      {/* tourbillon — fixed bridge + rotating cage */}
      <g>
        <circle cx={TOURB_C.x} cy={TOURB_C.y} r={TOURB_R} fill="#06201a" stroke="#1f4636" strokeWidth="1" />
        <circle cx={TOURB_C.x} cy={TOURB_C.y} r={TOURB_R - 4} fill="none" stroke="#0a2a20" strokeWidth="0.5" />
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${TOURB_C.x} ${TOURB_C.y}`} to={`360 ${TOURB_C.x} ${TOURB_C.y}`}
            dur="60s" repeatCount="indefinite" />
          {[0, 120, 240].map((d) => {
            const p = polar(TOURB_C.x, TOURB_C.y, TOURB_R - 5, d);
            return <line key={d} x1={TOURB_C.x} y1={TOURB_C.y} x2={p.x} y2={p.y} stroke="url(#steelGrad)" strokeWidth="1.4" />;
          })}
          <circle cx={TOURB_C.x} cy={TOURB_C.y} r={TOURB_R - 7} fill="none" stroke="url(#steelGrad)" strokeWidth="1.4" />
          <circle cx={TOURB_C.x} cy={TOURB_C.y - (TOURB_R - 7)} r="2" fill={LIME} />
          <circle cx={TOURB_C.x} cy={TOURB_C.y} r="3.5" fill="none" stroke={SILVER} strokeWidth="0.8" />
          <circle cx={TOURB_C.x} cy={TOURB_C.y} r="1.4" fill={LIME} />
        </g>
        <text x={TOURB_C.x} y={TOURB_C.y + TOURB_R + 10} textAnchor="middle" fill={MUTED}
          fontSize="5" letterSpacing="2" style={{ fontFamily: 'var(--font-mono), monospace' }}>
          TOURBILLON
        </text>
      </g>

      {/* brand / signature */}
      <text x={CX} y={CY + 150} textAnchor="middle" fill={MUTED} fontSize="8" letterSpacing="3.5"
        style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
        SOLARIA
      </text>
      <text x={CX} y={CY + 164} textAnchor="middle" fill={MUTED} fontSize="5" letterSpacing="2.5"
        style={{ fontFamily: 'var(--font-mono), monospace' }}>
        GRANDE COMPLICATION
      </text>
    </g>
  ), []);

  // ----- Hour markers = the data layer (re-render only on layer/hover change) -
  const markers = useMemo(() => (
    <g>
      {slots.map((node, i) => {
        if (i === 6) return null; // tourbillon owns 6 o'clock
        const angle = i * 30;
        const isMajor = i % 3 === 0;
        const hasNode = !!node;
        const isHovered = hoveredHour === i;
        const inner = polar(CX, CY, R_CHAP - (isMajor ? 16 : 9), angle);
        const outer = polar(CX, CY, R_CHAP, angle);
        const dot = polar(CX, CY, R_CHAP, angle);

        return (
          <g key={i}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke={SILVER} strokeWidth={isMajor ? 3.5 : 1.5}
              opacity={hasNode ? 0.95 : 0.3} strokeLinecap="round" />
            {isMajor && (
              <circle {...polarObj(R_CHAP - 4, angle)} r="1.5" fill={LIME} opacity="0.8" />
            )}
            {hasNode && (
              <g
                onMouseEnter={() => setHoveredHour(i)}
                onMouseLeave={() => setHoveredHour(null)}
                onClick={() => { if (node?.slug) window.location.href = `/projects/${node.slug}`; }}
                className={node?.slug ? 'cursor-pointer' : 'cursor-help'}
              >
                <circle cx={dot.x} cy={dot.y} r={16} fill="transparent" />
                <circle cx={dot.x} cy={dot.y} r={isHovered ? 6 : 3.5}
                  fill={isHovered ? LIME : SILVER}
                  style={{ transition: 'r 200ms ease, fill 200ms ease' }} />
                {isHovered && (
                  <circle cx={dot.x} cy={dot.y} r={11} fill="none" stroke={LIME} strokeWidth={1} opacity={0.5} />
                )}
              </g>
            )}
          </g>
        );
      })}
      {/* "12" numeral */}
      <text {...polarObj(R_CHAP - 22, 0)} textAnchor="middle" dominantBaseline="central"
        fill={SILVER} fontSize="16" fontWeight="800" style={{ fontFamily: 'var(--font-mono), monospace' }}>
        12
      </text>
    </g>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [slots, hoveredHour]);

  // Pusher press offset (towards centre)
  const pressOffset = (dir: 'next' | 'prev') => {
    if (pressed !== dir) return 'translate(0,0)';
    const p = dir === 'next' ? polar(CX, CY, R_CASE, 62) : polar(CX, CY, R_CASE, 118);
    const dx = (CX - p.x) * 0.06;
    const dy = (CY - p.y) * 0.06;
    return `translate(${dx},${dy})`;
  };

  const pTop = polar(CX, CY, R_CASE - 4, 62);
  const pBot = polar(CX, CY, R_CASE - 4, 118);
  const crownP = polar(CX, CY, R_CASE - 2, 90);

  return (
    <div className="w-full max-w-[560px] mx-auto select-none">
      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto block"
          style={{ overflow: 'visible' }}
          aria-label="Solaria grand-complication — interactive portfolio centerpiece"
        >
          <defs>
            <radialGradient id="caseGrad" cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#3a3a40" />
              <stop offset="55%" stopColor="#1c1c20" />
              <stop offset="100%" stopColor="#0a0a0c" />
            </radialGradient>
            <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5a5a62" />
              <stop offset="45%" stopColor="#2a2a2e" />
              <stop offset="100%" stopColor="#16161a" />
            </linearGradient>
            <radialGradient id="dialGreen" cx="50%" cy="40%" r="72%">
              <stop offset="0%" stopColor="#15604a" />
              <stop offset="55%" stopColor="#0c3a2e" />
              <stop offset="100%" stopColor="#06231a" />
            </radialGradient>
            <radialGradient id="subGreen" cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#104534" />
              <stop offset="100%" stopColor="#061d16" />
            </radialGradient>
            <linearGradient id="handGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f6f9f4" />
              <stop offset="100%" stopColor="#aeb4ac" />
            </linearGradient>
            <linearGradient id="steelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cfd8c8" />
              <stop offset="100%" stopColor="#3a3a40" />
            </linearGradient>
            <radialGradient id="moonLit" cx="42%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#eef2dd" />
              <stop offset="100%" stopColor="#c4cf9e" />
            </radialGradient>
            <clipPath id="moonClip">
              <circle cx={MOON_C.x} cy={MOON_C.y} r={MOON_R} />
            </clipPath>
          </defs>

          {staticArt}
          {markers}

          {/* === Moonphase aperture === */}
          <g>
            <circle cx={MOON_C.x} cy={MOON_C.y} r={MOON_R} fill="#06201a" stroke="#1f4636" strokeWidth="1" />
            <g clipPath="url(#moonClip)">
              <circle cx={MOON_C.x + (0.5 - phase) * 4 * MOON_R} cy={MOON_C.y} r={MOON_R} fill="url(#moonLit)" />
            </g>
            <circle cx={MOON_C.x} cy={MOON_C.y} r={MOON_R} fill="none" stroke="#0a2a20" strokeWidth="0.5" />
            <text x={MOON_C.x} y={MOON_C.y + MOON_R + 8} textAnchor="middle" fill={MUTED} fontSize="4.5"
              letterSpacing="1.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              LUNE
            </text>
          </g>

          {/* === 24h day/night indicator === */}
          <g>
            <circle cx={SUN_C.x} cy={SUN_C.y} r={SUN_R} fill="url(#subGreen)" stroke="#1f4636" strokeWidth="1" />
            {[0, 90, 180, 270].map((d) => {
              const a = polar(SUN_C.x, SUN_C.y, SUN_R, d);
              const b = polar(SUN_C.x, SUN_C.y, SUN_R - 3, d);
              return <line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={MUTED} strokeWidth="0.6" opacity="0.6" />;
            })}
            {(() => {
              const p = polar(SUN_C.x, SUN_C.y, SUN_R - 5, dayNight * 360);
              const isDay = now.getHours() >= 6 && now.getHours() < 18;
              return (
                <>
                  <line x1={SUN_C.x} y1={SUN_C.y} x2={p.x} y2={p.y} stroke={isDay ? LIME : MUTED} strokeWidth="1" />
                  <circle cx={p.x} cy={p.y} r="2.5" fill={isDay ? LIME : SILVER} />
                </>
              );
            })()}
            <text x={SUN_C.x} y={SUN_C.y + SUN_R + 8} textAnchor="middle" fill={MUTED} fontSize="4.5"
              letterSpacing="1.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              24H
            </text>
          </g>

          {/* === DATE sub-dial (live) === */}
          <g>
            <text x={DATE_C.x} y={DATE_C.y - 11} textAnchor="middle" fill={MUTED} fontSize="5.5" letterSpacing="2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>{dayShort}</text>
            <text x={DATE_C.x} y={DATE_C.y + 9} textAnchor="middle" fill={SILVER} fontSize="19" fontWeight="600"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>{dateNum}</text>
          </g>

          {/* === WORK sub-dial (live Claude activity) === */}
          <g>
            <text x={WORK_C.x} y={WORK_C.y - 11} textAnchor="middle" fill={MUTED} fontSize="5.5" letterSpacing="2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>WORK</text>
            <text x={WORK_C.x} y={WORK_C.y + 6} textAnchor="middle" fill={LIME} fontSize="15" fontWeight="700"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>{todayActivity}</text>
            <text x={WORK_C.x} y={WORK_C.y + 16} textAnchor="middle" fill={MUTED} fontSize="4.5" letterSpacing="1.2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>MSG · TODAY</text>
          </g>

          {/* === PULSE sub-dial (Spotify live) === */}
          <g>
            <text x={PULSE_C.x} y={PULSE_C.y - 11} textAnchor="middle" fill={MUTED} fontSize="5.5" letterSpacing="2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>PULSE</text>
            <circle cx={PULSE_C.x} cy={PULSE_C.y + 2} r={5.5}
              fill={isPlaying ? '#34d399' : '#16302a'} stroke={isPlaying ? '#34d399' : '#1f4636'} strokeWidth="1">
              {isPlaying && <animate attributeName="r" values="5.5;8;5.5" dur="1.4s" repeatCount="indefinite" />}
            </circle>
            <text x={PULSE_C.x} y={PULSE_C.y + 18} textAnchor="middle" fill={MUTED} fontSize="4.5" letterSpacing="1.2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>{isPlaying ? 'LIVE' : 'SILENT'}</text>
          </g>

          {/* === Hands (live) === */}
          {(() => {
            const h = polar(CX, CY, R_HAND_HOUR, hourAngle);
            const m = polar(CX, CY, R_HAND_MIN, minuteAngle);
            const s = polar(CX, CY, R_HAND_SEC, secondAngle);
            const sBack = polar(CX, CY, -22, secondAngle);
            const hLume = polar(CX, CY, R_HAND_HOUR - 6, hourAngle);
            const mLume = polar(CX, CY, R_HAND_MIN - 6, minuteAngle);
            return (
              <>
                <line x1={CX} y1={CY} x2={h.x} y2={h.y} stroke="url(#handGrad)" strokeWidth={7} strokeLinecap="round" />
                <line x1={CX} y1={CY} x2={h.x} y2={h.y} stroke="#06231a" strokeWidth={1.8} strokeLinecap="round" />
                <circle cx={hLume.x} cy={hLume.y} r={3.2} fill={LIME} />
                <line x1={CX} y1={CY} x2={m.x} y2={m.y} stroke="url(#handGrad)" strokeWidth={4} strokeLinecap="round" />
                <line x1={CX} y1={CY} x2={m.x} y2={m.y} stroke="#06231a" strokeWidth={1.2} strokeLinecap="round" />
                <circle cx={mLume.x} cy={mLume.y} r={2.4} fill={LIME} />
                <line x1={sBack.x} y1={sBack.y} x2={s.x} y2={s.y} stroke={LIME} strokeWidth={1.4} strokeLinecap="round" />
                <circle cx={sBack.x} cy={sBack.y} r={4} fill={LIME} />
                <circle cx={CX} cy={CY} r={7.5} fill={SILVER} />
                <circle cx={CX} cy={CY} r={4} fill={LIME} />
                <circle cx={CX} cy={CY} r={1.4} fill="#06231a" />
              </>
            );
          })()}

          {/* === Crown + chronograph pushers (layer switcher) === */}
          <text x={crownP.x + 18} y={CY - 58} fill={LIME} fontSize="5.5" letterSpacing="1.2" textAnchor="end"
            style={{ fontFamily: 'var(--font-mono), monospace' }}>
            PUSHERS · SWITCH LAYER
          </text>

          {/* NEXT pusher (≈2 o'clock) */}
          <g
            onClick={() => pushLayer(1)}
            className="cursor-pointer"
            transform={pressOffset('next')}
            style={{ transition: 'transform 140ms ease' }}
            aria-label="Pusher — next layer"
          >
            <title>Next layer · → key</title>
            <rect x={pTop.x - 7} y={pTop.y - 8} width={18} height={16} rx={3}
              fill="#2a2a2e" stroke="#06231a" strokeWidth="0.6" />
            <circle cx={pTop.x + 2} cy={pTop.y} r="2.4" fill={pressed === 'next' ? LIME : MUTED} />
          </g>

          {/* PREV pusher (≈4 o'clock) */}
          <g
            onClick={() => pushLayer(-1)}
            className="cursor-pointer"
            transform={pressOffset('prev')}
            style={{ transition: 'transform 140ms ease' }}
            aria-label="Pusher — previous layer"
          >
            <title>Previous layer · ← key</title>
            <rect x={pBot.x - 7} y={pBot.y - 8} width={18} height={16} rx={3}
              fill="#2a2a2e" stroke="#06231a" strokeWidth="0.6" />
            <circle cx={pBot.x + 2} cy={pBot.y} r="2.4" fill={pressed === 'prev' ? LIME : MUTED} />
          </g>

          {/* Crown (decorative; also cycles forward) */}
          <g onClick={() => pushLayer(1)} className="cursor-pointer" aria-label="Crown">
            <title>Crown · cycle layer</title>
            <path d={`M ${crownP.x - 4} ${CY - 18} Q ${crownP.x + 22} ${CY - 22} ${crownP.x + 26} ${CY - 10}
                      L ${crownP.x + 26} ${CY + 10} Q ${crownP.x + 22} ${CY + 22} ${crownP.x - 4} ${CY + 18} Z`}
              fill="url(#caseGrad)" stroke="#16161a" strokeWidth="0.5" />
            <g transform={`rotate(${crownSpin} ${crownP.x + 12} ${CY})`}
              style={{ transition: 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <rect x={crownP.x} y={CY - 11} width={22} height={22} rx={3}
                fill="#2a2a2e" stroke="#06231a" strokeWidth="0.6" />
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={crownP.x + 2 + i * 4} y1={CY - 9} x2={crownP.x + 2 + i * 4} y2={CY + 9}
                  stroke="#06231a" strokeWidth="0.8" />
              ))}
              <circle cx={crownP.x + 11} cy={CY} r="2.5" fill={LIME} />
            </g>
          </g>
        </svg>
      </div>

      {/* --- Readout below the watch --- */}
      <div className="mt-6 h-20 flex items-center justify-center">
        {hovered ? (
          hovered.slug ? (
            <a href={`/projects/${hovered.slug}`} className="block text-center group">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                Hour {((hoveredHour ?? 0) === 0 ? 12 : hoveredHour)}
                <span className="text-divider mx-1.5">·</span>
                {hovered.kind}
              </div>
              <div className="font-serif text-2xl group-hover:text-rose-300 transition-colors">
                {hovered.label}
              </div>
              {hovered.meta?.description ? (
                <div className="text-xs text-muted mt-1">{String(hovered.meta.description)}</div>
              ) : (
                <div className="text-[10px] font-mono uppercase tracking-widest text-rose-400 mt-1">
                  Click to open →
                </div>
              )}
            </a>
          ) : (
            <div className="text-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                Hour {((hoveredHour ?? 0) === 0 ? 12 : hoveredHour)}
                <span className="text-divider mx-1.5">·</span>
                {hovered.kind}
              </div>
              <div className="font-serif text-2xl">{hovered.label}</div>
              {hovered.meta?.period ? (
                <div className="text-xs font-mono text-muted mt-1">{String(hovered.meta.period)}</div>
              ) : null}
            </div>
          )
        ) : (
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Hover a marker to inspect · press the chronograph pushers to switch layer
            </div>
          </div>
        )}
      </div>

      {/* --- Layer selector pills --- */}
      <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
        {LAYER_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => { setLayerKey(key); setHoveredHour(null); }}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border transition-colors ${
              key === layerKey
                ? 'bg-rose-400 text-bg border-rose-400'
                : 'bg-bg/60 text-muted border-divider hover:text-primary hover:border-muted'
            }`}
          >
            {LAYERS[key].label}
          </button>
        ))}
      </div>
    </div>
  );
}
