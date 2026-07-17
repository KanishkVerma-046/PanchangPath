// Panchang calculation engine using Jean Meeus astronomical algorithms

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

function sunTrueLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = toRad(M);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
    + 0.000289 * Math.sin(3 * Mr);
  return norm360(L0 + C);
}

function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L = norm360(218.3164477 + 481267.88123421 * T);
  const D = norm360(297.8501921 + 445267.1114034 * T);
  const M = norm360(357.5291092 + 35999.0502909 * T);
  const Mp = norm360(134.9633964 + 477198.8675055 * T);
  const F = norm360(93.2720950 + 483202.0175233 * T);
  const Dr = toRad(D); const Mr = toRad(M); const Mpr = toRad(Mp); const Fr = toRad(F);
  const dL = 6.288774 * Math.sin(Mpr)
    + 1.274027 * Math.sin(2 * Dr - Mpr)
    + 0.658314 * Math.sin(2 * Dr)
    + 0.213618 * Math.sin(2 * Mpr)
    - 0.185116 * Math.sin(Mr)
    - 0.114332 * Math.sin(2 * Fr)
    + 0.058793 * Math.sin(2 * Dr - 2 * Mpr)
    + 0.057066 * Math.sin(2 * Dr - Mr - Mpr)
    + 0.053322 * Math.sin(2 * Dr + Mpr)
    + 0.045758 * Math.sin(2 * Dr - Mr)
    - 0.040923 * Math.sin(Mr - Mpr)
    - 0.034720 * Math.sin(Dr)
    - 0.030383 * Math.sin(Mr + Mpr)
    + 0.015327 * Math.sin(2 * Dr - 2 * Fr)
    + 0.010980 * Math.sin(Mpr - 2 * Fr)
    + 0.010675 * Math.sin(4 * Dr - Mpr)
    + 0.010034 * Math.sin(3 * Mpr)
    + 0.008548 * Math.sin(4 * Dr - 2 * Mpr)
    - 0.007888 * Math.sin(2 * Dr + Mr - Mpr)
    - 0.006766 * Math.sin(2 * Dr + Mr)
    - 0.005163 * Math.sin(Dr - Mpr)
    + 0.004987 * Math.sin(Dr + Mr)
    + 0.004036 * Math.sin(2 * Dr - Mr + Mpr)
    + 0.003994 * Math.sin(2 * Dr + 2 * Mpr)
    + 0.003861 * Math.sin(4 * Dr)
    + 0.003665 * Math.sin(2 * Dr - 3 * Mpr);
  return norm360(L + dL);
}

// Lahiri ayanamsha (degrees)
function lahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.85 + 1.3612 * T - 0.000136 * T * T;
}

// Equation of Time in minutes (Meeus, Astronomical Algorithms ch. 28)
function equationOfTimeMinutes(T: number): number {
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const epsilon0 = 23.4392911 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  const y = Math.pow(Math.tan(toRad(epsilon0) / 2), 2);
  const L0r = toRad(L0);
  const Mr = toRad(M);
  const E = y * Math.sin(2 * L0r) - 2 * e * Math.sin(Mr) + 4 * e * y * Math.sin(Mr) * Math.cos(2 * L0r)
    - 0.5 * y * y * Math.sin(4 * L0r) - 1.25 * e * e * Math.sin(2 * Mr);
  return toDeg(E) * 4;
}

// Solar noon in decimal hours (UTC)
function solarNoonUTC(jd: number, lng: number): number {
  const T = (jd - 2451545.0) / 36525;
  const eot = equationOfTimeMinutes(T);
  return 12 - lng / 15 - eot / 60;
}

// Sunrise/Sunset in decimal hours UTC using standard formula
function sunriseUTC(jd: number, lat: number, lng: number, rising: boolean): number {
  const T = (jd - 2451545.0) / 36525;
  const M = norm360(357.52911 + 35999.05029 * T);
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const Mr = toRad(M);
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mr) + 0.019993 * Math.sin(2 * Mr);
  const sunLon = L0 + C;
  const obliq = 23.4393 - 0.0000004 * T * 36525;
  const sinDec = Math.sin(toRad(obliq)) * Math.sin(toRad(sunLon));
  const dec = Math.asin(sinDec);
  const latR = toRad(lat);
  const cosHA = (Math.sin(toRad(-0.8333)) - Math.sin(latR) * Math.sin(dec)) / (Math.cos(latR) * Math.cos(dec));
  if (cosHA < -1 || cosHA > 1) return NaN;
  const HA = toDeg(Math.acos(cosHA));
  const eot = equationOfTimeMinutes(T);
  const noon = 12 - lng / 15 - eot / 60;
  return rising ? noon - HA / 15 : noon + HA / 15;
}

// Greenwich Mean Sidereal Time in degrees, valid for any jd (Meeus ch. 12)
function gmstDegrees(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
}

// Moon's geocentric equatorial position (RA/Dec), ecliptic latitude approximated as 0 —
// consistent with the rest of this codebase, which does not model the Moon's ~5.1° orbital
// inclination anywhere else (Nakshatra/Rashi placement use ecliptic longitude only).
function moonEquatorial(jd: number): { ra: number; dec: number } {
  const T = (jd - 2451545.0) / 36525;
  const lambda = moonLongitude(jd);
  const obliq = 23.4392911 - 0.0130042 * T;
  const lamR = toRad(lambda);
  const epsR = toRad(obliq);
  const dec = Math.asin(Math.sin(epsR) * Math.sin(lamR));
  const ra = norm360(toDeg(Math.atan2(Math.sin(lamR) * Math.cos(epsR), Math.cos(lamR))));
  return { ra, dec: toDeg(dec) };
}

// Moonrise/moonset in decimal UTC hours, in the same "UTC hour relative to this calendar
// date's 0h UTC" frame that sunriseUTC() returns (so it plugs into decimalHoursToTime() the
// same way). Unlike the Sun, the Moon moves ~13°/day, so a single daily snapshot isn't
// accurate — this iterates the altitude-crossing equation, recomputing the Moon's actual
// position at each refined estimate, seeded from the old day-offset heuristic to stay
// anchored to the correct calendar-day event.
// jd0 = Julian Day at 0h UTC of the calendar date being computed for.
function moonRiseSetUTC(jd0: number, lat: number, lng: number, rising: boolean, seedUTCHour: number): number {
  const h0 = 0.125; // target altitude: ~mean lunar horizontal parallax (0.7275×0.9508°) minus refraction (34')
  const latR = toRad(lat);
  let u = seedUTCHour;
  for (let i = 0; i < 6; i++) {
    const jd = jd0 + u / 24;
    const { ra, dec } = moonEquatorial(jd);
    const decR = toRad(dec);
    const cosH0 = (Math.sin(toRad(h0)) - Math.sin(latR) * Math.sin(decR)) / (Math.cos(latR) * Math.cos(decR));
    if (cosH0 < -1 || cosH0 > 1) return NaN;
    const H0 = toDeg(Math.acos(cosH0));
    const lst = norm360(gmstDegrees(jd) + lng);
    let H = ((lst - ra + 180) % 360 + 360) % 360 - 180;
    const target = rising ? -H0 : H0;
    let err = ((H - target + 180) % 360 + 360) % 360 - 180;
    const du = err / 14.35; // Moon's mean hour-angle progression rate, degrees/hour
    u -= du;
    if (Math.abs(du) < 0.0005) break; // converged to ~1.8 seconds
  }
  return u;
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

// Iteratively finds the JD at which `longitudeFn(jd)` (a 0-360° wrapped angle) next crosses
// `targetLon`, using the actual instantaneous rate of change of that specific angle at each
// step rather than an assumed fixed rate — the same iterative-refinement pattern as
// moonRiseSetUTC() above. This is why boundary-crossing times ("ends at") land within ~1
// minute of independent third-party sources instead of the 45min-2.5h drift the old
// single-linear-rate extrapolation produced (see docs/bugs/backlog.md).
function findAngleCrossing(jdStart: number, targetLon: number, longitudeFn: (jd: number) => number): number {
  let jd = jdStart;
  const dt = 1 / 1440; // 1 minute, for the finite-difference instantaneous-rate estimate
  for (let i = 0; i < 8; i++) {
    const lonNow = longitudeFn(jd);
    let diff = targetLon - lonNow;
    diff = ((diff % 360) + 540) % 360 - 180; // shortest signed distance to target, (-180, 180]
    const lonNext = longitudeFn(jd + dt);
    let dLon = lonNext - lonNow;
    dLon = ((dLon % 360) + 540) % 360 - 180;
    const rate = dLon / dt; // actual degrees/day rate right now, not an assumed constant
    if (Math.abs(rate) < 1e-6) break;
    const dJd = diff / rate;
    jd += dJd;
    if (Math.abs(dJd) < 1 / 86400) break; // converged to ~1 second
  }
  return jd;
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
