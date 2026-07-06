# PanchangPath Full-Site Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Note on task type:** This plan produces a research/documentation deliverable, not application code. There is no automated test suite to run. Each task's "verification" step is an explicit acceptance checklist instead of a unit test — apply the same rigor (a task is not done until its checklist passes), just don't look for `pytest`/`npm test` invocations.

**Goal:** Produce `docs/site-audit-2026-07.md`, a complete catalogue of navigation/dead-link bugs and drikpanchang.com-verified accuracy bugs on PanchangPath, each issue with a ready-to-paste fix prompt, and fold new findings into `CLAUDE.md`'s Known Issues section.

**Architecture:** Task 1 builds the report skeleton and fills Part 1 (navigation audit) directly via Grep/Glob — deterministic, no subagent needed. Tasks 2–5 each dispatch one fresh research subagent to compare one calculator family against drikpanchang.com for fixed sample inputs, appending its findings to Part 2 of the same report file. Task 6 finalizes the summary/appendix. Task 7 syncs new findings into CLAUDE.md.

**Tech Stack:** Astro v7, TypeScript (`src/lib/*.ts`), no new dependencies.

## Global Constraints

- Report file: `docs/site-audit-2026-07.md` (single file, sections appended task by task — do not create additional report files).
- Sample dates (use exactly these three, no others): `2026-07-06`, `2026-10-20`, `2027-01-14`.
- Sample cities (use exactly these three, no others): New Delhi (28.6139° N, 77.2090° E, IST/UTC+5:30), Mumbai (19.0760° N, 72.8777° E, IST/UTC+5:30), Chennai (13.0827° N, 80.2707° E, IST/UTC+5:30).
- Fixed Kundali birth data (use exactly this, no other): 15 August 1990, 07:30 IST, New Delhi (28.6139° N, 77.2090° E).
- No source code fixes in this plan — every task only writes to `docs/site-audit-2026-07.md` or `CLAUDE.md`. If a task's research reveals a bug, it goes in the report as a finding with a fix prompt; it is never fixed inline.
- Excluded from Part 2 accuracy comparison: Rashifal/Prashnavali (editorial, not reference-calculable) and Devotional Library text fidelity beyond the already-logged Namavali padding issue.
- Every issue entry in the report must follow this exact template (from the approved spec):
  ```markdown
  ### [Issue title]
  - **Location:** file:line
  - **Problem:** what's broken
  - **Fix prompt:** ready-to-paste instruction for a future Claude Code session
  ```
- `WebFetch` cannot return verbatim quoted text (hard ~125-char limit, it summarizes) — this is fine for numeric/factual comparison (e.g. "Tithi ends at 14:32", "Rahu Kalam is 12:00–13:30") but do not rely on it for word-for-word text matching.

---

### Task 1: Report skeleton + Part 1 navigation/dead-link audit

**Files:**
- Create: `docs/site-audit-2026-07.md`
- Read: `src/components/Header.astro` (desktop dropdowns, mobile drawer, `searchItems` array starting at line 1136), `src/layouts/Layout.astro` (footer links), `src/pages/index.astro`
- Reference (do not modify): every file under `src/pages/**/*.astro` — used as the ground truth for "does this route actually exist"

**Interfaces:**
- Produces: `docs/site-audit-2026-07.md` containing a `# PanchangPath Site Audit — 2026-07-06` header, an empty `## Summary` placeholder (`_filled in Task 6_`), and a fully-populated `## Part 1: Navigation & Dead Links` section. Tasks 2–5 will append `## Part 2` subsections after this; Task 6 fills the Summary.

- [ ] **Step 1: Enumerate every real page route**

Run:
```bash
find "src/pages" -name "*.astro" | sort
```
Expected: a list of ~62 files. Keep this list — it's the ground truth for "does this link resolve to a real page."

- [ ] **Step 2: Extract every link target from Header.astro**

Run:
```bash
grep -n 'href=' src/components/Header.astro
```
For every match, note: the link's visible label, its `href` value, and whether it appears in the desktop dropdown, the mobile drawer, or the `searchItems` array (search for `const searchItems = [` at line 1136 onward).

- [ ] **Step 3: Extract footer links**

Run:
```bash
grep -n 'href=' src/layouts/Layout.astro
```
Note the same three fields (label, href, location = "footer") for each match found after the `<footer` tag.

- [ ] **Step 4: Cross-reference every link against the real route list from Step 1**

For each link gathered in Steps 2–3, classify it as one of:
- **OK** — resolves to a real, existing page whose content matches the label (e.g. "Choghadiya" → `/muhurta/choghadiya`).
- **Dead-ends at homepage** — `href="/"` where the label implies a specific feature (e.g. "Sunrise & Sunset" → `/`).
- **404** — points to a path with no matching file under `src/pages`.
- **Mislabeled** — resolves to a real page, but that page's content doesn't match the link's label (e.g. "Compatibility" pointing somewhere other than `/jyotish/horoscope-match`).

CLAUDE.md's "Known Issues" section already names two confirmed mislabeled links ("Baby Names" and "Compatibility" under "Others") and several placeholder `href="/"` items (Sunrise & Sunset, Planetary Positions, Gallery) — confirm these are still present post the `19b4c5b` dead-link-fix commit, and note in your finding whether each is still broken, already fixed, or changed to a different kind of bug.

- [ ] **Step 5: Check the three-location sync convention**

Per CLAUDE.md: "dropdown menus, mobile drawer, and `searchItems` array must all three be updated together whenever a new page/tool is added." For every page found in Step 1 that represents a real feature (exclude `[slug].astro`/`[id].astro`/`[rashi].astro`/`[region].astro` dynamic route templates themselves, but include their static sibling index/hub pages), confirm it appears in all three of: desktop dropdown, mobile drawer, `searchItems`. Flag any page present in one or two locations but missing from the third.

- [ ] **Step 6: Check for orphaned pages**

Cross-reference the full route list from Step 1 against every link found in Steps 2–3 plus any inline links found by searching for `href="/` inside `src/pages/**/*.astro` and `src/components/**/*.astro` (e.g. cards linking to festival/event detail pages). Flag any real, content-bearing page unreachable from any of these.

- [ ] **Step 7: Write the Part 1 section**

Write `docs/site-audit-2026-07.md` with:
```markdown
# PanchangPath Site Audit — 2026-07-06

## Summary

_filled in Task 6_

## Part 1: Navigation & Dead Links

### [one ### subsection per distinct issue found in Steps 4-6, each following the Global Constraints issue template]
```
Every issue must have a concrete `**Fix prompt:**` — e.g. for a dead-ends-at-homepage link:
```markdown
### "Sunrise & Sunset" nav link points to homepage instead of a real page
- **Location:** src/components/Header.astro:<line>
- **Problem:** The "Sunrise & Sunset" item under the [dropdown name] menu has `href="/"`. No dedicated Sunrise & Sunset page exists under src/pages.
- **Fix prompt:** "Either build a src/pages/sunrise-sunset.astro page showing daily sunrise/sunset times per the site's location system, and point Header.astro's 'Sunrise & Sunset' link (desktop dropdown, mobile drawer, and searchItems) at it — or remove the nav item entirely if this feature isn't planned. Follow the existing pattern in src/lib/panchang.ts for astronomical calculations."
```
If Step 4 finds zero remaining issues (everything already fixed by `19b4c5b`), write a short subsection stating that explicitly, with the commit hash, instead of inventing filler content.

- [ ] **Step 8: Commit**

```bash
git add docs/site-audit-2026-07.md
git commit -m "Add Part 1 (navigation/dead-link) findings to site audit report"
```

---

### Task 2: Part 2 — Core Panchang accuracy audit

**Files:**
- Modify: `docs/site-audit-2026-07.md` (append `## Part 2: Accuracy vs drikpanchang.com` header if not present, then `### Core Panchang` subsection)
- Reference: `src/lib/panchang.ts`, `src/components/PanchangSummaryCard.astro`, `src/pages/calendar.astro`

**Interfaces:**
- Consumes: the three sample dates and three sample cities from Global Constraints.
- Produces: a `### Core Panchang` subsection appended to Part 2, using the same issue template as Task 1.

- [ ] **Step 1: Dispatch the research subagent**

Use the Agent tool (`subagent_type: general-purpose`, foreground) with this exact prompt:

```
Audit PanchangPath's core Panchang calculations (Tithi, Nakshatra, Yoga, Karana, Rahu Kalam) against drikpanchang.com, the reference Vedic almanac site, for correctness.

Context: PanchangPath is an Astro+TypeScript site. Its Panchang math lives in src/lib/panchang.ts (Tithi/Nakshatra/Yoga/Karana/Rahu Kalam calculations, Lahiri Ayanamsha via the formula 23.85 + 1.3612*T - 0.000136*T^2 where T = Julian centuries from J2000). The homepage summary panel (src/components/PanchangSummaryCard.astro) and src/pages/calendar.astro consume this library.

Task:
1. Read src/lib/panchang.ts and understand what it computes and how.
2. For each of these 3 dates: 2026-07-06, 2026-10-20, 2027-01-14, and each of these 3 cities: New Delhi (28.6139N, 77.2090E, UTC+5:30), Mumbai (19.0760N, 72.8777E, UTC+5:30), Chennai (13.0827N, 80.2707E, UTC+5:30) — determine PanchangPath's computed Tithi, Nakshatra, Yoga, Karana, and Rahu Kalam window. Do this by writing and running a small standalone Node script that imports the actual functions from src/lib/panchang.ts (Node 22+ supports running TypeScript directly via `node --experimental-strip-types script.ts`, or install/use `npx tsx` if that fails) and calls them with the sample date/location — do not hand-compute the formulas yourself, and do not guess at output; run real code and read its real output.
3. For the same 9 date/city combinations, look up drikpanchang.com's published Tithi, Nakshatra, Yoga, Karana, and Rahu Kalam for that date and city (drikpanchang.com has per-city, per-date Panchang pages — find the equivalent page, e.g. via WebSearch for "drikpanchang panchang [city] [date]" then WebFetch that URL). Note: WebFetch summarizes and cannot quote verbatim, but exact times (like "Rahu Kalam 12:04 PM to 13:38 PM") and named values (like "Nakshatra: Rohini") should come through in its summary — extract those.
4. Compare. Flag any mismatch bigger than a few minutes for time-based values (Tithi end time, Rahu Kalam window) or any outright wrong name (wrong Nakshatra/Yoga/Karana entirely). Minor rounding (under ~5 minutes) is not worth flagging on its own — note it only if it appears systematically across all 9 combinations (suggesting a formula bug, not noise).
5. For anything already listed in this project's CLAUDE.md "Known Issues" section as a Panchang-related bug (check the file at the repo root), confirm whether your testing reproduces it, and say so explicitly rather than re-describing it as new.

Report back, for each confirmed discrepancy, in this exact format:
### [short issue title]
- **Location:** file:line in src/lib/panchang.ts (or wherever the bug lives)
- **Problem:** what's wrong, citing the specific date/city and both the PanchangPath value and the drikpanchang.com value you compared
- **Fix prompt:** a specific, ready-to-paste instruction a future Claude Code session could act on without further research

If you find zero discrepancies beyond already-known issues, say so explicitly and list which known issues you reproduced/confirmed. Keep your report under 800 words. Do not modify any source files — this is a read-only research task.
```

- [ ] **Step 2: Verify the subagent's report meets the acceptance checklist**

Before appending anything, confirm the returned report:
- Cites specific sample dates/cities for every discrepancy claimed (not vague "sometimes wrong").
- Cites both PanchangPath's actual computed value and drikpanchang's actual value being compared, not just "seems off."
- Every issue has all three template fields (Location, Problem, Fix prompt) with real content, not placeholders.

If any of these fail, send the subagent a follow-up message asking it to fill the gap before proceeding.

- [ ] **Step 3: Append to the report**

Append the verified findings to `docs/site-audit-2026-07.md` under a new `## Part 2: Accuracy vs drikpanchang.com` header (create the header only if this is the first Part 2 subsection written) followed by `### Core Panchang` and the issue list.

- [ ] **Step 4: Commit**

```bash
git add docs/site-audit-2026-07.md
git commit -m "Add Core Panchang accuracy findings to site audit report"
```

---

### Task 3: Part 2 — Kundali / Jyotish calculators accuracy audit

**Files:**
- Modify: `docs/site-audit-2026-07.md` (append `### Kundali / Jyotish Calculators` subsection under Part 2)
- Reference: `src/lib/kundali.ts`, `src/components/KundaliWidget.astro`, all 16 files under `src/pages/jyotish/*.astro`

**Interfaces:**
- Consumes: the fixed Kundali birth data from Global Constraints (15 Aug 1990, 07:30 IST, New Delhi).
- Produces: a `### Kundali / Jyotish Calculators` subsection appended to Part 2.

- [ ] **Step 1: Dispatch the research subagent**

Use the Agent tool (`subagent_type: general-purpose`, foreground) with this exact prompt:

```
Audit PanchangPath's Kundali (birth chart) and Jyotish calculator planet-position math against drikpanchang.com for correctness.

Context: PanchangPath (Astro+TypeScript site) computes Vedic astrology positions using Keplerian orbital mechanics in src/lib/kundali.ts (exports jdFull, allTropicalLons, calculateKundali — covers Mercury, Venus, Earth, Mars, Jupiter, Saturn via an ORB constant, plus dedicated polynomial formulas for Moon and Rahu). Lahiri Ayanamsha formula: 23.85 + 1.3612*T - 0.000136*T^2 (T = Julian centuries from J2000). Because this is a static Astro site, the same orbital math is duplicated inline inside <script> blocks across all 16 files under src/pages/jyotish/*.astro (kundali.astro, janma-kundali.astro, gemstone.astro, rudraksha.astro, rashi.astro, sunsign.astro, nakshatra.astro, lagna.astro, mangal-dosha.astro, kalasarpa-yoga.astro, shani-sadesati.astro, baby-names.astro, shraddha-tithi.astro, sahasra-chandrodaya.astro, pancha-pakshi.astro, and the jyotish.astro hub) plus src/components/KundaliWidget.astro — this project's CLAUDE.md explicitly flags this as "a known source of copy-paste drift between pages."

Known pre-existing bug to confirm (don't treat as new): gemstone.astro and rudraksha.astro use a truncated Moon-longitude formula (6 of the 15 correction terms used everywhere else, e.g. in kundali.ts or nakshatra.astro) — can be off by ~0.3 degrees, enough to flip a recommendation near a Rashi/Nakshatra boundary.

Task:
1. Use this fixed birth data for every test: 15 August 1990, 07:30 IST, New Delhi (28.6139N, 77.2090E).
2. Write and run a standalone Node script (`node --experimental-strip-types script.ts`, or `npx tsx` if that fails) that imports calculateKundali (and any helpers it needs) from src/lib/kundali.ts and computes all 9 graha positions (rashi + degree) for the fixed birth data. This is your reference "should be" output from the project's main calculation path.
3. For each of the 16 jyotish/*.astro files plus KundaliWidget.astro, read the inline <script> block's copy of the orbital math and check whether it matches the logic in src/lib/kundali.ts closely enough to produce the same output for the fixed birth data — especially Moon longitude (the known bug) but also check for any OTHER divergence you can find by comparing the inline formulas line-by-line against kundali.ts (missed correction terms, wrong constants, stale Ayanamsha formula per the CLAUDE.md note that several pages use a truncated 2-term Ayanamsha instead of the full 3-term one).
4. Search drikpanchang.com for its Kundali/Panchanga birth chart tool, and look up the planet positions it computes for the same fixed birth data (WebSearch for "drikpanchang kundali" to find the right tool URL, then WebFetch it — you may need to describe the input in your search since WebFetch can't fill out interactive forms; if you can't get drikpanchang to compute this exact chart, instead validate that src/lib/kundali.ts's own output for well-known reference dates is astronomically plausible, e.g. checking the Sun's rashi against known solar calendar boundaries for that date, and focus your report on the copy-paste drift between pages, which doesn't need drikpanchang to verify).
5. Check CLAUDE.md's "Known Issues" section for anything else already logged about Kundali/Jyotish accuracy, and confirm whether it's still present.

Report back, for each confirmed discrepancy, in this exact format:
### [short issue title]
- **Location:** file:line
- **Problem:** what's wrong — for copy-paste drift bugs, name the specific formula/constant that differs and in which file(s)
- **Fix prompt:** a specific, ready-to-paste instruction a future Claude Code session could act on without further research (for drift bugs, say exactly what to copy from which canonical source into which files)

Keep your report under 800 words. Do not modify any source files — this is a read-only research task.
```

- [ ] **Step 2: Verify the subagent's report meets the acceptance checklist**

Same checklist as Task 2 Step 2: specific evidence per claim, both values cited where a numeric comparison was possible, no placeholder fields. Additionally confirm it explicitly addressed the known gemstone/rudraksha Moon-formula bug (reproduced or not) rather than skipping it.

- [ ] **Step 3: Append to the report**

Append under `### Kundali / Jyotish Calculators` in Part 2.

- [ ] **Step 4: Commit**

```bash
git add docs/site-audit-2026-07.md
git commit -m "Add Kundali/Jyotish calculator accuracy findings to site audit report"
```

---

### Task 4: Part 2 — Muhurta tools accuracy audit

**Files:**
- Modify: `docs/site-audit-2026-07.md` (append `### Muhurta Tools` subsection under Part 2)
- Reference: `src/lib/muhurta.ts`, all 9 files under `src/pages/muhurta/*.astro`

**Interfaces:**
- Consumes: the three sample dates and three sample cities from Global Constraints.
- Produces: a `### Muhurta Tools` subsection appended to Part 2.

- [ ] **Step 1: Dispatch the research subagent**

Use the Agent tool (`subagent_type: general-purpose`, foreground) with this exact prompt:

```
Audit PanchangPath's Muhurta (auspicious timing) calculations against drikpanchang.com for correctness.

Context: PanchangPath (Astro+TypeScript site) computes Choghadiya, Shubha Hora, Rahu Kala, Lagna Table, Abhijit Muhurat, Panchaka/Gowri Panchangam, Vivah Muhurat, Griha Pravesh, and Shubha Dates timing tables in src/lib/muhurta.ts, consumed by the 9 pages under src/pages/muhurta/*.astro (choghadiya.astro, hora.astro, rahu-kala.astro, lagna-table.astro, abhijit-muhurat.astro, panchaka.astro, vivah.astro, griha-pravesh.astro, shubha-dates.astro).

Two pre-existing bugs are already logged in this project's CLAUDE.md "Known Issues" — confirm whether both are still present:
1. "Wrong Yamaganda Kalam table" — src/lib/panchang.ts's YAMAGANDA_SLOTS and its duplicate in muhurta/rahu-kala.astro don't match the standard fixed table; produces wrong Yamaganda times most weekdays.
2. "Gowri Panchangam Wednesday = Sunday" — src/lib/muhurta.ts's GOWRI_DAY/GOWRI_NIGHT (and duplicate in muhurta/panchaka.astro) have an identical copy-paste row for Wednesday and Sunday.

Task:
1. Use these 3 dates: 2026-07-06, 2026-10-20, 2027-01-14, and these 3 cities: New Delhi (28.6139N, 77.2090E, UTC+5:30), Mumbai (19.0760N, 72.8777E, UTC+5:30), Chennai (13.0827N, 80.2707E, UTC+5:30).
2. Read src/lib/muhurta.ts. Write and run a standalone Node script (`node --experimental-strip-types script.ts`, or `npx tsx` if that fails) that imports its functions and computes Choghadiya, Hora, Rahu Kala, Yamaganda, and Gowri Panchangam for each of the 9 date/city combinations. Confirm bug #1 and #2 above reproduce in this output (they should show up as: Yamaganda times not matching the standard weekday table, and Wednesday's Gowri row being identical to Sunday's).
3. Look up drikpanchang.com's Choghadiya/Muhurta pages for the same date/city combinations (WebSearch "drikpanchang choghadiya [city] [date]" or similar, then WebFetch) and compare Choghadiya slot times and Rahu Kala/Abhijit Muhurat windows. Flag any mismatch beyond a few minutes.
4. Check whether the standard fixed Yamaganda and Gowri Panchangam tables (the ones drikpanchang and traditional panchang references use — a fixed weekday-based table, not location-dependent) are documented anywhere findable via WebSearch, and if so, note the correct table in your fix prompt for bug #1/#2 so a future session doesn't have to re-derive it.

Report back, for each confirmed discrepancy (including the 2 already-known ones — report whether each is still present, using the exact template below either way), in this exact format:
### [short issue title]
- **Location:** file:line
- **Problem:** what's wrong, citing the specific date/city/comparison values where applicable
- **Fix prompt:** a specific, ready-to-paste instruction a future Claude Code session could act on without further research — for the Yamaganda/Gowri bugs, include the correct table values directly in the fix prompt if you found them, so the future session doesn't need to re-research

Keep your report under 800 words. Do not modify any source files — this is a read-only research task.
```

- [ ] **Step 2: Verify the subagent's report meets the acceptance checklist**

Same checklist as Task 2 Step 2. Additionally confirm both known bugs (Yamaganda, Gowri) were explicitly addressed, not silently dropped.

- [ ] **Step 3: Append to the report**

Append under `### Muhurta Tools` in Part 2.

- [ ] **Step 4: Commit**

```bash
git add docs/site-audit-2026-07.md
git commit -m "Add Muhurta tools accuracy findings to site audit report"
```

---

### Task 5: Part 2 — Regional Panchang & Festivals accuracy audit

**Files:**
- Modify: `docs/site-audit-2026-07.md` (append `### Regional Panchang & Festivals` subsection under Part 2)
- Reference: `src/lib/panchang-i18n.ts`, `src/lib/festivals.ts`, `src/pages/panchang/[region].astro`, `src/pages/panchang/regional.astro`, `src/pages/festivals/[slug].astro`

**Interfaces:**
- Consumes: the three sample dates from Global Constraints (city is less relevant for this family, but use New Delhi if a location is needed).
- Produces: a `### Regional Panchang & Festivals` subsection appended to Part 2.

- [ ] **Step 1: Dispatch the research subagent**

Use the Agent tool (`subagent_type: general-purpose`, foreground) with this exact prompt:

```
Audit PanchangPath's regional Panchang traditions and festival dates against drikpanchang.com for correctness.

Context: PanchangPath (Astro+TypeScript site) supports 11 regional calendar traditions (Bengali, Assamese, Tamil, Malayalam, Marathi, Gujarati, Kannada, Telugu, Odia, Nepali, ISKCON) with metadata and month/year-naming logic in src/lib/panchang-i18n.ts (REGIONS array), rendered per-region at src/pages/panchang/[region].astro and previewed at src/pages/panchang/regional.astro. Festival data (2025-2026) with slugs/dates lives in src/lib/festivals.ts, rendered at src/pages/festivals/[slug].astro.

One pre-existing bug is already logged in this project's CLAUDE.md "Known Issues" — confirm whether it's still present:
"/panchang/regional shows wrong current month for 6 of 11 traditions (mr/gu/kn/te/or/iskcon) — panchang/regional.astro does Object.keys({...})[name] (indexes an array by a string key, always undefined) instead of ({...})[name]. The correct pattern already exists in the sibling page panchang/[region].astro."

Task:
1. Read src/lib/panchang-i18n.ts and src/pages/panchang/regional.astro and src/pages/panchang/[region].astro. Confirm whether the Object.keys bug above is still present by reading the current code (this may be a quick read-only confirm, not something requiring a live run) — report exactly which of the 11 regions are affected right now.
2. Read src/lib/festivals.ts. For each of these 3 dates' surrounding months — 2026-07 (around 2026-07-06), 2026-10 (around 2026-10-20), 2027-01 (around 2027-01-14) — list what festivals PanchangPath has scheduled, and look up drikpanchang.com's festival calendar for the same months (WebSearch "drikpanchang festival calendar 2026" or similar, then WebFetch relevant pages) to check whether PanchangPath's festival dates match. Pay special attention to major festivals near these windows (Diwali/Deepavali in Oct 2026, Makar Sankranti in Jan 2027) since a prior commit (19b4c5b) already fixed "incorrect 2026 festival dates" — check whether any 2026-2027 dates are still wrong, or whether new ones were introduced.
3. For 2-3 of the 11 regional traditions, spot-check whether the regional month name/year-naming logic in panchang-i18n.ts produces plausible output for the sample dates (e.g. does the Tamil month name for 2026-07-06 match what drikpanchang or another reference source calls that period).

Report back, for each confirmed discrepancy (including the already-known Object.keys bug — report its current status either way), in this exact format:
### [short issue title]
- **Location:** file:line
- **Problem:** what's wrong, citing specific dates/regions and both PanchangPath's value and the reference value where applicable
- **Fix prompt:** a specific, ready-to-paste instruction a future Claude Code session could act on without further research

Keep your report under 800 words. Do not modify any source files — this is a read-only research task.
```

- [ ] **Step 2: Verify the subagent's report meets the acceptance checklist**

Same checklist as Task 2 Step 2. Additionally confirm the Object.keys regional-month bug status was explicitly reported.

- [ ] **Step 3: Append to the report**

Append under `### Regional Panchang & Festivals` in Part 2.

- [ ] **Step 4: Commit**

```bash
git add docs/site-audit-2026-07.md
git commit -m "Add Regional Panchang and Festivals accuracy findings to site audit report"
```

---

### Task 6: Finalize report — Summary and Appendix

**Files:**
- Modify: `docs/site-audit-2026-07.md` (replace the `_filled in Task 6_` placeholder with real content; add a final `## Appendix: Sample inputs used` section)

**Interfaces:**
- Consumes: every issue heading (`###`) written by Tasks 1–5, present in the file on disk.
- Produces: a complete, placeholder-free `docs/site-audit-2026-07.md`.

- [ ] **Step 1: Count issues by category**

Run:
```bash
grep -c '^### ' docs/site-audit-2026-07.md
```
and separately count `###` headings under Part 1 vs each Part 2 subsection (open the file and count manually per section — the file is short enough to read directly). Also classify each issue as "newly found" vs "confirms an already-known CLAUDE.md issue" based on the subagent reports from Tasks 2–5.

- [ ] **Step 2: Write the Summary section**

Replace `_filled in Task 6_` with real counts, e.g.:
```markdown
## Summary

- **Navigation & dead links:** N issues found (N dead-ends-at-homepage, N mislabeled, N orphaned)
- **Accuracy vs drikpanchang.com:** N issues found across Core Panchang, Kundali/Jyotish, Muhurta, Regional/Festivals
- **Already-known issues confirmed still present:** N (list which ones from CLAUDE.md)
- **Already-known issues found fixed:** N (list which ones, so CLAUDE.md can be updated)
- **Newly found issues:** N
```
Use real numbers from Step 1, not placeholder text.

- [ ] **Step 3: Write the Appendix**

Add at the end of the file:
```markdown
## Appendix: Sample inputs used

- **Dates:** 2026-07-06, 2026-10-20, 2027-01-14
- **Cities:** New Delhi (28.6139N, 77.2090E, UTC+5:30), Mumbai (19.0760N, 72.8777E, UTC+5:30), Chennai (13.0827N, 80.2707E, UTC+5:30)
- **Kundali birth data:** 15 August 1990, 07:30 IST, New Delhi (28.6139N, 77.2090E)
```

- [ ] **Step 4: Placeholder scan**

Run:
```bash
grep -in 'TBD\|TODO\|placeholder\|filled in' docs/site-audit-2026-07.md
```
Expected: no matches. If any match, go back and fill in real content.

- [ ] **Step 5: Commit**

```bash
git add docs/site-audit-2026-07.md
git commit -m "Finalize site audit report with summary counts and appendix"
```

---

### Task 7: Sync new findings into CLAUDE.md Known Issues

**Files:**
- Modify: `CLAUDE.md` (the "Known Issues" section, currently a bullet list near the end of the file)

**Interfaces:**
- Consumes: the finalized `docs/site-audit-2026-07.md` from Task 6 — specifically, the issues classified as "newly found" and the issues classified as "already-known issue found fixed."

- [ ] **Step 1: Read the current Known Issues section**

Read `CLAUDE.md` and locate the `## Known Issues` section (currently 8 bullets, each starting with a bolded short title).

- [ ] **Step 2: Add newly-found issues**

For each issue in the audit report classified as "newly found" (from Task 6's Summary), append one bullet to `CLAUDE.md`'s Known Issues section, in the same terse style as the existing bullets (bolded short title, one-sentence description, file reference — no fix prompt text, that belongs only in the audit report). Example style to match:
```markdown
- **[Short bolded title]** — [one sentence describing the bug and its file location].
```

- [ ] **Step 3: Remove or annotate issues found already-fixed**

For each existing bullet in Known Issues that the audit confirmed is now fixed (e.g. if the dead-link issues were fully resolved by commit `19b4c5b`), remove that bullet — CLAUDE.md's Known Issues should reflect current reality, not history. Do not leave a "(fixed)" bullet lingering; delete it, since git history already records when/how it was fixed.

- [ ] **Step 4: Verify the section still reads cleanly**

Read the edited Known Issues section back and confirm: no duplicate bullets, no bullet referencing a fix prompt (that's the audit report's job, not CLAUDE.md's), each bullet is one or two sentences max matching the existing terse style.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "Update Known Issues with findings from 2026-07 site audit"
```

---

## Self-Review Notes

- **Spec coverage:** Task 1 covers Part 1 (nav/dead-link audit) from the spec. Tasks 2–5 cover the 4 named subagent families from Part 2 (Core Panchang, Kundali/Jyotish, Muhurta, Regional+Festivals). Task 6 covers the Summary/Appendix from the spec's report structure. Task 7 covers the spec's "CLAUDE.md integration" requirement. Rashifal/Prashnavali and Devotional Library re-verification are correctly excluded per the spec's non-goals.
- **Placeholder scan:** No TBD/TODO markers in this plan; every subagent prompt is fully written out verbatim rather than summarized, per the "no placeholders" rule.
- **Type/interface consistency:** All 5 report-writing tasks (1–5) target the same file, `docs/site-audit-2026-07.md`, with non-overlapping sections (Part 1; Part 2 → Core Panchang; Part 2 → Kundali/Jyotish; Part 2 → Muhurta; Part 2 → Regional/Festivals), so append-only edits across tasks don't conflict. Task 6 depends on all `###` headings already existing on disk, which Tasks 1–5 guarantee.
