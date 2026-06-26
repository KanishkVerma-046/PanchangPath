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
  return norm360(L + dL / 1000);
}

// Lahiri ayanamsha (degrees)
function lahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.85 + 1.3612 * T - 0.000136 * T * T;
}

// Solar noon in decimal hours (UTC)
function solarNoonUTC(jd: number, lng: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const M = norm360(357.52911 + 35999.05029 * T);
  const Mr = toRad(M);
  const eot = 4 * (-(1.914602 - 0.004817 * T) * Math.sin(Mr) - 0.019993 * Math.sin(2 * Mr)
    + 0.9999 * (280.46646 - L0) * 0 + 0.000075 + 0.001868 * Math.cos(Mr)
    - 0.032077 * Math.sin(Mr) - 0.014615 * Math.cos(2 * Mr) - 0.04089 * Math.sin(2 * Mr));
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
  const noon = 12 - lng / 15;
  return rising ? noon - HA / 15 : noon + HA / 15;
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
const YAMAGANDA_SLOTS = [3, 5, 2, 7, 4, 6, 1];

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

function estimateEndTime(lon: number, degPerUnit: number, jd: number, tzOffset: number): string {
  // Moon moves ~13.17°/day, calculate when it crosses the next unit boundary
  const moonRate = 13.17; // degrees per day
  const remaining = degPerUnit - (lon % degPerUnit);
  const hoursToEnd = (remaining / moonRate) * 24;
  const jdAtMidnight = Math.floor(jd - 0.5) + 0.5;
  const currentHourUTC = (jd - jdAtMidnight) * 24;
  const endHourUTC = currentHourUTC + hoursToEnd;
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
  const tithiEndTime = estimateEndTime(elongation, 12, jd, tzOffset);

  // Nakshatra
  const nakshatraIdx = Math.floor(moonSidereal / (360 / 27)) % 27;
  const moonInNakshatra = moonSidereal % (360 / 27);
  const pada = Math.floor(moonInNakshatra / (360 / 27 / 4)) + 1;
  const nakshatraEndTime = estimateEndTime(moonSidereal, 360 / 27, jd, tzOffset);

  // Yoga
  const yogaLon = norm360(sunSidereal + moonSidereal);
  const yogaIdx = Math.floor(yogaLon / (360 / 27)) % 27;
  const yogaEndTime = estimateEndTime(yogaLon, 360 / 27, jd, tzOffset);

  // Karana (half-tithi index out of 60 per month)
  const elongationFull = norm360(moonLon - sunLon);
  const halfTithiIdx = Math.floor(elongationFull / 6) % 60;
  const karanaEndTime = estimateEndTime(elongationFull, 6, jd, tzOffset);

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

  // Moonrise (approximate: moon rises ~50 min later each day; base at full moon = sunset)
  const moonAge = elongation / 360 * 29.53;
  const moonriseMins = srMins + moonAge * 48;
  const mrH = Math.floor((moonriseMins / 60) % 24);
  const mrM = Math.round(moonriseMins % 60);
  const mrAp = mrH < 12 ? 'AM' : 'PM';
  const mrH12 = mrH % 12 || 12;
  const moonrise = `${mrH12}:${mrM.toString().padStart(2, '0')} ${mrAp}`;

  // Kalam periods
  const rahuKalam = slotTime(srMins, ssMins, RAHU_SLOTS[weekday]);
  const gulikaKalam = slotTime(srMins, ssMins, GULIKA_SLOTS[weekday]);
  const yamaganda = slotTime(srMins, ssMins, YAMAGANDA_SLOTS[weekday]);

  // Abhijit Muhurta = solar noon ± 24 min
  const noonMins = (srMins + ssMins) / 2;
  const abStart = noonMins - 24;
  const abEnd = noonMins + 24;
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
    durationDay,
    rahuKalam,
    gulikaKalam,
    yamaganda,
    abhijitMuhurta,
    sunLongitude: sunSidereal,
    moonLongitude: moonSidereal,
    ayanamsha,
  };
}
