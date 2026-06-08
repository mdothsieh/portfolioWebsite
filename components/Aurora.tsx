// Slow-drifting gradient field. Sits behind hero content (z-0). Pure CSS
// (.aurora in globals.css), pauses under prefers-reduced-motion.
export function Aurora() {
  return (
    <div className="aurora" aria-hidden>
      <span className="a1" />
      <span className="a2" />
      <span className="a3" />
    </div>
  );
}
