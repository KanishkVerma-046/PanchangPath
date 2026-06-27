// Jyotish planetary calculation engine
// Keplerian orbital mechanics → geocentric sidereal longitudes
// Accuracy: ~1–3° (sufficient for Vedic Astrology sign/degree display)

const toR = (d: number) => d * Math.PI / 180;
const toD = (r: number) => r * 180 / Math.PI;
const n360 = (a: number) => ((a % 360) + 360) % 360;

// ── Types ─────────────────────────────────────────────────────────────────

export interface GrahaData {
  id: string;
  name: string;
  nameHi: string;
  abbr: string;          // 2-letter abbreviation for chart cells
  symbol: string;
  tropicalLon: number;
  siderealLon: number;
  sign: number;          // 0=Aries … 11=Pisces
  signName: string;
  signNameHi: string;
  deg: number;           // integer degrees within sign
  min: number;           // arcminutes
  speed: number;         // degrees/day (negative = retrograde)
  isRetrograde: boolean;
  isCombust: boolean;
  motion: 'Margi' | 'Vakri';
  visibility: 'Udita' | 'Asta';
}

export interface KundaliData {
  lagna: {
    siderealLon: number;
    sign: number;
    signName: string;
    signNameHi: string;
    deg: number;
    min: number;
  };
  grahas: GrahaData[];
  ayanamsha: number;
}

// ── Reference data ────────────────────────────────────────────────────────

export const RASHIS = [
  { name: 'Mesha',      nameHi: 'मेष',      en: 'Aries',        abbr: 'Msh' },
  { name: 'Vrishabha',  nameHi: 'वृषभ',     en: 'Taurus',       abbr: 'Vrb' },
  { name: 'Mithuna',    nameHi: 'मिथुन',    en: 'Gemini',       abbr: 'Mth' },
  { name: 'Karka',      nameHi: 'कर्क',     en: 'Cancer',       abbr: 'Krk' },
  { name: 'Simha',      nameHi: 'सिंह',     en: 'Leo',          abbr: 'Smh' },
  { name: 'Kanya',      nameHi: 'कन्या',    en: 'Virgo',        abbr: 'Kny' },
  { name: 'Tula',       nameHi: 'तुला',     en: 'Libra',        abbr: 'Tla' },
  { name: 'Vrishchika', nameHi: 'वृश्चिक',  en: 'Scorpio',      abbr: 'Vrk' },
  { name: 'Dhanu',      nameHi: 'धनु',      en: 'Sagittarius',  abbr: 'Dhn' },
  { name: 'Makara',     nameHi: 'मकर',      en: 'Capricorn',    abbr: 'Mkr' },
  { name: 'Kumbha',     nameHi: 'कुम्भ',    en: 'Aquarius',     abbr: 'Kmb' },
  { name: 'Meena',      nameHi: 'मीन',      en: 'Pisces',       abbr: 'Men' },
] as const;

export const GRAHA_META: {
  id: string; name: string; nameHi: string; abbr: string; symbol: string;
  combustDeg: number;
}[] = [
  { id: 'surya',   name: 'Surya',   nameHi: 'सूर्य',  abbr: 'Sy', symbol: '☉', combustDeg: 0   },
  { id: 'chandra', name: 'Chandra', nameHi: 'चन्द्र', abbr: 'Ch', symbol: '☽', combustDeg: 12  },
  { id: 'mangal',  name: 'Mangal',  nameHi: 'मंगल',   abbr: 'Ma', symbol: '♂', combustDeg: 17  },
  { id: 'budha',   name: 'Budha',   nameHi: 'बुध',    abbr: 'Bu', symbol: '☿', combustDeg: 14  },
  { id: 'guru',    name: 'Guru',    nameHi: 'गुरु',   abbr: 'Gu', symbol: '♃', combustDeg: 11  },
  { id: 'shukra',  name: 'Shukra',  nameHi: 'शुक्र',  abbr: 'Sk', symbol: '♀', combustDeg: 10  },
  { id: 'shani',   name: 'Shani',   nameHi: 'शनि',    abbr: 'Sa', symbol: '♄', combustDeg: 15  },
  { id: 'rahu',    name: 'Rahu',    nameHi: 'राहु',   abbr: 'Ra', symbol: '☊', combustDeg: 0   },
  { id: 'ketu',    name: 'Ketu',    nameHi: 'केतु',   abbr: 'Ke', symbol: '☋', combustDeg: 0   },
];

// ── Orbital elements at J2000.0 (Meeus Table 31.a) ───────────────────────
// L: mean longitude (deg), Lrate: deg/century
// ωp: longitude of perihelion, Ω: ascending node, i: inclination, e: eccentricity, a: AU
// _d suffix = rate per Julian century

interface Elem {
  L: number; Ld: number;
  wp: number; wpd: number;
  Om: number; Omd: number;
  i: number; id: number;
  e: number; ed: number;
  a: number;
}

const ORB: Record<string, Elem> = {
  mercury: { L:252.250906, Ld:149472.6746358, wp: 77.456119, wpd: 0.1588643, Om: 48.330893, Omd:-0.1254229, i:7.004979, id:-0.005952, e:0.20563069, ed: 0.00002527, a:0.38709831 },
  venus:   { L:181.979801, Ld: 58517.8156760, wp:131.563707, wpd: 0.0036096, Om: 76.679920, Omd:-0.2780080, i:3.394662, id:-0.000857, e:0.00677323, ed:-0.00004938, a:0.72332102 },
  earth:   { L:100.464457, Ld: 36000.7698278, wp:102.937348, wpd: 0.3225557, Om:174.873174, Omd:-0.2410908, i:0.000000, id: 0.013055, e:0.01671022, ed:-0.00003804, a:1.00000018 },
  mars:    { L:355.432818, Ld: 19140.2993313, wp:336.040768, wpd: 0.4439016, Om: 49.558093, Omd:-0.2950250, i:1.849726, id:-0.008148, e:0.09341233, ed: 0.00011902, a:1.52371243 },
  jupiter: { L: 34.351484, Ld:  3034.9056746, wp: 14.331309, wpd: 0.2155402, Om:100.464441, Omd: 0.1350208, i:1.303270, id:-0.001987, e:0.04839266, ed:-0.00012880, a:5.20248019 },
  saturn:  { L: 50.077444, Ld:  1222.1137943, wp: 93.056787, wpd: 0.5691095, Om:113.665524, Omd:-0.2566722, i:2.488878, id: 0.002552, e:0.05415060, ed:-0.00036762, a:9.54149883 },
};

// ── Kepler equation solver (Newton-Raphson) ───────────────────────────────

function solveKepler(M: number, e: number): number {
  let E = M;
  for (let k = 0; k < 50; k++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

// ── Heliocentric ecliptic XY (AU, J2000 ecliptic plane) ──────────────────

function helioXY(el: Elem, T: number): [number, number] {
  const e  = el.e  + el.ed  * T;
  const wp = n360(el.wp + el.wpd * T); // longitude of perihelion (deg)
  const Om = n360(el.Om + el.Omd * T); // ascending node (deg)
  const inc = el.i + el.id * T;
  const L  = n360(el.L  + el.Ld  * T); // mean longitude (deg)

  const M  = toR(n360(L - wp));   // mean anomaly (rad)
  const w  = toR(n360(wp - Om));  // arg of perihelion (rad)
  const Omega = toR(Om);
  const iR = toR(inc);

  const E = solveKepler(M, e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = el.a * (1 - e * Math.cos(E));
  const arg = nu + w;

  const x = r * (Math.cos(Omega) * Math.cos(arg) - Math.sin(Omega) * Math.sin(arg) * Math.cos(iR));
  const y = r * (Math.sin(Omega) * Math.cos(arg) + Math.cos(Omega) * Math.sin(arg) * Math.cos(iR));
  return [x, y];
}

// ── Moon longitude (Meeus Ch. 47 truncated) ──────────────────────────────

function moonLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lm  = n360(218.3164477 + 481267.88123421 * T);
  const D   = n360(297.8501921 + 445267.1114034  * T);
  const M   = n360(357.5291092 +  35999.0502909  * T);
  const Mp  = n360(134.9633964 + 477198.8675055  * T);
  const F   = n360( 93.2720950 + 483202.0175233  * T);
  const [Dr, Mr, Mpr, Fr] = [D, M, Mp, F].map(toR);
  const dL = 6.288774*Math.sin(Mpr)+1.274027*Math.sin(2*Dr-Mpr)+0.658314*Math.sin(2*Dr)
    +0.213618*Math.sin(2*Mpr)-0.185116*Math.sin(Mr)-0.114332*Math.sin(2*Fr)
    +0.058793*Math.sin(2*Dr-2*Mpr)+0.057066*Math.sin(2*Dr-Mr-Mpr)+0.053322*Math.sin(2*Dr+Mpr)
    +0.045758*Math.sin(2*Dr-Mr)-0.040923*Math.sin(Mr-Mpr)-0.034720*Math.sin(Dr)
    -0.030383*Math.sin(Mr+Mpr)+0.015327*Math.sin(2*Dr-2*Fr)+0.010034*Math.sin(3*Mpr);
  return n360(Lm + dL / 1000);
}

// ── Lahiri ayanamsha ──────────────────────────────────────────────────────

function ayanamsha(T: number): number {
  return 23.85 + 1.3612 * T - 0.000136 * T * T;
}

// ── Rahu mean ascending node (tropical) ──────────────────────────────────

function rahuLon(T: number): number {
  return n360(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
}

// ── Lagna (Ascendant) – tropical ecliptic longitude ──────────────────────

function calcLagna(jd: number, lat: number, lng: number): number {
  const T = (jd - 2451545.0) / 36525;
  const eps = 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
  const GMST = n360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
  const RAMC = toR(n360(GMST + lng));
  const e = toR(eps), phi = toR(lat);
  const tanA = -Math.cos(RAMC) / (Math.sin(e) * Math.tan(phi) + Math.cos(e) * Math.sin(RAMC));
  let A = toD(Math.atan(tanA));
  if (Math.cos(RAMC) > 0) A += 180;
  return n360(A);
}

// ── Full Julian Day with time ─────────────────────────────────────────────

export function jdFull(date: Date): number {
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  const yr = m <= 2 ? y - 1 : y, mo = m <= 2 ? m + 12 : m;
  const A = Math.floor(yr / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5;
}

// ── Sun tropical longitude ────────────────────────────────────────────────

function sunLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = n360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M  = n360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C  = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(toR(M))
           + (0.019993 - 0.000101 * T) * Math.sin(2 * toR(M))
           + 0.000289 * Math.sin(3 * toR(M));
  return n360(L0 + C);
}

// ── Main export ───────────────────────────────────────────────────────────

export function calculateKundali(date: Date, lat: number, lng: number, tzOffset: number): KundaliData {
  const jd = jdFull(date);
  const T  = (jd - 2451545.0) / 36525;
  const ay = ayanamsha(T);

  // Earth heliocentric
  const [xE, yE] = helioXY(ORB.earth, T);

  // Geocentric tropical longitudes for each body
  const getPlanetLon = (key: string) => {
    const [xP, yP] = helioXY(ORB[key], T);
    return n360(toD(Math.atan2(yP - yE, xP - xE)));
  };

  const jdP1 = jd + 1; // tomorrow for speed calc
  const T1   = (jdP1 - 2451545.0) / 36525;
  const [xE1, yE1] = helioXY(ORB.earth, T1);
  const getPlanetLon1 = (key: string) => {
    const [xP, yP] = helioXY(ORB[key], T1);
    return n360(toD(Math.atan2(yP - yE1, xP - xE1)));
  };

  const lonSpeed = (lon0: number, lon1: number) => {
    let d = lon1 - lon0;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  };

  // Tropical longitudes at JD
  const TROPICAL: Record<string, number> = {
    surya:   sunLon(jd),
    chandra: moonLon(jd),
    mangal:  getPlanetLon('mars'),
    budha:   getPlanetLon('mercury'),
    guru:    getPlanetLon('jupiter'),
    shukra:  getPlanetLon('venus'),
    shani:   getPlanetLon('saturn'),
    rahu:    rahuLon(T),
  };
  TROPICAL.ketu = n360(TROPICAL.rahu + 180);

  // Tomorrow's tropical longitudes (for speed)
  const TROPICAL1: Record<string, number> = {
    surya:   sunLon(jdP1),
    chandra: moonLon(jdP1),
    mangal:  getPlanetLon1('mars'),
    budha:   getPlanetLon1('mercury'),
    guru:    getPlanetLon1('jupiter'),
    shukra:  getPlanetLon1('venus'),
    shani:   getPlanetLon1('saturn'),
    rahu:    rahuLon(T1),
  };
  TROPICAL1.ketu = n360(TROPICAL1.rahu + 180);

  const sunTrop = TROPICAL.surya;

  const grahas: GrahaData[] = GRAHA_META.map(meta => {
    const tropLon = TROPICAL[meta.id];
    const sidLon  = n360(tropLon - ay);
    const sign    = Math.floor(sidLon / 30) % 12;
    const degFull = sidLon % 30;
    const deg     = Math.floor(degFull);
    const min     = Math.floor((degFull - deg) * 60);

    const trop1   = TROPICAL1[meta.id];
    const speed   = lonSpeed(tropLon, trop1);

    const isRetrograde = meta.id !== 'surya' && meta.id !== 'chandra' ? speed < 0 : false;
    // Rahu & Ketu always retrograde in mean motion
    const motionFinal  = (meta.id === 'rahu' || meta.id === 'ketu') ? true : isRetrograde;

    // Angular distance from Sun (shortest arc)
    let angDist = Math.abs(tropLon - sunTrop);
    if (angDist > 180) angDist = 360 - angDist;
    const combustDeg = meta.id === 'budha' && isRetrograde ? 12
                     : meta.id === 'shukra' && isRetrograde ? 8
                     : meta.combustDeg;
    const isCombust  = meta.id !== 'surya' && meta.id !== 'rahu' && meta.id !== 'ketu'
                       && angDist < combustDeg;

    return {
      ...meta,
      tropicalLon: tropLon,
      siderealLon: sidLon,
      sign,
      signName:   RASHIS[sign].name,
      signNameHi: RASHIS[sign].nameHi,
      deg,
      min,
      speed,
      isRetrograde: motionFinal,
      isCombust,
      motion:     motionFinal ? 'Vakri' : 'Margi',
      visibility: isCombust   ? 'Asta'  : 'Udita',
    };
  });

  // Lagna
  const lagnaJD = jdFull(date);
  const lagtrop   = calcLagna(lagnaJD, lat, lng);
  const lagsid    = n360(lagtrop - ay);
  const lagSign   = Math.floor(lagsid / 30) % 12;
  const lagDegF   = lagsid % 30;

  return {
    lagna: {
      siderealLon: lagsid,
      sign:     lagSign,
      signName: RASHIS[lagSign].name,
      signNameHi: RASHIS[lagSign].nameHi,
      deg: Math.floor(lagDegF),
      min: Math.floor((lagDegF - Math.floor(lagDegF)) * 60),
    },
    grahas,
    ayanamsha: ay,
  };
}
