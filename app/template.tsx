// A template re-mounts on every navigation, so this wrapper replays its
// entrance animation on each route change — a lightweight page transition.
// It also carries the stacking context (z-10) that keeps page content above
// the fixed ambient-wash / aurora layers.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in relative z-10">{children}</div>;
}
