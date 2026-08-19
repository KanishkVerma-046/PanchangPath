# jyotish/nakshatra.astro — content draft

Old static word count: ~98 words (intro subtitle + "About Nakshatras" card).
New word count (About section only): ~195 words.

## A. Expanded "About this tool" section

Replaces the existing "About Nakshatras" card body. Keep the card heading
("About Nakshatras").

> The 27 nakshatras divide the Moon's path into equal 13°20′ segments — the
> same span the Moon covers in about one day, which is why "nakshatra" is
> often translated as "lunar mansion." Each nakshatra further splits into 4
> padas of 3°20′, traditionally used for naming: a child's first name
> syllable is drawn from the pada the Moon occupied at birth, and this
> calculator lists the exact syllable for each of the four padas alongside
> your own.
>
> Beyond naming, every nakshatra carries a ruling planet — the basis for
> the Vimshottari Dasha system used to time life events — plus a deity, a
> yoni (animal nature), a gana (temperament: Deva, Manushya or Rakshasa),
> and a nadi (constitutional type). Nadi and Gana are two of the eight
> Ashtakoota factors checked in Kundali matching for marriage compatibility,
> which is why your Janma Nakshatra carries weight well beyond a horoscope
> column.
>
> This calculator finds your Nakshatra and Pada by computing the Moon's
> sidereal longitude for your birth date, time and place — using the same
> astronomy-engine-based `moonLongitude()` and Lahiri ayanamsha the rest of
> the site shares — then dividing that longitude by 13°20′ to locate the
> nakshatra, and by 3°20′ within it to locate the pada.

**Sources**: paramarsh.app ("27 Nakshatras: Complete Guide to Vedic Lunar
Mansions") and karmaculator.com ("What is Nakshatra? The Vedic Lunar
Mansions Explained") both independently confirm the 13°20′ span as
approximating the Moon's daily motion, and the pada/naming-syllable
convention. The 8-factor Ashtakoota list (Varna, Vashya, Tara, Yoni, Graha
Maitri, Gana, Bhakoot, Nadi) — confirming Nadi and Gana's place in it — is
cross-verified via vedicrishi.in ("ASHTAKOOTA: The Method of Matching the
Eight Aspects") and anytimeastro.com ("How Many Points Should Match in
Kundali"), which independently agree on the same 8 names and point values;
this same source pair will ground `horoscope-match.astro`'s fuller kuta
explanation in Group 2.

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**Why does my Pada matter, and does this tool give the actual naming
syllable?**
> Yes — the calculator lists all four padas of your Nakshatra with their
> traditional naming syllables, highlighting the one that's yours. This is
> a naming convention, not a rule: many families follow it strictly, others
> treat it as one input among several.

**What's the difference between Nakshatra and Rashi (Moon sign)?**
> Both come from the same Moon position, just sliced differently. Rashi
> divides the zodiac into 12 signs of 30° each; Nakshatra divides it into
> 27 lunar mansions of 13°20′ each. Because the two grids don't line up
> evenly, a single Nakshatra can span parts of two different Rashis. See
> the [Rashi calculator](/jyotish/rashi) for that separate 30°-based
> reading.

**Why do Gana and Nadi matter beyond my personal profile?**
> They're two of the eight Ashtakoota factors used in Kundali matching for
> marriage compatibility (see the
> [Horoscope Match calculator](/jyotish/horoscope-match)). A shared Nadi
> between two charts is considered the most significant compatibility
> concern in that system — traditionally advised against regardless of how
> the other seven factors score.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **`#all-naks`** — the full 27-nakshatra grid (`renderAllNaks()`), showing
  every nakshatra's name, lord, gana and yoni, is 100% client-rendered.
  This is the single largest JS-only reference table found across Group 1.
- **`#trait-text`** — the per-nakshatra personality-profile paragraph (27
  distinct ~45-word descriptions in the `NAKS`/`NAKS_TRAITS_HI` data) is
  also client-only.
- **`#attr-list` / `#pada-list` / `#n-badges`** — the result panel's
  attribute table (lord, deity, symbol, yoni, gana, nadi, varna), the
  four-pada breakdown, and the gana/nadi/yoni badges are all built via
  `innerHTML` in `calculate()`.
