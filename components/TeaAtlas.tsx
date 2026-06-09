'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { teaSpots, type TeaSpot, type City } from '@/data/tea';

// Dark tile layer from CARTO — free, no token, OpenStreetMap data underneath.
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIB =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const CITY_VIEWS: Record<City, { center: L.LatLngTuple; zoom: number }> = {
  LA:  { center: [34.04, -118.30], zoom: 10 },
  TPE: { center: [25.04, 121.54], zoom: 12 },
};

// Span both cities: LA (lower left) to Taipei (upper right going east round the world).
// We use a simple two-corner bounds — Leaflet handles the projection.
const ALL_BOUNDS: L.LatLngBoundsLiteral = [
  [24.5, -119],   // SW corner-ish (south of LA)
  [35, 122],      // NE corner-ish (north of Taipei) — wraps via worldCopyJump
];

function pinColor(rating: number): string {
  if (rating >= 9) return '#FF3B30';   // Corsa red — top picks
  if (rating >= 7) return '#ff8079';   // light red — solid
  return '#8b9099';                    // graphite muted
}

interface Props {
  spots?: TeaSpot[];
}

export function TeaAtlas({ spots = teaSpots }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [activeCity, setActiveCity] = useState<'ALL' | City>('ALL');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const visible = useMemo(
    () => (activeCity === 'ALL' ? spots : spots.filter((s) => s.city === activeCity)),
    [spots, activeCity]
  );

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      attributionControl: false,
      zoomControl: true,
      worldCopyJump: true,
      preferCanvas: true,
    });

    L.tileLayer(DARK_TILES, {
      attribution: TILE_ATTRIB,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control
      .attribution({ position: 'bottomright', prefix: false })
      .addAttribution(TILE_ATTRIB)
      .addTo(map);

    map.fitBounds(ALL_BOUNDS, { padding: [30, 30] });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-draw markers when visible set changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    visible.forEach((spot) => {
      const [lng, lat] = spot.coords;  // data is [lng, lat]; leaflet wants [lat, lng]
      const color = pinColor(spot.rating);

      const icon = L.divIcon({
        className: 'tea-pin',
        html: `<span style="
          display:block; width:14px; height:14px;
          background:${color};
          border-radius:9999px;
          border:2px solid #08090b;
          box-shadow:0 0 0 1px ${color}33;
          transition:transform 200ms ease;
        "></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.on('mouseover', () => setHoveredId(spot.id));
      marker.on('mouseout', () => setHoveredId(null));
      marker.on('click', () => {
        const card = document.getElementById(`spot-${spot.id}`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHoveredId(spot.id);
      });
      markersRef.current.push(marker);
    });
  }, [visible]);

  // Move view when city filter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (activeCity === 'ALL') {
      map.flyToBounds(ALL_BOUNDS, { padding: [40, 40], duration: 1.2 });
    } else {
      const view = CITY_VIEWS[activeCity];
      map.flyTo(view.center, view.zoom, { duration: 1.2 });
    }
  }, [activeCity]);

  const topPicks = spots.filter((s) => s.rating >= 9).length;
  const cities = new Set(spots.map((s) => s.city)).size;

  return (
    <div className="space-y-5">
      {/* Top stats + city filter */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex gap-6">
          <Stat value={String(spots.length)} label="spots" />
          <Stat value={String(cities)} label="cities" />
          <Stat value={String(topPicks)} label="9+ ratings" />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'LA', 'TPE'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActiveCity(c)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border transition-colors ${
                activeCity === c
                  ? 'bg-rose-400 text-bg border-rose-400'
                  : 'bg-bg/60 text-muted border-divider hover:text-primary'
              }`}
            >
              {c === 'ALL' ? 'all' : c.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Map + list */}
      <div className="panel-carbon grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 rounded-xl border border-divider overflow-hidden">
        <div
          ref={containerRef}
          className="bg-surface min-h-[420px] lg:min-h-[600px]"
        />
        <div className="bg-surface/40 max-h-[600px] overflow-y-auto p-4 space-y-2">
          {visible.map((s) => (
            <SpotCard
              key={s.id}
              spot={s}
              hovered={hoveredId === s.id}
              onClick={() => {
                const [lng, lat] = s.coords;
                mapRef.current?.flyTo([lat, lng], 14, { duration: 1.2 });
                setHoveredId(s.id);
              }}
            />
          ))}
        </div>
      </div>

      {/* Leaflet's default zoom controls are visible — they're styled fine as-is on dark.
          Map attribution lives in bottom-right per CARTO/OSM ToS. */}
      <style jsx global>{`
        .leaflet-container {
          background: #08090b;
          font-family: var(--font-mono), monospace;
        }
        .leaflet-control-zoom a {
          background: #16161a !important;
          color: #ededf0 !important;
          border-color: #1f1f24 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #2a2a2e !important;
        }
        .leaflet-control-attribution {
          background: rgba(10, 10, 11, 0.7) !important;
          color: #8a8a93 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: #ededf0 !important;
        }
        .tea-pin {
          background: transparent !important;
          border: none !important;
          cursor: pointer;
        }
        .tea-pin:hover span {
          transform: scale(1.4);
        }
      `}</style>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-2xl text-rose-400 tabular leading-none">{value}</div>
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted mt-1.5">
        {label}
      </div>
    </div>
  );
}

function SpotCard({
  spot,
  hovered,
  onClick,
}: {
  spot: TeaSpot;
  hovered: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      id={`spot-${spot.id}`}
      onClick={onClick}
      className={`w-full text-left rounded-md border p-3 transition-colors ${
        hovered ? 'bg-rose-400/10 border-rose-400/50' : 'bg-bg/40 border-divider hover:border-muted'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <div className="font-serif text-base text-primary leading-tight truncate">
          {spot.name}
        </div>
        <div className="text-[10px] font-mono tabular text-rose-400 shrink-0">
          {spot.rating}/10
        </div>
      </div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
        {spot.city === 'LA' ? 'los angeles' : 'taipei'}
        {spot.lastVisit && (
          <>
            <span className="text-divider mx-1.5">·</span>last visit {spot.lastVisit}
          </>
        )}
      </div>
      <div className="text-xs text-rose-300 mb-1 italic">{spot.goTo}</div>
      {spot.notes && (
        <div className="text-xs text-muted leading-relaxed mt-2">{spot.notes}</div>
      )}
    </button>
  );
}
