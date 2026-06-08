import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Generates the browser-tab favicon at request time from JSX.
// Renders as: a black rounded-square with a rose-accent "M".
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#08160F',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#CEDC00',
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          borderRadius: 6,
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
