# Portfolio Website — Project Overview

> Personal portfolio for Martin Hsieh (CS @ USC). A single-page landing site plus a
> few sub-routes, with live integrations (Spotify, GitHub, NetEase, local Claude
> usage). **Aesthetic:** Apple × Ferrari — red-on-black "Corsa" direction, precise
> typography, instrument/telemetry styling.
>
> **Structure (2026 recruiter-first redesign):** two layers. The **recruiter layer**
> (homepage: hero → featured work → experience → stack → about → resume → contact)
> is proof-driven and scannable; the **personal layer** (`/personal`, `/now`, `/tea`)
> holds listening (Spotify + NetEase), off-hours, and Claude telemetry. Projects are
> presented as mini specs: problem → built → stack → real links only.
>
> **This file is the canonical orientation doc.** Read it first when working on this
> project — it explains the structure, what each file does, and how the pieces connect.

---

## 1. Tech stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 15** (App Router, React Server Components) |
| Language | **TypeScript** (strict) |
| UI | **React 19** |
| Styling | **Tailwind CSS 3** + `@tailwindcss/typography` (prose), custom CSS in `globals.css` |
| Content | **MDX** via `next-mdx-remote/rsc` (server-rendered, no client MDX runtime) |
| Frontmatter | `gray-matter` |
| Maps | **Leaflet** (Tea Atlas, client-only) |
| Icons | `lucide-react` |
| Class utils | `clsx` + `tailwind-merge` (the `cn()` helper) |
| Tests | **Vitest** + Testing Library + jsdom |
| Hosting | **Vercel** (auto-deploy on push to `main`) |

There is **no database, no auth, no payment layer.** All "dynamic" data comes from
external APIs (fetched server-side) or local files. See `SECURITY` note in §9.

---

## 2. Directory map

```
portfolioWebsite/
├── app/                  # Next.js App Router: routes, layout, metadata, dynamic images
├── components/           # React components (server + client). The bulk of the UI.
├── content/projects/     # One .mdx per project case study (the CMS)
├── data/                 # Typed TS data modules + the generated claude-usage.json
├── lib/                  # Server-side logic: data loaders, API clients, helpers
├── scripts/              # Node scripts: claude-usage sync, spotify auth, deploy
├── public/               # Static assets (cv.pdf, robots.txt, llms.txt)
├── design-previews-*/    # Throwaway HTML design mockups (not part of the build)
├── next.config.mjs       # Security headers / CSP, build config
├── tailwind.config.ts    # Design tokens (colors, fonts)
└── .env.local            # Secrets (gitignored): Spotify + NetEase creds
```

---

## 3. Routes (`app/`)

| File | Route | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | (root) | server | Loads 3 Google fonts, sets all SEO/OpenGraph metadata, mounts the persistent chrome: `AmbientWash`, `Atmosphere`, `LiveFavicon`, `ScrollProgress`, `Nav`, `SiteFooter`, `CommandPalette`. |
| `template.tsx` | (root) | server | Re-mounts on every navigation to replay the page-entrance animation; carries the `z-10` stacking context above the ambient background layers. |
| `page.tsx` | `/` | server | **The landing page.** Orchestrates all numbered sections (01–08). Fetches usage + now-playing in parallel. `revalidate = 30`. |
| `projects/page.tsx` | `/projects` | server | Index of all projects (from `getAllProjects()`). |
| `projects/[slug]/page.tsx` | `/projects/:slug` | server | Renders one project's MDX via `<MDXRemote>`. Uses `generateStaticParams` + `generateMetadata`. |
| `projects/[slug]/loading.tsx` | — | — | Suspense fallback for the project page. |
| `personal/page.tsx` | `/personal` | server | **The personal layer.** Live status board (`PersonalStatus`), Listening (Spotify + NetEase), Off-Hours, Claude telemetry, doorway cards previewing real `data/now.ts` + `data/tea.ts` content. `revalidate = 30`. |
| `now/page.tsx` | `/now` | server | "What I'm doing now" page, content from `data/now.ts`. |
| `tea/page.tsx` | `/tea` | server | Tea Atlas map page. Rendered on-demand (not static) because Leaflet touches `window`. |
| `not-found.tsx` | (404) | server | Custom 404. |
| `sitemap.ts` | `/sitemap.xml` | — | Static routes + one entry per project. |
| `icon.tsx` | favicon | — | Generates the tab favicon at request time from JSX. |
| `apple-icon.tsx` | apple-touch-icon | — | Apple home-screen icon. |
| `opengraph-image.tsx` | OG image | — | Generates the social share card. |
| `globals.css` | — | — | Tailwind layers + custom animations/tokens + the theme system (`--c-*` RGB channel vars: `:root` = night default, `html[data-theme='day']` = day override; calmer-day rules; `@media print` pass). |

**Section order on the landing page** (`app/page.tsx`) — recruiter-first:
`01 Hero` (positioning + availability + CTAs) → `SpecStrip` → `02 Work`
(featured `ProjectSpecCard`s) → `03 ExperienceTimeline` → `04 SkillsDashboard` →
`05 About` → `BoardingPass` (compact resume interlude) → `PersonalLayer` teaser
(doorway to `/personal`). Listening, Hobbies, and the Claude heatmap moved to
`/personal` (`01 Listening` → `02 Off-Hours` → telemetry strip → `/now` + `/tea`
cards). Most sections are wrapped in `<Reveal>` for scroll-in animation.

**Progressive enhancement:** an inline bootstrap script in `layout.tsx` adds the
`js` class to `<html>` before first paint; every hidden-until-animated state in
`globals.css` (`.reveal`, `.rt-word`, `.hero-enter`) is scoped under `html.js`,
so no-JS visitors, scrapers, and broken-hydration cases see the full page.

**Day/night theme:** night (near-black Corsa) is the default for everyone; a
sun/moon `ThemeToggle` in the nav switches to day (Apple light gray) by setting
`html[data-theme='day']`, persisted in `localStorage('theme')` and restored
pre-paint by the same bootstrap script (value whitelisted — only `'day'` does
anything). Tailwind color tokens (`bg/surface/divider/primary/muted/rose-300/400/500`)
resolve through `--c-*` RGB channel vars in `globals.css`, so opacity modifiers
work in both themes. Day mode hides the night atmosphere (carbon weave, grain,
vignette, aurora, ambient wash) and skips the hero glyph scramble.

---

## 4. Components (`components/`)

Header (`Nav`) is **server**; client components opt in with `'use client'`. Several
components are explicitly **retired** — kept as stubs/notes but no longer rendered.

### Layout & chrome
- `Nav.tsx` (server) — sticky top nav (links, toggles, socials, red Resume pill → `/cv.pdf`); also hosts the live strip as its second row.
- `NavLinks.tsx` (client) — desktop links with active-section highlighting (hash links).
- `SiteFooter.tsx` (server) — footer.
- `CommandPalette.tsx` (client) — ⌘K-style palette.
- `ScrollProgress.tsx` (client) — thin rose progress bar at top of viewport.
- `LangToggle.tsx` (client) — EN / 中 switch; sets `documentElement.dataset.lang`.
- `ThemeToggle.tsx` (client) — night/day switch; sets `documentElement.dataset.theme`, persists in `localStorage`, fires `themechange`.
- `Kicker.tsx` (client) — bilingual section header ornament (Chinese numeral + EN/ZH).

### Background / ambient (visual atmosphere)
- `AmbientWash.tsx` (client) — samples dominant color from current Spotify album art.
- `Atmosphere.tsx` (server) — fixed film-grain + vignette overlay.
- `Aurora.tsx` (server) — slow CSS gradient field behind the hero.
- `Parallax.tsx` (client) — scroll-linked parallax wrapper.
- `LiveFavicon.tsx` (client) — draws a live clock to canvas, swaps it in as favicon.

### Hero & landing sections
- `Hero.tsx` (server) — section 01; recruiter-first copy: headline, availability
  line, CTA row (View projects / Resume / GitHub / LinkedIn / Email); centerpiece is `WatchFace`.
- `WatchFace.tsx` (client) — animated watch-face hero centerpiece (replaced the retired `LivingGraph`).
- `SpecStrip.tsx` (server) — Apple-style recruiter "spec row" of big numbers. *(tested)*
- `ProjectSpecCard.tsx` (server) — mini-spec project card (index/title, problem,
  built bullets, stack chips, real links only — GitHub/demo when present,
  "proprietary" note otherwise). Used by `/` (02 Work) and `/projects`.
- `About.tsx` (server) — section 05; bio + "currently" list from `data/about.ts`, plus a
  portrait card that renders only if `public/me.jpg` exists (checked at render).
- `ExperienceTimeline.tsx` (server) — section 03; vertical timeline from `data/experience.ts`.
- `BoardingPass.tsx` (server) — boarding-pass-styled CV download card, demoted to a
  compact interlude after About (links to `public/cv.pdf`).
- `SkillsDashboard.tsx` (server) — section 04; evidence-based skill buckets from `data/skills.ts`.
- `PersonalLayer.tsx` (server) — unnumbered homepage teaser: link cards into
  `/personal`, `/now`, `/tea`.
- `Hobbies.tsx` (server) — off-hours vignettes from `data/hobbies.ts`; section 02
  of `/personal` (moved off the homepage).

### Live data widgets
- `ClaudeUsageHeatmap.tsx` (client) — GitHub-style year heatmap; consumes `UsageData` from `lib/claude-usage.ts`. Rendered as a compact unnumbered "telemetry" strip on `/personal` (demoted by design).
- `GitHubHeatmap.tsx` (client) — 365-day contribution grid; fetches `/api/github/contributions`.
- `PersonalStatus.tsx` (client) — /personal status board: live LA/Taipei clocks
  (client-ticked; em-dashes without JS) + now-playing + today's Claude count
  (server-fetched props from `app/personal/page.tsx`).
- `ListeningSection.tsx` (server) — fetches Spotify + NetEase in parallel, passes to client cards.
- `ListeningCard.tsx` (client) — renders a track card.
- `RecentPlays.tsx` (server) — recent Spotify tail.
- `SpotifyPill.tsx` / `SpotifyPlayer.tsx` (client) — "now playing" pill / player UI.
- `NeteaseTopTracks.tsx` (client) — NetEase most-played view (brand-red themed).

### Tea Atlas
- `TeaAtlas.tsx` (client) — CARTO dark tile layer config + map.
- `TeaAtlasClient.tsx` (client) — `ssr:false` Leaflet wrapper (avoids `window` crash at prerender).

### Animation / text primitives
- `Reveal.tsx` (client) — IntersectionObserver fade-in wrapper (no animation lib).
- `RevealText.tsx` (client) — word-by-word staggered text reveal. *(tested)*
- `DecodeText.tsx` (client) — scramble-to-resolve text effect.
- `AskAI.tsx` (client) — compact "in a hurry?" row above the footer: provider links with a pre-filled prompt (deliberately not a headline section).

### Retired (not rendered — do not extend)
- `LivingGraph.tsx` — old 3D force-graph hero, replaced by `WatchFace`.
- `LiveStrip.tsx` — old live strip, now folded into `Nav`.

### Tests
- `SpecStrip.test.tsx`, `RevealText.test.tsx` — component tests (Vitest + Testing Library).

---

## 5. Content & data

### `content/projects/*.mdx` — the project "CMS"
Each `.mdx` file is one project case study. Frontmatter shape (see `lib/projects.ts`):
`title, slug, tagline, date, stack[], metrics[], github_repo?, cover?, draft?,
problem?, built[]?, featured?, proprietary?, demo?`. The mini-spec card fields:
`problem` (one-liner), `built` (what-I-built bullets), `featured` (homepage order,
1 = first), `proprietary` (work project, no public code — never fake a repo link),
`demo` (only when a real URL exists).
Currently: `cratemate.mdx` (1), `usc-fit.mdx` (2), `courtside.mdx` (3),
then the proprietary work projects in date order: `kenmou-dashboard.mdx` (4),
`internal-tools.mdx` (5).
**To add a project:** drop a new `.mdx`
here — it auto-appears at `/projects` and gets its own `/projects/<slug>` page.

**Cover images:** put a screenshot at `public/projects/<slug>/cover.png` and set
`cover: /projects/<slug>/cover.png` in the frontmatter — it then renders on the
landing project card, the `/projects` index, and as the detail-page hero figure.
No `cover` → text-only layout (the current look). Same idea for the About
portrait: drop `public/me.jpg` and it appears, no code change.

### `data/*.ts` — typed content modules
- `about.ts` — `bio[]` + `currently[]`.
- `experience.ts` — `experiences[]` (internships/founder bullets) for the timeline.
- `skills.ts` — evidence-based buckets: `productionReady[] / shippedWith[] / exploring[] / supporting[]`.
- `hobbies.ts` — `hobbies[]` vignettes.
- `now.ts` — `nowSections[]` + `lastUpdated` for `/now`.
- `tea.ts` — `teaSpots[]` (LA + Taipei) for the Tea Atlas.
- `graph.ts` — nodes/edges for the (retired) Living Graph. Kept for reference.
- `claude-usage.json` — **generated**, committed snapshot of Claude usage (see §7).

---

## 6. Library / server logic (`lib/`)

- `projects.ts` — reads `content/projects/*.mdx`, parses frontmatter with `gray-matter`.
  Exports `getAllProjects()` (sorted by date, drops drafts), `getFeaturedProjects()`
  (recruiter-priority order via the `featured` field) and `getProjectBySlug()`.
- `spotify.ts` — server-side Spotify client. Uses the refresh-token grant
  (`SPOTIFY_CLIENT_ID/SECRET/REFRESH_TOKEN`) to call the "now playing" + recent endpoints.
  **The access token never reaches the client.**
- `netease.ts` — server-side NetEase client. Uses `NETEASE_UID` + `NETEASE_COOKIE`
  (cookie-based, no official API) to fetch most-played tracks. Cookie stays server-side.
- `claude-usage.ts` — scans local Claude/Cowork transcripts (`~/.claude/projects/**/*.jsonl`,
  macOS/Linux/Windows candidate dirs) **plus** an optional `data/claude-chat-export.json`,
  and aggregates them into `UsageData` (per-day counts, token totals, session counts).
  **Emits only numbers** — no message content, prompts, or file paths. In dev it scans
  fresh; in prod it falls back to the committed `data/claude-usage.json`.
- `geometry.ts` — geometry math helpers (watch-face / layout). *(tested in `geometry.test.ts`)*
- `utils.ts` — `cn()` Tailwind class merge helper.

---

## 7. API routes (`app/api/`)

| Route | Source | Notes |
|---|---|---|
| `GET /api/spotify/now-playing` | `lib/spotify.ts` | Returns only curated track fields (title, artist, album, cover, url). `isPlaying:false` when nothing's on. |
| `GET /api/github/contributions` | unofficial proxy `github-contributions-api.jogruber.de` | Username from `NEXT_PUBLIC_GITHUB_USERNAME` (default `mdothsieh`). 1-hour edge cache. Errors return generic codes, no internal leak. |

There is **no** NetEase API route — `ListeningSection` (a server component) calls
`lib/netease.ts` directly during render.

---

## 8. Scripts & build hooks (`scripts/`)

- `sync-claude-usage.mjs` — scans `~/.claude` transcripts, writes `data/claude-usage.json`.
  Runs automatically via `predev` / `prebuild`, or manually with `npm run sync:claude`.
- `spotify-auth.mjs` — one-shot OAuth helper to obtain a Spotify refresh token
  (`npm run spotify:auth`).
- `test-claude-usage.mjs` — standalone test for the usage-scanning logic.
- `sync-and-deploy.sh` — syncs usage data + git-pushes to trigger a Vercel redeploy
  (intended for a daily launchd job).

**npm scripts:** `dev`, `build`, `start`, `lint`, `test`, `test:watch`,
`sync:claude`, `spotify:auth` (+ `predev`/`prebuild` auto-sync hooks).

---

## 9. How it all connects (data flow)

```
Visitor → app/page.tsx (server, revalidate=30)
            ├─ getFeaturedProjects() → lib/projects.ts  → content/projects/*.mdx
            ├─ getClaudeUsage()      → lib/claude-usage.ts → ~/.claude/**.jsonl OR data/claude-usage.json
            ├─ getNowPlaying()       → lib/spotify.ts   → Spotify API (refresh token)
            └─ renders sections (components/*) wrapped in <Reveal>

Personal layer: /personal (server, revalidate=30)
            ├─ getClaudeUsage()      → telemetry heatmap
            └─ <ListeningSection>    → lib/spotify.ts + lib/netease.ts (server-side)

Client widgets (in the browser):
   GitHubHeatmap  ──fetch──▶  /api/github/contributions ──▶ jogruber proxy
   SpotifyPill    ──fetch──▶  /api/spotify/now-playing   ──▶ lib/spotify.ts
   AmbientWash    ──reads──▶  current album art → samples dominant color

Project detail: /projects/[slug] → getProjectBySlug() → <MDXRemote> (server-rendered)
Tea Atlas: /tea → TeaAtlasClient (ssr:false) → Leaflet + data/tea.ts
```

**Security posture** (verified): secrets are server-side only; the one `NEXT_PUBLIC_`
var is a non-secret username. `next.config.mjs` ships a real CSP + `X-Frame-Options`.
The CSP is relaxed **in development only** (`'unsafe-eval'` + `ws:` for react-refresh
/ HMR — without them the dev bundle dies and nothing hydrates); prod stays strict.
No `dangerouslySetInnerHTML`/`eval`. MDX source is author-authored only. When touching
`claude-usage.ts`, **keep the output aggregate-only** — adding any field carrying message
text or paths would leak personal data onto a public page.

---

## 10. Conventions & gotchas

- **Every source file opens with a header comment** stating what it does and how it
  connects to other files. Read it before editing; update it when behavior changes.
  **This doc and those headers must stay in sync with the code** — see the "Startup task"
  in `CLAUDE.md`. Treat a doc update as part of the code change, not optional.
- **Server by default; `'use client'` only when needed** (interactivity, browser APIs).
- **`window`-touching libs** (Leaflet, the old force-graph) must be dynamically imported
  with `ssr:false`, or the route rendered on-demand — otherwise static prerender crashes.
- **Fonts** keep legacy CSS var names (`--font-inter/serif/mono`) so Tailwind tokens
  resolve without per-file changes, even though the actual faces changed.
- **Retired components** (`LivingGraph`, `LiveStrip`) are intentionally dead — don't build on them.
- **`data/claude-usage.json` is generated** — don't hand-edit; re-run `npm run sync:claude`.
- **Adding content** is usually a data/MDX edit, not a code change: projects → `content/projects/`,
  skills/experience/hobbies/etc. → `data/*.ts`.
- Run `npm test` after touching `SpecStrip`, `RevealText`, or `lib/geometry.ts`.
- Full setup/deploy/env walkthrough lives in `README.md`.
```
