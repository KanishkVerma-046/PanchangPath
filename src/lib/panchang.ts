// Panchang calculation engine using Jean Meeus astronomical algorithms
import {
  sunLongitude as sunTrueLongitude,
  moonLongitude,
  lahiriAyanamsha,
  equationOfTimeMinutes,
  sunriseUTC,
  gmstDegrees,
  moonEquatorial,
  moonRiseSetUTC,
  findAngleCrossing,
} from './astro-core';

// Re-exported verbatim from astro-core.ts (the shared home for every astronomy-engine call and
// the geometry/utility functions built on top of it) so every existing importer of this module
// keeps working unchanged — see docs/superpowers/plans/2026-07-21-full-site-astronomy-engine-scope.md.
export {
  sunTrueLongitude,
  moonLongitude,
  lahiriAyanamsha,
  equationOfTimeMinutes,
  sunriseUTC,
  gmstDegrees,
  moonEquatorial,
  moonRiseSetUTC,
  findAngleCrossing,
};

export interface PanchangData {
  vara: { name: string; nameHi: string; lord: string };
  tithi: { number: number; name: string; nameHi: string; paksha: 'Shukla' | 'Krishna'; pakshaNi: string; endTime: string; type: string };
  nakshatra: { number: number; name: string; nameHi: string; endTime: string; lord: string; pada: number };
  yoga: { number: number; name: string; nameHi: string; endTime: string; type: string };
  karana: { number: number; name: string; nameHi: string; endTime: string };
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  durationDay: string;
  rahuKalam: { start: string; end: string };
  gulikaKalam: { start: string; end: string };
  yamaganda: { start: string; end: string };
  abhijitMuhurta: { start: string; end: string };
  sunLongitude: number;
  moonLongitude: number;
  ayanamsha: number;
}

function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }
function norm360(a: number) { return ((a % 360) + 360) % 360; }

export function julianDay(year: number, month: number, day: number, hour = 0): number {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24 + B - 1524.5;
}

// Solar noon in decimal hours (UTC)
function solarNoonUTC(jd: number, lng: number): number {
  const T = (jd - 2451545.0) / 36525;
  const eot = equationOfTimeMinutes(T);
  return 12 - lng / 15 - eot / 60;
}

function decimalHoursToTime(h: number, tzOffset: number): string {
  const local = h + tzOffset;
  const hh = Math.floor(((local % 24) + 24) % 24);
  const mm = Math.round((local - Math.floor(local)) * 60);
  const hStr = hh.toString().padStart(2, '0');
  const mStr = mm.toString().padStart(2, '0');
  const ampm = hh < 12 ? 'AM' : 'PM';
  const h12 = hh % 12 || 12;
  return `${h12}:${mStr} ${ampm}`;
}

function addMinutes(timeStr: string, mins: number): string {
  const [timePart, period] = timeStr.split(' ');
  const [h, m] = timePart.split(':').map(Number);
  let totalMins = (h % 12 + (period === 'PM' ? 12 : 0)) * 60 + m + mins;
  totalMins = ((totalMins % 1440) + 1440) % 1440;
  const newH = Math.floor(totalMins / 60);
  const newM = totalMins % 60;
  const newPeriod = newH < 12 ? 'AM' : 'PM';
  const h12 = newH % 12 || 12;
  return `${h12}:${newM.toString().padStart(2, '0')} ${newPeriod}`;
}

function timeToMinutes(timeStr: string): number {
  const [timePart, period] = timeStr.split(' ');
  const [h, m] = timePart.split(':').map(Number);
  return (h % 12 + (period === 'PM' ? 12 : 0)) * 60 + m;
}

const TITHIS = [
  { name: 'Pratipada', nameHi: 'प्रतिपदा', type: 'Nanda' },
  { name: 'Dwitiya', nameHi: 'द्वितीया', type: 'Bhadra' },
  { name: 'Tritiya', nameHi: 'तृतीया', type: 'Jaya' },
  { name: 'Chaturthi', nameHi: 'चतुर्थी', type: 'Rikta' },
  { name: 'Panchami', nameHi: 'पंचमी', type: 'Purna' },
  { name: 'Shashthi', nameHi: 'षष्ठी', type: 'Nanda' },
  { name: 'Saptami', nameHi: 'सप्तमी', type: 'Bhadra' },
  { name: 'Ashtami', nameHi: 'अष्टमी', type: 'Jaya' },
  { name: 'Navami', nameHi: 'नवमी', type: 'Rikta' },
  { name: 'Dashami', nameHi: 'दशमी', type: 'Purna' },
  { name: 'Ekadashi', nameHi: 'एकादशी', type: 'Nanda' },
  { name: 'Dwadashi', nameHi: 'द्वादशी', type: 'Bhadra' },
  { name: 'Trayodashi', nameHi: 'त्रयोदशी', type: 'Jaya' },
  { name: 'Chaturdashi', nameHi: 'चतुर्दशी', type: 'Rikta' },
  { name: 'Purnima', nameHi: 'पूर्णिमा', type: 'Purna' },
  { name: 'Pratipada', nameHi: 'प्रतिपदा', type: 'Nanda' },
  { name: 'Dwitiya', nameHi: 'द्वितीया', type: 'Bhadra' },
  { name: 'Tritiya', nameHi: 'तृतीया', type: 'Jaya' },
  { name: 'Chaturthi', nameHi: 'चतुर्थी', type: 'Rikta' },
  { name: 'Panchami', nameHi: 'पंचमी', type: 'Purna' },
  { name: 'Shashthi', nameHi: 'षष्ठी', type: 'Nanda' },
  { name: 'Saptami', nameHi: 'सप्तमी', type: 'Bhadra' },
  { name: 'Ashtami', nameHi: 'अष्टमी', type: 'Jaya' },
  { name: 'Navami', nameHi: 'नवमी', type: 'Rikta' },
  { name: 'Dashami', nameHi: 'दशमी', type: 'Purna' },
  { name: 'Ekadashi', nameHi: 'एकादशी', type: 'Nanda' },
  { name: 'Dwadashi', nameHi: 'द्वादशी', type: 'Bhadra' },
  { name: 'Trayodashi', nameHi: 'त्रयोदशी', type: 'Jaya' },
  { name: 'Chaturdashi', nameHi: 'चतुर्दशी', type: 'Rikta' },
  { name: 'Amavasya', nameHi: 'अमावस्या', type: 'Purna' },
];

const NAKSHATRAS = [
  { name: 'Ashwini', nameHi: 'अश्विनी', lord: 'Ketu' },
  { name: 'Bharani', nameHi: 'भरणी', lord: 'Venus' },
  { name: 'Krittika', nameHi: 'कृत्तिका', lord: 'Sun' },
  { name: 'Rohini', nameHi: 'रोहिणी', lord: 'Moon' },
  { name: 'Mrigashira', nameHi: 'मृगशिरा', lord: 'Mars' },
  { name: 'Ardra', nameHi: 'आर्द्रा', lord: 'Rahu' },
  { name: 'Punarvasu', nameHi: 'पुनर्वसु', lord: 'Jupiter' },
  { name: 'Pushya', nameHi: 'पुष्य', lord: 'Saturn' },
  { name: 'Ashlesha', nameHi: 'आश्लेषा', lord: 'Mercury' },
  { name: 'Magha', nameHi: 'मघा', lord: 'Ketu' },
  { name: 'Purva Phalguni', nameHi: 'पूर्व फाल्गुनी', lord: 'Venus' },
  { name: 'Uttara Phalguni', nameHi: 'उत्तर फाल्गुनी', lord: 'Sun' },
  { name: 'Hasta', nameHi: 'हस्त', lord: 'Moon' },
  { name: 'Chitra', nameHi: 'चित्रा', lord: 'Mars' },
  { name: 'Swati', nameHi: 'स्वाति', lord: 'Rahu' },
  { name: 'Vishakha', nameHi: 'विशाखा', lord: 'Jupiter' },
  { name: 'Anuradha', nameHi: 'अनुराधा', lord: 'Saturn' },
  { name: 'Jyeshtha', nameHi: 'ज्येष्ठा', lord: 'Mercury' },
  { name: 'Mula', nameHi: 'मूल', lord: 'Ketu' },
  { name: 'Purva Ashadha', nameHi: 'पूर्वाषाढ़ा', lord: 'Venus' },
  { name: 'Uttara Ashadha', nameHi: 'उत्तराषाढ़ा', lord: 'Sun' },
  { name: 'Shravana', nameHi: 'श्रावण', lord: 'Moon' },
  { name: 'Dhanishtha', nameHi: 'धनिष्ठा', lord: 'Mars' },
  { name: 'Shatabhisha', nameHi: 'शतभिषा', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', nameHi: 'पूर्व भाद्रपदा', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', nameHi: 'उत्तर भाद्रपदा', lord: 'Saturn' },
  { name: 'Revati', nameHi: 'रेवती', lord: 'Mercury' },
];

const YOGAS = [
  { name: 'Vishkambha', nameHi: 'विष्कम्भ', type: 'Inauspicious' },
  { name: 'Preeti', nameHi: 'प्रीति', type: 'Auspicious' },
  { name: 'Ayushman', nameHi: 'आयुष्मान', type: 'Auspicious' },
  { name: 'Saubhagya', nameHi: 'सौभाग्य', type: 'Auspicious' },
  { name: 'Shobhana', nameHi: 'शोभन', type: 'Auspicious' },
  { name: 'Atiganda', nameHi: 'अतिगण्ड', type: 'Inauspicious' },
  { name: 'Sukarma', nameHi: 'सुकर्मा', type: 'Auspicious' },
  { name: 'Dhriti', nameHi: 'धृति', type: 'Auspicious' },
  { name: 'Shula', nameHi: 'शूल', type: 'Inauspicious' },
  { name: 'Ganda', nameHi: 'गण्ड', type: 'Inauspicious' },
  { name: 'Vriddhi', nameHi: 'वृद्धि', type: 'Auspicious' },
  { name: 'Dhruva', nameHi: 'ध्रुव', type: 'Auspicious' },
  { name: 'Vyaghata', nameHi: 'व्याघात', type: 'Inauspicious' },
  { name: 'Harshana', nameHi: 'हर्षण', type: 'Auspicious' },
  { name: 'Vajra', nameHi: 'वज्र', type: 'Inauspicious' },
  { name: 'Siddhi', nameHi: 'सिद्धि', type: 'Auspicious' },
  { name: 'Vyatipata', nameHi: 'व्यतिपात', type: 'Inauspicious' },
  { name: 'Variyan', nameHi: 'वरीयान', type: 'Auspicious' },
  { name: 'Parigha', nameHi: 'परिघ', type: 'Inauspicious' },
  { name: 'Shiva', nameHi: 'शिव', type: 'Auspicious' },
  { name: 'Siddha', nameHi: 'सिद्ध', type: 'Auspicious' },
  { name: 'Sadhya', nameHi: 'साध्य', type: 'Auspicious' },
  { name: 'Shubha', nameHi: 'शुभ', type: 'Auspicious' },
  { name: 'Shukla', nameHi: 'शुक्ल', type: 'Auspicious' },
  { name: 'Brahma', nameHi: 'ब्रह्म', type: 'Auspicious' },
  { name: 'Indra', nameHi: 'इन्द्र', type: 'Auspicious' },
  { name: 'Vaidhriti', nameHi: 'वैधृति', type: 'Inauspicious' },
];

const KARANAS = [
  'Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
];

const KARANAS_HI = [
  'किंस्तुघ्न', 'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि',
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि',
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि',
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि',
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि',
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि',
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि',
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि',
  'शकुनि', 'चतुष्पाद', 'नाग', 'किंस्तुघ्न',
];

const VARAS = [
  { name: 'Sunday', nameHi: 'रविवार', lord: 'Sun' },
  { name: 'Monday', nameHi: 'सोमवार', lord: 'Moon' },
  { name: 'Tuesday', nameHi: 'मंगलवार', lord: 'Mars' },
  { name: 'Wednesday', nameHi: 'बुधवार', lord: 'Mercury' },
  { name: 'Thursday', nameHi: 'गुरुवार', lord: 'Jupiter' },
  { name: 'Friday', nameHi: 'शुक्रवार', lord: 'Venus' },
  { name: 'Saturday', nameHi: 'शनिवार', lord: 'Saturn' },
];

// Rahu Kalam slots (0-indexed, slot × dayDuration/8 from sunrise)
const RAHU_SLOTS =      [7, 1, 6, 4, 5, 2, 3]; // Sun=7,Mon=1,Tue=6,Wed=4,Thu=5,Fri=2,Sat=3
const GULIKA_SLOTS =    [6, 5, 4, 3, 2, 1, 0];
const YAMAGANDA_SLOTS = [4, 3, 2, 1, 0, 6, 5];

function slotTime(sunriseMins: number, sunsetMins: number, slot: number): { start: string; end: string } {
  const duration = (sunsetMins - sunriseMins) / 8;
  const start = sunriseMins + slot * duration;
  const end = start + duration;
  const fmt = (m: number) => {
    const h = Math.floor(m / 60) % 24;
    const min = Math.round(m % 60);
    const ap = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 || 12;
    return `${h12}:${min.toString().padStart(2, '0')} ${ap}`;
  };
  return { start: fmt(start), end: fmt(end) };
}

function estimateEndTime(jd: number, degPerUnit: number, tzOffset: number, longitudeFn: (jd: number) => number): string {
  const lonNow = longitudeFn(jd);
  const boundary = (Math.floor(lonNow / degPerUnit) + 1) * degPerUnit;
  const targetLon = boundary % 360;
  const jdEnd = findAngleCrossing(jd, targetLon, longitudeFn);
  const jdAtMidnight = Math.floor(jd - 0.5) + 0.5;
  const endHourUTC = (jdEnd - jdAtMidnight) * 24;
  return decimalHoursToTime(endHourUTC, tzOffset);
}

function sunEndTime(lon: number, degPerUnit: number, jd: number, tzOffset: number): string {
  const sunRate = 1.0; // degrees per day
  const remaining = degPerUnit - (lon % degPerUnit);
  const hoursToEnd = (remaining / sunRate) * 24;
  const jdAtMidnight = Math.floor(jd - 0.5) + 0.5;
  const currentHourUTC = (jd - jdAtMidnight) * 24;
  return decimalHoursToTime(currentHourUTC + hoursToEnd, tzOffset);
}

export function calculatePanchang(date: Date, lat: number, lng: number, tzOffset: number): PanchangData {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = 6 - tzOffset; // ~6 AM local = UTC hour

  const jd = julianDay(year, month, day, hour);

  const sunLon = sunTrueLongitude(jd);
  const moonLon = moonLongitude(jd);
  const ayanamsha = lahiriAyanamsha(jd);

  const sunSidereal = norm360(sunLon - ayanamsha);
  const moonSidereal = norm360(moonLon - ayanamsha);

  // Tithi
  const elongation = norm360(moonLon - sunLon);
  const tithiIdx = Math.floor(elongation / 12) % 30;
  const paksha = tithiIdx < 15 ? 'Shukla' : 'Krishna';
  const elongationFn = (j: number) => norm360(moonLongitude(j) - sunTrueLongitude(j));
  const tithiEndTime = estimateEndTime(jd, 12, tzOffset, elongationFn);

  // Nakshatra
  const nakshatraIdx = Math.floor(moonSidereal / (360 / 27)) % 27;
  const moonInNakshatra = moonSidereal % (360 / 27);
  const pada = Math.floor(moonInNakshatra / (360 / 27 / 4)) + 1;
  const moonSiderealFn = (j: number) => norm360(moonLongitude(j) - lahiriAyanamsha(j));
  const nakshatraEndTime = estimateEndTime(jd, 360 / 27, tzOffset, moonSiderealFn);

  // Yoga (combined Sun+Moon sidereal angle — moves at ~14.17°/day, not the Moon's ~13.17°/day)
  const yogaLon = norm360(sunSidereal + moonSidereal);
  const yogaIdx = Math.floor(yogaLon / (360 / 27)) % 27;
  const yogaLonFn = (j: number) => norm360(norm360(sunTrueLongitude(j) - lahiriAyanamsha(j)) + norm360(moonLongitude(j) - lahiriAyanamsha(j)));
  const yogaEndTime = estimateEndTime(jd, 360 / 27, tzOffset, yogaLonFn);

  // Karana (half-tithi index out of 60 per month)
  const elongationFull = norm360(moonLon - sunLon);
  const halfTithiIdx = Math.floor(elongationFull / 6) % 60;
  const karanaEndTime = estimateEndTime(jd, 6, tzOffset, elongationFn);

  // Vara (weekday)
  const weekday = date.getDay();

  // Sunrise/Sunset
  const srUTC = sunriseUTC(jd, lat, lng, true);
  const ssUTC = sunriseUTC(jd, lat, lng, false);
  const sunriseStr = decimalHoursToTime(srUTC, tzOffset);
  const sunsetStr = decimalHoursToTime(ssUTC, tzOffset);

  const srMins = srUTC * 60 + tzOffset * 60;
  const ssMins = ssUTC * 60 + tzOffset * 60;
  const dayMins = ssMins - srMins;
  const dHours = Math.floor(dayMins / 60);
  const dMin = Math.round(dayMins % 60);
  const durationDay = `${dHours}h ${dMin}m`;

  // Moonrise/moonset: iterative altitude-crossing solve (see moonRiseSetUTC), seeded from the
  // old day-offset heuristic so the iteration lands on this calendar day's actual event.
  const jd0 = jd - hour / 24; // JD at 0h UTC of this calendar date
  const moonAge = elongation / 360 * 29.53;
  const moonriseSeedUTC = srUTC + moonAge * 0.8;
  const moonsetSeedUTC = moonriseSeedUTC + 12.42;
  const moonriseUTC = moonRiseSetUTC(jd0, lat, lng, true, moonriseSeedUTC);
  const moonsetUTC = moonRiseSetUTC(jd0, lat, lng, false, moonsetSeedUTC);
  const moonrise = decimalHoursToTime(moonriseUTC, tzOffset);
  const moonset = decimalHoursToTime(moonsetUTC, tzOffset);

  // Kalam periods
  const rahuKalam = slotTime(srMins, ssMins, RAHU_SLOTS[weekday]);
  const gulikaKalam = slotTime(srMins, ssMins, GULIKA_SLOTS[weekday]);
  const yamaganda = slotTime(srMins, ssMins, YAMAGANDA_SLOTS[weekday]);

  // Abhijit Muhurta = solar noon ± 1/15 of day length (1 muhurta = day length / 15, Abhijit spans half a muhurta each side of noon)
  const noonMins = (srMins + ssMins) / 2;
  const abStart = noonMins - dayMins / 30;
  const abEnd = noonMins + dayMins / 30;
  const fmtSlot = (m: number) => {
    const h = Math.floor((m / 60) % 24);
    const min = Math.round(m % 60);
    const ap = h < 12 ? 'AM' : 'PM';
    return `${h % 12 || 12}:${min.toString().padStart(2, '0')} ${ap}`;
  };
  const abhijitMuhurta = { start: fmtSlot(abStart), end: fmtSlot(abEnd) };

  return {
    vara: VARAS[weekday],
    tithi: {
      number: tithiIdx + 1,
      ...TITHIS[tithiIdx],
      paksha,
      pakshaNi: paksha === 'Shukla' ? 'शुक्ल' : 'कृष्ण',
      endTime: tithiEndTime,
    },
    nakshatra: {
      number: nakshatraIdx + 1,
      ...NAKSHATRAS[nakshatraIdx],
      endTime: nakshatraEndTime,
      pada,
    },
    yoga: {
      number: yogaIdx + 1,
      ...YOGAS[yogaIdx],
      endTime: yogaEndTime,
    },
    karana: {
      number: halfTithiIdx + 1,
      name: KARANAS[halfTithiIdx] || 'Bava',
      nameHi: KARANAS_HI[halfTithiIdx] || 'बव',
      endTime: karanaEndTime,
    },
    sunrise: sunriseStr,
    sunset: sunsetStr,
    moonrise,
    moonset,
    durationDay,
    rahuKalam,
    gulikaKalam,
    yamaganda,
    abhijitMuhurta,
    sunLongitude: sunSidereal,
    moonLongitude: moonSidereal,
    ayanamsha,
    srMins,
    ssMins,
  };
}

// ── Hindu Calendar Info ────────────────────────────────────────────────────

export const RASHIS = [
  { name: 'Mesha',      nameHi: 'मेष',      en: 'Aries' },
  { name: 'Vrishabha',  nameHi: 'वृषभ',     en: 'Taurus' },
  { name: 'Mithuna',    nameHi: 'मिथुन',    en: 'Gemini' },
  { name: 'Karka',      nameHi: 'कर्क',     en: 'Cancer' },
  { name: 'Simha',      nameHi: 'सिंह',     en: 'Leo' },
  { name: 'Kanya',      nameHi: 'कन्या',    en: 'Virgo' },
  { name: 'Tula',       nameHi: 'तुला',     en: 'Libra' },
  { name: 'Vrishchika', nameHi: 'वृश्चिक',  en: 'Scorpio' },
  { name: 'Dhanu',      nameHi: 'धनु',      en: 'Sagittarius' },
  { name: 'Makara',     nameHi: 'मकर',      en: 'Capricorn' },
  { name: 'Kumbha',     nameHi: 'कुम्भ',    en: 'Aquarius' },
  { name: 'Meena',      nameHi: 'मीन',      en: 'Pisces' },
];

export const AMANTA_MONTHS = [
  { name: 'Chaitra',      nameHi: 'चैत्र' },
  { name: 'Vaishakha',    nameHi: 'वैशाख' },
  { name: 'Jyeshtha',     nameHi: 'ज्येष्ठ' },
  { name: 'Ashadha',      nameHi: 'आषाढ़' },
  { name: 'Shravana',     nameHi: 'श्रावण' },
  { name: 'Bhadrapada',   nameHi: 'भाद्रपद' },
  { name: 'Ashwin',       nameHi: 'आश्विन' },
  { name: 'Kartika',      nameHi: 'कार्तिक' },
  { name: 'Margashirsha', nameHi: 'मार्गशीर्ष' },
  { name: 'Pausha',       nameHi: 'पौष' },
  { name: 'Magha',        nameHi: 'माघ' },
  { name: 'Phalguna',     nameHi: 'फाल्गुन' },
];

export const SAMVATSARA_NAMES = [
  'Prabhava','Vibhava','Shukla','Pramoda','Prajapati','Angirasa',
  'Shrimukha','Bhava','Yuva','Dhatri','Ishvara','Bahudhanya',
  'Pramathi','Vikrama','Vrisha','Chitrabhanu','Subhanu','Tarana',
  'Parthiva','Vyaya','Sarvajit','Sarvadharin','Virodhi','Vikrita',
  'Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukhi',
  'Hevilambi','Vilambi','Vikari','Sharvari','Plava','Shubhakrit',
  'Shobhana','Krodhi','Vishvavasu','Parabhava','Plavanga','Kilaka',
  'Saumya','Sadharana','Virodhikrit','Paridahvi','Pramadi','Ananda',
  'Rakshasa','Anala','Pingala','Kalayukti','Siddharthi','Raudri',
  'Durmati','Dundubhi','Rudhirodgari','Raktakshi','Krodhana','Akshaya',
];

export interface HinduCalendarInfo {
  vikramaSamvat: number;
  vikramaSamvatsara: string;
  shakaSamvat: number;
  sunRashi: typeof RASHIS[0];
  moonRashi: typeof RASHIS[0];
  amantaMonth: typeof AMANTA_MONTHS[0];
  purnimantaMonth: typeof AMANTA_MONTHS[0];
}

export function getHinduCalendarInfo(
  date: Date,
  sunSidereal: number,
  moonSidereal: number,
  paksha: 'Shukla' | 'Krishna',
): HinduCalendarInfo {
  const sunRashiIdx  = Math.floor(sunSidereal  / 30) % 12;
  const moonRashiIdx = Math.floor(moonSidereal / 30) % 12;

  // Amanta month = the rashi the Sun occupies at the UPCOMING Amavasya (the new moon that
  // ends the current lunar month), not the Sun's current rashi. Using the current rashi (a
  // Sankranti proxy) made the displayed month name lag the true new-moon crossing by up to
  // ~2 weeks, since Sankranti usually falls partway through a lunar month, not at its
  // boundary. Verified against 2026 New Delhi: Navratri (Ashwin Shukla Pratipada, 2026-10-11)
  // and Diwali (Kartik/Ashwin Amavasya, 2026-11-08) both land correctly with a forward search
  // to the next Amavasya — a backward search to the *previous* Amavasya gives the wrong
  // (off-by-one-month) answer, since the traditional naming keys off the month's ENDING
  // new moon, not its starting one.
  // Reference time uses noon UTC on the given calendar date — precise-enough for bucketing
  // into a 30°-wide rashi, so no timezone/location parameters are needed here.
  const jdRef = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate(), 12);
  const elongationNow = norm360(moonSidereal - sunSidereal);
  const MOON_SUN_RATE = 12.19; // deg/day the Moon gains on the Sun (mean synodic rate)
  let jdAmavasya = jdRef + (360 - elongationNow) / MOON_SUN_RATE;
  for (let i = 0; i < 3; i++) {
    const elongAtGuess = norm360(moonLongitude(jdAmavasya) - sunTrueLongitude(jdAmavasya));
    const signedErr = elongAtGuess > 180 ? elongAtGuess - 360 : elongAtGuess;
    jdAmavasya -= signedErr / MOON_SUN_RATE;
  }
  const sunSiderealAtAmavasya = norm360(sunTrueLongitude(jdAmavasya) - lahiriAyanamsha(jdAmavasya));
  const amantaIdx = Math.floor(sunSiderealAtAmavasya / 30) % 12;

  // Purnimanta: same month in Shukla paksha, one ahead in Krishna paksha
  const purnimantaIdx = paksha === 'Shukla' ? amantaIdx : (amantaIdx + 1) % 12;

  const year = date.getFullYear();
  // Ugadi (Hindu New Year) ≈ April 1; before it VS = year+56, after VS = year+57
  const dayOfYear = Math.floor(
    (Date.UTC(year, date.getMonth(), date.getDate()) - Date.UTC(year, 0, 0)) / 86_400_000,
  );
  const vsYear = dayOfYear >= 91 ? year + 57 : year + 56;
  const ssYear = vsYear - 135;
  const vsName = SAMVATSARA_NAMES[(vsYear - 1) % 60];

  return {
    vikramaSamvat: vsYear,
    vikramaSamvatsara: vsName,
    shakaSamvat: ssYear,
    sunRashi:       RASHIS[sunRashiIdx],
    moonRashi:      RASHIS[moonRashiIdx],
    amantaMonth:    AMANTA_MONTHS[amantaIdx],
    purnimantaMonth: AMANTA_MONTHS[purnimantaIdx],
  };
}
