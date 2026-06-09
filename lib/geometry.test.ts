import { describe, it, expect } from 'vitest';
import { round3, polar } from './geometry';

describe('round3', () => {
  it('rounds to three decimal places', () => {
    expect(round3(104.66883465378407)).toBe(104.669);
    expect(round3(1.23449)).toBe(1.234);
    expect(round3(1.23451)).toBe(1.235);
  });

  it('leaves integers and short decimals unchanged', () => {
    expect(round3(240)).toBe(240);
    expect(round3(0)).toBe(0);
    expect(round3(-58)).toBe(-58);
    expect(round3(1.5)).toBe(1.5);
  });

  it('is idempotent', () => {
    const once = round3(177.89041806639418);
    expect(round3(once)).toBe(once);
  });

  it('handles negatives symmetrically', () => {
    expect(round3(-170.09618943233423)).toBe(-170.096);
  });

  // The whole reason round3 exists: two values that differ only in the last
  // floating-point digit (as Math.sin/cos produce across Node vs the browser)
  // must collapse to the identical rounded number, or SSR hydration mismatches.
  it('collapses last-ULP differences to one stable value', () => {
    expect(round3(170.09618943233423)).toBe(round3(170.09618943233426));
    expect(round3(104.66883465378405)).toBe(round3(104.66883465378407));
  });
});

describe('polar', () => {
  it('places 0° at 12 o\'clock (straight up)', () => {
    const p = polar(0, 0, 1, 0);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBe(-1);
  });

  it('places 90° at 3 o\'clock (to the right)', () => {
    const p = polar(0, 0, 1, 90);
    expect(p.x).toBe(1);
    expect(p.y).toBeCloseTo(0, 6);
  });

  it('offsets from the given centre', () => {
    const p = polar(240, 300, 100, 90);
    expect(p.x).toBe(340);
    expect(p.y).toBe(300);
  });

  it('returns coordinates rounded to at most 3 decimals', () => {
    const p = polar(240, 300, 158, 33);
    expect(p.x).toBe(round3(p.x));
    expect(p.y).toBe(round3(p.y));
    // no more than 3 fractional digits
    expect(Number.isInteger(p.x * 1000)).toBe(true);
    expect(Number.isInteger(p.y * 1000)).toBe(true);
  });

  it('is deterministic for identical inputs (SSR/client parity)', () => {
    expect(polar(240, 300, 180, 222)).toEqual(polar(240, 300, 180, 222));
  });
});
