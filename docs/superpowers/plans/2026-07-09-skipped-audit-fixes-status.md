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
| 4 | Sunrise & Sunset page | ✅ Complete | `d72dfb2..cb6db24` | Clean after 1 fix round (CSS border-color/text-color regression) |
| 5 | Moonrise & Moonset page | ✅ Complete | `f43c5f0..6f020a7` | Clean |
| 6 | Planetary Positions page | ✅ Complete | `8afed28..eac3a59` | Clean |
| 7 | Rahu & Ketu page | ✅ Complete | `1259732..bd96599` | Clean |
| 8 | Shani (Saturn) page | ✅ Complete | `d6c7677..3a87d89` | Clean |
| 9 | Gochara (combined transit) page | ✅ Complete | `6b4b73e..87ada8e` | Clean |
| 10 | Wire 6 new pages into `Header.astro` | ✅ Complete | `421dd92..e210d2a` | Clean |
| 11 | Raksha Bandhan 2026 date fix | ✅ Complete | `5d27fc6..860be62` | Clean |
| 12 | 2027 festival data | ✅ Complete | `16f904b..71e96d0` | Clean |
| 13 | Final full-site verification | ✅ Complete | `95b7517..9d97595` | Clean |

Tasks 1-3 verified independently on 2026-07-09 (not just trusted from the ledger): numeric cross-check of `kundali.ts`'s `moonLon` against `panchang.ts`'s canonical formula returned a diff of exactly `0`, and `grep` confirmed all 15 `jyotish/*.astro` pages and `KundaliWidget.astro` carry the full 26-term formula. `npm run build` passes cleanly (346 pages) at this point in history.

Task 4 (`src/pages/sunrise-sunset.astro`) went through one review/fix round: the implementer's first pass dropped `color:var(--color-body-text)` and substituted `--color-hairline` with `--color-body-text` in the 7-day forecast table's border-bottom CSS (a real, if cosmetic, rendering regression). A fix subagent restored the brief's exact CSS; the re-review did a full programmatic line-diff against the brief's code block and confirmed byte-for-byte match, approved clean. Build passes at 346 pages (net +1 from the 345 baseline after Tasks 1-3, since those were formula-only edits with no new pages).

Task 5 (`src/pages/moonrise-moonset.astro`) was clean on the first pass — reviewer confirmed a byte-for-byte `diff` match against the brief's code block (233/233 lines), and independently verified the transcribed `moonLon()`/`moonRiseSetUTC()`/`moonEquatorial()`/`gmstDegrees()` functions and the `computeForDate()` seeding heuristic term-for-term against `src/lib/panchang.ts`'s canonical implementations. Build passes at 347 pages.

Task 6 (`src/pages/planets/planetary-positions.astro`, first of the 4 Planets pages) hit one lost-implementer retry (the harness process exited mid-dispatch with no work landed — re-dispatched cleanly from scratch, no git/file trace of the first attempt) but was otherwise clean on the first review pass — byte-for-byte match to the brief's code, full 3-term ayanamsha and canonical 26-term Moon formula both verified, no location selector/listener present (correct per the location-independence decision below). Build passes at 348 pages.

Task 7 (`src/pages/planets/rahu-ketu.astro`, second Planets page) was clean on the first pass — byte-for-byte match, Ayanamsha/180°-node-relationship/Gochara-bijection all independently verified by hand-tracing the arithmetic, self-contained diff. **Note for future tasks:** both Task 6's and Task 7's implementer self-reported page counts contained arithmetic errors (Task 6 reported 347→348, Task 7 reported "350, +1 from Task 6's 348" — internally inconsistent, 348→350 is +2). The reviewer resolved it with an independent `npm run build`: true count after Task 7 is confirmed 350 pages via direct build, and the actual page-added delta across Tasks 6-7 was +1 each as expected — only the self-reported numbers were unreliable. Going forward, don't trust an implementer's self-reported before/after page count without spot-checking; prefer an independent build when the numbers matter.

Task 8 (`src/pages/planets/shani.astro`, third Planets page) was clean on the first pass — byte-for-byte diff match, ayanamsha and the Sade Sati (12/1/2)/Ashtam Shani (8)/Favorable (3/6/11)/Neutral ruleset all present unmodified, 3/1/3/5 row-count split independently proven via the same bijection argument as Task 7's Gochara table. Build reached 351 pages (+1 from Task 7's 350, as expected — no page-count anomaly this time). A stray `build.log` file left in the worktree by the implementer's build command was deleted before generating the review package (untracked, harmless, not part of any commit).

Task 9 (`src/pages/planets/gochara.astro`, fourth and final Planets page) was clean on the first pass — byte-for-byte diff match; `classifyShani` confirmed byte-identical to Task 8's version (reused, not re-typed and drifted); Jupiter/Mars/Rahu/Ketu/Saturn favorable-house counts across the 12-row grid all independently verified via the same bijection argument used in Tasks 7-8's reviews. Build reached 352 pages, clean working tree, no stray artifacts. **This closes out all 4 new Planets pages (Tasks 6-9).**

Task 10 (`src/components/Header.astro`) was clean on the first pass — all 6 pages (Sunrise & Sunset, Moonrise & Moonset, and the 4 Planets pages) wired into all 3 required sync locations (desktop dropdown, mobile drawer, `searchItems`), replacing the placeholder `href="/"` entries. Reviewer confirmed the `Planets` category trigger link itself was also fixed (not just its 4 dropdown children), verified against the established `Calendars` → `/calendar` pattern, and confirmed no unrelated nav items were touched (19 insertions/14 deletions, surgical diff). Build holds at 354 pages (unchanged, as expected — no new routes added by this task). One Minor note: manual dev-server click-through wasn't observed (no browser tooling in the subagent), but the change is a pure string substitution verified 1:1 against the brief. **This closes out all header nav-sync work.**

Task 11 (`src/lib/festivals.ts:59`) was clean on the first pass. The brief seeded a hypothesized answer (Aug 28) from an earlier planning-session WebSearch, but the implementer was explicitly instructed to treat that as unconfirmed and re-verify independently before touching code — it ran two fresh WebSearch queries plus a direct WebFetch of drikpanchang.com, confirming Shravana Purnima Tithi runs Aug 27 9:08 AM to Aug 28 9:48 AM with Bhadra Kaal ending before sunrise on the 28th (so the full morning is auspicious, no evening/date shift needed), corroborated by ~10+ independent sources. Applied the exact one-line date change + explanatory comment, confirmed array stays date-ascending, `npm run build` succeeds (354 pages, unchanged), and `dist/festivals/raksha-bandhan-2026/index.html` reflects "28 August". Reviewer flagged one follow-up (not a task-11 defect): CLAUDE.md's Known Issues line about this item is now stale ("possibly off by a day... unfixed") and should be updated — deferred to Task 13 (final verification pass), which already covers CLAUDE.md updates per the Model Selection notes below.

Task 12 (`FESTIVALS_2025_2026` → `FESTIVALS_2025_2027` rename + 29 new 2027 festival entries across `src/lib/festivals.ts`, `src/pages/festivals.astro`, `src/pages/calendar.astro`, `src/pages/festivals/[slug].astro`) was clean on the first pass. Per an explicit human decision before dispatch (given the prior abandoned 2027-data attempt over the amanta-month bug, and Task 11 just having caught a real wrong date), the implementer was required to independently re-verify all 29 pre-populated dates via live WebSearch/WebFetch rather than trust the plan's planning-session WebFetch — it did so, cross-referencing 5-10 sources per festival, and found 0 corrections needed. The reviewer did not just accept this claim: it independently re-fetched ~10 of the 29 dates itself (Diwali, Makar Sankranti, Raksha Bandhan, Karwa Chauth, Krishna Janmashtami, and the full 5-day Diwali cluster) and confirmed the report's quoted facts (e.g. exact Sankranti-moment timing language) matched fresh fetches verbatim. Build reached 382 pages (+29, exactly as expected). One out-of-scope finding surfaced and confirmed pre-existing (not introduced by this task): `src/lib/festivals.ts`'s 2025 block has an ordering anomaly — Narak Chaturdashi (`2025-10-21`) is listed after Dhanteras/Diwali (`2025-10-20`) rows, breaking strict date-ascending order; confirmed present in the base commit via `git show` before Task 12 touched anything. Not fixed as part of this task; worth a follow-up look (possibly during Task 13 or a future pass) since Narak Chaturdashi traditionally falls the day *before* Diwali, so a 2025-10-21 date sitting after a 2025-10-20 Diwali entry may itself be a real date error worth independently checking, not just a sort-order cosmetic issue.

Task 13 (final verification + `CLAUDE.md` update) was clean on the first pass — a docs-only diff (confirmed nothing but `CLAUDE.md` changed), both grep sweeps (stale Moon formula, stale `href="/"` nav placeholders) independently re-run by the reviewer with zero matches, and the new Orbital Mechanics "26-term" claim verified correct by direct term-count against `panchang.ts`, `kundali.ts`, `KundaliWidget.astro`, and all 15 `jyotish/*.astro` pages (the file without a Moon formula, `sunsign.astro`, genuinely has none). The 3 "fixed 2026-07" bullet rewrites (nav placeholders, Raksha Bandhan, 2027 data) were checked against the actual Task 10-12 commits and found accurate, not overstated. The new Narak Chaturdashi Known Issue bullet (added per human request, not in the original brief) was verified to match `festivals.ts`'s actual 2025-10-21/2025-10-20 ordering and to read as clearly still-open, matching the section's existing tone. One Minor-only finding: the report's page-count arithmetic reconciliation (353→382) doesn't cleanly match Task 11's own reported 354, traced to `events/[id].astro`'s rolling 365-day window making total page count inherently date-dependent by a page or two — doesn't affect the committed CLAUDE.md text, and the bottom-line 382 was independently confirmed via `find dist -name index.html | wc -l`. No fixes needed.

**PLAN COMPLETE — all 13 tasks done, all reviewed clean.** Next steps (per the standing execution-mode override, both still gated on explicit go-ahead): the final whole-branch review (`superpowers:requesting-code-review`) against `master`, then the merge/PR decision (`superpowers:finishing-a-development-branch`). The "Known duplicate" plan-file cleanup noted below should be reconciled as part of that merge step.

## Resume prompt (paste this to resume in a fresh session, zero prior context needed)

```
The 13-task implementation plan at
`docs/superpowers/plans/2026-07-08-skipped-audit-fixes.md` is FULLY COMPLETE
— all 13 tasks implemented, reviewed clean, and committed (see the task
table and per-task notes in the status doc below for the full review
history). Nothing in that plan needs re-doing. What remains is the final
whole-branch review and the merge/PR decision.

Work in the existing worktree — do not create a new one:
`C:\Users\kanis\Desktop\AI Side Hustles\Panchang Path\.claude\worktrees\skipped-audit-fixes`
(branch `worktree-skipped-audit-fixes`). If not already there, use
`EnterWorktree` with `path` set to that directory to switch into it.

Before doing anything else, read the durable status doc:
`docs/superpowers/plans/2026-07-09-skipped-audit-fixes-status.md` (in that
worktree, committed to git) — it has the full task-by-task review history,
pre-flight decisions, and the "Known duplicate" note about a redundant plan
file on `master`. Cross-check against `.superpowers/sdd/progress.md` in the
worktree (gitignored scratch — may be gone if the worktree was cleaned) and
`git log` on the worktree branch; trust git history over any doc if they
ever disagree, and correct the status doc if it's stale.

**Execution mode — this overrides the skill's own default, follow it
exactly:** treat each of the two remaining steps below as gated on my
explicit go-ahead. Ask before starting each one, name it, wait for my
reply, then run it to completion autonomously (including any fix/re-review
loop) before stopping to ask about the next one. Do not chain them
automatically.

1. **Final whole-branch review** — use `superpowers:requesting-code-review`'s
   template on the full branch diff vs. `master` (`git merge-base master
   HEAD` to `HEAD`), dispatched on the most capable available model per
   that skill's guidance. If it returns findings, dispatch ONE fix subagent
   with the complete findings list (not one fixer per finding), then
   re-review.
2. **Merge/PR decision** — use `superpowers:finishing-a-development-branch`
   to decide how to integrate this branch. As part of that step, ask me how
   to reconcile the "Known duplicate" plan file sitting on `master`
   (`docs/superpowers/plans/2026-07-09-skipped-audit-fixes.md`, added in
   commit `10c75ee` — a redundant plan written by a separate pass of the
   same session before this worktree was discovered; see the "Known
   duplicate" section below for detail). The design doc `84b1c9c` on
   `master` is NOT a duplicate and should stay untouched.

Two follow-up items were logged during this work but are explicitly NOT
part of this plan and NOT blockers — don't act on either unless I ask:
- A possible wrong 2025 Narak Chaturdashi date in `src/lib/festivals.ts`
  (Narak Chaturdashi listed as `2025-10-21`, after Diwali's `2025-10-20`,
  which may be backwards since it should fall the day before Diwali) —
  logged as a new CLAUDE.md Known Issues bullet in Task 13, deliberately
  left unfixed pending independent verification.
- The `master`-branch plan-file duplicate mentioned above.
```

## Pre-flight decisions already made (do not re-litigate)

- The plan mandates verbatim duplication of the Kepler/orbital-math calculation block across the 4 new Planets pages (Tasks 6-9) and duplicate `sunriseUTC`/`LOCS` boilerplate across Tasks 4-5. This is **intentional and plan-mandated** — it matches the codebase's existing, unavoidable pattern (client-side `<script>` blocks can't import from `src/lib/*.ts`, so all 15 pre-existing `jyotish/*.astro` pages already duplicate this same code inline). Task reviewers may still note it, but it is not a fix-worthy finding.
- The 4 Planets pages (Tasks 6-9) are date-live but **not** location-live: graha ecliptic longitude is geocentric and doesn't depend on observer lat/lng anywhere else in this codebase (only Lagna does, and none of these pages show a Lagna). They recompute from `new Date()` on load but do not wire a `locationchange` listener. This was confirmed with the user during planning (2026-07-09) as an intentional, correct deviation from an earlier looser reading of the design doc.
- The classical Gochara ruleset (Tasks 7-9) is fixed and already cross-verified — do not invent or adjust it: **Mars/Rahu/Ketu favorable = houses 3, 6, 11 from Moon sign (all other houses challenging); Jupiter favorable = houses 2, 5, 7, 9, 11; Saturn: houses 12/1/2 = Sade Sati, house 4 or 8 = Kantaka Shani, houses 3/6/11 = favorable, else challenging.**

## Execution notes (historical — all 13 tasks are done, kept for record)

- Model selection actually used: Tasks 4-9 (new pages with complete code already written out in the plan) used a cheap model for the implementer — transcription + testing. Task 10 (`Header.astro`, multi-location sync) and Tasks 11-12 (`festivals.ts`, multi-file rename, live `WebFetch` verification) used a standard-tier model. Task 13 (final verification + `CLAUDE.md` update) used standard-tier too.
- Despite the plan's own text below (written before the resume-cadence override took effect), this session actually ran Tasks 10-13 one at a time with an explicit go-ahead gate before each — see the top-level "Resume prompt" section above and the `feedback_autonomous_execution` memory for why. Any future resumption should follow the current Resume prompt above, not this historical note.
- Remaining next steps (final whole-branch review, then merge/PR decision) are tracked in the Resume prompt section above, not here.

## Known duplicate (informational, not actionable yet)

A later pass of this same session — before discovering this worktree already existed — independently re-ran brainstorming + writing-plans from scratch and produced a near-identical plan, committed directly to `master` (not a worktree) as:
- `84b1c9c` "Add design doc..." — **not a duplicate**, this was the original approved design doc, predates both plan-writing passes.
- `10c75ee` "Add implementation plan for clearing remaining skipped site-audit items" on `master`, adding `docs/superpowers/plans/2026-07-09-skipped-audit-fixes.md`.

This is superseded by the plan in this worktree and should be reconciled once this branch is ready to merge — likely by deleting the redundant `2026-07-09-...` plan file from `master` (or from this branch, if `master`'s commit gets rebased in) at merge time, keeping only `2026-07-08-skipped-audit-fixes.md` as the historical record. Not urgent: it's a harmless extra doc file sitting on `master`, unpushed, not referenced by anything.
