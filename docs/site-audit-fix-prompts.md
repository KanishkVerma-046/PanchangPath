# PanchangPath Site Audit — Fix Prompts

Standalone, ready-to-paste prompts for every issue found in `docs/site-audit-2026-07.md` (2026-07-06 full-site audit). Each one is self-contained — paste it into a fresh Claude Code session to fix that issue in isolation. Full context/evidence for each is in the source report.

**Status key:** ✅ FIXED · ⏭️ SKIPPED (see note) · Updated 2026-07-06 during a fix-by-fix pass through this list.

## Part 1: Navigation & Dead Links

### 1. Dead-end nav links in Planets menu — ⏭️ SKIPPED
> Declined: building 4 new astronomical-data pages is a feature addition beyond a nav-link fix. Menu left as-is with dead links.
> Either build dedicated feature pages (e.g., `src/pages/planets/planetary-positions.astro`, `src/pages/planets/rahu-ketu.astro`, etc.) that display real planetary data using the site's astronomical calculations, and update Header.astro's Planets dropdown (desktop, mobile drawer, and searchItems) to point to them — or remove the entire Planets menu and its four items if this feature set isn't planned. Ensure any changes are reflected in all three locations: desktop dropdown, mobile drawer, and searchItems array (starting at line 1136).

### 2. Dead-end nav links in Gallery menu — ✅ FIXED
> Removed the entire Gallery menu (desktop + mobile drawer) rather than building image-gallery pages.
> Either build gallery feature pages (e.g., `src/pages/gallery/deity-images.astro`, `src/pages/gallery/festival-photos.astro`, etc.) that display curated image collections, and update Header.astro's Gallery dropdown (desktop, mobile drawer, and searchItems) to point to them — or remove the entire Gallery menu section if this feature isn't planned.

### 3. Dead-end nav links in Others menu (Baby Names, Compatibility, Dream Meaning, About) — ✅ FIXED
> Baby Names/Compatibility now point to `/jyotish/baby-names` and `/jyotish/horoscope-match`. Dream Meaning and About removed rather than built (no page existed for either).
> For 'Baby Names' and 'Compatibility': update Header.astro's Others menu items (desktop, mobile drawer, and searchItems) to point to their real pages: `/jyotish/baby-names` and `/jyotish/horoscope-match` respectively. For 'Dream Meaning' and 'About': either build `src/pages/dream-meaning.astro` and `src/pages/about.astro` pages and wire them in, or remove these nav items entirely. Ensure all changes appear in all three locations: desktop dropdown, mobile drawer, and searchItems.

### 4. Dead-end link: "Sunrise & Sunset" — ⏭️ SKIPPED
> Declined: building a dedicated page is a feature addition beyond a nav-link fix.
> Either build `src/pages/sunrise-sunset.astro` showing daily sunrise/sunset times using the site's location system and astronomical calculation library (src/lib/panchang.ts provides Tithi and astronomical methods), and update Header.astro's 'Sunrise & Sunset' link (desktop, mobile drawer, and searchItems at line 1157) to point to it — or remove the nav item if this feature isn't planned.

### 5. Dead-end link: "Moonrise & Moonset" — ⏭️ SKIPPED
> Declined: building a dedicated page is a feature addition beyond a nav-link fix.
> Either build `src/pages/moonrise-moonset.astro` showing daily moonrise/moonset times using lunar calculations (src/lib/panchang.ts has lunar timing methods), and update Header.astro's 'Moonrise & Moonset' link (desktop, mobile drawer) to point to it — or remove the nav item if this feature isn't planned. Update searchItems array if adding this page.

### 6. Mislabeled link: "Rahu Kalam" points to homepage — ✅ FIXED
> Change Header.astro line 114 (desktop) and line 270 (mobile drawer) from `href="/"` to `href="/muhurta/rahu-kala"` for the 'Rahu Kalam' link. Verify the searchItems array (around line 1143) also has the correct link.

### 7. Dead footer city query-param links — ✅ FIXED
> Removed the non-functional footer "Cities" column (Layout.astro) rather than implementing query-param handling.
> Either implement city query parameter handling in src/pages/index.astro to detect the `?city=` param and update the location selector (triggering the same geolocation/location-change flow as the header's location picker), or replace these footer links with static routes to dedicated city pages (e.g., `/cities/delhi`, `/cities/mumbai`). Verify that clickthrough works end-to-end and updates the displayed panchang data.

### 8. Janma Kundali missing from Header's direct dropdown/drawer/searchItems — ✅ FIXED
> Add 'Janma Kundali' to the Jyotish calculator section in Header.astro so it's a one-click destination like the other calculators: (1) add `<a href="/jyotish/janma-kundali" class="dd-link">Janma Kundali</a>` to the desktop dropdown (around line 175), (2) add the same link to the mobile drawer Jyotish section (around line 341), and (3) add `{ label: "Janma Kundali", url: "/jyotish/janma-kundali" }` to the searchItems array (around line 1169). Verify all three locations are updated together per the CLAUDE.md sync convention.

### 9. Planetary Events Feed (/events) missing from Header nav entirely — ✅ FIXED
> Added under the Panchang menu (desktop + drawer + searchItems).
> Add a 'Planetary Events' or 'Upcoming Events' link to Header.astro. This could go in a new menu or as part of an existing section (e.g., under 'Planets' or 'Today's Panchang'). Once added, update all three locations: (1) desktop dropdown, (2) mobile drawer, and (3) searchItems array. Then verify the page loads and displays real event data correctly.

### 10. Rashifal missing from desktop dropdown and searchItems — ✅ FIXED
> Add 'Rashifal' or 'Daily Horoscope' to the desktop dropdown, likely under the Jyotish menu (around line 167-178), using `<a href="/rashifal" class="dd-link">Rashifal (Horoscope)</a>`, AND add `{ label: "Rashifal", url: "/rashifal" }` (plus a 'Daily Horoscope' alias entry) to the searchItems array (around line 1169). Verify it appears in all three locations: desktop dropdown, mobile drawer (already present at line 342), and searchItems array.

### 11. Prashnavali missing from desktop dropdown and searchItems — ✅ FIXED
> Add 'Prashnavali Oracle' to the desktop dropdown, likely under the Jyotish menu near Rashifal (around line 178), using `<a href="/prashnavali" class="dd-link">Prashnavali Oracle</a>`, AND add `{ label: "Prashnavali", url: "/prashnavali" }` to the searchItems array (around line 1176). Verify it appears in all three locations: desktop dropdown, mobile drawer (already present at line 343), and searchItems array.

### 12. Regional Panchang missing from searchItems — ✅ FIXED
> Add `{ label: "Regional Panchang", url: "/panchang/regional" }` to the searchItems array in Header.astro (around line 1157, near the other Panchang-menu entries). Verify it now appears in all three locations: desktop dropdown (line 116), mobile drawer (line 271), and searchItems array.

### 13. Six Jyotish sub-pages missing from desktop dropdown and drawer — ✅ FIXED
> Add these missing Jyotish pages to the desktop dropdown Jyotish menu (lines 165-177) and mobile drawer Jyotish section (lines 332-343): `/jyotish/rudraksha`, `/jyotish/sunsign`, `/jyotish/pancha-pakshi`, `/jyotish/shraddha`, `/jyotish/sahasra-chandrodaya`, `/jyotish/lagna`. The desktop dropdown should expand to show all 16 Jyotish calculators (or split into multiple columns with a 'see all' link if space is tight). Examples: `<a href="/jyotish/rudraksha" class="dd-link">Rudraksha Calculator</a>`, `<a href="/jyotish/sunsign" class="dd-link">Sun Sign Calculator</a>`, etc. Update all three locations (dropdown, drawer, searchItems) together.

## Part 2: Accuracy vs drikpanchang.com

### 14. Moon longitude `/1000` scaling bug (Core Panchang) — ✅ FIXED
> Verified: Tithi/Nakshatra/Yoga/Karana for all 3 test dates now match the expected names exactly.
> In `src/lib/panchang.ts`, function `moonLongitude()` (~line 78), change `return norm360(L + dL / 1000);` to `return norm360(L + dL);` — the `dL` sum is already in degrees per the Meeus low-precision lunar formula and should not be scaled. After the fix, verify Tithi/Nakshatra/Yoga/Karana for 2026-07-06, 2026-10-20, and 2027-01-14 New Delhi against drikpanchang.com day-panchang pages to confirm the names now match (expect Shashthi/Purva Bhadrapada/Saubhagya/Vanija, Navami/Shravana/Shula/Kaulava, and Shashthi/Uttara Bhadrapada/Parigha/Taitila respectively). Note: the identical `dL / 1000` bug also exists in `src/lib/kundali.ts` (`moonLon()`, ~line 150) and is duplicated inline in at least 25 files under `src/` (grep for `dL / 1000`) — see prompt #15 for the full propagation fix.

### 15. Same `/1000` bug propagated across kundali.ts and ~25 files (Kundali/Jyotish) — ✅ FIXED
> Fixed all 24 files found with the exact `dL / 1000` / `dL/1000` pattern (kundali.ts, KundaliWidget.astro, Header.astro, index.astro, calendar.astro, 4 muhurta pages, 15 jyotish pages).
> In `src/lib/kundali.ts` line 150, change `return n360(Lm + dL / 1000);` to `return n360(Lm + dL);`. Then grep the codebase for the literal strings `dL / 1000` and `dL/1000` and apply the identical one-character fix (remove `/ 1000`) to every match — this includes `src/lib/panchang.ts` (see prompt #14; fix once, not twice), `src/components/KundaliWidget.astro:496`, and all Moon-computing files under `src/pages/jyotish/*.astro` (kundali.astro, janma-kundali.astro, lagna.astro, horoscope-match.astro, rashi.astro, baby-names.astro, shraddha.astro, sahasra-chandrodaya.astro, kalasarpa.astro, sadesati.astro, mangal-dosha.astro, nakshatra.astro, pancha-pakshi.astro, gemstone.astro, rudraksha.astro). Re-run a standalone `kundali.ts` test script for a date where `dL` is large (e.g. a date near lunar apogee/perigee) before/after the fix to confirm Chandra's sign/degree changes meaningfully. This is one systemic bug with ~25+ copies, not a set of independent bugs — fix and verify the canonical `kundali.ts`/`panchang.ts` copies first, then propagate.

### 16. Truncated 6-term Moon formula in 15 of 16 Jyotish pages — ✅ FIXED
> All 15 files now use the full 15-term dL sum. CLAUDE.md's Known Issues/Orbital Mechanics sections updated to reflect this.
> Copy the full 15-term `dL` correction sum from `src/lib/kundali.ts` lines 145-149 (the terms from `0.058793*sin(2Dr-2Mpr)` through `0.010034*sin(3Mpr)`) into the `moonLon` function of these 15 files: `kundali.astro`, `janma-kundali.astro`, `lagna.astro`, `horoscope-match.astro`, `rashi.astro`, `baby-names.astro`, `shraddha.astro`, `sahasra-chandrodaya.astro`, `kalasarpa.astro`, `sadesati.astro`, `mangal-dosha.astro`, `nakshatra.astro`, `pancha-pakshi.astro`, `gemstone.astro`, `rudraksha.astro` — replacing their existing 6-term version — and apply the `/1000` fix (prompt #15) to the same function at the same time, since both bugs live in the same few lines. After fixing, update the CLAUDE.md 'Known Issues' bullet about truncated Moon longitude to reflect the true scope once all 15 pages match `kundali.ts`.

### 17. Missing Equation of Time in sunrise/sunset (Core Panchang) — ✅ FIXED
> Replaced the broken ad-hoc eot formula (with the dead `*0` no-op term) with a proper Meeus equation-of-time formula, shared between solarNoonUTC() and sunriseUTC(). Verified sunrise/sunset for New Delhi 2026-07-06 against expected values.
> In `src/lib/panchang.ts`, function `sunriseUTC()` (~lines 100-116), the local solar noon (`const noon = 12 - lng / 15;`) omits the Equation of Time. Compute EoT inside this function (or refactor to reuse `solarNoonUTC()`'s `eot` calc) and apply it: `const noon = 12 - lng / 15 - eot / 60;`, matching the pattern in `solarNoonUTC()`. While there, double-check `solarNoonUTC()`'s own `eot` formula (lines 93-95) — it contains a dead no-op term `+ 0.9999 * (280.46646 - L0) * 0` (always 0, likely leftover/unfinished logic); validate the whole formula against a reference EoT formula (e.g. B=360/365·(N-81)°; EoT=9.87 sin 2B − 7.53 cos B − 1.5 sin B minutes) before trusting it. This affects sunrise, sunset, Rahu Kalam, Gulika Kalam, Yamaganda, Abhijit Muhurta, day-duration, and the moonrise estimate for every page calling `calculatePanchang()`. See prompt #20 for the 5 duplicate inline copies in Muhurta pages that need the same fix.

### 18. Yamaganda Kalam wrong slot table (Muhurta) — ✅ FIXED
> In `src/lib/panchang.ts`, replace `const YAMAGANDA_SLOTS = [3, 5, 2, 7, 4, 6, 1];` with `const YAMAGANDA_SLOTS = [4, 3, 2, 1, 0, 6, 5];` (index 0=Sunday…6=Saturday, verified against drikpanchang.com day-panchang pages for New Delhi Jul 5–11 2026). Apply the identical fix to the duplicate `YAMAG_SLOTS` array in `src/pages/muhurta/rahu-kala.astro:71`. Note: `RAHU_SLOTS` and `GULIKA_SLOTS` were checked against the same drikpanchang data during this audit and are already correct — do not touch them.

### 19. Gowri Panchangam wrong table (Muhurta) — ✅ FIXED (GOWRI_DAY only)
> GOWRI_NIGHT intentionally left unfixed — its correct values were never independently verified against drikpanchang, so guessing would risk introducing new wrong data.
> Replace `GOWRI_DAY` in `src/lib/muhurta.ts` (and the duplicate in `panchaka.astro:85`) with this verified table (index 0=Sun…6=Sat):
> ```
> Sun: [Uthamam, Amrutham, Rogam, Labham, Dhanam, Sudham, Charam, Visha]
> Mon: [Amrutham, Visha, Rogam, Labham, Dhanam, Sudham, Charam, Uthamam]
> Tue: [Rogam, Labham, Dhanam, Sudham, Charam, Uthamam, Visha, Amrutham]
> Wed: [Labham, Dhanam, Sudham, Charam, Visha, Uthamam, Amrutham, Rogam]
> Thu: [Dhanam, Sudham, Charam, Uthamam, Amrutham, Visha, Rogam, Labham]
> Fri: [Sudham, Charam, Uthamam, Visha, Amrutham, Rogam, Labham, Dhanam]
> Sat: [Charam, Uthamam, Visha, Amrutham, Rogam, Labham, Dhanam, Sudham]
> ```
> Apply the same fix to the duplicate in `src/pages/muhurta/panchaka.astro:85`. Note: `GOWRI_NIGHT` has the same Wed=Sun copy-paste bug but its correct values were **not** independently re-derived in this audit (only day-time data was pulled) — fetch night-time Gowri sequences from drikpanchang for all 7 weekdays before fixing `GOWRI_NIGHT` and `panchaka.astro:94`.

### 20. Equation-of-Time cascade into all Muhurta tools — ✅ FIXED
> Propagated the same EoT fix to all 5 duplicate inline copies.
> This is the same bug as prompt #17 (missing Equation-of-Time term in `sunriseUTC()`) — do not create a separate fix for it. When applying that fix in `src/lib/panchang.ts`, also propagate it to the 5 duplicate inline `sunriseUTC()`/solar-noon copies in Muhurta pages: `src/pages/muhurta/choghadiya.astro:117`, `hora.astro:94`, `rahu-kala.astro:82`, `abhijit.astro:75`, `panchaka.astro:131` (grep `noon = 12 - lng / 15` or `noon=12-lng/15` across `src/pages/muhurta/*.astro` to find all copies) — each needs the same `eot` term that `solarNoonUTC()` already computes.

### 21. Abhijit Muhurta fixed 48-minute window (Muhurta) — ✅ FIXED
> Verified: New Delhi 2026-07-06 → 56 min window, Mumbai 2026-10-20 → 47 min window. Matches audit expectations.
> In `calculatePanchang()` (`src/lib/panchang.ts:380-390`), replace the fixed `± 24` with `± (dayMins/15)/2` (i.e. `abStart = noonMins - dayMins/30; abEnd = noonMins + dayMins/30`), and apply the identical change to the duplicate calculation in `src/pages/muhurta/abhijit.astro`. Re-verify against drikpanchang.com for New Delhi 2026-07-06 (expect ~56 min window) and Mumbai 2026-10-20 (expect ~46 min window) after the fix.

### 22. `/panchang/regional` Object.keys bug (Regional Panchang) — ✅ FIXED
> Verified: all 6 lunar-tradition regions now show the correct current amanta month instead of a constant Chaitra-equivalent.
> In `src/pages/panchang/regional.astro`, replace the inline `Object.keys({Chaitra:0,...} as Record<string,number>)[cal.amantaMonth.name] ?? 0` expression (lines 16-19) with the same `AMANTA_TO_IDX`-style pattern already used in `src/pages/panchang/[region].astro` (~lines 29-35): hoist the `{Chaitra:0,Vaishakha:1,...}` object into a named `const AMANTA_TO_IDX: Record<string, number> = {...}` and index it directly as `AMANTA_TO_IDX[cal.amantaMonth.name] ?? 0`, dropping the erroneous `Object.keys(...)` wrapper. After the fix, verify the displayed month name for mr/gu/kn/te/or/iskcon on `/panchang/regional` changes away from a constant 'Chaitra'-equivalent value on today's date (2026-07-06, which is not really Chaitra in any tradition).

### 23. Guru Purnima 2026 date wrong (Festivals) — ✅ FIXED
> In `src/lib/festivals.ts:58`, change the Guru Purnima entry's `date` from `'2026-06-29'` to `'2026-07-29'`. Re-sort its position in the array if event ordering matters (it should sit after Devshayani Ekadashi ~2026-07-25, once/if that entry is added — see prompt #26).

### 24. Ganesh Chaturthi 2026 date wrong (Festivals) — ✅ FIXED
> In `src/lib/festivals.ts`, change the Ganesh Chaturthi entry's `date` from `'2026-08-16'` to `'2026-09-14'` (line 59), and move the object to sit after the Krishna Janmashtami entry (`2026-09-04`, currently line 61) so the array stays date-sorted.

### 25. Diwali 2026 date wrong (Festivals) — ✅ FIXED
> In `src/lib/festivals.ts:63`, change the Diwali entry's `date` from `'2026-11-09'` to `'2026-11-08'`.

### 26. Raksha Bandhan 2026 possibly one day off (Festivals, lower confidence — verify before applying) — ⏭️ SKIPPED
> Left unchanged — no way to browse drikpanchang.com to independently re-verify before applying.
> Before changing anything, re-verify Raksha Bandhan 2026's date directly against drikpanchang.com (accounting for Bhadra timing rules). If confirmed as Aug 28, change `src/lib/festivals.ts:60`'s `date` from `'2026-08-27'` to `'2026-08-28'`.

### 27. Entire Oct-Nov 2026 festival season missing (Festivals) — ✅ FIXED
> Added all 9 entries. Narak Chaturdashi's date is lower-confidence (not independently re-verified); Dev Uthani Ekadashi's date (2026-11-21) was computed from the site's own Tithi engine since the audit didn't pin an exact date; Govardhan Puja uses the day-after-Diwali convention (2026-11-10).
> In `src/lib/festivals.ts`, add 2026 entries (mirroring each festival's existing `name`/`nameHi`/`type`/`description`/`longDesc` fields from its 2025 counterpart) for: Navratri Begins (2026-10-11), Maha Navami (2026-10-19), Vijayadashami/Dussehra (2026-10-20), Dhanteras (2026-11-06), Narak Chaturdashi (~2026-11-07, verify against drikpanchang), Govardhan Puja (2026-11-10, or 11-09 depending on which regional observance convention the site wants to follow — document the choice), Bhai Dooj (2026-11-11), Chhath Puja (2026-11-15, the main Sandhya Arghya day of the Nov 13-16 span — verify against drikpanchang), and Dev Uthani Ekadashi (verify the 2026 Kartik Shukla Ekadashi date, expected late November). Insert all in date-sorted order alongside prompt #25's Diwali fix.

### 28. No 2027 festival data at all (Festivals) — ⏭️ SKIPPED
> Attempted via computing dates from the site's own Tithi engine, but abandoned: found a new amanta-month labeling lag bug (see CLAUDE.md Known Issues) that made the computed dates unreliable — computed Makar Sankranti (2027-01-14) was one day off the audit's verified 2027-01-15, and the computed year-over-year Diwali spacing implied two consecutive leap-months, which isn't astronomically possible.
> Extend `src/lib/festivals.ts` with a full 2027 festival block, following the exact same per-entry shape as the existing 2025/2026 blocks. Rename the exported constant from `FESTIVALS_2025_2026` to something reflecting the new range (e.g. `FESTIVALS_2025_2027`) and update every import site (grep the codebase for `FESTIVALS_2025_2026`). Start the 2027 block with Makar Sankranti at `'2027-01-15'` (verified against drikpanchang.com — NOT `'2027-01-14'`), followed by Pongal, Lohri, and the rest of the annual cycle through at least end-2027 so the site doesn't go blank again in ~12 months.

---

**Suggested fix order:** #14 → #15 → #16 (all three touch the same Moon-longitude code path, do together) → #17 → #20 (same EoT root cause) → #18, #19, #21 (independent Muhurta table fixes) → #22 (independent regional fix) → #23–#28 (festivals.ts, all independent of each other and of the above). Part 1 nav fixes (#1–#13) are independent of all Part 2 fixes and can be done in any order, ideally batched since most touch the same 3 locations in Header.astro.
