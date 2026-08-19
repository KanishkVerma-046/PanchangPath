# jyotish/sahasra-chandrodaya.astro — content draft

Old static word count: ~140 words (intro subtitle + 2-paragraph "About
Sahasra Chandra Darshan" card — higher than the ~107 words flagged in the
original assessment).
New word count (About section): ~190 words.

## ⚠️ Pre-existing factual issue found during verification (not fixed here)

The page's hero subtitle and About card both currently say the milestone
falls "at around 80 years and 8 months of age." Checking the math
independently: 1000 synodic months × 29.530589 days = 29,530.589 days ÷
365.25 days/year = **80.85 years ≈ 80 years, 10 months** — not 8 months.
Wikipedia's own "Sahasra Purna Chandrodayam" article states this
explicitly: "1000 moons equals 29530 days = 80.849 years = approximately
**80 years, 10 months** on the Western calendar," and separately notes the
celebration is traditionally held "3 full moons before a person's 81st
birthday" (roughly consistent with 80y10m, not 80y8m). This is a
pre-existing site error, not something introduced by this content pass —
flagging it rather than fixing it, since fixing `src/` files is out of
scope for this content-drafting task. New draft content below avoids
restating the specific "8 months" figure so it doesn't compound the error
or create an on-page contradiction.

## A. Expanded "About this tool" section

Keep the existing two paragraphs, but the first paragraph's "roughly 80
years and 8 months" phrase should be corrected to "roughly 80 years and 10
months" whenever this content is actually applied — see the flag above.
Add a third paragraph describing the tool's own mechanism.

> In Hindu tradition, witnessing one thousand full moons is a sacred
> achievement signifying a long, blessed life. Since a lunar (synodic)
> month is about 29.53 days, 1000 full moons span roughly 80 years and 10
> months. [↑ corrected from "8 months" — see flag above] The occasion,
> sometimes called *Sahasra Chandra Darshana Shanti*, is marked with a
> special puja and family celebration.
>
> This calculator estimates the date by adding 999 synodic months to the
> first full moon after birth. Actual full-moon dates vary slightly due to
> the Moon's elliptical orbit.
>
> *[New]* The calculator finds your first full moon after birth precisely
> — solving for the moment the Moon-Sun elongation crosses 180°, using the
> site's shared `sunTrueLongitude()` and `moonLongitude()` functions — then
> adds 999 more synodic months (29.530589 days each, the modern mean
> value) to reach the 1000th. Because full moons repeat roughly every 29.5
> days, a birth time to the hour rarely changes which lunar cycle counts
> as the first one; that's why, unlike most calculators on this site, this
> one only asks for a birth date, not a time or location.

**Sources**: Wikipedia ("Sahasra Purna Chandrodayam") and hindupad.com
("How to Calculate Sahasra Chandra Darshan") both independently confirm
the ~80-years-10-months figure and the 999-synodic-months-from-first-full-
moon method (matching the site's own implementation). The mechanism
description is grounded directly in `sahasra-chandrodaya.astro`'s own
script (`nextFullMoon()`, `elong()`, the `SYN = 29.530589` constant), not
an external source.

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**Why doesn't this calculator ask for my birth time or location, unlike
most other tools on this site?**
> Because full moons repeat roughly every 29.5 days, a difference of a few
> hours in birth time essentially never changes which lunar cycle counts
> as your first — only a birth within hours of an actual full moon could
> shift the count, and even then by at most one moon out of a thousand.
> Birth date alone is precise enough for a milestone this many decades
> out.

**How precise is the estimated date?**
> The date comes from a real astronomical calculation — an iterative solve
> for the exact Moon-Sun elongation crossing, the same method used
> elsewhere on this site — not a rough rule of thumb. The one source of
> drift: after finding your precise first full moon, the calculator adds
> 999 more cycles at the mean synodic month length (29.530589 days) rather
> than solving each one individually, so the final date can land a day or
> so off from a fully rigorous month-by-month calculation, for the same
> reason the page's own note already states — the Moon's elliptical orbit
> makes real synodic months a few hours longer or shorter than the mean,
> and those small differences accumulate slightly over 999 cycles.

**Is the 1000th full moon exactly your 80th birthday?**
> No — it falls a little after, in a person's early 80s, since 1000 lunar
> cycles run longer than 80 solar years (see the About section above for
> the precise figure). It's a separate, purely lunar milestone from a
> birthday, which is why it's calculated in full moons rather than years.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- The entire result panel (`#big-date`, `#big-meta`, the "Full moons so
  far / Age at milestone / Years remaining" stat grid, and the progress
  bar) is built via `innerHTML`/`textContent` assignment in `calculate()`
  and never renders until the button is clicked or the page-load
  `calculate()` call runs client-side. Lower-severity than Group 1/2's
  other JS-only gaps, since this page's result is inherently
  input-dependent (a specific birth date) rather than a fixed reference
  table — there's no single "default" version worth prerendering the way
  New Delhi/today works for the Muhurta pages.
