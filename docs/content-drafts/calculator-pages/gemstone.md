# jyotish/gemstone.astro — content draft

Old static word count: ~125 words (intro subtitle + 2-paragraph "About
Gemstone Therapy" card — higher than the ~109 words flagged in the
original assessment).
New word count (About section): ~220 words.

## A. Expanded "About this tool" section

Keep the existing two paragraphs unchanged. Add a third describing the
tool's own recommendation mechanism.

> In Jyotish, each of the nine grahas is associated with a primary
> gemstone. Wearing the right stone is believed to strengthen the energy
> of its planet. The most commonly recommended stone is that of the
> Lagna lord, which supports overall vitality and life direction.
>
> Note: Gemstone selection is highly individual. Strong malefic placements
> may call for caution. Please consult a qualified astrologer before
> wearing a powerful stone such as Blue Sapphire (Neelam).
>
> *[New]* This calculator's primary recommendation is your Lagna lord's
> stone — the planet ruling your Ascendant. The supporting stones come
> from your Trikona lords (5th and 9th house rulers): the 1st, 5th and
> 9th houses form the most consistently auspicious triad in classical
> Jyotish, and their ruling planets' gemstones are traditionally treated
> as safe, fortune-supporting choices largely regardless of that planet's
> usual nature elsewhere in the chart. If your Moon lord isn't already
> among these three, its stone is added as a fourth option to support
> mind and emotional balance.

**Sources**: the first two paragraphs are pre-existing, site-approved copy
— unchanged. The Trikona-lords principle is cross-verified via
vedicrishi.in ("Trikona Houses & Your Life Purpose") and astroparasar.com
("Secrets of Trikona Houses in Vedic Astrology"), both independently
describing the 1st/5th/9th houses as the most auspicious triad and citing
classical sources (Phaladeepika) for treating their lords as functionally
benefic. The mechanism description matches the page's own code and
comment (`gemstone.astro` line 77: "Trikona (1,5,9) lords are most benefic
for a Lagna; we recommend Lagna lord + 5th + 9th lords").

## B. Page-specific FAQ (in addition to the shared Q1-Q3)

**Why do I get up to four gemstone recommendations instead of just one?**
> The primary stone is always your Lagna lord's. The calculator then adds
> your 5th and 9th lords' stones (the other two Trikona houses) if
> they're ruled by different planets, and your Moon lord's stone if it
> isn't already covered — since the Moon governs mind and emotional
> balance specifically. If several of these houses share the same ruling
> planet, you'll see fewer than four cards, since the calculator doesn't
> repeat a stone that's already been recommended.

**Why does the About section single out Blue Sapphire (Neelam) for
caution?**
> Saturn's stone is traditionally considered the most unpredictable in
> Vedic gemstone therapy — capable of producing strong effects quickly,
> for better or worse, depending on Saturn's actual condition in the
> individual chart. That's the same reasoning behind this site's caution
> around the 7-mukhi and 14-mukhi Rudraksha beads (also Saturn-ruled) on
> the [Rudraksha calculator](/jyotish/rudraksha) — Saturn recommendations
> generally warrant a second opinion before acting on them.

**Does this calculator check whether a planet is weak or afflicted before
recommending its stone?**
> No. The recommendation is based purely on house lordship — which planet
> rules your Lagna, 5th and 9th signs — not on that planet's actual
> strength, dignity, or placement in your individual chart. A gemstone is
> traditionally meant to strengthen a planet that needs support, so
> whether a specific recommendation is actually appropriate for you
> depends on chart details this calculator doesn't evaluate. That's
> exactly what the About section's caution about consulting a qualified
> astrologer is pointing at.

## C. JS-only reference sections (flag for future prerender, not fixed here)

- **`#birth-info` / `#primary-gem` / `#secondary-gems`** — the entire
  result panel (Lagna/Moon/Sun Rashi summary, the primary gem card, and
  all supporting gem cards with metal/finger/day/substitute details) is
  built via `innerHTML` in `calculate()`/`gemCard()`. As with the other
  Group 2/3 calculators, even the default (page-load) recommendation is
  invisible to crawlers.
