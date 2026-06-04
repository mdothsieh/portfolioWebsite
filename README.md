# martinhsieh.com

Personal portfolio. Next.js 15 · TypeScript · Tailwind · React Three Fiber (via `react-force-graph-3d`) · MDX.

## Quickstart

```bash
pnpm install        # or npm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000.

The site loads even with no env vars set — the Spotify pill stays hidden, and the GitHub heatmap falls back to a friendly error if the username can't be reached.

## Project structure

```
app/
  layout.tsx                 root layout, fonts, Nav
  page.tsx                   landing — hero, timeline, projects, github
  globals.css
  projects/
    page.tsx                 /projects index
    [slug]/page.tsx          MDX-rendered project page
  api/
    github/contributions/    proxy for the contribution heatmap
    spotify/now-playing/     refresh-token Spotify call

components/
  Hero.tsx                   headline + Living Graph
  LivingGraph.tsx            3D force graph (client-only)
  Nav.tsx                    sticky top nav
  SpotifyPill.tsx            live "now playing" pill
  GitHubHeatmap.tsx          365-day contribution grid
  ExperienceTimeline.tsx     vertical timeline from resume

content/
  projects/
    trojan-rooms.mdx         demo project — delete/replace freely

data/
  graph.ts                   nodes + edges for the Living Graph
  experience.ts              your internship/founder bullets

lib/
  projects.ts                MDX file loader
  utils.ts                   `cn` class helper
```

## Adding a new project

1. Create `content/projects/<slug>.mdx`:

```mdx
---
title: My New Build
slug: my-new-build
tagline: One-line elevator. Verb first, metric second.
date: '2026-08-01'
stack:
  - Next.js
  - Postgres
  - pgvector
metrics:
  - label: p50 latency
    value: 180 ms
  - label: users
    value: 1.2k
  - label: stars
    value: '47'
  - label: deploys
    value: '12'
github_repo: mdothsieh/my-new-build
---

Long-form MDX. Headings, code blocks, embedded React all work.

## Architecture

Write the case study here. Lead with the metric, name the stack, end with
"what I'd do differently."

```ts
function example() { return 42; }
```
```

2. (Optional) Add the project to the Living Graph in `data/graph.ts`:

```ts
{ id: 'my-new-build', kind: 'project', label: 'My New Build', slug: 'my-new-build', weight: 6 }
```

Then connect it to the relevant skill / experience nodes:

```ts
{ source: 'my-new-build', target: 'next' },
{ source: 'my-new-build', target: 'sql' },
{ source: 'my-new-build', target: 'kenmou-2025' },
```

3. That's it. The project shows up at `/projects`, gets a `/projects/<slug>` page, and (if you added a graph node) becomes a clickable node on the home page.

## Adding a graph node

Every node needs `id`, `kind`, and `label`. Optional fields:
- `slug` — makes the node clickable on the graph; routes to `/projects/<slug>`
- `weight` — visual size (1–10, default 4)
- `meta` — anything; `meta.description` and `meta.period` show in the hover card

Node kinds and their colors are defined in `components/LivingGraph.tsx`:

| kind | color |
|---|---|
| `project` | amber |
| `skill` | indigo |
| `experience` | emerald |
| `award` | gold |
| `course` | violet |
| `hobby` | rose |
| `place` | sky |

## Claude usage heatmap

Section 04 of the landing page renders a year-long heatmap of your real Claude Code
activity, sourced from `~/.claude/projects/**/*.jsonl`.

- `scripts/sync-claude-usage.mjs` scans those JSONL files and writes `data/claude-usage.json`.
- The script runs automatically before `npm run dev` and `npm run build` (via the
  `predev` / `prebuild` hooks).
- You can also refresh manually any time: `npm run sync:claude`.
- The committed `data/claude-usage.json` is what gets deployed to Vercel — re-sync and commit before pushing if you want production to reflect recent activity.

If `~/.claude/projects` doesn't exist yet (you've never used Claude Code), the
script writes a valid empty file and the heatmap renders as an empty grid with a
"no sessions yet" note.

## Environment variables

```bash
# Spotify — leave blank to hide the pill
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
```

### Getting a Spotify refresh token (one-time, ~5 minutes)

> Spotify dropped support for `http://localhost` redirect URIs in late 2024.
> Use `http://127.0.0.1:3000/callback` instead — same machine, different name.

1. Go to https://developer.spotify.com/**dashboard** (not the marketing landing).
2. Click **Create app**.
3. Fill in name + description, set Redirect URI to `http://127.0.0.1:3000/callback`,
   check ✅ Web API, accept the Terms.
4. Copy the **Client ID** and **Client Secret** into `.env.local`.
5. Paste this URL into your browser (replace `YOUR_CLIENT_ID`):
   ```
   https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://127.0.0.1:3000/callback&scope=user-read-currently-playing
   ```
6. Authorize. The browser shows "this site can't be reached," but the URL bar
   contains `?code=...`. Copy the code.
7. Exchange the code for a refresh token:
   ```bash
   CLIENT_ID="..."; CLIENT_SECRET="..."; CODE="..."
   curl -X POST https://accounts.spotify.com/api/token \
     -H "Authorization: Basic $(printf '%s:%s' "$CLIENT_ID" "$CLIENT_SECRET" | base64)" \
     -d "grant_type=authorization_code" \
     -d "code=$CODE" \
     -d "redirect_uri=http://127.0.0.1:3000/callback"
   ```
8. Paste the `refresh_token` from the JSON into `.env.local` as
   `SPOTIFY_REFRESH_TOKEN`. The refresh token never expires.

For production, add a second Redirect URI in your Spotify app settings:
`https://<your-vercel-domain>/callback` — you only need it for the one-time
auth dance, never at runtime.

## Deploy to the internet (Vercel)

Vercel is the canonical host for Next.js apps — free tier covers personal
portfolios, auto-deploys on every `git push`, and handles HTTPS for you.

### One-time setup

**Step 1 — push to GitHub.** From the portfolio folder:

```bash
# Refresh the Claude usage snapshot so prod shows real data
npm run sync:claude

# Initialize git and commit everything (including the snapshot)
git init
git add .
git commit -m "initial portfolio"

# Create an empty repo on github.com (any name), then:
git remote add origin git@github.com:mdothsieh/portfolio.git
git branch -M main
git push -u origin main
```

**Step 2 — import on Vercel.**

1. Go to https://vercel.com and sign up with your GitHub account.
2. Click **Add New → Project**, pick your portfolio repo, click **Import**.
3. Vercel auto-detects Next.js. Don't change build/output settings.
4. Expand **Environment Variables** and add:
   - `SPOTIFY_CLIENT_ID` — same value as your `.env.local`
   - `SPOTIFY_CLIENT_SECRET` — same value
   - `SPOTIFY_REFRESH_TOKEN` — same value
5. Click **Deploy**. Two minutes later you have a URL like
   `https://portfolio-abc123.vercel.app`.

**Step 3 — add your prod URL to Spotify.** In the Spotify dashboard, open your
app → Edit Settings → add `https://your-vercel-url/callback` to Redirect URIs.
(You won't actually use it — production reuses the refresh token from env vars
— but Spotify validates it exists.)

**Step 4 (optional) — custom domain.** Vercel → your project → Settings →
Domains → add `martinhsieh.com` (after buying it from Porkbun/Namecheap). Vercel
walks you through the DNS records.

### Day-to-day after deployment

Any push to `main` auto-deploys to production. Branch pushes get preview URLs.

To refresh the Claude usage snapshot on production:

```bash
npm run sync:claude       # rescans your ~/.claude on your Mac
git add data/claude-usage.json
git commit -m "refresh usage snapshot"
git push                  # Vercel rebuilds with new data
```

I'd suggest running this once a week. In dev (`npm run dev`), the heatmap is
already live — it scans your transcripts fresh every 60s, so you don't need to
sync at all locally.

## Roadmap (in priority order)

- [ ] **v1.1** — `/now` page, plain MDX, what you're learning this week
- [ ] **v1.2** — Tea Atlas with Mapbox (LA + Taipei pins)
- [ ] **v1.3** — DJ decks shelf via SoundCloud oEmbed
- [ ] **v1.4** — 2D fallback for the graph on mobile (`react-force-graph-2d`)
- [ ] **v1.5** — bloom + chromatic aberration on the graph
- [ ] **v1.6** — `prefers-reduced-motion` static SVG snapshot

## Notes / gotchas

- `react-force-graph-3d` touches `window` on import — that's why `LivingGraph.tsx` uses `next/dynamic({ ssr: false })`.
- The GitHub contributions endpoint is an unofficial public proxy. If it ever flakes, swap to the official GraphQL API (you'll need a `GITHUB_TOKEN`).
- All MDX is rendered server-side via `next-mdx-remote/rsc` — there's no client-side MDX runtime, so the bundle stays small.
- `prose` styles on project pages come from `@tailwindcss/typography`. Tweak in `app/projects/[slug]/page.tsx`.
