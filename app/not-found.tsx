import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-serif text-7xl md:text-8xl text-rose-400 tabular leading-none">
          404
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-4">
          page not found
        </div>
        <h1 className="font-serif text-3xl mt-6 leading-tight">
          This URL doesn&apos;t go anywhere.
        </h1>
        <p className="text-muted mt-4 text-sm">
          Likely a stale link, a typo, or a project I&apos;ve since archived.
        </p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-rose-400 text-bg text-xs font-mono uppercase tracking-widest hover:bg-rose-300 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/projects"
            className="px-4 py-2 rounded-full border border-divider text-muted text-xs font-mono uppercase tracking-widest hover:text-primary hover:border-muted transition-colors"
          >
            Projects
          </Link>
        </div>
      </div>
    </main>
  );
}
