// Suspense loading fallback for /projects/[slug] (Next.js convention).
export default function Loading() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
        ← Projects
      </div>
      <div className="mt-8 space-y-3 animate-pulse">
        <div className="h-12 w-3/4 bg-surface rounded" />
        <div className="h-6 w-full bg-surface rounded" />
      </div>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface border border-divider rounded" />
        ))}
      </div>
      <div className="mt-10 space-y-3 animate-pulse">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-4 bg-surface rounded"
            style={{ width: `${85 - i * 6}%` }}
          />
        ))}
      </div>
    </main>
  );
}
