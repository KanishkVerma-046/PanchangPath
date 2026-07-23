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
- [ ] Fix-Batch 4: Remaining minors — #7, #8, #10, #11, #14, #15, #16, #17, #18, #19, #22, #23, #26, #27, #28, #29, #32, #33, #34
