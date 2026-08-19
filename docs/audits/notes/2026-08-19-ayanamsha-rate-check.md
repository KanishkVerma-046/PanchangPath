# Lahiri Ayanamsha Polynomial — Rate Check vs. Published References — 2026-08-19

Triggered by a content-accuracy question during the Jyotish-calculator FAQ drafting
task: does the site's Lahiri ayanamsha formula (`lahiriAyanamsha()` in
`src/lib/astro-core.ts:50-53`) have a measurable rate-of-drift issue against
independent, higher-precision references? **Research only — no `src/` files were
modified.**

## The code being checked

```ts
// src/lib/astro-core.ts:50-53
export function lahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.85 + 1.3612 * T - 0.000136 * T * T;
}
```

`T` is Julian centuries from J2000.0. This is the site's only ayanamsha
implementation — `panchang.ts` and `kundali.ts` both re-export it verbatim (see
`docs/audits/notes/2026-07-21-post-migration-accuracy-audit.md`), so every page on
the site (Panchang, Muhurta, all 15 Jyotish calculators) uses this exact formula.

## Step 1 — Derive the formula's own implied precession rate

`d(ayanamsha)/dT = 1.3612 - 0.000272*T` (degrees/century). The quadratic term is
small enough that this stays within 48.99–49.01″/yr across the entire 1900–2050
range (converting via ×3600″/° ÷100 yr/century):

- At T=0 (year 2000): 1.3612 × 36 = **49.0032″/yr**
- At T=0.26 (year ≈2026): **49.0007″/yr**

So the formula's own rate of increase is ≈**49.00″/yr**, essentially flat across
the whole practical date range — not 48.94″/yr (a number floated during this
session that doesn't reproduce from the actual code; flagging that specific figure
as unconfirmed/incorrect).

## Step 2 — Independent reference rate (precession constant)

Two independent sources, cross-checked via WebSearch:

1. IAU (1976) System of Astronomical Constants: general precession in longitude =
   5029.0966″/century = **50.290966″/yr** (confirmed via multiple astronomy
   references, e.g. summaries of the IAU 1976 resolutions).
2. Independent confirmation via astrology-reference sites converging on the same
   figure: "the vernal equinox point regresses along the ecliptic at
   approximately 50.29 arcseconds per year... equivalent to approximately 1° every
   71.6 years."

Both land on **≈50.29″/yr** — this is the theoretically correct rate at which any
sidereal-vs-tropical offset (ayanamsha) should grow over time, to first order.

## Step 3 — Third check: actual published Lahiri ayanamsha values (Swiss-Ephemeris-based)

To avoid relying only on a theoretical constant, I pulled real published Lahiri
ayanamsha values from jagannathhora.com's historical reference table
(`curl` + manual HTML-tag-stripping, per this project's established method for
exact-text extraction — not WebFetch, which paraphrases). The page states plainly:
*"Every value on this page is computed with the Swiss Ephemeris implementation of
the Lahiri (Chitra Paksha) ayanamsa... the long-term precession mean of 50.3″ per
year."* This is a literal Swiss-Ephemeris-grade reference, exactly the kind of
source needed here.

Verbatim extracted values:

| Year | Published Lahiri ayanamsha (Swiss Ephemeris) | Decimal degrees |
|---|---|---|
| 1900 | 22° 27′ 55″ | 22.465278° |
| 2000 | 23° 51′ 12″ | 23.853333° |
| 2026 | 24° 13′ 19″ | 24.221944° |
| 2050 | 24° 33′ 35″ | 24.559722° |

Average rate, 1900→2050 (150 years): (24.559722° − 22.465278°) / 150 = 0.013963°/yr
= **50.267″/yr** — matches the IAU constant (Step 2) closely, as expected, and
matches the page's own stated "50.3″/yr long-term mean."

## Step 4 — Site's polynomial vs. the same reference, at the same years

Plugging the reference years into the site's actual formula:

| Year | Site's `lahiriAyanamsha()` output | Published (Swiss Ephemeris) | Difference |
|---|---|---|---|
| 1900 | 22.488664° | 22.465278° | site is **+84.2″ high** |
| 2000 | 23.850000° | 23.853333° | site is **−12.0″ low** |
| 2026 (today) | 24.203903° | 24.221944° | site is **−65.0″ low** |
| 2050 | 24.530566° | 24.559722° | site is **−105.0″ low** |

**Confirmed: a real, non-hypothetical, reproducible gap exists.** The site's
polynomial was evidently curve-fit to minimize error somewhere around the
1980s–2000s (it's within ~12″ of the true value at year 2000) and diverges on both
sides of that calibration window, because its rate of change (~49.00″/yr) runs
about 1.29″/yr slower than the true precession-driven rate (~50.29″/yr). As of
2026 the site is about **65 arcseconds (≈1.08 arcminutes) low**, growing toward
~105″ by 2050.

## Practical significance

This is real but small in context. A Nakshatra spans 13°20′ = 48,000″; a Rashi
spans 30° = 108,000″. A 65–105″ ayanamsha error is roughly 0.1–0.2% of a Nakshatra
width — it will not change which sign or Nakshatra a planet falls in except for
positions that are already within about a minute of arc of a boundary. Since the
site's planetary positions themselves come from `astronomy-engine`
(arcsecond-precision VSOP87/ELP-2000, per `astro-core.ts`), this ayanamsha gap is
actually the **dominant source of systematic error** in the site's sidereal
output — larger than the underlying ephemeris uncertainty — but its real-world
effect on a typical chart reading is a sub-arcminute nudge, not a wrong sign or
Nakshatra, except at true edge cases.

## Recommendation (not implemented here)

Not fixed in this pass — flagging for a future task. If it's worth correcting,
the fix is narrow: replace the 3-term quadratic with a formula whose slope matches
the ~50.29″/yr precession constant (or recalibrate the existing quadratic's
coefficients against a longer baseline of true Swiss-Ephemeris values rather than
a single-epoch fit). Any such change should be re-verified against the same
1900/2000/2026/2050 checkpoints used here before being trusted.

## Self-review

- Site-side numbers are computed directly from the actual current code
  (`astro-core.ts:50-53`), not recalled from memory.
- External reference values are from a `curl`-fetched, tag-stripped, verbatim copy
  of jagannathhora.com's page (saved HTML inspected directly), not a WebFetch
  paraphrase — consistent with this project's established practice for exact
  numeric/text extraction.
- Two independent lines of evidence for the "true" rate: the IAU 1976 precession
  constant (~50.29″/yr) and the empirical slope of real published Lahiri values
  over a 150-year span (~50.27″/yr) — they agree with each other, which is the
  cross-verification bar this project's content tasks require.
- The originally-floated "48.94″/yr", "Swiss Ephemeris drift already documented
  in this project", and a later-referenced "75-year-baseline estimate of
  57-62″" were all checked and **not substantiated**: no such numbers reproduce
  from the current code, and no prior doc anywhere in this repo's history
  (searched via `grep`, `git log -p --all`, `git reflog`, and all local
  branches/worktrees — `chore/permission-allowlist`,
  `worktree-astro-core-migration`, `worktree-seo-prerender-batch`) records this
  comparison. This note is a new, first-time measurement, not a re-derivation of
  a lost one. Because no prior computation could be located, this note cannot
  confirm or deny whether the ~49.00″/yr figure here differs from an earlier
  session's number due to rounding/methodology or due to an actual code change
  — there is nothing to diff it against. The 49.00″/yr figure is verified
  directly against `astro-core.ts:50-53` as it exists right now, independent of
  any prior session's claims.
