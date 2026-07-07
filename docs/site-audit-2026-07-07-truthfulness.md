# PanchangPath Truthfulness & Accuracy Audit — 2026-07-07

Follow-up to `docs/site-audit-2026-07.md` (2026-07-06). That audit checked specific known formulas; this one asks a broader question across every feature on the site: **is it accurate, does it update live, and is it a real calculation or a static/random gimmick dressed up as one?**

Researched via 3 parallel deep-reads of the codebase (core Panchang + Muhurta engine, all 16 Jyotish calculators, Festivals/Events/Regional/Devotional) plus direct inspection of Rashifal and Prashnavali.

## Executive summary

**The astronomy is real.** Tithi/Nakshatra/Yoga/Karana, sunrise/sunset, Rahu Kalam/Gulika/Yamaganda, Choghadiya, Hora, all 16 Jyotish calculators (Kundali, Dasha, Ashtakoota matching, Mangal Dosha, Kalasarpa, Sadesati, gemstone/rudraksha recommendations, etc.) — 15 of 16 calculators and the entire core Panchang engine are genuinely computed from real orbital mechanics and correctly-implemented classical rule tables, not canned output. That's the large majority of the site.

**Three things are not what they appear to be**, in order of severity:

1. **Rashifal weekly/monthly/yearly predictions never change.** They are single static strings per rashi, shown identically forever regardless of the actual date. Only the "daily" text rotates (through 5 canned variants, cycling by day-of-year) — none of it is derived from any planetary computation. This is the site's one genuinely gimmick-shaped feature: a real UI wrapped around generic astrology-column prose.
2. **Pancha Pakshi calculator** takes a real computed input (birth Moon-nakshatra) but runs it through an invented/simplified rule table (no gender differentiation, an invented weekday-bird sequence, equal 5-way day/night segments instead of the classical unequal Kalas), while its own copy claims to be "the ancient Tamil system."
3. **Durga Saptashati** — presented as verbatim sacred text — has leftover scraper UI junk (`इतना अधिक पाठ है।"`) embedded mid-verse in 5 of 13 chapters (11 occurrences), meaning some of what's displayed as scripture is actually a "read more" button string from the source site.

Everything else is either fully accurate, or a known/flagged limitation (low-confidence festival date, static reference table where a static table is appropriate, etc.) Prashnavali's randomness is intentional and correctly framed as an oracle, not a bug.

Full breakdown and standalone fix prompts follow.

---

## Part 1 — Core Panchang engine (`src/lib/panchang.ts`)

| Feature | Accuracy | Live? | Real? |
|---|---|---|---|
| Tithi / Nakshatra / Yoga / Karana | Accurate | n/a (server calc, called per page) | Real |
| Rahu Kalam / Gulika Kalam / Yamaganda | Accurate | n/a | Real |
| Sunrise / sunset (Meeus EoT) | Accurate | n/a | Real |
| Abhijit Muhurta (day-proportional) | Accurate | n/a | Real |
| Ayanamsha (3-term Lahiri) | Accurate | n/a | Real |
| **Moonrise** | **Inaccurate** | n/a | **Heuristic, not computed** — `srMins + moonAge*48`, no altitude/hour-angle calc at all (Sun gets a real formula, Moon doesn't). New finding, not in the prior audit. |

## Part 2 — Muhurta tools (9 pages)

All 9 pages (`choghadiya`, `hora`, `rahu-kala`, `lagna`, `abhijit`, `panchaka`, `vivah`, `griha-pravesh`, `shubha-dates`) recompute client-side on load and on demand — **all live**, none build-time-only.

- **Choghadiya / Hora sequences** — verified against classical Chaldean/Vara tables, correct.
- **Vivah / Griha Pravesh / Shubha Dates** — genuinely score real per-day Tithi/Nakshatra/Yoga/Vara against real good/avoid criteria tables and return the top matches. Not random filler — a real (if simplified) Muhurta-scoring engine.
- **GOWRI_NIGHT** — still has the Wed=Sun copy-paste bug (byte-identical arrays), confirmed present in both `muhurta.ts` and `panchaka.astro`. Already known, still unfixed.
- **Truncated 2-term ayanamsha** — confirmed still present in exactly 4 files: `vivah.astro:121`, `griha-pravesh.astro:124`, `shubha-dates.astro:132`, `panchaka.astro:128`. Already known, still unfixed, and now a trivial one-line-each fix since the canonical 3-term formula already exists elsewhere in the same files' sibling pages.

## Part 3 — Jyotish calculators (16 pages)

15 of 16 are **accurate, live, and genuinely computed** — real Ashtakoota (36-point Guna Milan) scoring in Horoscope Match, real house-position logic in Mangal Dosha/Kalasarpa/Sadesati, real Vimshottari Dasha derived from actual Moon-nakshatra fraction, real Lagna-lord-derived gemstone/rudraksha recommendations, real full-moon-crossing iteration in Sahasra Chandrodaya. All 16 pages confirmed to carry the full 15-term Moon `dL` correction with no drift between copies.

Two calculators have caveats worth flagging beyond what's in CLAUDE.md already:

- **Pancha Pakshi** — see Executive Summary. Real input, invented rule table, overclaiming copy.
- **Shraddha Tithi** — maps the computed death-tithi to a hardcoded `PP2026` Pitru Paksha date table. Reasonable for this year, but will silently go stale after 2026 with no fallback — not currently in CLAUDE.md's Known Issues.
- **Janma Kundali Dasha dates** — already documented in CLAUDE.md (browser-timezone-dependent date math); reconfirmed real.

## Part 4 — Festivals & Planetary Events

- **Festival dates** — matches CLAUDE.md's documented caveats (Raksha Bandhan still unverified/unfixed, Narak Chaturdashi/Govardhan/Dev Uthani Ekadashi still flagged low-confidence in code comments, 2027 data still absent). One gap: **Chhath Puja (2026-11-15)** was added in the same low-confidence batch as the others but carries no low-confidence comment anywhere — should be flagged, not silently treated as verified.
- **Planetary Events scanner** (`planetaryEvents.ts`) — genuinely computed: real day-by-day sign-transit/retrograde-station/conjunction/solstice detection with sub-day linear interpolation. Not canned. **Eclipses**, however, are a static hardcoded table covering only 2025–2026 with no extension plan — will quietly become stale/empty past August 2026.
- **New live-update gap**: both `/events` pages compute `daysAway`/countdowns from `new Date()` **at build time only** — since deploys are manual (per CLAUDE.md), every "X days away" countdown silently drifts and goes wrong the longer it is between deploys. Not currently documented as a known issue.

## Part 5 — Regional Panchang

The `AMANTA_TO_IDX` fix from the prior audit is confirmed present and correct in both `[region].astro` and `regional.astro`.

**Root cause of the "amanta-month label lags Amavasya" bug — now found** (CLAUDE.md previously said this was unresolved/not-root-caused). It's in `src/lib/panchang.ts:508`:
```
const amantaIdx = sunRashiIdx;
```
The amanta lunar month name is derived from the **Sun's sidereal rashi** (i.e., approximated via Sankranti) rather than the true Amavasya-to-Amavasya lunar boundary. Since Sankranti happens several days after the preceding Amavasya, the displayed month name lags the real new-moon crossing by exactly that gap — matches the previously-observed "~1 week late" symptom exactly. This is now a well-defined, fixable bug rather than an open mystery.

## Part 6 — Devotional Library

- **Sundarkand** — clean: 60 dohas, sequential, no gaps/dupes, no placeholder text.
- **Durga Saptashati** — chapter/verse numbering internally consistent (colophons match), **but** 5 of 13 chapters contain the literal leftover scraper string `इतना अधिक पाठ है।"` (a "read more" toggle button from the source site) embedded mid-verse, 11 occurrences total. This directly contradicts CLAUDE.md's own documented verbatim-sourcing process and means some of what's shown as sacred text is UI chrome.
- **Namavali 108-name padding** — confirmed and quantified: Ganesh (~14 padded slots across 11 duplicate groups, worst offender), Durga (6 groups), Saraswati (6 groups), Lakshmi (4 groups), plus two not previously flagged: **Surya (3 groups)** and **Hanuman (2 groups + a tokenizer artifact "च")**. Shiva and Krishna remain confirmed clean. Shani has one group repeated 3x, arguably an intentional refrain rather than padding.

## Part 7 — Rashifal & Prashnavali

- **Prashnavali** — genuinely `Math.random()`-driven (`prashnavali.astro:136`), and correctly presented as a divination oracle, not a calculation. Not a bug — this is the one place on the site where "random" is the honest and correct design.
- **Rashifal** — see Executive Summary point 1. `getDailyPrediction()` rotates 5 static strings by day-of-year; weekly/monthly/yearly are rendered directly with no rotation function at all (`src/pages/rashifal/[rashi].astro:110,126,140`, `index.astro:60-62`) — same text shown on every visit regardless of date. This is presented next to genuinely-computed features (Kundali, Dasha, Muhurta) with no visual distinction, which is the crux of the "is this real or a gimmick" concern.

---

## Fix Prompts

Standalone prompts, each self-contained for pasting into a fresh session.

### 29. Rashifal weekly/monthly/yearly predictions never change (highest priority) — ✅ FIXED
> Implemented real rotation rather than relabeling: `predictions.weekly`/`monthly`/`yearly` in `src/lib/rashifal.ts` changed from single static strings to arrays (4 weekly variants rotating by ISO week number, 12 monthly variants — one genuinely per calendar month, 3 yearly variants rotating by year), with new `getWeeklyPrediction()`/`getMonthlyPrediction()`/`getYearlyPrediction()` functions mirroring the existing `getDailyPrediction()` pattern. 192 new prediction blocks written across the 12 rashis, matching each rashi's established voice (ruling planet, element, recurring imagery). Call sites in `src/pages/rashifal/[rashi].astro` and `index.astro` updated; `RashifalFeed.astro` needed no change (daily-only). Verified: all 12 rashis have exactly 4/12/3 entries, no remaining direct field reads, `npm run build` passes (345 pages).
> In `src/lib/rashifal.ts`, `predictions.weekly/monthly/yearly` are single static strings per rashi with no rotation logic — `src/pages/rashifal/[rashi].astro:110,126,140` and `index.astro:60-62` render them directly. Either (a) add multiple variants per period with a rotation function analogous to `getDailyPrediction()` (e.g. rotate weekly text by ISO week number, monthly by calendar month, yearly by year), so the content genuinely changes on the cadence it claims to, or (b) if generating true period-by-period content isn't planned, relabel the sections honestly (e.g. "General Weekly Guidance" instead of implying it's this specific week's forecast) so it's not misrepresented as time-specific. Decide and document which approach, since this is the site's most visible "is this real" concern.

### 30. Pancha Pakshi overclaims "the ancient system" while using an invented rule table — ✅ FIXED (relabeled)
> Relabeled rather than implementing the full classical system — implementing gender-aware bird assignment and unequal Kala proportions would require a verified classical-rules reference this audit doesn't have, and guessing risks encoding new wrong "classical" data (same category of risk as the still-unresolved GOWRI_NIGHT bug). Instead: Layout meta description, hero subtext, and About section (`src/pages/jyotish/pancha-pakshi.astro`) all edited to describe this as a simplified/stylized South Indian system rather than "the ancient Tamil system" verbatim, with an explicit caveat added noting the equal-segment day/night split and lack of gender-based bird assignment.
> In `src/pages/jyotish/pancha-pakshi.astro`, the birth-bird IS correctly derived from real computed Moon-nakshatra, but the surrounding rule table is a simplified/invented variant: no male/female nakshatra-counting direction (classical Pancha Pakshi Shastra differentiates by gender), an invented `DAY_BIRD` weekday sequence rather than the classical tithi/weekday ruling-bird tables, and 5 equal day/night segments instead of the classical unequal Kalas. Either implement the authentic gender-aware/unequal-Kala system, or edit the page's descriptive copy to stop claiming it reproduces "the ancient Tamil system" verbatim and instead describe it as a simplified/stylized variant.

### 31. Durga Saptashati contains scraper UI text embedded in verse content — ✅ FIXED (wider scope than originally found)
> The contamination was actually spread across **8 chapters** (2, 4, 5, 6, 7, 8, 10, 11), not the 5 the original audit pass caught — chapters 6, 7, and 11 had a different-shaped artifact (a stray `">*` HTML remnant, sometimes with a genuine Sanskrit-grammar or manuscript-variant footnote glued to it, rather than the "read more" button text) that the original grep for the literal `इतना अधिक पाठ है` string missed entirely. All instances removed; verified zero remaining matches for `">*`, `इतना`, `पाठान्तर`, `उपलब्ध`, or `तालव्य` anywhere in the file.
> Most fixes were mechanical and high-confidence: deleting the literal "read more" button text, and inserting a missing space/danda at points where the HTML-to-text stripping step had glued two words together across a removed tag boundary (e.g. `महिषार्दिताःततो` → `महिषार्दिताः ततो`) — no verse content was invented or removed in these cases, only junk deleted and punctuation restored.
> **Two spots involved an editorial judgment call, flagged for independent verification**: (1) Chapter 4 verse 32 had a manuscript-variant footnote ("इतना पाठ अधिक है। किसी-किसी प्रतिमें-") whose actual alternate-reading content was truncated/unrecoverable — it was removed rather than guessed at, since keeping a dangling "in some manuscripts—" with no completion would be worse than omitting it. (2) Chapter 4 verse 41 had three glued manuscript-variant spellings of the same phrase ("गौरीदेहात्स" / "गौरीदेहा सा" / "गौरी देहा सा") plus a footnote noting "such readings are also available" — one reading (`गौरीदेहात्`) was chosen as the running text based on the reconstructor's recollection of the standard printed verse, **not verified against a live source**. If a reference edition is available, double-check this specific line (`पुनश्च गौरीदेहात्समुद्भूता यथाभवत्। वधाय दुष्टदैत्यानां तथा शुम्भनिशुम्भयोः॥41॥`) against it.
> In `src/lib/devotional/durgasaptashati.ts`, the literal string `इतना अधिक पाठ है।"` (a "read more" toggle-button label from the original scraped source) appears 11 times across 5 chapters (chapter-2, chapter-4, chapter-5, chapter-8, chapter-10), interleaved directly into the `lyricsHi` verbatim-text field. Re-extract or manually clean these 5 chapters: remove every occurrence of that string, then re-verify each chapter's colophon verse-count (e.g. chapter 1's `एवमादितः॥104॥`) still matches after cleanup, and check the surrounding text isn't otherwise truncated at the point the artifact was inserted (the artifact likely marks where the original page's "show more" cutoff was, so text around it is the highest risk for missing content).

### 32. Moonrise is a rough heuristic, not a real computation — ✅ FIXED
> Implemented a real iterative topocentric altitude-crossing solver (`moonRiseSetUTC()` in `src/lib/panchang.ts`), following the same approach as `sunriseUTC()` but re-evaluating the Moon's actual RA/Dec at each refined time estimate (6 iterations, converging to ~2 seconds) since the Moon moves too fast for a single daily snapshot. Target altitude ~+0.125° (mean lunar horizontal parallax minus refraction). Added the missing `moonset` field to `PanchangData`. Ecliptic latitude approximated as 0, consistent with how the rest of the codebase already treats the Moon elsewhere (Nakshatra/Rashi placement).
> Verified numerically against expected lunar-phase behavior for New Delhi: near new moon, moonrise/set track the sun closely (rise 46 min after sunrise, set 56 min after sunset); near first quarter, moonset lands ~midnight; near full moon, moonrise lands 6 min before sunset and moonset 26 min after sunrise (textbook "up all night"); near last quarter, moonrise lands ~midnight. All four cases matched real lunar-phase physics. For comparison, the old heuristic was off by ~2 hours on the full-moon test case, and by over an hour with the wrong rise/sunrise ordering near new moon (it didn't wrap `moonAge` modulo the synodic month, so it broke down badly near cycle boundaries).
> Propagated the identical fix to `src/pages/index.astro`'s duplicated client-side copy (used when a visitor changes location, since Astro's build-time SSR alone would otherwise go stale between manual deploys) — otherwise the homepage's initial load would be accurate but silently revert to the old heuristic on interaction, reintroducing the exact "is this real" inconsistency this audit is about.
> **Two unrelated bugs found in `index.astro`'s duplicate while fixing this** (not fixed here, flagged for separate follow-up): (1) its Moon `dL` formula has only 18 terms vs the canonical 26 terms now in `panchang.ts` — a drift CLAUDE.md's changelog didn't catch, since the "full 15-term" propagation happened before `panchang.ts`'s canonical was extended further; (2) its Abhijit Muhurta window is still the old fixed `±24 min`, not the day-length-proportional fix CLAUDE.md's Known Issues claims was already propagated everywhere.
> In `src/lib/panchang.ts`, the `moonrise` field (~line 376-383) is computed as `srMins + moonAge*48` — an approximation with no actual lunar altitude/hour-angle calculation, unlike sunrise/sunset which use a real Meeus-based formula. Implement a proper topocentric moonrise (and add a moonset field, which doesn't exist at all) using an iterative altitude-crossing method similar to `sunriseUTC()`, adapted for the Moon's faster motion (one iteration to correct for ~13°/day movement during the hour-angle solve, plus a target altitude of ~+0.125° instead of the Sun's -0.8333° to account for lunar parallax). This is also prerequisite work for the planned dedicated Moonrise & Moonset page (see `docs/site-audit-fix-prompts.md` #5).

### 33. Amanta-month lag bug — root cause found, now fixable — ✅ FIXED
> Implemented as a forward search: `getHinduCalendarInfo()` in `src/lib/panchang.ts` now derives the amanta month from the Sun's sidereal rashi at the **upcoming** Amavasya (the new moon that ends the current lunar month), found by projecting forward from today's elongation and refining with 3 Newton iterations against the real Sun/Moon longitude formulas already in this file.
> **Caught a real direction error during my own verification, not just the intended lag fix**: my first implementation searched *backward* to the most recent past Amavasya, which seemed like the obvious reading of "the month started at the last new moon" — but numerically testing it against this site's own already-fixed festival dates (Navratri 2026-10-11, Diwali 2026-11-08 — both well-established Ashwin-month festivals) showed it labeling that entire span "Bhadrapada," one month off. Switching to a forward search (Sun's rashi at the month's *ending* Amavasya, not its starting one) fixed both test cases exactly, landing "Ashwin" on 10-11 and "Kartika" on 11-09, each a week earlier than the old Sankranti-proxy code — matching the "~1 week late" symptom in CLAUDE.md's original bug report precisely.
> Bonus validation found in the process: scanning May–August 2026 shows "Vaishakha" spanning mid-April through mid-June (~59 days, double the normal ~29.5-day lunar month) before advancing to Jyeshtha — the correct signature of an *adhika māsa* (leap month), a real calendrical phenomenon the old Sankranti-proxy method couldn't represent at all (it just showed whichever rashi the Sun currently occupied, disconnected from true lunar-month boundaries). This wasn't specifically tested for, but strongly corroborates the fix is astronomically sound rather than just numerically coincidental on the two festival dates checked.
> Propagated the identical fix to `src/pages/index.astro`'s duplicated client-side `getHinduCalInfo()`. `src/pages/panchang/[region].astro` and `regional.astro` both import the canonical `getHinduCalendarInfo()` from the lib directly (no duplicate), so they're fixed automatically.
> Not in scope here: distinguishing an adhika month from the following "nija" (regular) month of the same name with an explicit "Adhika" label — the fix corrects which month name is shown, not full leap-month disambiguation, which would be a separate, larger feature.
> In `src/lib/panchang.ts:508`, `const amantaIdx = sunRashiIdx;` derives the displayed amanta lunar month from the Sun's sidereal rashi (a Sankranti-based proxy) instead of the true Amavasya-to-Amavasya lunar month boundary — this is why the displayed month name lags the real new-moon crossing by up to a week (matches the symptom documented in CLAUDE.md's Known Issues). Fix by deriving the amanta month index from an actual Amavasya search (scan backward from the current date for the most recent Sun-Moon conjunction / Tithi-30 crossing, then count amanta months from a known epoch, or determine the month via which zodiac sign the Sun occupied at the *preceding* Amavasya rather than the Sun's current sign) rather than the current-date Sun sign. Re-verify against `docs/site-audit-2026-07.md`'s original Nov 2026 New Delhi test case (should now correctly show 'Kartika' switching right at the Amavasya, not a week late).

### 34. GOWRI_NIGHT still has the Wed=Sun copy-paste bug — ✅ FIXED
> Sourced real data this time rather than leaving it blocked: fetched drikpanchang.com's Tamil Gowri Panchangam page (curl + tag-strip, matching this project's established sourcing method) for all 7 weekdays, New Delhi. Cross-validated Tuesday's full day+night sequence against a second independent source (prokerala.com) — exact match on both, confirming reliability. Sunday's day sequence also matched this site's own already-verified `GOWRI_DAY` table exactly.
> **The entire table was wrong, not just the Wed=Sun duplicate** — comparing the old data to the newly-sourced data shows every row differs, not only the duplicated pair. Replaced all 7 rows in both `src/lib/muhurta.ts` and the duplicate in `src/pages/muhurta/panchaka.astro`.
> One real anomaly preserved rather than "corrected": the source's Saturday night sequence has "Charam" (Soram) appearing twice with "Rogam" completely absent, reproduced identically across two different Saturdays a week apart on drikpanchang — not a fetch glitch. Since I have no independent second-source confirmation specifically for Saturday (prokerala's date parameter didn't respond to requests for a different date, always serving "today"), this is transcribed faithfully with a code comment flagging it, rather than silently smoothed into a clean permutation, which would just be unverified guessing in the other direction. Worth a follow-up cross-check against a third source if higher confidence on Saturday specifically is wanted.
> Same issue as `docs/site-audit-fix-prompts.md` #19 — `GOWRI_NIGHT` in `src/lib/muhurta.ts` (~line 227-235) and the duplicate in `src/pages/muhurta/panchaka.astro` (~line 94-102) still have byte-identical Sunday/Wednesday rows. Still blocked on sourcing correct verified night-time Gowri Panchangam values per weekday from drikpanchang.com before fixing — do not guess.

### 35. Truncated 2-term ayanamsha still present in 4 Muhurta pages (confirmed still open, now trivial)
> Same issue as tracked in CLAUDE.md's Ayanamsha section — confirmed still present in `src/pages/muhurta/vivah.astro:121`, `griha-pravesh.astro:124`, `shubha-dates.astro:132`, and `panchaka.astro:128`, each using `23.85 + 1.3612*T` instead of the full `23.85 + 1.3612*T - 0.000136*T*T`. This is now a trivial fix: `lagna.astro` in the same directory already has the correct 3-term version to copy from. Apply the missing `-0.000136*T*T` term to all 4 files.

### 36. Planetary Events countdowns go stale between manual deploys
> `src/pages/events/index.astro` and `[id].astro` compute `daysAway`/countdown text from `new Date()` only in Astro frontmatter at build time — since this site deploys manually (`npm run deploy`, not on every push per CLAUDE.md), every displayed countdown silently drifts wrong the longer it's been since the last deploy. Add a small client-side `<script>` that recomputes the countdown from the visitor's actual current date against the event's stored date/time (similar to the pattern already used in Muhurta pages), rather than trusting the build-time value.

### 37. Eclipse data hardcoded through 2026 only, no extension plan
> In `src/lib/planetaryEvents.ts`, `KNOWN_ECLIPSES` only covers 2025-2026. Past August 2026 the Planetary Events feed will simply stop showing any eclipse without any indication that this is a data-coverage gap rather than "no eclipses occurring." Either extend the table with verified NASA/JPL eclipse data through at least the next 2-3 years, or add an explicit "eclipse data available through [date]" note so the absence isn't mistaken for astronomical fact.

### 38. Shraddha Tithi calculator's Pitru Paksha table is hardcoded to 2026
> `src/pages/jyotish/shraddha.astro` maps the computed death-tithi to a hardcoded `PP2026` date table. This will silently produce wrong or missing Shraddha dates for any year other than 2026. Add this to CLAUDE.md's Known Issues now, and either generalize the table to compute Pitru Paksha dates for any requested year from the site's own Tithi engine, or clearly label the tool as "2026 only" until that's done.

### 39. Chhath Puja 2026 date has no low-confidence flag despite being unverified
> `src/lib/festivals.ts`'s Chhath Puja entry (2026-11-15) was added in the same batch as several other festivals that do carry an explicit "not independently re-verified" code comment (Narak Chaturdashi, Dev Uthani Ekadashi, Govardhan Puja), but Chhath Puja itself has no such comment anywhere. Add a comment flagging it as unverified (consistent with its neighbors) until independently checked against drikpanchang.com, so it isn't mistaken for a verified date like the Guru Purnima/Ganesh Chaturthi/Diwali fixes were.

### 40. Namavali padding — 2 additional lists not previously flagged
> CLAUDE.md's Known Issues lists Ganesh/Durga/Lakshmi/Saraswati/Shani as having padded/duplicate names in `src/lib/devotional/namavali.ts`. Add **Surya (3 duplicate groups)** and **Hanuman (2 duplicate groups plus a stray tokenizer artifact "च" counted as a name)** to that list. All 7 lists need their duplicate/artifact entries replaced with genuinely distinct names sourced from a verified 108-name list for each deity before the "108 names" claim is accurate.

### 41. `index.astro`'s client-side Moon formula is 8 terms short of canonical (found while fixing #32)
> `src/pages/index.astro`'s inline `moonLon()` (client-side script, ~line 341) stops after the `0.008548*Math.sin(4*Dr-2*Mpr)` term — 18 terms total — while the canonical `moonLongitude()` in `src/lib/panchang.ts` (~line 44) now has 26 terms, continuing through `-0.007888*Math.sin(2*Dr+Mr-Mpr)`, `-0.006766`, `-0.005163`, `0.004987`, `0.004036`, `0.003994`, `0.003861`, and `0.003665*Math.sin(2*Dr-3*Mpr)`. CLAUDE.md's changelog claims this file was fixed to "full 15-term" in the 2026-07 pass, but `panchang.ts`'s canonical was apparently extended further afterward without re-propagating to this file. Copy the missing 8 terms from `panchang.ts` into `index.astro`'s `moonLon()`, then grep for the same truncated 18-term sequence across the rest of the codebase (`jyotish/*.astro`, `muhurta/*.astro`, `KundaliWidget.astro`) in case the same later drift happened elsewhere — don't assume the 15/16 fix from `docs/site-audit-fix-prompts.md` #16 is still complete just because it was marked done.

### 42. `index.astro`'s client-side Abhijit window is still a fixed ±24 min (found while fixing #32)
> `src/pages/index.astro`'s `calcPanchang()` (client-side script, ~line 555) still computes `abStart = noonMins - 24, abEnd = noonMins + 24` — the old fixed 48-minute window — even though CLAUDE.md's Known Issues says this was fixed everywhere in 2026-07 (`docs/site-audit-fix-prompts.md` #21) to `± dayMins/30`. This file's duplicate was apparently missed during that propagation. Change to match `src/lib/panchang.ts`'s pattern: `abStart = noonMins - dayMins/30; abEnd = noonMins + dayMins/30;` (using the `dayMins` already computed earlier in the same function). Re-verify against the same New Delhi/Mumbai test cases used for the original fix.

---

**Suggested fix order:** #29 (Rashifal) is the highest-impact truthfulness fix and the most visible to users — do first. #33 (amanta-month) is now unblocked and should follow. #31 (Durga Saptashati contamination) is a data-integrity issue in content presented as sacred scripture — high priority despite being "just" a cleanup. #35 (truncated ayanamsha) is trivial, batch with #34 (GOWRI_NIGHT, still blocked on data). #32 (moonrise/moonset) ties into the planned Moonrise & Moonset nav page. #36/#37/#38/#39/#40 are independent lower-urgency fixes/documentation additions.
