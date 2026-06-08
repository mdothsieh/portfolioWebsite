'use client';

import { useEffect } from 'react';

// Draws a minimal live clock to a canvas and swaps it in as the favicon.
// The tab quietly tracks real time — a small nod to the watch hero.
export function LiveFavicon() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let link = document.querySelector<HTMLLinkElement>('link#live-favicon');
    if (!link) {
      link = document.createElement('link');
      link.id = 'live-favicon';
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const draw = () => {
      const now = new Date();
      const cx = 32, cy = 32, r = 28;
      ctx.clearRect(0, 0, 64, 64);

      // disc
      ctx.fillStyle = '#08160F';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2a2a2e';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 12 o'clock pip
      ctx.fillStyle = '#CEDC00';
      ctx.beginPath();
      ctx.arc(cx, cy - r + 6, 2.2, 0, Math.PI * 2);
      ctx.fill();

      const hand = (angleDeg: number, len: number, w: number, color: string) => {
        const a = ((angleDeg - 90) * Math.PI) / 180;
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + len * Math.cos(a), cy + len * Math.sin(a));
        ctx.stroke();
      };

      const s = now.getSeconds();
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;
      hand((h / 12) * 360, 12, 5, '#ededf0');
      hand((m / 60) * 360, 18, 3.5, '#ededf0');
      hand((s / 60) * 360, 20, 1.6, '#CEDC00');

      ctx.fillStyle = '#ededf0';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
      ctx.fill();

      link!.href = canvas.toDataURL('image/png');
    };

    draw();
    const id = setInterval(draw, 15_000); // refresh a few times a minute
    return () => clearInterval(id);
  }, []);

  return null;
}
