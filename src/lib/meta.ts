/**
 * Meta-description helpers.
 *
 * Bing Webmaster Tools flags any <meta name="description"> outside 25–160
 * characters. Several page families (notably the Devotional Library leaf pages)
 * derive their description from long-form body prose such as `item.meaning`,
 * which routinely runs many hundreds of characters. `metaDescription()` trims
 * that prose down to a description that still ends at a natural boundary
 * instead of stopping mid-word.
 *
 * Two properties are in tension and the thresholds below are where they are
 * balanced: ending on a complete sentence reads best, but the first sentence of
 * a passage is often either well past 160 characters (so no complete sentence
 * fits at all) or far short of it (so stopping there wastes most of the budget).
 * A complete sentence therefore wins whenever it is long enough to stand on its
 * own; a short one is extended into the following clause instead.
 */

export const META_MIN = 25;
export const META_MAX = 160;

/** Below this, a candidate is too thin to use even when it is well-formed. */
const USABLE = 80;
/**
 * How much longer a truncated candidate must be before it beats a complete
 * sentence. A sentence reads better, so it only loses by a clear margin.
 */
const SENTENCE_BONUS = 20;
/** How much longer a raw word cut must be before it beats a clause cut. */
const CLAUSE_BONUS = 25;

/** Sentence terminators, including the Devanagari danda. */
const SENTENCE = /[.!?।]["')\]]?\s/;
/** Strong mid-sentence breaks — these read better as cut points than a comma. */
const STRONG_CLAUSE = /[;:—–]\s/;
/** Any clause break, commas included. */
const ANY_CLAUSE = /[,;:—–]\s/;

/**
 * Words that leave a cut dangling ("…relying on the other goddesses rather…").
 * Truncating after one of these reads as a dropped connection rather than an
 * elided continuation, so the cut backs up past them.
 */
const DANGLING = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'of', 'to', 'in', 'on', 'at', 'by', 'for',
  'with', 'from', 'as', 'than', 'rather', 'into', 'onto', 'over', 'under', 'via', 'per',
  'his', 'her', 'its', 'their', 'our', 'your', 'my', 'this', 'that', 'these', 'those',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'has', 'have', 'had',
  'who', 'whom', 'whose', 'which', 'while', 'when', 'where', 'why', 'how',
  'also', 'both', 'each', 'such', 'not', 'no', 'it', 'he', 'she', 'they', 'we', 'you',
  'one', 'all', 'any', 'more', 'most', 'other', 'another', 'including', 'about',
  'after', 'before', 'during', 'through', 'between', 'among', 'upon', 'without',
  'within', 'across', 'against', 'above', 'below', 'so', 'yet', 'if', 'then',
]);

/**
 * Longest prefix of `text` that ends on one of `boundary`'s matches, at or
 * before `limit` characters. Returns '' when no boundary falls in range.
 */
function cutAtBoundary(text: string, boundary: RegExp, limit: number): string {
  let best = '';
  const re = new RegExp(boundary.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const end = m.index + m[0].length;
    if (end > limit) break;
    best = text.slice(0, end);
  }
  return best.trim();
}

/**
 * Drop a trailing list marker ("… before sunset. 2.") left behind when a
 * numbered step list is cut after the preceding step's full stop.
 */
function stripOrphanMarker(text: string): string {
  return text.replace(/\s+\d+\.$/, '').trim();
}

/**
 * Tidy a mid-sentence cut: drop trailing punctuation and any words that leave
 * the phrase hanging. An opening bracket left unclosed by the cut is fine —
 * readers accept it in an elided snippet, and backing out to before the bracket
 * costs far more characters than the blemish is worth.
 */
function tidyCut(text: string): string {
  let out = text.replace(/[\s,;:—–([]+$/, '');
  for (;;) {
    const m = out.match(/(^|[\s([])([A-Za-z']+)$/);
    if (!m || !DANGLING.has(m[2].toLowerCase())) break;
    out = out.slice(0, out.length - m[2].length).replace(/[\s,;:—–([]+$/, '');
  }
  return out.trim();
}

/**
 * Best mid-sentence cut at or under `limit`. A strong break (dash, semicolon,
 * colon) reads better than a comma, so it wins unless a comma cut is
 * substantially longer.
 */
function clauseCut(text: string, limit: number): string {
  const strong = tidyCut(cutAtBoundary(text, STRONG_CLAUSE, limit));
  const any = tidyCut(cutAtBoundary(text, ANY_CLAUSE, limit));
  return any.length > strong.length + CLAUSE_BONUS ? any : (strong.length ? strong : any);
}

/**
 * Build a 25–160 character meta description.
 *
 * `text` is the preferred (usually long) source; `fallback` is a short
 * hand-written string used when `text` is missing or unusably short.
 */
export function metaDescription(text: string | null | undefined, fallback: string): string {
  const src = (text ?? '').replace(/\s+/g, ' ').trim();
  const fb = fallback.replace(/\s+/g, ' ').trim();

  const usable = src.length >= META_MIN ? src : fb;
  if (usable.length <= META_MAX) return usable;

  const limit = META_MAX - 1; // leave room for the ellipsis

  // Three candidates: the longest run of whole sentences that fits, the best
  // clause cut, and a bare word cut. The first needs no ellipsis; the others do.
  const sentence = stripOrphanMarker(cutAtBoundary(usable, SENTENCE, META_MAX));
  const clause = clauseCut(usable, limit);
  const word = tidyCut(cutAtBoundary(usable, /\s/, limit));

  // Among the truncated candidates, prefer the clause cut unless a plain word
  // cut reaches meaningfully further into the budget.
  const truncated = word.length > clause.length + CLAUSE_BONUS ? word : clause;

  // A complete sentence wins unless truncating buys a clear margin, so short
  // opening sentences run on rather than leaving most of the budget unused.
  if (sentence.length >= USABLE && sentence.length + SENTENCE_BONUS >= truncated.length) {
    return sentence;
  }
  if (truncated.length >= USABLE) return truncated + '…';
  if (sentence.length >= META_MIN) return sentence;

  return (word || usable.slice(0, limit)).replace(/[\s,;:—–.]+$/, '') + '…';
}
