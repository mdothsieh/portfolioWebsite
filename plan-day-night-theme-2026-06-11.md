# Plan — Day/Night Theme + Recruiter Polish (2026-06-11)

Decisions made with Martin:
- **Day palette:** Apple light gray — bg `#f5f5f7`, white cards, near-black text,
  deepened Ferrari red `#e0281c` (contrast-safe on white). Night stays the current Corsa look.
- **Behavior:** night is the default for everyone (signature first impression);
  the toggle persists in `localStorage` and is restored before first paint.
- **Improvements:** resume button in nav, metrics rendered on project cards,
  calmer day mode (no glows/grain/carbon in day), contrast + print pass.

## 1. Theme infrastructure

- [x] `tailwind.config.ts` — convert `bg`, `surface`, `divider`, `primary`, `muted`,
      `rose-300/400/500` to `rgb(var(--c-*) / <alpha-value>)` channel variables
      (opacity modifiers like `bg-surface/40` are used in 37 files, so channels are required).
      Unused rose shades stay static hex.
- [x] `app/globals.css` — define night channels in `:root`, day overrides under
      `html[data-theme='day']`; move body bg/text and `::selection` onto the vars;
      flip `color-scheme` per theme.
- [x] `app/layout.tsx` — extend the inline bootstrap script: read `localStorage.theme`,
      apply `data-theme='day'` before first paint (whitelisted value only — no flash, no injection).
- [x] `components/ThemeToggle.tsx` (new) — sun/moon client toggle modeled on `LangToggle`;
      sets `data-theme`, persists, fires `themechange`.
- [x] `components/Nav.tsx` — mount `ThemeToggle` next to `LangToggle`.

## 2. Calmer day mode

- [x] Hide `.carbon-field`, `.atmosphere` (grain + vignette), `.ambient-wash`, `.aurora`
      under `html[data-theme='day']` — pure CSS, night untouched.
- [x] Neutralize `.panel-carbon` weave/sheen in day (flat white card + soft shadow).
- [x] `components/DecodeText.tsx` — skip the glyph scramble when theme is day on mount.

## 3. Resume button in nav

- [x] Persistent red "Resume" pill in nav row 1 linking `/cv.pdf` (exists in `public/`),
      with zh twin via `<T>`. Recruiters never scroll to find it.

## 4. Metrics on project cards

- [x] `components/ProjectSpecCard.tsx` — render the existing (typed, currently
      card-invisible) `metrics` frontmatter as a compact spec strip on each card.
- [x] Flag projects whose metrics are descriptive rather than quantified
      (courtside, usc-fit) for Martin to strengthen — content edit, his call.

## 5. Contrast & print pass

- [x] Verify WCAG AA: day red `#e0281c` on `#f5f5f7` ≈ 4.9:1 ✓; day muted `#5d646e` ≈ 5.6:1 ✓;
      night values unchanged (already pass).
- [x] `@media print` — force day palette, hide fixed chrome (nav, footer, atmosphere,
      progress bar, command palette), and force reveal-animation hidden states visible
      so printed pages aren't blank.

## 6. Docs + verification (CLAUDE.md contract)

- [x] Header comments on new/changed files; update `overview.md` (§4 components, theme system).
- [x] `npm run build` passes.
- [x] `npm test` passes.
- [x] Visual check of both themes (homepage) — fix glaring day-mode issues only;
      `/personal` deep-polish is out of scope unless broken.

## Security Concerns

- **localStorage theme value** is read by an inline pre-paint script — value is
  strictly whitelisted (`'day'` only triggers a change) before touching the DOM,
  so a tampered value cannot inject attributes or script.
- **No new external hosts, embeds, or routes** — CSP in `next.config.mjs` unchanged.
- **Resume link** is a same-origin static file (`/cv.pdf`); no analytics or third-party CDN added.
- **No secrets touched** — theme system is entirely client-side presentation.
