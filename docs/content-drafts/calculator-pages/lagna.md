# jyotish/lagna.astro — content draft

Old static word count: ~80 words (intro subtitle + "About the Lagna" card).
New word count (About section only): ~195 words.

## A. Expanded "About this tool" section

Replaces the existing "About the Lagna" card body. Keep the card heading
("About the Lagna").

> The Lagna (Ascendant) is the rashi rising on the eastern horizon at the
> exact moment and place of birth — Vedic astrology's First House, and the
> reference point every other house is measured from. Because Earth
> completes a full rotation in roughly 24 hours, a new sign rises
> approximately every two hours, so an accurate birth time genuinely
> matters: the Ascendant's ecliptic longitude advances by about one degree
> every four minutes on average, which is enough to shift the Lagna's exact
> Nakshatra Pada, and near a sign boundary, the sign itself.
>
> This calculator computes your sidereal Lagna from your birth date, time
> and place using the same astro-core.ts geometry (`calcLagna`) used across
> every chart on this site — it derives the Ascendant's tropical ecliptic
> longitude from local sidereal time and the observer's geographic
> coordinates, then subtracts the Lahiri ayanamsha to convert it to the
> sidereal zodiac. From that single value the tool derives all 12 house
> cusps (whole-sign houses, with the Lagna sign as House 1), the Lagna's
> ruling planet (Lagna lord), and the house that lord occupies — one of the
> most closely read placements in a full chart, since it points to where a
> person's core life energy is expressed most strongly.

**Sources**: astrosage.com ("Ascendant Sign — Your Lagna or Rising Sign"),
indastro.com ("What is Ascendant or lagna in astrology?"), hindupad.com
("Lagna, 1st House: Ascendant in Vedic Astrology") — all independently
confirm the ~2-hour-per-sign rotation rate and the First House's role as
the chart's anchor. The "1° per 4 minutes" figure is a direct arithmetic
consequence of 360°/24h (not a claim requiring external sourcing). The
`calcLagna`/ayanamsha mechanism description is grounded in the site's own
`src/lib/astro-core.ts` and CLAUDE.md's Architecture section, not external
sources.

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**What's the difference between my Lagna and my Rashi (Moon sign)?**
> They're based on different things entirely. Your Rashi is the sign the
> Moon occupied at birth — it reflects your mind and emotional nature, and
> is what daily Rashifal predictions use. Your Lagna is the sign rising on
> the eastern horizon at birth — it reflects your body, outward personality
> and life direction, and sets up the entire 12-house framework. Most
> people have a different Lagna than Rashi; only someone born near sunrise
> tends to have the two align.

**Why does the tool need my birth time down to the minute?**
> Because the Lagna moves fast: about one degree every four minutes, or a
> full sign roughly every two hours. A 10-minute error in birth time shifts
> the Lagna by about 2.5° — usually not enough to change which sign is
> rising, but enough to shift the exact degree, Nakshatra Pada, and house
> cusps. If your birth was close to a sign changeover, even a few minutes
> can change the result.

**What if I don't know my exact birth time?**
> Without a reasonably accurate time, the Lagna calculation isn't reliable
> — a birth certificate's rounded time, or a family's rough recollection,
> can be off by enough to land you in the wrong sign. If you only know your
> birth date, the [Rashi calculator](/jyotish/rashi) or
> [Nakshatra calculator](/jyotish/nakshatra) are more forgiving, since the
> Moon moves more slowly than the Ascendant.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **`#house-list`** — the 12-house significance grid (`HOUSES`/`HOUSES_HI`
  arrays, e.g. "House 1: Self, body, personality" through "House 12: Loss,
  expenses, moksha") is built entirely by `calculate()`'s `innerHTML`
  assignment. Zero of this is in the server-rendered HTML.
- **`#trait-text`** — the full Lagna personality-profile paragraph
  (`LAGNA_TRAITS`/`LAGNA_TRAITS_HI`, 12 distinct ~50-word descriptions, one
  per rising sign) is also client-only.
