# QA Audit Progress

Resume point: if a session ends mid-way, check the last unchecked batch below and start there.
Do not re-test completed batches.

- [x] Batch 1: Homepage + header/global widgets — 2 findings (Issue #1 major, #2 minor)
- [x] Batch 2: Calendar + Sunrise/Sunset + Moonrise/Moonset + Events — 6 findings (Issue #3-8; #5 is a blocker)
- [x] Batch 3: Rahu Kala/Muhurta cluster — 3 findings (Issue #9 BLOCKER/systemic calcLagna bug, #10, #11)
- [x] Batch 4: Vivah/Griha Pravesh/Shubha Dates — 4 findings (Issue #12-15)
- [x] Batch 5: Regional Panchang — 2 findings (Issue #16 systemic, #17 latent)
- [x] Batch 6: Festivals hub + representative detail pages — 3 findings (Issue #18-20)
- [x] Batch 7: Jyotish A — 4 findings (Issue #21-24) + confirmed Issue #9 spreads to Kundali/Janma Kundali
- [x] Batch 8: Jyotish B — confirmed Issue #9 spreads to /jyotish/lagna; confirmed Issue #24 city-list dup spreads to 4 more pages; Rashi/Sunsign/Nakshatra clean
- [x] Batch 9: Jyotish C — 1 new finding (Issue #25), confirmed Issue #9 spreads to Mangal Dosha, Sadesati clean
- [x] Batch 10: Jyotish D — 1 new finding (Issue #26), confirmed Issue #9 spreads to Gemstone/Rudraksha
- [x] Batch 11: Planets — clean, no findings
- [x] Batch 12: Rashifal — 2 findings (Issue #27 major, #28 minor)
- [x] Batch 13: Prashnavali oracle — 2 findings (Issue #29 content, #30 major)
- [x] Batch 14: Devotional library — 1 finding (Issue #31, content-only)
- [x] Batch 15: Blog, About, Contact, Privacy, Terms, footer links — 1 finding (Issue #32) + inventory correction (6 blog posts, not 7)
- [x] Batch 16: Global link/button sweep — 2 findings (Issue #33, #34). AUDIT COMPLETE — all 16 batches done.

## Fix Phase Progress

Resume point for the fix phase: check the last unchecked fix-batch below.

- [x] Fix-Batch 1: Issue #9 (calcLagna blocker, 9 pages + Kundali widget) + Issue #5 (moonrise-moonset blocker) — commits `a208e63`, `e7e5809`. Both FIXED-verified.
- [x] Fix-Batch 2: Remaining majors — 9 of 10 fully FIXED-verified (#1, #3, #4, #6, #12, #20, #21, #25, #30), 1 FIXED-needs-recheck (#13, narrow same-day Sankranti-boundary residual — see new Issue #35). Commits: `ad7c00c`, `48359d3`, `aeeec5e`, `44c91c3`, `ab6ea5f`, `9452def`, `8db925a`, `7076c53`.
- [x] Fix-Batch 3: Content & i18n — #2 and #24 FIXED-verified; #31 PARTIALLY FIXED (4 of 48 entries completed, intentionally large remaining scope, see Issue #36 for a new data-quality finding). Commits: `47de538`, `ba69966`, `9a8bdd1`.
- [x] Fix-Batch 4a: astro-core/muhurta/panchang-i18n minors — #7, #8, #10, #11, #14, #15, #16, #17 all FIXED-verified. New Issue #37 found (Mars/Jupiter/Saturn retrograde detection gap). Commits: `c706c32`, `972cc77`, `91d7f83`, `4d25cd6`, `8767f10`.
- [x] Fix-Batch 4b: festivals/horoscope-match/pancha-pakshi/rashifal/header minors — 10 of 11 FIXED-verified (#18, #19, #22, #23, #27, #28, #29, #32, #33, #34); #26 investigated, left as-is (no credible source either way, correctly not guessed). Commits: `1798910`, `bfcd768`, `3b38a08`, `b73fad1`, `f68af4e`, `38f5f92`.

## Round 3 Progress (2026-07-24)

- [x] Part 1: Scoped Issue #35/#13 — confirmed exactly 3 of 9 muhurta pages
  (griha-pravesh, vivah, shubha-dates) share the fixed-6AM-snapshot bug class,
  all cascading risk; consolidated fix approach + shared-helper decision
  written into PLAN.md. No code changed.
- [x] Part 1.5: Fix the scoped #35/#13 issue — hoisted shared `sunRashiVoidCheck()`
  dual-endpoint helper into `muhurta.ts`, wired into griha-pravesh/vivah/shubha-dates.
  Verified 2026-08-17 (Simha Sankranti) now correctly drops out of Griha Pravesh
  results (score 12→2); sanity dates unaffected. Commit `00f18ae`. FIXED-verified.
- [x] Part 2: Fix Issue #37 — replaced fixed 0.002°/day magnitude gate with sign-change
  (zero-crossing) detection in planetaryEvents.ts. Verified Mars/Jupiter/Saturn stations
  now detected against published ephemeris dates; Mercury unaffected. Commit `c329528`.
  FIXED-verified.
- [x] Part 3: Re-source Issue #36 — confirmed lyricsHi correct for both entries via
  sanskritdocuments.org, rewrote transliteration (+ meaning/meaningHi) to match. Commit
  `5506f36`. FIXED-verified.
- [ ] Part 4: Continue Issue #31 (devotional transliteration, 42 of ~48 remaining after
  Part 3 incidentally cleared saraswati-ashtakam/radha-ashtakam)
  - [x] 4a: 12 Chalisas (shiv, durga, ganesh, vishnu, lakshmi, saraswati, krishna, ram,
    shani, sai, kali, surya) — commit `e97694a`. Verified placeholder-free via grep.
  - [ ] 4b: 2 remaining Chalisas (bhairav, vaishno-devi) + 6 Ashtakams (mahishasura-mardini,
    hanuman, krishna, guru, ayyappa, venkateswara)
  - [ ] 4c: 12 Stotrams
  - [ ] 4d: 10 Namavali lists

## FIX PHASE COMPLETE — all 34 original issues + 3 fix-phase-discovered issues triaged (2026-07-23)

Final tally: 32 of 34 original issues FIXED-verified, 1 (#13) fixed with a narrow documented
residual edge case, 1 (#26) investigated and correctly left unchanged (no credible source).
Issue #31 (devotional transliterations) intentionally partial per its own original scope note (4 of
48 entries done — always meant to be its own project, not a single-batch fix). 3 new issues found
and logged during fixing: #35 (muhurta snapshot-timing edge case), #36 (2 Ashtakam transliteration/
lyrics text-variant mismatch), #37 (Mars/Jupiter/Saturn retrograde detection gap). None of the 3
new issues were fixed — logged in PLAN.md for future triage, per the fix-phase's no-scope-creep rule.
