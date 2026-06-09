# Portfolio Website — Project Overview

> Personal portfolio for Martin Hsieh (CS @ USC). A single-page landing site plus a
> few sub-routes, with live integrations (Spotify, GitHub, NetEase, local Claude
> usage). **Aesthetic:** Apple × Ferrari — red-on-black "Corsa" direction, precise
> typography, instrument/telemetry styling.
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
| `now/page.tsx` | `/now` | server | "What I'm doing now" page, content from `data/now.ts`. |
| `tea/page.tsx` | `/tea` | server | Tea Atlas map page. Rendered on-demand (not static) because Leaflet touches `window`. |
| `not-found.tsx` | (404) | server | Custom 404. |
| `sitemap.ts` | `/sitemap.xml` | — | Static routes + one entry per project. |
| `icon.tsx` | favicon | — | Generates the tab favicon at request time from JSX. |
| `apple-icon.tsx` | apple-touch-icon | — | Apple home-screen icon. |
| `opengraph-image.tsx` | OG image | — | Generates the social share card. |
| `globals.css` | — | — | Tailwind layers + custom animations/tokens. |

**Section order on the landing page** (`app/page.tsx`):
`01 Hero` → `SpecStrip` → `02 About` → `03 ExperienceTimeline` → `BoardingPass` →
`04 Builds (projects)` → `05 SkillsDashboard` → `06 Hobbies` → `07 ClaudeUsageHeatmap`
→ `08 ListeningSection`. Most are wrapped in `<Reveal>` for scroll-in animation.

---

## 4. Components (`components/`)

Header (`Nav`) is **server**; client components opt in with `'use client'`. Several
components are explicitly **retired** — kept as stubs/notes but no longer rendered.

### Layout & chrome
- `Nav.tsx` (server) — sticky top nav; also hosts the live strip as its second row.
- `NavLinks.tsx` (client) — desktop links with active-section highlighting (hash links).
- `SiteFooter.tsx` (server) — footer.
- `CommandPalette.tsx` (client) — ⌘K-style palette.
- `ScrollProgress.tsx` (client) — thin rose progress bar at top of viewport.
- `LangToggle.tsx` (client) — EN / 中 switch; sets `documentElement.dataset.lang`.
- `Kicker.tsx` (client) — bilingual section header ornament (Chinese numeral + EN/ZH).

### Background / ambient (visual atmosphere)
- `AmbientWash.tsx` (client) — samples dominant color from current Spotify album art.
- `Atmosphere.tsx` (server) — fixed film-grain + vignette overlay.
- `Aurora.tsx` (server) — slow CSS gradient field behind the hero.
- `Parallax.tsx` (client) — scroll-linked parallax wrapper.
- `LiveFavicon.tsx` (client) — draws a live clock to canvas, swaps it in as favicon.

### Hero & landing sections
- `Hero.tsx` (server) — section 01; centerpiece is `WatchFace`.
- `WatchFace.tsx` (client) — animated watch-face hero centerpiece (replaced the retired `LivingGraph`).
- `SpecStrip.tsx` (server) — Apple-style recruiter "spec row" of big numbers. *(tested)*
- `About.tsx` (server) — bio + "currently" list, from `data/about.ts`.
- `ExperienceTimeline.tsx` (server) — vertical timeline from `data/experience.ts`.
- `BoardingPass.tsx` (server) — boarding-pass-styled CV interlude (links to `public/cv.pdf`).
- `SkillsDashboard.tsx` (server) — skills grid from `data/skills.ts`.
- `Hobbies.tsx` (server) — off-hours vignettes from `data/hobbies.ts`.

### Live data widgets
- `ClaudeUsageHeatmap.tsx` (client) — GitHub-style year heatmap; consumes `UsageData` from `lib/claude-usage.ts`.
- `GitHubHeatmap.tsx` (client) — 365-day contribution grid; fetches `/api/github/contributions`.
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
- `AskAI.tsx` (client) — visitor-facing "ask AI about me" prompt block.

### Retired (not rendered — do not extend)
- `LivingGraph.tsx` — old 3D force-graph hero, replaced by `WatchFace`.
- `LiveStrip.tsx` — old live strip, now folded into `Nav`.

### Tests
- `SpecStrip.test.tsx`, `RevealText.test.tsx` — component tests (Vitest + Testing Library).

---

## 5. Content & data

### `content/projects/*.mdx` — the project "CMS"
Each `.mdx` file is one project case study. Frontmatter shape (see `lib/projects.ts`):
`title, slug, tagline, date, stack[], metrics[], github_repo?, cover?, draft?`.
Currently: `usc-fit.mdx`, `courtside.mdx`. **To add a project:** drop a new `.mdx` here — it auto-appears
at `/projects` and gets its own `/projects/<slug>` page.

### `data/*.ts` — typed content modules
- `about.ts` — `bio[]` + `currently[]`.
- `experience.ts` — `experiences[]` (internships/founder bullets) for the timeline.
- `skills.ts` — `strong[] / proficient[] / learning[]` skills.
- `hobbies.ts` — `hobbies[]` vignettes.
- `now.ts` — `nowSections[]` + `lastUpdated` for `/now`.
- `tea.ts` — `teaSpots[]` (LA + Taipei) for the Tea Atlas.
- `graph.ts` — nodes/edges for the (retired) Living Graph. Kept for reference.
- `claude-usage.json` — **generated**, committed snapshot of Claude usage (see §7).

---

## 6. Library / server logic (`lib/`)

- `projects.ts` — reads `content/projects/*.mdx`, parses frontmatter with `gray-matter`.
  Exports `getAllProjects()` (sorted by date, drops drafts) and `getProjectBySlug()`.
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
            ├─ getAllProjects()      → lib/projects.ts  → content/projects/*.mdx
            ├─ getClaudeUsage()      → lib/claude-usage.ts → ~/.claude/**.jsonl OR data/claude-usage.json
            ├─ getNowPlaying()       → lib/spotify.ts   → Spotify API (refresh token)
            └─ renders sections (components/*) wrapped in <Reveal>

Client widgets (in the browser):
   GitHubHeatmap  ──fetch──▶  /api/github/contributions ──▶ jogruber proxy
   SpotifyPill    ──fetch──▶  /api/spotify/now-playing   ──▶ lib/spotify.ts
   AmbientWash    ──reads──▶  current album art → samples dominant color

Project detail: /projects/[slug] → getProjectBySlug() → <MDXRemote> (server-rendered)
Tea Atlas: /tea → TeaAtlasClient (ssr:false) → Leaflet + data/tea.ts
```

**Security posture** (verified): secrets are server-side only; the one `NEXT_PUBLIC_`
var is a non-secret username. `next.config.mjs` ships a real CSP + `X-Frame-Options`.
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
