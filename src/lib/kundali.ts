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

// ── Homepage Kundali widget chart rendering ─────────────────────────────────
// Pure string-building functions (no DOM APIs) extracted from KundaliWidget.astro's client
// <script> so the same markup can be produced at build time (Astro frontmatter, for the
// default "now, New Delhi" chart) and at runtime (the client script, on tab switch / location
// change) from the exact same code — see CLAUDE.md, 2026-08-18 SEO-prerender rollout.

// North Indian diamond: house (0-indexed, house 1..12) → normalised [x,y] label position.
const NI_HOUSE_XY: [number, number][] = [
  [0.5,0.25],[0.25,0.12],[0.12,0.25],[0.25,0.5],[0.12,0.75],[0.25,0.88],
  [0.5,0.75],[0.75,0.88],[0.88,0.75],[0.75,0.5],[0.88,0.25],[0.75,0.12],
];

// South Indian: cell → rashi index (−1 = center)
const SI_CELL_RASHI: number[][] = [
  [11,0,1,2],[10,-1,-1,3],[9,-1,-1,4],[8,7,6,5],
];

/** True North Indian diamond chart, rendered as SVG (matching the Kundali Generator's chart
 *  geometry). Sanskrit-abbreviated planet labels (g.abbr). */
export function drawNorthDiamond(data: KundaliData): string {
  const S = 272;
  const planetsByHouse: GrahaData[][] = Array.from({ length: 12 }, () => []);
  data.grahas.forEach(g => {
    const house = ((g.sign - data.lagna.sign) + 12) % 12;
    planetsByHouse[house].push(g);
  });

  const lines = `<line x1="0" y1="0" x2="${S}" y2="${S}"/><line x1="${S}" y1="0" x2="0" y2="${S}"/>` +
    `<polygon points="${S/2},0 ${S},${S/2} ${S/2},${S} 0,${S/2}" fill="none"/>`;

  let txt = '';
  for (let h = 0; h < 12; h++) {
    const cx = NI_HOUSE_XY[h][0] * S, cy = NI_HOUSE_XY[h][1] * S;
    const signIdx = (data.lagna.sign + h) % 12;
    const isLagna = h === 0;
    txt += `<text class="kw-diamond-house" x="${cx}" y="${cy - 17}" text-anchor="middle" font-size="9" fill="var(--color-kundali-house)" stroke="none">${signIdx + 1}</text>`;
    if (isLagna) {
      txt += `<text x="${cx + 15}" y="${cy - 17}" text-anchor="middle" font-size="8" font-weight="700" fill="var(--color-saffron-deep)" stroke="none">La</text>`;
    }
    const pls = planetsByHouse[h];
    const perRow = 3;
    pls.forEach((p, i) => {
      const col = i % perRow, row = Math.floor(i / perRow);
      const px = cx + (col - (Math.min(pls.length, perRow) - 1) / 2) * 20;
      const py = cy + row * 13;
      const fill = p.isRetrograde ? '#c62828' : p.isCombust ? 'var(--color-mute)' : 'var(--color-kundali-label)';
      txt += `<text class="kwc-chip" data-pid="${p.id}" x="${px}" y="${py}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${fill}" stroke="none" style="cursor:pointer;">${p.abbr}${p.isRetrograde ? 'ᴿ' : ''}</text>`;
    });
  }

  return `<svg viewBox="-2 -2 ${S + 4} ${S + 4}" width="${S}" height="${S}" style="stroke:var(--color-kundali-grid);stroke-width:1;">` +
    `<rect x="0" y="0" width="${S}" height="${S}" fill="var(--color-kundali-bg)" rx="4"/>${lines}${txt}</svg>`;
}

/** South Indian: fixed rashi positions, 4×4 cell grid. */
export function drawSouthGrid(data: KundaliData): string {
  let cells = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const isCenter = r >= 1 && r <= 2 && c >= 1 && c <= 2;
      if (isCenter) {
        cells += `<div class="kw-cell kw-center">${r === 1 && c === 1 ? '<span class="kw-om">🕉</span>' : ''}</div>`;
        continue;
      }
      const rashiIdx = SI_CELL_RASHI[r][c];
      const isLagna = rashiIdx === data.lagna.sign;
      const planetsHere = data.grahas.filter(g => g.sign === rashiIdx);
      cells += `<div class="kw-cell${isLagna ? ' kw-lagna-cell' : ''}">
        <span class="kwc-si-rashi">${RASHIS[rashiIdx].abbr}</span>
        ${isLagna ? '<span class="kwc-si-lagna">La</span>' : ''}
        <span class="kwc-si-planets">${planetsHere.map(p =>
          `<span class="kwc-chip ${p.isRetrograde?'vakri':''} ${p.isCombust?'asta':''}" data-pid="${p.id}">${p.abbr}${p.isRetrograde?'ᴿ':''}</span>`
        ).join('')}</span>
      </div>`;
    }
  }
  return `<div class="kw-grid" id="kw-grid">${cells}</div>`;
}
