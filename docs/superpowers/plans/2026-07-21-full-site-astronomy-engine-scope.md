# Full-Site astronomy-engine Migration — Scope & Inventory

> **Status: SCOPING ONLY — no code has been touched.** This document is the deliverable for "inventory + plan before writing any code." It is NOT yet in `writing-plans` checkbox/task format because the user has not chosen a scope to commit to. Once scope is chosen (see "Decision needed" at the bottom), the chosen slice(s) should each get their own `docs/superpowers/plans/YYYY-MM-DD-<slice-name>.md` in full task-by-task format via the `superpowers:writing-plans` skill, following the same pattern as `docs/superpowers/plans/2026-07-20-panchang-astronomy-engine.md` (the panchang.ts migration this follows up on).
>
> **If you're resuming this cold** (new session, no prior context): read this whole file, then re-read `docs/superpowers/plans/2026-07-20-panchang-astronomy-engine.md` for the precedent this follows, then check with the user which slice from "Decision needed" they picked before writing any task plan.

## Why this exists

`panchang.ts` was migrated 2026-07-20 to use `astronomy-engine` (VSOP87/ELP-2000-based) for Sun/Moon longitude, replacing a hand-rolled Meeus series — see the linked plan above. That migration was explicitly scoped to `panchang.ts` + `index.astro` + `calendar.astro` only. Everything else on the site that does planetary/orbital math (~30 files) still uses an older, independently-duplicated Keplerian orbital-mechanics scheme that originated in `src/lib/kundali.ts`. The user wants to know the full size and shape of bringing *everything* onto `astronomy-engine` as a single shared engine before deciding how much of it to actually do.

## 1. Full-codebase scan — confirmed scope boundary

Scanned the entire `src/` tree (114 `.ts`/`.astro` files) for anything computing astronomical/orbital positions, not just the files the user named. Result: **the scope is exactly what the user guessed** — `kundali.ts`, `KundaliWidget.astro`, all 15 `jyotish/*.astro`, all 9 `muhurta/*.astro` — plus four file groups the user's message didn't name that also do real orbital math and must be in scope for a "single source of truth" migration to actually be true:

- **`src/components/Header.astro`** (lines ~974–1013 of 1400) — a live "today's Panchang" status strip in the site header, with its own inline `stripLahiriAyanamsha()` + Moon/Sun longitude copy. Missed by the panchang.ts pass because it's a component, not a page.
- **`src/pages/planets/{gochara,planetary-positions,rahu-ketu,shani}.astro`** — 4 pages, live self-refreshing planetary position/transit displays. Not in CLAUDE.md's original "Features Built" list (added later; CLAUDE.md's Known Issues section mentions them only as nav-link fixes, not as a calculation surface).
- **`src/pages/sunrise-sunset.astro`** and **`src/pages/moonrise-moonset.astro`** — dedicated rise/set pages, independent of `panchang.ts`'s sunrise/sunset logic despite computing the same thing.
- **`src/lib/planetaryEvents.ts`** — already imports `allTropicalLons`/`RASHIS` from `kundali.ts` (not duplicated), so it is *automatically* fixed by migrating `kundali.ts` — no separate work item, but it depends on that migration being correct (see Risk section).

**Explicitly checked and ruled out as out-of-scope** (do not re-scan these unless new pages are added):
- `src/lib/festivals.ts` — festival dates are static hardcoded data (sourced from drikpanchang.com per commit history), not runtime-computed. A few dates were *computed once* by a throwaway script during authoring (e.g. Dev Uthani Ekadashi) but nothing in the shipped site recomputes them.
- `src/lib/rashifal.ts`, all of `src/lib/devotional/*`, `src/lib/blog.ts` — text/data only, no math.
- `src/components/VedicClock.astro` — computes Ghati/Pal/Vipal, but purely from sunrise/sunset **values passed in from a parent page** (props/data-attributes). It does zero independent ephemeris math. Confirmed by reading the file — it's a pure consumer, not a duplicator.
- `src/pages/kundali.astro` (top-level, not under `jyotish/`) — is a 3-line `Astro.redirect('/jyotish/kundali', 301)`. Not a calculator.
- `terms.astro`, `about.astro`, `muhurta.astro`, `jyotish.astro`, `Layout.astro` — matched a grep for "ayanamsha" but only as marketing copy text ("Lahiri Ayanamsha" in a badge/description), not code.

## 2. Per-file inventory

Two formula lineages exist outside `panchang.ts` today — and only two; a suspected third (`sahasra-chandrodaya.astro`) turned out to be the same lineage, just missing terms it doesn't need:

- **(A) `astronomy-engine`** — `panchang.ts` only (3 files total, done 2026-07-20).
- **(B) Keplerian-`ORB` + full-26-term-Meeus-Moon**, copy-pasted from `kundali.ts` into every file below.

Legend: **AE**=astronomy-engine · **Meeus26**=full 26-term Meeus Moon · **ORB**=Keplerian-ORB-inline (Mercury–Saturn orbital elements + Kepler's-equation solver) · **Full-3**=full 3-term Lahiri ayanamsha (`23.85+1.3612T-0.000136T²`, matches CLAUDE.md's standing instruction — no truncated 2-term copies found anywhere in this scan). "Imports" column = whether the file imports shared code or duplicates its own copy.

| File | Build/Client | Calculates | Formula source | Ayanamsha | Imports | ~Lines (math) | Risk notes |
|---|---|---|---|---|---|---|---|
| `src/lib/kundali.ts` | Build-time (lib; canonical origin of lineage B) | Full chart: Sun/Moon/5 planets/Rahu/Ketu sidereal lon + Lagna + retro/combust | ORB + Meeus26 Moon + 3-term Sun-C | Full-3 | own (origin) | ~260 | **Lagna/houses, retrograde, combust** — everyone else copied this file |
| `src/lib/planetaryEvents.ts` | Build-time (lib) | Sign transits, retro/direct stations, conjunctions, solstices; eclipses static | none — imports `allTropicalLons`/`RASHIS` | n/a | imports kundali.ts | 0 own | **Retrograde, conjunctions, eclipses** (eclipse table hardcoded, verified only through 2027-08-17 — will silently go stale) |
| `src/components/KundaliWidget.astro` | **Both** (SSR default render + live client) | Live Lagna Kundali (N/S Indian charts), retro/combust | ORB (separately-suffixed client dup) + Meeus26 | Full-3 | build: imports kundali.ts; client: full dup | ~230 | Houses/lagna, retrograde, combust; 2-min live refresh |
| `src/components/Header.astro` | Client (~90 lines within a 1400-line file) | "Today" Tithi+Nakshatra status strip | Meeus26 + 3-term Sun-C | Full-3 (`stripLahiriAyanamsha`) | dup (comment cites the now-disproven "client scripts can't import" belief) | ~90 | Sun/Moon only — simplest duplicate, easy first target |
| `src/components/VedicClock.astro` | Client, no ephemeris | Ghati/Pal/Vipal from parent-supplied sunrise/sunset | none needed | none | pure consumer | 0 | **Out of scope** — confirmed display-only |
| `jyotish/kundali.astro` | Client | Full Kundali (standalone page) | ORB + Meeus26 | Full-3 | dup | ~40+render | Houses/lagna, retrograde, combust |
| `jyotish/janma-kundali.astro` | Client | Natal report: chart + houses + dignity/yoga + **Vimshottari Dasha** | ORB + Meeus26 | Full-3 | dup | ~40 chart + ~60 dasha | **Highest complexity file on the site** — see Dasha note below |
| `jyotish/horoscope-match.astro` | Client | Ashta Kuta Guna Milan (both partners' Moon nakshatra) | Meeus26 Moon+Sun, no ORB | Full-3 | dup | ~10 | Nakshatra only |
| `jyotish/gemstone.astro` | Client | Birthstone from Lagna sign | `calcLagna` (no ORB/Moon) + Sun | Full-3 | dup | ~10 | Lagna only |
| `jyotish/rudraksha.astro` | Client | Rudraksha bead from Lagna sign | `calcLagna`, no ORB | Full-3 | dup | ~10 | Lagna only |
| `jyotish/rashi.astro` | Client | Moon-sign finder | Meeus26 Moon, no ORB | Full-3 | dup | ~8 | — |
| `jyotish/sunsign.astro` | Client | Tropical Sun-sign | 3-term Sun-C, no Moon/ORB | Full-3 (barely used) | dup | ~5 | Simplest file on the site |
| `jyotish/nakshatra.astro` | Client | Birth Nakshatra finder | Meeus26 Moon, no ORB | Full-3 | dup | ~8 | — |
| `jyotish/lagna.astro` | Client | Ascendant calculator + all planets | `calcLagna` + full ORB | Full-3 | dup | ~40 | Lagna + full chart |
| `jyotish/mangal-dosha.astro` | Client | Manglik check from Lagna+Moon+Venus | `calcLagna` + ORB (Mars) | Full-3 | dup | ~35 | **Houses** (1/2/4/7/8/12 from Lagna), cancellation rules |
| `jyotish/kalasarpa.astro` | Client | Kalasarpa Yoga (all planets vs Rahu-Ketu axis) | full ORB | Full-3 | dup | ~40 | Multi-planet axis logic |
| `jyotish/sadesati.astro` | Client | Shani Sadesati (Saturn transit/Moon) | ORB (Saturn) + Moon | Full-3 | dup | ~15 | 3-phase lifetime timeline |
| `jyotish/shraddha.astro` | Client | Pitru Paksha calendar | Meeus26 Moon+Sun + own iterative Sankranti/elongation solvers | Full-3 (own copy) | dup | ~20 | Distinct solver layer sits atop the shared formula — solver logic itself is not orbital math and stays either way |
| `jyotish/sahasra-chandrodaya.astro` | Client | 1000th full-moon milestone | Meeus26 Moon+Sun (elongation only) | n/a (cancels out — tropical elongation) | dup | ~10 | Confirmed **not** a 3rd lineage; own `nextFullMoon()` solver on top |
| `jyotish/pancha-pakshi.astro` | Client | Pancha Pakshi birth-bird + today's periods | Meeus26 Moon + EoT sunrise/sunset | Full-3 | dup | ~10 | Combines birth-Moon + day-length division |
| `muhurta/lagna.astro` | Client | Today's Lagna table | `calcLagna` only | Full-3 | dup | ~5 | Ascendant, no full chart |
| `muhurta/vivah.astro` | Client | Marriage Muhurat finder | Meeus26 Moon+Sun | Full-3 | dup | ~10 | — |
| `muhurta/panchaka.astro` | Client | Panchaka/Gowri Panchangam | Meeus26 Moon only | Full-3 | dup | ~8 | — |
| `muhurta/griha-pravesh.astro` | Client | Housewarming Muhurat finder | Meeus26 Moon+Sun | Full-3 | dup | ~10 | — |
| `muhurta/shubha-dates.astro` | Client | General auspicious-date finder | Meeus26 Moon+Sun | Full-3 | dup | ~10 | — |
| `muhurta/choghadiya.astro` | Client | Choghadiya table | EoT `sunriseUTC` only | n/a | dup | ~15 | — |
| `muhurta/hora.astro` | Client | Hora (planetary hour) table | EoT `sunriseUTC` only | n/a | dup | ~15 | — |
| `muhurta/rahu-kala.astro` | Client | Rahu Kalam table | EoT `sunriseUTC` only | n/a | dup | ~15 | — |
| `muhurta/abhijit.astro` | Client | Abhijit Muhurat | EoT `sunriseUTC` only | n/a | dup | ~15 | — |
| `planets/gochara.astro` | Client | Current transits, all 9 grahas | full ORB | Full-3 | dup | ~35 | Multi-planet |
| `planets/planetary-positions.astro` | Client | Live positions + **retrograde flags**, all grahas | full ORB | Full-3 | dup | ~40 | Retrograde; self-refreshes every 60s |
| `planets/rahu-ketu.astro` | Client | Rahu/Ketu position | `rahuLon` polynomial only | Full-3 | dup | ~8 | — |
| `planets/shani.astro` | Client | Saturn position | ORB (Saturn only) | Full-3 | dup | ~15 | — |
| `sunrise-sunset.astro` | Client | Sunrise/sunset today + 7-day outlook | EoT Meeus Sun (`sunriseUTC`) | n/a | dup | ~20 | Sun-only |
| `moonrise-moonset.astro` | Client | Moonrise/moonset + phase | Meeus26 Moon + iterative **topocentric altitude-crossing solver + parallax** | n/a | dup | ~50 | Most sophisticated non-ORB file; mirrors `panchang.ts`'s `moonRiseSetUTC()` logic independently |

**Totals: 1 lib file (origin) + 2 components + 15 jyotish pages + 9 muhurta pages + 4 planets pages + 2 rise/set pages = 33 files, ~1,000–1,100 lines of duplicated astronomy math** (not counting UI/rendering code in the same files).

**Zero files in this set are build-time-only.** Every one of the 33 ships its full astronomy stack (ORB table, Kepler solver, 26-term Moon, ayanamsha) into the browser JS bundle, because these are all form-driven (arbitrary birth date/time/location input) or self-refreshing live displays — unlike `panchang.ts`'s largely build-time "today" render. This means an `astronomy-engine` migration here pays the library's bundle cost on ~30 separate pages unless the shared logic is factored into one client-importable module (see §4) rather than copy-pasted the way the current code is.

## 3. What panchang.ts exposes vs. what this scope actually needs

`panchang.ts` today exports: `julianDay`, `sunTrueLongitude`, `moonLongitude`, `lahiriAyanamsha`, `equationOfTimeMinutes`, `sunriseUTC`, `gmstDegrees`, `moonEquatorial`, `moonRiseSetUTC`, `findAngleCrossing`, `calculatePanchang`, `RASHIS`, `AMANTA_MONTHS`, `SAMVATSARA_NAMES`, `getHinduCalendarInfo`.

That covers Sun + Moon longitude and Sun/Moon rise-set — genuinely reusable as-is for every file above that only needs Moon and/or Sun (roughly half the list: `Header.astro`, `horoscope-match`, `rashi`, `sunsign`, `nakshatra`, `sahasra-chandrodaya`, `pancha-pakshi`, `vivah`, `panchaka`, `griha-pravesh`, `shubha-dates`, `choghadiya`, `hora`, `rahu-kala`, `abhijit`, `sunrise-sunset`, `moonrise-moonset`). This confirms this is *not* a clean drop-in for the other half — it does not, and was never meant to, cover:

- **The other 5 planets (Mercury, Venus, Mars, Jupiter, Saturn) + Rahu/Ketu longitude** — `astronomy-engine` has this (`GeoVector`/`Ecliptic` per-body, or the higher-level `HelioVector` + geocentric conversion), but nothing in `panchang.ts` calls it today. New functions needed.
- **Lagna/Ascendant (houses)** — `kundali.ts`'s `calcLagna()` derives this from local sidereal time (via GMST) + obliquity + latitude, independent of which planet-position library is used underneath. `astronomy-engine` doesn't have a "Vedic ascendant" function either — no ephemeris library does, because it's an observer-geometry calculation, not a body-position lookup. This logic stays hand-written either way; only the obliquity/GMST inputs it depends on could be swapped for `astronomy-engine`'s equivalents (it has `e_tilt()` for obliquity and `SiderealTime()` for GMST — both usable, both currently hand-rolled polynomials in `kundali.ts`).
- **Retrograde / combust (Asta-Udita) status** — currently derived by comparing a planet's longitude at `T` vs `T±1 day` (finite-difference sign of the rate) using the ORB solver. `astronomy-engine` can do this more directly and more accurately via its own velocity-aware position functions, but it's new code, not a reuse of anything panchang.ts exports.
- **Vimshottari Dasha** — this is *not* astronomical math. It's a fixed lookup table (9 planetary lords, fixed year-lengths totaling 120 years) offset by the birth Moon's fractional position within its nakshatra. It only needs one accurate input (birth Moon sidereal longitude) — which `panchang.ts`'s `moonLongitude()` + `lahiriAyanamsha()` already provide today, unmodified. **This is low-risk regardless of scope choice** — it doesn't need new astronomy-engine work, just needs to keep receiving an accurate Moon longitude.
- **Eclipses** — `planetaryEvents.ts`'s eclipse list is a hardcoded static table, not computed at all today. `astronomy-engine` has real eclipse-search functions (`SearchLunarEclipse`, `SearchGlobalSolarEclipse`) that could replace the static table entirely — this would be a scope *expansion* beyond "swap the formula," not a required part of this migration, but worth flagging since the current table silently goes stale after 2027-08-17.

**Conclusion on the user's step 3 question**: yes, this is confirmed to be more than "swap the formula" for roughly half the file list. `panchang.ts` needs *new* exports (multi-planet longitude, obliquity, GMST equivalents already partially covered by `moonEquatorial`/`gmstDegrees`) before `kundali.ts` and everything downstream of it can be migrated. Lagna and Dasha logic themselves are unaffected either way — they're geometry/lookup-table code, not ephemeris code — so they carry no *extra* astronomy-engine migration risk, only the general "don't break behavior while refactoring" risk any of these files carries.

## 4. Proposed shared module structure

```
src/lib/
  astro-core.ts        NEW — the one place every astronomy-engine call lives
  panchang.ts           existing — Tithi/Nakshatra/Yoga/Karana/Rahu Kalam/Muhurta;
                         re-exports what it needs from astro-core.ts instead of
                         owning sunTrueLongitude/moonLongitude internals directly
  kundali.ts             existing — Lagna, houses, retro/combust, Dasha-input assembly;
                         imports planet longitudes from astro-core.ts instead of
                         its own ORB/solveKepler/helioXY
  muhurta.ts              existing — unaffected (already imports sunrise/sunset
                         concepts from panchang.ts-era work, not this lineage)
```

`astro-core.ts` would export, at minimum:
- `sunLongitude(jd)`, `moonLongitude(jd)` — already exist in `panchang.ts`; move here, `panchang.ts` re-exports for backward compatibility with existing importers.
- `planetLongitude(body: 'Mercury'|'Venus'|'Mars'|'Jupiter'|'Saturn', jd)` — new, wraps `astronomy-engine`'s `GeoVector` + `Ecliptic`.
- `rahuLongitude(jd)` / `ketuLongitude(jd)` — Rahu/Ketu (lunar nodes) aren't physical bodies `astronomy-engine` tracks directly; keep the existing polynomial mean-node formula (it's already a separate, accurate-enough approximation independent of the ORB/Kepler scheme being replaced) or use `astronomy-engine`'s osculating node functions if higher precision is wanted later — a decision to make inside whichever task actually does this file, not here.
- `lahiriAyanamsha(jd)`, `equationOfTimeMinutes(T)`, `sunriseUTC(...)`, `moonRiseSetUTC(...)`, `gmstDegrees(jd)`, `moonEquatorial(jd)`, `findAngleCrossing(...)` — move from `panchang.ts` verbatim (no logic change), `panchang.ts` re-exports.
- `calcLagna(jd, lat, lng)` — move from `kundali.ts` verbatim (geometry, not ephemeris — but centralizing it avoids the current copy-paste-per-file pattern regardless).
- `isRetrograde(body, jd)`, `isCombust(body, sunLon, planetLon)` — new, small wrappers.

Every `jyotish/*.astro` and `muhurta/*.astro` client `<script>` then imports only the specific functions it needs from `astro-core.ts` (Vite tree-shakes the rest) instead of carrying a full local copy — this is the same pattern already proven working for `index.astro`/`calendar.astro` importing from `panchang.ts` in the 2026-07-20 migration (client `<script>` tags CAN import local `.ts` modules — see that plan's Investigation Notes, and the now-corrected CLAUDE.md gotcha).

`kundali.ts` keeps its own file (not folded into `astro-core.ts`) because it also exports `RASHIS`, `GRAHA_META`, and the higher-level `calculateKundali()` orchestration — those are Kundali-domain concerns, not raw astronomy, matching how `panchang.ts` itself stays separate from `astro-core.ts` for the same reason.

## 5. Build-time vs. client-side (bundle size implications)

**All 33 files in scope ship math into the browser.** None are build-time-only. This matters because:

- The panchang.ts migration measured `astronomy-engine`'s Sun+Moon-only footprint (tree-shaken) at **33.8KB minified / 14.4KB gzipped** per page, added on top of that page's existing bundle.
- Adding the 5 outer planets (`GeoVector`/`Ecliptic` for Mercury–Saturn) will pull in more of the library's VSOP87 term tables — expect a materially larger tree-shaken chunk than the Sun+Moon-only number above; this needs an empirical measurement once `astro-core.ts`'s planet function exists (a "measure it" step belongs in whichever task plan does that work, not guessed here).
- Because every consuming page currently duplicates its own copy, the *current* total shipped-to-users astronomy code is already ~30x the size of one copy, just spread thin per-page rather than concentrated. Consolidating into `astro-core.ts` doesn't make any single page's bundle bigger than switching libraries would anyway — it's a wash on total bytes shipped, but a large win on *duplication risk* (one place to fix a bug instead of 20).
- `KundaliWidget.astro` is the only file that's build-time (SSR default render, via its frontmatter importing `kundali.ts`) **and** client-side (its own interactive re-render duplicates the math again). Migrating it correctly means fixing both halves, and verifying the SSR-rendered initial chart matches what the client-side re-render produces after a location change — a natural point where the two paths could silently diverge if only one half is migrated.

## 6. Risk/size estimate per feature area

| Feature area | Files | Nature of the change | Risk |
|---|---|---|---|
| Sun/Moon-only pages (no ORB, no Lagna) | `Header.astro`, `horoscope-match`, `rashi`, `sunsign`, `nakshatra`, `sahasra-chandrodaya`, `pancha-pakshi`, `vivah`, `panchaka`, `griha-pravesh`, `shubha-dates`, `choghadiya`, `hora`, `rahu-kala`, `abhijit`, `sunrise-sunset`, `moonrise-moonset` (17 files) | **Clean mechanical swap** — literally the same change already proven on `index.astro`/`calendar.astro`: replace local Sun/Moon formula with an import from `astro-core.ts` (or `panchang.ts`'s existing re-exports). No new astro-core.ts functions needed for most of these. | **Low.** Same pattern, same precedent, same verification method (compare a few reference dates before/after). |
| Lagna-only pages | `gemstone`, `rudraksha`, `muhurta/lagna` (3 files) | Swap `calcLagna`'s internal Sun-longitude dependency for the shared one; `calcLagna` itself (GMST/obliquity geometry) is unchanged logic, just needs to live in one place. | **Low-medium.** Formula itself doesn't change, only where it's imported from — but Lagna is a visible, checkable number (astrologically meaningful), so any subtle bug is more likely to be *noticed and reported* by users than a sunrise-time drift of a few seconds would be. |
| Full multi-planet chart pages | `kundali.ts`, `KundaliWidget.astro`, `jyotish/kundali`, `jyotish/lagna`, `jyotish/mangal-dosha`, `jyotish/kalasarpa`, `jyotish/sadesati`, `planets/gochara`, `planets/planetary-positions`, `planets/rahu-ketu`, `planets/shani` (11 files, but ~all downstream of `kundali.ts`'s shared logic) | **Not a clean swap.** Requires *building new* `astro-core.ts` functions for the 5 outer planets (`panchang.ts` never touched these), then re-deriving retrograde/combust status against the new position source, then propagating to every consumer. `kundali.ts` is the one real "do the work once" file; the 10 pages downstream of it are then closer to mechanical once `kundali.ts` itself is done — but each still needs its own careful before/after comparison since each has independently drifted (see inventory table: `mangal-dosha` and `kalasarpa` have extra house/axis logic layered on top). | **Medium-high**, concentrated almost entirely in `kundali.ts` itself. Getting `kundali.ts`'s new planet-longitude + retrograde logic right is the crux of the whole migration; everything else in this row inherits its correctness once it's done. Recommend treating `kundali.ts` as its own isolated task with its own before/after numeric comparison against known ephemeris references (e.g. current planetary positions from an independent source) before touching any consumer. |
| Vimshottari Dasha | `jyotish/janma-kundali.astro` (1 file, ~60 of its ~100 math lines) | Dasha math itself (lookup table + proportional offset) is untouched by this migration — it only consumes an already-accurate Moon longitude. The *chart* half of this same file falls under the row above. | **Low** for the Dasha logic specifically; the file's overall risk is driven by the chart half, not the Dasha half. |
| Eclipses | `src/lib/planetaryEvents.ts` | Currently a static hardcoded table (not computed) — **not required** for this migration at all. Optional scope expansion: replace with `astronomy-engine`'s real `SearchLunarEclipse`/`SearchGlobalSolarEclipse`, fixing the "goes stale after 2027-08-17" problem as a side effect. | **N/A if left alone (zero risk, zero change). Medium if expanded** — new capability, not a reuse of existing logic, needs its own verification against known eclipse dates. |
| `shraddha.astro`'s solver layer | `jyotish/shraddha.astro` | The Sankranti/elongation *solvers* are custom iterative code sitting on top of the shared Sun/Moon formula — those solvers don't change. Only their Sun/Moon longitude inputs get swapped, same as the "Sun/Moon-only" row. | **Low**, same as the Sun/Moon row, already generalized and cross-checked per-year in a prior pass (see CLAUDE.md). |
| `moonrise-moonset.astro`'s solver layer | `moonrise-moonset.astro` | Same shape as `shraddha.astro` — a topocentric altitude-crossing + parallax solver on top of Moon longitude/RA-Dec. Already mirrors `panchang.ts`'s `moonRiseSetUTC()` almost exactly — likely the single easiest file to consolidate since `panchang.ts` already exports everything it needs. | **Low.** |

**Overall size**: ~1,000–1,100 lines of duplicated math across 33 files. Roughly half (the Sun/Moon/Lagna-only files, ~20 files) is low-risk mechanical work directly reusing the proven panchang.ts pattern. The other half (~11 files, all downstream of `kundali.ts`) concentrates real risk and real new-code-writing in one place (`kundali.ts`'s multi-planet + retrograde logic), with everything else in that group being comparatively mechanical once that one file is correct.

## Decision needed

Natural slices, roughly in increasing order of risk/effort, each independently shippable:

1. **`Header.astro` + the Sun/Moon/Lagna-only pages** (~20 files) — same pattern as the already-completed panchang.ts migration, low risk, could reuse `panchang.ts`'s existing exports almost as-is via a thin `astro-core.ts` that's mostly re-exports at first.
2. **`kundali.ts` core migration** (1 file) — the highest-value, highest-risk single file; unlocks everything downstream.
3. **The 10 files downstream of `kundali.ts`** (`KundaliWidget.astro`, `jyotish/{kundali,lagna,mangal-dosha,kalasarpa,sadesati}`, `planets/{gochara,planetary-positions,rahu-ketu,shani}`) — mechanical once slice 2 is solid, but still 10 separate before/after checks.
4. **Optional: real eclipse computation** in `planetaryEvents.ts` — not required, fixes a real staleness bug, separate decision from the rest.

Tell me which slice(s) to turn into a full `writing-plans` task-by-task plan next — they don't have to happen in one sitting or one plan document; each can be its own dated plan file under `docs/superpowers/plans/`, executed and reviewed independently, same as the original panchang.ts plan.
