# jyotish/sunsign.astro — content draft

Old static word count: ~200 words (intro subtitle + 2-paragraph "About Sun
Signs" card — notably higher than the ~128 words flagged in the original
assessment, and already close to or within the 150-250 Muhurta benchmark
range on its own). This page matches the original assessment's framing
exactly: "decent explainer but no FAQ" — the gap here is FAQ-only, not
About-section depth, unlike every other Group 1-4 page so far.
New word count (About section): ~240 words (small addition, not a full
new paragraph, to avoid overshooting the benchmark unnecessarily).

## A. Small addition to "About this tool" section

Keep both existing paragraphs unchanged. Add one short sentence (not a
full paragraph) explaining why birth time/place are optional here, since
that's the one thing about the tool's own behavior the existing text
doesn't cover.

> Western astrology uses the tropical zodiac, anchored to the seasons
> (Aries always begins at the spring equinox). Vedic astrology uses the
> sidereal zodiac, anchored to the actual fixed stars. Due to the
> precession of the equinoxes, the two have drifted apart by roughly 24°
> over millennia.
>
> A person born in late March will typically be a Western Aries but a
> Vedic Pisces. Both systems are internally consistent — they just measure
> from different reference points. In Jyotish, the Vedic Sun sign
> describes the soul's core purpose, while the Moon sign (Rashi) governs
> the mind and daily life. *[New sentence appended here]* Birth time and
> place are optional on this calculator specifically because they only
> matter on the one or two days each month when the Sun is crossing from
> one sign to the next — for any other birth date, the day alone fixes
> both Sun signs precisely.

**Sources**: no new external sourcing needed — the tropical/sidereal
distinction and ~24° precession gap are already-approved, pre-existing
site copy (also independently consistent with the sidereal-zodiac sources
verified for `rashi.md` in Group 1). The new sentence describes the
calculator's own optional-field behavior, verified directly against
`sunsign.astro`'s `westernSign()`/`calculate()` (the Western sign comes
from calendar date alone; the Vedic sign only needs birth time/place to
resolve the Sun's exact degree near a sign boundary, since the Sun moves
roughly 1°/day).

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**Why does the calculator ask for time and place if they're marked
optional?**
> Because they only change the result on the one or two days a month when
> the Sun is actually crossing from one sign into the next. The Sun moves
> only about 1° per day, so unless your birthday falls right on one of
> those crossing days, the date alone is already enough to fix both your
> Western and Vedic Sun sign precisely — time and place don't add any
> further precision.

**If my Western and Vedic Sun signs differ, which one is "correct"?**
> Neither is wrong — they answer different questions using different
> reference points. Western tropical astrology (the sign in most
> newspaper horoscopes) measures from the seasons; Vedic sidereal
> astrology measures from the actual background stars. If you're reading
> a Jyotish prediction, in-depth Vedic Panchang, or anything else on this
> site, the Vedic sign is the relevant one; the Western sign is what
> applies to typical Western pop-astrology content.

**My birthday is right around a sign changeover (like late March) — how
do I know which sign I actually am?**
> That's exactly the case where entering an exact birth time and place
> matters, unlike for most other birth dates. Late March is a genuine edge
> case for this reason: it's close to when the Western Aries/Pisces
> boundary falls, and — separately — often lands right around the Vedic
> Pisces/Aries boundary too because of the ~24° ayanamsha offset. Fill in
> the optional fields for the most reliable result if your birthday is
> within a day or two of either boundary.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **`#card-w` / `#card-v`** — both sign result cards (dates, element,
  quality, ruler, compatible signs for both the Western and Vedic sign)
  are built via `innerHTML` in `calculate()`/`signCard()`.
- **`#diff-note`** — the "why are they different" explanation specific to
  the visitor's actual two signs is client-only.
- **`#trait-title` / `#trait-text`** — the full Vedic Sun-sign personality
  profile (12 distinct ~55-word descriptions in `SOLAR_TRAITS`/
  `SOLAR_TRAITS_HI`) is client-only, including the default result shown on
  page load.
