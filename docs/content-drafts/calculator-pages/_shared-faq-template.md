# Shared FAQ Template — Jyotish Calculator Pages

Status: **Approved** (2026-08-19, after one revision to Q2's accuracy framing).
Applies to all 12 pages in this content pass. Q1/Q3 are used near-verbatim
everywhere; Q2 is verbatim everywhere (the drift figure is site-wide, not
per-tool). Each page adds 2-3 page-specific questions on top of these three —
see the per-page draft files in this directory.

---

### Q1: What calculation method does this tool use?

> This tool uses the Drik (astronomical) method with Lahiri Ayanamsha, the
> same standard used across PanchangPath. Planetary positions come from a
> high-precision ephemeris (astronomy-engine, based on VSOP87/ELP-2000
> orbital theory) rather than simplified lookup tables — the same
> calculation engine used for every Panchang, Muhurta, and Kundali tool on
> this site.

### Q2: How accurate are the results?

> Planetary and Lagna positions are computed from a high-precision ephemeris
> (astronomy-engine, based on VSOP87/ELP-2000 orbital theory), accurate to a
> few arcseconds. The site's Lahiri ayanamsha — the sidereal correction
> applied to those positions — is a fixed formula that runs slightly off
> from published, Swiss-Ephemeris-based reference values: about an
> arcminute today, growing slowly over time. For sign, Nakshatra, or house
> placement this is negligible in nearly every case — but the largest real
> source of error isn't the math at all, it's input: a result near any
> boundary is sensitive to the exact birth date, time, and location entered,
> and a birth time off by even a few minutes can shift a boundary-adjacent
> placement.

Sourcing for the ayanamsha claim:
`docs/audits/notes/2026-08-19-ayanamsha-rate-check.md` — re-derived directly
from `astro-core.ts:50-53`, cross-checked against the IAU 1976 precession
constant and real published Lahiri ayanamsha values (jagannathhora.com,
which states it computes via Swiss Ephemeris). Phrased as "roughly an
arcminute" rather than a precise arcsecond figure per review note: two
different measurement approaches landed in a similar but not identical
range, so a single precise number would overstate the certainty of the
measurement itself.

### Q3: Should I make decisions based on this?

> Treat this as a traditional Jyotish framework, not a guarantee. Nothing
> on PanchangPath constitutes religious or professional astrological
> guidance — for decisions that matter (marriage, health, major purchases),
> these results are a starting point for your own judgment or a
> consultation, not a substitute for either.

Per-page adaptation: keep the sentence structure, swap only the
parenthetical examples to match the tool's actual use case (e.g.
horoscope-match → "before a marriage decision"; mangal-dosha → "before
deciding a match is incompatible"; gemstone/rudraksha → "before buying an
expensive stone").

Grounded in `about.astro`'s existing disclosure ("Nothing on this site
constitutes religious or professional astrological guidance") and
`rashifal/index.astro`'s existing disclosure tone, so this doesn't introduce
a new register the site hasn't already committed to.
