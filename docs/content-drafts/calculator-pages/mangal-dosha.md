# jyotish/mangal-dosha.astro — content draft

Old static word count: ~230 words (intro subtitle + a genuinely
server-rendered 7-item "Cancellation Rules" list + single-paragraph "About
Mangal Dosha" card) — already at/above the Muhurta benchmark range, unlike
every other page in this task. Worth noting explicitly: this page's
Cancellation Rules list (`mangal-dosha.astro` lines 48-56) is directly in
the Astro template body with `data-hi` attributes, not inside the
`<script>` tag — it's the one static reference list found across all 14
pages that's genuinely server-rendered rather than JS-only. Per the task's
Group 4 grouping, this page gets FAQ only, no About-section expansion.

## A. About section — no change

Both the Cancellation Rules list and the "About Mangal Dosha" paragraph
are left as-is — accurate, already-approved, and already substantial. The
gap here is purely the missing FAQ.

## B. Page-specific FAQ

**Why does the calculator check Mars from three different points (Lagna,
Moon, and Venus) instead of just one?**
> Because that's the standard method for a complete Mangal Dosha
> assessment — a person is only considered fully clear if Mars avoids the
> dosha houses (1st, 2nd, 4th, 7th, 8th, 12th) from all three reference
> points, not just one. The more of the three points where Mars falls in
> a dosha house, the more significant the affliction is traditionally
> considered — which is exactly why this calculator reports how many of
> the three references flagged it, not just a single yes/no.

**The page lists "both partners are Manglik" and "the dosha weakens after
age 28" as cancellation rules above, but the Cancellation Analysis table
doesn't check them — why?**
> Because neither one can be evaluated from a single birth chart. "Both
> partners Manglik" requires comparing two separate charts against each
> other, which is outside what a one-person calculator can check — that's
> a factor to apply yourself once you have both results. The age-28 rule
> isn't a chart placement at all; it's a general statement about timing
> that applies the same way regardless of any specific chart detail. The
> six rules in the Cancellation Analysis table are the ones this
> calculator *can* verify directly from your birth data: Mars in its own
> sign, Mars exalted, a Cancer/Leo Lagna (where Mars is a yogakaraka), Mars
> in a weakening sign, and close conjunction with Jupiter or the Moon.

**How is the severity (High vs. Low-to-Medium) determined?**
> This calculator's own reasonable rule of thumb, applying the general
> principle sources agree on — more afflicted reference points and a
> poorly-placed Mars mean a more significant dosha — rather than a single
> universally fixed formula. Specifically: it's rated High when Mars falls
> in a dosha house from 2 or more of the three references *and* Mars
> isn't in its own sign, exalted, or a weakening sign; otherwise, if the
> dosha is present at all, it's rated Low to Medium. Different sources
> grade severity somewhat differently, so treat this rating as directional
> rather than an authoritative classification.

**Sources**: the three-reference-point method and the "more afflicted
points = more severe" principle are cross-verified via drikpanchang.com
("Mangal Dosha | Kuja Dosha Calculator") and a general search converging
on the same three-point convention across multiple independent Mangal
Dosha calculators (desiutils.in, astronidan.com, pomantra.com). None of
these sources states one single, universally agreed severity-grading
formula with fixed thresholds — worded that way in the third FAQ answer
rather than presenting this calculator's specific thresholds as a
classical standard. The specific claim about which rules the Cancellation
Analysis table does and doesn't check is verified directly against
`mangal-dosha.astro`'s `cancels` array (lines 161-168), not an external
source — the "both partners Manglik" and "age 28" items exist only in the
static list above the table, never in the `cancels` array itself.

## C. JS-only reference sections (flag for future prerender, not fixed
here — smaller in scope than most other pages, since the Cancellation
Rules list and About section are already server-rendered)

- **`#dosha-banner` / `#pos-table` / `#meaning` / `#cancel-table` /
  `#remedy-panel`** — the actual per-chart result (dosha verdict,
  Mars-position table from all three references, the "what this means"
  paragraph, the computed cancellation-rule table, and the remedy list)
  are all client-rendered via `calculate()`, including the default
  page-load result. The general reference content around them (rules
  list, About) is the exception to the pattern seen on the other 13
  pages — it's already crawlable.
