# Full-Site Audit — 2026-07-14

Scope: ~391 generated pages, crawled via `scripts/audit/crawl.mjs`
(automated: broken links/images, console errors, horizontal overflow at
375/768/1440px, duplicate DOM ids, dead links — zero sampling) plus a
manual visual pass over every unique page template and every
automatically-flagged page, plus a manual data/content correctness pass.

Findings already tracked in CLAUDE.md's "Known Issues" section are marked
as such rather than repeated here.

## High

### UI/Responsive

- **Location dropdown cut off at the 375px mobile viewport on 3 Muhurta date-finder pages.** `/muhurta/griha-pravesh/`, `/muhurta/shubha-dates/`, and `/muhurta/vivah/` share the same 3-column date-range finder layout; on mobile the Location selector is pushed past the right edge of the viewport and is not fully reachable/visible, degrading the primary tool on these pages.
  - Evidence: `scripts/audit/output/screenshots/muhurta_griha-pravesh/mobile.png`, `muhurta_shubha-dates/mobile.png`, `muhurta_vivah/mobile.png`; crawl JSON flags `overflow: true` (mobile only) for all three routes.
- **`/calendar/` mobile layout confined to the left half of the viewport.** The entire page (header, month grid, footer) renders in a narrow column occupying roughly the left half of the 375px viewport, leaving a large blank void down the right side top-to-bottom (~45% of screen width unused) — not a minor overflow but a failure of the layout to adapt to mobile width at all.
  - Evidence: `scripts/audit/output/screenshots/calendar/mobile.png`; crawl JSON flags `overflow: true` for `/calendar/` mobile.
- **`/rashifal/` rashi card grid appears to only render 6-7 of 12 cards, with a large empty gap after — needs manual verification before treating as confirmed.** At both mobile and desktop breakpoints, only 6 of the 12 rashi cards render at full opacity, a 7th renders near-invisible, and the remaining 5 are missing from the captured screenshot, followed by an empty gap. This may be a scroll-triggered fade-in (`IntersectionObserver`) animation caught mid-transition by the full-page screenshot tool rather than a genuine bug — flagged High because if it is real it breaks discovery of half the rashi cards, but it needs a manual slow-scroll check on the live page to confirm before scheduling a fix.
  - Evidence: `scripts/audit/output/screenshots/rashifal/desktop.png`, `rashifal/mobile.png`.

### Data Accuracy

- **Panchang element boundary/end times are systematically earlier on PanchangPath than on drikpanchang.com — needs independent re-verification before being treated as a confirmed bug.** Spot-checked 2026-07-14, New Delhi, all 4 core Panchang elements: Tithi, Yoga, and Karana end times were each ~45 minutes earlier than drikpanchang.com; Nakshatra end time was ~2h35m earlier (larger gap, consistent with Nakshatra being a pure Moon-longitude boundary vs. the other three being Sun-Moon relative-angle boundaries, so more sensitive to Moon-longitude precision differences); Rahu Kalam and sunrise/sunset were both ~5-6 minutes earlier, fully explaining each other (Rahu Kalam is a fixed fraction of day length). All 4 elements' **names** matched drikpanchang.com exactly — this is a boundary-time precision gap, not a misidentification. Flagged High because the site's core differentiator is Drik (astronomical) precision, the offset reproduced on every element checked, and a 45-minute-to-2.5-hour gap is large enough to matter for a user timing a Muhurta near a Tithi/Nakshatra boundary — but genuinely unconfirmed as a "PanchangPath is wrong" bug vs. a legitimate ephemeris-method difference, so treat as a lead requiring a third-source cross-check, not an assigned fix.
  - Evidence: `docs/audits/notes/2026-07-14-data-correctness.md`, "Astronomy Spot-Check" table; relevant code: `src/lib/panchang.ts` (`moonLongitude`, `sunriseUTC`) and its duplicated inline copy in `index.astro`.

## Medium

### UI/Responsive

- **Label and value text glued together with no separator on 3 Jyotish calculator detail cards.** `/jyotish/lagna/` ("Lagna Details" card), `/jyotish/nakshatra/` ("Attributes" card), and `/jyotish/rashi/` ("Rashi Details" card) each render a label running directly into its value with no space, hurting readability. Likely a shared duplicated inline-markup pattern across these hand-duplicated calculator pages (per CLAUDE.md's "Client-side scripts in static Astro" gotcha).
  - Evidence: `scripts/audit/output/screenshots/jyotish_lagna/desktop.png`, `jyotish_nakshatra/desktop.png`, `jyotish_rashi/desktop.png`.

### Content Quality

- **CLAUDE.md's "Known Issues" section contains 3 stale bullets that misstate current code state** — found during Task 8's Known Issues regression check. This is a documentation-accuracy problem (risk: a future task re-investigates or re-attempts a fix that's already done, or leaves a genuinely-fixed item looking open to anyone auditing the codebase), not a site-user-facing bug, hence Medium rather than a user-impact severity:
  1. **`getHinduCalendarInfo()` amanta-month label lag** is listed as still-open, but was fixed 2026-07-07 by commit `9a69524`, which rewrote the `amantaIdx` computation in `src/lib/panchang.ts` (now lines 570-582) to forward-search the ending Amavasya instead of using the old Sankranti-proxy shortcut the CLAUDE.md bullet describes. The bullet was never struck through.
  2. **`GOWRI_NIGHT` Wed=Sun copy-paste bug** is listed as still-unfixed ("its correct night-time values haven't been independently verified... yet"), but was fixed 2026-07-07 by commit `c2f2f2d`, which replaced the table in `src/lib/muhurta.ts:233-241` (and the duplicate in `muhurta/panchaka.astro:94-96`) with data verified against drikpanchang.com and cross-checked against prokerala.com. The Wed row no longer equals the Sun row.
  3. **Footer "Cities" dead-link bullet is a duplicate.** CLAUDE.md already has a struck-through bullet documenting this exact fix ("the non-functional footer 'Cities' column was removed from `Layout.astro`"), but a second, still-open bullet about the same dead `?city=` links remains at the end of the section. A `src/` grep for `city=`/`Cities` confirms no such links exist — the open bullet is a stale leftover that should simply be deleted.
  - Evidence: `docs/audits/notes/2026-07-14-data-correctness.md`, "Known Issues Regression Check" → "Mismatches found" section.

## Low

### UI/Responsive

- **Subtle horizontal overflow at 375px on 6 routes with no visually obvious break.** `/` (homepage), `/devotional/ashtakam/`, `/devotional/mantra/`, `/devotional/namavali/`, `/devotional/stotram/`, and `/panchang/malayalam/` all flag `overflow: true` at mobile only (tablet/desktop clean), with rendered content only slightly wider than the 375px viewport. No single cut-off/broken element is visible in any of the 6 screenshots, so this is likely a small margin/padding overshoot on a card or grid item (e.g. missing `min-width: 0` on a flex/grid child) rather than a dramatic layout failure — worth a source-level check but low urgency. (The homepage's overflow flag is unrelated to its `brokenLinks` flag — see the Appendix note on the latter being a crawler false positive — and shares the same low-confidence "no obvious visual break" pattern as the other 5 routes.)
  - Evidence: `scripts/audit/output/screenshots/root/mobile.png`, `devotional_ashtakam/mobile.png`, `devotional_mantra/mobile.png`, `devotional_namavali/mobile.png`, `devotional_stotram/mobile.png`, `panchang_malayalam/mobile.png`; crawl JSON `overflow: true` (mobile only) for all 6 routes.

### Content Quality/SEO

- **4 regional Panchang pages are reachable via nav but not searchable.** `/panchang/tamil`, `/panchang/malayalam`, `/panchang/bengali`, and `/panchang/nepali` each have dedicated desktop-dropdown and mobile-drawer links (`Header.astro:124-127` desktop, `280-283` drawer) but are absent from the `searchItems` array — only the `/panchang/regional` hub is searchable (`Header.astro:1158`). A user typing e.g. "Tamil Panchangam" into the site search gets no hit even though the page is one click away in the dropdown. Note the other 7 of 11 regional traditions have no dedicated dropdown/drawer/search entries at all (hub-only by design), so this gap is specific to these 4 having partial-but-incomplete wiring.
  - Evidence: `docs/audits/notes/2026-07-14-data-correctness.md`, "Header Nav Sync" → "Pattern 3".

## Already Tracked in CLAUDE.md

Confirmed via Task 8's regression check to still match their documented CLAUDE.md bullet — no new information, listed here only for completeness per the audit's cross-reference requirement:

- **2025 Narak Chaturdashi date wrong** — matches CLAUDE.md's "2025 Narak Chaturdashi date may be wrong" bullet exactly. Independently reproduced by `node scripts/audit/run-festival-check.mjs`: `[2025] Narak Chaturdashi (2025-10-21) should precede Diwali (2025-10-20) but does not`. Only violation found; no new festival-ordering issues.
- **`janma-kundali.astro` Dasha dates depend on browser timezone** — matches CLAUDE.md's bullet of the same name. Confirmed still present at `src/pages/jyotish/janma-kundali.astro:296` (`new Date(y,m-1,d,hh,mm).getTime()-loc.tz*3600000` instead of `Date.UTC(...)`).
- **`jyotish/shraddha.astro` Pitru Paksha calendar hardcoded to 2026** — matches CLAUDE.md's bullet. Confirmed still present and still labelled in-code (`src/pages/jyotish/shraddha.astro:110-112`, `PP2026` table).
- **Devotional Namavali lists padded with repeated names** — matches CLAUDE.md's bullet. Confirmed still present in `src/lib/devotional/namavali.ts`'s Ganesh list (e.g. गजाननः duplicated at #1 and #20, कृतिः at #9 and #35, and 5 more repeats).

Additionally spot-checked and confirmed genuinely fixed (matching their struck-through CLAUDE.md bullets, no discrepancy): the Yamaganda Kalam table (`src/lib/panchang.ts:337`, `muhurta/rahu-kala.astro:71`), the Gowri Panchangam `GOWRI_DAY` Wed=Sun fix (`src/lib/muhurta.ts:217-225`), and the Header nav sync fixes for Janma Kundali/Rashifal/Prashnavali/Regional Panchang.

Two automated header-nav-sync "mismatches" were investigated and ruled non-issues rather than bugs, so are not listed as findings above: 140 of 144 checker-reported gaps are the intentional devotional item-vs-category-hub split (individual devotional items are in `searchItems` but deliberately excluded from the dropdown/drawer, matching CLAUDE.md's documented "Devotional Library pattern"), and 1 is a checker false positive (`/muhurta`'s desktop trigger-link isn't a `dd-link`, so the automated scan misses it, but it's reachable). See `docs/audits/notes/2026-07-14-data-correctness.md`, "Header Nav Sync", for the full breakdown.

## Appendix: Crawl Summary

- Routes checked: 391
- Routes flagged: 13 (`/`, `/calendar/`, `/devotional/ashtakam/`, `/devotional/mantra/`, `/devotional/namavali/`, `/devotional/stotram/`, `/devotional/sundarkand/`, `/kundali/`, `/muhurta/griha-pravesh/`, `/muhurta/shubha-dates/`, `/muhurta/vivah/`, `/panchang/malayalam/`, `/rashifal/`) — of these, 3 are crawler-methodology artifacts rather than confirmed defects:
  - `/kundali/` and `/devotional/sundarkand/` are not real bugs: both are pure 301 redirects (`Astro.redirect(...)` to `/jyotish/kundali` and `/devotional/sundarkand/sundarkand` respectively) whose mid-navigation state trips the crawler's Playwright capture (`page.content: Unable to retrieve content because the page is navigating and changing the content`); both redirect targets were reviewed directly and render cleanly (`flagged: false`).
  - `/rashifal/`'s `brokenLinks` flag (`/rashifal/${n}`) is a false positive, not a real broken link, and the homepage's identical-shaped `brokenLinks` flag (`/rashifal/${n[r]`) is likewise a false positive (the homepage remains genuinely flagged for a separate reason — its mobile `overflow`, see Low finding above). The crawler's link checker regex-scans the full raw HTML string, including inline `<script>` tag text content, and matched JS source rather than a real anchor: inspecting the built output directly (`dist/index.html`, `dist/rashifal/index.html`) shows the string lives inside the minified "Find Rashi by Name" client-side tool's `innerHTML` template literal (e.g. `` e.innerHTML=`...<a href="/rashifal/${n[r]??r.toLowerCase()}">...` `` ), not a static page link. Every real `<a href="/rashifal/...">` element on both pages was checked directly against the built HTML and resolves to a correct slug (`mesha`, `vrishabha`, `mithuna`, ... `meena`) — no rashi-card link is actually broken. This was originally reported as a Critical "Broken Links" finding in an earlier draft of this report; downgraded to this methodology note after build-output verification found no real anchor is affected, and is the same class of crawler artifact as the `/kundali/`/`/devotional/sundarkand/` cases above (automated check misreads page state/markup it wasn't designed to parse). The visually-observed `/rashifal/` "missing cards" issue (High, UI/Responsive, above) is a separate, independently-sourced finding from the visual review pass, not related to this false positive.
- No routes were flagged for `consoleErrors`, `failedRequests`, `missingAlt`, `brokenImages`, or `duplicateIds` — the only flagged fields across all 391 routes were `brokenLinks` (2 routes, both false positives per above), `overflow` (10 mobile-breakpoint entries across 10 routes), and crawl-timing `error` (2 routes, both non-issues per above).
- Raw data: `scripts/audit/output/crawl-results.json` (not committed — regenerate via `npm run audit:crawl`)
