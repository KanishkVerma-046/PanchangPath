# Post-Migration Full-Site Accuracy Audit — 2026-07-21

Final feature-by-feature check after the astro-core.ts/astronomy-engine
migration (4 slices, completed 2026-07-21 — see
`docs/superpowers/plans/2026-07-21-full-site-astronomy-engine-scope.md`).
Goal: confirm every feature area imports its orbital math from
`astro-core.ts` (directly or via `panchang.ts`/`kundali.ts`) rather than
carrying any local formula, and spot-check live output for a few pages.
**Audit only — no `src/` files were modified.**

## Method

1. Grepped the entire `src/` tree for local-formula fingerprints: the
   Lahiri ayanamsha constants (`23.85`, `1.3612`, `0.000136`), hand-rolled
   `sunLon`/`moonLon` function definitions, and
   `ayanamsha|helioXY|Kepler|ORB|tropicalLon|meanAnomaly|eccentricAnomaly|orbitalElements`.
2. For every feature file, read its actual `import` statements and traced
   them back to `astro-core.ts`/`panchang.ts`/`kundali.ts` — confirmation
   via import trace, not assumption.
3. Replicated the exact math from `astro-core.ts` in a standalone Node
   script (`astronomy-engine` + the same helper functions, copied verbatim)
   and ran it for New Delhi, 2026-07-20, to cross-check specific pages'
   live output.

## Feature table

| Feature | Migrated? | Source of truth | Notes |
|---|---|---|---|
| Panchang — homepage, /calendar | Yes | `panchang.ts` → `astro-core.ts` | `index.astro`/`calendar.astro` import `calculatePanchang`/`getHinduCalendarInfo`/`sunTrueLongitude` etc. from `panchang.ts` only. |
| Panchang — 11 regional variants (`/panchang/[region]`, `/panchang/regional`) | Yes | `panchang.ts` | Both files import `calculatePanchang`/`getHinduCalendarInfo`; region logic only changes month/tithi labels, not the underlying math. |
| Lagna Kundali — homepage widget, `/jyotish/kundali`, `/jyotish/janma-kundali` | Yes | `kundali.ts` → `astro-core.ts` | All import `allTropicalLons` from `kundali.ts` and `calcLagna` from `astro-core.ts`. |
| Vedic Time / 60-Ghati clock (`VedicClock.astro`) | Yes (no orbital math needed) | `panchang.ts`'s `sunriseUTC`, fed in from `index.astro` | Clock itself is pure elapsed-time arithmetic (ghati/pal/vipal division); no ayanamsha/planet math required. Sunrise/sunset it's fed traces to `astro-core.ts`. |
| Muhurta: Choghadiya, Hora, Rahu Kala, Abhijit | Yes | `panchang.ts`'s `sunriseUTC` | Confirmed via import + read of `choghadiya.astro`. |
| Muhurta: Lagna Table | Yes | `astro-core.ts`'s `calcLagna` + `panchang.ts`'s `lahiriAyanamsha` | |
| Muhurta: Panchaka/Gowri, Vivah, Griha Pravesh, Shubha Dates | Yes | `panchang.ts` (`moonLongitude`, `sunTrueLongitude`, `lahiriAyanamsha`) | |
| Jyotish: Horoscope Match, Rashi, Sun Sign, Nakshatra, Lagna, Mangal Dosha, Kalasarpa, Gemstone, Rudraksha, Pancha Pakshi, Sahasra Chandrodaya | Yes | `panchang.ts`/`astro-core.ts`/`kundali.ts` | All confirmed via import trace. |
| Jyotish: Shani Sadesati | Yes | `panchang.ts` + `astro-core.ts`'s `planetLongitude` | |
| **Jyotish: Shraddha Tithi** | **No — not migrated** | **Fully local, hand-rolled math** | Only imports `Layout` and `TITHI_ICONS` — zero astro-core/panchang/kundali import. Carries its own truncated-Meeus `sunLon()` (`shraddha.astro:107`), full 26-term `moonLon()` series (`:108`), and a duplicated `ayanamsha_pp()` (`:112`, same constant `23.85+1.3612T-0.000136T²`). CLAUDE.md's "generalized 2026-07-16" note only covered the year-generalization logic, not an engine migration — this file was never touched by the astro-core cutover despite being listed among the "15 jyotish/* pages" in the architecture doc. |
| Planetary Positions | Yes | `kundali.ts`'s `allTropicalLons` | |
| Rahu & Ketu | Yes | `astro-core.ts`'s `rahuLongitude` + `panchang.ts`'s `lahiriAyanamsha` | Location-independent by design (geocentric node longitude). |
| Shani | Yes | `astro-core.ts`'s `planetLongitude('saturn',…)` | |
| Gochara | Yes | `astro-core.ts` (`planetLongitude`, `rahuLongitude`) | |
| **Rashifal** (daily/weekly/monthly/yearly) | N/A — not astronomy-based at all | `rashifal.ts` static arrays | `getDailyPrediction()` etc. are pure `date-of-year % array.length` index-outs into pre-written prediction strings (`rashifal.ts:644-670`). No import of any astro module. Templated generic content by design, not a migration gap. |
| Prashnavali | N/A — static oracle | `PRASHNAVALI_ANSWERS` array | Same as Rashifal: random pick from a fixed 108-answer list, no astronomy involved. |

## Grep sweep result

Full-site search for
`ayanamsha|helioXY|Kepler|ORB|tropicalLon|meanAnomaly|eccentricAnomaly|orbitalElements`
plus the specific numeric fingerprints (`23.85`, `1.3612`, `0.000136`)
turned up exactly one unexpected hit outside the three canonical files:
**`src/pages/jyotish/shraddha.astro`**. Every other match was either the
canonical files themselves or plain marketing text ("Lahiri Ayanamsha" in
page descriptions/badges — `jyotish.astro`, `Layout.astro`,
`muhurta.astro`).

Confirmed `panchang.ts` and `kundali.ts` themselves are clean re-export
shells (no duplicated formulas) — both import from `./astro-core` and
re-export verbatim, e.g. `panchang.ts:2-20`:

```ts
import {
  sunLongitude as sunTrueLongitude,
  moonLongitude,
  lahiriAyanamsha,
  equationOfTimeMinutes,
  sunriseUTC,
  gmstDegrees,
  moonEquatorial,
  moonRiseSetUTC,
  findAngleCrossing,
} from './astro-core';

export {
  sunTrueLongitude,
  moonLongitude,
  lahiriAyanamsha,
  ...
```

## Live outputs — New Delhi, July 20, 2026

Computed at 12:00 IST / 06:30 UTC → JD 2461241.7708333335, Lahiri
ayanamsha 24.2114°. Reproduced by copying `astro-core.ts`'s exact
functions (`sunLongitude`, `moonLongitude`, `planetLongitude`,
`rahuLongitude`, `lahiriAyanamsha`, `sunriseUTC`, `equationOfTimeMinutes`)
verbatim into a standalone Node script against the same `astronomy-engine`
package the site uses, then running each page's own render logic on top.

**Rahu & Ketu page**
- Rahu: Kumbha (Aquarius), 7°21′, Shatabhisha Pada 1
- Ketu: Simha (Leo), 7°21′, Magha Pada 3

**Shani page**
- Saturn: Meena (Pisces), 20°29′, Revati Pada 2

**Gochara page**
- Mars: Taurus · Jupiter: Cancer · Saturn: Pisces · Rahu: Aquarius · Ketu: Leo

**Choghadiya — New Delhi, July 20, 2026** (Monday; sunrise 5:36 AM, sunset
7:19 PM, next sunrise 5:36 AM)

Day: Amrit (5:36–7:19 AM) → Kaal (7:19–9:02 AM) → Shubh (9:02–10:45 AM) →
Rog (10:45 AM–12:28 PM) → Udveg (12:28–2:10 PM) → Char (2:10–3:53 PM) →
Labh (3:53–5:36 PM) → Amrit (5:36–7:19 PM)

Night: Char (7:19–8:36 PM) → Rog (8:36–9:54 PM) → Kaal (9:54–11:11 PM) →
Labh (11:11 PM–12:28 AM) → Udveg (12:28–1:45 AM) → Shubh (1:45–3:02 AM) →
Amrit (3:02–4:19 AM) → Char (4:19–5:36 AM)

## Fix plan sketch for `shraddha.astro` (not implemented)

1. Delete the local `sunLon`, `moonLon`, `ayanamsha_pp` functions
   (`shraddha.astro:106-112`).
2. Add
   `import { sunTrueLongitude, moonLongitude, lahiriAyanamsha } from '../../lib/panchang';`
   (matches the pattern every sibling jyotish page already uses).
3. Rename call sites (`sunLon(jd)` → `sunTrueLongitude(jd)`, `moonLon(jd)`
   → `moonLongitude(jd)`, `ayanamsha_pp(jd)` → `lahiriAyanamsha(jd)`) — the
   `findElongationPP` Newton-iteration logic itself is independent of the
   engine and can stay as-is.
4. Re-verify against drikpanchang.com for 2025/2026/2027 same as the
   original 2026-07-16 generalization commit, since switching from
   truncated-Meeus to astronomy-engine could shift a boundary tithi by a
   few minutes near an Amavasya edge case.
