# PanchangPath Site Audit — 2026-07-06

## Summary

_filled in Task 6_

## Part 1: Navigation & Dead Links

### Dead-end nav links pointing to homepage instead of real pages (Planets menu)

- **Location:** src/components/Header.astro: desktop (lines 181-186), mobile drawer (lines 351-354)
- **Problem:** The entire "Planets" dropdown menu contains four links ("Planetary Positions", "Rahu & Ketu", "Shani (Saturn)", "Gochara") all with `href="/"`. These labels imply specific planetary feature pages, but none exist under src/pages. No dedicated pages for planetary positions, tracking, or forecasts have been built.
- **Fix prompt:** "Either build dedicated feature pages (e.g., `src/pages/planets/planetary-positions.astro`, `src/pages/planets/rahu-ketu.astro`, etc.) that display real planetary data using the site's astronomical calculations, and update Header.astro's Planets dropdown (desktop, mobile drawer, and searchItems) to point to them — or remove the entire Planets menu and its four items if this feature set isn't planned. Ensure any changes are reflected in all three locations: desktop dropdown, mobile drawer, and searchItems array (starting at line 1136)."

### Dead-end nav links pointing to homepage instead of real pages (Gallery menu)

- **Location:** src/components/Header.astro: desktop (lines 207-212), mobile drawer (lines 377-383)
- **Problem:** The "Gallery" dropdown menu contains three links ("God Images", "Festival Photos", "Wallpapers") all with `href="/"`. No gallery/image feature pages exist under src/pages. This entire menu section is unimplemented.
- **Fix prompt:** "Either build gallery feature pages (e.g., `src/pages/gallery/deity-images.astro`, `src/pages/gallery/festival-photos.astro`, etc.) that display curated image collections, and update Header.astro's Gallery dropdown (desktop, mobile drawer, and searchItems) to point to them — or remove the entire Gallery menu section if this feature isn't planned."

### Dead-end nav links in Others menu pointing to homepage

- **Location:** src/components/Header.astro: desktop (lines 215-221), mobile drawer (lines 386-394)
- **Problem:** Four items in the "Others" dropdown have `href="/"`: "Baby Names" (line 218), "Compatibility" (line 219), "Dream Meaning" (line 220), and "About" (line 221). No corresponding pages exist. "Baby Names" and "Compatibility" are particularly misleading because real pages for these features DO exist elsewhere (`/jyotish/baby-names` and `/jyotish/horoscope-match`), but these nav items point to the wrong place.
- **Fix prompt:** "For 'Baby Names' and 'Compatibility': update Header.astro's Others menu items (desktop, mobile drawer, and searchItems) to point to their real pages: `/jyotish/baby-names` and `/jyotish/horoscope-match` respectively. For 'Dream Meaning' and 'About': either build `src/pages/dream-meaning.astro` and `src/pages/about.astro` pages and wire them in, or remove these nav items entirely. Ensure all changes appear in all three locations: desktop dropdown, mobile drawer, and searchItems."

### Dead-end link: "Sunrise & Sunset" in Panchang menu

- **Location:** src/components/Header.astro: desktop (line 112), mobile drawer (line 268), and searchItems array (line 1157)
- **Problem:** The "Sunrise & Sunset" link in the Panchang dropdown has `href="/"`. No dedicated sunrise/sunset page exists. However, per the site's architecture (src/lib/panchang.ts), the astronomical calculations needed to display daily sunrise/sunset times per location already exist.
- **Fix prompt:** "Either build `src/pages/sunrise-sunset.astro` showing daily sunrise/sunset times using the site's location system and astronomical calculation library (src/lib/panchang.ts provides Tithi and astronomical methods), and update Header.astro's 'Sunrise & Sunset' link (desktop, mobile drawer, and searchItems at line 1157) to point to it — or remove the nav item if this feature isn't planned."

### Dead-end link: "Moonrise & Moonset" in Panchang menu

- **Location:** src/components/Header.astro: desktop (line 113), mobile drawer (line 269)
- **Problem:** Similar to "Sunrise & Sunset", the "Moonrise & Moonset" link in the Panchang dropdown has `href="/"`. No dedicated moonrise/moonset page exists.
- **Fix prompt:** "Either build `src/pages/moonrise-moonset.astro` showing daily moonrise/moonset times using lunar calculations (src/lib/panchang.ts has lunar timing methods), and update Header.astro's 'Moonrise & Moonset' link (desktop, mobile drawer) to point to it — or remove the nav item if this feature isn't planned. Update searchItems array if adding this page."

### Mislabeled link: "Rahu Kalam" in Panchang menu points to homepage

- **Location:** src/components/Header.astro: desktop (line 114), mobile drawer (line 270)
- **Problem:** The "Rahu Kalam" link in the Panchang dropdown has `href="/"`, but the dedicated page `src/pages/muhurta/rahu-kala.astro` already exists. This should point to `/muhurta/rahu-kala`, not `/`.
- **Fix prompt:** "Change Header.astro line 114 (desktop) and line 270 (mobile drawer) from `href=\"/\"` to `href=\"/muhurta/rahu-kala\"` for the 'Rahu Kalam' link. Verify the searchItems array (around line 1143) also has the correct link."

### Dead-end footer links: city query parameters not implemented

- **Location:** src/layouts/Layout.astro: lines 79-82 (footer "Cities" section)
- **Problem:** The footer contains four links using query parameters (`/?city=New+Delhi`, `/?city=Mumbai`, `/?city=Bengaluru`, `/?city=Varanasi`). No code on the homepage or anywhere else reads a `city` query parameter, so these links don't work — they just load the homepage without any city-specific behavior.
- **Fix prompt:** "Either implement city query parameter handling in src/pages/index.astro to detect the `?city=` param and update the location selector (triggering the same geolocation/location-change flow as the header's location picker), or replace these footer links with static routes to dedicated city pages (e.g., `/cities/delhi`, `/cities/mumbai`). Verify that clickthrough works end-to-end and updates the displayed panchang data."

### Sync gap (less severe than a true orphan): /jyotish/janma-kundali missing from Header's direct dropdown/drawer/searchItems entries

- **Location:** src/pages/jyotish/janma-kundali.astro exists; linked from src/pages/jyotish.astro:9 (one of the 16 calculator cards on the Jyotish hub page); not present in Header.astro's desktop dropdown (lines 167-177), mobile drawer Jyotish section (lines 332-343), or searchItems array (lines 1136-1331)
- **Problem:** The page `src/pages/jyotish/janma-kundali.astro` is a real calculator tool and **is** discoverable: the Jyotish hub page (`/jyotish`) links it directly (`jyotish.astro:9`), and that hub is itself reachable from Header's Jyotish dropdown ("✨ All Calculators", line 177), mobile drawer, and searchItems. So this is not a true orphan — but it is missing from Header's own direct Jyotish dropdown/drawer/searchItems entries, unlike the other 8-9 calculators that are listed there directly, meaning it takes two clicks (Header → Jyotish hub → Janma Kundali) instead of one. (Note: /jyotish/lagna.astro exists as a separate page for "Janma Lagna / Ascendant".)
- **Fix prompt:** "Add 'Janma Kundali' to the Jyotish calculator section in Header.astro so it's a one-click destination like the other calculators: (1) add `<a href=\"/jyotish/janma-kundali\" class=\"dd-link\">Janma Kundali</a>` to the desktop dropdown (around line 175), (2) add the same link to the mobile drawer Jyotish section (around line 341), and (3) add `{ label: \"Janma Kundali\", url: \"/jyotish/janma-kundali\" }` to the searchItems array (around line 1169). Verify all three locations are updated together per the CLAUDE.md sync convention."

### Sync gap (less severe than a true orphan): /events (Planetary Events Feed) missing from Header nav entirely

- **Location:** src/pages/events/index.astro exists; reachable via a "View All" link in the homepage's Planetary Events Feed (`src/components/PlanetaryEventsFeed.astro:113`, rendered by `src/pages/index.astro`); absent from Header.astro (desktop dropdown, mobile drawer, searchItems) and Layout.astro footer
- **Problem:** Per CLAUDE.md feature list, a "Planetary Events Feed" (`src/pages/events/index.astro`) exists showing an "upcoming planetary events timeline list". Users **can** reach it in one click from the homepage — `PlanetaryEventsFeed.astro:113` renders `<a href="/events" class="pef-view-all">View all upcoming planetary events</a>` directly beneath the feed — so it is not unreachable from the main site as previously stated. It is, however, completely absent from Header's global nav (desktop dropdown, mobile drawer, searchItems), so it's only discoverable from the homepage feed itself, not from any other page on the site.
- **Fix prompt:** "Add a 'Planetary Events' or 'Upcoming Events' link to Header.astro. This could go in a new menu or as part of an existing section (e.g., under 'Planets' or 'Today's Panchang'). Once added, update all three locations: (1) desktop dropdown, (2) mobile drawer, and (3) searchItems array. Then verify the page loads and displays real event data correctly."

### Three-location sync gap: Rashifal missing from desktop dropdown AND searchItems (only in mobile drawer)

- **Location:** src/pages/rashifal/index.astro exists; appears only in mobile drawer (Header.astro:342); zero occurrences in desktop dropdown or the searchItems array (lines 1136-1331)
- **Problem:** The Rashifal (Daily Horoscope) page is linked only in the mobile drawer — it is missing from both the desktop dropdown menu **and** the searchItems array (confirmed via grep: no "rashifal" match anywhere in lines 1136-1331), so desktop users have no menu path to it and it won't surface in site search either. Per CLAUDE.md: "dropdown menus, mobile drawer, and searchItems array must all three be updated together whenever a new page/tool is added."
- **Fix prompt:** "Add 'Rashifal' or 'Daily Horoscope' to the desktop dropdown, likely under the Jyotish menu (around line 167-178), using `<a href=\"/rashifal\" class=\"dd-link\">Rashifal (Horoscope)</a>`, AND add `{ label: \"Rashifal\", url: \"/rashifal\" }` (plus a 'Daily Horoscope' alias entry) to the searchItems array (around line 1169). Verify it appears in all three locations: desktop dropdown, mobile drawer (already present at line 342), and searchItems array."

### Three-location sync gap: Prashnavali missing from desktop dropdown AND searchItems (only in mobile drawer)

- **Location:** src/pages/prashnavali.astro exists; appears only in mobile drawer (Header.astro:343); zero occurrences in desktop dropdown or the searchItems array (lines 1136-1331)
- **Problem:** The Prashnavali (Oracle) page is linked only in the mobile drawer — it is missing from both the desktop dropdown menu **and** the searchItems array (confirmed via grep: no "prashnavali" match anywhere in lines 1136-1331). Per CLAUDE.md sync convention, this should be present in all three locations.
- **Fix prompt:** "Add 'Prashnavali Oracle' to the desktop dropdown, likely under the Jyotish menu near Rashifal (around line 178), using `<a href=\"/prashnavali\" class=\"dd-link\">Prashnavali Oracle</a>`, AND add `{ label: \"Prashnavali\", url: \"/prashnavali\" }` to the searchItems array (around line 1176). Verify it appears in all three locations: desktop dropdown, mobile drawer (already present at line 343), and searchItems array."

### Three-location sync gap: Regional Panchang missing from searchItems

- **Location:** src/components/Header.astro: desktop dropdown (line 116), mobile drawer (line 271), missing from searchItems array (lines 1136-1331)
- **Problem:** The "🌐 Regional Panchang" link (`/panchang/regional`) appears in both the desktop Panchang dropdown and the mobile drawer, but has zero occurrences in the searchItems array (confirmed via grep), so it won't surface in site search. Per CLAUDE.md sync convention, all three locations must be kept in sync.
- **Fix prompt:** "Add `{ label: \"Regional Panchang\", url: \"/panchang/regional\" }` to the searchItems array in Header.astro (around line 1157, near the other Panchang-menu entries). Verify it now appears in all three locations: desktop dropdown (line 116), mobile drawer (line 271), and searchItems array."

### Three-location sync gap: Jyotish sub-pages in searchItems but missing from desktop dropdown and drawer

- **Location:** src/components/Header.astro searchItems array contains these pages but desktop dropdown (lines 165-177) only shows 9 items, and some are missing from drawer (lines 332-343)
- **Problem:** The following Jyotish calculator pages are indexed in searchItems (for search discovery) but are not presented in the desktop dropdown or mobile drawer menus:
  - `/jyotish/rudraksha` (Rudraksha Calculator) - searchItems line 1163
  - `/jyotish/sunsign` (Sun Sign Calculator) - searchItems line 1166
  - `/jyotish/pancha-pakshi` (Pancha Pakshi) - searchItems line 1176
  - `/jyotish/shraddha` (Shraddha Tithi) - searchItems line 1174
  - `/jyotish/sahasra-chandrodaya` (Sahasra Chandrodaya) - searchItems line 1175
  - `/jyotish/lagna` (Janma Lagna / Ascendant) - searchItems line 1169 (labeled differently)
  
  This violates the sync convention: important feature pages should be discoverable from main navigation, not just search.
- **Fix prompt:** "Add these missing Jyotish pages to the desktop dropdown Jyotish menu (lines 165-177) and mobile drawer Jyotish section (lines 332-343). The desktop dropdown should expand to show all 16 Jyotish calculators (or split into multiple columns with a 'see all' link if space is tight). Examples: `<a href=\"/jyotish/rudraksha\" class=\"dd-link\">Rudraksha Calculator</a>`, `<a href=\"/jyotish/sunsign\" class=\"dd-link\">Sun Sign Calculator</a>`, etc. Update all three locations (dropdown, drawer, searchItems) together."

### CLAUDE.md Known Issues Verification

**Status: All previously documented issues remain present** (as of commit `19b4c5b` which claimed to fix dead nav links).

The following issues documented in CLAUDE.md under "Known Issues" are still present:

- "Baby Names" and "Compatibility" under "Others" menu still point to `href="/"` instead of `/jyotish/baby-names` and `/jyotish/horoscope-match` ✓ confirmed
- Several placeholder `href="/"` nav items (Sunrise & Sunset, Planetary Positions, Gallery items) still present ✓ confirmed
- Footer "Cities" links (`/?city=...`) remain non-functional ✓ confirmed

**Conclusion:** Commit `19b4c5b` appears to have fixed some dead links (e.g., Rahu Kalam link was likely corrected for desktop dropdown but the Panchang menu still has it pointing to `/`), but the major nav dead-ends and sync gaps remain outstanding and appear to be intentionally stubbed-out placeholder menu sections rather than recent regressions.

## Part 2: Accuracy vs drikpanchang.com

### Core Panchang

**Method:** A research subagent ran `src/lib/panchang.ts`'s actual `calculatePanchang()` via Node (`--experimental-strip-types`) for 9 date/city combinations — 2026-07-06, 2026-10-20, and 2027-01-14, each for New Delhi, Mumbai, and Chennai — and cross-checked the output against drikpanchang.com's published day-panchang pages for the same date/city (geoname-ids: Delhi 1273294, Mumbai 1275339, Chennai 1264527). It then wrote additional debug scripts to isolate the root cause of each discrepancy at the formula level, rather than guessing.

Two confirmed, systematic bugs were found. Neither is in CLAUDE.md's existing "Known Issues" list — they are new findings.

#### Moon longitude bug corrupts Tithi/Nakshatra/Yoga/Karana

- **Location:** `src/lib/panchang.ts:78`, function `moonLongitude()`: `return norm360(L + dL / 1000);`
- **Problem:** The periodic correction sum `dL` (the ~25 `Math.sin(...)` terms above it, e.g. `6.288774 * Math.sin(Mpr)`) is the standard Meeus low-precision lunar-longitude series and is already in degrees. Dividing it by 1000 shrinks a correction that can reach ~±6-7° down to ~±0.006°, collapsing the Moon's computed longitude to essentially its mean longitude — off by degrees from the real position. Verified for 2026-10-20: raw `dL = -4.31°`, but the code applies only `-0.0043°`. Confirmed by removing `/1000` and recomputing: with the fix, Tithi/Nakshatra/Yoga/Karana exactly matched drikpanchang.com for all 3 dates. Concretely, for 2026-07-06 New Delhi: the fixed code gives Shashthi/Purva Bhadrapada/Saubhagya/Vanija — matching Drik exactly — while the current buggy code gives Saptami/Uttara Bhadrapada/Shobhana/Vishti, all four wrong. The same pattern held for 2026-10-20 (Tithi & Karana wrong; Nakshatra/Yoga name happened to survive but end-times were off by ~9 hours) and 2027-01-14 (Tithi, Yoga, Karana wrong). Since Tithi/Nakshatra/Yoga/Karana don't depend on lat/lng (only date + timezone), the wrong values are identical across all 3 cities per date — this is a pure formula bug, not per-city noise.
- **Fix prompt:** "In `src/lib/panchang.ts`, function `moonLongitude()` (~line 78), change `return norm360(L + dL / 1000);` to `return norm360(L + dL);` — the `dL` sum is already in degrees per the Meeus low-precision lunar formula and should not be scaled. After the fix, verify Tithi/Nakshatra/Yoga/Karana for 2026-07-06, 2026-10-20, and 2027-01-14 New Delhi against drikpanchang.com day-panchang pages to confirm the names now match (expect Shashthi/Purva Bhadrapada/Saubhagya/Vanija, Navami/Shravana/Shula/Kaulava, and Shashthi/Uttara Bhadrapada/Parigha/Taitila respectively). Note: the identical `dL / 1000` bug also exists in `src/lib/kundali.ts` (`moonLon()`, ~line 150) and is duplicated inline in at least 25 files under `src/` (grep for `dL / 1000`) per this project's known copy-paste-duplication pattern for client-side scripts — out of scope for this task, but flag it for the Kundali/Jyotish/Muhurta accuracy audit tasks since it likely corrupts Moon-based Rashi/Nakshatra placements everywhere it's duplicated."

#### Equation of Time omitted from sunrise/sunset (cascades into Rahu Kalam, Yamaganda, etc.)

- **Location:** `src/lib/panchang.ts:100-116`, function `sunriseUTC()`, specifically `const noon = 12 - lng / 15;` (line 114)
- **Problem:** This uses only mean solar time, omitting the Equation of Time (which varies seasonally, roughly -14 to +16 minutes). The sibling `solarNoonUTC()` (lines 88-97) computes an `eot` term but it is never applied in `sunriseUTC()`. Observed PanchangPath-vs-Drik sunrise/sunset/Rahu Kalam gaps: ~5 minutes (2026-07-06, all 3 cities), ~15-16 minutes (2026-10-20, all 3 cities — e.g. Delhi Rahu Kalam PanchangPath 3:12-4:37 PM vs Drik 2:56-4:21 PM), and ~9 minutes (2027-01-14, all 3 cities — e.g. Delhi Rahu Kalam PanchangPath 1:40-2:59 PM vs Drik 1:49-3:08 PM). Independently computing the standard Equation of Time (B=360/365·(N-81)°; EoT=9.87 sin 2B − 7.53 cos B − 1.5 sin B) for these dates gives -4.35, +15.7, and -9.0 minutes — matching the observed gaps almost exactly in both sign and magnitude, confirming the missing-EoT diagnosis rather than a coordinate/rounding issue. The Oct/Jan gaps clearly exceed the "few minutes" noise threshold and appear across all 3 cities per date, i.e. systematic.
- **Fix prompt:** "In `src/lib/panchang.ts`, function `sunriseUTC()` (~lines 100-116), the local solar noon (`const noon = 12 - lng / 15;`) omits the Equation of Time. Compute EoT inside this function (or refactor to reuse `solarNoonUTC()`'s `eot` calc) and apply it: `const noon = 12 - lng / 15 - eot / 60;`, matching the pattern in `solarNoonUTC()`. While there, double-check `solarNoonUTC()`'s own `eot` formula (lines 93-95) — it contains a dead no-op term `+ 0.9999 * (280.46646 - L0) * 0` (always 0, likely leftover/unfinished logic); validate the whole formula against a reference EoT formula (e.g. B=360/365·(N-81)°; EoT=9.87 sin 2B − 7.53 cos B − 1.5 sin B minutes) before trusting it. This affects sunrise, sunset, Rahu Kalam, Gulika Kalam, Yamaganda, Abhijit Muhurta, day-duration, and the moonrise estimate for every page calling `calculatePanchang()`."

#### CLAUDE.md Known Issues cross-check

- The CLAUDE.md-documented "truncated 2-term Lahiri ayanamsha" issue does **not** affect `panchang.ts` — it already uses the full 3-term formula (confirmed at line 84: `23.85 + 1.3612 * T - 0.000136 * T * T`).
- The CLAUDE.md-documented "truncated Moon longitude" issue for `gemstone.astro`/`rudraksha.astro` (missing 9 of 15 correction terms) is a **different, more severe in a different way** bug than the `/1000` division bug found here in `panchang.ts` (all terms present, but scaled down ~1000x) — this is a newly-found issue, not previously documented for `panchang.ts`.
- The Yamaganda-table and Gowri-Panchangam known issues were not re-tested here, as they fall outside the 5 Panchang values (Tithi/Nakshatra/Yoga/Karana/Rahu Kalam) requested for this audit subsection.

### Kundali / Jyotish Calculators

**Method:** A research subagent computed a reference chart using `src/lib/kundali.ts`'s own `calculateKundali()` via a standalone Node script (`--experimental-strip-types`) for the fixed test subject (15 Aug 1990, 07:30 IST, New Delhi, 28.6139N/77.2090E), then read the inline `<script>` orbital-math copy in all 16 files under `src/pages/jyotish/*.astro` (`kundali.astro`, `janma-kundali.astro`, `gemstone.astro`, `rudraksha.astro`, `rashi.astro`, `sunsign.astro`, `nakshatra.astro`, `lagna.astro`, `mangal-dosha.astro`, `kalasarpa.astro`, `sadesati.astro`, `baby-names.astro`, `shraddha.astro`, `sahasra-chandrodaya.astro`, `pancha-pakshi.astro`, `horoscope-match.astro`) plus `src/components/KundaliWidget.astro`, comparing each line-by-line against `kundali.ts`'s canonical formulas. Reference output for the fixed birth data: Ayanamsha 23.7223°, Lagna Simha 19°04', Surya Karka 28°16', Chandra Vrishabha 16°46', Mangal Mesha 27°32', Budha Simha 25°20', Guru Karka 05°40', Shukra Karka 07°45', Shani Dhanu 26°25' (Vakri), Rahu Makara 12°45' (Vakri), Ketu Karka 12°45' — plausible per independent checks (Sun at 28°16' Karka is consistent with Simha Sankranti falling ~17 Aug 1990; Saturn's retrograde status matches its real 1990 station window of ~Jun-Nov). drikpanchang.com's Kundali tool could not be used for direct cross-verification — WebFetch only returns the blank interactive form, not a computed chart for supplied birth data — so this subsection relies on internal cross-file formula comparison plus the plausibility checks above, per the task's documented fallback path.

#### Universal Moon-longitude `/1000` scaling bug — confirmed as the SAME bug flagged in Core Panchang, now traced into kundali.ts and ~25 duplicate files

- **Location:** `src/lib/kundali.ts:150` (`return n360(Lm + dL / 1000);`); identical duplicate in `src/components/KundaliWidget.astro:496` (`return n360(Lm + dL/1000);`); also duplicated inline in 15 of the 16 `src/pages/jyotish/*.astro` files (every file that computes a Moon position: `kundali.astro`, `janma-kundali.astro`, `lagna.astro`, `horoscope-match.astro`, `rashi.astro`, `baby-names.astro`, `shraddha.astro`, `sahasra-chandrodaya.astro`, `kalasarpa.astro`, `sadesati.astro`, `mangal-dosha.astro`, `nakshatra.astro`, `pancha-pakshi.astro`, `gemstone.astro`, `rudraksha.astro` — `sunsign.astro` doesn't compute Moon so is unaffected); a grep for `dL / 1000` / `dL/1000` across `src/` confirms 25 total matching files, consistent with the count already surfaced by the Core Panchang subagent. Verified directly in this task: `kundali.ts:150` and `KundaliWidget.astro:496` both confirmed present via direct file read.
- **Problem:** This is confirmed to be the **same root-cause bug** already found in `src/lib/panchang.ts`'s `moonLongitude()`, not a separate issue — it was copy-pasted verbatim into `kundali.ts` and from there into every inline duplicate. The `dL` correction-term sum (e.g. `6.288774*sin(Mp)` and similar terms) is already expressed in degrees, so dividing by 1000 shrinks the Moon's equation-of-center correction (normally ranging roughly ±6-8°) to near zero. On the fixed test date `dL` happened to be small (0.33°) by coincidence, so the reference chart above is not visibly wrong — but on most dates this corrupts Chandra's rashi/degree by whole degrees, and everything derived from Moon longitude along with it: Chandra Rashi, Nakshatra, Mangal Dosha (Moon-house-dependent), Kalasarpa Yoga, Shani Sadesati (transit-vs-Moon-rashi), and Horoscope Match (Moon-based Guna Milan) are all at risk of wrong results across the site, not just the two pages already flagged in CLAUDE.md.
- **Fix prompt:** "In `src/lib/kundali.ts` line 150, change `return n360(Lm + dL / 1000);` to `return n360(Lm + dL);`. Then grep the codebase for the literal strings `dL / 1000` and `dL/1000` and apply the identical one-character fix (remove `/ 1000`) to every match — this includes `src/lib/panchang.ts` (already logged in the Core Panchang subsection above; fix once, not twice), `src/components/KundaliWidget.astro:496`, and all Moon-computing files under `src/pages/jyotish/*.astro` listed above. Re-run a standalone `kundali.ts` test script for a date where `dL` is large (e.g. a date near lunar apogee/perigee) before/after the fix to confirm Chandra's sign/degree changes meaningfully. This is one systemic bug with ~25+ copies, not a set of independent bugs — fix and verify the canonical `kundali.ts`/`panchang.ts` copies first, then propagate."

#### Truncated 6-term Moon formula is broader than CLAUDE.md's Known Issues currently states — not limited to gemstone/rudraksha

- **Location:** `src/pages/jyotish/kundali.astro`, `janma-kundali.astro`, `lagna.astro`, `horoscope-match.astro`, `rashi.astro`, `baby-names.astro`, `shraddha.astro`, `sahasra-chandrodaya.astro`, `kalasarpa.astro`, `sadesati.astro`, `mangal-dosha.astro`, `nakshatra.astro`, `pancha-pakshi.astro` — plus the already-documented `gemstone.astro` and `rudraksha.astro`. Only `src/components/KundaliWidget.astro`, `src/lib/kundali.ts`, and `src/lib/panchang.ts` carry the full 15-term correction series.
- **Problem:** CLAUDE.md's "Known Issues" section currently states only `gemstone.astro`/`rudraksha.astro` use a truncated 6-of-15-term Moon-longitude formula. This audit found that 15 of the 16 Jyotish calculator pages — including the primary `kundali.astro`/`janma-kundali.astro` birth-chart tools and Nakshatra-sensitive calculators (`nakshatra.astro`, `sahasra-chandrodaya.astro`, `sadesati.astro`, `horoscope-match.astro`) — stop after the 6th correction term (`-0.114332*sin(2F)`), omitting the remaining 9 terms present in `kundali.ts`. This bug currently **masks bug #1 above rather than compounding it**: because both the truncated and full-term versions get divided by 1000, both currently collapse toward the same near-zero (and thus similarly wrong) correction — but if bug #1 is fixed without also fixing this truncation, the 15 truncated pages would end up ~0.3-1° less accurate than `KundaliWidget.astro`/`kundali.ts`, which is enough to flip a Nakshatra pada or Rashi boundary near an edge case (the same class of error already documented for gemstone/rudraksha, just far more widespread than currently logged).
- **Fix prompt:** "Copy the full 15-term `dL` correction sum from `src/lib/kundali.ts` lines 145-149 (the terms from `0.058793*sin(2Dr-2Mpr)` through `0.010034*sin(3Mpr)`) into the `moonLon` function of all 15 files listed above (the already-known `gemstone.astro`/`rudraksha.astro` plus the 13 newly-identified files), replacing their existing 6-term version — and apply the bug #1 fix (`/1000`→no division) to the same function at the same time, since both bugs live in the same few lines. After fixing, update the CLAUDE.md 'Known Issues' bullet about truncated Moon longitude to reflect the true scope (currently names only gemstone.astro/rudraksha.astro) — either broaden its wording or remove it once all 15 pages are fixed to match kundali.ts."

#### Areas checked and confirmed clean

- **Ayanamsha formula:** all 16 Jyotish calculator pages and `KundaliWidget.astro` correctly use the full 3-term Lahiri formula (`23.85 + 1.3612*T - 0.000136*T²`). The CLAUDE.md-documented truncated 2-term variant is confined to `index.astro`/`calendar.astro`/muhurta pages and does not extend into the Jyotish-calculator scope of this audit.
- **Orbital elements (`ORB` table) and Kepler solver:** spot-checked in `kundali.astro` and `KundaliWidget.astro` against `kundali.ts` — element values, `helioXY`, and `solveKepler` are consistent, no drift found.
- **Sun longitude / Rahu mean-node formulas:** consistent across all files checked, no divergence found.

### Muhurta Tools

**Method:** A research subagent wrote a standalone Node script (`--experimental-strip-types`) importing `calculatePanchang()` from `src/lib/panchang.ts` and the timing tables from `src/lib/muhurta.ts`, and ran it across the same 3 dates (2026-07-06, 2026-10-20, 2027-01-14) × 3 cities (New Delhi, Mumbai, Chennai) used elsewhere in this audit, computing Choghadiya, Hora, Rahu Kala, Yamaganda, and Gowri Panchangam for each combination. Results were cross-checked against live drikpanchang.com day-panchang and Gowri Panchangam pages (New Delhi Jul 5–11 2026, Mumbai Oct 20 2026).

#### Yamaganda Kalam uses a wrong slot table

- **Location:** `src/lib/panchang.ts:277` (`YAMAGANDA_SLOTS = [3,5,2,7,4,6,1]`), duplicated at `src/pages/muhurta/rahu-kala.astro:71` (`YAMAG_SLOTS`)
- **Problem:** Confirmed still present (already logged in CLAUDE.md "Known Issues"). Verified via 7 consecutive real drikpanchang.com pages for New Delhi (Jul 5–11, 2026): the correct 0-indexed (Sun→Sat) slot table is `[4,3,2,1,0,6,5]`. The current code's `[3,5,2,7,4,6,1]` only coincides with the correct table on Tue and Fri — the other 5 weekdays are wrong. Monday is the worst case: the current code gives Yamaganda the same slot (5) as Gulika Kalam, so the tool shows two supposedly-distinct inauspicious periods with identical times (e.g. New Delhi 2026-07-06: both computed as 2:05–3:50 PM).
- **Fix prompt:** "In `src/lib/panchang.ts`, replace `const YAMAGANDA_SLOTS = [3, 5, 2, 7, 4, 6, 1];` with `const YAMAGANDA_SLOTS = [4, 3, 2, 1, 0, 6, 5];` (index 0=Sunday…6=Saturday, verified against drikpanchang.com day-panchang pages for New Delhi Jul 5–11 2026). Apply the identical fix to the duplicate `YAMAG_SLOTS` array in `src/pages/muhurta/rahu-kala.astro:71`. Note: `RAHU_SLOTS` and `GULIKA_SLOTS` were checked against the same drikpanchang data during this audit and are already correct — do not touch them."

#### Gowri Panchangam: Wednesday duplicated from Sunday

- **Location:** `src/lib/muhurta.ts:217-235` (`GOWRI_DAY`/`GOWRI_NIGHT`), duplicated at `src/pages/muhurta/panchaka.astro:85` and `:94`
- **Problem:** Confirmed still present (already logged in CLAUDE.md "Known Issues"). `GOWRI_DAY[3]` (Wed) and `GOWRI_NIGHT[3]` are byte-for-byte identical to `GOWRI_DAY[0]`/`GOWRI_NIGHT[0]` (Sun). Verified wrong by pulling real day-time Gowri sequences from drikpanchang.com's Tamil Gowri Panchangam pages for all 7 weekdays (New Delhi, Jul 5–11 2026): Sunday's real sequence differs from Wednesday's. The original table is also wrong for other weekdays beyond the Wed/Sun duplicate (independently verified against live drikpanchang.com data for Sun/Mon/Wed/Thu) — this fix replaces the whole array, not just the duplicated row.
- **Fix prompt:** "Replace `GOWRI_DAY` in `src/lib/muhurta.ts` (and the duplicate in `panchaka.astro:85`) with this verified table (index 0=Sun…6=Sat, mapped from drikpanchang's Amirdha/Uthi/Sugam/Laabam/Dhanam/Rogam/Soram/Visham naming to this codebase's existing Amrutham/Uthamam/Sudham/Labham/Dhanam/Rogam/Charam/Visha naming — the quality tags already in `GOWRI_INFO` line up with this mapping):
```
Sun: [Uthamam, Amrutham, Rogam, Labham, Dhanam, Sudham, Charam, Visha]
Mon: [Amrutham, Visha, Rogam, Labham, Dhanam, Sudham, Charam, Uthamam]
Tue: [Rogam, Labham, Dhanam, Sudham, Charam, Uthamam, Visha, Amrutham]
Wed: [Labham, Dhanam, Sudham, Charam, Visha, Uthamam, Amrutham, Rogam]
Thu: [Dhanam, Sudham, Charam, Uthamam, Amrutham, Visha, Rogam, Labham]
Fri: [Sudham, Charam, Uthamam, Visha, Amrutham, Rogam, Labham, Dhanam]
Sat: [Charam, Uthamam, Visha, Amrutham, Rogam, Labham, Dhanam, Sudham]
```
Apply the same fix to the duplicate in `src/pages/muhurta/panchaka.astro:85`. Note: `GOWRI_NIGHT` has the same Wed=Sun copy-paste bug but its correct values were **not** independently re-derived in this audit (only day-time data was pulled) — a future session must fetch night-time Gowri sequences from drikpanchang for all 7 weekdays before fixing `GOWRI_NIGHT` and `panchaka.astro:94`."

#### Equation-of-Time cascade into all Muhurta timing tables — third manifestation of the already-logged `sunriseUTC()` bug

- **Location:** `src/lib/panchang.ts:100-116` (`sunriseUTC()`), duplicated inline (missing the same Equation-of-Time correction that `solarNoonUTC()` already computes) in `src/pages/muhurta/choghadiya.astro:117`, `hora.astro:94`, `rahu-kala.astro:82`, `abhijit.astro:75`, and `panchaka.astro:131`
- **Problem:** The cascade is confirmed real. Choghadiya, Hora, Rahu Kalam, Gulika Kalam, Yamaganda, and Gowri Panchangam all divide sunrise→sunset into 8 equal parts, so the missing-EoT bug already logged in the Core Panchang subsection above (missing Equation of Time in `sunriseUTC()`, `src/lib/panchang.ts:100-116`) shifts every slot boundary in every one of these Muhurta tools, not just Rahu Kalam. Measured against drikpanchang: New Delhi 2026-07-06 sunrise computed 5:24 AM vs actual 5:29 AM (5 min early → every Choghadiya/Gowri/Rahu Kalam boundary shifts ~5 min); Mumbai 2026-10-20 sunrise computed 6:49 AM vs actual 6:34 AM (15 min **late** — the direction flips seasonally, as expected for a missing-EoT term rather than a fixed offset). `abhijit.astro`'s solar-noon calc shares the same `noon = 12 - lng/15` formula lacking `eot/60`, so its window is affected too.
- **Fix prompt:** "This is the same bug already logged above under Core Panchang (missing Equation-of-Time term in `sunriseUTC()`) — do not create a separate fix for it. When applying that fix in `src/lib/panchang.ts`, also propagate it to the 5 duplicate inline `sunriseUTC()`/solar-noon copies found in Muhurta pages: `src/pages/muhurta/choghadiya.astro:117`, `hora.astro:94`, `rahu-kala.astro:82`, `abhijit.astro:75`, `panchaka.astro:131` (grep `noon = 12 - lng / 15` or `noon=12-lng/15` across `src/pages/muhurta/*.astro` to find all copies) — each needs the same `eot` term that `solarNoonUTC()` already computes."

#### Bonus finding: Abhijit Muhurta uses a fixed 48-minute window instead of day-length/15

- **Location:** `src/lib/panchang.ts:380-390` (`abStart = noonMins - 24; abEnd = noonMins + 24`), duplicated in `src/pages/muhurta/abhijit.astro`
- **Problem:** Methodology mismatch beyond the EoT noise above. Traditional/drikpanchang Abhijit Muhurta is the 8th of 15 equal muhurtas dividing sunrise→sunset (duration = day-length/15), not a flat 48 minutes. New Delhi 2026-07-06: drikpanchang shows 11:58 AM–12:54 PM (56 min, day length ~13h54m) vs the code's constant ~48 min. Near equinox the two methods nearly coincide (Mumbai 2026-10-20: drikpanchang 46 min vs code's 48 min), but the gap grows to ~8 minutes at summer solstice.
- **Fix prompt:** "In `calculatePanchang()` (`src/lib/panchang.ts:380-390`), replace the fixed `± 24` with `± (dayMins/15)/2` (i.e. `abStart = noonMins - dayMins/30; abEnd = noonMins + dayMins/30`), and apply the identical change to the duplicate calculation in `src/pages/muhurta/abhijit.astro`. Re-verify against drikpanchang.com for New Delhi 2026-07-06 (expect ~56 min window) and Mumbai 2026-10-20 (expect ~46 min window) after the fix."
