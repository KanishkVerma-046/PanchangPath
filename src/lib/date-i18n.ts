// Centralized Hindi-aware date formatting helper.
//
// The site's established convention (first implemented in
// jyotish/horoscope-match.astro) is: Arabic numerals + Hindi day/month
// NAMES — never Devanagari numerals (०१२३...), which are reserved for
// verse/chapter numbering inside devotional scripture text elsewhere on
// the site. Do not add Devanagari-numeral formatting here.
//
// These arrays are copied verbatim from horoscope-match.astro's WD_HI/MO_HI
// so every page renders the exact same Hindi day/month names.

export const WD_EN_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WD_EN_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WD_HI_LONG = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
export const WD_HI_SHORT = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

export const MO_EN_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const MO_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MO_HI_LONG = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
];
export const MO_HI_SHORT = ['जन', 'फर', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];

export interface FormatDateHiOptions {
  /** Include a weekday name. Omit (default) for no weekday. */
  weekday?: 'long' | 'short';
  /** Month name style. Default 'long'. */
  month?: 'long' | 'short';
  /** Include the day-of-month number. Default true. */
  day?: boolean;
  /** Include the year. Default true. */
  year?: boolean;
}

/**
 * Format a Date using local (browser) date fields — matching the default,
 * timezone-less behavior of `date.toLocaleDateString('en-IN', {...})` —
 * but with Hindi day/month names when `hindi` is true.
 *
 * Output shape matches `toLocaleDateString('en-IN', opts)`:
 *   formatDateHi(d, false, {weekday:'long'})  -> "Tuesday, 28 July 2026"
 *   formatDateHi(d, true,  {weekday:'long'})  -> "मंगलवार, 28 जुलाई 2026"
 *   formatDateHi(d, false, {weekday:'short', month:'short'}) -> "Tue, 28 Jul 2026"
 *   formatDateHi(d, true,  {weekday:'short', month:'short'}) -> "मंगल, 28 जुल 2026"
 */
export function formatDateHi(date: Date, hindi: boolean, opts: FormatDateHiOptions = {}): string {
  const monthStyle = opts.month ?? 'long';
  const showDay = opts.day ?? true;
  const showYear = opts.year ?? true;

  const wd = date.getDay();
  const mo = date.getMonth();
  const d = date.getDate();
  const y = date.getFullYear();

  const moName = hindi
    ? (monthStyle === 'short' ? MO_HI_SHORT[mo] : MO_HI_LONG[mo])
    : (monthStyle === 'short' ? MO_EN_SHORT[mo] : MO_EN_LONG[mo]);

  const dmParts: string[] = [];
  if (showDay) dmParts.push(String(d));
  dmParts.push(moName);
  if (showYear) dmParts.push(String(y));

  if (!opts.weekday) return dmParts.join(' ');

  const wdName = hindi
    ? (opts.weekday === 'short' ? WD_HI_SHORT[wd] : WD_HI_LONG[wd])
    : (opts.weekday === 'short' ? WD_EN_SHORT[wd] : WD_EN_LONG[wd]);

  return `${wdName}, ${dmParts.join(' ')}`;
}

/**
 * Same output shape as formatDateHi(), but the weekday/day/month/year are read from the
 * instant's wall-clock value at a fixed UTC offset (in hours) instead of the calling
 * environment's local timezone. formatDateHi()'s local-field behavior is correct and
 * intentional for its other callers (showing "today" in the visitor's own calendar day) --
 * this is for the opposite case: a label that must read the same everywhere regardless of
 * where the code runs (Astro build machine, or a visitor's browser anywhere in the world).
 * Used by formatDateIST() below (offset 5.5) and directly by pages that need a
 * *different* fixed offset (e.g. Nepal's regional Panchang page, UTC+5:45).
 */
export function formatDateAtOffset(date: Date, tzOffsetHours: number, hindi: boolean, opts: FormatDateHiOptions = {}): string {
  const shifted = new Date(date.getTime() + tzOffsetHours * 3600000);
  const monthStyle = opts.month ?? 'long';
  const showDay = opts.day ?? true;
  const showYear = opts.year ?? true;

  const wd = shifted.getUTCDay();
  const mo = shifted.getUTCMonth();
  const d = shifted.getUTCDate();
  const y = shifted.getUTCFullYear();

  const moName = hindi
    ? (monthStyle === 'short' ? MO_HI_SHORT[mo] : MO_HI_LONG[mo])
    : (monthStyle === 'short' ? MO_EN_SHORT[mo] : MO_EN_LONG[mo]);

  const dmParts: string[] = [];
  if (showDay) dmParts.push(String(d));
  dmParts.push(moName);
  if (showYear) dmParts.push(String(y));

  if (!opts.weekday) return dmParts.join(' ');

  const wdName = hindi
    ? (opts.weekday === 'short' ? WD_HI_SHORT[wd] : WD_HI_LONG[wd])
    : (opts.weekday === 'short' ? WD_EN_SHORT[wd] : WD_EN_LONG[wd]);

  return `${wdName}, ${dmParts.join(' ')}`;
}

/** formatDateAtOffset() pinned to India Standard Time (UTC+5:30). */
export function formatDateIST(date: Date, hindi: boolean, opts: FormatDateHiOptions = {}): string {
  return formatDateAtOffset(date, 5.5, hindi, opts);
}

/** Convenience: "July 2026" / "जुलाई 2026" (matches {month:'long', year:'numeric'}). */
export function formatMonthYearHi(date: Date, hindi: boolean, month: 'long' | 'short' = 'long'): string {
  return formatDateHi(date, hindi, { month, day: false, year: true });
}
