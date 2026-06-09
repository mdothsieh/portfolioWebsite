'use client';

import { useEffect, useMemo, useState } from 'react';
import { graphData, type GraphNode, type NodeKind } from '@/data/graph';
import { round3 as r3, polar } from '@/lib/geometry';

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
// Palette (Corsa — Apple × Ferrari, Daytona-inspired reverse-panda)
// ---------------------------------------------------------------------------

const RED = '#FF3B30';      // Apple system red ≈ Ferrari Rosso — the signature
const SILVER = '#f4f6f8';   // crisp off-white (markers, hands, dial text)
const MUTED = '#9aa0a9';    // graphite gray (minor ticks, dial labels)
const SUB_INK = '#16191f';  // dark text on the light silver sub-registers
const SUB_MUTE = '#6a6f78'; // muted label on the silver sub-registers

// ---------------------------------------------------------------------------
// Geometry — round chronograph case, tri-compax (Daytona-style) layout
// ---------------------------------------------------------------------------

const VB_W = 480;
const VB_H = 640;
const CX = 240;
const CY = 300;

const R_CASE = 198;     // polished steel case
const R_BEZEL_O = 192;  // tachymeter bezel outer
const R_BEZEL_I = 162;  // tachymeter bezel inner (meets the flange)
const R_TACHY = 177;    // tachymeter numeral radius
const R_FLANGE = 159;   // thin flange ring between bezel and dial
const R_DIAL = 156;     // matte black dial
const R_TRACK = 148;    // outer minute track
const R_CHAP = 143;     // hour-marker outer tip / node-dot ring
const R_MARK_I = 126;   // hour-marker (baton) inner end

const SUB_C = 80;       // sub-register centre distance from dial centre
const SUB_R = 28;       // sub-register radius
const ACT_C = { x: CX - SUB_C, y: CY };        // 9 o'clock — Claude activity
const PULSE_C = { x: CX + SUB_C, y: CY };       // 3 o'clock — Spotify pulse
const DATE_C = { x: CX, y: CY + SUB_C };        // 6 o'clock — date

const R_HAND_HOUR = 52;
const R_HAND_MIN = 86;
const R_HAND_SEC = 120;

// Tachymeter scale: [unitsPerHour, angleFrom12]. angle = 21600 / value.
const TACHY: [number, number][] = [
  [400, 54], [300, 72], [240, 90], [200, 108], [175, 123.4], [150, 144],
  [130, 166.2], [120, 180], [110, 196.4], [100, 216], [90, 240], [80, 270],
  [70, 308.6], [65, 332.3], [60, 360],
];

// Spread polar() as x/y/cx/cy props on an element (relative to the dial centre).
function polarObj(r: number, deg: number) {
  const p = polar(CX, CY, r, deg);
  return { x: p.x, y: p.y, cx: p.x, cy: p.y };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WatchFaceProps {
  isPlaying?: boolean;
  todayActivity?: number;
}

// Deterministic seed time so the server render and the client's first render
// agree (no hydration mismatch). It's the classic 10:08 watch-display pose; the
// rAF loop below snaps to real time on mount, so it's only ever a single frame.
const SEED_TIME = new Date(2025, 0, 1, 10, 8, 0, 0);

export function WatchFace({ isPlaying = false, todayActivity = 0 }: WatchFaceProps) {
  const [now, setNow] = useState<Date>(SEED_TIME);
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

  const dateNum = now.getDate();
  const dayShort = now.toLocaleString('en', { weekday: 'short' }).toUpperCase();

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

  // ----- Static art: case, tachymeter bezel, dial, minute track, sub-register
  // wells, and branding. Time-independent → memoized so the 60fps clock never
  // re-renders it. --------------------------------------------------------------
  const staticArt = useMemo(() => {
    const subWell = (c: { x: number; y: number }) => (
      <g>
        {/* light silver register (reverse-panda) */}
        <circle cx={c.x} cy={c.y} r={SUB_R} fill="url(#subSilver)" />
        {/* snailed concentric grooves */}
        {[SUB_R - 5, SUB_R - 11, SUB_R - 17, SUB_R - 22].map((rr) => (
          <circle key={rr} cx={c.x} cy={c.y} r={rr} fill="none" stroke="#aab0ba" strokeWidth="0.4" opacity="0.5" />
        ))}
        {/* edge graduations */}
        {Array.from({ length: 12 }, (_, k) => {
          const a = polar(c.x, c.y, SUB_R - 1.5, k * 30);
          const b = polar(c.x, c.y, SUB_R - (k % 3 === 0 ? 5 : 3), k * 30);
          return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#7d828c" strokeWidth="0.5" opacity="0.7" />;
        })}
        {/* polished bevel ring */}
        <circle cx={c.x} cy={c.y} r={SUB_R} fill="none" stroke="#d6dae0" strokeWidth="1.4" />
        <circle cx={c.x} cy={c.y} r={SUB_R + 1.4} fill="none" stroke="#15171c" strokeWidth="1.2" />
      </g>
    );

    return (
      <g>
        {/* polished steel case + bezel rim */}
        <circle cx={CX} cy={CY} r={R_CASE} fill="url(#caseGrad)" />
        <circle cx={CX} cy={CY} r={R_BEZEL_O} fill="url(#bezelDark)" />
        <circle cx={CX} cy={CY} r={R_BEZEL_O} fill="none" stroke="url(#bezelRim)" strokeWidth="2.5" />

        {/* tachymeter scale — fine ticks + units-per-hour numerals */}
        {Array.from({ length: 60 }, (_, i) => {
          const angle = i * 6;
          const a = polar(CX, CY, R_BEZEL_O - 4, angle);
          const b = polar(CX, CY, R_BEZEL_O - (i % 5 === 0 ? 9 : 6.5), angle);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={MUTED} strokeWidth={i % 5 === 0 ? 0.8 : 0.45} opacity="0.55" />;
        })}
        {TACHY.map(([val, angle]) => {
          const p = polar(CX, CY, R_TACHY, angle);
          const t = polar(CX, CY, R_BEZEL_O - 4, angle);
          const u = polar(CX, CY, R_BEZEL_O - 11, angle);
          return (
            <g key={val}>
              <line x1={t.x} y1={t.y} x2={u.x} y2={u.y} stroke={SILVER} strokeWidth="1" opacity="0.85" />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                fill={SILVER} fontSize="6.6" letterSpacing="0.3" opacity="0.9"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>{val}</text>
            </g>
          );
        })}
        <text x={CX} y={CY - R_TACHY - 3} textAnchor="middle" fill={RED} fontSize="5.2" letterSpacing="2.6"
          style={{ fontFamily: 'var(--font-mono), monospace' }}>TACHYMÈTRE</text>

        {/* flange + matte black dial */}
        <circle cx={CX} cy={CY} r={R_BEZEL_I} fill="#0a0b0e" />
        <circle cx={CX} cy={CY} r={R_FLANGE} fill="none" stroke="#2b2f37" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R_DIAL} fill="url(#dialDark)" />

        {/* outer minute / seconds track */}
        {Array.from({ length: 60 }, (_, i) => {
          const angle = i * 6;
          const major = i % 5 === 0;
          const a = polar(CX, CY, R_TRACK, angle);
          const b = polar(CX, CY, R_TRACK - (major ? 6 : 3), angle);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={major ? SILVER : MUTED} strokeWidth={major ? 1.1 : 0.5} opacity={major ? 0.8 : 0.4} strokeLinecap="round" />;
        })}

        {/* three silver sub-registers (9 · 3 · 6) */}
        {subWell(ACT_C)}
        {subWell(PULSE_C)}
        {subWell(DATE_C)}

        {/* branding — CORSA, no maker's marks but our own */}
        <path d={`M ${CX} ${CY - 96} l 4 4 l -4 4 l -4 -4 z`} fill={RED} />
        <text x={CX} y={CY - 82} textAnchor="middle" fill={SILVER} fontSize="12" fontWeight="700" letterSpacing="5"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>CORSA</text>
        <text x={CX} y={CY - 70} textAnchor="middle" fill={MUTED} fontSize="4.6" letterSpacing="2.4"
          style={{ fontFamily: 'var(--font-mono), monospace' }}>PRECISION · CHRONOGRAPH</text>
        {/* single red model word, seated in the clear gap between the 9/3 and
            6 registers so nothing overlaps */}
        <text x={CX} y={CY + 36} textAnchor="middle" fill={RED} fontSize="6.5" letterSpacing="3.2"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>CHRONOGRAPHE</text>
      </g>
    );
  }, []);

  // ----- Hour markers (applied batons) = the interactive data layer -----------
  const markers = useMemo(() => (
    <g>
      {slots.map((node, i) => {
        const angle = i * 30;
        const isMajor = i % 3 === 0;
        const hasNode = !!node;
        const isHovered = hoveredHour === i;
        const inner = polar(CX, CY, R_MARK_I, angle);
        const outer = polar(CX, CY, R_CHAP, angle);
        const dot = polar(CX, CY, (R_MARK_I + R_CHAP) / 2, angle);

        return (
          <g key={i}>
            {/* applied baton (12 o'clock gets a wider double index) */}
            {i === 0 ? (
              <>
                <line x1={inner.x - 3} y1={inner.y} x2={outer.x - 3} y2={outer.y} stroke="url(#batonGrad)" strokeWidth={3.2} strokeLinecap="round" />
                <line x1={inner.x + 3} y1={inner.y} x2={outer.x + 3} y2={outer.y} stroke="url(#batonGrad)" strokeWidth={3.2} strokeLinecap="round" />
                <circle {...polarObj(R_CHAP + 4, 0)} r="2" fill={RED} />
              </>
            ) : (
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke="url(#batonGrad)" strokeWidth={isMajor ? 5 : 3} strokeLinecap="round"
                opacity={hasNode ? 1 : 0.82} />
            )}

            {/* interactive data node sitting on the baton */}
            {hasNode && (
              <g
                onMouseEnter={() => setHoveredHour(i)}
                onMouseLeave={() => setHoveredHour(null)}
                onClick={() => { if (node?.slug) window.location.href = `/projects/${node.slug}`; }}
                className={node?.slug ? 'cursor-pointer' : 'cursor-help'}
              >
                <circle cx={dot.x} cy={dot.y} r={16} fill="transparent" />
                <circle cx={dot.x} cy={dot.y} r={isHovered ? 5.5 : 3}
                  fill={RED} style={{ transition: 'r 200ms ease' }} />
                {isHovered && (
                  <circle cx={dot.x} cy={dot.y} r={10} fill="none" stroke={RED} strokeWidth={1} opacity={0.5} />
                )}
              </g>
            )}
          </g>
        );
      })}
    </g>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [slots, hoveredHour]);

  // Pusher press offset (towards centre)
  const pressOffset = (dir: 'next' | 'prev') => {
    if (pressed !== dir) return 'translate(0,0)';
    const p = dir === 'next' ? polar(CX, CY, R_CASE, 62) : polar(CX, CY, R_CASE, 118);
    const dx = r3((CX - p.x) * 0.06);
    const dy = r3((CY - p.y) * 0.06);
    return `translate(${dx},${dy})`;
  };

  const pTop = polar(CX, CY, R_CASE - 4, 62);
  const pBot = polar(CX, CY, R_CASE - 4, 118);
  const crownP = polar(CX, CY, R_CASE - 2, 90);

  return (
    <div className="w-full max-w-[560px] mx-auto select-none">
      <div className="relative">
        <svg
          viewBox={`0 78 ${VB_W} ${VB_H - 176}`}
          className="w-full h-auto block"
          style={{ overflow: 'visible' }}
          aria-label="Corsa chronograph — interactive portfolio centerpiece"
        >
          <defs>
            <radialGradient id="caseGrad" cx="50%" cy="36%" r="66%">
              <stop offset="0%" stopColor="#43454c" />
              <stop offset="55%" stopColor="#202227" />
              <stop offset="100%" stopColor="#0a0a0c" />
            </radialGradient>
            <radialGradient id="bezelDark" cx="50%" cy="38%" r="68%">
              <stop offset="0%" stopColor="#26282d" />
              <stop offset="60%" stopColor="#141519" />
              <stop offset="100%" stopColor="#0a0b0d" />
            </radialGradient>
            <linearGradient id="bezelRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6a6c74" />
              <stop offset="50%" stopColor="#2a2c31" />
              <stop offset="100%" stopColor="#17181c" />
            </linearGradient>
            <radialGradient id="dialDark" cx="50%" cy="40%" r="74%">
              <stop offset="0%" stopColor="#1d2027" />
              <stop offset="58%" stopColor="#0e1013" />
              <stop offset="100%" stopColor="#08090b" />
            </radialGradient>
            <radialGradient id="subSilver" cx="46%" cy="36%" r="70%">
              <stop offset="0%" stopColor="#eef1f5" />
              <stop offset="60%" stopColor="#cfd4db" />
              <stop offset="100%" stopColor="#a9aeb8" />
            </radialGradient>
            <linearGradient id="batonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#d4d8de" />
              <stop offset="100%" stopColor="#9aa0aa" />
            </linearGradient>
            <linearGradient id="handGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbfdff" />
              <stop offset="100%" stopColor="#aeb4bd" />
            </linearGradient>
          </defs>

          {staticArt}
          {markers}

          {/* === 9 o'clock register — Claude activity === */}
          <g>
            <text x={ACT_C.x} y={ACT_C.y - 12} textAnchor="middle" fill={SUB_MUTE} fontSize="4.6" letterSpacing="1.5"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>ACTIVITY</text>
            <text x={ACT_C.x} y={ACT_C.y + 4} textAnchor="middle" fill={RED} fontSize="12.5" fontWeight="700"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>{todayActivity}</text>
            <text x={ACT_C.x} y={ACT_C.y + 14} textAnchor="middle" fill={SUB_MUTE} fontSize="3.9" letterSpacing="1"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>MSG · TODAY</text>
          </g>

          {/* === 3 o'clock register — Spotify pulse === */}
          <g>
            <text x={PULSE_C.x} y={PULSE_C.y - 12} textAnchor="middle" fill={SUB_MUTE} fontSize="4.6" letterSpacing="1.5"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>PULSE</text>
            <circle cx={PULSE_C.x} cy={PULSE_C.y + 1} r={4.5}
              fill={isPlaying ? RED : '#b2b7c0'} stroke={isPlaying ? RED : '#8b909a'} strokeWidth="1">
              {isPlaying && <animate attributeName="r" values="4.5;7;4.5" dur="1.4s" repeatCount="indefinite" />}
            </circle>
            <text x={PULSE_C.x} y={PULSE_C.y + 14} textAnchor="middle" fill={SUB_MUTE} fontSize="3.9" letterSpacing="1.1"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>{isPlaying ? 'LIVE' : 'QUIET'}</text>
          </g>

          {/* === 6 o'clock register — date === */}
          <g>
            <text x={DATE_C.x} y={DATE_C.y - 11} textAnchor="middle" fill={SUB_MUTE} fontSize="4.6" letterSpacing="1.6"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>{dayShort}</text>
            <text x={DATE_C.x} y={DATE_C.y + 7} textAnchor="middle" fill={SUB_INK} fontSize="14.5" fontWeight="700"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>{dateNum}</text>
          </g>

          {/* === Hands === */}
          {(() => {
            const h = polar(CX, CY, R_HAND_HOUR, hourAngle);
            const m = polar(CX, CY, R_HAND_MIN, minuteAngle);
            const s = polar(CX, CY, R_HAND_SEC, secondAngle);
            const sBack = polar(CX, CY, -24, secondAngle);
            const hLume = polar(CX, CY, R_HAND_HOUR - 7, hourAngle);
            const mLume = polar(CX, CY, R_HAND_MIN - 7, minuteAngle);
            return (
              <>
                {/* hour + minute baton hands with red lume pips */}
                <line x1={CX} y1={CY} x2={h.x} y2={h.y} stroke="url(#handGrad)" strokeWidth={6} strokeLinecap="round" />
                <line x1={CX} y1={CY} x2={h.x} y2={h.y} stroke="#0a0c10" strokeWidth={1.6} strokeLinecap="round" />
                <circle cx={hLume.x} cy={hLume.y} r={3} fill={RED} />
                <line x1={CX} y1={CY} x2={m.x} y2={m.y} stroke="url(#handGrad)" strokeWidth={3.6} strokeLinecap="round" />
                <line x1={CX} y1={CY} x2={m.x} y2={m.y} stroke="#0a0c10" strokeWidth={1.1} strokeLinecap="round" />
                <circle cx={mLume.x} cy={mLume.y} r={2.3} fill={RED} />
                {/* central chronograph seconds — the long red sweep */}
                <line x1={sBack.x} y1={sBack.y} x2={s.x} y2={s.y} stroke={RED} strokeWidth={1.5} strokeLinecap="round" />
                <circle cx={sBack.x} cy={sBack.y} r={4} fill={RED} />
                {/* centre cap */}
                <circle cx={CX} cy={CY} r={6.5} fill={SILVER} />
                <circle cx={CX} cy={CY} r={3.4} fill={RED} />
                <circle cx={CX} cy={CY} r={1.3} fill="#0a0c10" />
              </>
            );
          })()}

          {/* === Crown + chronograph pushers (layer switcher) === */}
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
              fill="url(#bezelRim)" stroke="#0a0c10" strokeWidth="0.6" />
            <circle cx={pTop.x + 2} cy={pTop.y} r="2.4" fill={pressed === 'next' ? RED : MUTED} />
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
              fill="url(#bezelRim)" stroke="#0a0c10" strokeWidth="0.6" />
            <circle cx={pBot.x + 2} cy={pBot.y} r="2.4" fill={pressed === 'prev' ? RED : MUTED} />
          </g>

          {/* Screw-down crown (decorative; also cycles forward) */}
          <g onClick={() => pushLayer(1)} className="cursor-pointer" aria-label="Crown">
            <title>Crown · cycle layer</title>
            <path d={`M ${crownP.x - 4} ${CY - 18} Q ${crownP.x + 22} ${CY - 22} ${crownP.x + 26} ${CY - 10}
                      L ${crownP.x + 26} ${CY + 10} Q ${crownP.x + 22} ${CY + 22} ${crownP.x - 4} ${CY + 18} Z`}
              fill="url(#caseGrad)" stroke="#16161a" strokeWidth="0.5" />
            <g transform={`rotate(${crownSpin} ${crownP.x + 12} ${CY})`}
              style={{ transition: 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <rect x={crownP.x} y={CY - 11} width={22} height={22} rx={4}
                fill="url(#bezelRim)" stroke="#0a0c10" strokeWidth="0.6" />
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={crownP.x + 2 + i * 4} y1={CY - 9} x2={crownP.x + 2 + i * 4} y2={CY + 9}
                  stroke="#0a0c10" strokeWidth="0.8" />
              ))}
              <circle cx={crownP.x + 11} cy={CY} r="2.5" fill={RED} />
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

      {/* --- Layer selector pills + explicit instructions --- */}
      <div className="mt-3 text-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2.5">
          Click a button to switch the dial&apos;s data layer
          <span className="text-divider mx-1.5">·</span>
          or the watch pushers / <kbd className="text-primary">←</kbd> <kbd className="text-primary">→</kbd>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {LAYER_ORDER.map((key) => (
            <button
              key={key}
              onClick={() => { setLayerKey(key); setHoveredHour(null); }}
              aria-pressed={key === layerKey}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest border transition-colors ${
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
    </div>
  );
}
