/**
 * Shared clock-time formatting.
 *
 * Every helper here rounds to a whole minute FIRST and only then splits the result into
 * hours and minutes. That ordering is the whole point of this module: the site previously
 * carried ~20 hand-rolled copies of
 *
 *     const h  = Math.floor(m / 60);
 *     const mn = Math.round(m % 60);   // <-- independent of the hour above
 *
 * which renders "11:60 AM" whenever the seconds component is >= 30 (Math.round pushes the
 * minute to 60 while the floored hour has not advanced). The same shape also produced
 * "12:60 AM" around midnight and "11h 60m" day-length strings. Rounding to a whole minute
 * before decomposing makes the carry impossible by construction.
 *
 * Prefer these helpers over any local formatter — client `<script>` blocks can import from
 * `src/lib/*.ts` directly (see CLAUDE.md), so there is no reason to re-implement them.
 */

/** Round to a whole minute and wrap into [0, 1440). Accepts fractional/negative/>1440 input. */
export function normalizeMinutes(totalMins: number): number {
  return ((Math.round(totalMins) % 1440) + 1440) % 1440;
}

/** Minutes from midnight -> "6:05 AM". */
export function formatMinutes12h(totalMins: number): string {
  const m = normalizeMinutes(totalMins);
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Minutes from midnight -> "06:05" (24-hour clock). */
export function formatMinutes24h(totalMins: number): string {
  const m = normalizeMinutes(totalMins);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * Minutes from midnight -> "25:30" (extended clock).
 *
 * Times before sunrise belong to the panchang day that began at the previous sunrise, so
 * they are displayed as 24+ rather than wrapping back to 01:30.
 */
export function formatMinutes24Plus(totalMins: number, sunriseMins: number): string {
  const m = normalizeMinutes(totalMins);
  const display = m < normalizeMinutes(sunriseMins) ? m + 1440 : m;
  return `${String(Math.floor(display / 60)).padStart(2, '0')}:${String(display % 60).padStart(2, '0')}`;
}

/** Decimal UTC hour + timezone offset (hours) -> "6:05 AM" local. */
export function formatDecimalHours12h(hoursUTC: number, tzOffset: number): string {
  return formatMinutes12h((hoursUTC + tzOffset) * 60);
}

/**
 * A span in minutes -> "11h 45m". Deliberately not wrapped at 24h: this measures a length
 * (day duration, time-until), not a clock reading.
 */
export function formatDurationMins(totalMins: number): string {
  const m = Math.round(totalMins);
  const sign = m < 0 ? '-' : '';
  const abs = Math.abs(m);
  return `${sign}${Math.floor(abs / 60)}h ${abs % 60}m`;
}

/** A span in decimal hours -> "11h 45m". */
export function formatDurationHours(hours: number): string {
  return formatDurationMins(hours * 60);
}

/** Inverse of formatMinutes12h(): "6:05 AM" -> minutes from midnight. For deriving a
 *  percentage-bar position from an already-computed display string (e.g. the homepage day
 *  timeline), not for any new astronomy calculation — the string itself remains the single
 *  source of truth for the underlying time. */
export function parseMinutes12h(timeStr: string): number {
  const [timePart, period] = timeStr.trim().split(' ');
  const [h, m] = timePart.split(':').map(Number);
  return (h % 12 + (period === 'PM' ? 12 : 0)) * 60 + m;
}
