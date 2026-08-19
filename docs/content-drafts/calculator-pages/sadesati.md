# jyotish/sadesati.astro — content draft

Old static word count: ~165 words (intro subtitle + single-paragraph
"About Shani Sadesati" card — higher than the ~117 words flagged in the
original assessment, but still no FAQ, and the three-phases panel is
JS-only as flagged).
New word count (About section): ~250 words.

## A. Expanded "About this tool" section

Keep the existing paragraph unchanged. Add a new paragraph describing the
tool's own mechanism.

> Saturn (Shani) takes about 29.5 years to circle the zodiac, spending
> roughly 2.5 years in each sign. Sadesati ("seven and a half") is the
> period when Saturn passes through the 12th, 1st and 2nd signs from your
> natal Moon — about 7.5 years in total. It recurs roughly every 30 years,
> so most people experience it two to three times in a lifetime. Though
> known for tests and hard lessons, Sadesati is ultimately a period of
> maturity, discipline and lasting growth. Dates here are approximate
> (computed from Saturn's sidereal sign ingress).
>
> *[New]* This calculator scans forward from your birth date to find every
> window where Saturn's sidereal position falls in one of the three signs
> anchored to your natal Moon, then locates the boundary between each of
> the three roughly-2.5-year sub-phases the same way — using the site's
> shared `planetLongitude('saturn', ...)` and Lahiri ayanamsha. The three
> sub-phases are commonly labelled Rising, Peak and Setting: the middle
> one, when Saturn transits directly over your Moon sign, is traditionally
> considered the most intense of the three, since it tests career, health,
> relationships and self-image most directly.

**Sources**: astroyogi.com ("Sade Sati Calculator: Know Effects, Phases
And Remedies") and jagannathhora.com ("Sade Sati Complete Guide") both
independently confirm the Rising/Peak/Setting three-phase structure and
that the Peak (Saturn-over-Moon) phase is traditionally the most
challenging — matching the page's existing "most intense" framing, left
unchanged. The mechanism description is grounded directly in the page's
own script (`saturnSign()`, `findSubPhases()`), not an external source.

**A genuine terminology disagreement found while researching, per the
task's "note the disagreement, don't pick a side" instruction**: this
page's phase labels use "First Dhaiya" / "Final Dhaiya" for the Rising and
Setting sub-phases of Sadesati. Sources disagree on what "Dhaiya" actually
refers to. Some (informally) use it exactly this way — as another name for
the three ~2.5-year sub-phases inside Sadesati itself. But paramarsh.app
("Saturn Return, Dhaiya and Sade Sati") describes a more technical usage
where Dhaiya (also called Kantaka Shani or Ashtama Shani) is a
*completely separate* transit — Saturn passing through the 4th or 8th
house from the Moon, unrelated to the 12th/1st/2nd houses Sadesati uses.
By that stricter definition, none of Sadesati's three sub-phases are a
"Dhaiya" at all. This is a real disagreement between sources, not a
site error to correct — flagged as an FAQ point below rather than a
Task 3 accuracy issue, since there's no single authoritative answer to
defer to.

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**The calculator labels two of the three phases "Dhaiya" — is that the
same thing as Sadesati?**
> Sources use "Dhaiya" two different ways, and they disagree. Some use it
> loosely for Sadesati's own Rising and Setting sub-phases, which is how
> this calculator uses the label. Others use it more strictly for a
> completely separate transit — Saturn passing through the 4th or 8th
> house from your Moon sign, which has nothing to do with the 12th/1st/2nd
> houses Sadesati is built on. If you've seen "Dhaiya" used differently
> elsewhere, that's likely why — it isn't a universally standardized term.

**Will I really experience Sadesati two to three times in my life?**
> For most lifespans, yes, roughly — Saturn's ~29.5-year orbital period
> means each recurrence lands about 30 years after the last one, so a
> typical 80-90 year lifespan spans roughly two to three full cycles. This
> calculator scans a full 95 years forward from your birth date specifically
> to capture all of them, not just the current or next one.

**Which phase is considered the most difficult?**
> The Peak phase — when Saturn transits directly over your natal Moon
> sign, not the sign before or after it. Classical and contemporary
> sources agree this middle ~2.5-year stretch is typically the most
> tested, since it coincides with Saturn's most direct pressure on the
> Moon's themes of mind and emotional stability, rather than the more
> anticipatory (Rising) or resolving (Setting) phases on either side.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **`#ss-banner`** — the current Sadesati status banner (in/not-in,
  current phase, end date) is entirely client-rendered, including for the
  default page-load calculation.
- **`#timeline`** — the full lifetime timeline of all Sadesati cycles
  (start/end dates, age ranges, status) is client-only.
- **`#phases`** — the "Three Phases" panel (Rising/Peak/Setting names,
  house/sign, and full descriptive paragraph for each) is client-only —
  this is the specific gap the original assessment flagged, and it's the
  largest content block on the page.
