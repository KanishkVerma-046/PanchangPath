# jyotish/kundali.astro — content draft

Old static word count: ~145 words (intro subtitle + 2-paragraph "About the
Janma Kundali" card — higher than the ~107 words flagged in the original
assessment, but still thin and has no FAQ).
New word count (About section): ~195 words (existing 2 paragraphs kept
verbatim, one new paragraph added).

## A. Expanded "About this tool" section

Keep the existing two paragraphs unchanged. Add a third describing the
tool's own mechanism.

> The Janma Kundali (birth chart) is a map of the heavens at the exact
> moment and place of your birth. The 12 houses (bhavas), the rashi rising
> on the eastern horizon (Lagna), and the placement of the nine grahas
> together describe your life's potential, strengths and karmic patterns.
>
> Choose from four regional chart styles: North Indian (Hindustani
> diamond/kite), South Indian (fixed-sign 4×4 grid used in Tamil Nadu and
> Karnataka), East Indian (Bengali 3×3 square), or West Indian
> (Gujarati/Marathi fixed-sign grid). All styles show the same
> astronomical data.
>
> *[New]* This generator computes all nine grahas' sidereal positions from
> the site's shared `allTropicalLons()` and Lahiri ayanamsha, plus your
> Lagna via `calcLagna()` — the same math used across every chart tool on
> this site. Retrograde (Vakri) status for the five classical outer
> planets is derived by comparing each planet's longitude a day apart;
> Rahu and Ketu, always in retrograde motion by definition, are marked
> Vakri directly. The Key Interpretations panel also identifies your
> Atmakaraka — the planet holding the highest degree within its sign, the
> Jaimini system's primary soul-significator.

**Sources**: the first two paragraphs are pre-existing, site-approved copy
— unchanged. The new paragraph's Atmakaraka description is cross-verified
via jagannathhora.com ("Atmakaraka in Vedic Astrology: Meaning,
Calculation, All 8 Planets & Navamsa Interpretation") and vaya.so ("What is
Atmakaraka?"), both independently confirming "highest degree within sign =
soul significator" as the standard Jaimini definition. Retrograde motion's
physical explanation (an apparent effect of relative orbital speed, not
real backward travel) is cross-verified via amuedge.com and a Star Walk
(Medium) explainer, both independent, general-astronomy sources — not
Jyotish-specific, since this is uncontested physics. The
`allTropicalLons`/`calcLagna`/retrograde-comparison mechanism description is
grounded directly in the page's own script (read 2026-08-19), not an
external source — including one detail worth flagging: the code's
Atmakaraka search (`kundali.astro` line ~302) excludes Ketu but *does*
include Rahu as a candidate (using a reversed degree convention, since Rahu
moves backward through the zodiac by definition) — matching the "7 or 8
Chara Karakas, some traditions add Rahu as an 8th" variant noted by
jagannathhora.com, not the strict 7-classical-planet-only version. Worth
being precise about this in the FAQ below since it's a real, checkable
implementation detail, not a generic claim.

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**What is the Atmakaraka shown in my interpretations, and how is it
found?**
> The Atmakaraka ("soul significator") is whichever planet has progressed
> furthest through its own sign — measured in degrees from 0° to 30°,
> regardless of which sign that is. In the Jaimini system, this planet is
> treated as the primary indicator of the soul's purpose in this lifetime.
> This calculator checks the Sun through Saturn plus Rahu (using Rahu's
> reversed degree count, since it always moves backward through the
> zodiac) and excludes Ketu — one common variant of the calculation; some
> traditions use only the seven classical planets.

**Why are there four chart style options, and do they show different
information?**
> No — North Indian, South Indian, East Indian and West Indian are just
> different regional visual conventions for arranging the same 12 houses
> and planetary positions. North Indian is a fixed diamond with rotating
> house numbers; South and West Indian use a fixed 4×4 grid with rotating
> sign positions; East Indian uses a 3×3 Bengali layout. Whichever style
> you're used to reading, the underlying chart is identical.

**What does "Vakri" (retrograde) next to a planet mean — is it really
moving backward?**
> No planet actually reverses direction in its orbit. Retrograde is an
> apparent effect: as Earth and another planet orbit the Sun at different
> speeds, the other planet can appear to move backward against the
> background stars for a period, the same way a car you're overtaking
> seems to slide backward relative to you. This calculator detects it by
> comparing each planet's longitude one day apart — if it's decreased,
> the planet is marked Vakri.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **The entire chart** (`#chart-box`, all four style renderers) and
  **`#planet-table`** (all nine grahas' sign, degree, Nakshatra, Pada and
  motion) are 100% client-rendered — including the default chart shown on
  page load.
- **`#interp`** — all four interpretation paragraphs (Lagna, Moon Sign,
  Sun Sign, Atmakaraka) are built via `innerHTML` in `calculate()`.
- **`#summary-list`** — the Birth Summary panel (Lagna, Lagna Lord, Moon
  Rashi, Sun Rashi, Nakshatra, Ayanamsha) is likewise client-only.
- This is the largest JS-only surface found so far across both groups —
  essentially the entire page below the form is invisible to crawlers,
  including the default (page-load) chart for today's date at New Delhi.
