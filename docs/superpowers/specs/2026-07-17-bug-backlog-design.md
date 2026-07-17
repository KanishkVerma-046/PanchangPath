# Bug Backlog Document — Design

**Date:** 2026-07-17
**Status:** Approved

## Purpose

The user finds problems on the live site (drikpanchang comparisons, visual
bugs, wrong data, etc.) and reports them one at a time in conversation.
Today those reports either get fixed immediately or are lost once the
conversation ends. This project needs a durable, single place to capture
each reported bug with enough investigation already done that a *future*
Claude Code session (possibly with no memory of this conversation) can pick
up the entry and fix it without re-discovering the root cause from scratch.

This is a documentation/process change, not a code change — no `src/`
files are touched by this work.

## Document

**Location:** `docs/bugs/backlog.md` — one running file, not one-file-per-bug.
Rationale: the existing `docs/audits/notes/*.md` pattern already covers
one-off deep-dive investigations; this doc is a *list* meant to be skimmed
as a whole, which favors a single file with an index.

**Top-of-file index:** a markdown table, newest-reported-first:

| Title | Status | Reported |
|---|---|---|
| ... | Open / Fixed (date) | YYYY-MM-DD |

Each row links (`#anchor`) to its full entry below.

**Entry order:** entries below the index are also newest-first, so new
reports get inserted right after the index/table rather than appended at
the file's end.

## Entry Template

Each bug is an `##` section using this exact shape:

```markdown
## <Short title>

- **Status:** Open
- **Reported:** YYYY-MM-DD
- **Severity:** Low | Medium | High
- **Affected files:** `path/one.ts`, `path/two.astro`

### Description
What was observed — the symptom, which page/URL, repro steps, and (if
given) what the correct/expected value should have been.

### Root cause
What in the code actually causes it: mechanism, not just "the formula is
wrong" — cite the specific function/lines and explain *why* the current
logic produces the wrong result.

### Claude Code Fix Prompt
\`\`\`
<a self-contained prompt a fresh Claude Code session can paste in and run
with. Must include: the problem statement, the confirmed root cause, the
exact file(s)/function(s) to change, what correct behavior looks like, and
how to verify the fix (e.g. "cross-check against drikpanchang.com for
<date>/<city>" or "run npm run build and reload <page>").>
\`\`\`
```

When a bug is later fixed, its `Status` line is edited in place to
`Fixed (YYYY-MM-DD, commit <hash>)` — entries are never deleted, so the
doc doubles as a changelog of what's been found and resolved. The index
table's Status column is updated to match.

**Severity** is assigned by judgment (visual glitch vs. wrong displayed
astronomical data vs. broken page) — no fixed rubric; call it as it looks
when the entry is written.

## Workflow Going Forward

1. User reports a bug (in this session or a future one).
2. Claude investigates the codebase now — reproduces or locates the
   relevant code path, confirms root cause, identifies every affected
   file (checking for the copy-paste duplication this codebase is known
   for, per CLAUDE.md's Gotchas section, e.g. the same formula repeated
   across `jyotish/*.astro` or `muhurta/*.astro`).
3. Claude writes a new entry (using the template above) and prepends it
   to the doc, and adds a row to the index table.
4. No `src/` fix is applied in that pass unless the user separately asks
   for one — this doc's job is to make the *next* fixing session fast,
   not to replace doing the fix now.

## Seeding from CLAUDE.md's Known Issues

CLAUDE.md's "Known Issues" section currently has two open (non-struck-through)
entries; the rest are already resolved and struck through. Both open ones
get seeded into `docs/bugs/backlog.md` as the first two entries, using the
existing audit note `docs/audits/notes/2026-07-16-boundary-drift-followup.md`
as source material (it already contains the root-cause analysis, exact
files, and verification method for both):

1. **`index.astro` inline sunrise/sunset missing Equation-of-Time term.**
   Root cause already documented: `index.astro`'s inline `sunriseUTC()`
   (around line 389) never received the 2026-07 EoT patch that
   `src/lib/panchang.ts` and 5 `muhurta/*.astro` pages got — it still uses
   `const noon = 12 - lng / 15` with no `equationOfTimeMinutes()` term,
   causing the live homepage to show sunrise/sunset ~6 minutes off from the
   site's own already-correct server value.
2. **Tithi/Nakshatra/Yoga/Karana boundary-end-times run ~45min–2.5h too
   early.** Root cause already documented: `estimateEndTime()` in
   `src/lib/panchang.ts` and its duplicate `estimateEnd()` in
   `index.astro` use a single-linear-rate extrapolation instead of an
   iterative boundary search, confirmed via independent third-source
   cross-check (mypanchang.com, NASA JPL-ephemeris-based) to be a genuine
   precision gap rather than inter-method variance.

Both seed entries get `Severity: Medium` (visible, user-facing data
inaccuracy, but not a crash/broken page) and cite the audit note as their
source in the Description section.

## CLAUDE.md Change

Replace the two open bullets in CLAUDE.md's "Known Issues" list with a
single line:

> See `docs/bugs/backlog.md` for the current bug backlog (open and fixed
> issues, with root-cause analysis and ready-to-use fix prompts).

This keeps CLAUDE.md as the entry point future sessions already read, while
making the backlog doc the single detailed source of truth going forward
(avoiding two documents drifting out of sync, which is exactly the kind of
duplication bug this project already struggles with elsewhere).

## Out of Scope

- No `src/` code changes.
- No changes to the already-fixed (struck-through) Known Issues bullets in
  CLAUDE.md.
- No automation/tooling (e.g. a script to reformat entries) — this is a
  hand-maintained markdown file.
