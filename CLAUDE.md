# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read this first

**Always read [`overview.md`](./overview.md) before starting work in this repo.** It is
the canonical orientation doc — full directory map, every component's purpose, data flow,
and gotchas. This CLAUDE.md is the short version; `overview.md` is the source of truth.

Every source file also opens with a header comment describing what it does and how it
connects to the rest of the codebase — read it before editing a file.

## Startup task (do this at the start AND end of every change)

This codebase is documented for future agents. Keep that documentation true:

1. **On start:** read `overview.md`, then read the header comment of each file you'll touch.
2. **On finish — before considering work done — update docs to match the code:**
   - If you **add a file**, give it a header comment (what it does + how it connects) and
     add it to `overview.md` (§3 routes / §4 components / §5–6 data & lib, etc.).
   - If you **change what a file does or how files connect**, update that file's header
     comment AND the relevant `overview.md` section.
   - If you **add a command, route, env var, or external host**, update `overview.md`,
     this CLAUDE.md, and the CSP in `next.config.mjs` as applicable.
   - **Never let `overview.md` or header comments drift from the code.** Stale docs are
     worse than none — a doc change is part of the code change, not optional follow-up.
3. **Verify:** run `npm run build` and `npm test` before declaring the change complete.

## Commands

```bash
npm run dev          # dev server at localhost:3000 (predev auto-syncs Claude usage)
npm run build        # production build (prebuild auto-syncs Claude usage)
npm run start        # serve the production build
npm run lint         # next lint
npm test             # vitest run (all tests)
npm run test:watch   # vitest watch mode
npm run sync:claude  # regenerate data/claude-usage.json from ~/.claude transcripts
npm run spotify:auth # one-shot helper to obtain a Spotify refresh token
```

Run a single test file / test by name:

```bash
npx vitest run components/SpecStrip.test.tsx
npx vitest run -t "renders the spec row"
```

Tests exist for `components/SpecStrip`, `components/RevealText`, and `lib/geometry` —
run `npm test` after changing those.

## Architecture (big picture)

Next.js 15 App Router portfolio, **TypeScript + Tailwind + MDX**. No database, no auth,
no payments — all dynamic data comes from external APIs (fetched server-side) or local files.

- **Server-first.** Components are React Server Components by default; `'use client'` is
  added only for interactivity or browser APIs. `app/page.tsx` is the server-rendered
  landing page that fetches projects + Claude usage + Spotify in parallel and composes
  the numbered sections from `components/`.
- **Content lives outside code.** Projects are `content/projects/*.mdx` (frontmatter
  parsed by `lib/projects.ts`, rendered via `next-mdx-remote/rsc`). Section content
  (about, experience, skills, hobbies, now, tea) lives in typed `data/*.ts` modules.
  Adding a project or updating a section is usually a content edit, not a code change.
- **`lib/` holds all server logic:** `projects.ts` (MDX loader), `spotify.ts` +
  `netease.ts` (API clients — credentials and tokens never reach the client),
  `claude-usage.ts` (scans local `~/.claude` transcripts → aggregate-only `UsageData`),
  `geometry.ts`, `utils.ts` (`cn()`).
- **API routes** are thin: `/api/spotify/now-playing` and `/api/github/contributions`
  (proxies an unofficial public endpoint). NetEase has no route — its server component
  calls `lib/netease.ts` directly.
- **The Claude usage heatmap** is generated data: `scripts/sync-claude-usage.mjs` writes
  `data/claude-usage.json` (auto-run via `predev`/`prebuild`). Dev scans fresh; prod uses
  the committed snapshot. Re-sync + commit to update production.

## Critical gotchas

- **`window`-touching libraries must not run at prerender.** Leaflet (Tea Atlas) and the
  retired force-graph crash static generation. Wrap in dynamic import `ssr:false`, or
  render the route on-demand (see `app/tea/page.tsx` / `components/TeaAtlasClient.tsx`).
- **`claude-usage.ts` must stay aggregate-only.** It reads private local transcripts and
  renders to a public page. It emits only counts/tokens — never add a field carrying
  message content, conversation IDs, or file paths.
- **Retired components are dead — don't extend them:** `LivingGraph.tsx` (replaced by
  `WatchFace.tsx`), `LiveStrip.tsx` (folded into `Nav.tsx`).
- **`data/claude-usage.json` is generated** — never hand-edit; run `npm run sync:claude`.
- **Font CSS var names are legacy on purpose** (`--font-inter/serif/mono`) so Tailwind
  tokens resolve unchanged even though the actual typefaces differ. Don't "fix" them.
- **Secrets / deploy / env setup** (Spotify refresh token, NetEase cookie, Vercel) are
  documented step-by-step in `README.md`. `.env.local` is gitignored and read server-side only.

## Security headers

`next.config.mjs` ships a real Content-Security-Policy + `X-Frame-Options`. If you add a
new external embed or asset host, update the CSP there (e.g. `frame-src`, `img-src`).
The CSP adds `'unsafe-eval'` + `ws:` **in development only** — react-refresh/HMR need
them; removing the dev branch makes `npm run dev` render a black page (no hydration).

## Progressive enhancement

Content must stay readable without JavaScript: hidden-until-animated states in
`app/globals.css` are scoped under `html.js` (set by the inline bootstrap script in
`app/layout.tsx`). If you add a new scroll/entrance animation with a hidden initial
state, scope it under `html.js` too.
