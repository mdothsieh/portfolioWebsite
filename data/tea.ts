// Tea atlas — your curated boba spots across LA and Taipei.
// Edit freely. Coordinates are [lng, lat] (Mapbox convention).
// Pin color comes from rating: 9+ = rose, 7-8 = pink, <7 = muted.

export type City = 'LA' | 'TPE';

export interface TeaSpot {
  id: string;
  name: string;
  city: City;
  coords: [number, number];     // [lng, lat]
  goTo: string;                  // your standard order
  rating: number;                // 1–10
  vibe?: string[];               // ['study-friendly', 'late-night', 'walk-in']
  lastVisit?: string;            // 'YYYY-MM' or 'YYYY-MM-DD'
  notes?: string;                // 1–2 sentence personal review
}

// PLACEHOLDERS — coordinates are roughly correct for known shop locations.
// Swap names, drinks, ratings, notes with your real picks.
export const teaSpots: TeaSpot[] = [
  // ===== LOS ANGELES =====
  {
    id: 'yifang-la',
    name: 'YiFang Taiwan Fruit Tea — Sawtelle',
    city: 'LA',
    coords: [-118.4530, 34.0480],
    goTo: 'Aiyu Lemon · less ice · 50% sugar',
    rating: 9,
    vibe: ['walk-in', 'consistent'],
    lastVisit: '2026-05',
    notes: 'The Sawtelle benchmark. If a new boba shop doesn\'t beat YiFang\'s aiyu lemon, I don\'t go back.',
  },
  {
    id: '3cat-la',
    name: '3CAT Handcrafted Beverage — Arcadia',
    city: 'LA',
    coords: [-118.0353, 34.1397],
    goTo: 'Roasted oolong milk tea · 30% sugar · no ice',
    rating: 9,
    vibe: ['late-night', 'date-spot'],
    lastVisit: '2026-04',
    notes: 'Best roasted oolong base in LA. The pearls are still chewy 40 minutes in.',
  },
  {
    id: 'cha-redefine',
    name: 'Cha Redefine — Koreatown',
    city: 'LA',
    coords: [-118.3094, 34.0641],
    goTo: 'Cheese tea · jasmine green base',
    rating: 8,
    vibe: ['Instagram', 'walk-in'],
    lastVisit: '2026-04',
    notes: 'Foam game is unmatched. Slightly overpriced but the visual is the point.',
  },
  {
    id: 'tiger-sugar-la',
    name: 'Tiger Sugar — Arcadia',
    city: 'LA',
    coords: [-118.0307, 34.1393],
    goTo: 'Brown sugar boba milk',
    rating: 7,
    vibe: ['walk-in'],
    notes: 'Famous for the brown sugar streaks. Worth once, not twice.',
  },
  {
    id: 'meet-fresh-la',
    name: 'Meet Fresh — Arcadia',
    city: 'LA',
    coords: [-118.0317, 34.1378],
    goTo: 'Taro paste + grass jelly',
    rating: 7,
    vibe: ['dessert', 'sit-in'],
    notes: 'Not strictly tea but the taro paste game is real. Go here when you want dessert pretending to be a drink.',
  },

  // ===== TAIPEI =====
  {
    id: 'yifang-tpe',
    name: 'YiFang 一芳 — Da\'an',
    city: 'TPE',
    coords: [121.5436, 25.0263],
    goTo: 'Aiyu Lemon (the original)',
    rating: 10,
    vibe: ['walk-in', 'standard'],
    lastVisit: '2025-08',
    notes: 'The OG. Sets the calibration for every other shop on this list.',
  },
  {
    id: '3cat-tpe',
    name: '3CAT 三貓手作 — Ximen',
    city: 'TPE',
    coords: [121.5078, 25.0421],
    goTo: 'Hand-shaken roasted oolong',
    rating: 9,
    vibe: ['take-out'],
    lastVisit: '2025-08',
    notes: 'Smaller than the LA stores but the tea quality is identical.',
  },
  {
    id: 'chun-yang',
    name: 'Chun Yang Tea 春陽茶事 — Dongmen',
    city: 'TPE',
    coords: [121.5283, 25.0335],
    goTo: 'Roasted oolong with pearls · 30% sugar',
    rating: 9,
    vibe: ['take-out', 'queue'],
    notes: 'Worth the line. The "real" Taipei roasted oolong everyone tries to replicate.',
  },
  {
    id: 'wushiland',
    name: 'Wushiland 五十嵐 — Multiple',
    city: 'TPE',
    coords: [121.5654, 25.0330],
    goTo: 'Four Seasons spring tea with pearls',
    rating: 8,
    vibe: ['ubiquitous', 'standard'],
    notes: 'The McDonald\'s of Taipei boba. Reliable everywhere; never the best in a 1-mile radius.',
  },
  {
    id: 'tigersugar-tpe',
    name: 'Tiger Sugar 老虎堂 — Ximen',
    city: 'TPE',
    coords: [121.5070, 25.0418],
    goTo: 'Brown sugar boba milk',
    rating: 8,
    vibe: ['tourist', 'walk-in'],
    notes: 'Where the trend started. Better than the US franchise because the pearls are cooked in-house.',
  },
];
