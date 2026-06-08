'use client';

import { useEffect, useRef } from 'react';

// Samples the dominant color from the currently-playing Spotify album art and
// washes it as a soft glow at the top of the page (.ambient-wash in globals).
// Falls back to rose if nothing is playing or the image can't be sampled
// (CORS-tainted canvas, etc.). Polls in step with the rest of the site (30s).
export function AmbientWash() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const setWash = (rgb: [number, number, number] | null) => {
      if (cancelled || !ref.current) return;
      const css = rgb
        ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.16)`
        : 'rgba(251, 113, 133, 0.10)';
      ref.current.style.setProperty('--wash', css);
    };

    const sample = (url: string) =>
      new Promise<[number, number, number] | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const c = document.createElement('canvas');
            c.width = c.height = 16;
            const ctx = c.getContext('2d');
            if (!ctx) return resolve(null);
            ctx.drawImage(img, 0, 0, 16, 16);
            const { data } = ctx.getImageData(0, 0, 16, 16);
            let r = 0, g = 0, b = 0, n = 0;
            for (let i = 0; i < data.length; i += 4) {
              // skip near-black / near-white so the wash takes the real hue
              const lum = data[i] + data[i + 1] + data[i + 2];
              if (lum < 60 || lum > 705) continue;
              r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
            }
            if (n === 0) return resolve(null);
            resolve([Math.round(r / n), Math.round(g / n), Math.round(b / n)]);
          } catch {
            resolve(null); // tainted canvas
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });

    const tick = async () => {
      try {
        const res = await fetch('/api/spotify/now-playing');
        if (!res.ok) return setWash(null);
        const json = await res.json();
        if (json?.isPlaying && json?.cover) {
          setWash(await sample(json.cover));
        } else {
          setWash(null);
        }
      } catch {
        setWash(null);
      }
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return <div ref={ref} className="ambient-wash" aria-hidden />;
}
