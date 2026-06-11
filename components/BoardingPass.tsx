import { ArrowDownToLine, Plane } from 'lucide-react';
import { T } from './i18n';

/**
 * CV boarding-pass card. Themed to the TPE ↔ LAX international-student angle.
 *
 * To wire up the actual download: drop your CV PDF into `public/cv.pdf`.
 * It'll then be available at `/cv.pdf` and the download button works.
 */
export function BoardingPass() {
  return (
    <a
      href="/cv.pdf"
      download="martin-hsieh-cv.pdf"
      className="panel-carbon group block relative w-full overflow-hidden rounded-2xl border border-divider bg-surface/70 transition-all hover:border-muted hover:shadow-[0_0_60px_-15px_rgba(255,59,48,0.25)]"
    >
      {/* subtle Ferrari-red accent stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-60" />

      {/* main row */}
      <div className="flex">
        {/* === left stub === */}
        <div className="flex-1 p-7 md:p-8">
          {/* top meta */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted">
              <T en="Boarding Pass · CV-2026" zh="登机牌 · CV-2026" />
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted">
              <T en="Seat — Anywhere" zh="座位 — 任意" />
            </div>
          </div>

          {/* big route */}
          <div className="flex items-center gap-6 md:gap-10">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted mb-1">
                <T en="From" zh="从" />
              </div>
              <div className="font-serif text-4xl md:text-5xl leading-none tabular">TPE</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-2">
                <T en="Taipei · 桃園" zh="台北 · 桃園" />
              </div>
            </div>

            <div className="flex-1 relative h-[2px] bg-divider mx-2">
              <Plane
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 rotate-90 bg-bg px-0.5 transition-transform group-hover:translate-x-2"
                strokeWidth={1.5}
              />
            </div>

            <div className="text-right">
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted mb-1">
                <T en="To" zh="至" />
              </div>
              <div className="font-serif text-4xl md:text-5xl leading-none tabular">LAX</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-2">
                <T en="Los Angeles · USC" zh="洛杉矶 · USC" />
              </div>
            </div>
          </div>

          {/* secondary meta — 4 columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 mt-10">
            <Cell label={<T en="Passenger" zh="乘客" />} value="Martin Hsieh" />
            <Cell label={<T en="Class" zh="舱位" />} value="CS · '28" />
            <Cell label={<T en="Flight" zh="航班" />} value="CV-2026" />
            <Cell label={<T en="Boarding" zh="登机" />} value={<T en="Now" zh="现在" />} mono />
          </div>
        </div>

        {/* === perforated divider === */}
        <div className="relative w-px shrink-0">
          <div className="absolute inset-y-0 w-px border-l border-dashed border-divider" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-bg border border-divider" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-bg border border-divider" />
        </div>

        {/* === right stub: the action === */}
        <div className="w-32 md:w-44 p-5 md:p-6 flex flex-col items-center justify-between text-center">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted">
            <T en="Resume" zh="简历" />
          </div>

          {/* "barcode" — fits the boarding-pass metaphor */}
          <div className="flex items-center gap-px h-10 my-4" aria-hidden>
            {[...Array(22)].map((_, i) => (
              <span
                key={i}
                className="bg-primary"
                style={{
                  width: i % 3 === 0 ? '2px' : '1px',
                  height: `${50 + ((i * 13) % 50)}%`,
                  opacity: 0.4 + ((i * 7) % 60) / 100,
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-rose-400 group-hover:text-rose-300 transition-colors">
            <ArrowDownToLine className="w-3 h-3" strokeWidth={2} />
            <span><T en="Download" zh="下载" /></span>
          </div>
        </div>
      </div>
    </a>
  );
}

function Cell({
  label,
  value,
  mono,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted mb-1">
        {label}
      </div>
      <div
        className={`text-base ${mono ? 'font-mono uppercase tracking-wider text-rose-400' : 'font-serif'}`}
      >
        {value}
      </div>
    </div>
  );
}
