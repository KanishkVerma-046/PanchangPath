# jyotish/shraddha.astro — content draft

Old static word count: ~140 words (intro subtitle + 2-paragraph "About
Shraddha" card — higher than the ~127 words flagged in the original
assessment, but still no FAQ, and the Pitru Paksha schedule table is
JS-only as flagged).
New word count (About section): ~230 words.

## A. Expanded "About this tool" section

Keep the existing two paragraphs unchanged. Add a third describing the
tool's own (already well-engineered) calculation rule.

> Shraddha is the ritual offering made to honour departed ancestors
> (pitrs). The annual Shraddha is performed on the tithi corresponding to
> the date of death, during Pitru Paksha — a 16-day fortnight in the
> Krishna Paksha of the month of Ashwin (September–October).
>
> Special cases: those who passed on any Amavasya, or whose tithi is
> unknown, are honoured on Sarva Pitru Amavasya (the final day). Those who
> died unnaturally are remembered on Chaturdashi. Sanyasis are honoured on
> Dwadashi.
>
> *[New]* This calculator applies the Aparahna Vyapini rule specifically
> for Shraddha — different from the sunrise-based tithi rule this site
> uses elsewhere for festivals and daily Panchang. Aparahna is the fourth
> of five equal parts of daylight, the classical afternoon window
> Dharmashastra prescribes for these rites; a tithi is assigned to
> whichever day its span actually overlaps that window, even if it isn't
> the tithi present at sunrise. Two edge cases follow: a long tithi
> overlapping two days' windows (Vriddhi) is assigned to the first day; a
> short tithi that misses every window entirely (Kshaya) goes to the day
> whose window falls nearest to it. The Pitru Paksha schedule below is
> computed fresh each year using this same rule.

**Sources**: the Aparahna Vyapini rule (day divided into 5 equal parts,
Shraddha tithi determined by the 4th part specifically, not sunrise) is
cross-verified via a Sanskrit-sourced discussion citing the Satapatha
Brahmana's 5-part day division and a Tamil Brahmins community forum
thread on Shraddha timing, both independently describing the same
afternoon-window rule. This also matches — and is drawn directly from —
the page's own extensively-commented implementation
(`aparahnaWindowJD()`'s comment block, `shraddha.astro` lines 152-192),
which additionally documents that this exact logic was verified against
drikpanchang.com for 2025, 2026 and 2027 with an exact match all three
years (see CLAUDE.md's Known Issues history for this page). The
Vriddhi/Kshaya handling description is grounded in the same code comment,
not a separate external source — a genuinely technical implementation
detail rather than a general Jyotish concept, so the code itself is the
primary source here.

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**Why does this calculator use a different tithi rule than the rest of
the site?**
> Because Shraddha specifically follows the Aparahna Vyapini rule — the
> tithi that's active during the afternoon window (the 4th of five equal
> daylight parts) is the one that governs the ritual, even if a different
> tithi was present at sunrise. Panchang elements like festivals and daily
> Tithi/Nakshatra use a sunrise-based rule instead, which is why this page
> doesn't reuse that logic even though both ultimately come from the same
> underlying Sun/Moon position functions.

**What are Vriddhi and Kshaya tithis, and how does this calculator handle
them?**
> These are the two edge cases where a simple "one tithi per day" mapping
> breaks down. Vriddhi is when a tithi is long enough to overlap two
> consecutive days' Aparahna windows — this calculator assigns it to the
> first of the two days, per convention. Kshaya is the opposite: a tithi
> so short it doesn't overlap any day's Aparahna window at all — this
> calculator assigns it to whichever day's window falls temporally
> closest to the tithi's actual span.

**What if I don't know the exact tithi of a family member's passing?**
> Observe Sarva Pitru Amavasya instead — the final day of Pitru Paksha,
> specifically set aside for ancestors whose tithi isn't known, alongside
> anyone who passed on any Amavasya. This calculator's "By Tithi Directly"
> mode doesn't have an "unknown" option deliberately — Sarva Pitru
> Amavasya is the traditional answer, so it's covered by the About
> section's note rather than a separate form option.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **`#pp-heading` / `#pp-subheading` / `#pp-table`** — the full current-
  year Pitru Paksha schedule (all 16 tithi/date/who's-honoured rows) is
  entirely client-rendered via `renderPPHeadings()`/`renderPPTable()`,
  despite being computed by a well-verified, drikpanchang-cross-checked
  function. This is a strong prerender candidate: unlike most other
  JS-only tables flagged in this project, the underlying computation
  (`computePitruPaksha()`) is deterministic for a given year and already
  has documented accuracy — prerendering it would carry no new
  verification risk, just move already-trusted output server-side.
- **`#t-icon` / `#t-name` / `#t-meta` / `#shraddha-day`** — the tithi-of-
  passing result and "when to perform Shraddha" panel are also
  client-only, including the default page-load result.
