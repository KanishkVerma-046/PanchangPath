# Data/Content Correctness Findings — 2026-07-14

Task 8 of the full-site audit: manual/investigative pass covering documented-but-unfixed
bugs, the two CLI checkers built in Tasks 4–5, a stale-marker scan, and an astronomy
spot-check against drikpanchang.com. Report-only — no `src/` files were modified.

---

## Festival Ordering

Command: `node scripts/audit/run-festival-check.mjs`

```
1 violation(s):
  [2025] Narak Chaturdashi (2025-10-21) should precede Diwali (2025-10-20) but does not
```

Matches the already-documented, still-open CLAUDE.md bullet ("2025 Narak Chaturdashi date
may be wrong"). No new violations found. Only one violation total, same one already known.

---

## Header Nav Sync

Command: `node scripts/audit/run-nav-sync.mjs`

144 URL(s) reported not present in all three nav surfaces (desktop dropdown / mobile drawer
/ `searchItems`). Full raw output was reviewed; not reproduced verbatim here (see the
"pattern" breakdown below) since it is almost entirely one repeating shape, but every
distinct pattern was manually verified against `src/components/Header.astro`.

**Pattern 1 — 140 of 144: devotional detail pages, `search:true` / `desktop:false` /
`drawer:false`.** Every individual Aarti, Chalisa, Stotram, Ashtakam, Mantra, Namavali,
Puja Vidhi, Vrat Katha, Yantra, and Durga Saptashati chapter page (e.g.
`/devotional/aarti/om-jai-jagdish-hare`, `/devotional/chalisa/hanuman-chalisa`,
`/devotional/durga-saptashati/chapter-1-madhu-kaitabha-vadha`) is in `searchItems` but not
in the desktop dropdown or mobile drawer. **Verified as a false positive / intentional
design, not a bug**: the desktop dropdown and drawer only link to the 11 devotional
*category index* pages (`/devotional/aarti`, `/devotional/chalisa`, etc. — confirmed at
Header.astro:201–213 desktop, 369–380 drawer), while `searchItems` deliberately includes
all ~140 individual items so they're findable via the search bar. This matches the
documented "Devotional Library pattern" in CLAUDE.md (nav shows category hubs; search
covers every item) and is not a nav gap — 3 individual vrat-katha items (Ekadashi, Pradosh
Vrat, Sankashti Chaturthi at Header.astro:151–153/311–313) *do* get dedicated dd-link/
drawer-link/searchItems entries as "featured" items, confirming the category-vs-item split
is deliberate, not an oversight.

**Pattern 2 — 1 of 144: `/muhurta` — `desktop:false drawer:true search:true`.** False
positive from the checker's method: it only scans for `class="dd-link"` anchors
(`scripts/audit/lib/checkNavSync.mjs:25`), but on desktop `/muhurta` is reachable via the
dropdown-trigger link itself (`<a href="/muhurta" class="nav-cat">` at Header.astro:131),
which isn't a `dd-link`. The drawer instead duplicates it as an explicit "Muhurat Hub"
`drawer-link` (Header.astro:291) since there's no separate always-visible trigger link in
the drawer UI. Functionally reachable from all three surfaces; checker limitation, not a
real gap.

**Pattern 3 — 4 of 144: `/panchang/tamil`, `/panchang/malayalam`, `/panchang/bengali`,
`/panchang/nepali` — `desktop:true drawer:true search:false`.** **Genuine, real gap.**
These 4 regional Panchang pages have dedicated dd-link/drawer-link entries
(Header.astro:124–127 desktop, 280–283 drawer) but are absent from `searchItems` — only the
`/panchang/regional` hub is searchable (Header.astro:1158). Worth flagging: a user typing
"Tamil Panchangam" into the search bar gets no hit even though the page is one click away
in the dropdown. Note the other 7 of 11 regional traditions (Assamese, Marathi, Gujarati,
Kannada, Telugu, Odia, ISKCON) have no dedicated dropdown/drawer/search links at all —
those are consistently hub-only, so this asymmetry is specific to these 4.

**Summary:** of 144 reported mismatches, 140 are intentional (devotional item-vs-category
split), 1 is a checker false-positive (`/muhurta` desktop trigger-link not counted as
`dd-link`), and 4 are a real, narrow gap (4 regional Panchang pages missing from search).

---

## Known Issues Regression Check

Method: for each still-open (non-struck-through) bullet in CLAUDE.md's "Known Issues"
section, grepped the referenced file(s) to confirm the described pattern is still present.
For struck-through ("fixed") bullets, spot-checked 3 (chosen for being non-trivial to
verify): Yamaganda Kalam table, Gowri Panchangam Wed=Sun (`GOWRI_DAY`), and the Header nav
sync fixes for Janma Kundali/Rashifal/Prashnavali/Regional Panchang.

### Still-open bullets — confirmed still present (no mismatch)

- **2025 Narak Chaturdashi date** — confirmed: `src/lib/festivals.ts:37` still has
  `{ date: '2025-10-21', name: 'Narak Chaturdashi', ... }`, after Dhanteras/Diwali at
  `2025-10-20` (lines 35–38). Matches Festival Ordering check above.
- **`janma-kundali.astro` Dasha dates depend on browser timezone** — confirmed:
  `src/pages/jyotish/janma-kundali.astro:296` still reads
  `const birthMs=new Date(y,m-1,d,hh,mm).getTime()-loc.tz*3600000;` — constructs the Date in
  the visitor's local browser timezone, then manually subtracts a location UTC offset,
  instead of `Date.UTC(...)`. Bug as described is still present.
- **`jyotish/shraddha.astro` Pitru Paksha calendar hardcoded to 2026** — confirmed:
  `src/pages/jyotish/shraddha.astro:110` has the comment "Hardcoded to 2026 only..." directly
  above `const PP2026=[...]` (line 112), used at lines 153–171. Still present, still labelled
  in-code as documented.
- **Devotional Namavali padding (Ganesh et al.)** — confirmed still present. Manually
  scanned `src/lib/devotional/namavali.ts`'s Ganesh Ashtottara Shatanamavali entry
  (lines 33–43): duplicate names visible on inspection, e.g. गजाननः appears at both #1 and
  #20, कृतिः at #9 and #35, वरदः at #13 and #33, एकदन्तः at #48 and #53, भक्तवत्सलः at #47 and
  #63, मूषकवाहनः at #42, #70 and #104, सर्वात्मा at #88 and #106, सर्वेश्वरः at #65 and #107.
  Confirms 108-name lists still padded with repeats rather than 108 genuinely distinct names.
- **Footer "Cities" dead query-param links (duplicate/leftover bullet)** — see mismatch
  below; this is actually already fixed, the open bullet appears to be a stale leftover.

### Mismatches found (marked-open-but-actually-fixed)

1. **`getHinduCalendarInfo()` amanta-month lag — CLAUDE.md lists this as still-open, but it
   was fixed on 2026-07-07.** Commit `9a69524` ("Fix truthfulness-audit issues #32-33: real
   moonrise/moonset, amanta-month lag") rewrote `src/lib/panchang.ts`'s `amantaIdx`
   computation (now lines 570–582) to forward-search to the month's ending Amavasya via
   iterative Moon/Sun-longitude convergence, replacing the old `const amantaIdx =
   sunRashiIdx;` Sankranti-proxy shortcut the CLAUDE.md bullet describes as the root cause.
   The commit message explicitly claims this fix and cites verification against
   2026 Navratri/Diwali dates. CLAUDE.md's "Known Issues" section was not updated to strike
   this bullet through — it is stale documentation, not a code regression.

2. **`GOWRI_NIGHT` Wed=Sun copy-paste bug — CLAUDE.md lists this as still-unfixed ("its
   correct night-time values haven't been independently verified against drikpanchang
   yet"), but it was fixed on 2026-07-07.** Commit `c2f2f2d` ("Fix truthfulness-audit issue
   #34: source real GOWRI_NIGHT data") replaced the table. Current
   `src/lib/muhurta.ts:233–241` carries a comment "Verified 2026-07 against
   drikpanchang.com's Tamil Gowri Panchangam (New Delhi), cross-checked against a second
   independent source (prokerala.com)...". Confirmed the Wed row
   (`['Uthamam','Amrutham','Rogam','Labham','Dhanam','Sudham','Charam','Visha']`) no longer
   equals the Sun row
   (`['Dhanam','Sudham','Charam','Visha','Uthamam','Amrutham','Rogam','Labham']`) — the
   copy-paste bug is gone. The duplicate table in `src/pages/muhurta/panchaka.astro:94–96`
   carries the same "Verified 2026-07" comment and matching data. CLAUDE.md's bullet is
   stale — should be struck through.

3. **Footer "Cities" dead links — duplicate stale bullet.** CLAUDE.md has *two* bullets
   about this: one struck-through ("~~'Baby Names'/'Compatibility' under Others...dead
   footer city query-param links~~ — fixed 2026-07 (...the non-functional footer 'Cities'
   column was removed from `Layout.astro`)") and one still-open at the very end of the
   section ("Footer 'Cities' links (`/?city=New+Delhi` etc.) are dead — nothing reads a
   `city` query param."). Grepped the whole `src/` tree for `city=` and `Cities`: no
   `?city=` links anywhere, and `src/layouts/Layout.astro`'s `<footer>` (lines 95–140) has
   no Cities column. The bug is fixed (matches the struck-through bullet); the open bullet
   at the end of the section is a stale leftover duplicate that should be removed.

### Struck-through ("fixed") bullets — spot-checked, confirmed genuinely fixed

- **Yamaganda Kalam table** — `src/lib/panchang.ts:337` has
  `const YAMAGANDA_SLOTS = [4, 3, 2, 1, 0, 6, 5];` and the duplicate in
  `src/pages/muhurta/rahu-kala.astro:71` has `const YAMAG_SLOTS = [4,3,2,1,0,6,5];` — both
  match the verified table CLAUDE.md claims. Confirmed fixed.
- **Gowri Panchangam Wednesday = Sunday (`GOWRI_DAY`)** — `src/lib/muhurta.ts:217–225`:
  Wed row (`['Labham','Dhanam','Sudham','Charam','Visha','Uthamam','Amrutham','Rogam']`) is
  now distinct from the Sun row
  (`['Uthamam','Amrutham','Rogam','Labham','Dhanam','Sudham','Charam','Visha']`). Confirmed
  fixed.
- **Header nav sync gaps for Janma Kundali / Rashifal / Prashnavali / Regional Panchang** —
  all 4 confirmed present in all three surfaces (desktop dd-link, drawer-link, and
  `searchItems`) at Header.astro:169/334/1164 (Janma Kundali), 183/348/1160-1161
  (Rashifal), 184/349/1162 (Prashnavali), 117/271/1158 (Regional Panchang). Confirmed
  fixed, consistent with the Header Nav Sync check above (none of these 4 URLs appear in
  the 144 current mismatches).

---

## Stale Markers

Commands:
```
grep -rn "TODO\|FIXME" src/
grep -rn "console.log" src/
```

**Result: zero hits for both.** No `TODO`/`FIXME` markers and no `console.log` calls
anywhere under `src/`.

---

## Astronomy Spot-Check (2026-07-14, New Delhi)

**Method:** Started `astro dev` on port 4321 (`npm run dev -- --port 4321`, confirmed
listening via `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/` → `200`).
System clock confirmed the run date: `Tue, Jul 14, 2026`. Used a throwaway Playwright
script (written to the OS temp scratchpad, copied into the repo root only transiently to
resolve Node's ESM module lookup against the repo's `node_modules`, then deleted
immediately after running — confirmed via `git status --short` showing no leftover) to load
`http://localhost:4321/`, deliberately withholding the browser geolocation permission so
the page falls back to its server-rendered default location. Confirmed via `#lp-pill-name`
and `#status-city` that the resulting location was already "New Delhi" (New Delhi is
`LOCATIONS[0]` / `getDefaultLocation()` in `src/lib/locations.ts:200-202`, i.e. the site's
hardcoded default, so no location-picker interaction was needed for this city). Extracted
`#tithi-name`/`#tithi-end`, `#nakshatra-name`/`#nakshatra-meta`/`#nakshatra-end`,
`#yoga-name`/`#yoga-end`, `#karana-name`/`#karana-end`, `#rahu-time`, `#sunrise`,
`#sunset` via `textContent`. Separately used `WebFetch` on
`https://www.drikpanchang.com/panchang/day-panchang.html?date=14/07/2026&geoname-id=1261481`
(confirmed via a second WebFetch call that the page's own title read "July 14, 2026
Panchang...for New Delhi, NCT, India"). Stopped the dev server afterward
(`taskkill /F /PID <astro pid>`; confirmed dead via a follow-up `curl` returning no
response).

| Field | PanchangPath (site) | drikpanchang.com | Match? |
|---|---|---|---|
| Tithi | Krishna Amavasya, ends 3:57 PM | Amavasya (Krishna Paksha), ends 3:12 PM | Name matches; **end time differs by 45 min** |
| Nakshatra | Punarvasu, Pada 1 (Jupiter), ends 2:44 AM (next day) | Punarvasu, ends 12:09 AM on July 15 | Name matches; **end time differs by ~2h35m** |
| Yoga | Vyaghata, ends 12:42 PM | Vyaghata, ends 11:57 AM | Name matches; **end time differs by 45 min** |
| Karana | Naga, ends 3:57 PM | "Nagava", ends 3:12 PM | Same Karana (drikpanchang's site style appends "-va"; both refer to the same fixed Karana "Naga"); **end time differs by 45 min**, matching the Tithi offset (expected, since the last Karana of a Tithi ends when the Tithi ends) |
| Rahu Kalam | 3:48 PM – 5:32 PM | 3:54 PM – 5:38 PM | **Differs by 6 min at both ends** |
| Sunrise / Sunset (for reference) | 5:27 AM / 7:16 PM | 5:33 AM / 7:21 PM | **Differs by 5–6 min** |

**Findings:**

- All four Panchang element **names** (Tithi, Nakshatra, Yoga, Karana) match
  drikpanchang.com exactly for this date/location — no misidentified element.
- All four elements' **end/boundary times** are systematically earlier on PanchangPath than
  on drikpanchang.com: Tithi/Karana/Yoga are each ~45 minutes earlier; Nakshatra is ~2h35m
  earlier (a noticeably larger gap than the other three, which doesn't fit a single
  constant offset — Nakshatra is a pure Moon-longitude boundary while Tithi/Karana/Yoga are
  Sun-Moon relative-angle boundaries, so a Moon-longitude precision difference between the
  two sites' ephemeris methods would affect Nakshatra's boundary-crossing time
  disproportionately since it's the more slowly-converging quantity).
- Sunrise/sunset are also ~5–6 minutes earlier on PanchangPath, which fully accounts for
  the 6-minute Rahu Kalam gap (Rahu Kalam is a fixed fraction of day-length, so a shifted
  sunrise/sunset shifts it by the same amount).
- **No fix attempted** (out of scope for this report-only task), but this is worth flagging
  for a future task: the site's lightweight client-side Keplerian/Meeus-style formulas
  (see `src/lib/panchang.ts` and the duplicated inline script in `index.astro`) appear to
  have materially less precision than drikpanchang's presumably higher-order ephemeris,
  particularly for the Moon's longitude — a 45-minute-to-2.5-hour boundary-time
  discrepancy is large enough to matter for anyone using the site to time a Muhurta near a
  Tithi/Nakshatra boundary, even though the headline "what Tithi/Nakshatra is it right
  now" answer was correct throughout the observed window.

---

## Notes on method / honesty

- All 5 steps were completed; none were skipped.
- The throwaway Playwright script never became a permanent repo file — it was written to
  the OS temp scratchpad first, briefly copied into the repo root only to satisfy Node's
  ESM resolver (which does not honor `NODE_PATH`), and deleted in the same tool call
  sequence that ran it, before any other work continued.
