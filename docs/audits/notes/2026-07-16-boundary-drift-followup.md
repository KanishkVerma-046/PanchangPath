# Boundary-Time Drift Follow-Up — 2026-07-16

Task 12 of the audit-fixes plan: a third-source cross-check of the Panchang
boundary-time drift flagged in `2026-07-14-data-correctness.md`'s "Astronomy
Spot-Check" (this site's Tithi/Nakshatra/Yoga/Karana end times and
sunrise/sunset ran 45min–2.5h earlier than drikpanchang.com for
2026-07-14, New Delhi). **Research only — no `src/` files were modified.**

---

## Step 1 — Reproducing this site's own values

**Method:** extracted the exact functions from `src/lib/panchang.ts`
(`julianDay`, `sunTrueLongitude`, `moonLongitude`, `lahiriAyanamsha`,
`equationOfTimeMinutes`, `sunriseUTC`, `estimateEndTime`) into a standalone
Node script and ran it for 2026-07-14, New Delhi (lat 28.6139, lng 77.209,
tz +5.5) — the same date/location as the original spot-check.

This turned up something the original spot-check didn't know to look for:
**the site has two independent copies of this math that have already
drifted from each other** — `src/lib/panchang.ts` (server, used for the
initial SSR render) and the duplicated inline `<script>` in
`src/pages/index.astro` (client-side, re-renders after page load and is
therefore what a live browser actually displays — i.e. what the original
Playwright-based spot-check captured). Reproducing both separately:

| Field | `panchang.ts` (server) | `index.astro` inline script (client, live-page value) |
|---|---|---|
| Tithi ends | 3:57 PM | 3:57 PM (same) |
| Nakshatra ends | 2:44 AM (+1d) | 2:44 AM (+1d) (same) |
| Yoga ends | 1:13 PM | **12:42 PM** (differs — see below) |
| Karana ends | 3:57 PM | 3:57 PM (same) |
| Sunrise | **5:33 AM** | **5:27 AM** (differs — see below) |
| Sunset | **7:21 PM** | **7:16 PM** (differs — see below) |

The client script's Yoga/sunrise/sunset numbers reproduce the original
audit's recorded "PanchangPath (site)" values exactly (3:57 PM / 2:44 AM /
12:42 PM / 3:57 PM / 5:27 AM / 7:16 PM), confirming the original spot-check
measured the live (client-script) values, as intended.

**Root cause of the client/server split (side finding, not fixed here):**
- `index.astro`'s inline `sunriseUTC()` has no Equation-of-Time term at all
  (`const noon = 12 - lng / 15;`), while `panchang.ts`'s `sunriseUTC()` was
  already fixed 2026-07 to include `equationOfTimeMinutes()`. CLAUDE.md's
  "Known Issues" says the EoT fix was propagated to `panchang.ts` and 5
  `muhurta/*.astro` pages — it does **not** mention `index.astro`, and
  indeed `index.astro`'s copy was missed. Once EoT is included (the server
  value, 5:33 AM/7:21 PM), sunrise/sunset match drikpanchang.com's originally
  recorded values (5:33 AM/7:21 PM) **exactly** — i.e. the sunrise/sunset
  portion of the originally-reported "drift" is not a precision gap in the
  site's best formula at all, it's `index.astro` silently running a stale,
  pre-fix copy of `sunriseUTC()` that never got the 2026-07 EoT patch.
- `index.astro`'s inline `estimateEnd()` is called with an explicit `rate`
  argument per element, and passes `14.17` (≈ Moon's ~13.17°/day +
  Sun's ~1°/day) for Yoga specifically, since Yoga is a Sun+Moon combined
  angle. `panchang.ts`'s `estimateEndTime()` has no such parameter — it
  hardcodes Moon's rate (13.17°/day) for every element including Yoga. So
  for Yoga, the client script is more astronomically reasoned than the
  server, and the two already disagree by ~30 min for this reason alone,
  independent of the drikpanchang comparison.
- This client/server duplication drift is a **new, previously-undocumented
  finding** distinct from the drikpanchang-drift question this task was
  scoped to investigate. Flagging here for a future task; not fixed in this
  pass per the task's explicit no-code-change instruction.

---

## Step 2 — Third-source cross-check

**Source used:** mypanchang.com — "Vedic High Precision Nirayana Panchangam
... calculated ... based on NASA's JPL Ephemeris" (per the site's own
`<meta name="description">` and on-page copy, author Pundit Mahesh
Shastriji). This is independent of both this site and of
drikpanchang.com (different author/organization, different ephemeris
source claimed).

**URL fetched:** `https://www.mypanchang.com/caltable.php?cityname=NewDelhi-India&yr=2026&mn=7&monthtype=0`
(the "Panchangam - Tabular" view for New Delhi, July 2026, Amavasyant
month-naming — month-naming convention doesn't affect Tithi/Nakshatra/
Yoga/Karana boundary times, only the displayed lunar-month label).

**Method:** `curl` with a browser `User-Agent` (WebFetch was not used, per
this project's established convention that it cannot reliably extract
precise numeric values), piped the raw HTML through a Node script that
strips `<script>`/`<style>` blocks, converts `<br>`/block-closing tags to
newlines, strips remaining tags, decodes `&nbsp;`, and located the row for
day "14" / weekday "Tue" in the resulting text. Full row (as extracted):

```
14
Tue
05:33:50          ← sunrise
19:20:05          ← sunset
05:01:54          ← moonrise
Nija Jyeshtha     ← lunar month
Krishna           ← paksha
Amavasya 15:13:22        ← Tithi ends 3:13:22 PM
Punarvasu 24:09:26+      ← Nakshatra ends 24:09:26 = 12:09:26 AM (+1 day)
Vyaghata 11:56:33        ← Yoga ends 11:56:33 AM
Nagava 15:13:22          ← Karana (Naga) ends 3:13:22 PM
Kimstughna 25:29:54+     ← next Karana ends 1:29:54 AM (+1 day)
```

(Site's own explanatory text on the page confirms these are boundary/end
times, matching this project's own Tithi/Nakshatra/Yoga/Karana semantics:
"panchangam denotes when they will end... these timings are end timings.")

---

## Step 3 — Comparison table

| Field | PanchangPath (site, live) | drikpanchang.com (original audit) | mypanchang.com (this cross-check) |
|---|---|---|---|
| Tithi (Krishna Amavasya) ends | 3:57 PM | 3:12 PM | **3:13:22 PM** |
| Nakshatra (Punarvasu) ends | 2:44 AM (+1d) | 12:09 AM (+1d, Jul 15) | **12:09:26 AM (+1d)** |
| Yoga (Vyaghata) ends | 12:42 PM | 11:57 AM | **11:56:33 AM** |
| Karana (Naga/"Nagava") ends | 3:57 PM | 3:12 PM | **3:13:22 PM** |
| Sunrise | 5:27 AM | 5:33 AM | **5:33:50 AM** |
| Sunset | 7:16 PM | 7:21 PM | **7:20:05 PM** |

mypanchang.com's values land within ~1 minute of drikpanchang.com's
originally-reported values on every single field, and both independent
sources differ from PanchangPath's live values by the same ~45min–2.5h
margins the original audit found.

---

## Conclusion

**Confirmed: this is a genuine precision gap in this site's Panchang
formulas, not legitimate inter-method variance.** Two independent
third-party sources (drikpanchang.com, and now mypanchang.com — which
states it computes from NASA JPL DE405 ephemeris data, an unrelated
computational lineage from drikpanchang) agree with each other to within
about a minute on every field checked, while PanchangPath's live homepage
values are systematically earlier by ~45 minutes (Tithi/Karana/Yoga),
~2.5 hours (Nakshatra), and ~6 minutes (sunrise/sunset — though see the
Step-1 finding: `panchang.ts`'s current, already-patched sunrise/sunset
formula alone actually matches both third-party sources to the minute;
`index.astro`'s separate, stale client-side copy is the one still showing
the sunrise/sunset gap).

Recommended scope for a **future** fix task (not this one):
1. **Primary, confirmed bug:** the Tithi/Nakshatra/Yoga/Karana
   boundary-crossing time estimates (`estimateEndTime()` in `panchang.ts`
   and its duplicate `estimateEnd()` in `index.astro`) have a real,
   consistent ~45min-to-2.5h precision gap versus two independent
   references, even using the codebase's best current Moon-longitude
   formula (26-term) and Lahiri ayanamsha. This likely needs a more
   rigorous boundary-search approach (e.g. iterative root-finding using
   the actual instantaneous rate of change at each refinement step, the
   same pattern already used successfully for `moonRiseSetUTC()`) rather
   than the current single-linear-rate extrapolation
   (`degPerUnit - (lon % degPerUnit)) / assumedRate`).
2. **Secondary, newly-found bug (this session):** `index.astro`'s inline
   `sunriseUTC()` is missing the 2026-07 Equation-of-Time fix that
   `panchang.ts` and 5 `muhurta/*.astro` pages already received — this is
   a simple propagation-of-existing-fix task, separate from item 1.
3. Also worth reconciling while in there: `index.astro`'s inline
   `estimateEnd()`'s Yoga-specific `14.17` rate vs `panchang.ts`'s uniform
   `13.17` for all four elements — pick one and make both copies agree,
   independent of whatever the item-1 fix ultimately does to the rate
   model.

No code was changed to address any of this in the current task — per
scope, `panchang.ts` and `index.astro` are left exactly as they were found.

---

## Self-review

- Comparison data is from real fetched/extracted sources, not fabricated:
  this site's values reproduced via a standalone Node re-implementation of
  the exact `panchang.ts`/`index.astro` formulas (source quoted inline
  above); drikpanchang.com's values are unchanged from the original
  2026-07-14 audit note (not re-fetched, per the task brief — that source
  was already used); mypanchang.com's values are from a `curl`+HTML-strip
  of a live page fetched during this session, with the fetched URL and the
  exact extracted row shown above.
- No application/source code file was modified — only this new note was
  added and (separately) a scratch Node script used for the reproduction,
  which lived outside the repo (OS temp scratchpad) and was not committed.
- Conclusion is stated plainly: **confirmed likely bug** in the
  Tithi/Nakshatra/Yoga/Karana boundary-time math (both copies), plus one
  newly-identified, narrower bug (missing EoT fix in `index.astro`'s
  client script) — flagged for a future task, not acted on here.
