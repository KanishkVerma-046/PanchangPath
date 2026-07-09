# Status & Resume Doc — Clearing the Skipped Site-Audit Items

**Purpose:** This is the durable, git-committed record of where this multi-session implementation stands. The `.superpowers/sdd/` ledger inside the worktree is gitignored scratch and can be lost (e.g. `git clean -fdx`, worktree deletion); this doc is the fallback source of truth alongside `git log`. Update it whenever task status changes materially (a task completes review, or a new session resumes).

**Plan being executed:** `docs/superpowers/plans/2026-07-08-skipped-audit-fixes.md` (13 tasks). This is the **authoritative** plan for this feature — do not confuse it with `docs/superpowers/plans/2026-07-09-skipped-audit-fixes.md` on `master`, a redundant duplicate written by a later pass of the same session that didn't know this work already existed (see "Known duplicate" below).

**Worktree:** `C:\Users\kanis\Desktop\AI Side Hustles\Panchang Path\.claude\worktrees\skipped-audit-fixes`, branch `worktree-skipped-audit-fixes`, not yet merged to `master`. Executing via `superpowers:subagent-driven-development`.

---

## Task status table

| # | Task | Status | Commits (base..head) | Review |
|---|------|--------|----------------------|--------|
| 1 | Moon formula → `kundali.ts` | ✅ Complete | `4fe5dee..553d3ca` | Clean |
| 2 | Moon formula → `KundaliWidget.astro` | ✅ Complete | `553d3ca..dc98893` | Clean |
| 3 | Moon formula → 15 `jyotish/*.astro` pages | ✅ Complete | `dc98893..a405848` | Clean |
| 4 | Sunrise & Sunset page | ⏳ Not started | — | — |
| 5 | Moonrise & Moonset page | ⏳ Not started | — | — |
| 6 | Planetary Positions page | ⏳ Not started | — | — |
| 7 | Rahu & Ketu page | ⏳ Not started | — | — |
| 8 | Shani (Saturn) page | ⏳ Not started | — | — |
| 9 | Gochara (combined transit) page | ⏳ Not started | — | — |
| 10 | Wire 6 new pages into `Header.astro` | ⏳ Not started | — | — |
| 11 | Raksha Bandhan 2026 date fix | ⏳ Not started | — | — |
| 12 | 2027 festival data | ⏳ Not started | — | — |
| 13 | Final full-site verification | ⏳ Not started | — | — |

Tasks 1-3 verified independently on 2026-07-09 (not just trusted from the ledger): numeric cross-check of `kundali.ts`'s `moonLon` against `panchang.ts`'s canonical formula returned a diff of exactly `0`, and `grep` confirmed all 15 `jyotish/*.astro` pages and `KundaliWidget.astro` carry the full 26-term formula. `npm run build` passes cleanly (346 pages) at this point in history.

## Resume prompt (paste this to resume in a fresh session)

```
Resume executing the implementation plan at
`docs/superpowers/plans/2026-07-08-skipped-audit-fixes.md` using the
superpowers:subagent-driven-development skill, continuing from Task 4.

Work in the existing worktree — do not create a new one:
`C:\Users\kanis\Desktop\AI Side Hustles\Panchang Path\.claude\worktrees\skipped-audit-fixes`
(branch `worktree-skipped-audit-fixes`). If not already there, use
`EnterWorktree` with `path` set to that directory to switch into it.

Before doing anything else, read this status doc:
`docs/superpowers/plans/2026-07-09-skipped-audit-fixes-status.md` (in that
worktree) — it has the authoritative task table. Cross-check against
`.superpowers/sdd/progress.md` in the worktree and `git log` on the
worktree branch; trust git history over any assumption if they disagree.

Remaining: Tasks 4 through 13 (build 6 new pages, wire Header.astro,
2 festival-data fixes, final verification).
```

## Pre-flight decisions already made (do not re-litigate)

- The plan mandates verbatim duplication of the Kepler/orbital-math calculation block across the 4 new Planets pages (Tasks 6-9) and duplicate `sunriseUTC`/`LOCS` boilerplate across Tasks 4-5. This is **intentional and plan-mandated** — it matches the codebase's existing, unavoidable pattern (client-side `<script>` blocks can't import from `src/lib/*.ts`, so all 15 pre-existing `jyotish/*.astro` pages already duplicate this same code inline). Task reviewers may still note it, but it is not a fix-worthy finding.
- The 4 Planets pages (Tasks 6-9) are date-live but **not** location-live: graha ecliptic longitude is geocentric and doesn't depend on observer lat/lng anywhere else in this codebase (only Lagna does, and none of these pages show a Lagna). They recompute from `new Date()` on load but do not wire a `locationchange` listener. This was confirmed with the user during planning (2026-07-09) as an intentional, correct deviation from an earlier looser reading of the design doc.
- The classical Gochara ruleset (Tasks 7-9) is fixed and already cross-verified — do not invent or adjust it: **Mars/Rahu/Ketu favorable = houses 3, 6, 11 from Moon sign (all other houses challenging); Jupiter favorable = houses 2, 5, 7, 9, 11; Saturn: houses 12/1/2 = Sade Sati, house 4 or 8 = Kantaka Shani, houses 3/6/11 = favorable, else challenging.**

## Execution notes for the remaining tasks

- Continue task-by-task in plan order (4, 5, 6, ... 13). Each task's full spec (including complete, ready-to-paste code) is in the plan file — use `scripts/task-brief` to extract each one before dispatching its implementer, per the `subagent-driven-development` skill.
- Model selection: Tasks 4-9 (new pages with complete code already written out in the plan) are transcription + testing — use a cheap model for the implementer. Task 10 (`Header.astro`, multi-location sync) and Tasks 11-12 (`festivals.ts`, multi-file rename, live `WebFetch` verification) warrant a standard-tier model. Task 13 (final verification + `CLAUDE.md` update) is standard-tier too.
- Execute continuously without pausing to ask "should I continue?" between tasks or review cycles, per the skill's continuous-execution guidance and this project's standing preference for autonomous plan execution ([[feedback_autonomous_execution]] in memory).
- After Task 13, dispatch the final whole-branch code reviewer (`superpowers:requesting-code-review`'s template) on the full branch diff against `master`, then use `superpowers:finishing-a-development-branch` to decide how to merge/PR the work back.

## Known duplicate (informational, not actionable yet)

A later pass of this same session — before discovering this worktree already existed — independently re-ran brainstorming + writing-plans from scratch and produced a near-identical plan, committed directly to `master` (not a worktree) as:
- `84b1c9c` "Add design doc..." — **not a duplicate**, this was the original approved design doc, predates both plan-writing passes.
- `10c75ee` "Add implementation plan for clearing remaining skipped site-audit items" on `master`, adding `docs/superpowers/plans/2026-07-09-skipped-audit-fixes.md`.

This is superseded by the plan in this worktree and should be reconciled once this branch is ready to merge — likely by deleting the redundant `2026-07-09-...` plan file from `master` (or from this branch, if `master`'s commit gets rebased in) at merge time, keeping only `2026-07-08-skipped-audit-fixes.md` as the historical record. Not urgent: it's a harmless extra doc file sitting on `master`, unpushed, not referenced by anything.
