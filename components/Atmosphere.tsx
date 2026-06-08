// Fixed full-viewport overlay: fine film grain + edge vignette.
// Styling lives in .atmosphere (app/globals.css); grain texture is an inline
// SVG fractal-noise data URI so there's no extra network request.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function Atmosphere() {
  return (
    <div
      className="atmosphere"
      aria-hidden
      style={{ '--grain': GRAIN } as React.CSSProperties}
    />
  );
}
