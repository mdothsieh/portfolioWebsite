import { ImageResponse } from 'next/og';

export const alt = 'Martin Hsieh — CS @ USC';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Generated 1200x630 social-card image — auto-served at /opengraph-image.
// No design assets needed; rendered fresh from JSX every deploy.
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0b',
          width: '100%',
          height: '100%',
          padding: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: '#8a8a93',
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'flex',
          }}
        >
          CS · USC · Class of 2028
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 96,
              color: '#ededf0',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
              display: 'flex',
            }}
          >
            Martin Hsieh
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#fb7185',
              marginTop: 20,
              display: 'flex',
            }}
          >
            Full-stack + applied AI · Open to Summer 2027 roles
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: '#8a8a93',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex' }}>martinhsieh.com</div>
          <div style={{ display: 'flex' }}>TPE ↔ LAX</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
