// "Today" for PanchangPath means today's calendar date in India (Asia/Kolkata), for every
// visitor and on every build machine. The site's festival dates, Panchang defaults and
// Rashifal rotation are all New Delhi dates, so a date read from UTC getters (what
// toISOString() returns) or from the host's own local timezone is wrong for part of every day:
// between 00:00 and 05:30 IST the UTC date is still the previous day. The daily-rebuild cron
// runs inside exactly that window, which is how the homepage came to show a "Today" badge
// for the previous day's festival.
//
// Asia/Kolkata has used a fixed +05:30 offset with no DST since 1945, so adding a constant and
// reading the result back with UTC getters is exact and independent of the host timezone.
// Dependency-free so it can be imported from both build-time frontmatter and client <script>s.

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface IstDateParts {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
}

export function istDateParts(now: Date = new Date()): IstDateParts {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return {
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth() + 1,
    day: ist.getUTCDate(),
    weekday: ist.getUTCDay(),
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** India's current calendar date as 'YYYY-MM-DD'. */
export function istTodayISO(now: Date = new Date()): string {
  const { year, month, day } = istDateParts(now);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function isoToUTCms(iso: string): number {
  const m = ISO_DATE_RE.exec(iso);
  if (!m) throw new Error(`Expected a YYYY-MM-DD date, got "${iso}"`);
  const [, y, mo, d] = m;
  const ms = Date.UTC(+y, +mo - 1, +d);
  // Date.UTC silently rolls over out-of-range parts (2026-02-30 -> 2026-03-02); reject those.
  const back = new Date(ms);
  if (back.getUTCFullYear() !== +y || back.getUTCMonth() !== +mo - 1 || back.getUTCDate() !== +d) {
    throw new Error(`Invalid calendar date "${iso}"`);
  }
  return ms;
}

/** Whole calendar days from `fromISO` to `toISO` (negative if `toISO` is earlier). */
export function daysBetweenISO(fromISO: string, toISO: string): number {
  return Math.round((isoToUTCms(toISO) - isoToUTCms(fromISO)) / DAY_MS);
}

/** `iso` shifted by `days` calendar days, as 'YYYY-MM-DD'. */
export function addDaysISO(iso: string, days: number): string {
  const d = new Date(isoToUTCms(iso) + days * DAY_MS);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}
