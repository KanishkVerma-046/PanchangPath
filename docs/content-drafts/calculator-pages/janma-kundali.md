# jyotish/janma-kundali.astro — content draft

Old static word count: ~190 words (intro subtitle + 4-paragraph
"Understanding Your Janma Kundali" card) — already close to/within the
150-250 Muhurta benchmark range (the original assessment's ~163-word count
undercounts slightly, but the framing is right: "close to benchmark, just
needs FAQ"). Per the task's Group 4 grouping, this page gets FAQ only, no
About-section expansion.

## A. About section — no change

The existing 4-paragraph card (intro, House Lords, Planetary Dignity,
Vimshottari Dasha) is left as-is. It's accurate and already covers the
report's main concepts; the gap here is purely the missing FAQ.

## B. Page-specific FAQ

**Which yogas does this report check for, and how are they detected?**
> Nine checks run automatically: Gajakesari (Jupiter in a kendra —1st,
> 4th, 7th or 10th — from the Moon), Budhaditya (Sun and Mercury in the
> same sign), Chandra-Mangal (Moon and Mars conjunct or opposite), the
> five Pancha Mahapurusha yogas (Ruchaka, Bhadra, Hamsa, Malavya, Shasha —
> each formed when Mars, Mercury, Jupiter, Venus or Saturn respectively
> sits in its own or exalted sign *and* in a kendra from the Lagna), two
> Raja Yoga variants (Lagna lord conjunct the 5th or 9th lord), and
> Kemadruma (Moon with no other planet in the houses immediately before
> or after it). Each uses the base classical definition; some traditions
> layer additional refinement conditions on top of a few of these — see
> the Gajakesari/Kemadruma note below for a specific example.

**I've seen Gajakesari or Kemadruma Yoga reported differently on another
site — why?**
> Sources genuinely disagree on the fine print for both. For Gajakesari,
> some sources add extra conditions beyond "Jupiter in a kendra from the
> Moon" — for instance, requiring the Moon itself not be in the 6th, 8th
> or 12th house, or not already caught in Kemadruma — before calling the
> yoga "fully formed." This report checks the core, most commonly cited
> condition only. For Kemadruma, sources disagree on whether the Sun
> counts as a "neighbour" that prevents the yoga: most sources include the
> Sun in that check (which is what this report does), but some — citing
> Brihat Parashara Hora Shastra — exclude the Sun specifically, reasoning
> that the Sun and Moon represent different enough principles (soul vs.
> mind) that the Sun's presence doesn't provide real companionship to the
> Moon. Neither reading is being treated as more authoritative here — it's
> a genuine, documented difference between sources.

**How is my Vimshottari Dasha balance calculated?**
> From your Moon's exact position within its Janma Nakshatra at birth.
> Each of the 27 nakshatras is ruled by one of 9 planets in a fixed
> repeating order, and each planet's Dasha (planetary period) has a fixed
> length in the 120-year cycle. The fraction of your Janma Nakshatra the
> Moon had already crossed at your birth is applied to that ruling
> planet's full Dasha length to find how many years of it remain — that
> remainder becomes your first (birth) Dasha, and the rest of the 120-year
> sequence follows in the fixed planetary order from there.

**Sources**: Gajakesari's core rule and its common additional refinement
conditions are cross-verified via clickastro.com ("A Guide to Gajakesari
Yoga") and ganeshaspeaks.com ("Gaj Kesari Yoga in Kundli"), both
independently listing "Jupiter in kendra from Moon" as the base rule and
"Moon not in 6th/8th/12th, no Kemadruma" as commonly-added refinements not
universally required. The Kemadruma Sun-inclusion disagreement is
cross-verified via a general web search converging on the "Sun typically
included" majority view, plus a direct fetch of jagannathhora.com's
"Kemadruma Yoga: Complete Guide," which explicitly describes both the
standard (Sun included) and strict/BPHS-citing (Sun excluded) positions —
confirming this is a real, documented split, not a single source's
personal opinion. The site's own implementation (`janma-kundali.astro`
lines 264-289) was read directly to confirm which side of each
disagreement its code falls on, rather than assumed.

## C. JS-only reference sections (already noted as thin elsewhere; not
re-flagged in detail here since this page's Group falls under FAQ-only
scope, but included for completeness)

- The entire report below the form — chart, Birth Summary, Planetary
  Positions table, House Lords table, Yoga list, and Vimshottari Dasha
  table/balance — is 100% client-rendered via `calculate()`, including
  the default (page-load) report. This mirrors `kundali.astro`'s gap in
  Group 2, at even larger scale (this report has more tables/sections).
