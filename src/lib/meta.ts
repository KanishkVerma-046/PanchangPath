/**
 * Meta-description helpers.
 *
 * Bing Webmaster Tools flags any <meta name="description"> outside 25–160
 * characters. Several page families (notably the Devotional Library leaf pages)
 * derive their description from long-form body prose such as `item.meaning`,
 * which routinely runs many hundreds of characters. `metaDescription()` trims
 * that prose down to a description that still ends at a natural boundary
 * instead of stopping mid-word.
 */

export const META_MIN = 25;
export const META_MAX = 160;

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
 * Build a 25–160 character meta description.
 *
 * `text` is the preferred (usually long) source; `fallback` is a short
 * hand-written string used when `text` is missing or unusably short. The
 * result prefers, in order: the text as-is, a whole-sentence prefix, a
 * clause-boundary prefix, then a word-boundary prefix.
 */
export function metaDescription(text: string | null | undefined, fallback: string): string {
  const src = (text ?? '').replace(/\s+/g, ' ').trim();
  const fb = fallback.replace(/\s+/g, ' ').trim();

  const usable = src.length >= META_MIN ? src : fb;
  if (usable.length <= META_MAX) return usable;

  // Prefer ending on a full sentence (handles the Devanagari danda too).
  const sentence = stripOrphanMarker(cutAtBoundary(usable, /[.!?।]["')\]]?\s/, META_MAX));
  if (sentence.length >= 80) return sentence;

  // Otherwise end on a clause break and mark the truncation.
  const clause = cutAtBoundary(usable, /[,;:—–]\s/, META_MAX - 1);
  if (clause.length >= 80) return clause.replace(/[,;:—–]$/, '').trim() + '…';

  // Last resort: end on a whole word.
  const word = cutAtBoundary(usable, /\s/, META_MAX - 1);
  return (word || usable.slice(0, META_MAX - 1)).replace(/[,;:—–.]$/, '').trim() + '…';
}
