# Full-Site Audit — Design Spec

**Date:** 2026-07-14
**Status:** Approved

## Purpose

Produce a comprehensive, written audit of PanchangPath covering bugs, broken links,
incorrect/outdated information, redundant or non-functional buttons, layout
inconsistencies, responsive design issues, and general UX/UI problems — across every
generated page on the site (~350 pages, all `getStaticPaths()` routes included). This
is a report-only engagement: no fixes are applied as part of this work. Fixing is a
separate follow-up once the report is reviewed and prioritized.

## Non-goals

- No code fixes applied during the audit itself.
- No new CI/regression test suite — the crawler is a reusable dev tool, not a
  pipeline gate.
- No visual review of literally every one of the ~350 pages by eye — see "Visual
  review scope" below for how full coverage is achieved without that cost.

## Phase 1 — Build

Run `astro build` to produce `dist/`. Enumerate the full route list by walking
`dist/**/*.html`. This is the authoritative page list — includes every
`getStaticPaths()`-generated route (devotional items, festival/event detail pages,
rashi pages, regional panchang variants, etc.), not just top-level nav entries.

## Phase 2 — Automated crawl (Playwright)

**Script:** `scripts/audit/crawl.mjs`, committed to the repo (Playwright is already a
devDependency). Runs against `astro preview` (the built `dist/`, not `astro dev`, so
results reflect what actually ships).

For every route in the Phase 1 list, at each of 3 viewport widths (375px mobile,
768px tablet, 1440px desktop):

- Record HTTP status of the page itself and every same-origin asset request
  (images, fonts, scripts) — flag any non-2xx.
- Extract every internal `<a href>` on the page; verify it resolves to a route in
  the Phase 1 list (catches broken internal links site-wide, not sampled).
- Capture browser console errors/warnings.
- Detect horizontal overflow: `document.documentElement.scrollWidth >
  window.innerWidth` at that breakpoint.
- Flag `<img>` with missing/empty `alt`, and broken images (`naturalWidth === 0`
  after load).
- Flag duplicate DOM `id` attributes.
- Flag likely-dead interactive elements: elements with `cursor: pointer` styling
  or a `button`/`role=button` that have no `href` and no attached click handler
  (best-effort heuristic, not exhaustive — real non-functional-button findings
  still need the manual pass in Phase 4).
- Save one screenshot per page per breakpoint to
  `scripts/audit/output/screenshots/<route>/<breakpoint>.png`.

**Output:** `scripts/audit/output/crawl-results.json` — one record per page with all
of the above, plus a `flagged: true/false` + reasons field for anything that trips a
check.

This phase gives 100% functional-check coverage of every page with no sampling.

## Phase 3 — Visual review scope

I review a screenshot for:
- Every unique page *template* once (~45 templates: homepage, each of the 15
  Jyotish calculators, each of the 9 Muhurta tools, each devotional category's
  index + one detail page, each of the 11 regional panchang pages, festival index +
  one detail page, event index + one detail page, rashifal index + one detail page,
  blog index + one post, static/legal pages, error pages, etc.)
- Every page Phase 2 flagged as anomalous (overflow, console error, broken
  asset, dead-control heuristic hit).

This is full functional coverage (Phase 2) plus representative + exception-driven
visual coverage (Phase 3), rather than brute-force screenshotting all ~350 pages
individually — approved trade-off from brainstorming.

## Phase 4 — Data/content correctness pass (manual/code review)

- **Regression check against known issues:** walk CLAUDE.md's "Known Issues"
  section and confirm, in current code, which are still open vs. already fixed but
  not yet marked as such (and vice versa — don't re-report already-tracked issues
  as new findings).
- **Header nav sync:** diff the desktop dropdown, mobile drawer, and `searchItems`
  array in `src/components/Header.astro` for parity — every page reachable in one
  should be reachable in all three.
- **Festival date sanity:** script a chronological-plausibility check across
  `src/lib/festivals.ts` for every year block (e.g. Narak Chaturdashi should
  precede Diwali, not follow it — the same class of bug already found for 2025).
  Flag any ordering that violates well-known relative festival sequencing.
- **Spot-check computed astronomy:** for a fixed test case — **2026-07-14, New
  Delhi** (today's date, and the reference city already used elsewhere in
  CLAUDE.md's known-issues notes) — compare this site's Panchang
  (Tithi/Nakshatra/Yoga/Karana/Rahu Kalam) and a Kundali chart against
  drikpanchang.com's published values for the same date/location.
- **Stale/placeholder content scan:** grep for `TODO`, `FIXME`, stray
  `console.log`, and obvious placeholder/lorem text across `src/`.
- **Redundant/non-functional buttons:** cross-reference Phase 2's dead-control
  heuristic hits with manual review of the relevant component source.

## Phase 5 — Report

**Location:** `docs/audits/2026-07-14-full-site-audit.md`

**Structure:** grouped by severity, then by area within each severity:

- **Severity:** Critical (wrong/broken functionality visible to users, e.g. a
  calculator producing incorrect output, a page that fails to render) → High
  (broken links, non-functional buttons on primary flows, incorrect factual/date
  data) → Medium (responsive/layout issues, minor content inconsistencies) → Low
  (cosmetic issues, typos, redundant-but-harmless elements)
- **Areas:** Broken Links, Data Accuracy, UI/Responsive, Dead Controls, Content
  Quality/SEO

Each finding includes: `file:line` (or route + component), a one-line description,
and repro steps or evidence (e.g. screenshot path, drikpanchang comparison value).
Findings that duplicate an existing CLAUDE.md Known Issue are marked **"already
tracked"** with a pointer, not repeated as new.

## Success criteria

- `crawl-results.json` has a record for every route discovered in Phase 1 (no
  silently-skipped pages).
- Every unique template has at least one reviewed screenshot; every flagged page
  from Phase 2 has been individually looked at and either confirmed or dismissed
  as a false positive in the report.
- Report is saved at the path above and cross-references CLAUDE.md's existing
  Known Issues list rather than duplicating it.
