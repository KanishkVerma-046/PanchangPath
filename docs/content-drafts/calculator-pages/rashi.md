# jyotish/rashi.astro — content draft

Old static word count: ~84 words (intro subtitle + "About Rashi" card).
New word count (About section only): ~205 words.

## A. Expanded "About this tool" section

Replaces the existing "About Rashi" card body. Keep the card heading
("About Rashi").

> Your Rashi — also called Chandra Rashi or Janma Rashi — is the zodiac
> sign the Moon occupied at the moment of your birth, and it's the
> single most-used placement in everyday Vedic astrology: it's the sign
> Rashifal predictions, Muhurta timing, and gemstone recommendations are
> built around, distinct from the Sun-based sign most Western horoscopes
> use.
>
> Because the Moon completes a full 360° circuit of the sidereal zodiac in
> about 27.3 days, it moves through each 30°-wide Rashi in roughly 2.25
> days on average — noticeably faster than the Sun, which takes about a
> month per sign. That speed is exactly why an accurate birth time matters
> more here than for a Sun-based reading: if your birth falls within a day
> or so of the Moon crossing into the next sign, only the precise time
> settles which Rashi is genuinely yours.
>
> This calculator computes the Moon's sidereal longitude for your birth
> date, time and place using the site's shared astronomy-engine-based
> `moonLongitude()` function, subtracts the Lahiri ayanamsha, and reads off
> the Rashi, its ruling planet, element, quality, and your Moon's exact
> Nakshatra Pada — the same math used everywhere else Rashi appears on this
> site.

**Sources**: astroyogi.com ("Sun Sign vs Rashi: Are You Confusing Your
Astrological Identities?") and drikpanchang.com ("Vedic Astrology
Rashiphal") both independently confirm that Vedic Rashifal is Moon-sign
based (not Sun-sign based) and that the Moon crosses a sign roughly every
2-2.5 days versus the Sun's ~1 month. The sidereal-month figure (27.3 days)
is standard astronomical fact, consistent with the page's pre-existing
"roughly 2.25 days per sign" claim, which was left unchanged.

The FAQ's parallax claim was checked directly against `src/lib/astro-core.ts`
(read 2026-08-19): `moonLongitude(jd)` at lines 16-18 calls
`EclipticGeoMoon(jd).lon` with no `Observer`/lat/lng argument at all — it is
geocentric everywhere it's used, including `panchang.ts`'s re-export that
`rashi.astro` and `nakshatra.astro` both import. The only place `astro-core.ts`
does take lat/lng for the Moon is `moonRiseSetUTC()`, which needs horizon
geometry for rise/set timing — a different calculation from longitude. So
this is a sitewide characteristic of the current Moon-longitude
implementation, not a `rashi.astro`-specific choice — worded that way in the
FAQ answer below. The "~1° near the horizon" parallax magnitude is
cross-verified against the IAU's adopted mean lunar horizontal parallax of
57′02.6″ (~0.95°) via two independent sources (a classical astronomy
textbook citing the Neison value, and a general astronomy reference).

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**How is my Rashi different from my Lagna (Ascendant)?**
> They come from different points in the chart. Rashi is the Moon's sign
> at birth — your emotional and mental nature, used for daily Rashifal.
> Lagna is the sign rising on the eastern horizon at birth — your physical
> body and outward personality, and the basis for all 12 houses. See the
> [Lagna calculator](/jyotish/lagna) for that separate calculation.

**Is this the same as my "zodiac sign" from Western horoscopes?**
> No. Western astrology uses the tropical zodiac, anchored to the seasons;
> Vedic astrology uses the sidereal zodiac, anchored to the actual
> background stars. Precession has opened a gap of roughly 24° between the
> two over the centuries — enough that most people's Vedic Rashi is one
> sign "earlier" than their familiar Western sun sign.

**Why does the calculator ask for my birth place?**
> Mainly to convert your local birth time into the correct universal time
> for the calculation. This calculator's Moon-longitude computation
> (`moonLongitude()` in `astro-core.ts`, the same function used sitewide
> for Rashi, Nakshatra, and Panchang) is geocentric — it doesn't apply a
> location-specific (topocentric/parallax) correction, a real effect that
> can shift the Moon's apparent position by up to roughly a degree near
> the horizon. That's a characteristic of how this site currently computes
> the Moon everywhere, not a claim that location is astronomically
> irrelevant to the Moon's position in general. In practice, your city
> selection here matters for getting the time zone right; it's your Lagna,
> not your Rashi, that's genuinely location-sensitive.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **Entire result panel** — Rashi name/symbol, element/quality/lord badges,
  the full `#detail-list` (Rashi, ruling planet, element, quality, Moon
  degree, Nakshatra, Pada, ayanamsha), the `#r-desc` characteristics
  paragraph (`DESC`/`DESC_HI`, 12 distinct descriptions), and the
  `#lucky-list` grid (lucky color, day, gemstone, number, compatible signs
  — `COLOR`/`DAY`/`GEM`/`COMPAT`/`NUM` arrays) are all built by
  `calculate()`'s `innerHTML` assignments. This is the largest JS-only gap
  found in Group 1 — apart from the intro and About card, essentially none
  of this page's substantive content is in the server-rendered HTML.
