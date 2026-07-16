# Design: Full-Site Audit Fix Pass

**Date:** 2026-07-16
**Status:** Approved, pending spec review

## Motivation

`docs/audits/2026-07-14-full-site-audit.md` (391 pages crawled, plus manual visual and data/content passes) produced 7 new findings (High/Medium/Low) and re-confirmed 4 previously-known CLAUDE.md issues as still open. This project clears all 11 concrete fixes plus one research-only item, so the audit can be closed out.

Two findings are explicitly **not** confirmed bugs in the report itself and are scoped accordingly below rather than blindly "fixed":
- The Panchang boundary-time drift (item 12) is called out as "a lead requiring a third-source cross-check, not an assigned fix."
- The `/rashifal/` missing-cards finding (item 3) may be a scroll-fade-in animation caught mid-transition by the screenshot tool rather than a real defect.

## Scope

Executed sequentially, one commit per item, directly (no subagent fan-out) to keep this efficient:

1. Muhurta location-dropdown cutoff at 375px (3 pages)
2. `/calendar/` mobile layout broken
3. `/rashifal/` missing cards — verify live first
4. Jyotish label/value glued together (3 pages)
5. 6 routes with subtle 375px overflow
6. 2025 Narak Chaturdashi date wrong
7. janma-kundali.astro Dasha timezone bug
8. shraddha.astro PP2026 hardcode — full per-year generalization
9. Devotional Namavali padded duplicates (5 lists)
10. CLAUDE.md stale bullets (3 items)
11. 4 regional Panchang pages missing from `searchItems`
12. Panchang boundary-time drift — research only

All items are independent of each other except that item 10 (CLAUDE.md edits) should be done last since it may need to reference commits created by items 6-9.

## 1. Muhurta location-dropdown cutoff at 375px

**Files:** `src/pages/muhurta/griha-pravesh.astro`, `shubha-dates.astro`, `vivah.astro`.

All three share a 3-column date-range finder layout where the Location selector is pushed past the right edge of the 375px viewport (`scripts/audit/output/screenshots/muhurta_*/mobile.png`, crawl JSON `overflow: true` mobile-only). Find the shared grid/flex container and add a responsive breakpoint so the finder stacks to 1 column (or wraps) below `sm`, matching the pattern likely already used elsewhere in the site's mobile-responsive finder UIs. Since the layout is duplicated across all 3 files (per CLAUDE.md's inline-duplication gotcha), fix all 3 rather than assuming one covers the others.

## 2. `/calendar/` mobile layout broken

The entire page (header, month grid, footer) renders confined to the left ~55% of the 375px viewport, leaving a large blank void — a failure to adapt to mobile width at all, not a minor overflow (`scripts/audit/output/screenshots/calendar/mobile.png`). Locate the calendar page/layout file and find the container with a fixed or non-responsive width (likely a hardcoded `px` width or a grid-template-columns that doesn't collapse at mobile breakpoints) and correct it to use responsive Tailwind utilities.

## 3. `/rashifal/` missing cards

Report says only 6-7 of 12 rashi cards render at both breakpoints, possibly an `IntersectionObserver` fade-in caught mid-transition by the screenshot tool. **Verify live first**: start the dev server, load `/rashifal/` in-browser, slow-scroll through the full page at both 375px and 1440px. Only touch `RashifalFeed.astro`'s reveal-animation logic if cards are confirmed genuinely missing/stuck, not just slow to animate in.

## 4. Jyotish label/value glued together

**Files:** `src/pages/jyotish/lagna.astro` ("Lagna Details" card), `nakshatra.astro` ("Attributes" card), `rashi.astro` ("Rashi Details" card).

Label text runs directly into its value with no separator (`scripts/audit/output/screenshots/jyotish_*/desktop.png`). Likely a shared duplicated inline-markup pattern missing a space/margin between label and value spans. Fix in all 3 files.

## 5. 6 routes with subtle 375px overflow

**Routes:** `/`, `/devotional/ashtakam/`, `/devotional/mantra/`, `/devotional/namavali/`, `/devotional/stotram/`, `/panchang/malayalam/`.

No single visibly-broken element in any screenshot — likely a small margin/padding overshoot (e.g. missing `min-width: 0` on a flex/grid child). Since 4 of the 6 are devotional index pages, check `DevotionalIndexGrid.astro` first — a single shared-component fix may resolve those 4 at once. Homepage and `panchang/malayalam` (or its shared `[region].astro` template) need separate checks. Low urgency; source-level check with a viewport-width test, not a redesign.

## 6. 2025 Narak Chaturdashi date wrong

**File:** `src/lib/festivals.ts`.

Currently dated `2025-10-21`, which falls *after* both Dhanteras and Diwali (`2025-10-20`) — Narak Chaturdashi traditionally falls the day *before* Diwali. `curl` drikpanchang.com's 2025 Hindu calendar (per CLAUDE.md's verbatim-sourcing method — not `WebFetch`, which cannot return exact dates reliably here either) to find the correct date, then update. Re-run `node scripts/audit/run-festival-check.mjs` afterward to confirm the ordering violation is gone.

## 7. janma-kundali.astro Dasha timezone bug

**File:** `src/pages/jyotish/janma-kundali.astro`, ~line 296.

Replace `new Date(y,m-1,d,hh,mm).getTime() - loc.tz*3600000` (which mixes the visitor's local browser timezone with a manual offset subtraction) with `Date.UTC(y, m-1, d, hh, mm)` plus the same offset logic applied consistently in UTC space, so Dasha dates no longer depend on the visitor's browser timezone.

## 8. shraddha.astro PP2026 hardcode — full generalization

**File:** `src/pages/jyotish/shraddha.astro`, ~lines 110-112 (`PP2026` table).

Per your direction, attempt full generalization rather than leaving the year-hardcoded table in place. The death-tithi calculation itself is already real and year-agnostic; only the "which calendar date does this tithi fall on" mapping is hardcoded. Implement a real per-year search: for the given year, forward-search for the Amavasya bounding the Pitru Paksha fortnight (the same class of fix already applied to `panchang.ts`'s `amantaIdx` for the amanta-month-lag bug — reuse that forward-search approach rather than re-deriving a new method, to avoid repeating that bug's failure mode) and map each of the 15 Shraddha tithis to its calendar date from there, replacing the static table with the computed one. Keep 2026 as a regression check: computed output for 2026 must match the existing hardcoded table exactly.

## 9. Devotional Namavali padded duplicates

**File:** `src/lib/devotional/namavali.ts`.

Ganesh, Durga, Lakshmi, Saraswati, and Shani lists have repeated names padding out the 108-count (e.g. Ganesh: गजाननः at #1/#20, कृतिः at #9/#35, +5 more repeats). Source genuine distinct replacement names from drikpanchang.com's Ashtottara Shatanamavali pages for each deity, same method as the earlier Surya/Hanuman fix (`curl` + tag-stripping, not `WebFetch`). Verify each list programmatically afterward: exactly 108 entries, all unique.

## 10. CLAUDE.md stale bullets

Do this last, after items 6-9 are committed (may want to cite their commit hashes).

1. Strike through the "`getHinduCalendarInfo()` amanta-month label lags" bullet — already fixed 2026-07-07 by commit `9a69524`.
2. Strike through the "`GOWRI_NIGHT` Wed=Sun copy-paste bug" bullet — already fixed 2026-07-07 by commit `c2f2f2d`.
3. Delete the duplicate open "footer Cities dead-link" bullet at the end of the Known Issues section (a struck-through bullet documenting this same fix already exists earlier in the section; confirm via `grep` for `city=`/`Cities` in `src/` that no dead links remain before deleting).

Also update the "2025 Narak Chaturdashi", "janma-kundali timezone", "shraddha PP2026 hardcode", and "Namavali padding" bullets to reflect the fixes from items 6-9 (strike through or annotate as resolved with commit refs).

## 11. 4 regional Panchang pages missing from `searchItems`

**File:** `src/components/Header.astro`.

`/panchang/tamil`, `/panchang/malayalam`, `/panchang/bengali`, `/panchang/nepali` each have desktop-dropdown (`Header.astro:124-127`) and mobile-drawer (`:280-283`) entries but are absent from the `searchItems` array (only `/panchang/regional` is searchable, `:1158`). Add all 4 to `searchItems`, matching the 3-way-sync convention documented in CLAUDE.md.

## 12. Panchang boundary-time drift — research only

Tithi/Yoga/Karana/Nakshatra end times run 45min-2.5hr earlier on PanchangPath than drikpanchang.com (spot-checked 2026-07-14, New Delhi; names all matched, so this is a boundary-precision gap not a misidentification). Per your direction: **investigate, do not change formulas** unless the investigation pins down a concrete, confirmed error.

Approach: cross-check the same date/location's Tithi/Nakshatra/Yoga/Karana boundary times and sunrise/sunset against a third independent source (e.g. prokerala.com or mypanchang.com) beyond drikpanchang.com, via `curl`. If the third source agrees with drikpanchang.com and disagrees with PanchangPath by a similar margin, that's evidence of a real precision bug — but per your instruction, no `panchang.ts`/`index.astro` changes get made this pass regardless; the outcome is documented (in the audit report's follow-up notes) for a future dedicated fix.

## Testing / verification plan

- **Items 1, 2, 5** (responsive/overflow): `astro dev --background`, check each route at 375px/768px/1440px in-browser, confirm the specific defect is resolved with no new regressions at other breakpoints.
- **Item 3**: live slow-scroll verification before any code change; only verify-and-fix if genuinely broken.
- **Item 4**: visual check of the 3 cards in-browser; no calculation logic touched.
- **Item 6**: re-run `node scripts/audit/run-festival-check.mjs`, confirm the Narak Chaturdashi/Diwali ordering violation is gone.
- **Item 7**: reason through / test that computed Dasha dates are identical regardless of simulated browser timezone.
- **Item 8** (highest risk): compute Pitru Paksha dates for at least 2 other years (e.g. 2025, 2027) and spot-check one against drikpanchang.com; confirm 2026 output still matches the table it replaces exactly (regression check).
- **Item 9**: programmatic uniqueness + count check (108 unique entries) per affected list.
- **Item 10**: re-read CLAUDE.md after editing to confirm bullets are correctly struck through/removed and don't contradict other sections.
- **Item 11**: grep `Header.astro` post-edit to confirm all 3 locations now agree for these 4 regions.
- **Item 12**: no pass/fail test — output is a documented research conclusion.
- **Overall gate**: `npm run build` must succeed after all items (the project's real correctness gate; `astro check`'s ~900 errors are known pre-existing noise).

## Non-goals

- No fixing of the Panchang boundary-time drift itself this pass (research only, per scope above).
- No attempt to "fix" `/rashifal/` if live verification shows it's just a slow animation, not a bug.
- No unrelated refactoring of the shared components touched along the way (e.g. `DevotionalIndexGrid.astro`, `Header.astro`) beyond what each specific fix requires.
