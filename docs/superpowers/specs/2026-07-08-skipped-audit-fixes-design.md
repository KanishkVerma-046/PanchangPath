# Design: Clearing the Skipped Site-Audit Items

**Date:** 2026-07-08
**Status:** Approved, pending spec review

## Motivation

Two prior audits (`docs/site-audit-2026-07.md` and `docs/site-audit-2026-07-07-truthfulness.md`) produced 42 standalone fix prompts. All but 5 have been executed. This project clears the remaining 5, plus one drift bug discovered while scoping this work.

Cross-checked against the live codebase (not just the docs) on 2026-07-08:
- All of truthfulness-audit fixes #29–42 are confirmed present in code (spot-checked eclipse data through 2027-08, Chhath Puja's unverified-flag comment, Shraddha's 2026-only labeling).
- Exactly 5 items remain `⏭️ SKIPPED` in `docs/site-audit-fix-prompts.md`: #1 (Planets menu), #4 (Sunrise & Sunset), #5 (Moonrise & Moonset), #26 (Raksha Bandhan date), #28 (2027 festival data).
- New finding: `src/lib/kundali.ts`, `src/components/KundaliWidget.astro`, and all 15 `src/pages/jyotish/*.astro` pages still carry the older 15-term Moon-longitude `dL` correction. `src/lib/panchang.ts`'s canonical was later extended to 26 terms (during the moonrise fix, truthfulness-audit #32), but that extension was never propagated to these 17 files. Confirmed via grep: only `panchang.ts`, `index.astro`, and `Header.astro` contain the 26th term (`0.003665*sin(2Dr-3Mpr)`).

## Scope

1. **Moon-formula propagation** (do first — everything else depends on accurate Moon math)
2. **Sunrise & Sunset page**
3. **Moonrise & Moonset page**
4. **Four Planets pages** (Planetary Positions, Rahu & Ketu, Shani, Gochara)
5. **Header.astro wiring** for all 6 new pages
6. **Raksha Bandhan 2026 date verification**
7. **2027 festival data**

Items 2–5 replace nav dead-ends; items 6–7 are `festivals.ts` data fixes. All are independent of each other except that 2–5 depend on item 1 for correctness.

## 1. Moon-formula propagation

The 15-term version is not simply the canonical formula's first 15 terms truncated — it's missing two middle terms too (`0.010980*sin(Mpr-2Fr)` and `0.010675*sin(4Dr-Mpr)`), not just the trailing ones. So don't append terms; **replace the entire `dL` sum wholesale** with `panchang.ts`'s canonical 26-term version (lines 53-78), preserving each file's own variable names (e.g. `Dr`/`Mr`/`Mpr`/`Fr` vs. any local equivalents) in:
- `src/lib/kundali.ts` (`moonLon()`, ~line 137)
- `src/components/KundaliWidget.astro` (inline duplicate)
- All 15 `src/pages/jyotish/*.astro` pages with inline duplicates: kundali, janma-kundali, lagna, horoscope-match, rashi, baby-names, shraddha, sahasra-chandrodaya, kalasarpa, sadesati, mangal-dosha, nakshatra, pancha-pakshi, gemstone, rudraksha.

**Verification:** grep for the literal string `0.003665` across `src/` afterward — every file that currently matches the 15-term terminal pattern (`0.010034*Math.sin(3*Mpr);` with nothing following) should now instead continue through to `0.003665`. Confirm no file is left mid-truncated (partial term list) by diffing each edited function against the canonical one term-for-term.

## 2 & 3. Sunrise/Sunset and Moonrise/Moonset pages

New pages: `src/pages/sunrise-sunset.astro`, `src/pages/moonrise-moonset.astro`.

**Architecture — must be genuinely live, not build-time-only:**
- Astro frontmatter computes an initial server-rendered value for a default location (matching the pattern already used on the homepage), but the page also carries a `<script>` block that:
  - Duplicates the real formulas inline (`sunTrueLongitude`, `sunriseUTC`'s Meeus equation-of-time solar-noon calc, and — for the Moonrise/Moonset page — the real iterative `moonRiseSetUTC()` altitude-crossing solver from `panchang.ts`), per the project's established "client scripts can't import TS modules" constraint.
  - Recomputes on page load using `new Date()` (the visitor's actual current moment, not a build-time snapshot) and the visitor's actual location.
  - Listens for the site-wide `locationchange` event (the same `CustomEvent<Location>` dispatched by the header's LocationPicker and consumed elsewhere, e.g. `index.astro:869`) and recomputes immediately when the visitor changes location — matching the existing Today's Panchang / Kundali Widget live-update pattern.
- Sunrise & Sunset page: today's sunrise, sunset, day length, plus a 7-day-ahead table (computed the same way, for date+0..+6).
- Moonrise & Moonset page: today's moonrise, moonset, plus real moon-phase illumination % (derivable from the Sun–Moon elongation already computed for Tithi), plus a 7-day-ahead table.

**Non-goals:** no interpretive/astrological content on these two pages — they are pure real-data displays, matching the original fix-prompt's scope.

## 4. Four Planets pages

New directory `src/pages/planets/`: `planetary-positions.astro`, `rahu-ketu.astro`, `shani.astro`, `gochara.astro`.

**Live data (shared across all 4):** each page's `<script>` block duplicates the full Keplerian graha-position pipeline from `kundali.ts` (`ORB` elements, `solveKepler`, `helioXY`, the now-26-term `moonLon`, `ayanamsha`, `rahuLon`) to compute, for `new Date()` at the visitor's live location: each graha's current sidereal sign, nakshatra, degree-within-sign, and retrograde status (comparing longitude at `t` vs `t - 1 day`, matching the existing retrograde-detection approach used elsewhere). Recomputes on load and on `locationchange`.

**Planetary Positions page:** a 9-row live table (all grahas) + a short classical-significations paragraph per graha (karakatva — e.g., Surya: soul/vitality/authority; Chandra: mind/emotions/mother; sourced from standard, uncontroversial classical attributions already implicit in the site's existing gemstone/rudraksha copy in `jyotish.ts`, not invented).

**Rahu & Ketu page:** live position for both nodes (always exactly 180° apart) + the classical Gochara (transit) table applied across all 12 Moon-sign rashis (see ruleset below), computed live from the nodes' current sign — i.e. a 12-row table: "Moon sign X → [Favorable / Challenging] because Rahu/Ketu is transiting your Nth house."

**Shani page:** live Saturn position + the classical Saturn Gochara table (Sade Sati / Kantaka Shani / favorable) across all 12 rashis, computed live the same way, plus a link to the existing Shani Sadesati calculator (`/jyotish/sadesati`) for personalized natal-chart detail.

**Gochara page:** a combined 12-rashi × 5-planet (Mars, Jupiter, Saturn, Rahu, Ketu — the classical "slow movers" Gochara theory concerns itself with) grid, each cell a computed label from the same ruleset. No per-cell written prose — every cell's label is derived mechanically from house-distance + the static ruleset, so nothing is invented per rashi/planet combination (avoids the Pancha Pakshi problem of overclaiming specificity).

### Classical Gochara ruleset (the actual rule, stated explicitly so nothing is invented during implementation)

Standard Vedic "Upachaya" transit theory (Phaladeepika / Brihat Parashara Hora Shastra), counting houses from the Moon sign:

- **Mars, Saturn, Rahu, Ketu** (malefics/nodes): houses **3, 6, 11** from Moon = favorable ("Upachaya"). All other houses = challenging, with two extra named states for Saturn specifically: houses **12, 1, 2** = **Sade Sati** (the 7.5-year cycle), house **4 or 8** = **Kantaka Shani**.
- **Jupiter** (benefic): houses **2, 5, 7, 9, 11** from Moon = favorable. Remaining houses = neutral/challenging.

Before hardcoding these tables, cross-check the exact house lists against one independent classical-astrology reference (via `WebFetch`) the same way `GOWRI_NIGHT` was cross-validated against a second source in the truthfulness audit — do not rely on a single memory of the rule.

## 5. Header.astro wiring

Replace the 6 remaining `href="/"` placeholders with real links, in all three required locations (desktop dropdown, mobile drawer, `searchItems` array — per CLAUDE.md's sync convention):

| Label | New href |
|---|---|
| Sunrise & Sunset | `/sunrise-sunset` |
| Moonrise & Moonset | `/moonrise-moonset` |
| Planetary Positions | `/planets/planetary-positions` |
| Rahu & Ketu | `/planets/rahu-ketu` |
| Shani (Saturn) | `/planets/shani` |
| Gochara | `/planets/gochara` |

## 6. Raksha Bandhan 2026 date

Use `WebFetch` against a reliable panchang reference to verify Raksha Bandhan 2026's date (accounting for Bhadra timing rules, per the original audit's note). If confirmed as 2026-08-28 (as the original audit suspected), update `src/lib/festivals.ts:59` from `'2026-08-27'`. If the source confirms 08-27 instead, leave unchanged and record the verification.

## 7. 2027 festival data

Rename `FESTIVALS_2025_2026` → `FESTIVALS_2025_2027` in `src/lib/festivals.ts`, update its one import site (grep for `FESTIVALS_2025_2026`). Add a full 2027 block following the exact per-entry shape of the existing 2025/2026 entries, starting from Makar Sankranti `2027-01-15` (already verified in the original audit). Use `WebFetch` to verify each major festival's 2027 date against a reliable source rather than deriving from the site's own Tithi engine — the original skip reason was specifically that self-computed dates produced an astronomically-impossible result (two consecutive leap months), so external verification is required this time, not just recomputation.

## Testing / verification plan

- `npm run build` must pass (345+ pages currently; expect +6 new pages).
- For the 4 new Planets pages + Sunrise/Sunset + Moonrise/Moonset: manually verify in a running dev server that values change when the location picker is used (confirms `locationchange` wiring is live, not static).
- For the Moon-formula propagation: pick a date near lunar apogee/perigee (where the higher-order terms matter most) and confirm kundali.ts's output now matches panchang.ts's output at the same instant, within the expected sub-0.1° tolerance.
- For Raksha Bandhan / 2027 festivals: record the source URL(s) used for verification in a code comment, consistent with the project's existing "not independently re-verified" comment convention.

## Non-goals

- No gender-aware or unequal-Kala refinements (that's the separate, already-resolved Pancha Pakshi caveat).
- No per-rashi predictive prose paragraphs on the Gochara/Shani/Rahu-Ketu pages — labels only, mechanically derived.
- Not attempting the Gochara rules for Sun/Moon/Mercury/Venus (classical Gochara theory is specifically about the 5 slow-movers listed above).
