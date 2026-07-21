// Jyotish planetary calculation engine
// Geocentric sidereal longitudes via astronomy-engine (see src/lib/astro-core.ts), plus
// Lagna/houses, retrograde/combust status, and Kundali-domain orchestration.
import {
  sunLongitude, moonLongitude, planetLongitude, rahuLongitude, ketuLongitude,
  lahiriAyanamsha, calcLagna, isRetrograde, isCombust,
  type OuterPlanet,
} from './astro-core';

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

// Graha id -> astro-core's outer-planet key, for the 5 bodies astro-core computes via
// astronomy-engine. Surya/Chandra/Rahu/Ketu each have their own dedicated function instead.
const GRAHA_TO_PLANET: Record<string, OuterPlanet> = {
  mangal: 'mars', budha: 'mercury', guru: 'jupiter', shukra: 'venus', shani: 'saturn',
};

// ── Full Julian Day with time ─────────────────────────────────────────────

export function jdFull(date: Date): number {
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  const yr = m <= 2 ? y - 1 : y, mo = m <= 2 ? m + 12 : m;
  const A = Math.floor(yr / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5;
}

function tropicalLonOf(id: string, jd: number): number {
  if (id === 'surya') return sunLongitude(jd);
  if (id === 'chandra') return moonLongitude(jd);
  if (id === 'rahu') return rahuLongitude(jd);
  if (id === 'ketu') return ketuLongitude(jd);
  return planetLongitude(GRAHA_TO_PLANET[id], jd);
}

// ── Batch tropical longitudes (for event scanning) ───────────────────────

export function allTropicalLons(jd: number): {
  surya: number; chandra: number; mangal: number; budha: number;
  guru: number; shukra: number; shani: number; rahu: number; ketu: number;
  ayanamsha: number;
} {
  const rahu = rahuLongitude(jd);
  return {
    surya: sunLongitude(jd), chandra: moonLongitude(jd),
    mangal: planetLongitude('mars', jd), budha: planetLongitude('mercury', jd),
    guru: planetLongitude('jupiter', jd), shukra: planetLongitude('venus', jd),
    shani: planetLongitude('saturn', jd),
    rahu, ketu: n360(rahu + 180), ayanamsha: lahiriAyanamsha(jd),
  };
}

// ── Main export ───────────────────────────────────────────────────────────

export function calculateKundali(date: Date, lat: number, lng: number, tzOffset: number): KundaliData {
  const jd = jdFull(date);
  const ay = lahiriAyanamsha(jd);
  const jdP1 = jd + 1; // tomorrow for speed calc

  const lonSpeed = (lon0: number, lon1: number) => {
    let d = lon1 - lon0;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  };

  const sunTrop = sunLongitude(jd);

  const grahas: GrahaData[] = GRAHA_META.map(meta => {
    const tropLon = tropicalLonOf(meta.id, jd);
    const sidLon  = n360(tropLon - ay);
    const sign    = Math.floor(sidLon / 30) % 12;
    const degFull = sidLon % 30;
    const deg     = Math.floor(degFull);
    const min     = Math.floor((degFull - deg) * 60);

    const trop1   = tropicalLonOf(meta.id, jdP1);
    const speed   = lonSpeed(tropLon, trop1);

    const isRetro = meta.id !== 'surya' && meta.id !== 'chandra'
      && meta.id !== 'rahu' && meta.id !== 'ketu'
      ? isRetrograde(GRAHA_TO_PLANET[meta.id], jd)
      : false;
    // Rahu & Ketu always retrograde in mean motion
    const motionFinal = (meta.id === 'rahu' || meta.id === 'ketu') ? true : isRetro;

    const combustDeg = meta.id === 'budha' && isRetro ? 12
                     : meta.id === 'shukra' && isRetro ? 8
                     : meta.combustDeg;
    const combust = meta.id !== 'surya' && meta.id !== 'rahu' && meta.id !== 'ketu'
                   && isCombust(sunTrop, tropLon, combustDeg);

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
      isCombust: combust,
      motion:     motionFinal ? 'Vakri' : 'Margi',
      visibility: combust ? 'Asta' : 'Udita',
    };
  });

  // Lagna
  const lagtrop   = calcLagna(jd, lat, lng);
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
