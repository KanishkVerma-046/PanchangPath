// Muhurta tools — data, types, and server-side scoring functions

import { sunTrueLongitude, lahiriAyanamsha, sunriseUTC, moonLongitude } from './panchang';
import { calcLagna } from './astro-core';

export type ChoghadiyaType = 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Udveg' | 'Kaal' | 'Rog';
export type Quality = 'best' | 'good' | 'neutral' | 'bad';

export interface ChoghadiyaInfo {
  nameHi: string;
  quality: Quality;
  planet: string;
  planetHi: string;
  color: string;
  bgColor: string;
  suitable: string[];
}

export const CHOGHADIYA_INFO: Record<ChoghadiyaType, ChoghadiyaInfo> = {
  Amrit: {
    nameHi: 'अमृत', quality: 'best', planet: 'Moon', planetHi: 'चंद्र',
    color: '#16803D', bgColor: '#DCF3E3',
    suitable: ['All activities', 'Travel', 'Business', 'Marriage', 'Medicine', 'Education'],
  },
  Shubh: {
    nameHi: 'शुभ', quality: 'good', planet: 'Jupiter', planetHi: 'गुरु',
    color: '#97690F', bgColor: '#FBF0D9',
    suitable: ['Marriage', 'Religious ceremonies', 'Education', 'New ventures'],
  },
  Labh: {
    nameHi: 'लाभ', quality: 'good', planet: 'Mercury', planetHi: 'बुध',
    color: '#B5390A', bgColor: '#FBE4D2',
    suitable: ['Business', 'Trade', 'Financial dealings', 'Accounting'],
  },
  Char: {
    nameHi: 'चर', quality: 'neutral', planet: 'Venus', planetHi: 'शुक्र',
    color: '#8C7660', bgColor: '#F5E7C8',
    suitable: ['Travel', 'Movement', 'Shopping'],
  },
  Udveg: {
    nameHi: 'उद्वेग', quality: 'bad', planet: 'Sun', planetHi: 'सूर्य',
    color: '#C81E1E', bgColor: '#FBE0DE',
    suitable: ['Government work only'],
  },
  Kaal: {
    nameHi: 'काल', quality: 'bad', planet: 'Saturn', planetHi: 'शनि',
    color: '#3A2712', bgColor: '#E8D9BE',
    suitable: [],
  },
  Rog: {
    nameHi: 'रोग', quality: 'bad', planet: 'Mars', planetHi: 'मंगल',
    color: '#7F2700', bgColor: '#FBE4D2',
    suitable: [],
  },
};

// Day Choghadiya sequences by weekday (0=Sun … 6=Sat)
export const DAY_CHOG: ChoghadiyaType[][] = [
  ['Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg'],
  ['Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit'],
  ['Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog'],
  ['Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh'],
  ['Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh'],
  ['Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char'],
  ['Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal'],
];

export const NIGHT_CHOG: ChoghadiyaType[][] = [
  ['Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh'],
  ['Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char'],
  ['Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal'],
  ['Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg'],
  ['Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit'],
  ['Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog'],
  ['Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh'],
];

// Hora planets sequence; HORA_START[weekday] = starting index into HORA_PLANETS
export const HORA_PLANETS = ['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'] as const;
export const HORA_PLANETS_HI = ['सूर्य','शुक्र','बुध','चंद्र','शनि','गुरु','मंगल'];
export const HORA_START: number[] = [0, 3, 6, 2, 5, 1, 4];

export const HORA_QUALITY: Record<string, Quality> = {
  Sun: 'neutral', Venus: 'good', Mercury: 'good',
  Moon: 'best', Saturn: 'bad', Jupiter: 'best', Mars: 'bad',
};

export const HORA_SUITABLE: Record<string, string[]> = {
  Sun: ['Govt work','Authority matters','Father-related'],
  Venus: ['Romance','Arts','Luxury purchase','Beauty'],
  Mercury: ['Writing','Business','Education','Communication'],
  Moon: ['Travel','Agriculture','Emotional matters','All auspicious work'],
  Saturn: ['Mining','Machinery','Long-term discipline'],
  Jupiter: ['Spiritual work','Teaching','Marriage','Financial investments'],
  Mars: ['Surgery','Physical work','Competition'],
};

// Nakshatra names (server-side, for scoring functions)
export const NAK_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

export const TITHI_NAMES = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami',
  'Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi',
  'Purnima','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi',
  'Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi',
  'Chaturdashi','Amavasya',
];

export const VARA_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Panchaka nakshatras (22–26, 0-indexed)
export const PANCHAKA_NAKS = [22, 23, 24, 25, 26];

// Rashi names
export const RASHI_NAMES = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena',
];
export const RASHI_NAMES_HI = [
  'मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या',
  'तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन',
];
export const RASHI_LORDS = [
  'Mars','Venus','Mercury','Moon','Sun','Mercury',
  'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter',
];

// ── Scoring criteria by activity type ────────────────────────────────────────

export type ActivityType = 'vivah' | 'griha-pravesh' | 'vehicle' | 'property' | 'business' | 'general';

interface MuhurtaCriteria {
  label: string;
  labelHi: string;
  goodNakshatras: number[];
  goodTithis: number[];  // 0-indexed
  goodVaras: number[];   // 0=Sun
  avoidNakshatras: number[];
  avoidTithis: number[];
}

export const MUHURTA_CRITERIA: Record<ActivityType, MuhurtaCriteria> = {
  vivah: {
    label: 'Vivah (Marriage)',
    labelHi: 'विवाह',
    // Verified against drikpanchang.com's "Auspicious Nakshatra for Marriage" list (Issue #15):
    // Rohini, Mrigashirsha, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Mula, Uttara Ashadha,
    // Uttara Bhadrapada, Revati. This excludes Punarvasu/Pushya (the old value here wrongly
    // included both — "पुष्ये न विवाहम्", Pushya is explicitly barred from marriage muhurat) and
    // adds Mula (the old value here AND vivah.astro's inline copy both omitted it).
    goodNakshatras: [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    // Mula (18) removed — reclassified to goodNakshatras above.
    avoidNakshatras: [0, 1, 5, 8, 15, 17, 22, 23, 24],
    avoidTithis: [3, 8, 13, 14, 29],
  },
  'griha-pravesh': {
    label: 'Griha Pravesh (House Entry)',
    labelHi: 'गृह प्रवेश',
    goodNakshatras: [3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    avoidNakshatras: [1, 5, 8, 17, 18, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
  vehicle: {
    label: 'Vehicle Purchase',
    labelHi: 'वाहन खरीद',
    goodNakshatras: [0, 3, 4, 6, 7, 12, 14, 21, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [0, 1, 3, 4, 5],
    avoidNakshatras: [1, 5, 8, 17, 18, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
  property: {
    label: 'Property Purchase',
    labelHi: 'संपत्ति खरीद',
    goodNakshatras: [3, 6, 7, 11, 12, 21, 22, 25, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    avoidNakshatras: [1, 5, 8, 17, 18, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
  business: {
    label: 'Business / New Venture',
    labelHi: 'व्यापार शुरू',
    goodNakshatras: [0, 3, 4, 6, 7, 11, 12, 14, 20, 21, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    avoidNakshatras: [5, 8, 17, 18, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
  general: {
    label: 'General Auspicious Date',
    labelHi: 'शुभ दिन',
    goodNakshatras: [3, 4, 6, 7, 11, 12, 14, 16, 20, 21, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    avoidNakshatras: [5, 8, 17, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
};

// ── Gowri Panchangam ──────────────────────────────────────────────────────────

export type GowriType = 'Amrutham' | 'Sudham' | 'Labham' | 'Uthamam' | 'Rogam' | 'Dhanam' | 'Charam' | 'Visha';

export const GOWRI_INFO: Record<GowriType, { nameHi: string; quality: Quality; color: string }> = {
  Amrutham: { nameHi: 'अमृतम्', quality: 'best', color: '#16803D' },
  Sudham:   { nameHi: 'सुधम्',  quality: 'good', color: '#97690F' },
  Labham:   { nameHi: 'लाभम्',  quality: 'good', color: '#B5390A' },
  Uthamam:  { nameHi: 'उत्तमम्', quality: 'good', color: '#7F2700' },
  Rogam:    { nameHi: 'रोगम्',   quality: 'bad',  color: '#C81E1E' },
  Dhanam:   { nameHi: 'धनम्',   quality: 'neutral', color: '#8C7660' },
  Charam:   { nameHi: 'चरम्',   quality: 'neutral', color: '#5A4636' },
  Visha:    { nameHi: 'विषम्',  quality: 'bad',  color: '#3A2712' },
};

export const GOWRI_DAY: GowriType[][] = [
  ['Uthamam','Amrutham','Rogam','Labham','Dhanam','Sudham','Charam','Visha'],   // Sun
  ['Amrutham','Visha','Rogam','Labham','Dhanam','Sudham','Charam','Uthamam'],   // Mon
  ['Rogam','Labham','Dhanam','Sudham','Charam','Uthamam','Visha','Amrutham'],   // Tue
  ['Labham','Dhanam','Sudham','Charam','Visha','Uthamam','Amrutham','Rogam'],   // Wed
  ['Dhanam','Sudham','Charam','Uthamam','Amrutham','Visha','Rogam','Labham'],   // Thu
  ['Sudham','Charam','Uthamam','Visha','Amrutham','Rogam','Labham','Dhanam'],   // Fri
  ['Charam','Uthamam','Visha','Amrutham','Rogam','Labham','Dhanam','Sudham'],   // Sat
];

// Verified 2026-07 against drikpanchang.com's Tamil Gowri Panchangam (New Delhi), cross-checked
// against a second independent source (prokerala.com) for Tuesday's sequence — both matched
// exactly. Saturday's real source data has "Charam" (Soram) appearing twice with "Rogam" absent
// from the night cycle entirely, reproduced identically across two different Saturdays a week
// apart — not a fetch glitch, but transcribed faithfully rather than "corrected" to a clean
// permutation, since that would just be reintroducing unverified guessing.
export const GOWRI_NIGHT: GowriType[][] = [
  ['Dhanam','Sudham','Charam','Visha','Uthamam','Amrutham','Rogam','Labham'],   // Sun
  ['Sudham','Charam','Uthamam','Amrutham','Visha','Rogam','Labham','Dhanam'],   // Mon
  ['Charam','Uthamam','Visha','Amrutham','Rogam','Labham','Dhanam','Sudham'],   // Tue
  ['Uthamam','Amrutham','Rogam','Labham','Dhanam','Sudham','Charam','Visha'],   // Wed
  ['Amrutham','Visha','Rogam','Labham','Dhanam','Sudham','Charam','Uthamam'],   // Thu
  ['Rogam','Labham','Dhanam','Sudham','Charam','Uthamam','Visha','Amrutham'],   // Fri
  ['Labham','Dhanam','Sudham','Charam','Uthamam','Visha','Amrutham','Charam'],  // Sat (source anomaly: Rogam missing, Charam repeats)
];

// ── Sun-rashi void-period check (Issue #35/#13) ──────────────────────────────
//
// griha-pravesh.astro/vivah.astro/shubha-dates.astro each gate Kharmas (and, for Griha Pravesh,
// Chaturmas) exclusion on the Sun's sidereal rashi computed from a single fixed 6 AM local
// snapshot. If a Sankranti (Sun rashi change) happens later the same civil day, that snapshot
// still sees the OLD rashi, so the gate doesn't fire until the following day — letting a
// genuinely void date score "Excellent" (confirmed for Griha Pravesh's Chaturmas gate on the
// 2026-08-17 Simha Sankranti, which crosses ~7:30 AM IST, after the 6 AM snapshot).
//
// Fix: check the Sun's sidereal rashi at TWO endpoints of the local civil day — 00:00 and
// 23:59:24 (23.99h) local time — and treat the date as "inside" the void set if EITHER endpoint's
// rashi is a member. This is a strict OR, not an average: a date only clears the gate if the Sun
// stays outside the void rashis for the ENTIRE civil day. Strictly conservative relative to the
// old single-snapshot behavior (it can only newly exclude dates, never newly admit one that the
// old code excluded). Reuses the same toJD/sunTrueLongitude/lahiriAyanamsha calls each of the 3
// files already had inline — just evaluated twice per candidate date instead of once.

function voidCheckJD(y: number, m: number, d: number, h: number): number {
  let yy = y, mm = m;
  if (mm <= 2) { yy--; mm += 12; }
  const A = Math.floor(yy / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + h / 24 + B - 1524.5;
}
const voidNorm360 = (a: number) => ((a % 360) + 360) % 360;

/** Sun's sidereal (Lahiri) rashi index (0=Mesha … 11=Meena) at a given local civil hour on (y,m,d), for a location's tz offset (hours east of UTC). */
export function sunRashiIdxAt(y: number, m: number, d: number, localHour: number, tzOffset: number): number {
  const jd = voidCheckJD(y, m, d, localHour - tzOffset);
  const sunSid = voidNorm360(sunTrueLongitude(jd) - lahiriAyanamsha(jd));
  return Math.floor(sunSid / 30) % 12;
}

/**
 * Dual-endpoint void-rashi check for a candidate civil date. Returns `isVoid: true` if the Sun's
 * sidereal rashi is a member of `voidRashis` at EITHER local 00:00 or local 23:59 that day (OR,
 * not average) — i.e. the Sun spends at least part of the civil day in a void sign, even if a
 * Sankranti out of it happens later. `rashiIdx` is whichever endpoint triggered (start preferred),
 * or the start-of-day rashi if neither did — for building a human-readable "Kharmas (Dhanu)"-style
 * message; callers that don't need naming can ignore it.
 */
export function sunRashiVoidCheck(
  y: number, m: number, d: number, tzOffset: number, voidRashis: number[]
): { isVoid: boolean; rashiIdx: number } {
  const startRashi = sunRashiIdxAt(y, m, d, 0, tzOffset);
  const endRashi = sunRashiIdxAt(y, m, d, 23.99, tzOffset);
  if (voidRashis.includes(startRashi)) return { isVoid: true, rashiIdx: startRashi };
  if (voidRashis.includes(endRashi)) return { isVoid: true, rashiIdx: endRashi };
  return { isVoid: false, rashiIdx: startRashi };
}

// Shared void-rashi sets so all 3 call sites reference the same definition.
export const KHARMAS_RASHIS = [8, 11];       // Dhanu (Sagittarius), Meena (Pisces)
// Griha Pravesh's own solar-rashi approximation of Chaturmas (Sun transiting Simha/Kanya/Tula).
// Kept as-is for Griha Pravesh (unchanged, out of scope here), but empirically this proxy starts
// too late for Vivah: tested against 2026, it misses ~3 weeks at the front of the classical
// window (25 Jul - ~17 Aug, while the Sun is still sidereally in Karka) -- see CHATURMAS_WINDOWS.
export const CHATURMAS_RASHIS = [4, 5, 6];   // Simha, Kanya, Tula

// Classical Chaturmas = Devshayani Ekadashi (Ashadha Shukla Ekadashi) through Devutthana/
// Prabodhini Ekadashi (Kartika Shukla Ekadashi) -- the period Vivah is most strictly forbidden.
// This is a lunar-tithi boundary, not a clean solar-rashi one (CHATURMAS_RASHIS above is only an
// approximation used by Griha Pravesh), and it lands differently each year depending on Adhika
// Maas -- a same-formula astronomical scan for "the Ekadashi after Sun enters Karka" was tried
// and failed for 2027 (produced 12 Aug instead of the real 13/14 Jul, thrown off by that year's
// intercalary month), so these are hand-verified per year instead, the same maintenance pattern
// festivals.ts already uses for hard-to-compute festival dates. End dates use the later of the
// commonly-cited dual-observance dates (stricter/safer for a marriage-avoidance gate).
// Sources cross-checked 2026-08-21 (WebSearch, multiple independent sites agreeing):
//   2025: Devshayani 6 Jul 2025 -> Dev Uthani 1-2 Nov 2025
//   2026: Devshayani 25 Jul 2026 -> Dev Uthani 20-21 Nov 2026
//   2027: Devshayani 13-14 Jul 2027 -> Dev Uthani 9-10 Nov 2027
// Extend this table yearly, same as festivals.ts. Years not listed fall back to the
// CHATURMAS_RASHIS solar approximation in sunRashiVoidCheck() below (better than no check at
// all, though it misses the early-Karka weeks as noted above).
export const CHATURMAS_WINDOWS: Record<number, { start: string; end: string }> = {
  2025: { start: '2025-07-06', end: '2025-11-02' },
  2026: { start: '2026-07-25', end: '2026-11-21' },
  2027: { start: '2027-07-13', end: '2027-11-10' },
};

// True during the classical Devshayani->Devutthana Ekadashi window for the given calendar date
// (y/m/d, no time-of-day precision needed -- Ekadashi boundaries are date-level here). Falls
// back to the CHATURMAS_RASHIS solar-rashi approximation for years outside CHATURMAS_WINDOWS.
export function isChaturmas(y: number, m: number, d: number, tzOffset: number): boolean {
  const win = CHATURMAS_WINDOWS[y];
  if (win) {
    const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return key >= win.start && key <= win.end;
  }
  return sunRashiVoidCheck(y, m, d, tzOffset, CHATURMAS_RASHIS).isVoid;
}

// --- Rahu Kala / Gulika Kala / Yamaganda: shared slot engine -------------------------------
// Single source of truth for /muhurta/rahu-kala's build-time prerender (Astro frontmatter,
// New Delhi default) AND its client-side <script> (date/location picker updates). Both call
// sites import this same function so they can never compute two different answers for the
// same (date, location) — see CLAUDE.md, 2026-08-18 SEO-prerender pilot.

const RK_RAHU_SLOTS =   [7, 1, 6, 4, 5, 3, 2]; // Sun=7,Mon=1,Tue=6,Wed=4,Thu=5,Fri=3,Sat=2
const RK_GULIKA_SLOTS = [6, 5, 4, 3, 2, 1, 0];
const RK_YAMAG_SLOTS =  [4, 3, 2, 1, 0, 6, 5];

function rkJD(y: number, m: number, d: number, h: number): number {
  let yy = y, mm = m;
  if (mm <= 2) { yy--; mm += 12; }
  const A = Math.floor(yy / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + h / 24 + B - 1524.5;
}

function rkSlot(srMins: number, ssMins: number, slotIdx: number): { start: number; end: number } {
  const dur = (ssMins - srMins) / 8;
  const s = srMins + slotIdx * dur;
  return { start: s, end: s + dur };
}

export interface RahuKalaPeriod { start: number; end: number } // minutes from local midnight

export interface RahuKalaSlots {
  weekday: number; // 0=Sunday
  rahu: RahuKalaPeriod;
  gulika: RahuKalaPeriod;
  yamaganda: RahuKalaPeriod;
  /** "This week" strip: one row per weekday, each the NEXT occurrence of that weekday on/after
   *  the given date (row for `weekday` itself is the given date) — a rolling 7-day window, not
   *  a Sun-Sat calendar week. Matches the page's existing "This Week" UI. */
  week: { weekday: number; rahu: RahuKalaPeriod }[];
}

/**
 * Rahu Kala / Gulika Kala / Yamaganda slots for a civil date and location. Deliberately carries
 * no live/current-time data — "active now" status is a visitor-clock concern and must stay
 * client-side only (a build-time snapshot of "now" would be wrong by the time anyone sees it).
 */
export function computeRahuKalaSlots(y: number, m: number, d: number, lat: number, lng: number, tz: number): RahuKalaSlots {
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const jd = rkJD(y, m, d, 6 - tz);
  const srMins = sunriseUTC(jd, lat, lng, true) * 60 + tz * 60;
  const ssMins = sunriseUTC(jd, lat, lng, false) * 60 + tz * 60;

  const week = RK_RAHU_SLOTS.map((_, i) => {
    const offset = (i - weekday + 7) % 7;
    const dayJD = rkJD(y, m, d + offset, 6 - tz);
    const daySr = sunriseUTC(dayJD, lat, lng, true) * 60 + tz * 60;
    const daySs = sunriseUTC(dayJD, lat, lng, false) * 60 + tz * 60;
    return { weekday: i, rahu: rkSlot(daySr, daySs, RK_RAHU_SLOTS[i]) };
  });

  return {
    weekday,
    rahu: rkSlot(srMins, ssMins, RK_RAHU_SLOTS[weekday]),
    gulika: rkSlot(srMins, ssMins, RK_GULIKA_SLOTS[weekday]),
    yamaganda: rkSlot(srMins, ssMins, RK_YAMAG_SLOTS[weekday]),
    week,
  };
}

// --- Batch 1 SEO-prerender slot engines (Choghadiya, Hora, Abhijit, Panchaka/Gowri, Lagna) ---
// Each function below is the single source of truth for both a page's Astro frontmatter
// (build-time default: today, New Delhi) and its client <script> (date/location picker
// updates) — same pattern as computeRahuKalaSlots above. Previously each page carried its own
// duplicated toJD/slot-splitting logic inline in <script>; extracted here so server and client
// can never compute two different answers for the same (date, location). See CLAUDE.md,
// 2026-08-18 SEO-prerender rollout.

function civilJD(y: number, m: number, d: number, h: number): number {
  let yy = y, mm = m;
  if (mm <= 2) { yy--; mm += 12; }
  const A = Math.floor(yy / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + h / 24 + B - 1524.5;
}
const civilNorm360 = (a: number) => ((a % 360) + 360) % 360;

// -- Choghadiya --

export interface ChoghadiyaSlot { name: ChoghadiyaType; start: number; end: number }

export interface ChoghadiyaSlots {
  weekday: number;
  srMins: number;
  ssMins: number;
  day: ChoghadiyaSlot[];
  night: ChoghadiyaSlot[];
}

export function computeChoghadiyaSlots(y: number, m: number, d: number, lat: number, lng: number, tz: number): ChoghadiyaSlots {
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const jd = civilJD(y, m, d, 6 - tz);
  const jdNext = civilJD(y, m, d + 1, 6 - tz);
  const srMins = sunriseUTC(jd, lat, lng, true) * 60 + tz * 60;
  const ssMins = sunriseUTC(jd, lat, lng, false) * 60 + tz * 60;
  const srNextMins = sunriseUTC(jdNext, lat, lng, true) * 60 + tz * 60 + 1440;
  const dayDur = (ssMins - srMins) / 8;
  const nightDur = (srNextMins - ssMins) / 8;
  const day = DAY_CHOG[weekday].map((name, i) => ({ name, start: srMins + i * dayDur, end: srMins + (i + 1) * dayDur }));
  const night = NIGHT_CHOG[weekday].map((name, i) => ({ name, start: ssMins + i * nightDur, end: ssMins + (i + 1) * nightDur }));
  return { weekday, srMins, ssMins, day, night };
}

// -- Shubha Hora --

export interface HoraSlot { planet: string; start: number; end: number }

export interface HoraSlots {
  weekday: number;
  startIdx: number;
  srMins: number;
  ssMins: number;
  day: HoraSlot[];
  night: HoraSlot[];
}

export function computeHoraSlots(y: number, m: number, d: number, lat: number, lng: number, tz: number): HoraSlots {
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const jd = civilJD(y, m, d, 6 - tz);
  const jdNext = civilJD(y, m, d + 1, 6 - tz);
  const srMins = sunriseUTC(jd, lat, lng, true) * 60 + tz * 60;
  const ssMins = sunriseUTC(jd, lat, lng, false) * 60 + tz * 60;
  const srNextMins = sunriseUTC(jdNext, lat, lng, true) * 60 + tz * 60 + 1440;
  const dayHoraDur = (ssMins - srMins) / 12;
  const nightHoraDur = (srNextMins - ssMins) / 12;
  const startIdx = HORA_START[weekday];
  const day: HoraSlot[] = Array.from({ length: 12 }, (_, i) => {
    const s = srMins + i * dayHoraDur;
    return { planet: HORA_PLANETS[(startIdx + i) % 7], start: s, end: s + dayHoraDur };
  });
  const night: HoraSlot[] = Array.from({ length: 12 }, (_, i) => {
    const s = ssMins + i * nightHoraDur;
    return { planet: HORA_PLANETS[(startIdx + 12 + i) % 7], start: s, end: s + nightHoraDur };
  });
  return { weekday, startIdx, srMins, ssMins, day, night };
}

// -- Abhijit Muhurat / Do Ghati / Brahma Muhurta --

export interface AbhijitWindows {
  weekday: number;
  isWednesday: boolean;
  srMins: number;
  ssMins: number;
  abhijit: { start: number; end: number };
  doGhati: { start: number; end: number };
  brahma: { start: number; end: number };
}

export function computeAbhijitWindows(y: number, m: number, d: number, lat: number, lng: number, tz: number): AbhijitWindows {
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const jd = civilJD(y, m, d, 6 - tz);
  const srMins = sunriseUTC(jd, lat, lng, true) * 60 + tz * 60;
  const ssMins = sunriseUTC(jd, lat, lng, false) * 60 + tz * 60;
  const noonMins = (srMins + ssMins) / 2;
  const dayMins = ssMins - srMins;
  return {
    weekday,
    isWednesday: weekday === 3,
    srMins,
    ssMins,
    // Abhijit = solar noon ± 1/15 of day length (day-length-proportional, not a fixed 24 min).
    abhijit: { start: noonMins - dayMins / 30, end: noonMins + dayMins / 30 },
    // Do Ghati Muhurat = 2 Ghatis = 48 fixed minutes centered on solar noon (1 Ghati = 24 min,
    // unlike Abhijit this window is NOT day-length-proportional).
    doGhati: { start: noonMins - 24, end: noonMins + 24 },
    // Brahma Muhurta = 96 min before sunrise to 48 min before sunrise, same civil day's sunrise.
    brahma: { start: srMins - 96, end: srMins - 48 },
  };
}

// -- Panchaka / Gowri Panchangam --

export interface GowriSlot { name: GowriType; start: number; end: number }

export interface PanchakaGowri {
  weekday: number;
  nakIdx: number;
  isPanchaka: boolean;
  srMins: number;
  ssMins: number;
  gowriDay: GowriSlot[];
  gowriNight: GowriSlot[];
}

export function computePanchakaGowri(y: number, m: number, d: number, lat: number, lng: number, tz: number): PanchakaGowri {
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const jd = civilJD(y, m, d, 6 - tz);
  const jdNext = civilJD(y, m, d + 1, 6 - tz);
  const moonSid = civilNorm360(moonLongitude(jd) - lahiriAyanamsha(jd));
  const nakIdx = Math.floor(moonSid / (360 / 27)) % 27;
  const isPanchaka = PANCHAKA_NAKS.includes(nakIdx);
  const srMins = sunriseUTC(jd, lat, lng, true) * 60 + tz * 60;
  const ssMins = sunriseUTC(jd, lat, lng, false) * 60 + tz * 60;
  const srNextMins = sunriseUTC(jdNext, lat, lng, true) * 60 + tz * 60 + 1440;
  const dayDur = (ssMins - srMins) / 8;
  const nightDur = (srNextMins - ssMins) / 8;
  const gowriDay = GOWRI_DAY[weekday].map((name, i) => ({ name, start: srMins + i * dayDur, end: srMins + (i + 1) * dayDur }));
  const gowriNight = GOWRI_NIGHT[weekday].map((name, i) => ({ name, start: ssMins + i * nightDur, end: ssMins + (i + 1) * nightDur }));
  return { weekday, nakIdx, isPanchaka, srMins, ssMins, gowriDay, gowriNight };
}

// -- Lagna Table --

export interface LagnaEntry { rashi: number; startMins: number }

export interface LagnaTable {
  weekday: number;
  entries: LagnaEntry[];
}

/** Lagna (Ascendant) rashi changeover table for a civil date/location, sampled every 10 minutes
 *  across 24 hours and collapsed to just the changeover points — matches /muhurta/lagna's table. */
export function computeLagnaTable(y: number, m: number, d: number, lat: number, lng: number, tz: number): LagnaTable {
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const baseJD = civilJD(y, m, d, 0 - tz);
  const entries: LagnaEntry[] = [];
  let lastRashi = -1;
  for (let i = 0; i < 144; i++) {
    const tMins = i * 10;
    const tJD = baseJD + tMins / (60 * 24);
    const asc = civilNorm360(calcLagna(tJD, lat, lng) - lahiriAyanamsha(tJD));
    const rashi = Math.floor(asc / 30) % 12;
    if (rashi !== lastRashi) {
      entries.push({ rashi, startMins: tMins });
      lastRashi = rashi;
    }
  }
  return { weekday, entries };
}
