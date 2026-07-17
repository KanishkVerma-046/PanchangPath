# Bug Backlog Document Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `docs/bugs/backlog.md`, a single running bug-tracking document seeded with the two currently-open issues from CLAUDE.md's Known Issues list, and point CLAUDE.md at it.

**Architecture:** One new markdown file with an index table plus per-bug sections (status, description, root cause, ready-to-paste Claude Code fix prompt). CLAUDE.md's two open Known Issues bullets are replaced with a one-line pointer to the new file. No `src/` files are touched.

**Tech Stack:** Markdown only.

## Global Constraints

- No `src/` (application code) files are modified by this plan — documentation only.
- The backlog lives in exactly one file: `docs/bugs/backlog.md` (not one-file-per-bug).
- Index table and entries are ordered newest-reported-first; new entries are inserted, never appended at the end.
- Entries are never deleted when fixed — `Status` is edited in place to `Fixed (YYYY-MM-DD, commit <hash>)`.
- Full spec: `docs/superpowers/specs/2026-07-17-bug-backlog-design.md`.

---

### Task 1: Create `docs/bugs/backlog.md` seeded with the two open CLAUDE.md issues

**Files:**
- Create: `docs/bugs/backlog.md`

**Interfaces:**
- Produces: the file `docs/bugs/backlog.md`, containing an index table with anchors `#indexastro-inline-sunrisesunset-missing-equation-of-time-term` and `#tithinakshatrayogakarana-boundary-end-times-run-45min25h-too-early`, each matching an `##` section below it. Task 2 references these two entries by name only (no code interface), so exact anchor text isn't load-bearing for Task 2 — just keep the index table's two rows and the two `##` headings using the same title text.

- [ ] **Step 1: Write the file**

Create `docs/bugs/backlog.md` with this exact content:

```markdown
# Bug Backlog

Running log of bugs found on the live site. Each entry captures enough
investigation (root cause, affected files) that a future Claude Code
session can fix it without re-discovering the problem from scratch. See
`docs/superpowers/specs/2026-07-17-bug-backlog-design.md` for the format
this file follows.

Entries are ordered newest-reported-first. When a bug is fixed, its
`Status` line is updated in place — entries are never deleted.

| Title | Status | Reported |
|---|---|---|
| [Tithi/Nakshatra/Yoga/Karana boundary end-times run 45min–2.5h too early](#tithinakshatrayogakarana-boundary-end-times-run-45min25h-too-early) | Open | 2026-07-16 |
| [`index.astro` inline sunrise/sunset missing Equation-of-Time term](#indexastro-inline-sunrisesunset-missing-equation-of-time-term) | Open | 2026-07-16 |

---

## Tithi/Nakshatra/Yoga/Karana boundary end-times run 45min–2.5h too early

- **Status:** Open
- **Reported:** 2026-07-16
- **Severity:** Medium
- **Affected files:** `src/lib/panchang.ts` (`estimateEndTime()`), `src/pages/index.astro` (duplicate inline `estimateEnd()`)

### Description
The Tithi, Nakshatra, Yoga, and Karana "ends at" times shown on the site
run systematically earlier than reality: confirmed via an independent
third-source cross-check (mypanchang.com, which computes from NASA JPL
DE405 ephemeris data — an unrelated computational lineage from
drikpanchang.com) for New Delhi, 2026-07-14. drikpanchang.com and
mypanchang.com agree with each other to within about a minute on every
field, while this site's live values are earlier by ~45 minutes
(Tithi/Karana), ~2.5 hours (Nakshatra), and ~45 minutes (Yoga):

| Field | PanchangPath (live) | drikpanchang.com | mypanchang.com |
|---|---|---|---|
| Tithi ends | 3:57 PM | 3:12 PM | 3:13:22 PM |
| Nakshatra ends | 2:44 AM (+1d) | 12:09 AM (+1d) | 12:09:26 AM (+1d) |
| Yoga ends | 12:42 PM | 11:57 AM | 11:56:33 AM |
| Karana ends | 3:57 PM | 3:12 PM | 3:13:22 PM |

Full method, data, and root-cause notes:
`docs/audits/notes/2026-07-16-boundary-drift-followup.md`.

### Root cause
`estimateEndTime()` in `src/lib/panchang.ts`, and its duplicate
`estimateEnd()` in `src/pages/index.astro`'s inline `<script>` block (client
scripts in static Astro can't import from `src/lib`, so the logic is
intentionally duplicated — see CLAUDE.md's Gotchas), both use a
single-linear-rate extrapolation:
`(degPerUnit - (lon % degPerUnit)) / assumedRate`, assuming a constant rate
of angular change (~13.17°/day for the Moon) from the current moment all
the way to the boundary crossing. Over the multi-hour spans involved this
produces a real, consistent error — not legitimate inter-method variance,
per the third-source cross-check. `index.astro`'s copy additionally passes
a Yoga-specific rate of `14.17` (Moon ~13.17 + Sun ~1, since Yoga is a
combined Sun+Moon angle) while `panchang.ts`'s version hardcodes `13.17`
for all four elements — the two copies already disagree with each other
on Yoga independent of the drikpanchang comparison.

### Claude Code Fix Prompt
```
Fix a precision bug in PanchangPath's Tithi/Nakshatra/Yoga/Karana
boundary-end-time calculations: they run ~45 minutes to ~2.5 hours
earlier than two independent reference sources (drikpanchang.com and
mypanchang.com, which agree with each other to within ~1 minute).

Context: boundary end-times are computed by estimateEndTime() in
src/lib/panchang.ts, and duplicated as estimateEnd() in
src/pages/index.astro's inline <script> block. Both currently use a
single-linear-rate extrapolation: (degPerUnit - (lon % degPerUnit)) /
assumedRate, assuming a constant rate of angular change (~13.17 deg/day
for the Moon) from the current moment to the boundary crossing. This is
insufficiently precise -- confirmed via a third-source cross-check
(docs/audits/notes/2026-07-16-boundary-drift-followup.md) using
mypanchang.com (NASA JPL DE405 ephemeris) against drikpanchang.com for
New Delhi, 2026-07-14: both external sources agree to the minute, while
this site's live values differ by 45min (Tithi/Karana), 2.5h
(Nakshatra), ~45min (Yoga).

Task: Replace the single-linear-rate extrapolation in estimateEndTime()
(src/lib/panchang.ts) with an iterative boundary-search approach -- the
same pattern this codebase already uses successfully for
moonRiseSetUTC() (find and follow that function's iterative-refinement
style). At each iteration, recompute the actual instantaneous rate of
change of the relevant angle (Moon longitude for Tithi/Nakshatra/Karana;
combined Sun+Moon angle for Yoga) rather than assuming a fixed rate, and
narrow in on the exact crossing time. Apply the same fix to the
duplicate estimateEnd() in src/pages/index.astro. While there, reconcile
the two copies' Yoga rate handling: index.astro's estimateEnd() passes
an explicit 14.17/day rate for Yoga (Moon ~13.17 + Sun ~1) while
panchang.ts's estimateEndTime() hardcodes 13.17 for all four elements --
the new iterative approach should make both copies agree exactly for all
four elements, so pick one physically-correct model per element type and
use it in both files.

Verify: run npm run build. Reproduce the New Delhi, 2026-07-14 case from
docs/audits/notes/2026-07-16-boundary-drift-followup.md and confirm the
new end-times land within ~1-2 minutes of: Tithi 3:12-3:13 PM, Nakshatra
~12:09 AM (+1 day), Yoga ~11:56-11:57 AM, Karana 3:12-3:13 PM. Also
spot-check one or two additional dates against drikpanchang.com to
confirm the fix generalizes, not just for this one date. Update this
bug's Status line in docs/bugs/backlog.md to "Fixed (<date>, commit
<hash>)" once verified.
```

---

## `index.astro` inline sunrise/sunset missing Equation-of-Time term

- **Status:** Open
- **Reported:** 2026-07-16
- **Severity:** Medium
- **Affected files:** `src/pages/index.astro` (inline `sunriseUTC()`, around line 389)

### Description
The live homepage displays sunrise/sunset times ~6 minutes off from the
site's own already-correct server-computed value. Confirmed 2026-07-16 via
a standalone Node reproduction of both the server (`src/lib/panchang.ts`)
and client (`src/pages/index.astro`) sunrise formulas for New Delhi,
2026-07-14: server value 5:33 AM / 7:21 PM (matches both drikpanchang.com
and mypanchang.com exactly); live client-rendered value 5:27 AM / 7:16 PM.
Full method and numbers: `docs/audits/notes/2026-07-16-boundary-drift-followup.md`.

### Root cause
`src/pages/index.astro`'s inline `<script>` block defines its own copy of
`sunriseUTC()` (client-side scripts in static Astro can't import from
`src/lib`, so the math is intentionally duplicated — see CLAUDE.md's
Gotchas), around line 389, using `const noon = 12 - lng / 15;` with no
equation-of-time term at all. When `src/lib/panchang.ts`'s `sunriseUTC()`
was fixed in 2026-07 to add `equationOfTimeMinutes()`, the fix was
propagated to 5 `muhurta/*.astro` pages but this inline copy in
`index.astro` was missed — CLAUDE.md's Known Issues log of that fix does
not list `index.astro` among the files it reached.

### Claude Code Fix Prompt
```
Fix a bug in PanchangPath: the homepage (src/pages/index.astro)'s inline
client-side sunrise/sunset calculation is missing the Equation-of-Time
correction that src/lib/panchang.ts's sunriseUTC() already has.

Context: src/lib/panchang.ts has equationOfTimeMinutes() and a
sunriseUTC() that uses it (this is the correct, already-fixed version --
do not change panchang.ts). src/pages/index.astro has its own duplicate
inline copy of sunriseUTC() inside a <script> block (client-side scripts
in static Astro can't import from src/lib, so the logic is intentionally
duplicated -- see CLAUDE.md's Gotchas). That inline copy still uses
const noon = 12 - lng / 15; with no equation-of-time term, so the live
homepage shows sunrise/sunset roughly 6 minutes off from the
server-rendered value.

Task: Find the inline sunriseUTC() (and any inline solarNoonUTC() it
depends on) in src/pages/index.astro's <script> block (around line 389).
Add an inline copy of equationOfTimeMinutes() (copy its exact
implementation from src/lib/panchang.ts) into the same script block, and
use it in the inline sunriseUTC()/solarNoonUTC() the same way panchang.ts
does, so the client-side and server-side sunrise/sunset values match.

Verify: run npm run build, then load the homepage locally (via astro
dev) for a known date/location (e.g. New Delhi, 2026-07-14) and confirm
the displayed sunrise/sunset (should be ~5:33 AM / ~7:21 PM) matches what
src/lib/panchang.ts computes for the same inputs, and matches
drikpanchang.com/mypanchang.com for that date (~5:33 AM / ~7:20-7:21 PM).
Full reference numbers and method are in
docs/audits/notes/2026-07-16-boundary-drift-followup.md.

Also grep the rest of the codebase (jyotish/*.astro, other
muhurta/*.astro not already fixed) for other inline sunriseUTC() copies
that might have the same gap, per this project's known copy-paste-drift
pattern (see CLAUDE.md Gotchas) -- fix any you find the same way. Update
this bug's Status line in docs/bugs/backlog.md to "Fixed (<date>, commit
<hash>)" once verified.
```
```

- [ ] **Step 2: Verify the file's structure**

Run:
```bash
grep -n "^## " "docs/bugs/backlog.md"
```
Expected output (two headings, matching the two index-table link targets exactly):
```
5:## Tithi/Nakshatra/Yoga/Karana boundary end-times run 45min–2.5h too early
```
(and one more line for the `index.astro` heading). If the heading text does
not match the index table's link text exactly, fix the mismatch.

Then confirm no placeholder markers slipped in:
```bash
grep -n "TBD\|TODO\|FIXME" "docs/bugs/backlog.md"
```
Expected: no output (empty).

- [ ] **Step 3: Commit**

```bash
git add docs/bugs/backlog.md
git commit -m "$(cat <<'EOF'
Add bug backlog document, seeded with two open Panchang precision issues

Captures root-cause analysis and ready-to-paste Claude Code fix prompts
for the index.astro sunrise/sunset EoT gap and the Tithi/Nakshatra/Yoga/
Karana boundary-time precision gap, both previously listed only as
prose bullets in CLAUDE.md's Known Issues.
EOF
)"
```

---

### Task 2: Point CLAUDE.md's Known Issues at the new backlog doc

**Files:**
- Modify: `CLAUDE.md` (the two open Known Issues bullets, currently reading
  `- **\`index.astro\`'s inline client-side sunrise/sunset calculation still lacks the Equation-of-Time term** ...`
  and
  `- **Tithi/Nakshatra/Yoga/Karana boundary-end-times run ~45min–2.5h earlier than they should** ...`)

**Interfaces:**
- Consumes: `docs/bugs/backlog.md` from Task 1 (only as a filename/URL
  reference in prose — no code interface).

- [ ] **Step 1: Replace the two bullets**

In `CLAUDE.md`'s "Known Issues" section, find these two full bullets (each
currently spans several lines of prose) and delete both of them in their
entirety:

```markdown
- **`index.astro`'s inline client-side sunrise/sunset calculation still lacks the Equation-of-Time term** — the fix above did not reach it: `index.astro`'s inline `sunriseUTC()` (around line 389, `const noon = 12 - lng / 15;`) never received the `equationOfTimeMinutes()` patch, so the live homepage displays sunrise/sunset ~6 min off from `panchang.ts`'s already-fixed server value. Confirmed 2026-07-16 during Task 12's third-source cross-check (mypanchang.com), documented in `docs/audits/notes/2026-07-16-boundary-drift-followup.md`; not yet fixed (no code changed, per that task's research-only scope).
- **Tithi/Nakshatra/Yoga/Karana boundary-end-times run ~45min–2.5h earlier than they should** — confirmed 2026-07-16 via an independent third-source cross-check (mypanchang.com, NASA JPL-ephemeris-based, agreeing with drikpanchang.com to within ~1 minute on every field) that this is a genuine precision gap in `estimateEndTime()` (`src/lib/panchang.ts`) and its duplicate `estimateEnd()` (`index.astro`), not inter-method variance — likely needs an iterative boundary-search approach instead of the current single-linear-rate extrapolation. Full method, data, and root-cause notes in `docs/audits/notes/2026-07-16-boundary-drift-followup.md`; not yet fixed.
```

Replace them with this single line, inserted at the same position (top of
the Known Issues list, where the deleted bullets were):

```markdown
- See `docs/bugs/backlog.md` for the current bug backlog (open and fixed issues, each with root-cause analysis and a ready-to-use Claude Code fix prompt) — includes the `index.astro` sunrise/sunset Equation-of-Time gap and the Tithi/Nakshatra/Yoga/Karana boundary-time precision gap.
```

- [ ] **Step 2: Verify the replacement**

Run:
```bash
grep -n "docs/bugs/backlog.md" "CLAUDE.md"
```
Expected: one match, the new pointer line.

```bash
grep -n "boundary-end-times run" "CLAUDE.md"
```
Expected: no output (the old bullet text is gone from CLAUDE.md; it now
lives only in `docs/bugs/backlog.md`).

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
Point CLAUDE.md Known Issues at new docs/bugs/backlog.md

Replaces the two open Known Issues bullets (sunrise/sunset EoT gap,
boundary-time precision gap) with a pointer to the new backlog doc,
which now carries the full detail as the single source of truth.
EOF
)"
```
