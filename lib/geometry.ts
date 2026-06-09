// Small, pure geometry helpers shared by the watch face.
//
// round3 exists for a specific reason: SVG coordinates computed from Math.sin /
// Math.cos can differ in their last floating-point digit between the server
// (Node) and the client (browser). React serializes those as strings during
// SSR, so an unrounded coordinate trips a hydration mismatch on every point.
// Rounding to 3 decimals makes both runtimes emit the identical string while
// staying sub-pixel accurate. Keep this deterministic — no Date, no Math.random.

export function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}

export interface Point {
  x: number;
  y: number;
}

// Polar → cartesian, with 0° at 12 o'clock and clockwise increase. Output is
// rounded via round3 so it is byte-stable across SSR and hydration.
export function polar(cx: number, cy: number, r: number, deg: number): Point {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: round3(cx + r * Math.cos(rad)),
    y: round3(cy + r * Math.sin(rad)),
  };
}
