# jyotish/rudraksha.astro — content draft

Old static word count: ~150 words (intro subtitle + 2-paragraph "About
Rudraksha" card — higher than the ~106 words flagged in the original
assessment, but still thin relative to the Muhurta benchmark and has no
FAQ, so it stays in scope).
New word count (About section): ~200 words (existing 2 paragraphs kept
verbatim, one new paragraph added).

## A. Expanded "About this tool" section

Keep the existing two paragraphs unchanged (they're accurate and already
site-approved). Add a third paragraph describing the tool's own mechanism.

> Rudraksha (rudra + aksha, "tears of Shiva") are seeds of the Elaeocarpus
> ganitrus tree, prized for their spiritual and healing properties. Each
> bead has natural clefts called mukhis; the number of mukhis links it to a
> specific deity and ruling planet.
>
> The 5-mukhi is the most common and universally safe bead. Blue Sapphire
> energy (7-mukhi / Saturn) and 14-mukhi (Shiva / Saturn-Rahu) should
> always be worn after consulting a Jyotishi, as Saturn energy amplifies
> both positive and negative chart patterns.
>
> *[New]* This calculator offers two ways in: enter your birth date, time
> and place and it derives your Lagna and Moon Rashi the same way the
> site's other chart tools do (`calcLagna` and `moonLongitude`, both
> sidereal via the Lahiri ayanamsha), or skip straight to picking your
> Lagna and Moon sign if you already know them. From there it recommends
> the mukhi tied to your Lagna lord as your primary bead — since the
> planet ruling the Ascendant is traditionally treated as the most
> personally significant remedial planet — with your Moon lord's mukhi and
> the universally-safe 5-mukhi offered as supporting options.

**Sources**: the first two paragraphs are pre-existing, site-approved copy
— left unchanged, not re-verified in this pass. The new third paragraph's
"Lagna lord as primary remedial planet" principle is cross-verified via
rudraksha-ratna.com ("Know Your Rudraksha as per Rashi & Kundali") and
kntiwari.com ("Rudraksha As per Lagan-Rashi-Nakshtra"), which independently
describe Lagna-lord-based mukhi selection as a standard method — noted in
the FAQ below as one common approach, not the only one, since other
traditions key off Nakshatra or a specific afflicted planet instead. The
mechanism description (`calcLagna`/`moonLongitude`/ayanamsha) is grounded
directly in the page's own script, not an external source.

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**Why does the calculator offer two ways to find my Rudraksha?**
> "By Birth Details" computes your Lagna and Moon Rashi precisely from a
> full chart calculation — use this if you don't already know them. "By
> Rashi / Lagna" skips straight to the recommendation if you already know
> your signs from another source (a previous chart reading, a family
> priest, another tool) and just want them mapped to a mukhi instantly.

**Why is my primary recommendation based on my Lagna lord rather than my
Moon sign or Nakshatra?**
> Because the planet ruling your Ascendant is traditionally treated as the
> most personally significant remedial planet — it governs your body,
> personality and overall life direction. This is one common, sourced
> approach to Rudraksha selection, not the only one: some traditions
> instead recommend based on your Nakshatra, or on a specific planet that's
> weak or afflicted in your individual chart, which a general calculator
> like this one can't fully assess.

**Is it safe to wear any Rudraksha without consulting an astrologer?**
> Not universally. As noted above, the 5-mukhi is considered safe for
> nearly everyone, but 7-mukhi (Saturn) and 14-mukhi (Saturn-Rahu) beads
> are traditionally recommended only after a Jyotishi reviews your full
> chart, since Saturn's energy is believed to intensify whatever pattern —
> positive or negative — is already present.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **`#all-mukhis`** — the full 14-mukhi reference grid (`renderAllMukhis()`,
  every mukhi's deity, ruling planet and a one-line benefit) is 100%
  client-rendered.
- **`#birth-info` / `#rec-primary` / `#rec-rudraksha`** — the entire result
  panel (Lagna/Moon Rashi summary, primary recommendation card, supporting
  recommendation cards with mantra/metal/wearing instructions per mukhi)
  is built via `innerHTML` in `showResults()`/`rudCard()`. None of this is
  server-rendered, including the default (page-load) recommendation.
