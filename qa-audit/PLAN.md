# PanchangPath — QA Audit Findings

Plan-only document. No code has been changed as part of this audit. See `qa-audit/INVENTORY.md`
for the full page inventory and engine/context notes shared with every batch's subagent.

Issues are numbered sequentially across the whole document (`Issue #1`–`#34`) so they can be
triaged and fixed one at a time. All 16 planned batches are complete — see `qa-audit/PROGRESS.md`
for per-batch status.

## Summary

**~337 pages/entries checked** across 16 batches (61 static/hub routes, 88 festival pages, 158
devotional entries, 12 rashifal states × 4 periods, 11 regional traditions, 6 blog posts, plus
representative sampling of the 15 jyotish calculators and 9 muhurta tools).

**34 issues found:**

| Severity | Count | Notes |
|---|---|---|
| Blocker | 2 | Issue #5 (Moonrise/Moonset page completely broken), Issue #9 (shared `calcLagna()` bug — see below) |
| Major | 14 | #1, #6, #12, #13, #16*, #20, #21, #25, #30, plus #3, #4 (calendar), #7 isn't major (see table below for exact split) |
| Minor | 13 | mostly i18n gaps, dead controls, small table/logic errors |
| Content | 5 | mostly data-completeness gaps (missing translations, truncated text, count mismatches) |

*(see each batch section for the authoritative severity of every individual issue — this table is
a rough distribution, not a substitute for reading the entries.)*

**Two systemic issues, each surfaced repeatedly across many pages — fixing the shared root cause
fixes every occurrence at once, so each is tracked as ONE issue rather than duplicated per page:**

1. **Issue #9 (blocker)** — `calcLagna()` in `src/lib/astro-core.ts` has a broken Ascendant/
   quadrant-resolution heuristic causing ~180° jumps in the rising sign across a day. Confirmed
   live on **9 pages**: `/muhurta/lagna`, `/jyotish/kundali`, `/jyotish/janma-kundali`,
   `/jyotish/lagna`, `/jyotish/mangal-dosha`, `/jyotish/gemstone`, `/jyotish/rudraksha`, and (by
   inheritance, once fixed) affects `/jyotish/kalasarpa`'s Issue #25. The homepage/`/kundali`
   Kundali widget was not re-verified for this specific bug (Batch 1 only checked internal
   consistency at one point in time, not Ascendant continuity across a day) — worth a follow-up
   check once the fix lands. **This is the single highest-value fix in this document** — one
   function change in `astro-core.ts` likely resolves most of these 9 findings at once.
2. **Issue #24 (content)** — most/all jyotish calculators duplicate an identical hardcoded 15-city
   location list instead of importing the shared 162-city `src/lib/locations.ts`. Confirmed on 8+
   pages (`kundali`, `janma-kundali`, `horoscope-match`, `rashi`, `sunsign`, `nakshatra`, `lagna`,
   `gemstone`, `rudraksha`). Not a correctness bug (the 15 cities that exist compute correctly),
   but a usability gap (no Southern Hemisphere option) worth a single consolidated fix.

Also recurring throughout: a **"duplicated lookup table instead of shared import" pattern** shows
up independently in at least 6 other places (Issues #1, #3, #11, #15, #16, #27) — each is a
separate root cause/fix (different table, different file), not the same bug, but the pattern
itself is worth institutional awareness: whenever a page reimplements a table/function that
already exists in `src/lib/`, it risks silently going stale the next time the shared source is
fixed (this is literally how Issues #1 and #3 happened — the shared table was fixed, but 1-3
inline duplicates were missed).

**Highest-priority fixes, in order:**
1. Issue #9 — shared `calcLagna()` bug (blocker, affects 9+ pages, one-function fix)
2. Issue #5 — Moonrise/Moonset page completely broken (blocker, single missing-import fix)
3. Issue #21 — Horoscope Match Nadi Kuta wrong on the page's own default example (major, visible to every first-time visitor)
4. Issue #1 — Homepage Yamaganda Kalam silently wrong every Thursday due to client-side override (major, affects the homepage)
5. Issues #12/#13 — Vivah/Griha Pravesh muhurat tools recommend dates during periods with traditionally zero valid muhurats (major, undermines the tool's core purpose)
6. Issue #6 — Planetary Events times 12h off/AM-PM flipped (major, affects every dynamically-computed event)
7. Issue #20 — Jaya Ekadashi festival dates wrong for 2 years running (major, factual content error)
8. Issue #30 — Prashnavali "Choose Your Number" 101-108 silently broken (major, small fix)
9. Issue #3/#4 — Calendar page stale festival data + wrong Tithi evaluation hour (major, affects a heavily-used page)
10. Issue #25 — Kalasarpa Yoga type mislabeled for all non-Aries-Lagna users (major, depends on #9 being fixed first)

Remaining minor/content issues (i18n gaps, dead controls, small table errors, content-completeness
gaps) are listed in full in each batch section below and can be triaged independently — none block
core site functionality.

---

## Batch 1: Homepage + header/global widgets

### Issue #1: Homepage client-side script overwrites correct SSR Yamaganda Kalam with a stale weekday table — `/`

**FIXED — verified (commit `ad7c00c`).** `YAMAGANDA_SLOTS` exported from `panchang.ts`, all 3
inline `YAMA`/`YAMA_S` duplicates in `index.astro` replaced with the import. New Delhi, Thursday
2026-07-23: client-recomputed Yamaganda now `5:37 AM – 7:20 AM`, matching SSR and drikpanchang.com.
- Severity: major
- Description: `src/pages/index.astro`'s client `<script>` re-implements the Rahu/Gulika/Yamaganda
  slot tables inline instead of importing them from `src/lib/panchang.ts`. The Rahu and Gulika
  copies happen to match the current (fixed) tables, but the Yamaganda copy at line 374
  (`const YAMA = [3,5,2,7,4,6,1]`) still has the old, wrong table — `panchang.ts`'s
  `YAMAGANDA_SLOTS = [4,3,2,1,0,6,5]` was fixed sitewide in 2026-07 but this duplicate was missed.
  Two more duplicate copies of the same stale table exist in the same file (line 536, day-timeline
  bar shading; line 664 `YAMA_S`, summary-card mini-timeline) — so the visual timeline segments are
  wrong too, not just the text field. The script runs unconditionally on every page load
  (`renderWithLoc()` at line 811), so the correct server-rendered value is overwritten within
  milliseconds on every visit, with no user interaction required.
- Evidence: New Delhi, Thursday 2026-07-23. Server-rendered value `5:37 AM – 7:20 AM` matches
  drikpanchang.com exactly. Client-side recompute uses slot 4 instead of slot 0 for Thursday,
  producing ~12:27 PM–2:10 PM.
- Fix prompt: >
  In `src/pages/index.astro`, remove the inline `YAMA` (line ~374), and the duplicate Yamaganda
  tables at line ~536 and `YAMA_S` at line ~664. Replace all three with imports of
  `YAMAGANDA_SLOTS` from `src/lib/panchang.ts` (same pattern already used for the Rahu/Gulika
  tables in this file, which are already correct). Verify by loading `/` for a Thursday date and
  confirming the client-rendered Yamaganda Kalam text AND the day-timeline bar segment match the
  server-rendered value and drikpanchang.com, both immediately on load and after the client script
  has run (not just in the initial HTML source).

### Issue #2: Footer never translates to Hindi — all pages (via `src/layouts/Layout.astro`)
- Severity: minor
- Description: Footer columns ("Panchang", "Jyotish", "Company" headers + all their links: Today,
  Calendar, Festivals, Muhurta Finder, Daily Rashifal, Mesha/Vrishabha Rashifal, Prashnavali
  Oracle, About Us, Contact Us, Privacy Policy, Terms & Conditions) and the copyright line have no
  `.en-text`/`.hi-text` spans or `data-hi` attributes in `Layout.astro` (lines ~95-140), unlike the
  rest of the site. Language toggle correctly flips homepage/header content but the footer stays
  in English regardless of language selection.
- Evidence: Inspected `Layout.astro` footer markup directly — no i18n markers present anywhere in
  that block. Likely missed by the "Fix Hindi/English i18n coverage gaps" commit (`4aa3cc0`),
  which covered homepage/calendar/Kundali widget but not the shared footer.
- Fix prompt: >
  Add Hindi translations to every footer string in `src/layouts/Layout.astro` (column headers,
  link labels, copyright line) using the same `.en-text`/`.hi-text` span pattern (or `data-hi`
  attribute pattern) already used elsewhere on the site, and confirm the existing language-toggle
  JS selector already targets these classes/attributes (it should, since it's a global toggle) —
  if not, extend the toggle's selector. Verify by toggling to Hindi on any page and confirming
  every footer string switches, then toggle back to English and confirm it reverts.

**Clean (verified, no issues found):** Tithi/Nakshatra/Yoga/Karana/sunrise/sunset/Rahu
Kalam/Gulika Kalam server-rendered values (checked against drikpanchang.com for New Delhi,
2026-07-23 — exact or within known engine precision); Lagna Kundali Widget planet
table/tabs/popups/retrograde status (internally consistent, no logic errors found); header
sticky nav/dropdowns/mobile drawer/live search/`searchItems` sync; dark mode toggle; language
toggle (everywhere except footer, see Issue #2); location picker (uses `Intl.DateTimeFormat`
IANA-based DST-aware offset via `getTzInfo()` in `LocationPicker.astro` — better DST handling
than assumed, no concrete DST bug found for any tested city); footer link destinations (all 4
pages exist); Upcoming Festivals & Vrats feed dates/ordering.

**Not deeply verified, flag for later pass if needed:** Upcoming Planetary Events feed — only
confirmed it renders and has i18n markers; individual event dates not independently re-checked.

---

## Batch 2: Calendar + Sunrise/Sunset + Moonrise/Moonset + Events

### Issue #3: Calendar's festival markers use a stale, hardcoded `FEST_DATA` subset instead of `festivals.ts` — `/calendar`

**FIXED — verified (commit `9452def`).** Deleted hardcoded `FEST_DATA`, now imports
`FESTIVALS_2025_2027` from `src/lib/festivals.ts` directly (so it also picked up the Issue #20
date correction automatically). `festivals.ts` confirms Diwali 2026-11-08 and Krishna Janmashtami
2026-09-04 now flow through to the calendar.
- Severity: major
- Description: `src/pages/calendar.astro` (lines ~144-171) hardcodes its own `FEST_DATA` const with
  festival dates instead of importing `FESTIVALS_2025_2027` from `src/lib/festivals.ts` — the same
  "duplicated stale table instead of shared import" pattern as Issue #1. It was never updated when
  `festivals.ts` was corrected/expanded in 2026-07.
- Evidence: Calendar shows Diwali on 2026-10-09 (Oct 2026 view) and missing entirely from Nov 2026;
  `festivals.ts` (source of truth) has Diwali on 2026-11-08. Janmashtami hardcoded as 2026-08-22 vs.
  correct 2026-09-04. Guru Purnima, Raksha Bandhan, Ganesh Chaturthi, and the entire Oct–Nov 2026
  festival cluster (Navratri, Dussehra, Dhanteras, Bhai Dooj, Chhath Puja) are absent from the
  calendar's marker data even though present in `festivals.ts`.
- Fix prompt: >
  In `src/pages/calendar.astro`, delete the hardcoded `FEST_DATA` const (~line 144-171) and import
  `FESTIVALS_2025_2027` from `src/lib/festivals.ts` instead, mapping its `date`/`name`/`nameHi`
  fields into whatever shape the calendar's day-cell rendering expects. Verify by navigating to
  Nov 2026 and confirming Diwali shows on the 8th (not missing), and to Aug/Sep 2026 confirming
  Janmashtami shows on 2026-09-04 (not 2026-08-22).

### Issue #4: Calendar's `quickPanchang()` evaluates Tithi/Nakshatra at the wrong UTC hour, showing values ~1 tithi/nakshatra ahead of the correct one — `/calendar`

**FIXED — verified (commit `9452def`).** `julianDay(..., 6)` → `julianDay(..., 6 - CAL_TZ)`.
2026-07-23 quickPanchang now returns "S Navami / Vishakha", matching `calculatePanchang()`'s own
"Shukla Navami / Vishakha" exactly (was a full tithi ahead before).
- Severity: major
- Description: `calendar.astro` line ~116 calls `julianDay(..., 6)` — a literal `6` for the UTC
  hour — instead of the correct `6 - loc.tz` pattern already used correctly in
  `sunrise-sunset.astro`/`moonrise-moonset.astro`. This evaluates Panchang at 06:00 UTC (11:30 AM
  IST) rather than 06:00 AM IST, so any tithi/nakshatra that transitions between those two times
  displays the wrong (later) value for that day.
- Evidence: Calendar's today-cell (2026-07-23) shows "S Dashami / Vishakha". The site's own
  authoritative `calculatePanchang()` for the same date/New Delhi returns Tithi Shukla Navami
  (ends 7:04 AM) — the calendar is a full tithi ahead because its 11:30 AM IST evaluation point is
  past the 7:04 AM Navami→Dashami boundary.
- Fix prompt: >
  In `src/pages/calendar.astro`, change the `julianDay(..., 6)` call (~line 116) to
  `julianDay(..., 6 - loc.tz)`, matching the pattern in `sunrise-sunset.astro`. Verify by comparing
  the calendar's today-cell Tithi/Nakshatra against `calculatePanchang()`'s own homepage output for
  the same city and date — they should always agree since they're the same underlying function.

### Issue #5: Moonrise & Moonset page is completely broken — missing imports, entire page non-functional — `/moonrise-moonset`

**FIXED — verified (commit `e7e5809`).** Added the missing import of `moonLongitude`,
`sunTrueLongitude`, `moonRiseSetUTC`, `sunriseUTC` from `lib/panchang`, and removed the duplicated
hand-rolled `sunriseUTC` in favor of the shared one. Playwright-verified: zero console/page errors,
Today card and 7-day table both populate with real times across New Delhi, Mumbai, and London.
- Severity: blocker
- Description: `src/pages/moonrise-moonset.astro`'s client script calls `moonLongitude`,
  `sunTrueLongitude`, and `moonRiseSetUTC` but never imports them from anywhere — they only exist
  in `src/lib/astro-core.ts` (re-exported via `panchang.ts`). The file also duplicates its own
  hand-rolled `sunriseUTC`/`toJD` instead of importing, compounding the pattern.
- Evidence: `PAGEERROR: moonLongitude is not defined` on page load (verified via Playwright). Both
  the "Today" summary cards (`#ms-today`) and "Next 7 Days" table (`#ms-week-body`) render
  completely empty — only the static city dropdown works. This is a live, user-facing total
  failure of a shipped page, not an edge case.
- Fix prompt: >
  In `src/pages/moonrise-moonset.astro`, add
  `import { moonLongitude, sunTrueLongitude, moonRiseSetUTC } from '../lib/panchang';` (or from
  `astro-core` directly, matching whichever module actually exports `moonRiseSetUTC` — check
  `astro-core.ts`/`panchang.ts` for the right source) to the client `<script>` block, and remove
  the duplicated hand-rolled `sunriseUTC`/`toJD` in favor of the shared import. Verify by loading
  `/moonrise-moonset` in a browser with devtools open, confirming zero console errors, and
  confirming the Today card and 7-day table both populate with real moonrise/moonset times for at
  least 2 cities.

### Issue #6: Planetary Events times are systematically 12 hours off (AM/PM flipped) for all dynamically-computed events — `/events`, `/events/[id]`

**FIXED — verified (commit `48359d3`).** `jdToTimeUTC()` now routes through the same noon-epoch-
aware `dateFromJD()` used elsewhere in the file instead of raw `(jd % 1) * 24`. Simha Sankranti
2026 now computes as 7:30 AM IST (was 7:30 PM), matching drikpanchang.com's ~7:58 AM IST within
normal precision tolerance.
- Severity: major
- Description: `src/lib/planetaryEvents.ts`'s `jdToTimeUTC()` (~lines 99-101) computes
  `(jd % 1) * 24` without accounting for the Julian Day's noon-based epoch (JD's fractional part is
  0 at noon UTC, not midnight) — contrast with the correct `dateFromJD()` a few lines above, which
  does subtract the JD noon-epoch constant (2440587.5) correctly. This affects every sign transit,
  conjunction/opposition, and solstice/equinox event's displayed time — the date stays correct but
  the clock time is exactly 12h off (right minutes, wrong AM/PM).
- Evidence: Site shows "Sun (Surya) enters Simha … Mon, 17 Aug, 2026 · 7:30 PM IST". Re-running the
  same sidereal-longitude interpolation from `astro-core.ts` for the same crossing gives 07:30 AM
  IST, matching drikpanchang.com's independently reported ~07:58 AM IST for Simha Sankranti 2026
  (WebSearch; the ~28 min gap is normal precision tolerance — the 12h flip is not).
- Fix prompt: >
  In `src/lib/planetaryEvents.ts`, fix `jdToTimeUTC()` (~line 99-101) to correctly extract the
  time-of-day component from a JD value using the same noon-epoch-aware method as `dateFromJD()`
  just above it (i.e. via the same `jd - 2440587.5`-style conversion, then take the fractional
  part of that converted value, not of the raw JD). Verify by checking a known sign-transit event
  (e.g. Simha Sankranti 2026) against drikpanchang.com's Sankranti time for the same year — should
  now match AM/PM, within normal minute-level precision tolerance.

### Issue #7: Retrograde/direct station events show an identical, non-computed time for every planet/date instead of the actual station moment — `/events/[id]`
- Severity: minor
- Description: `retrogradeEvent()` in `planetaryEvents.ts` (~line 602/605) passes a fixed
  `jd + 0.5` (day-midpoint) as the event time instead of interpolating the actual station moment
  the way `signTransitEvent()` does for transits.
- Evidence: `budha-margi-2026-7`, `budha-vakri-2026-10`, `budha-margi-2026-11`,
  `mangal-vakri-2027-1`, `budha-vakri-2027-2` all display an identical "5:31 PM IST" regardless of
  planet or date. Dates themselves are accurate (Mercury direct 2026-07-24 matches a
  WebSearch-verified real station ≈ July 24, 4:27 AM IST) — only the displayed time is fake.
- Fix prompt: >
  In `src/lib/planetaryEvents.ts`, change `retrogradeEvent()` (~line 602/605) to binary-search /
  interpolate the actual moment the planet's longitude-rate crosses zero (same technique used
  elsewhere in the file for transit boundaries) instead of using a fixed `jd + 0.5`. Verify by
  checking Mercury's next station against a public ephemeris (e.g. astrosage.com's Mercury
  retrograde calendar) for date AND time, not just date.

### Issue #8: Event date/time can describe two different calendar days when the IST-adjusted time crosses midnight — `/events/[id]`
- Severity: minor
- Description: `formatEventDateTime()` (`planetaryEvents.ts` ~lines 681-690) wraps the time
  correctly (`totalMins = ... % 1440`) when converting UTC to IST, but builds the displayed date
  string from the original unmodified `e.dateISO`, so a UTC time late enough in the day to roll
  into the next IST calendar day still shows the old date.
- Evidence: `/events/lunar-eclipse-2027-02-20` shows "Saturday, 20 February 2027 · 4:43 AM IST",
  but the eclipse's actual moment (23.21h UTC on Feb 20) is 04:43 AM IST on Feb 21 — a mismatched
  date/time pair.
- Fix prompt: >
  In `planetaryEvents.ts`'s `formatEventDateTime()`, when `totalMins` wraps past 1440 (or under 0),
  also adjust the date used for the displayed date string by ±1 day, not just the time. Verify with
  `lunar-eclipse-2027-02-20` (or any event whose UTC time is within ~1-2h of midnight) — displayed
  date and time should describe the same real moment.

**Clean (verified):** Sunrise & Sunset page — checked New Delhi and London (non-IST, DST-observing)
for 2026-07-23 against sunrise-sunset.org, both within normal EOT tolerance; correctly imports
`sunriseUTC` from `panchang.ts`, no duplicated formula. Events index page and detail-page rendering
mechanics (month grouping, countdown badges, language toggle) — no JS console errors, no broken
interactions.

---

## Batch 3: Rahu Kala/Muhurta cluster

### Issue #9: `calcLagna()` (shared `astro-core.ts` function) has a broken quadrant-resolution heuristic, producing ~180° jumps and a non-monotonic rising-sign sequence — SYSTEMIC, affects `/muhurta/lagna` and likely every other Lagna/Ascendant consumer sitewide

**FIXED — verified (commit `a208e63`).** Replaced with `atan2`, sign-flipped relative to the raw
tan(Asc) numerator/denominator (the unflipped pairing resolves to the Descendant, not the
Ascendant — caught during verification). Full-day sweep for New Delhi 2026-07-23: 0 spurious jumps
(down from 4), 12 clean sequential sign transitions matching drikpanchang.com's Lagna table within
sampling resolution; cross-checked against an independent brute-force horizon-crossing ground
truth to <0.001°. All 9 listed pages plus the homepage/`/kundali` Kundali widget confirmed to call
the shared function directly (no duplicate quadrant logic anywhere) — browser-verified live via
Playwright with zero console errors. `/jyotish/kalasarpa` doesn't call `calcLagna` at all (its
Issue #25 is a separate, still-open bug — not touched by this fix).
- Severity: blocker
- Description: `calcLagna()` in `src/lib/astro-core.ts` (~lines 163-173) resolves the arctangent
  quadrant with `let A = toDeg(Math.atan(tanA)); if (Math.cos(RAMC) > 0) A += 180;` — wrong
  whenever the denominator `sin(ε)tan(φ) + cos(ε)sin(RAMC)` changes sign independently of
  `cos(RAMC)`. The correct fix is a proper two-argument arctangent:
  `Math.atan2(-Math.cos(RAMC), sin(ε)*tan(φ)+cos(ε)*sin(RAMC))`.
  Because `calcLagna()` lives in the shared `astro-core.ts` module (per CLAUDE.md, this is "the
  one place every astronomy-engine call lives, plus the geometry built on top of it"), this bug is
  not confined to the Lagna Table page — it is very likely also live on the Kundali widget
  (homepage + `/kundali`), `jyotish/lagna.astro`, `jyotish/kundali.astro`, `jyotish/janma-kundali.astro`,
  and anywhere else that reads the Ascendant/Lagna. Batch 1's homepage Kundali-widget check did not
  catch this because it only checked internal consistency at a single point in time, not the
  ascendant's continuity across the day. **Flagging for the Jyotish/Kundali batches (7-10) to
  specifically re-check Lagna/Ascendant continuity once this is understood, rather than treating
  it as new if found again there.**
  **CONFIRMED SPREAD (Batch 7):** reproduces on `/jyotish/kundali` and `/jyotish/janma-kundali` —
  New Delhi, 1990-05-15: Lagna at 14:00 IST = Simha (145.29°), at 15:00 IST = Meena (338.54°), a
  ~193° jump within one hour where only ~15° of advance is expected. On Janma Kundali this also
  corrupts the House Lords table and every Lagna-keyed yoga detection (Gajakesari/Raja
  Yoga/Pancha Mahapurusha).
  **CONFIRMED SPREAD (Batch 8):** also reproduces directly on the dedicated `/jyotish/lagna`
  calculator (imports `calcLagna` straight from `astro-core.ts`, no local override) — minute-
  resolution scan for New Delhi 2026-07-23 shows a 178.85° drop between 03:20 and 03:25 IST, with
  the same discontinuity recurring ~4×/day.
  **CONFIRMED SPREAD (Batch 9):** also reproduces on `/jyotish/mangal-dosha`'s "From Lagna" dosha
  row and its Cancer/Leo-Lagna (Yogakaraka) cancellation rule — fixed date 1990-01-15, New Delhi,
  scanning time-of-day in 2h steps produced a non-monotonic Lagna sequence with multiple 180°-class
  jumps, meaning a birth a few minutes either side of the true time can flip the displayed
  Dosha/Clear verdict. (Kalasarpa Yoga and Sadesati in Batch 9 don't touch Lagna at all, so are
  unaffected by this specific bug — though Kalasarpa has its own separate Lagna-related gap, see
  Issue #25.) Still to check: homepage/`/kundali` Kundali widget.
- Evidence: New Delhi, 2026-07-23 (Thursday). Site's own logic (reproduced in Node) yields a
  rising-sign sequence with signs repeating/skipping/out of zodiac order (e.g. Dhanu → Mithuna
  jump, Meena appearing twice non-adjacently) instead of drikpanchang.com's clean single pass
  through all 12 signs in order. Raw ascendant-degree trace shows ~177-182° discontinuities at
  four points in the day. A corrected `atan2`-based version produces a smooth, monotonic curve
  (max step ~1.8°/5min, matching Earth's rotation rate) with zero discontinuities.
- Fix prompt: >
  In `src/lib/astro-core.ts`'s `calcLagna()` (~lines 163-173), replace the `Math.atan` +
  conditional-180°-add quadrant heuristic with `Math.atan2(-Math.cos(RAMC), sin(ε)*Math.tan(φ) +
  Math.cos(ε)*Math.sin(RAMC))` (adjust variable names to match the function's actual local
  variable names), then re-derive the sidereal Lagna as before (ayanamsha subtraction, mod 360).
  Verify by generating the Ascendant every 5-10 minutes across a full day for New Delhi and
  confirming: (a) it changes smoothly and monotonically with no >10° jumps, and (b) the resulting
  rising-sign sequence is a single clean pass through all 12 zodiac signs in order, matching
  drikpanchang.com's Lagna table for the same date/city. Since this is a shared function, also
  spot-check the Kundali widget (`/`, `/kundali`) and `jyotish/lagna.astro`/`jyotish/kundali.astro`/
  `jyotish/janma-kundali.astro` after the fix to confirm their displayed Ascendant/Lagna also
  changed (i.e. that they actually call the fixed function and don't have their own duplicate).

### Issue #10: Abhijit page's "Do Ghati Muhurat" card computes ±12 min but labels itself ±24 min ("1 Ghati each side") — `/muhurta/abhijit`
- Severity: minor / content
- Description: `src/pages/muhurta/abhijit.astro` line ~130 computes
  `doGhatiStart = noonMins - 12, doGhatiEnd = noonMins + 12` (a 24-minute total window), but the
  page's own copy (line ~38: "Two Ghatis (48 minutes)... 1 Ghati = 24 minutes") and UI note (line
  ~156: "1 Ghati each side") both describe a 48-minute window (±24 min). The surrounding code
  comments show unresolved back-and-forth reasoning, suggesting the final value was never
  reconciled with the label. Note: CLAUDE.md documents this card as "intentionally still a fixed
  ±24 min" — the current ±12 code contradicts that intent, so this reads as a regression/typo
  rather than a documented design choice.
- Fix prompt: >
  In `src/pages/muhurta/abhijit.astro` (~line 130), decide the intended window per CLAUDE.md ("1
  Ghati each side" = ±24 min = 48 min total) and change `doGhatiStart`/`doGhatiEnd` to
  `noonMins - 24`/`noonMins + 24` to match both the page copy and the documented intent. Verify by
  confirming the displayed window is exactly 48 minutes and centered on solar noon.

### Issue #11: Panchaka/Gowri page hand-rolls its own `sunriseUTC()` instead of importing the shared one — `/muhurta/panchaka`
- Severity: minor
- Description: Unlike every other page in this batch (`choghadiya`, `hora`, `rahu-kala`, `abhijit`,
  which all `import { sunriseUTC } from '../../lib/panchang'`), `panchaka.astro` reimplements
  `sunriseUTC` inline (~lines 129-148) and only imports `{ moonLongitude, lahiriAyanamsha }` from
  `panchang.ts`. Currently produces numerically identical output (negligible sub-arcsecond
  difference verified), but matches the exact "stale duplicate" risk pattern that already caused
  real bugs on the homepage (Issue #1) and calendar (Issue #4) — if `panchang.ts`'s `sunriseUTC` is
  ever improved/fixed again, this copy will silently drift.
- Fix prompt: >
  In `src/pages/muhurta/panchaka.astro`, delete the local `sunriseUTC` implementation (~lines
  129-148) and add `sunriseUTC` to the existing import from `../../lib/panchang`. Verify sunrise
  time displayed is unchanged for a test city before/after the change.

**Clean (verified against drikpanchang.com, New Delhi, 2026-07-23):** Choghadiya (all 7 day slots
+ sunrise/sunset match); Shubha Hora (full 12-slot sequence + start times match); Rahu Kala /
Gulika Kalam / Yamaganda Kalam on the dedicated Rahu Kala page (all three match the already-fixed
tables).

---

## Batch 4: Vivah / Griha Pravesh / Shubha Dates

### Issue #12: Vivah Muhurat scoring never checks Venus combustion (or Chaturmas), so it surfaces "Excellent" wedding dates during periods with no valid Muhurat at all — `/muhurta/vivah`

**FIXED — verified (commit `44c91c3`).** Imports `isCombust`/`planetLongitude('venus',...)` from
`astro-core.ts`, hard-gates score to -99 when Venus is combust. Re-scanned January 2026: every date
now scores -99, none reach the results threshold — matches "no Vivah Muhurat in January 2026" per
drikpanchang.com/prokerala.com.
- Severity: major
- Description: The page's own "Avoided periods" copy claims to exclude eclipse periods etc., but
  `scoreVivah()` only scores Nakshatra/Tithi/Vara/Yoga/Kharmas — it never checks Venus (Shukra
  Tara) combustion, which traditionally voids all Vivah Muhurats for its duration. `isCombust()`
  already exists in `astro-core.ts` and is used elsewhere in the codebase, but isn't imported or
  called by this page.
- Evidence: Reproducing the page's exact scoring logic for all of January 2026 surfaces
  2026-01-19 (score 7) and 2026-01-29 (score 12, labeled "Excellent") with zero "bad" flags.
  drikpanchang.com and prokerala.com both state there is no Vivah Muhurat anywhere in January 2026
  due to Venus combustion.
- Fix prompt: >
  In `src/pages/muhurta/vivah.astro`'s `scoreVivah()`, import `isCombust` from `astro-core.ts` and
  add a hard gate: if Venus (or Jupiter, per traditional rules — verify which the tradition
  requires) is combust on a candidate date, exclude it entirely from results (or force it to the
  lowest score band) rather than letting Nakshatra/Tithi/Vara scoring alone produce "Excellent."
  Verify by re-checking January 2026 — no date that month should score above the "avoid" threshold
  once the combustion gate is added, matching drikpanchang.com/prokerala.com's "no Muhurat in
  January 2026" statement.

### Issue #13: Griha Pravesh Muhurat scoring never checks Chaturmas (or combustion/Shraadh Paksha), so it surfaces "Excellent" housewarming dates throughout a period with no valid Muhurat at all — `/muhurta/griha-pravesh`

**FIXED — needs recheck (commit `44c91c3`).** Added a Chaturmas gate (Sun sidereal rashi 4-6,
computed per-date, score -10), mirroring the existing Kharmas-gate pattern. Re-scanned Aug 1 – Oct
31 2026: 2026-08-19 and 2026-08-26 now correctly drop out. **2026-08-17 still scores 12/Excellent**
— at the calculator's fixed 6:00 AM IST daily snapshot, the Sun hasn't crossed into Simha yet that
day (actual Simha Sankranti 2026 is ~7:30 AM IST, ~90 min after the snapshot) — a day-boundary
artifact of the whole site's fixed-snapshot evaluation convention, not a flaw in the new gate
itself (the pre-existing Kharmas gate shares the same limitation on its own transition days). See
new Issue #35 below. Not re-opening this issue for further guessing per the fix-phase rules; the
gate correctly excludes the bulk of Chaturmas, this is a narrow same-day boundary case.
- Severity: major
- Description: Same root cause as Issue #12 — the page's "Months to Avoid" copy claims a
  Shraadh-Paksha exclusion, but the only void-period check actually implemented is Kharmas
  (Sun in rashi 8/11), which doesn't cover Chaturmas (Sun in rashi 4-6, i.e. Simha/Kanya/Tula).
  `isCombust()` is unused here too.
- Evidence: Scanning Aug 1 – Oct 31 2026 with the page's exact scoring logic finds 50 days scoring
  ≥5, including 2026-08-17/19/26 (all score 12, "Excellent," zero bad flags). Confirmed via
  independent Sun-longitude scan that this window is Chaturmas (Sun in rashi 4-6), not Kharmas —
  so the existing Kharmas check correctly doesn't fire, but there's no Chaturmas check to catch it
  either. drikpanchang.com: "no shubh muhurat in August, September, and October 2026" for Griha
  Pravesh.
- Fix prompt: >
  In `src/pages/muhurta/griha-pravesh.astro`'s `scoreGP()`, add a Chaturmas gate (Sun sidereal
  longitude in rashi 4-6, i.e. Karka-end through Tula, roughly Ashadha Shukla Ekadashi through
  Kartik Shukla Ekadashi — use the site's own Sun-longitude function to compute the exact window
  per year rather than hardcoding dates) that excludes or heavily penalizes any candidate date
  inside it, matching the existing Kharmas-gate pattern already in the file. Verify by re-running
  Aug-Oct 2026 — no date should score in the "good/excellent" band, matching drikpanchang.com.

### Issue #14: Griha Pravesh "Type" radio group (Apoorva/Sapoorva/Dwandwah) is rendered but has no effect on scoring — `/muhurta/griha-pravesh`
- Severity: minor
- Description: The `name="gp-type"` radio inputs are rendered in the form but never read anywhere
  in the page's script — selecting a different Griha Pravesh type changes nothing about the
  results shown.
- Evidence: grep for `gp-type` in `griha-pravesh.astro` matches only the markup, no script-side
  read of the selected value.
- Fix prompt: >
  Either wire the `gp-type` selection into `scoreGP()` so it actually affects which dates are
  surfaced (if the 3 types have genuinely different rule sets in the tradition — verify what
  Apoorva/Sapoorva/Dwandwah actually change before implementing), or remove the control if it was
  a stub that was never finished. Verify by selecting each of the 3 options and confirming the
  result list changes (or, if removed, that the control no longer appears).

### Issue #15: `MUHURTA_CRITERIA` in `src/lib/muhurta.ts` is unused dead code — all 3 pages carry independent, already-diverged inline copies of the same criteria — `src/lib/muhurta.ts`, `vivah.astro`, `griha-pravesh.astro`, `shubha-dates.astro`
- Severity: content (not a live bug — nothing imports the stale shared table today — but matches
  the site's recurring "duplicate tables silently diverge" pattern, worth cleaning up)
- Description: `muhurta.ts`'s exported `MUHURTA_CRITERIA` — which CLAUDE.md describes as the
  shared scoring source — is referenced nowhere outside its own file. All 3 pages instead define
  their own inline Nakshatra/Tithi/Vara criteria, which have already diverged: e.g. `muhurta.ts`'s
  `vivah.goodNakshatras` includes Punarvasu and Pushya, but `vivah.astro`'s inline
  `VIVAH_GOOD_NAKS` excludes both (notably, excluding Pushya from marriage muhurat is traditionally
  correct — "पुष्ये न विवाहम्" — so the page's own copy is arguably more correct than the unused
  shared table, meaning this isn't a simple "import the shared one" fix).
- Fix prompt: >
  Decide which version of each activity's criteria (Vivah/Griha Pravesh/Shubha Dates) is actually
  correct per traditional sources (cross-check against drikpanchang.com's stated Nakshatra/Tithi
  rules for each activity), consolidate on one correct version in `src/lib/muhurta.ts`'s
  `MUHURTA_CRITERIA`, delete the inline duplicates in the 3 `.astro` files, and import from the
  shared table instead. Verify each page's results are unchanged (or corrected, if the inline copy
  was wrong) after switching to the shared import.

**Clean (verified):** Shubha Dates — all 4 `?activity=` variants (vehicle/property/business/
general) load distinct, activity-appropriate criteria; URL param pre-selects the correct tab;
imports resolve correctly, no `ReferenceError` risk.

---

## Batch 5: Regional Panchang

### Issue #16: Samvatsara (60-year cycle) name is computed with a wrong index offset — SYSTEMIC across Tamil, Marathi, Kannada, Telugu regional pages (and likely the homepage/main Panchang, which uses the same `panchang.ts` formula)
- Severity: content
- Description: `SAMVATSARA_60[(vsYear - 1) % 60]` (in `panchang-i18n.ts`, duplicated from
  `panchang.ts`'s `SAMVATSARA_NAMES[(vsYear - 1) % 60]`) is off by roughly 10 slots. Kannada and
  Telugu have a **second, compounding** bug on top of this: they compute the samvatsara name from
  `vsYear` (Vikram Samvat) even though the era/number they display alongside it is `ssYear` (Shaka
  Samvat) — Vikram and Shaka samvatsara names are genuinely different for the same Gregorian year
  (confirmed: VS2083="Siddharthi" vs SS1948="Parabhava"), so fixing the offset alone won't fix
  Kannada/Telugu — they also need to key off `ssYear` instead of `vsYear`.
- Evidence: Tamil shows "Saumya (2057)"; drikpanchang.com confirms Vikram Samvat 2083 =
  "Siddharthi" for 2026-07-23 (consecutive-year sanity check also holds: VS2081=Pingala→
  VS2082=Kalayukta→VS2083=Siddharthi). Kannada/Telugu show "Saumya ಶಕ/శక 1948" — drikpanchang
  confirms Shaka Samvat 1948 = "Parabhava". Gujarati, Odia, Nepali, Assamese don't display a
  samvatsara name so aren't affected. Everything else on these pages (month name, Tithi, Nakshatra)
  independently verified correct against drikpanchang.com for 2026-07-23.
- Fix prompt: >
  In `src/lib/panchang-i18n.ts` (and the duplicate formula in `src/lib/panchang.ts` — check if the
  homepage/main Panchang also displays a Samvatsara name and shares this bug, since both use the
  identical `(vsYear-1)%60` formula), find the correct index formula by testing against several
  known drikpanchang.com samvatsara-year pairs (e.g. VS2081=Pingala, VS2082=Kalayukta,
  VS2083=Siddharthi — solve for the correct offset/starting index of `SAMVATSARA_60`/
  `SAMVATSARA_NAMES` that produces these three in sequence). Separately, for Kannada and Telugu
  specifically, change the samvatsara-name lookup to key off `ssYear` (Shaka) rather than `vsYear`
  (Vikram), since that's the era actually displayed alongside it on those two pages. Verify by
  re-checking Tamil/Marathi/Kannada/Telugu (and the homepage, if it shares the bug) against
  drikpanchang.com for the current date and 1-2 other dates spanning a Samvatsara-name rollover.

### Issue #17: Bengali/Assamese Bangabda year computation has an unreachable dead-code branch — will show the wrong year for ~3.5 months every year (not visible on the 2026-07-23 test date)
- Severity: minor (latent bug, not observed live — flagged via code audit)
- Description: `getYear(sunSidereal, gregYear)` computes
  `const num = sunRashiIdx >= 0 ? gregYear - 593 : gregYear - 594;` where
  `sunRashiIdx = Math.floor(sunSidereal/30)`, which is always in `[0,11]` since sidereal longitude
  is always 0-360° — so the `sunRashiIdx >= 0` branch is unconditionally true, and the intended
  "before Poila Boishakh, use last year's count" logic (the `gregYear - 594` branch) is dead code.
  On 2026-07-23 (post-Boishakh, Sun in Karka) the always-true branch happens to give the correct
  answer (1433) anyway, so this didn't surface in live testing on this date — but for e.g.
  2026-02-01 (Sun in Makara, still pre-Boishakh), the code would still return 1433 when the
  correct Bangabda is 1432. Assamese's `getYear()` has the identical defect
  (`gregYear - 593` unconditionally, no branch attempted at all).
- Fix prompt: >
  In `panchang-i18n.ts`'s Bengali and Assamese `getYear()` functions, replace the broken
  `sunRashiIdx >= 0` condition with an actual Poila Boishakh boundary check (e.g. compare the
  current date/tithi against the Mesha Sankranti date for the year, or use whatever date-based
  signal the rest of the file uses for other traditions' New Year rollovers) so the year decrements
  correctly before the Bengali New Year and increments after it. Verify specifically on a date
  between January 1 and mid-April (e.g. 2026-02-01 and 2027-02-01) — this is the one window where
  the bug is actually visible; testing only the current date will not catch it.

**Clean (verified against drikpanchang.com/general Sun-Rashi cross-check for 2026-07-23):**
Regional preview hub (`/panchang/regional` — all 11 cards, links, and calendar-system callouts);
Tamil month/Tithi/Nakshatra (Aadi, Shukla Navami, Vishakha); Bengali month/Tithi/Nakshatra
(Shravan); Nepali (month Saun/Shrawan, BS year 2083, Tithi/Nakshatra) — no independent
Nepali-specific source found, cross-checked via the general BS-epoch formula and Sun-Rashi
agreement across traditions instead; the previously-fixed "6 traditions show wrong current month"
bug (mr/gu/kn/te/or/iskcon) confirmed still fixed, no regression; all 8 spot-checked traditions
load without console errors and show plausible July 2026 months.

**Not independently exercised (source-code inference only, no browser automation available this
batch):** language toggle on regional pages — traced to use the same `data-hi`/`data-en` +
`langchange` pattern as the rest of the site, low risk but not a live-observed pass.

---

## Batch 6: Festivals hub + representative detail pages

### Issue #18: Festivals hub computes a "recently celebrated" `past` festivals array but never renders it — `/festivals`
- Severity: minor (dead code / unfinished feature)
- Description: `src/pages/festivals.astro` (~line 10) defines `const past = ...` (recently-passed
  festivals, sorted descending, sliced to 6) but the variable is never referenced anywhere else in
  the template — the hub only ever shows upcoming festivals grouped by month.
- Fix prompt: >
  Either wire a "Recently Celebrated" section into `festivals.astro` using the existing `past`
  array (decide placement/styling to match the rest of the hub), or delete the dead `past`
  computation if it was abandoned intentionally. Verify by loading `/festivals` and confirming
  either the new section renders sensible recent festivals, or that the unused variable is gone.

### Issue #19: Festivals hub's Hindi toggle only translates the hero heading and festival names — everything else stays in English — `/festivals`
- Severity: minor (i18n gap)
- Description: `festivals.astro`'s `langchange` listener only toggles `.en-text`/`.hi-text`
  elements; it never applies the generic `[data-hi]` attribute swap that 44 other files across
  `src/` use (including `festivals/[slug].astro`, `events/index.astro`, `rashifal/index.astro`).
  As a result, month headers, weekday labels, descriptions, type badges (Major/Vrat/Regional), and
  countdown badges ("Today"/"Tomorrow"/"X days away") don't translate.
- Fix prompt: >
  In `src/pages/festivals.astro`'s language-toggle script, add the same generic `[data-hi]` swap
  used elsewhere on the site (find the exact pattern in e.g. `events/index.astro` or
  `rashifal/index.astro` and replicate it), and add `data-hi` attributes to the untranslated
  strings (month/weekday labels, descriptions, badges) if they don't already have them. Verify by
  toggling to Hindi on `/festivals` and confirming month headers, badges, and countdown text all
  switch, not just the hero and festival names.

### Issue #20: Jaya Ekadashi 2025 and 2026 entries have wrong dates — one isn't an Ekadashi at all, the other is actually a different Ekadashi — `festivals/jaya-ekadashi-2025`, `festivals/jaya-ekadashi-2026`

**FIXED — verified (commit `ab6ea5f`).** Dates corrected `2025-02-12`→`2025-02-08`,
`2026-02-13`→`2026-01-29`; 2026 `longDesc` Paksha wording reconciled to Shukla Paksha (matching
2025's). Slug generation unaffected (dynamic, not hardcoded).
- Severity: major
- Description: `festivals.ts`'s Jaya Ekadashi entries (line ~18 for 2025, ~50 for 2026) are wrong.
  2025-02-12 is not an Ekadashi day at all. 2026-02-13 is actually Vijaya Ekadashi, not Jaya
  Ekadashi. The real Jaya Ekadashi dates are 2025-02-08 and 2026-01-29 (currently missing from the
  site). The two entries are also internally inconsistent with each other: the 2025 entry's
  `longDesc` says "Shukla Paksha... of Magha" while the 2026 entry's `longDesc` says "Krishna
  Paksha... of Magha" for the supposedly same festival — suggesting the underlying Ekadashi was
  swapped/confused during data entry.
- Evidence: Cross-checked via WebSearch against drikpanchang-sourced results — Jaya Ekadashi 2025 =
  Feb 8, 2025 (nearest actual Feb 2025 Ekadashi to the site's Feb 12 date is Vijaya Ekadashi, Feb
  24; Feb 12 itself isn't an Ekadashi). Jaya Ekadashi 2026 = Jan 29, 2026; Feb 13, 2026 is Vijaya
  Ekadashi (Krishna Paksha, Phalguna).
- Fix prompt: >
  In `src/lib/festivals.ts`, correct the Jaya Ekadashi 2025 entry's date from `2025-02-12` to
  `2025-02-08`, and the 2026 entry's date from `2026-02-13` to `2026-01-29`. Reconcile the
  `longDesc`/`longDescHi` Paksha wording (Jaya Ekadashi is Shukla Paksha of Magha) for both years
  so they're consistent with each other. Verify against drikpanchang.com's Ekadashi calendar for
  2025 and 2026 after the fix, and check whether Vijaya Ekadashi (a separate festival, currently
  not represented at its correct dates either) should be added as its own entry.

**Clean (verified):** Slug generation/resolution across 9 spot-checked festivals (2025/2026/2027,
all 3 types) — date/description/longDesc match `festivals.ts` exactly; countdown math ("X days
away/ago") hand-verified for 7 festivals, all correct; prev/next chronological navigation; type
badges; icons/gradients (no broken-asset risk, no `<img>` tags); Basant Panchami 2026-01-23
independently re-verified correct.

**Content note, not flagged as a defect:** Dev Uthani Ekadashi is typed `'major'` rather than
`'vrat'` despite being an Ekadashi fast like the others — inconsistent taxonomy, possibly an
intentional editorial choice given its pan-India significance; not queued as a fix unless the
project wants taxonomy consistency.

---

## Batch 7: Jyotish A (Kundali, Janma Kundali, Horoscope Match)

### Issue #21: Horoscope Match's Nadi Kuta lookup table is wrong for ~10 of 27 nakshatras, producing a false "Nadi Dosha" on the page's own default example — `/jyotish/horoscope-match`

**FIXED — verified (commit `aeeec5e`).** `NADI` array replaced with the correct standard
Adi/Madhya/Antya grouping for all 27 nakshatras. Default example (Uttara Ashadha vs Bharani) now
scores 8/8, no false Nadi Dosha.
- Severity: major (borderline blocker — Nadi is the single highest-weighted kuta (8 of 36 points)
  and the bug is visible on the page's default pre-filled example, the first thing a visitor sees)
- Description: The `NADI` array (`horoscope-match.astro` ~line 83) miscodes several nakshatras'
  Adi/Madhya/Antya grouping — verified against the standard grouping (indices 11, 14-20, 24-25 are
  wrong).
- Evidence: Default example (Boy 1995-06-15 New Delhi, Moon in Uttara Ashadha; Girl 1997-09-20 New
  Delhi, Moon in Bharani) — correct Nadi pairing is Antya vs Madhya (different → full 8/8, no
  dosha), but the page's array miscodes Uttara Ashadha as Madhya, colliding with Bharani, showing
  0/8 and a false "⚠ Nadi Dosha present" warning — an 8-point swing (22/36 shown vs. 30/36 correct)
  on the default example.
- Fix prompt: >
  In `src/pages/jyotish/horoscope-match.astro`, replace the `NADI` array (~line 83) with the
  correct standard Adi/Madhya/Antya grouping for all 27 nakshatras (verify against a classical
  Ashtakoot reference, e.g. cross-check several nakshatras against astroyogi.com or a similar
  documented source). Verify by re-running the page's own default example — Nadi should score 8/8
  with no dosha warning, per the corrected Antya-vs-Madhya pairing.

### Issue #22: Horoscope Match's Gana Kuta gives 1 point for Deva-Rakshasa pairing; the standard table gives 0 (the most incompatible combination) — `/jyotish/horoscope-match`
- Severity: minor
- Evidence/cause: `kGana()` (~line 112), the `pair==='02'` branch — verified against the classical
  Gana Kuta table.
- Fix prompt: >
  In `kGana()` (~line 112), change the Deva-Rakshasa (`pair==='02'`) branch to award 0 points
  instead of 1. Verify against a classical Gana Kuta reference table (Deva/Deva=6, Deva/Manushya=5,
  Deva/Rakshasa=0, etc.) for a couple of other pairings too, to catch any sibling errors in the
  same function.

### Issue #23: Horoscope Match's Graha Maitri (planetary friendship) matrix has 2 wrong cells — `/jyotish/horoscope-match`
- Severity: minor
- Evidence/cause: `PLT_FRIEND` array (~line 90) — Mars→Moon coded neutral (should be friend),
  Saturn→Mars coded neutral (should be enemy), per the classical Naisargika Maitri table.
- Fix prompt: >
  Correct the `PLT_FRIEND` matrix (~line 90) so Mars→Moon = friend and Saturn→Mars = enemy, cross-
  checking the full 7×7 classical Naisargika Maitri table (not just these 2 cells, in case there
  are other sibling errors) while making the change.

### Issue #24: Kundali/Janma Kundali/Horoscope Match each duplicate their own hardcoded 15-city location list instead of importing the shared 162-city `src/lib/locations.ts` — `/jyotish/kundali`, `/jyotish/janma-kundali`, `/jyotish/horoscope-match`
- Severity: content (usability gap, not a correctness bug — the 15 cities that do exist compute
  correctly)
- Description: All 3 pages duplicate the same small city list verbatim, with no Southern
  Hemisphere option and far fewer choices than the site's own 162-city database.
- Fix prompt: >
  Replace each page's inline 15-city array with an import from `src/lib/locations.ts`, using
  whatever city-picker UI pattern is already used on pages that do this correctly (e.g. the
  homepage's `LocationPicker.astro`). Verify by confirming all 3 pages' city dropdowns now list all
  162 cities and produce correct calculations for a non-Indian/Southern-Hemisphere city.
  **Confirmed (Batch 8) the same identical 15-city `LOCS` list is also duplicated in
  `/jyotish/rashi`, `/jyotish/sunsign`, `/jyotish/nakshatra`, and `/jyotish/lagna` — this is a
  site-wide pattern across most/all jyotish calculators, not limited to the 3 pages originally
  found. Worth doing as one consolidated fix across all affected pages rather than one at a time.

**Clean (verified):** Sun/Moon/Nakshatra on Kundali Generator (New Delhi 1990-05-15 14:30 IST,
matched drikpanchang.com exactly); planetary dignity tables (exaltation/debilitation/own-sign) on
Janma Kundali; Vimshottari Dasha nakshatra→lord cycle, 120-year total, and proportional-consumption
formula (internally verified only — no third-party calculator could be reached via automated fetch
for an external cross-check, flagging as a gap rather than a pass); Yoni/Varna/Vashya-direction/
Tara/Bhakoot kutas on Horoscope Match; no console-error/undefined-function issues on any of the 3
pages.

---

## Batch 8: Jyotish B (Rashi, Sun Sign, Nakshatra, Lagna)

No new issues. Confirmed Issue #9 (`calcLagna()` ~180° jump bug) reproduces directly on the
dedicated `/jyotish/lagna` calculator — see Issue #9's "CONFIRMED SPREAD (Batch 8)" note above.
Confirmed Issue #24 (duplicated 15-city location list) also present on all 4 pages in this batch —
see Issue #24's note above. Rashi, Sun Sign, and Nakshatra calculators: clean — all three import
their ephemeris math from `src/lib/panchang.ts` (no duplicated/stale code), sign/nakshatra/pada
boundary math verified correct, Western tropical date ranges for Sun Sign are internally
contiguous with no gaps/overlaps, icon-key mappings verified complete. Not exercised in an actual
browser (no Playwright available for this batch) — findings are from direct source tracing plus a
standalone Node reproduction of `calcLagna()` against the real `astronomy-engine` package; no
console-error check was possible for these 4 pages specifically.

---

## Batch 9: Jyotish C (Mangal Dosha, Kalasarpa Yoga, Sadesati)

### Issue #25: Kalasarpa Yoga "type" (Ananta/Kulika/Vasuki/etc.) is derived from Rahu's raw zodiac sign instead of the house Rahu occupies from the Lagna — only correct for an Aries-Lagna person, wrong type/effects/remedies text for everyone else — `/jyotish/kalasarpa`

**FIXED — verified (commit `7076c53`).** Now imports `calcLagna` (fixed in Batch 1/Issue #9),
computes Rahu's house from the Lagna, indexes `KALASARPA_TYPES`/`KS_EFFECTS`/`KS_EFFECTS_HI` by
house instead of raw sign. Same date/place/Rahu-sign with 3 different birth times → 3 different
Lagnas → type now correctly varies (Padma / Ananta / Karkotak) vs. the old fixed "Vishadhar"
regardless of Lagna.
- Severity: major
- Description: `kalasarpa.astro` (~lines 130-131) computes
  `rahuSign = Math.floor(rahu/30); type = KALASARPA_TYPES[rahuSign]` — but classical Kalasarpa
  typing is based on the house Rahu occupies counted from the Ascendant (Ananta = Rahu in 1st house
  from Lagna, Kulika = 2nd, Vasuki = 3rd, etc. per drikpanchang.com's own Kalasarpa Yoga
  explainer), not the raw sign Rahu happens to be in. The page never computes or imports a Lagna
  at all, so it can't do this correctly as currently written.
- Evidence: As coded, the displayed type is only correct for a person with Mesha (Aries) Lagna —
  everyone else gets a mislabeled type and correspondingly wrong effects/remedies text. Core
  "all planets on one side of the Rahu-Ketu axis" detection itself tested clean across 3 varied
  birth inputs (correctly reported "No Kalasarpa" with accurate planet counts in every case
  sampled — didn't hit a natural "present" case, so the Anuloma/Viloma-direction and
  conjunct-partial code paths weren't exercised live, though they read correctly on inspection).
- Fix prompt: >
  In `src/pages/jyotish/kalasarpa.astro`, import `calcLagna` (once Issue #9 is fixed — otherwise
  this fix would inherit that bug) and compute the house Rahu occupies from the Lagna
  (`((rahuSign - lagnaSign + 12) % 12) + 1`), then index `KALASARPA_TYPES` by that house number
  instead of the raw `rahuSign`. Verify against drikpanchang.com's Kalasarpa type definitions
  (Ananta=house 1, Kulika=2, Vasuki=3, Shankhapala=4, Padma=5, Mahapadma=6, Takshaka=7, Karkotaka=8,
  Shankhachuda=9, Ghataka=10, Vishakta=11, Sheshanaga=12) for 2-3 birth charts with different
  Lagnas, confirming the type now varies correctly with Lagna rather than being fixed by Rahu's
  sign alone.

**CONFIRMED SPREAD (Batch 10):** `calcLagna()` (Issue #9) is also used for the "Lagna Lord"
primary gemstone pick on `/jyotish/gemstone` (line ~107) and the Birth-Details mode of
`/jyotish/rudraksha` (line ~194, its "By Rashi/Lagna" quick-select mode bypasses `calcLagna()` and
is unaffected). Both will occasionally recommend the wrong primary gem/mukhi for birth times that
land in the bug's discontinuity window. `/jyotish/pancha-pakshi` does NOT call `calcLagna()`
(uses only birth Moon-nakshatra + sunrise/sunset) and is confirmed unaffected.

**Clean (verified):** Mangal Dosha's house-counting arithmetic (`getHouse()`, from Moon/Venus
references) hand-verified correct for 3 varied birth inputs; own-sign/exaltation/weak-sign
detection for Mars, Guru/Moon-conjunction cancellation, severity tiers, remedies — all clean.
Kalasarpa's core axis-detection logic (see Issue #25). Sadesati — fully clean, correctly identifies
12th/1st/2nd-from-Moon Saturn transit using the real current Saturn position (Meena, 2025-2027),
verified against the well-known Meena/Mesha/Kumbha-Moon Sadesati rule for this transit window
across 12+ Moon-sign test cases. No console errors on any of the 3 pages. All 3 duplicate the same
15-city location list — same as Issue #24 (now confirmed on 8 of the ~15 jyotish calculators
tested so far).

---

## Batch 10: Jyotish D (Gemstone, Rudraksha, Pancha Pakshi, Shraddha, Sahasra Chandrodaya)

### Issue #26: Pancha Pakshi's night-period ruling-bird sequence uses an unexplained "+2" offset instead of continuing the day sequence — `/jyotish/pancha-pakshi`
- Severity: minor
- Description: `makePeriods()` computes day-period ruling birds as `(dayBird+i)%5` for i=0..4 (a
  smooth +1 progression), but night periods restart at `(dayBird+i+2)%5` — a magic `nightOffset=2`
  constant with no source comment justifying it, breaking what would otherwise be a continuous
  +1 sequence across the day/night boundary. Could not confirm against an external Pancha Pakshi
  Shastra reference whether a jump is actually correct here (niche system, no authoritative source
  found) — flagging as an internal-consistency oddity worth double-checking against a real
  Pancha Pakshi text rather than a confirmed defect.
- Fix prompt: >
  Find an authoritative Pancha Pakshi Shastra reference for how the ruling bird sequence is meant
  to continue from the last day-period into the first night-period, and either justify the
  `nightOffset=2` constant with a source comment in `pancha-pakshi.astro`'s `makePeriods()` call
  site, or correct it to whatever the real rule is. Verify against that source, not just internal
  consistency.

**Clean (verified):** Gemstone's planet→gemstone table (Ruby=Sun, Pearl=Moon, Red Coral=Mars,
Emerald=Mercury, Yellow Sapphire=Jupiter, Diamond=Venus, Blue Sapphire=Saturn) and rashi-lord
table match standard references. Rudraksha's 14-mukhi→deity/planet table matches commonly-cited
references. Shraddha Tithi — regression spot-check only (per scope, not a full re-verification):
source unchanged since the documented 2026-07-21 Aparahna-Kaal fix, logic matches CLAUDE.md's
description exactly. Sahasra Chandrodaya — core math verified correct (synodic month constant
29.530589 days, full-moon-crossing detection, 999-cycle offset from first post-birth full moon,
past/future progress-bar branches), default seed date's ~80y9m milestone consistent with the
expected ~80.8-year estimate. No console-error-class defects (undefined functions/ids) on any of
the 5 pages. All duplicate the 15-city location list except Pancha Pakshi/Shraddha/Sahasra
Chandrodaya (no location input needed) — same pattern as Issue #24.

---

## Batch 11: Planets (planetary-positions, rahu-ketu, shani, gochara)

No issues found — fully clean batch. All 4 pages: no console/compile errors, all imports resolve
to real shared exports (no stale-duplicate divergence between the 3 pages' shared Gochara
favorable-house tables), `setInterval(...,60000)` confirmed wired to actual DOM re-render (not
silent), location-independence confirmed (no lat/lng dependency). Sun/Moon sidereal positions for
2026-07-23 verified against drikpanchang.com almost to the minute. Saturn's current Meena position
consistent with prior-batch confirmation. Not affected by Issue #9 (`calcLagna` bug) — none of
these 4 pages compute or display a Lagna/Ascendant.

**Content note, not a defect:** `/planets/rahu-ketu` and `/planets/shani` are titled around
"Transit" but don't surface an explicit next-transit date in the UI (only current sign + Gochara
table) — independently computed next-transit dates via the site's own formulas (Rahu ≈ 2026-12-06,
Saturn Pisces→Aries ≈ 2027-06-03) both closely matched real-world Vedic transit calendars, so the
underlying math is fine; this is purely a "could add a UI field" observation, not queued as a fix.

---

## Batch 12: Rashifal

### Issue #27: "Find Rashi by Name" tool's lookup table is missing several starting-sounds that the site's own rashi data claims belong to that rashi, causing valid names to fail to resolve — `/rashifal`, homepage widget (`RashifalFeed.astro`)
- Severity: major
- Description: `NAME_MAP` (duplicated identically in `src/components/RashifalFeed.astro` ~lines
  170-184 and `src/pages/rashifal/index.astro` ~lines 166-179) has drifted out of sync with the
  canonical `nameLetters` arrays in `src/lib/rashifal.ts` that it's supposed to mirror — a third
  copy, `getRashiByNameLetter`/`NAME_LETTER_MAP` in `rashifal.ts` itself, is exported but never
  imported/used anywhere, so nothing enforces consistency.
- Evidence: Karka's `nameLetters` (rashifal.ts line ~194, shown verbatim on `/rashifal/karka`'s
  sidebar) = `["Hi","Hu","He","Ho","Da","Di","Du","De","Do"]`, but `NAME_MAP` only contains
  `hi,hu,he,ho` for Karka — `da/di/du/de/do` are entirely absent. Tracing `findByName("Deepak")` →
  tries "dee","de","d" → no match → tool shows "Could not determine Rashi from this name," despite
  Karka's own page listing "De" as a valid name-letter. Same gap affects "Dinesh," "Dev," "Durga,"
  and Mesha's bare "A" (so "Amit"/"Anjali" also fail).
- Fix prompt: >
  Delete the duplicated `NAME_MAP` in both `RashifalFeed.astro` and `rashifal/index.astro`, and
  have both import and use the existing `getRashiByNameLetter`/`NAME_LETTER_MAP` from
  `src/lib/rashifal.ts` instead — that's the single already-existing correct-by-construction
  source (since it's built from the same `nameLetters` arrays shown on each rashi's detail page).
  Verify by testing "Deepak," "Amit," and a few other previously-failing names now resolve to
  Karka/Mesha respectively.

### Issue #28: "Find Rashi by Name" silently returns only one rashi for starting-sounds that the site's own data assigns to multiple rashis, with no indication of ambiguity — `/rashifal`, homepage widget
- Severity: minor
- Description: Several starting-sounds appear in more than one rashi's canonical `nameLetters`
  array (e.g. "Ta/Ti/Tu/Te" in both Simha and Tula; "Na" in Kanya, Vrishchika, and Meena; "To" in
  Kanya and Vrishchika; "Cha" in Mithuna and Meena), but `NAME_MAP` hardcodes exactly one winner
  per key, so e.g. "Tanvi" always resolves to Simha even though Tula's own page also lists "Ta" as
  a valid letter for it. The 3-way "Da"/"Na" collisions in particular look like data-entry
  duplication in the source `nameLetters` arrays rather than authentic astrological overlap.
- Fix prompt: >
  First audit `nameLetters` in `src/lib/rashifal.ts` for the flagged collisions (Da, Na, To, Cha,
  Ta/Ti/Tu/Te) against a traditional Vedic naming-syllable reference and remove any that are
  data-entry duplicates rather than genuine overlaps. For syllables that do genuinely belong to
  multiple rashis in the tradition, either have the tool present all matching rashis instead of
  silently picking one, or document the tie-break rule. Verify by re-testing the specific names
  mentioned in the evidence above.

**Clean (verified):** "Find Rashi by Birth Date" — contiguous, non-overlapping sidereal date
ranges across all 12 rashis (including the Dhanu Dec-Jan year-wrap case), correctly labeled as
Sun-sign (Surya Rashi) rather than falsely claiming to be the Moon-based Janma Rashi; 3 hand-tested
dates each resolved to a distinct, correct rashi. Rashi detail pages (Mesha/Simha/Kumbha) — all 4
period tabs (Daily/Weekly/Monthly/Yearly) show genuinely distinct pre-rendered content, not a
cosmetic-only toggle; prev/next navigation correct. Rashifal hub grid, period tabs, and Prashnavali
CTA link (resolves to a real page).

**Content notes, not queued as fixes (low confidence / out of strict scope):** the homepage
widget's birth-date tool omits the "Sun-sign, not Moon-sign" clarifying sentence that `/rashifal`
itself shows — same underlying tool, just missing the caveat text in one of its two locations.
Both `rashifal/index.astro` and `rashifal/[rashi].astro` compute `today = new Date()` independently
in frontmatter rather than receiving it as a prop — on a static build (`output: 'static'`) this
bakes in the build-time date until the next deploy, the same general staleness pattern partially
addressed elsewhere per commit `a6707b7`; not verified against an actual production build, flagging
for awareness only.

---

## Batch 13: Prashnavali oracle

### Issue #29: `PRASHNAVALI_ANSWERS` has only 100 entries, not the 108 the site's own hero copy and CLAUDE.md both claim — `/prashnavali`
- Severity: content
- Description: `src/lib/rashifal.ts` (~lines 719-818) has exactly 100 unique answers (verified
  programmatically, zero duplicates). The page's footer note is internally consistent (it computes
  "Prashnavali contains 100 cosmic answers" dynamically from `.length`), but the hero copy
  ("Prashnavali offers 108 cosmic answers") and CLAUDE.md both still claim 108.
- Fix prompt: >
  Either write 8 more distinct answers to bring `PRASHNAVALI_ANSWERS` up to the intended 108 (and
  update CLAUDE.md's Feature #6 description if it still says 108 once this is done), or change the
  hero copy's hardcoded "108" to reference the dynamic `.length` the same way the footer already
  does, so the two numbers can't drift apart again. Verify by re-reading the hero text after the
  fix and confirming it matches `PRASHNAVALI_ANSWERS.length`.

### Issue #30: "Choose Your Number" mode's grid goes 1-108 but the answer array only has 100 entries — numbers 101-108 silently reveal a blank answer instead of an error or being disabled — `/prashnavali`

**FIXED — verified (commit `8db925a`).** Loop bound changed from hardcoded `108` to
`answers.length`. Grid now renders exactly 100 numbers (matching `PRASHNAVALI_ANSWERS.length`),
every visible number produces a real answer. Will auto-scale to 108 once Issue #29's content work
is done.
- Severity: major
- Description: `prashnavali.astro`'s number-grid loop (~line 161) hardcodes
  `for (let i = 1; i <= 108; i++)` independent of `answers.length` (100), and the click handler
  does `answers[i - 1]` with no bounds check, so `answers[100..107]` is `undefined` and
  `oracleAnswer.textContent = undefined` renders as silently empty text — a broken-feeling
  experience (a user picks number 105, clicks, and gets a blank card) rather than a clear error.
- Evidence: Clicking number buttons 101, 105, and 108 each produced an empty `oracle-answer`
  textContent. Numbers 99 and 100 correctly returned real answers.
- Fix prompt: >
  In `prashnavali.astro`, change the number-grid loop to `for (let i = 1; i <= answers.length; i++)`
  so it always matches the actual array size (this also automatically fixes itself once Issue #29
  brings the array to 108). Verify by confirming the grid shows exactly as many numbers as
  `PRASHNAVALI_ANSWERS.length` and every visible number produces a real answer, with no numbers
  past the array's length rendered at all.

**Clean (verified):** Random "Touch the Oracle" reveal — 9 distinct, non-empty, well-distributed
answers across repeated clicks, no repeats, no console errors. Rapid/repeated-click stress test
(5 synchronous clicks, 5 ask-again cycles, double-click during reveal) — no stuck UI state, guard
flag correctly prevents re-entrant reveals. Language toggle — correctly swaps all text including
button labels. No question-input field exists (by design — the page is a meditative framing
device, not a text-entry oracle, matching its own instructional copy).

---

## Batch 14: Devotional library

### Issue #31: `transliteration` field is truncated with a literal placeholder string across most/all Chalisa, Stotram, and Ashtakam entries, and several Namavali lists — the complete text exists in Devanagari but the transliteration was never fully authored — `/devotional/chalisa/*`, `/stotram/*`, `/ashtakam/*`, `/namavali/*`
- Severity: content
- Description: All 15 Chalisa entries, all 15 Stotram entries, ~10 of 11 Ashtakam entries, and 5+
  of 10 checked Namavali lists have a `transliteration` field that cuts off mid-text with a literal
  "... (continuing through all N verses/names) ..." placeholder, even though the corresponding
  Devanagari `lyricsHi` field is complete. Two Stotram entries (`vishnu-sahasranama`,
  `lalita-sahasranama`) have the same placeholder leaking into the Hindi *meaning* field too, not
  just transliteration. Aarti and Mantra categories were checked and are clean (no placeholder
  pattern) — this appears specific to how the longer-form categories were bulk-authored.
- Evidence: Confirmed live on `/devotional/chalisa/hanuman-chalisa` (and structurally present
  across the other categories per the counts above).
- Fix prompt: >
  For each affected entry (start with the highest-traffic ones — Hanuman Chalisa, other popular
  Chalisas/Stotrams), write out the complete transliteration to match the full `lyricsHi` text,
  removing the "(continuing through all N verses/names)" placeholder. For the 2 Stotram entries
  with the placeholder in the meaning field specifically, write the actual meaning/significance
  text instead. This is a large content-authoring task (many entries across 4 categories) — worth
  scoping as its own project rather than a single quick fix; verify progress by grepping for the
  literal placeholder string across `src/lib/devotional/*.ts` and confirming it reaches zero
  matches once complete.

**Clean (verified):** Devotional hub (`/devotional`) — all 10 built categories render correctly,
links work, Nama Ramayanam correctly shows "Coming Soon". All 10 category index-grid pages return
HTTP 200. Sundarkand — 301 redirect works, all 60 dohas verified sequential with zero gaps/dupes.
Durga Saptashati — all 13 chapters' colophon totals are internally consistent and cumulative,
ending at exactly 700 verses ("Saptashati"), no truncation/duplication detected. Prev/next
navigation on Chalisa and Durga Saptashati detail pages. No blocker/major functional bugs in this
batch — everything found is content-only.

---

## Batch 15: Blog, About, Contact, Privacy, Terms, footer links

### Issue #32: Footer has no link to `/blog` in any of its 4 columns — `src/layouts/Layout.astro`
- Severity: minor
- Description: `/blog` is present in Header's desktop dropdown, mobile drawer, and `searchItems`
  (all 3 nav-sync locations per the project's own established convention), but was never added to
  any of the footer's 4 columns (Panchang, Jyotish, Company, brand blurb) — likely missed when the
  Blog section was added.
- Fix prompt: >
  Add a "Blog" link to the most appropriate footer column in `src/layouts/Layout.astro` (likely
  "Company" or a new entry alongside "Today"/"Calendar"/"Festivals"). Verify by loading any page
  and confirming the footer now links to `/blog`.

**Clean (verified):** Blog hub (`/blog`) — lists all 6 posts (see count-correction note below)
sorted newest-first. All 6 individual blog posts — every internal link across all posts'
`contentHtml` resolves to a real route (verified via full-file grep against `src/pages/**`, no
typos/dead links found); external link spot-checks are well-formed; Hindi `contentHtmlHi` spot-
checked on 2 posts with proper Devanagari, no encoding artifacts, links preserved in the Hindi
variant too. About/Contact/Privacy/Terms — all load cleanly, Contact's embedded Google Form iframe
is well-formed (submission is entirely Google-side, no PanchangPath error path to break). All
other footer links (`/`, `/calendar`, `/festivals`, `/muhurta`, `/rashifal` + 2 sample rashi pages,
`/prashnavali`, `/about`, `/contact`, `/privacy`, `/terms`) resolve correctly.

**Inventory correction:** `qa-audit/INVENTORY.md`'s Phase A count of "7 blog posts" was wrong —
the grep used to count them matched the `BlogPost` interface's own `publishDate:` field as a 7th
"post." There are actually 6 posts in `BLOG_POSTS`, all accounted for above. INVENTORY.md has been
corrected.

---

## Batch 16: Global link/button sweep (final batch)

### Issue #33: "Vrat Calendar" nav link exists in the desktop dropdown and mobile drawer but has no corresponding entry in `searchItems` — `Header.astro`
- Severity: minor
- Description: `/festivals?filter=vrat` ("Vrat Calendar") appears in both the desktop dropdown and
  mobile drawer, but was never added to the `searchItems` array — breaking the project's own
  documented 3-way nav-sync convention. The link itself works fine (the `?filter=vrat` deep-link
  handler exists and works in `FestivalFeed.astro`); it's only missing from site search.
- Fix prompt: >
  Add a `{ label: "Vrat Calendar", url: "/festivals?filter=vrat" }` entry to the `searchItems`
  array in `Header.astro`, matching the existing dropdown/drawer entry. Verify by searching "vrat"
  in the site search box and confirming it now appears in results.

### Issue #34: "Others" nav-category's top-level link points to the homepage instead of anything Others-related — `Header.astro`
- Severity: minor / content
- Description: The "Others" desktop nav-cat `<a>` wrapper (~line 217) has `href="/"` — clicking the
  label itself (rather than hovering for the dropdown) navigates to the homepage. Every other
  nav-cat links to its own relevant hub page (`/muhurta`, `/festivals`, `/jyotish`, `/devotional`,
  `/planets/planetary-positions`). Looks like a copy-paste artifact from the "Panchang" nav item,
  where `href="/"` is actually correct.
- Fix prompt: >
  Change the "Others" nav-cat's top-level `href` to something more relevant — e.g. its first
  dropdown item's URL, or remove the link entirely if "Others" is meant to be a hover-only category
  label with no independent destination. Verify by clicking the "Others" label directly (not a
  dropdown item) and confirming it goes somewhere sensible.

**Clean (verified):** Desktop dropdown vs. mobile drawer — identical href sets, zero differences.
All 205 unique hrefs across all 3 Header lists (desktop dropdown/mobile drawer/`searchItems`)
resolve to real routes in `src/pages/**` — zero broken/typo'd links found. 404 and 500 pages —
both render via the shared `ErrorState.astro` shell, return correct HTTP status, working "Back to
Home" links, no broken assets. `robots.txt` allows all and correctly points to
`panchangpath.com/sitemap-index.xml`; `astro.config.mjs`'s `site` matches the real domain and the
`@astrojs/sitemap` integration is registered (sitemap files are build-time-only, expected to 404 in
`astro dev`). `FestivalFeed.astro`/`PlanetaryEventsFeed.astro` "View All" and per-card dynamic
links all resolve correctly.

---

## Fix-phase-discovered issues (found while fixing, not part of the original 16-batch audit)

### Issue #35: Muhurta scoring's fixed daily snapshot time can miss a Sankranti crossing that happens later the same day — `/muhurta/griha-pravesh`, `/muhurta/vivah`, likely other muhurta finders
- Severity: minor (latent, narrow window — surfaced as a residual on Issue #13's fix)
- Description: `griha-pravesh.astro`/`vivah.astro` (and likely sibling muhurta finders using the
  same pattern) evaluate Sun/Moon position once per candidate date at a fixed IST-equivalent 6 AM
  snapshot. On a day where a Sankranti (Sun rashi change) actually occurs later that same day, the
  snapshot evaluates the OLD rashi, so the gate that depends on the new rashi (Kharmas/Chaturmas)
  doesn't fire until the following day.
- Evidence: found while verifying Issue #13's Chaturmas gate — 2026-08-17 (actual Simha Sankranti
  2026, ~7:30 AM IST per the Issue #6 fix) still scored 12/Excellent on Griha Pravesh because the
  6 AM snapshot is ~90 min before the crossing. The pre-existing Kharmas gate in both files likely
  has the same blind spot on its own transition days each year.
- Fix prompt: not yet scoped — would need each muhurta finder to evaluate Sun/Moon position at
  actual local sunrise (or check both start-of-day and end-of-day rashi) rather than a fixed
  6 AM IST snapshot, for any gate keyed to a Sankranti-style boundary. Worth a dedicated look
  across all muhurta finders that use this snapshot pattern before fixing, rather than patching
  one file at a time.

---
