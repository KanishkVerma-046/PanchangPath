# jyotish/kalasarpa.astro — content draft

Old static word count: ~140 words (intro subtitle + single-paragraph "About
Kalasarpa Yoga" card — higher than the ~109 words flagged in the original
assessment, but the specific complaint — "12 types mentioned but not
explained" — is accurate: the types are named as existing but neither
listed nor explained anywhere in static HTML).
New word count (About section): ~210 words.

## A. Expanded "About this tool" section

**⚠ Pre-existing copy/code mismatch found here, corrected as part of this
draft** (checked directly against `kalasarpa.astro` lines 148-149; not a
new-content addition, a one-phrase factual fix): the existing paragraph
says the 12 types depend on "the sign occupied by Rahu." That's wrong —
the code's own comment says the type-naming logic was already fixed to use
"the house Rahu occupies counted from the Lagna... not... Rahu's raw
zodiac sign (Issue #25)," and two independent sources (astrogle.com,
drikpanchang.com) confirm house-from-Lagna is the correct, standard
convention. So the calculation is correct; only the description next to
it is stale. Left as-is, the draft below would otherwise say "sign" in
paragraph one and "not sign, it's house" in paragraph three — an
on-page contradiction. Fixed by correcting the one phrase in place, not by
leaving the error and arguing with it a paragraph later.

Below is the full corrected "About this tool" text — paragraph 1 has the
one-phrase fix applied inline (marked), paragraph 2 is new:

> Kalasarpa Yoga (the "serpent of time") occurs when all seven classical
> planets — Sun, Moon, Mars, Mercury, Jupiter, Venus and Saturn — are
> confined to one side of the Rahu–Ketu axis. There are 12 named types
> depending on **the house Rahu occupies from the Lagna** *(corrected from
> "the sign occupied by Rahu")*. It is said to bring delays, struggles and
> sudden ups and downs, but also intense focus and the potential for
> remarkable achievement once the karma is worked through. If even one
> planet falls outside the axis, the yoga is considered partial or absent.
>
> This detector names your specific type from among the traditional 12 —
> Ananta through Sheshanaga — the 1st house from Lagna gives Ananta, the
> 2nd gives Kulika, and so on through the 12th. It also distinguishes
> Anuloma from Viloma — this calculator defines Anuloma as all seven
> planets sitting on the side running forward from Ketu toward Rahu, and
> Viloma as the reverse; sources aren't fully consistent on how this
> distinction is defined (see the FAQ below), though they agree Anuloma is
> traditionally read as the more favorable of the two, Viloma as more
> difficult. A planet within about 2° of either node is flagged as forming
> only a partial yoga.

(The bolded phrase and italic parenthetical above are just this draft
file's way of marking the fix for review — on the live page it would
simply read "depending on the house Rahu occupies from the Lagna," no
bold/italic/parenthetical.)

**Sources**: the house-from-Lagna (not raw-sign) naming convention is
cross-verified via astrogle.com ("Kalasarpa Dosha types, effects and
Remedies") and drikpanchang.com ("About Kalasarpa Yoga"), both
independently confirming the 12 types map to Rahu's house from Lagna.

**Revised 2026-08-19 after re-verification**: Anuloma/Viloma's
favorable/unfavorable *valence* (Anuloma good, Viloma difficult) is
solidly cross-verified via paramarsh.app ("Kaal Sarpa Yoga Between Rahu
and Ketu") and jyotishsamadhangyan.wordpress.com, both agreeing on that
point — kept as-is. But the *mechanism* used to distinguish the two is not
settled across sources, and the original draft overstated agreement here.
This calculator's own "zodiacal direction from Ketu toward Rahu" framing
matches one common definition, but paramarsh.app's own full text — not
just the passage originally cited — states explicitly: "the terminology
is not uniform, so any reading must state its convention before calling a
formation anuloma or viloma." Several other sources define the
distinction by a different mechanism entirely: which node, Rahu or Ketu,
is "ahead" versus "behind" in the chain of planets, rather than by
zodiacal direction. This is a genuine, source-confirmed terminology
disagreement — not a site error — so it's disclosed rather than resolved,
following the same treatment already used for this file's own "Partial"
terminology point in the FAQ below, and for `sadesati.md`'s Dhaiya
disagreement.

The ~2° conjunction threshold is the page's own implementation choice, not
an externally sourced exact figure — worded that way in the FAQ below, not
presented as a universal constant.

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**How is my specific Kalasarpa type (like Ananta or Vasuki) determined?**
> By which house Rahu occupies, counted from your Lagna — not by Rahu's
> zodiac sign directly. Rahu in the 1st house from your Lagna gives
> Ananta, the 2nd gives Kulika, and so on through all 12 houses to
> Sheshanaga in the 12th. This matches the standard convention used across
> Vedic astrology references for naming the 12 types.

**What's the difference between Anuloma and Viloma, and does it matter?**
> This calculator distinguishes them by zodiacal direction: in Anuloma
> ("with the current"), all seven planets sit on the arc running forward
> from Ketu to Rahu; in Viloma ("against the current"), they sit on the
> reverse arc, from Rahu to Ketu. Worth being upfront about, though:
> sources don't agree on how this distinction is defined in the first
> place. Some, like this calculator, use the zodiacal-direction framing
> above; others define it instead by which node — Rahu or Ketu — is
> "ahead" versus "behind" in the chain of planets, a related but not
> always identical test. Even paramarsh.app, one of the sources for this
> framing, states plainly that "the terminology is not uniform, so any
> reading must state its convention before calling a formation anuloma or
> viloma." What is well-corroborated across sources: Anuloma is
> traditionally read as the more favorable of the two directions, Viloma
> as more difficult — that part isn't in dispute, even where the exact
> definition mechanism is. Both still carry the core Kalasarpa themes of
> delay and eventual transformation.

**What does "Partial" Kalasarpa mean here, and is it less serious than the
full yoga?**
> On this calculator specifically, "Partial" means all seven planets are
> confined to one side of the axis, but one of them sits within about 2°
> of Rahu or Ketu — close enough that classical sources describe the
> conjunction as blurring the clean enclosure and softening the yoga's
> effect. Worth noting: some other sources use "partial" differently — for
> a case where one planet falls fully outside the axis, which this
> calculator instead reports as no yoga forming at all. The terminology
> isn't fully standardized across sources, so it's worth checking exactly
> what a given site or astrologer means by "partial" before comparing
> results.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **`#ks-banner` / `#pos-table` / `#effect` / `#remedies`** — the entire
  result (yoga present/absent verdict, all 7 planets' positions relative
  to the Rahu-Ketu axis, the type-specific effects paragraph, and the
  remedies list) is built via `innerHTML` in `calculate()`.
- **All 12 types' names and effect paragraphs** (`KALASARPA_TYPES`,
  `KS_EFFECTS` — both an Anuloma and a Viloma variant per type, 24
  distinct paragraphs total) exist only in the client script; none of it
  is server-rendered, including for a chart that does have the yoga.
- The 5 classical remedies listed are generic (same list regardless of
  which of the 12 types is detected) — also JS-only.
