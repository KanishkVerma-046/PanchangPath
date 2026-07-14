# Visual Review Findings — 2026-07-14

Source: `scripts/audit/output/crawl-results.json` (391 crawled routes, 3 breakpoints each: 375px mobile / 768px tablet / 1440px desktop) and corresponding screenshots in `scripts/audit/output/screenshots/`.

Method: reviewed one representative screenshot per unique template across the full site (top-level pages, blog post, all 15 Jyotish calculators, all 9 Muhurta pages, all 10 Devotional category indexes + one detail page each + Sundarkand's single detail, regional Panchang hub + 1 region, Festivals/Events/Rashifal hubs + 1 example each, all 4 Planets pages), plus every route flagged `true` on any breakpoint in the crawl JSON. Findings below are genuine issues only — clean templates are not listed.

---

### /jyotish/lagna/ (desktop)
- **Issue:** In the "Lagna Details" card, label and value text are rendered with no space/separator between them (e.g. a label runs directly into its value), making the card hard to read at a glance. Same underlying component pattern also affects `/jyotish/nakshatra/` and `/jyotish/rashi/` — likely a shared duplicated inline-script/markup bug (per CLAUDE.md, calculator detail cards are hand-duplicated per page).
- **Screenshot:** scripts/audit/output/screenshots/jyotish_lagna/desktop.png
- **Severity guess:** Medium

### /jyotish/nakshatra/ (desktop)
- **Issue:** Same label/value-glued-together formatting bug as `/jyotish/lagna/`, in this page's "Attributes" details card.
- **Screenshot:** scripts/audit/output/screenshots/jyotish_nakshatra/desktop.png
- **Severity guess:** Medium

### /jyotish/rashi/ (desktop)
- **Issue:** Same label/value-glued-together formatting bug as `/jyotish/lagna/`, in this page's "Rashi Details" card.
- **Screenshot:** scripts/audit/output/screenshots/jyotish_rashi/desktop.png
- **Severity guess:** Medium

### /muhurta/griha-pravesh/ (mobile)
- **Issue:** The Location dropdown/selector in the date-range finder tool is cut off at the right edge of the 375px viewport — part of the control is not reachable/visible. Same 3-column finder layout also affects `/muhurta/shubha-dates/` and `/muhurta/vivah/`.
- **Screenshot:** scripts/audit/output/screenshots/muhurta_griha-pravesh/mobile.png
- **Severity guess:** High

### /muhurta/shubha-dates/ (mobile)
- **Issue:** Same Location-dropdown-cut-off-at-viewport-edge bug as `/muhurta/griha-pravesh/`.
- **Screenshot:** scripts/audit/output/screenshots/muhurta_shubha-dates/mobile.png
- **Severity guess:** High

### /muhurta/vivah/ (mobile)
- **Issue:** Same Location-dropdown-cut-off-at-viewport-edge bug as `/muhurta/griha-pravesh/`.
- **Screenshot:** scripts/audit/output/screenshots/muhurta_vivah/mobile.png
- **Severity guess:** High

### /rashifal/ (desktop)
- **Issue:** In the 12-rashi card grid, only 6 cards render at full opacity; a 7th card renders very low-opacity/near-invisible, and the remaining 5 rashi cards are missing from the rendered page entirely, followed by a large empty gap before the next section. Possibly a scroll-triggered fade-in (IntersectionObserver) animation caught mid-transition by the full-page screenshot tool rather than a genuine layout bug — needs manual verification by scrolling the live page slowly to confirm all 12 cards eventually render.
- **Screenshot:** scripts/audit/output/screenshots/rashifal/desktop.png
- **Severity guess:** High (possibly intentional/animation artifact — verify manually before treating as a real bug)

### /rashifal/ (mobile)
- **Issue:** Same missing/faded rashi cards + large empty gap issue as the desktop breakpoint. Possibly a scroll-triggered fade-in animation artifact from full-page screenshot capture — verify manually.
- **Screenshot:** scripts/audit/output/screenshots/rashifal/mobile.png
- **Severity guess:** High (possibly intentional/animation artifact — verify manually before treating as a real bug)

### /devotional/ashtakam/ (mobile)
- **Issue:** Crawler flagged horizontal overflow at 375px viewport (rendered content width ~384-397px vs 375px viewport). No single obviously-broken/cut-off element is visible in the screenshot, so the excess width is likely a small margin/padding overshoot on a card or grid rather than a dramatic visual break. Same subtle overflow pattern also flagged on `/devotional/mantra/`, `/devotional/namavali/`, `/devotional/stotram/`, and `/panchang/malayalam/`.
- **Screenshot:** scripts/audit/output/screenshots/devotional_ashtakam/mobile.png
- **Severity guess:** Low

### /devotional/mantra/ (mobile)
- **Issue:** Same subtle horizontal-overflow flag as `/devotional/ashtakam/` — no visually obvious break, low-confidence finding worth a source-level check (e.g. a grid item without `min-width: 0` or a fixed-width element).
- **Screenshot:** scripts/audit/output/screenshots/devotional_mantra/mobile.png
- **Severity guess:** Low

### /devotional/namavali/ (mobile)
- **Issue:** Same subtle horizontal-overflow flag as `/devotional/ashtakam/`.
- **Screenshot:** scripts/audit/output/screenshots/devotional_namavali/mobile.png
- **Severity guess:** Low

### /devotional/stotram/ (mobile)
- **Issue:** Same subtle horizontal-overflow flag as `/devotional/ashtakam/`.
- **Screenshot:** scripts/audit/output/screenshots/devotional_stotram/mobile.png
- **Severity guess:** Low

### /panchang/malayalam/ (mobile)
- **Issue:** Same subtle horizontal-overflow flag as the devotional index pages above (rendered width slightly exceeds 375px viewport, no obviously broken element visible in the screenshot).
- **Screenshot:** scripts/audit/output/screenshots/panchang_malayalam/mobile.png
- **Severity guess:** Low

### / (homepage) — all breakpoints
- **Issue:** Crawler flagged a broken link containing a literal unresolved template-literal fragment in its `href` (e.g. `/rashifal/${n[r]`), sourced from the Rashifal feed's per-card links on the homepage. This does not visually manifest on the rendered page (it's in an `href` attribute, not visible text/layout), but clicking the affected card link(s) would 404 or fail to navigate. Recorded here for completeness since it's a real defect, even though it's not a visual/layout bug per se — see `crawl-results.json` for the exact broken-link value and affected element. Mobile breakpoint additionally shows `overflow: true`; tablet/desktop do not, so any overflow is mobile-only and did not present as an obvious visual break in the screenshot.
- **Screenshot:** scripts/audit/output/screenshots/root/mobile.png
- **Severity guess:** Medium (broken link is functional, not visual — flagged for awareness; may be more relevant to a functional/link-integrity audit task than this visual one)

### /rashifal/ — broken link (all breakpoints)
- **Issue:** Same class of unresolved template-literal fragment in an `href` (e.g. `/rashifal/${n}`) as seen on the homepage, on this page's own rashi card links. Not a visual defect (invisible in the rendered screenshot), but a real broken-link bug — noted for cross-reference with functional-audit tasks.
- **Screenshot:** scripts/audit/output/screenshots/rashifal/desktop.png
- **Severity guess:** Medium (functional, not visual)

---

## Non-issues / crawler artifacts (no screenshot exists — noted for Task 9 awareness)

- **`/kundali/`** — no screenshot at any breakpoint. `src/pages/kundali.astro` is a pure `Astro.redirect('/jyotish/kundali', 301)`; the crawler's Playwright navigation throws mid-redirect, producing no capture. The redirect target `/jyotish/kundali/` was reviewed directly and renders cleanly (`flagged: false`). Not a real site bug.
- **`/devotional/sundarkand/`** — no screenshot at any breakpoint, same cause: this is a single-item-category index that 301-redirects straight to `/devotional/sundarkand/sundarkand/` per the Devotional Library pattern (CLAUDE.md). The redirect target was reviewed directly and renders cleanly (`flagged: false`). Not a real site bug.
