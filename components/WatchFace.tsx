'use client';

import { useEffect, useMemo, useState } from 'react';
import { graphData, type GraphNode, type NodeKind } from '@/data/graph';

// ---------------------------------------------------------------------------
// Layers — what the 12 hour markers represent
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
// Geometry — tonneau case (Richard Mille RM 35-03 reference)
// ---------------------------------------------------------------------------

const VB_W = 480;
const VB_H = 640;
const CX = VB_W / 2;        // 240
const CY = 305;             // shifted slightly higher to give tourbillon room

const RX_MARKER = 132;
const RY_MARKER = 178;
const RX_HIT = 152;
const RY_HIT = 200;

const R_HAND_HOUR = 80;
const R_HAND_MIN = 115;
const R_HAND_SEC = 138;

const SUBDIAL_R = 34;
const SUBDIAL_DATE_Y = CY - 88;
const SUBDIAL_LEFT_X = CX - 92;
const SUBDIAL_RIGHT_X = CX + 92;

// Tourbillon at the 6 position (replaces the "6" numeral)
const TOURB_X = CX;
const TOURB_Y = CY + 102;
const TOURB_R = 32;

const TONNEAU_CASE = `
  M 90 90
  C 90 70, 110 60, 140 60
  L 340 60
  C 370 60, 390 70, 390 90
  C 420 150, 430 240, 430 320
  C 430 400, 420 490, 390 550
  C 390 570, 370 580, 340 580
  L 140 580
  C 110 580, 90 570, 90 550
  C 60 490, 50 400, 50 320
  C 50 240, 60 150, 90 90
  Z
`;

const TONNEAU_BEZEL = `
  M 100 105
  C 100 85, 120 75, 150 75
  L 330 75
  C 360 75, 380 85, 380 105
  C 408 160, 416 245, 416 320
  C 416 395, 408 480, 380 535
  C 380 555, 360 565, 330 565
  L 150 565
  C 120 565, 100 555, 100 535
  C 72 480, 64 395, 64 320
  C 64 245, 72 160, 100 105
  Z
`;

const TONNEAU_DIAL = `
  M 110 120
  C 110 102, 128 94, 158 94
  L 322 94
  C 352 94, 370 102, 370 120
  C 396 168, 404 248, 404 320
  C 404 392, 396 472, 370 520
  C 370 538, 352 546, 322 546
  L 158 546
  C 128 546, 110 538, 110 520
  C 84 472, 76 392, 76 320
  C 76 248, 84 168, 110 120
  Z
`;

function ellipsePoint(cx: number, cy: number, rx: number, ry: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) };
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ---------------------------------------------------------------------------
// Spline-head screw (Torx-style, RM signature)
// ---------------------------------------------------------------------------

function Screw({ x, y, size = 5 }: { x: number; y: number; size?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={size} fill="#2a2a2e" stroke="#0a0a0b" strokeWidth="0.6" />
      <circle cx={x} cy={y} r={size - 1.5} fill="none" stroke="#0a0a0b" strokeWidth="0.4" opacity="0.8" />
      {[18, 90, 162, 234, 306].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={x + 1 * Math.cos(a)}
            y1={y + 1 * Math.sin(a)}
            x2={x + (size - 0.8) * Math.cos(a)}
            y2={y + (size - 0.8) * Math.sin(a)}
            stroke="#0a0a0b"
            strokeWidth="0.7"
          />
        );
      })}
    </g>
  );
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

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setNow(new Date());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Arrow keys cycle layers (ignored while typing, e.g. in the command palette)
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

  // Tourbillon cage rotates once per minute (60s) — match the second hand angle
  const tourbillonAngle = secondAngle;

  const dateNum = now.getDate();
  const dayShort = now.toLocaleString('en', { weekday: 'short' }).toUpperCase();

  const hovered = hoveredHour != null ? slots[hoveredHour] : null;

  function cycleLayer(dir: number = 1) {
    const i = LAYER_ORDER.indexOf(layerKey);
    const next = (i + dir + LAYER_ORDER.length) % LAYER_ORDER.length;
    setLayerKey(LAYER_ORDER[next]);
    setHoveredHour(null);
    setCrownSpin((s) => s + dir * 36); // tactile crown turn
  }

  return (
    <div className="w-full max-w-[560px] mx-auto select-none">
      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto block"
          style={{ overflow: 'visible' }}
          aria-label="Mechanical watch — interactive portfolio centerpiece"
        >
          <defs>
            <linearGradient id="caseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a2a2e" />
              <stop offset="50%" stopColor="#16161a" />
              <stop offset="100%" stopColor="#08080a" />
            </linearGradient>
            <pattern id="carbonWeave" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
              <rect width="5" height="5" fill="#08080a" />
              <path d="M0 5 L5 0" stroke="#1f1f24" strokeWidth="0.5" />
              <path d="M-1 1 L1 -1 M4 6 L6 4" stroke="#1f1f24" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="subdialGrad" cx="50%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#1c1c20" />
              <stop offset="100%" stopColor="#08080a" />
            </radialGradient>
            <linearGradient id="handGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#a8a8ac" />
            </linearGradient>
            <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a4a50" />
              <stop offset="50%" stopColor="#2a2a2e" />
              <stop offset="100%" stopColor="#1a1a1d" />
            </linearGradient>
            {/* Titanium bridge finish */}
            <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6b6b73" />
              <stop offset="50%" stopColor="#4a4a52" />
              <stop offset="100%" stopColor="#2a2a30" />
            </linearGradient>
            {/* Tourbillon cage outline gradient */}
            <linearGradient id="tourbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b8b95" />
              <stop offset="100%" stopColor="#3a3a40" />
            </linearGradient>
            {/* Perlage suggestion via pattern */}
            <pattern id="perlage" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="url(#bridgeGrad)" />
              <circle cx="4" cy="4" r="2.5" fill="none" stroke="#2a2a30" strokeWidth="0.4" opacity="0.5" />
            </pattern>
          </defs>

          {/* === Strap lugs === */}
          <g opacity="0.85">
            <rect x={CX - 70} y={28} width={140} height={22} rx={4} fill="url(#caseGrad)" />
            <rect x={CX - 70} y={590} width={140} height={22} rx={4} fill="url(#caseGrad)" />
          </g>

          {/* === Case + bezel === */}
          <path d={TONNEAU_CASE} fill="url(#caseGrad)" />
          <path d={TONNEAU_CASE} fill="none" stroke="url(#bezelGrad)" strokeWidth="2.5" />
          <path d={TONNEAU_BEZEL} fill="none" stroke="#3a3a40" strokeWidth="1" />

          {/* === Dial: carbon weave === */}
          <path d={TONNEAU_DIAL} fill="url(#carbonWeave)" />

          {/* === Bridges (visible movement architecture) === */}
          {/* Upper bridge — anchors the DATE subdial */}
          <path
            d={`M ${CX - 56} ${SUBDIAL_DATE_Y + 6}
                Q ${CX - 30} ${SUBDIAL_DATE_Y - 8} ${CX} ${SUBDIAL_DATE_Y - 12}
                Q ${CX + 30} ${SUBDIAL_DATE_Y - 8} ${CX + 56} ${SUBDIAL_DATE_Y + 6}
                L ${CX + 50} ${SUBDIAL_DATE_Y + 14}
                Q ${CX + 28} ${SUBDIAL_DATE_Y + 4} ${CX} ${SUBDIAL_DATE_Y + 2}
                Q ${CX - 28} ${SUBDIAL_DATE_Y + 4} ${CX - 50} ${SUBDIAL_DATE_Y + 14}
                Z`}
            fill="url(#bridgeGrad)"
            stroke="#0a0a0b"
            strokeWidth="0.5"
            opacity="0.85"
          />

          {/* Central bridge — horizontal plate between WORK and PULSE */}
          <path
            d={`M ${SUBDIAL_LEFT_X + SUBDIAL_R - 4} ${CY - 8}
                L ${SUBDIAL_RIGHT_X - SUBDIAL_R + 4} ${CY - 8}
                L ${SUBDIAL_RIGHT_X - SUBDIAL_R + 4} ${CY + 8}
                L ${SUBDIAL_LEFT_X + SUBDIAL_R - 4} ${CY + 8}
                Z`}
            fill="url(#perlage)"
            stroke="#0a0a0b"
            strokeWidth="0.5"
            opacity="0.7"
          />
          <Screw x={SUBDIAL_LEFT_X + SUBDIAL_R + 2} y={CY} size={3} />
          <Screw x={SUBDIAL_RIGHT_X - SUBDIAL_R - 2} y={CY} size={3} />

          {/* Lower bridge — supports tourbillon */}
          <path
            d={`M ${CX - 50} ${TOURB_Y - 38}
                Q ${CX - 32} ${TOURB_Y - 50} ${CX} ${TOURB_Y - 52}
                Q ${CX + 32} ${TOURB_Y - 50} ${CX + 50} ${TOURB_Y - 38}
                L ${CX + 44} ${TOURB_Y - 30}
                Q ${CX + 28} ${TOURB_Y - 40} ${CX} ${TOURB_Y - 42}
                Q ${CX - 28} ${TOURB_Y - 40} ${CX - 44} ${TOURB_Y - 30}
                Z`}
            fill="url(#bridgeGrad)"
            stroke="#0a0a0b"
            strokeWidth="0.5"
            opacity="0.85"
          />
          <Screw x={CX - 46} y={TOURB_Y - 34} size={3} />
          <Screw x={CX + 46} y={TOURB_Y - 34} size={3} />

          {/* Tiny ruby jewels scattered on visible plate */}
          <circle cx={CX - 38} cy={CY - 35} r="2.5" fill="#7f1d1d" stroke="#a85050" strokeWidth="0.3" />
          <circle cx={CX + 38} cy={CY - 35} r="2.5" fill="#7f1d1d" stroke="#a85050" strokeWidth="0.3" />

          {/* === TOURBILLON at 6 — rotates once per minute === */}
          <g transform={`translate(${TOURB_X} ${TOURB_Y})`}>
            {/* Recessed background pit */}
            <circle r={TOURB_R + 2} fill="#040406" stroke="#1a1a1d" strokeWidth="0.5" />
            {/* Rotating cage (triangular RM signature) */}
            <g transform={`rotate(${tourbillonAngle})`}>
              {/* Cage triangle */}
              <polygon
                points={`0,-${TOURB_R - 2} ${(TOURB_R - 2) * 0.866},${(TOURB_R - 2) * 0.5} -${(TOURB_R - 2) * 0.866},${(TOURB_R - 2) * 0.5}`}
                fill="none"
                stroke="url(#tourbGrad)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Inner cage arms */}
              <line x1="0" y1={-(TOURB_R - 2)} x2="0" y2={-(TOURB_R - 14)} stroke="url(#tourbGrad)" strokeWidth="1.2" />
              <line
                x1={(TOURB_R - 2) * 0.866}
                y1={(TOURB_R - 2) * 0.5}
                x2={(TOURB_R - 14) * 0.866}
                y2={(TOURB_R - 14) * 0.5}
                stroke="url(#tourbGrad)"
                strokeWidth="1.2"
              />
              <line
                x1={-(TOURB_R - 2) * 0.866}
                y1={(TOURB_R - 2) * 0.5}
                x2={-(TOURB_R - 14) * 0.866}
                y2={(TOURB_R - 14) * 0.5}
                stroke="url(#tourbGrad)"
                strokeWidth="1.2"
              />
              {/* Balance wheel ring */}
              <circle r={TOURB_R - 14} fill="#0a0a0b" stroke="#52525b" strokeWidth="0.8" />
              {/* Balance wheel spokes */}
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const a = (deg * Math.PI) / 180;
                return (
                  <line
                    key={deg}
                    x1={0}
                    y1={0}
                    x2={(TOURB_R - 16) * Math.cos(a)}
                    y2={(TOURB_R - 16) * Math.sin(a)}
                    stroke="#71717a"
                    strokeWidth="0.5"
                  />
                );
              })}
              {/* Hairspring (concentric circles, getting fainter) */}
              <circle r={TOURB_R - 18} fill="none" stroke="#52525b" strokeWidth="0.3" opacity="0.6" />
              <circle r={TOURB_R - 21} fill="none" stroke="#52525b" strokeWidth="0.3" opacity="0.4" />
              {/* Top-of-cage orange marker — visible rotation indicator */}
              <circle cx="0" cy={-(TOURB_R - 4)} r="2.5" fill="#fb7185" />
            </g>
            {/* Center pivot jewel (static) */}
            <circle r="3" fill="#7f1d1d" stroke="#c75050" strokeWidth="0.5" />
            <circle r="1" fill="#fbbf24" />
          </g>
          {/* Tourbillon label */}
          <text
            x={TOURB_X}
            y={TOURB_Y + TOURB_R + 9}
            textAnchor="middle"
            fill="#8a8a93"
            fontSize="5.5"
            letterSpacing="1.5"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            TOURBILLON · 60s
          </text>

          {/* === Screws around the case (RM signature spline pattern) === */}
          {[
            // bezel intersections
            { x: 110, y: 105 }, { x: 370, y: 105 },
            { x: 110, y: 535 }, { x: 370, y: 535 },
            // side bulge points
            { x: 64, y: 320 }, { x: 416, y: 320 },
            // lug attachment points
            { x: 138, y: 78 }, { x: 342, y: 78 },
            { x: 138, y: 562 }, { x: 342, y: 562 },
          ].map((s, i) => (
            <Screw key={i} x={s.x} y={s.y} size={5} />
          ))}

          {/* === Hour markers on elliptical chapter ring === */}
          {slots.map((node, i) => {
            const angle = i * 30;
            const isMajor = i % 3 === 0;
            const hasNode = !!node;
            const isHovered = hoveredHour === i;

            // Skip the marker at 6 — the tourbillon owns that real estate
            const isSix = i === 6;
            if (isSix) return null;

            const inner = ellipsePoint(CX, CY, RX_MARKER - (isMajor ? 16 : 8), RY_MARKER - (isMajor ? 22 : 12), angle);
            const outer = ellipsePoint(CX, CY, RX_MARKER, RY_MARKER, angle);
            const lume = ellipsePoint(CX, CY, RX_MARKER - 3, RY_MARKER - 4, angle);
            const dot = ellipsePoint(CX, CY, RX_HIT, RY_HIT, angle);

            return (
              <g key={i}>
                {/* index stroke */}
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#ededf0"
                  strokeWidth={isMajor ? 3.5 : 1.5}
                  opacity={hasNode ? 0.95 : 0.35}
                  strokeLinecap="round"
                />
                {/* lume dot at the inner tip — orange superluminova */}
                {isMajor && (
                  <circle cx={lume.x} cy={lume.y} r="1.6" fill="#fb7185" opacity="0.85" />
                )}
                {hasNode && (
                  <g
                    onMouseEnter={() => setHoveredHour(i)}
                    onMouseLeave={() => setHoveredHour(null)}
                    onClick={() => {
                      if (node?.slug) window.location.href = `/projects/${node.slug}`;
                    }}
                    className={node?.slug ? 'cursor-pointer' : 'cursor-help'}
                  >
                    <circle cx={dot.x} cy={dot.y} r={16} fill="transparent" />
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={isHovered ? 6 : 3.5}
                      fill={isHovered ? '#fb7185' : '#ededf0'}
                      style={{ transition: 'r 200ms ease, fill 200ms ease' }}
                    />
                    {isHovered && (
                      <circle cx={dot.x} cy={dot.y} r={11} fill="none" stroke="#fb7185" strokeWidth={1} opacity={0.5} />
                    )}
                  </g>
                )}
              </g>
            );
          })}

          {/* === Numeral "12" only — minimal and unmistakable === */}
          {(() => {
            const p = ellipsePoint(CX, CY, 105, 145, 0);
            return (
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#ededf0"
                fontSize="18"
                fontWeight="800"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                12
              </text>
            );
          })()}

          {/* === Subdial: DATE === */}
          <g>
            <circle cx={CX} cy={SUBDIAL_DATE_Y} r={SUBDIAL_R} fill="url(#subdialGrad)" stroke="#3a3a40" strokeWidth="1" />
            <circle cx={CX} cy={SUBDIAL_DATE_Y} r={SUBDIAL_R - 3} fill="none" stroke="#1a1a1d" strokeWidth="0.5" />
            <text x={CX} y={SUBDIAL_DATE_Y - 14} textAnchor="middle" fill="#8a8a93" fontSize="6" letterSpacing="2" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {dayShort}
            </text>
            <text x={CX} y={SUBDIAL_DATE_Y + 8} textAnchor="middle" fill="#ededf0" fontSize="20" fontWeight="600" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {dateNum}
            </text>
          </g>

          {/* === Subdial: WORK === */}
          <g>
            <circle cx={SUBDIAL_LEFT_X} cy={CY} r={SUBDIAL_R} fill="url(#subdialGrad)" stroke="#3a3a40" strokeWidth="1" />
            <circle cx={SUBDIAL_LEFT_X} cy={CY} r={SUBDIAL_R - 3} fill="none" stroke="#1a1a1d" strokeWidth="0.5" />
            <text x={SUBDIAL_LEFT_X} y={CY - 14} textAnchor="middle" fill="#8a8a93" fontSize="6" letterSpacing="2" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              WORK
            </text>
            <text x={SUBDIAL_LEFT_X} y={CY + 4} textAnchor="middle" fill="#fb7185" fontSize="16" fontWeight="700" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {todayActivity}
            </text>
            <text x={SUBDIAL_LEFT_X} y={CY + 16} textAnchor="middle" fill="#8a8a93" fontSize="5" letterSpacing="1.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              MSG · TODAY
            </text>
          </g>

          {/* === Subdial: PULSE === */}
          <g>
            <circle cx={SUBDIAL_RIGHT_X} cy={CY} r={SUBDIAL_R} fill="url(#subdialGrad)" stroke="#3a3a40" strokeWidth="1" />
            <circle cx={SUBDIAL_RIGHT_X} cy={CY} r={SUBDIAL_R - 3} fill="none" stroke="#1a1a1d" strokeWidth="0.5" />
            <text x={SUBDIAL_RIGHT_X} y={CY - 14} textAnchor="middle" fill="#8a8a93" fontSize="6" letterSpacing="2" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              PULSE
            </text>
            <circle
              cx={SUBDIAL_RIGHT_X}
              cy={CY + 4}
              r={6}
              fill={isPlaying ? '#34d399' : '#2a2a2e'}
              stroke={isPlaying ? '#34d399' : '#1f1f24'}
              strokeWidth="1"
            >
              {isPlaying && (
                <animate attributeName="r" values="6;8.5;6" dur="1.4s" repeatCount="indefinite" />
              )}
            </circle>
            <text x={SUBDIAL_RIGHT_X} y={CY + 22} textAnchor="middle" fill="#8a8a93" fontSize="5" letterSpacing="1.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {isPlaying ? 'LIVE' : 'SILENT'}
            </text>
          </g>

          {/* === Brand text (below tourbillon, well clear of everything) === */}
          <text
            x={CX}
            y={CY + 195}
            textAnchor="middle"
            fill="#8a8a93"
            fontSize="8.5"
            letterSpacing="3"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            RM · CV-2026
          </text>
          <text
            x={CX}
            y={CY + 209}
            textAnchor="middle"
            fill="#fb7185"
            fontSize="6"
            letterSpacing="2.5"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            MARTIN HSIEH · {LAYERS[layerKey].label.toUpperCase()}
          </text>

          {/* === Hands === */}
          {(() => {
            const h = polar(CX, CY, R_HAND_HOUR, hourAngle);
            const m = polar(CX, CY, R_HAND_MIN, minuteAngle);
            const s = polar(CX, CY, R_HAND_SEC, secondAngle);
            const sBack = polar(CX, CY, -22, secondAngle);

            // Lume tip positions — slightly inset from each hand's tip
            const hourLume = polar(CX, CY, R_HAND_HOUR - 6, hourAngle);
            const minLume = polar(CX, CY, R_HAND_MIN - 6, minuteAngle);

            return (
              <>
                {/* hour — skeletonized with body and lume tip */}
                <line x1={CX} y1={CY} x2={h.x} y2={h.y} stroke="url(#handGrad)" strokeWidth={7} strokeLinecap="round" />
                <line x1={CX} y1={CY} x2={h.x} y2={h.y} stroke="#0a0a0b" strokeWidth={1.8} strokeLinecap="round" />
                <circle cx={hourLume.x} cy={hourLume.y} r={3.5} fill="#fb7185" />
                <circle cx={hourLume.x} cy={hourLume.y} r={2} fill="#fbbf24" />

                {/* minute — narrower, longer */}
                <line x1={CX} y1={CY} x2={m.x} y2={m.y} stroke="url(#handGrad)" strokeWidth={4} strokeLinecap="round" />
                <line x1={CX} y1={CY} x2={m.x} y2={m.y} stroke="#0a0a0b" strokeWidth={1.2} strokeLinecap="round" />
                <circle cx={minLume.x} cy={minLume.y} r={2.5} fill="#fb7185" />

                {/* second — bright orange with counter-balance */}
                <line x1={sBack.x} y1={sBack.y} x2={s.x} y2={s.y} stroke="#fb7185" strokeWidth={1.5} strokeLinecap="round" />
                <circle cx={sBack.x} cy={sBack.y} r={4} fill="#fb7185" />

                {/* pinion */}
                <circle cx={CX} cy={CY} r={8} fill="#ededf0" />
                <circle cx={CX} cy={CY} r={4.5} fill="#fb7185" />
                <circle cx={CX} cy={CY} r={1.5} fill="#0a0a0b" />
              </>
            );
          })()}

          {/* === Crown protector + crown + pushers === */}
          {/* Crown affordance label — gives users an obvious "click me" hint */}
          <text
            x={425}
            y={CY - 70}
            fill="#fb7185"
            fontSize="5.5"
            letterSpacing="1.5"
            textAnchor="end"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            CLICK · CYCLE LAYER ↓
          </text>

          <g
            onClick={() => cycleLayer(1)}
            className="cursor-pointer"
            aria-label="Crown — click to cycle layer"
          >
            <title>Click to cycle layer · ← → arrow keys</title>
            {/* Crown protector wing */}
            <path
              d={`M 414 ${CY - 22} Q 440 ${CY - 28} 446 ${CY - 14} L 446 ${CY + 14} Q 440 ${CY + 28} 414 ${CY + 22} Z`}
              fill="url(#caseGrad)"
              stroke="#1a1a1d"
              strokeWidth="0.5"
            />
            {/* Upper pusher */}
            <rect x={432} y={CY - 56} width={16} height={11} fill="#2a2a2e" stroke="#0a0a0b" strokeWidth="0.6" rx={2} />
            <text x={440} y={CY - 47} textAnchor="middle" fill="#8a8a93" fontSize="4" letterSpacing="0.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              ↑
            </text>
            {/* Crown — spins tactilely on each layer change */}
            <g
              transform={`rotate(${crownSpin} 443 ${CY})`}
              style={{ transition: 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <rect x={432} y={CY - 12} width={22} height={24} fill="#2a2a2e" stroke="#0a0a0b" strokeWidth="0.6" rx={3} />
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={434 + i * 4} y1={CY - 10} x2={434 + i * 4} y2={CY + 10} stroke="#0a0a0b" strokeWidth="0.8" />
              ))}
              {/* Orange function-selector dot — RM signature */}
              <circle cx={443} cy={CY} r="2.5" fill="#fb7185" />
            </g>
            {/* Lower pusher */}
            <rect x={432} y={CY + 45} width={16} height={11} fill="#2a2a2e" stroke="#0a0a0b" strokeWidth="0.6" rx={2} />
            <text x={440} y={CY + 54} textAnchor="middle" fill="#8a8a93" fontSize="4" letterSpacing="0.5" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              ↓
            </text>
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
              Hover a marker to inspect · click the crown to switch layer
            </div>
          </div>
        )}
      </div>

      {/* --- Layer selector pills --- */}
      <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
        {LAYER_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => {
              setLayerKey(key);
              setHoveredHour(null);
            }}
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
