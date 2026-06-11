// Section 01 hero (server). Recruiter-first positioning: headline, availability
// line, and a full CTA row (View projects / Resume / GitHub / LinkedIn / Email)
// alongside the <WatchFace> centerpiece — kept as the site's single visual
// metaphor, quieter than before. Receives isPlaying + todayActivity props from
// app/page.tsx to drive the watch's live registers.
import Link from 'next/link';
import { ArrowDownToLine, ArrowUpRight, Mail } from 'lucide-react';
import { WatchFace } from './WatchFace';
import { Parallax } from './Parallax';
import { Aurora } from './Aurora';
import { RevealText } from './RevealText';
import { T } from './i18n';

interface Props {
  isPlaying?: boolean;
  todayActivity?: number;
}

export function Hero({ isPlaying, todayActivity }: Props) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <Aurora />
      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full pt-32 pb-16 grid lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-10 items-center">
        {/* --- left: intro copy --- */}
        <div>
          <div
            className="hero-enter text-[10px] font-mono uppercase tracking-widest text-muted mb-6"
            style={{ animationDelay: '0ms' }}
          >
            <T
              en="Martin Hsieh · CS @ USC · Full-stack systems · Applied AI tooling"
              zh="Martin Hsieh · USC 计算机科学 · 全栈系统 · 应用 AI 工具"
            />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl leading-[1.04]">
            <RevealText
              text="I build full-stack tools for real-world workflows."
              zh="我为真实世界的工作流构建全栈工具。"
              accentWords={['real-world']}
              startDelay={120}
              stagger={34}
            />
          </h1>

          <p
            className="hero-enter text-muted mt-6 max-w-md text-sm leading-relaxed"
            style={{ animationDelay: '320ms' }}
          >
            <T
              en="USC computer science student focused on internal tools, dashboards, local-first apps, and applied AI systems. I've shipped production software at two manufacturers — Kenmou in Taipei and Far Eastern in Suzhou — and I like software that turns messy operational workflows into something people can actually use."
              zh="南加州大学（USC）计算机科学专业学生，专注于内部工具、仪表盘、本地优先应用和应用 AI 系统。我曾在两家制造企业交付生产软件——台北的 Kenmou 和苏州的 Far Eastern——我喜欢把混乱的运营流程变成人们真正能用的软件。"
            />
          </p>

          {/* availability — the one place green means something real */}
          <div
            className="hero-enter mt-6 flex items-center gap-2.5 text-[11px] font-mono tracking-wide text-muted"
            style={{ animationDelay: '400ms' }}
          >
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>
              <T
                en="Open to Summer 2027 SWE / applied-AI internships · LA · Bay Area · Seattle · NYC · Taipei · remote"
                zh="正在寻找 2027 年夏季软件工程 / 应用 AI 实习 · 洛杉矶 · 湾区 · 西雅图 · 纽约 · 台北 · 远程"
              />
            </span>
          </div>

          {/* CTAs */}
          <div
            className="hero-enter mt-8 flex items-center gap-3 flex-wrap"
            style={{ animationDelay: '460ms' }}
          >
            <Link
              href="/#projects"
              className="btn-glow inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-400 text-bg text-xs font-mono uppercase tracking-widest hover:bg-rose-300 transition-colors"
            >
              <T en="View projects" zh="查看项目" />
            </Link>
            <a
              href="/cv.pdf"
              download="martin-hsieh-cv.pdf"
              className="btn-glow inline-flex items-center gap-2 px-4 py-2 rounded-full border border-divider text-muted text-xs font-mono uppercase tracking-widest hover:text-primary hover:border-muted"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" strokeWidth={2} />
              <T en="Resume" zh="简历" />
            </a>
          </div>

          {/* contact row */}
          <div
            className="hero-enter mt-5 flex items-center gap-5 flex-wrap text-xs font-mono uppercase tracking-widest"
            style={{ animationDelay: '540ms' }}
          >
            <a
              href="https://github.com/mdothsieh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-primary transition-colors"
            >
              GitHub <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </a>
            <a
              href="https://www.linkedin.com/in/martin-hsieh/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-primary transition-colors"
            >
              LinkedIn <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </a>
            <a
              href="mailto:mdothsieh@gmail.com"
              className="inline-flex items-center gap-1.5 text-muted hover:text-primary transition-colors"
            >
              <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
              <T en="Email" zh="邮箱" />
            </a>
          </div>
        </div>

        {/* --- right: live watch --- */}
        <div
          className="hero-enter relative w-full flex flex-col items-center lg:items-end gap-4"
          style={{ animationDelay: '600ms' }}
        >
          <Parallax speed={40} className="w-full flex items-center justify-center">
            <WatchFace isPlaying={isPlaying} todayActivity={todayActivity} />
          </Parallax>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted/60 text-center lg:text-right max-w-xs">
            <T
              en="The dial is live — date, today's build activity, a music pulse."
              zh="表盘是实时的——日期、今天的构建活动、音乐脉搏。"
            />
          </p>
        </div>
      </div>
    </section>
  );
}
