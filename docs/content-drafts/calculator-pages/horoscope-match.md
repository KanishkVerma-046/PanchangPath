# jyotish/horoscope-match.astro — content draft

Old static word count: ~145 words (intro subtitle + 2-paragraph "About
Guna Milan" card — higher than the ~108 words flagged in the original
assessment, but the original assessment's specific complaint —
"no explanation of the 8 kutas" — is accurate: the existing card names the
total and the two heaviest kutas but doesn't explain what any of the 8
individually measure).
New word count (About section): ~230 words.

## A. Expanded "About this tool" section

Keep the existing two paragraphs unchanged. Add a third listing all 8
kutas — this directly addresses the original assessment's specific gap.

> Ashta Kuta Guna Milan compares the Moon's nakshatra and rashi of two
> people across 8 factors (kutas), each carrying a different weight,
> totalling 36 points. A score of 18 or above is traditionally considered
> acceptable for marriage; 24+ is very good.
>
> The Nadi (8 points) and Bhakoot (7 points) kutas are the most important
> — a Nadi dosha (same nadi) or Bhakoot dosha can override a high score,
> though many such doshas have classical cancellations. Always consult an
> astrologer for a full reading.
>
> *[New]* The eight kutas each check a different dimension of
> compatibility: Varna (1 pt, spiritual temperament), Vashya (2 pts,
> mutual attraction and influence), Tara (3 pts, health and general
> wellbeing), Yoni (4 pts, physical and sexual compatibility), Graha
> Maitri (5 pts, mental and intellectual rapport, based on the two Moon-
> sign lords' classical planetary friendship), Gana (6 pts, temperament —
> Deva, Manushya or Rakshasa), Bhakoot (7 pts, love, finances and family
> harmony), and Nadi (8 pts, health and progeny). This calculator derives
> every kuta directly from each person's Moon Nakshatra and Rashi,
> computed the same way as the Rashi and Nakshatra calculators elsewhere
> on this site.

**Sources**: the per-kuta weights and meanings are cross-verified via
vedicrishi.in ("ASHTAKOOTA: The Method of Matching the Eight Aspects") and
anytimeastro.com ("How Many Points Should Match in Kundali") — the same
source pair used for `nakshatra.md` in Group 1, both independently listing
the same 8 names, point values, and significance areas used here. This
also matches the page's own already-implemented `sig` strings passed into
the `kutas` array (`horoscope-match.astro` line ~153-160) — the new prose
restates what the code already asserts, rather than introducing new
claims.

**Live-site accuracy issue found while verifying the dosha-cancellation
FAQ answer** (checked directly against `horoscope-match.astro`, lines
185-190; not fixed here, flagged for Task 3): `kBhakoot()`/`kNadi()`
compute a plain present/absent dosha flag with no cancellation logic. The
Bhakoot dosha warning's text — "Often cancelled if Graha Maitri is
strong" — is a static string shown identically every time, regardless of
that specific couple's actual Graha Maitri score, which the calculator has
already computed and displays two rows above it in the same table. The
result never checks the one condition its own copy references. This isn't
just thin content — it's the tool's result text implying a level of
verification (checking whether the couple's Graha Maitri is in fact
strong enough to cancel the dosha) that the calculation doesn't actually
perform. The FAQ answer below is written to correct for this rather than
repeat it.

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**Why do Nadi and Bhakoot matter more than the other six kutas?**
> They carry the most points (8 and 7 respectively, out of 36) and are
> the two the calculator specifically calls out as a "dosha" if they
> score zero — visible in the result's warning notes regardless of how
> high the total score is otherwise. Nadi relates to health and progeny;
> Bhakoot to emotional, financial and family harmony — both considered
> foundational enough in classical Ashtakoota that a failure here is
> traditionally treated as a serious concern even alongside an otherwise
> strong match.

**Does this calculator check for classical Nadi or Bhakoot dosha
cancellations?**
> No, and this is worth being precise about: it flags that a dosha is
> present, but doesn't verify whether any classical cancellation condition
> actually applies to your specific chart. The result text mentions that
> cancellations exist — for Nadi, "check for cancellations (same rashi
> different nakshatra, etc.)"; for Bhakoot, "often cancelled if Graha
> Maitri is strong" — but that second line is a general statement, not a
> computed one: the calculator doesn't check *your* Graha Maitri score
> against it, even though your Graha Maitri result is sitting right there
> in the same table. So a "dosha present" result shouldn't be read as
> "and here's whether it's cancelled for you" — it isn't. Treat both notes
> as a pointer to what to ask an astrologer, not as an answer.

**Why might my score differ slightly from another Kundali-matching site?**
> Small differences between sites are common and don't necessarily mean
> either is wrong. They typically come from which ayanamsha is used (this
> site uses Lahiri, the most common choice in Indian software), or from
> small variations in how a specific tradition defines edge cases within a
> kuta — sources describing the Ashtakoota system don't always agree on
> every sub-rule down to the last detail. If two results disagree by more
> than a couple of points, compare the individual kuta breakdown rather
> than just the total to see exactly where the difference is.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **Everything in `#result`** — the score banner, the full 8-row
  `#kuta-table` breakdown (per-kuta boy/girl values, points and
  significance), and the `#verdict-box` (match verdict plus any Nadi/
  Bhakoot dosha warnings) are all built via `innerHTML` in `calculate()`.
  Even the pre-filled sample match (the default 1995/1997 birth data
  loaded on page load) never touches server-rendered HTML — a visitor
  with JS disabled, or a crawler, sees no matching result at all, only the
  input form and the About card.
