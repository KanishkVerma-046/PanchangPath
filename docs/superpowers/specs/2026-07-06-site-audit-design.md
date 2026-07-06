# PanchangPath Full-Site Audit — Design

## Goal

Produce a single report cataloguing every accuracy bug (measured against drikpanchang.com as the reference implementation) and every broken/dead-end navigation link on PanchangPath, each with a ready-to-paste fix prompt for a future session. This pass produces documentation only — no code fixes are applied as part of this work.

## Scope

### Part 1 — Navigation & dead-link audit (direct, no subagents)

Deterministic, so handled directly with Grep/file checks rather than delegated:

- Enumerate every link in `Header.astro` (desktop dropdown menus, mobile drawer, `searchItems` array), the homepage, and the footer.
- For each link, resolve the target against actual files in `src/pages`. Flag:
  - Links pointing to `/` (homepage) that should point to a real, existing page.
  - Links to pages that don't exist (404s).
  - Links whose destination content doesn't match the link's label.
- Cross-check that Header.astro's three link locations (dropdown / drawer / `searchItems`) stay in sync, per the project's own stated convention.
- Flag orphaned pages: real, built pages with content that aren't reachable from any nav surface.

### Part 2 — Accuracy audit vs drikpanchang.com (parallel subagents, one per family)

Fixed sample inputs, used consistently across all four subagents so results are comparable and reproducible:

- **Sample dates:** 2026-07-06 (today), 2026-10-20 (Diwali week — tests festival-adjacent Panchang), 2027-01-14 (Makar Sankranti — tests a solstice/transit boundary)
- **Sample cities:** New Delhi, Mumbai, Chennai (spread across longitude, to stress-test timezone/Rahu Kalam sensitivity)
- **Sample birth data for Kundali:** one fixed date/time/place, chosen and stated explicitly in the final report so results are reproducible

Subagent breakdown:

1. **Core Panchang** — Tithi, Nakshatra, Yoga, Karana, Rahu Kalam (`src/lib/panchang.ts`, homepage summary panel) vs drikpanchang's daily Panchang page, for each sample date × city.
2. **Kundali / Jyotish calculators** — planet longitudes/rashi placements (`src/lib/kundali.ts` and the 16 `jyotish/*.astro` calculators), with specific attention to the already-logged truncated Moon formula in `gemstone.astro`/`rudraksha.astro`, vs drikpanchang's Kundali/Planet Position tools.
3. **Muhurta tools** — Choghadiya, Hora, Gowri Panchangam, Rahu Kala, Abhijit Muhurat, etc. vs drikpanchang's Muhurta pages, including verifying the two already-logged bugs (wrong Yamaganda table, Gowri Wednesday=Sunday duplicate row).
4. **Regional Panchang + Festivals** — current month/year naming across the 11 regional traditions, and 2025–2026 festival dates, vs drikpanchang's regional and festival-list pages.

**Explicitly excluded from Part 2:** Rashifal and Prashnavali predictions are editorial content, not astronomically calculated against a reference source — they're excluded from accuracy comparison and only checked for functional bugs (broken tabs, wrong links) as part of Part 1. The Devotional Library's text fidelity (Aarti/Chalisa/Stotram lyrics, Namavali lists) is also excluded from re-verification in this pass — that was a deliberate, source-checked effort already; this audit only carries forward the already-logged Namavali padding issue into the report, without re-fetching source texts for ~150 items.

## Output

### Report file

`docs/site-audit-2026-07.md`, structured as:

```markdown
# PanchangPath Site Audit — 2026-07-06

## Summary
[counts: N nav bugs, N accuracy bugs, N already-known-confirmed, N newly found]

## Part 1: Navigation & Dead Links
### [Issue title]
- **Location:** file:line
- **Problem:** what's broken
- **Fix prompt:** ready-to-paste instruction for a future Claude Code session

## Part 2: Accuracy vs drikpanchang.com
### Core Panchang
### Kundali / Jyotish Calculators
### Muhurta Tools
### Regional Panchang & Festivals
[same per-issue structure as Part 1, each including the specific date/city/comparison values that revealed the discrepancy]

## Appendix: Sample inputs used
[dates, cities, birth data — so results are reproducible]
```

Each issue entry must be self-contained enough that a fresh Claude Code session could act on it without reading the rest of the report.

### CLAUDE.md integration

After the report is written, append newly-found issues (that aren't already present) to CLAUDE.md's existing "Known Issues" section, in the same terse bullet style already used there — so future sessions see them automatically without opening the full report.

## Non-goals

- No code fixes applied in this pass — audit and documentation only.
- No re-verification of Devotional Library text fidelity beyond the already-logged Namavali issue.
- No accuracy comparison for Rashifal/Prashnavali (editorial content, not reference-calculable).
