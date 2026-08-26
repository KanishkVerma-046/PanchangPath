# Three-Initiative Scoping Report (2026-08-26)

Investigation-only pass, no code/content changed. Each section is a standalone brief a future dedicated execution session can lift directly. Do not treat any section as "ready to run" without re-reading its own open questions first — several require a product/data decision before implementation starts.

---

## Initiative 1 — Ayanamsha polynomial replacement

### Current state
`src/lib/astro-core.ts:50-53` computes Lahiri ayanamsha via a 3-term hand-fit polynomial (`23.85 + 1.3612*T - 0.000136*T²`). A prior session quantified a confirmed ~1 arcminute drift today (growing slowly) against Swiss-Ephemeris-grade references, via a 75-year-baseline fit cross-checked against the IAU 1976 precession constant.

### What astronomy-engine offers
No library (including this one) exports a ready-made "ayanamsha" function — it's a Vedic-astrology convention, not a general-astronomy concept. But `node_modules/astronomy-engine` exposes the right primitives:
- `Rotation_EQJ_ECT(time)` — rotation from the J2000 mean equator/equinox frame to the *true ecliptic of date* (bakes in IAU 2006/P03 precession + nutation).
- `RotateVector(rotation, vector)` + `Vector` class, `MakeTime(date)`.
- `MakeTime()` accepts the same "raw number = UT days since J2000" convention `astro-core.ts` already uses everywhere else — no new epoch-handling class of bug.

**Derivation method (empirically verified in a scratch probe):** rotate the fixed J2000 mean-equinox vector `(1,0,0)` into the true-ecliptic-of-date frame via `Rotation_EQJ_ECT`, read off `atan2(y,x)`. Compared old-vs-new (calibrated to match at J2000) across 1900–2100:

| year | old (deg) | new, calibrated (deg) | diff (arcsec) |
|---|---|---|---|
| 1900 | 22.48866 | 22.46215 | 95.4 |
| 1975 | 23.50969 | 23.50937 | 1.2 |
| 2000 | 23.85000 | 23.85000 | 0 (anchor) |
| 2026 | 24.20390 | 24.21863 | -53.0 |
| 2100 | 25.21106 | 25.25200 | -147.4 |

The two curves agree near 1975–2000 and diverge in both directions away from it — the textbook signature of a locally-fit polynomial extrapolating poorly. The 2026 magnitude (~53″ ≈ 0.9′) independently corroborates the previously-flagged ~1′ drift via a completely different method.

### Consumer map — single point of change, confirmed
100% of ayanamsha usage funnels through `lahiriAyanamsha(jd)` in `astro-core.ts`. No inline duplicate formula exists anywhere else in `src/` (consistent with the documented 2026-07-21 consolidation).
- `panchang.ts` imports and re-exports it verbatim; most pages import "from panchang" without knowing it lives in astro-core.
- `kundali.ts` imports directly (`allTropicalLons`, `calculateKundali`).
- 24 files call it directly or via `panchang.ts`; 8 more consume it indirectly via `allTropicalLons`/`calculateKundali` (including `planetaryEvents.ts`, which reads `.ayanamsha` off snapshots for sidereal-crossing detection — the one consumer worth an explicit regression check, since it's a search/detection algorithm, not a direct display value).

**Conclusion: swapping the function body with the same `(jd: number) => number` signature requires zero changes in any of the 32+ consumer files.**

### Migration plan
1. Add imports (`MakeTime`, `Rotation_EQJ_ECT`, `RotateVector`, `Vector`) to `astro-core.ts`.
2. Replace `lahiriAyanamsha(jd)`'s body with the rotation-derivation + a pinned calibration constant. Temporarily keep the old formula as `lahiriAyanamshaLegacy` for the diff pass, delete once verified.
3. No consumer-file changes.
4. Update CLAUDE.md's Ayanamsha section per the project's existing "~~strikethrough~~ + dated note" convention for closed-out issues.

### Verification strategy
1. Old-vs-new diff sweep, 1900–2100, scratch script — confirm no discontinuity/sign-flip beyond the expected smooth drift-correction shape.
2. **Anchor the calibration constant independently**, not just against the old formula's own J2000 value — cross-check against 2-3 dates already independently verified elsewhere in this project (e.g. drikpanchang-cross-checked festival Tithi/Sankranti crossings, or the Pitru Paksha calendar in `shraddha.astro`).
3. Regression-check boundary-sensitive outputs specifically: Rashi boundaries (30°), Nakshatra/Pada boundaries (13°20′/3°20′) — a ~1′ shift is exactly where a borderline case can flip.
4. `npm run build`, then live-verify a handful of pages (Kundali, Panchang summary, a couple of Jyotish calculators) via `curl -sL` per the project's established live-verification pattern.
5. Re-run `planetaryEvents.ts`'s sidereal-crossing scan across a wide range, confirm no spurious/missing transit events appear at month boundaries.

### Rollback plan
Single-function, single-file change with zero consumer edits — `git revert` the one commit, redeploy, confirm via `npx wrangler pages deployment list` (per CLAUDE.md's deploy-verification gotcha, not the exit code).

### Risks
- **True vs. mean equinox**: `Rotation_EQJ_ECT` includes nutation (~9.2″ amplitude, 18.6-yr period); the conventional published Lahiri ayanamsha is a *mean* (nutation-free) quantity. astronomy-engine has no public "mean ecliptic of date" rotation — reaching one would mean reimplementing the library's unexported internal `precession_rot()`, which partly defeats the "stop trusting a separately-fitted formula" goal and has no semver stability guarantee. The nutation-induced wobble is a few arcseconds — small relative to the ~1′ problem being fixed — but it's a real, undecided product question: **is the nutation-included ("true Chitra Paksha") variant acceptable?** Recommend yes, but flag explicitly rather than deciding silently in the execution session.
- **Calibration constant is still a pinned/fitted value** — the rate/shape is now a citable standard (IAU 2006/P03), but the additive offset still needs independent anchoring. Smaller trust surface than today (1 constant vs. 3 fitted coefficients), not zero.
- **Performance**: ~2.55µs/call vs. ~0.15µs/call (~17x) — negligible in absolute terms; every call site already pairs this with a `sunLongitude`/`moonLongitude`/`planetLongitude` call that costs far more. Not a real risk.
- **Input handling**: reuses the exact JD convention already battle-tested elsewhere in `astro-core.ts` — no new bug class expected.

### Recommendation
**Worth doing as a low-urgency correctness/technical-debt cleanup, not urgent.** The improvement is genuinely tiny today (won't visibly change output except near exact 30°/13°20′/3°20′ boundaries), but: the migration's blast radius is uniquely small and well-isolated (confirmed above), it replaces a 3-term Taylor fit with a peer-reviewed model this project already trusts for every other planetary position on the site, and the drift is explicitly "growing slowly" — cheaper to fix now than after it starts flipping boundary cases into user-facing bugs. Bundle into the next astronomy/precision-focused session; carry the two open questions (mean-vs-true equinox, calibration anchoring) into that session's brief explicitly.

---

## Initiative 2 — JS-only prerender for the Jyotish calculators

### Correction to starting scope
**Pancha Pakshi is already done** (commit `93e44d0`, 2026-08-18) — it was not actually excluded from the earlier rollout. Real starting count: **14 unhandled calculators**, not 15.

### Reframing confirmed, but narrower than assumed
Every one of the 14 pages already runs its calculation unconditionally on load against an implicit default (`new Date()`, `12:00`, `LOCS[0]` = New Delhi) and renders a full personal result client-side before any interaction — exactly the situation Pancha Pakshi was already in pre-fix. That reasoning (from Pancha Pakshi's own commit message: *"prerendering here isn't inventing new content, it's moving the page's own existing default state to build time"*) applies almost identically to all 14. Two pages (Horoscope Match, Sahasra Chandrodaya) use a fixed illustrative default instead of "today," which is more stable to prerender, not less.

**Correction (2026-08-26 follow-up check):** the first pass under-counted this. Read all 6 pages the earlier calculator-content-enrichment session specifically named as having JS-only reference grids (Nakshatra, Rashi, Rudraksha, Lagna, Kalasarpa, Horoscope Match) directly, checking specifically whether the *underlying data* is a hardcoded array with zero dependency on any input/computation — not just whether a grid already loops visibly over it. That distinction changes the count: **6 of the 14 pages carry genuinely static, zero-dependency reference data**, though only 3 of them currently render it as a standalone "show all" grid — the other 3 have the data sitting ready, verbatim, in the client script, just not yet looped into a visible table:

| Page | Static reference data found? | Already rendered as a standalone grid? | Detail |
|---|---|---|---|
| Nakshatra | **Yes** | **Yes** | "All 27 Nakshatras" grid (`renderAllNaks()`), driven by a local `NAKS`/`NAKS_TRAITS_HI` array richer than `jyotish.ts`'s `NAKSHATRAS` export (has trait paragraphs `jyotish.ts` lacks) |
| Rudraksha | **Yes** | **Yes** | "All 14 Mukhis" grid (`renderAllMukhis()`), local `RUDRAKSHA` array richer than `jyotish.ts`'s thinner export (color/day/metal/wear/mantra) |
| Shraddha | **Yes** | **Yes** | "Pitru Paksha Schedule" table, `computePitruPaksha(new Date().getFullYear())` — depends on current year only, **zero birth/personal data** |
| **Rashi** | **Yes** | **No** | `rashi.astro`'s client script defines `RASHI`/`RASHI_HI`/`RASHI_EN`/`LORD`/`ELEM`/`QUAL`/`COLOR`/`DAY`/`GEM`/`COMPAT`/`NUM`/`DESC`/`DESC_HI` — 12 fully hardcoded per-sign arrays (lines 118-158), zero dependency on the computed Moon longitude. But the page only ever renders **one** entry, indexed by the computed `idx` — there's no "all 12 signs" loop anywhere in the file. The data for a Nakshatra/Rudraksha-style reference grid already exists verbatim; only the render loop is missing |
| **Lagna** | **Yes (partial)** | **Partial** | `HOUSES`/`HOUSES_HI` (lines 156-157) — 12 house-significance strings ("Self, body, personality", etc.) — are 100% static text, zero computation dependency. The existing `#house-list` grid renders them, but interleaved with the computed per-house rashi (`signOfHouse[h]`, which does depend on the birth Lagna) — so the *current* grid mixes static + personal, though the static half could be split into its own pure table |
| **Kalasarpa** | **Yes** | **No** | `KALASARPA_TYPES` (12 names) + `KS_EFFECTS`/`KS_EFFECTS_HI` (lines 99-125) — 12 types × Anuloma/Viloma variants = **24 full reference paragraphs**, entirely hardcoded, zero dependency on any computed value. Only one paragraph (matching the computed `rahuHouse`/`isAnuloma`) is ever shown — the richest static content of any page in this audit, and currently the most invisible to crawlers, since a full "12 Types Reference" table doesn't exist yet |
| Horoscope Match | Partial — but not a Tier-1 gap | N/A | The 8-kuta *explanation* (name, points, significance) the enrichment session flagged is **already server-rendered static prose** in the page's "About Guna Milan" card (`horoscope-match.astro:75`, plain Astro frontmatter HTML, not client-JS) — no JS-only gap there. The `#kuta-table` element itself is a **computed** score breakdown (`kVarna`/`kVashya`/.../`kNadi`, all functions of the two birth Moon positions) — it isn't a static reference table, so it doesn't belong in this tier. It stays a Tier 3 candidate: because the default couple is a fixed sample (not "today"), the computed table is stable and could be prerendered as a full worked example, same pattern as Sahasra Chandrodaya |
| Gemstone, Sunsign, Mangal Dosha, Sadesati, Sahasra Chandrodaya, Kundali, Janma Kundali | No | — | — |

**Corrected Tier-1 candidate count: 6 pages** (Shraddha, Nakshatra, Rudraksha, Rashi, Lagna, Kalasarpa), not 3. Three of these (Rashi, Lagna, Kalasarpa) need a small new render function added first — a `.map()` loop over data that already exists verbatim in the page — while Nakshatra/Rudraksha/Shraddha's grids already exist client-side and just need to move to frontmatter.

**No page has a "true personal-input-only, zero prerenderable default" status strictly speaking** — even Horoscope Match and Shraddha have working defaults today; the open question is whether the default is a *good* one to publish permanently (see Risks).

### Tiered execution plan

**Tier 0 — done.** Pancha Pakshi, no action.

**Tier 1 — cheapest, no personal-data judgment calls, highest crawler value** (same shape as the `c7aa6bc` Muhurta-panels batch):
1. **Shraddha's Pitru Paksha Schedule** — extract `computePitruPaksha()` out of its inline `<script>` into `jyotish.ts`/`panchang.ts` (already only calls exported `sunTrueLongitude`/`moonLongitude`/`sunriseUTC`), call in frontmatter for the current year, prerender the 16-row table. Best ROI in this whole audit — zero personal-input coupling.
2. **Nakshatra's "All 27 Nakshatras" grid** — merge the enriched local `NAKS`/`NAKS_TRAITS_HI` into `jyotish.ts`'s `NAKSHATRAS` (or a parallel `NAKSHATRA_TRAITS` export), prerender.
3. **Rudraksha's "All 14 Mukhis" grid** — promote the richer in-page `RUDRAKSHA` array into `jyotish.ts`, replacing the thinner existing export, prerender.
4. **Rashi's "All 12 Rashis" reference grid (new)** — the `RASHI`/`DESC`/`COLOR`/`GEM`/etc. arrays already exist verbatim in `rashi.astro`; add a render loop (mirroring `renderAllNaks()`/`renderAllMukhis()`) that shows all 12 profiles, promote the arrays into `jyotish.ts` first, prerender.
5. **Kalasarpa's "All 12 Types Reference" table (new)** — `KALASARPA_TYPES`/`KS_EFFECTS`/`KS_EFFECTS_HI` are already fully hardcoded (24 paragraphs); add a render loop showing all 12 types × Anuloma/Viloma, promote into `jyotish.ts`, prerender. Richest static content found in this audit.
6. **Lagna's "12 Houses" static half** — split `HOUSES`/`HOUSES_HI` out of the current computed-mixed grid into its own pure reference table (house number + name + significance, no per-chart rashi), promote into `jyotish.ts`, prerender.

**Tier 2 — single "today, New Delhi" birth-chart default, Pancha-Pakshi pattern (the personal-result half of each page, separate from any Tier 1 reference table already extracted above):**
Nakshatra (result panel), Rashi (result panel), Lagna (result panel + computed house-rashi mapping), Sunsign, Gemstone, Mangal Dosha (calc logic already extracted to `src/lib/mangalDosha.ts` — cheapest here), Kalasarpa (result banner), Sadesati, Rudraksha (result panel). Pattern: extract inline calc logic to an importable pure function, call once in frontmatter, keep the client `<script>` calling the same shared function for interactivity.

**Tier 3 — same pattern, larger surface / more design care:**
- **Kundali** — 4 chart-style renderers (North/South/East/West) + planet table; direct precedent via the homepage `KundaliWidget.astro`, but 4x the diagram surface.
- **Janma Kundali** — largest page (house-lord table, 9 yoga-detection checks, Vimshottari Dasha table); the Dasha "active period" row highlight must stay client-recomputed (existing "live NOW badge" precedent).
- **Horoscope Match** — technically stable already (fixed sample couple), needs a copy/provenance decision first (see Risks).
- **Sahasra Chandrodaya** — stable core result, but "full moons so far"/"years remaining" counters are render-date-dependent, must stay client-only.

**Tier 4 — needs a product/copy decision before any code:**
- Shraddha's *personal* half — defaulting "date of passing" to today produces a nonsensical example ("someone who died today"), unlike "born today." Recommend either a fixed illustrative date (matching Horoscope Match/Sahasra Chandrodaya) or leaving just this one panel client-only even after Tier 1 ships.
- Kundali/Janma Kundali's "born today, New Delhi" full chart as permanent crawler-facing content — is a chart "for someone born right now" a meaningful SEO target, or should these use a fixed illustrative birth instead? Muhurta/Pancha-Pakshi's "today" default works because those tools are inherently about today; a birth chart isn't the same kind of thing.

### Technical pattern reused directly from the earlier rollout
No dedicated `docs/superpowers/plans/*prerender*` doc exists — the lineage lives in commit history (`9e2e6b0` pilot → `e8fd822`/`6ae2f72`/`a0c2429` batches 1-3 → `93e44d0` batch 4 → `c7aa6bc` Task 2):
- **Extract before prerender** — never let frontmatter and client `<script>` carry two copies of the same logic; extract to a pure `src/lib/*.ts` function first, call it from both. Load-bearing lesson, applies to every Tier 1-3 item (every page here currently duplicates data/calc logic inline rather than fully using the partially-existing `jyotish.ts` exports).
- **Live/"NOW" content stays client-only** — badges, active-period highlights, date-relative counters excluded from prerendering by design.
- **Default note UX** — prerendered pages get a small "default: today, New Delhi" note that client JS hides once the visitor changes an input; reuse verbatim.

### Risks / open questions
- Semantic fit of "today, New Delhi" as a *birth* default for single-person chart calculators is a real, undecided product question — Muhurta/Pancha-Pakshi never had to answer it since those tools are inherently "about today."
- Nakshatra's and Rudraksha's in-page arrays are richer than their `jyotish.ts` counterparts — the Tier 1 merge is a real data merge, not a drop-in import swap; verify nothing gets silently dropped.
- Rashi's and Kalasarpa's Tier 1 items need genuinely new markup (a render loop that doesn't exist yet), not just a data merge like Nakshatra/Rudraksha — slightly more work per page, though still zero computation-dependency risk since the source arrays are already fully static. Lagna's Tier 1 item additionally requires decoupling the static `HOUSES` text from the computed `signOfHouse` mapping it's currently interleaved with — the only Tier 1 item with a real (small) refactor, not just an extraction.
- Horoscope Match's sample couple (`1995-06-15`/`1997-09-20`) has no documented provenance and was never meant to be seen without clicking "Match" — prerendering promotes it to permanent indexed content; confirm intent before shipping.
- Shraddha's Pitru Paksha table needs a rebuild across each Dec 31 → Jan 1 boundary (same accepted caveat as other "today"-based prerenders sitewide).
- Sadesati's default computation (~2,300 `planetLongitude('saturn', jd)` calls, a 95-year/15-day forward scan) is the priciest single default among these — trivial in absolute terms, worth a build-duration spot-check after landing.

---

## Initiative 3 — Remaining festival astronomical accuracy audit coverage

### Correction to starting scope
`src/lib/festivals.ts`'s `FESTIVALS_2025_2027` currently has **96 entries** (verified by direct count), not ~54 — exactly 32 festival names × 3 years (2025/2026/2027). The "~54" figure from the original audit is stale; the site grew ~42 entries since (the 2027 block, the Oct–Nov 2026 batch).

### The original 8-festival audit — now documented
No written record of this exists anywhere in the repo — searched `docs/bugs/backlog.md`, all of `docs/superpowers/plans/*.md`, `docs/audits/notes/*.md`, `qa-audit/PLAN.md` (a *different*, Claude-Code-driven 16-batch audit, not the chat-based one referenced), and full git log for "festival"/"audit"/"batch"/"verify" — nothing named which 8 festivals were checked. **Per direct confirmation from the site owner, the original chat-based audit's Batch 4 report covered these 8:** Raksha Bandhan, Krishna Janmashtami, Ganesh Chaturthi, Ganesh Visarjan, Navratri Begins, Maha Navami, Vijayadashami/Dussehra, and Karva Chauth. This closes the gap flagged in the first pass — future sessions should treat this list as the confirmed record, not rediscover it.

**Year scoped by these 8 (2026-08-27 timeline check, reasonably well-evidenced, not certain):** verified directly against `git log`/`git show` on `festivals.ts` rather than assumed. The initial commit (`09bee76`, 2026-06-27) already had **2025** entries for all 8 confirmed names, so "predates the Oct–Nov 2026 batch" — the original framing — doesn't hold as a distinguishing signal on its own; the *names* existed from day one for 2025. What actually narrows the window: the **2026-dated** entries for 5 of the 8 (Ganesh Visarjan, Navratri Begins, Maha Navami, Vijayadashami/Dussehra, Karva Chauth) did not exist until commit `4198e4e` (2026-07-06, the "missing Oct–Nov 2026 season" fix) — before that date those specific 2026 pages simply didn't exist. Total festival-entry count climbs 47 (initial) → 59 (after `4198e4e`) → 88 (after 2027 was added, `71e96d0`, 2026-07-09). The original task briefing's "~54" figure sits closer to 59 than to 47. Combining both signals: **if** the audit covered the 2026 versions of all 8 names, it can only have run in the narrow **2026-07-06 to 2026-07-09** window (after the 2026 pages existed, before 2027 pushed the count to 88) — a tight, specific fit. That is the best-supported read, but it is an inference from commit timing and an approximate page count, not a confirmed fact; it's possible the audit instead covered the 2025 versions of these 8 names (which existed earlier, at a count closer to 47). Treat the 2026 versions of these 8 names as Tier 1 on that basis; if it ever matters with certainty, the only way to resolve it further is checking the original chat transcript.

### Verification-confidence tiers (updated)

**Tier 1 — externally cross-verified with a citation, traceable in code comments, CLAUDE.md, or the original audit's confirmed scope (~46 of 96):**
- **All 32 2027 entries** — strongest evidence in the dataset: `festivals.ts:218` comment records a 2026-07-09 cross-check against drikpanchang.com plus 5 more independent sources, "every date matched exactly."
- **2026** (17 of 32): the original 8-festival audit's confirmed set — Raksha Bandhan, Krishna Janmashtami, Ganesh Chaturthi, Ganesh Visarjan, Navratri Begins, Maha Navami, Vijayadashami/Dussehra, Karva Chauth — plus the previously-documented Lohri, Pongal, Holika Dahan, Holi, Naga Panchami, Diwali, Guru Purnima, Jaya Ekadashi, Basant Panchami.
- **2025** (only 2 of 32): Narak Chaturdashi (corrected 2026-07-16, verified against drikpanchang's Diwali Puja Calendar), Jaya Ekadashi.

**Tier 2 — touched incidentally, weaker evidence (internal-consistency checks or SEO-copy passes with no independent re-check citation):** qa-audit Batch 6's 9 spot-checks (confirmed the page reflects `festivals.ts`'s own data, not that the date is astronomically correct), the festival-ordering script (sequencing only, not absolute-date correctness), Task 5A's one remaining touched-but-uncited 2026 entry — Makar Sankranti (the other five names in that Task 5A group are now accounted for by the confirmed original-audit list above, so they moved to Tier 1).

**Tier 3 — never independently checked, computed only by this site's own Tithi/Sankranti engine (~14 of 96 still in active scope):**
- Explicitly self-flagged low-confidence by CLAUDE.md: 2026 Narak Chaturdashi, Dev Uthani Ekadashi, Chhath Puja, Bhai Dooj, Govardhan Puja (convention choice, not source-verified).
- Silently unverified: remaining 2026 entries (Maha Shivaratri, Ugadi/Gudi Padwa, Ram Navami, Hanuman Jayanti, Akshaya Tritiya, Buddha Purnima, Nirjala Ekadashi, Christmas, Makar Sankranti — 9 total).
- **28 of 32 2025 entries are no longer in scope for verification** — see the noindex decision below. They remain technically "never independently checked," but that gap is being deliberately accepted rather than closed.

### Decision: noindex the 32 2025 festival pages instead of re-verifying them (final, 2026-08-27)
**Approved.** The 32 2025 pages will be noindexed rather than actively re-verified. Reasoning:
- **Zero forward-looking utility** — the core use case for this site is "when is this festival" for planning purposes; that need is gone once the date has passed, and search volume for a specific past year's festival date falls off sharply once the year is over.
- **The site's own architecture already signals this tier**: `/festivals/archive` (`src/pages/festivals/archive.astro`) exists as a dedicated lower-priority hub for past festivals, rather than blending 2025 into the same promoted listing as 2026/2027 — noindex formalizes an intent the site already expressed structurally.
- **Cost asymmetry**: re-verifying would have cost 4 batches (~48 searches) for content with near-zero expected traffic; that effort is better spent on 2026/2027 (which people actually plan around) or on Initiatives 1/2.
- **Reversible, low-downside**: noindex doesn't delete anything — the pages stay reachable via `/festivals/archive` and any direct links/citations, just out of search results. A wrong date surfacing later (a user report, a stray backlink) is still a cheap reactive fix, just not a proactive audit.
- This closes out the "should these be verified" question entirely — Batches 1-4 below (all 2025-focused, in the original 7/6-batch plan) are **dropped**, not deferred.

### Proposed batching plan — 2 batches (revised: Batches 1-4 dropped per the noindex decision above)
1. **All remaining silently-unverified/low-confidence 2026 entries (14)** — Maha Shivaratri, Ugadi/Gudi Padwa, Ram Navami, Hanuman Jayanti, Akshaya Tritiya, Buddha Purnima, Nirjala Ekadashi, Christmas, Makar Sankranti, Govardhan Puja, Narak Chaturdashi, Dev Uthani Ekadashi, Chhath Puja, Bhai Dooj. Priority mirrors the site's own existing prioritization; the already-flagged-low-confidence items (Narak Chaturdashi, Dev Uthani Ekadashi, Chhath Puja, Govardhan Puja, Bhai Dooj) are cheap wins since the uncertainty is already named.
2. **2027 trust-but-verify spot-check** (not a full re-audit — the block already carries the dataset's strongest citation): independently re-derive 6-8 highest-traffic 2027 names (Diwali, Holi, Raksha Bandhan, Ganesh Chaturthi, Navratri, Karva Chauth). If all match, the remaining 26 can reasonably inherit that confidence; if any mismatch, escalate to a full 2027 re-audit.

Each festival needs ~1.5 searches (a direct date query, plus a second-source cross-check where ambiguous) — roughly 21-27 searches total across both batches, down from the original ~85-search plan once both the original-audit credit and the noindex decision are applied.

### Tooling recommendation
**Use Claude Code's own WebSearch — no need to route back to a separate chat/Research session.** Two live test searches this pass (Nirjala Ekadashi 2026, Maha Shivaratri 2026 — both in the "genuinely unverified" tier) each returned drikpanchang.com results plus a synthesized answer in one tool call, matched the site's existing (previously unverified) computed dates exactly, and cost only a few hundred tokens each — no context-bloat problem observed. The original chat-based routing was most likely a session-boundary/habit choice from before this project used Claude-Code-native web tooling heavily, not a hard capability gap.
- **Run each batch as its own subagent/session** — keeps context small per batch and allows parallel dispatch (this project already uses that pattern for batched SEO/QA work). With only 2 batches remaining, both could run in parallel in a single session.
- **Escalation caveat**: if a specific festival's date is genuinely contested across sources (as happened historically with 2026 Holika Dahan's March 2 vs. 3 confusion), a deeper multi-source "Research" pass may still be worth it for that one item — a per-item escalation, not a reason to route the whole plan through chat.

### Risks / open questions
1. **The original 8-festival audit's scope is now documented above**, with an honest confidence label (reasonably well-evidenced from commit timing, not certain) — this closes what was previously the biggest gap. If it ever matters with certainty which exact year those 8 covered, the only further resolution is the original chat transcript.
2. **The 2025-pages question is resolved** (see the noindex decision above, approved 2026-08-27) — no longer open. Reachability was already solved earlier (`/festivals/archive` exists and is live); the noindex-vs-verify question is now closed too.
3. **The 2027 block's citation is a self-report from a past session** — Batch 2 exists specifically to pressure-test that trust rather than accept it blindly.
4. Two items need their write-ups to distinguish confidence claims carefully: 2026 Govardhan Puja is a *regional-convention judgment call* (day-after-Diwali vs. same-day), not a simple date lookup; Dev Uthani Ekadashi/Chhath Puja/Narak Chaturdashi 2026 are engine-computed with no external check — "confirmed correct" and "engine output now cross-checked and found to match" are subtly different claims and future batch write-ups should say which one applies.
5. `docs/bugs/backlog.md`'s known `findElongationPP` aliasing risk (only empirically verified for the 2025-2027 window) means the site's own Tithi engine — the fallback source for anything not externally checked — isn't unconditionally trustworthy either. Not urgent for this pass, but worth the execution sessions knowing.
6. **Mechanical follow-up spun out of this decision**: implementing the noindex itself (meta tag/robots directive on the 32 2025 pages) is being done separately as a small task in this same session — see the end of this document for its outcome, or `git log` for the corresponding commit if it landed after this doc was last read.

---

## Cross-initiative note
All three are independent — no shared files, no sequencing dependency between them. They can be picked up in any order or run as separate parallel execution sessions whenever prioritized. Initiative 3 (festival audit) is now fully unblocked — the 2025-noindex decision closed its last open question — and needs only 2 small batches (~21-27 searches total) whenever picked up. Initiatives 1 and 2 also have no external blockers and could start immediately.
