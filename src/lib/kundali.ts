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

// ── Live "now" planet pages: shared helpers ─────────────────────────────────
// Single source of truth for /planets/{planetary-positions,gochara,rahu-ketu,shani} —
// previously each of these 4 pages carried its own duplicated copy of nakshatra/pada lookup,
// degree-minute formatting, and (on 3 of the 4) the Gochara house-from-Moon classification
// rules. Extracted here so build-time prerender and the client's 60s auto-refresh can never
// disagree — see CLAUDE.md, 2026-08-18 SEO-prerender rollout.

/** Nakshatra index (0-26) and pada (1-4) for a sidereal longitude. Look up display names via
 *  NAKSHATRAS[idx] from src/lib/panchang.ts. */
export function siderealNakshatraPada(sid: number): { idx: number; pada: number } {
  const span = 360 / 27;
  const idx = Math.floor(sid / span) % 27;
  const pada = Math.floor((sid % span) / (span / 4)) + 1;
  return { idx, pada };
}

/** Sidereal longitude within its sign -> "14°23'". */
export function formatDegMin(lon: number): string {
  const d = lon % 30;
  const deg = Math.floor(d);
  const mn = Math.floor((d - deg) * 60);
  return `${deg}°${String(mn).padStart(2, '0')}'`;
}

/** Classical Gochara ruleset — cross-verified during planning. Do not modify without
 *  re-verifying against an independent source. */
export function houseFromMoon(moonSignIdx: number, planetSignIdx: number): number {
  return ((planetSignIdx - moonSignIdx + 12) % 12) + 1;
}

export type GocharaEffect = {
  label: 'Favorable' | 'Challenging' | 'Neutral' | 'Sade Sati' | 'Ashtam Shani';
  cls: 'favorable' | 'challenging' | 'neutral';
};

/** Mars/Mercury/Jupiter/Venus/Rahu/Ketu-style Gochara: favorable in the given houses (default
 *  3, 6, 11 — the "Upachaya" houses), challenging everywhere else. */
export function classifyGochara(house: number, favorableHouses: number[] = [3, 6, 11]): GocharaEffect {
  return favorableHouses.includes(house) ? { label: 'Favorable', cls: 'favorable' } : { label: 'Challenging', cls: 'challenging' };
}

/** Saturn-specific Gochara: Sade Sati (12th/1st/2nd from Moon), Ashtam Shani (8th), Upachaya
 *  favorable (3rd/6th/11th), Neutral otherwise. */
export function classifyShaniGochara(house: number): GocharaEffect {
  if ([12, 1, 2].includes(house)) return { label: 'Sade Sati', cls: 'challenging' };
  if (house === 8) return { label: 'Ashtam Shani', cls: 'challenging' };
  if ([3, 6, 11].includes(house)) return { label: 'Favorable', cls: 'favorable' };
  return { label: 'Neutral', cls: 'neutral' };
}

// ── Illustrative-example prerendering: Kundali Generator + Janma Kundali ────
// Added 2026-08-27 for the site's "synthetic illustrative example" product decision (see
// docs/superpowers/plans/2026-08-26-three-initiative-scoping.md, Initiative 2, Tier 4): these
// two calculators' entire JS-only result is a genuine personal computation with no separate
// static reference content, so the crawlable default is a clearly-fictional sample birth
// (1 Jan 2000, 06:00, New Delhi) rather than "today" (which would read as a real stranger's
// live chart) or a real named person (which would make a permanent public claim about them).
// The functions below are pure data/string builders shared by each page's frontmatter (which
// prerenders this exact synthetic default) and its client <script> (which recomputes on load
// using the same default input values, then on every real Calculate click) -- same
// extract-before-prerender pattern as every other calculator on this site.

export const SYNTHETIC_EXAMPLE_BIRTH = { y: 2000, m: 1, d: 1, hh: 6, mm: 0, lat: 28.6139, lng: 77.209, tz: 5.5, city: 'New Delhi' };

/** Sign (0-11) each of the 12 rashi lords rules, indexed by graha id (astro-core's OuterPlanet
 *  keys plus surya/chandra) -- e.g. RASHI_LORD_KEY[0] === 'mangal' (Mars rules Mesha). */
export const RASHI_LORD_KEY: string[] = ['mangal', 'shukra', 'budha', 'chandra', 'surya', 'budha', 'shukra', 'mangal', 'guru', 'shani', 'shani', 'guru'];

export const PLANET_EXALT_SIGN: Record<string, number> = { surya: 0, chandra: 1, mangal: 9, budha: 5, guru: 3, shukra: 11, shani: 6 };
export const PLANET_DEBIL_SIGN: Record<string, number> = { surya: 6, chandra: 7, mangal: 3, budha: 11, guru: 9, shukra: 5, shani: 0 };
export const PLANET_OWN_SIGNS: Record<string, number[]> = { surya: [4], chandra: [3], mangal: [0, 7], budha: [2, 5], guru: [8, 11], shukra: [1, 6], shani: [9, 10] };

export interface KundaliRow { key: string; sign: number; sidLon: number; nakIdx: number; nakPada: number; isRetrograde: boolean; }
export interface KundaliChartData {
  ay: number;
  lagna: number;
  lagnaSign: number;
  signOfHouse: number[];
  planetsByHouse: Record<number, string[]>;
  planetsBySign: Record<number, string[]>;
  moonSign: number;
  sunSign: number;
  moonNak: { idx: number; pada: number };
  atmakarakaKey: string;
  rows: KundaliRow[];
}

/** Core sidereal chart data shared by the Kundali Generator and Janma Kundali pages -- signs,
 *  houses, per-planet longitude/nakshatra/retrograde, and Atmakaraka. Presentation (English/Hindi
 *  labels, HTML) is deliberately left to each call site, same split as evaluateMangalDosha(). */
export function computeKundaliChartData(jd: number, lat: number, lng: number): KundaliChartData {
  const L = allTropicalLons(jd);
  const ay = L.ayanamsha;
  const Lp = allTropicalLons(jd + 1);
  const sid: Record<string, number> = {};
  GRAHA_META.forEach(g => { sid[g.id] = n360((L as any)[g.id] - ay); });
  const lagnaTrop = calcLagna(jd, lat, lng);
  const lagna = n360(lagnaTrop - ay);
  const lagnaSign = Math.floor(lagna / 30);

  const signOfHouse: number[] = [];
  for (let h = 0; h < 12; h++) signOfHouse[h] = (lagnaSign + h) % 12;
  const planetsByHouse: Record<number, string[]> = {};
  const planetsBySign: Record<number, string[]> = {};
  for (let h = 0; h < 12; h++) planetsByHouse[h] = [];
  for (let s = 0; s < 12; s++) planetsBySign[s] = [];
  planetsByHouse[0].push('La');
  planetsBySign[lagnaSign].push('La');

  let akKey = '', akDeg = -1;
  const rows: KundaliRow[] = GRAHA_META.map(g => {
    const s = sid[g.id];
    const sign = Math.floor(s / 30);
    const house = ((sign - lagnaSign) + 12) % 12;
    planetsByHouse[house].push(g.abbr);
    planetsBySign[sign].push(g.abbr);
    const { idx: nakIdx, pada: nakPada } = siderealNakshatraPada(s);
    let isRetrograde = false;
    if (g.id === 'rahu' || g.id === 'ketu') isRetrograde = true;
    else if (g.id !== 'surya' && g.id !== 'chandra') {
      const cur = n360((L as any)[g.id] - ay);
      const nxt = n360((Lp as any)[g.id] - Lp.ayanamsha);
      let diff = nxt - cur;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      isRetrograde = diff < 0;
    }
    let degInSign = s % 30;
    if (g.id === 'rahu') degInSign = 30 - (s % 30);
    if (g.id !== 'ketu' && degInSign > akDeg) { akDeg = degInSign; akKey = g.id; }
    return { key: g.id, sign, sidLon: s, nakIdx, nakPada, isRetrograde };
  });

  const moonSign = Math.floor(sid.chandra / 30);
  const sunSign = Math.floor(sid.surya / 30);
  const moonNak = siderealNakshatraPada(sid.chandra);

  return { ay, lagna, lagnaSign, signOfHouse, planetsByHouse, planetsBySign, moonSign, sunSign, moonNak, atmakarakaKey: akKey, rows };
}

// ── North Indian chart drawing (Kundali Generator: 320px, 4-style page) ─────
export function kundaliNorthChart(signOfHouse: number[], planetsByHouse: Record<number, string[]>, size = 320): string {
  const S = size;
  const f: [number, number][] = [[0.5, 0.25], [0.25, 0.12], [0.12, 0.25], [0.25, 0.5], [0.12, 0.75], [0.25, 0.88], [0.5, 0.75], [0.75, 0.88], [0.88, 0.75], [0.75, 0.5], [0.88, 0.25], [0.75, 0.12]];
  let lines = `<line x1="0" y1="0" x2="${S}" y2="${S}"/><line x1="${S}" y1="0" x2="0" y2="${S}"/><polygon points="${S / 2},0 ${S},${S / 2} ${S / 2},${S} 0,${S / 2}" fill="none"/>`;
  let txt = '';
  for (let h = 0; h < 12; h++) {
    const cx = f[h][0] * S, cy = f[h][1] * S;
    txt += `<text x="${cx}" y="${cy - 18}" text-anchor="middle" font-size="10" fill="var(--color-kundali-house)" stroke="none" font-family="var(--font-mono)">${signOfHouse[h] + 1}</text>`;
    const pls = planetsByHouse[h] || [];
    pls.forEach((p, i) => {
      const perRow = 3, col = i % perRow, row = Math.floor(i / perRow);
      const px = cx + (col - (Math.min(pls.length, perRow) - 1) / 2) * 22;
      const py = cy + row * 14;
      txt += `<text x="${px}" y="${py}" text-anchor="middle" font-size="11" font-weight="600" fill="${p === 'La' ? 'var(--color-saffron-deep)' : 'var(--color-kundali-label)'}" stroke="none">${p}</text>`;
    });
  }
  return `<svg viewBox="-2 -2 ${S + 4} ${S + 4}" width="100%" style="max-width:${S}px;stroke:var(--color-kundali-grid);stroke-width:1;"><rect x="0" y="0" width="${S}" height="${S}" fill="var(--color-kundali-bg)"/>${lines}${txt}</svg>`;
}

const KUNDALI_SOUTH_SIGN: number[][] = [[11, 0, 1, 2], [10, -1, -1, 3], [9, -1, -1, 4], [8, 7, 6, 5]];
export function kundaliSouthChart(planetsBySign: Record<number, string[]>, lagnaSign: number): string {
  const C = 80, S = C * 4;
  let svg = `<svg viewBox="0 0 ${S} ${S}" width="100%" style="max-width:320px;">`;
  svg += `<rect x="${C}" y="${C}" width="${2 * C}" height="${2 * C}" fill="var(--color-kundali-bg)" stroke="var(--color-kundali-grid)" stroke-width="1.5"/>`;
  svg += `<text x="${C + C}" y="${C + C}" text-anchor="middle" dominant-baseline="middle" font-size="30" fill="var(--color-kundali-grid)" stroke="none">&#x1F549;</text>`;
  for (let r = 0; r < 4; r++) { for (let c = 0; c < 4; c++) {
    const s = KUNDALI_SOUTH_SIGN[r][c]; if (s === -1) continue;
    const x = c * C, y = r * C, isL = s === lagnaSign;
    svg += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="${isL ? 'rgba(220,130,50,0.08)' : 'var(--color-kundali-bg)'}" stroke="var(--color-kundali-grid)" stroke-width="1.5"/>`;
    svg += `<text x="${x + 4}" y="${y + 12}" font-size="9" fill="var(--color-kundali-house)" stroke="none" font-family="var(--font-mono)">${s + 1}</text>`;
    if (isL) svg += `<line x1="${x}" y1="${y}" x2="${x + 22}" y2="${y}" stroke="var(--color-saffron-deep)" stroke-width="2.5"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 22}" stroke="var(--color-saffron-deep)" stroke-width="2.5"/>`;
    const plts = planetsBySign[s] || [];
    plts.forEach((p, i) => { svg += `<text x="${x + 5 + (i % 3) * 24}" y="${y + 28 + Math.floor(i / 3) * 14}" font-size="11" font-weight="600" fill="${p === 'La' ? 'var(--color-saffron-deep)' : 'var(--color-kundali-label)'}" stroke="none">${p}</text>`; });
  } }
  svg += '</svg>'; return svg;
}

const KUNDALI_EAST_CELLS: (number[] | null)[][] = [[[10, 11], [0], [1, 2]], [[9], null, [3]], [[8, 7], [6], [5, 4]]];
export function kundaliEastChart(signOfHouse: number[], planetsByHouse: Record<number, string[]>): string {
  const C = 100, S = 300;
  let svg = `<svg viewBox="0 0 ${S} ${S}" width="100%" style="max-width:300px;">`;
  svg += `<rect x="${C}" y="${C}" width="${C}" height="${C}" fill="var(--color-kundali-bg)" stroke="var(--color-kundali-grid)" stroke-width="1.5"/>`;
  svg += `<text x="${C + C / 2}" y="${C + C / 2}" text-anchor="middle" dominant-baseline="middle" font-size="26" fill="var(--color-kundali-grid)" stroke="none">&#x1F549;</text>`;
  for (let r = 0; r < 3; r++) { for (let c = 0; c < 3; c++) {
    if (r === 1 && c === 1) continue;
    const houses = KUNDALI_EAST_CELLS[r][c]!;
    const x = c * C, y = r * C, isLagna = houses.includes(0);
    svg += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="${isLagna ? 'rgba(220,130,50,0.08)' : 'var(--color-kundali-bg)'}" stroke="var(--color-kundali-grid)" stroke-width="1.5"/>`;
    svg += `<text x="${x + 4}" y="${y + 12}" font-size="9" fill="var(--color-kundali-house)" stroke="none" font-family="var(--font-mono)">${houses.map(h => h + 1).join(',')}</text>`;
    if (isLagna) svg += `<text x="${x + C - 4}" y="${y + 12}" text-anchor="end" font-size="9" fill="var(--color-saffron-deep)" stroke="none">La</text>`;
    let allP: string[] = []; houses.forEach(h => { allP = allP.concat(planetsByHouse[h] || []); });
    allP.forEach((p, i) => { svg += `<text x="${x + 6 + (i % 3) * 28}" y="${y + 32 + Math.floor(i / 3) * 14}" font-size="11" font-weight="600" fill="${p === 'La' ? 'var(--color-saffron-deep)' : 'var(--color-kundali-label)'}" stroke="none">${p}</text>`; });
  } }
  svg += '</svg>'; return svg;
}

const KUNDALI_WEST_SIGN: number[][] = [[0, 1, 2, 3], [11, -1, -1, 4], [10, -1, -1, 5], [9, 8, 7, 6]];
export function kundaliWestChart(planetsBySign: Record<number, string[]>, lagnaSign: number): string {
  const C = 80, S = C * 4;
  let svg = `<svg viewBox="0 0 ${S} ${S}" width="100%" style="max-width:320px;">`;
  svg += `<rect x="${C}" y="${C}" width="${2 * C}" height="${2 * C}" fill="var(--color-kundali-bg)" stroke="var(--color-kundali-grid)" stroke-width="1.5"/>`;
  svg += `<text x="${C + C}" y="${C + C}" text-anchor="middle" dominant-baseline="middle" font-size="30" fill="var(--color-kundali-grid)" stroke="none">&#x1F549;</text>`;
  for (let r = 0; r < 4; r++) { for (let c = 0; c < 4; c++) {
    const s = KUNDALI_WEST_SIGN[r][c]; if (s === -1) continue;
    const x = c * C, y = r * C, isL = s === lagnaSign;
    svg += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="${isL ? 'rgba(220,130,50,0.08)' : 'var(--color-kundali-bg)'}" stroke="var(--color-kundali-grid)" stroke-width="1.5"/>`;
    svg += `<text x="${x + 4}" y="${y + 12}" font-size="9" fill="var(--color-kundali-house)" stroke="none" font-family="var(--font-mono)">${s + 1}</text>`;
    if (isL) svg += `<line x1="${x}" y1="${y}" x2="${x + 22}" y2="${y}" stroke="var(--color-saffron-deep)" stroke-width="2.5"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 22}" stroke="var(--color-saffron-deep)" stroke-width="2.5"/>`;
    const plts = planetsBySign[s] || [];
    plts.forEach((p, i) => { svg += `<text x="${x + 5 + (i % 3) * 24}" y="${y + 28 + Math.floor(i / 3) * 14}" font-size="11" font-weight="600" fill="${p === 'La' ? 'var(--color-saffron-deep)' : 'var(--color-kundali-label)'}" stroke="none">${p}</text>`; });
  } }
  svg += '</svg>'; return svg;
}

/** Smaller North Indian chart variant for the Janma Kundali report page (280px, single style). */
export function janmaNorthChart(signOfHouse: number[], planetsByHouse: Record<number, string[]>): string {
  const S = 280;
  const f: [number, number][] = [[0.5, 0.25], [0.25, 0.12], [0.12, 0.25], [0.25, 0.5], [0.12, 0.75], [0.25, 0.88], [0.5, 0.75], [0.75, 0.88], [0.88, 0.75], [0.75, 0.5], [0.88, 0.25], [0.75, 0.12]];
  let lines = `<line x1="0" y1="0" x2="${S}" y2="${S}"/><line x1="${S}" y1="0" x2="0" y2="${S}"/><polygon points="${S / 2},0 ${S},${S / 2} ${S / 2},${S} 0,${S / 2}" fill="none"/>`;
  let txt = '';
  for (let h = 0; h < 12; h++) {
    const cx = f[h][0] * S, cy = f[h][1] * S;
    txt += `<text x="${cx}" y="${cy - 16}" text-anchor="middle" font-size="9" fill="var(--color-kundali-house)" stroke="none" font-family="var(--font-mono)">${signOfHouse[h] + 1}</text>`;
    const pls = planetsByHouse[h] || [];
    pls.forEach((p, i) => {
      const perRow = 3, col = i % perRow, row = Math.floor(i / perRow);
      const px = cx + (col - (Math.min(pls.length, perRow) - 1) / 2) * 20;
      const py = cy + row * 13;
      txt += `<text x="${px}" y="${py}" text-anchor="middle" font-size="10" font-weight="600" fill="${p === 'La' ? 'var(--color-saffron-deep)' : 'var(--color-kundali-label)'}" stroke="none">${p}</text>`;
    });
  }
  return `<svg viewBox="-2 -2 ${S + 4} ${S + 4}" width="100%" style="max-width:280px;stroke:var(--color-kundali-grid);stroke-width:1;"><rect x="0" y="0" width="${S}" height="${S}" fill="var(--color-kundali-bg)"/>${lines}${txt}</svg>`;
}

// ── Janma Kundali report: house lords, dignity, yogas, Vimshottari Dasha ────

export interface HouseLordRow { house: number; sign: number; lordKey: string; lordSign: number; lordHouse: number; }

export type DignityLabel = 'exalted' | 'debilitated' | 'own' | '';
export function planetDignity(key: string, sign: number): DignityLabel {
  if (PLANET_EXALT_SIGN[key] === sign) return 'exalted';
  if (PLANET_DEBIL_SIGN[key] === sign) return 'debilitated';
  if (PLANET_OWN_SIGNS[key]?.includes(sign)) return 'own';
  return '';
}

export type YogaKey = 'gajakesari' | 'budhaditya' | 'chandraMangal' | 'mahapurusha_guru' | 'mahapurusha_shukra'
  | 'mahapurusha_mangal' | 'mahapurusha_budha' | 'mahapurusha_shani' | 'rajaYoga15' | 'rajaYoga19' | 'kemadruma';

/** Detects the same 9 classical yoga checks the Janma Kundali report has always run (see the
 *  page's FAQ for each rule's exact definition and known cross-source disagreements). Returns
 *  just the keys present -- descriptive name/text stays with each call site, same split as
 *  evaluateMangalDosha(). */
export function detectJanmaYogas(chart: KundaliChartData): YogaKey[] {
  const sid: Record<string, number> = {};
  chart.rows.forEach(r => { sid[r.key] = r.sidLon; });
  const { lagnaSign, moonSign, signOfHouse } = chart;
  const present: YogaKey[] = [];

  const guruSign = Math.floor(sid.guru / 30);
  if ([0, 3, 6, 9].includes((guruSign - moonSign + 12) % 12)) present.push('gajakesari');
  if (Math.floor(sid.surya / 30) === Math.floor(sid.budha / 30)) present.push('budhaditya');
  const marsSign = Math.floor(sid.mangal / 30);
  const marsFromMoon = (marsSign - moonSign + 12) % 12;
  if (marsFromMoon === 0 || marsFromMoon === 6) present.push('chandraMangal');

  (['guru', 'shukra', 'mangal', 'budha', 'shani'] as const).forEach(k => {
    const sg = Math.floor(sid[k] / 30);
    const house = (sg - lagnaSign + 12) % 12;
    if ((PLANET_OWN_SIGNS[k]?.includes(sg) || PLANET_EXALT_SIGN[k] === sg) && [0, 3, 6, 9].includes(house)) {
      present.push((`mahapurusha_${k}`) as YogaKey);
    }
  });

  const lordKeyOfHouse = (n: number) => RASHI_LORD_KEY[signOfHouse[n]];
  const l1k = lordKeyOfHouse(0), l5k = lordKeyOfHouse(4), l9k = lordKeyOfHouse(8);
  if (l1k !== l5k && Math.floor(sid[l1k] / 30) === Math.floor(sid[l5k] / 30)) present.push('rajaYoga15');
  if (l1k !== l9k && Math.floor(sid[l1k] / 30) === Math.floor(sid[l9k] / 30)) present.push('rajaYoga19');

  const moonHouse = (moonSign - lagnaSign + 12) % 12;
  const adjHouses = [(moonHouse + 11) % 12, (moonHouse + 1) % 12];
  const hasNeighbour = chart.rows.some(r => r.key !== 'chandra' && r.key !== 'rahu' && r.key !== 'ketu'
    && adjHouses.includes((r.sign - lagnaSign + 12) % 12));
  if (!hasNeighbour) present.push('kemadruma');

  return present;
}

export const DASHA_ORDER: string[] = ['ketu', 'shukra', 'surya', 'chandra', 'mangal', 'rahu', 'guru', 'shani', 'budha'];
export const DASHA_YEARS: Record<string, number> = { ketu: 7, shukra: 20, surya: 6, chandra: 10, mangal: 7, rahu: 18, guru: 16, shani: 19, budha: 17 };

export interface JanmaKundaliData {
  chart: KundaliChartData;
  houseLords: HouseLordRow[];
  yogas: YogaKey[];
  dashaLordKey: string;
  dashaYears: number;
  dashaFractionElapsed: number; // 0..1, how far into the birth dasha the Moon already was
}

/** Everything the Janma Kundali report needs beyond computeKundaliChartData: house-lord
 *  placements, the 9 yoga checks, and the birth (Vimshottari) Dasha lord + elapsed fraction.
 *  Calendar dates for the Dasha sequence and any "currently active" row are deliberately left to
 *  each call site (they depend on the real birth Date and, for the active row, the real current
 *  instant -- a live/"NOW" concern that must stay client-recomputed, per this project's
 *  established prerendering convention). */
export function computeJanmaKundaliData(jd: number, lat: number, lng: number): JanmaKundaliData {
  const chart = computeKundaliChartData(jd, lat, lng);
  const houseLords: HouseLordRow[] = [];
  for (let h = 0; h < 12; h++) {
    const sign = chart.signOfHouse[h];
    const lordKey = RASHI_LORD_KEY[sign];
    const lordSign = Math.floor(chart.rows.find(r => r.key === lordKey)!.sidLon / 30);
    const lordHouse = (lordSign - chart.lagnaSign + 12) % 12;
    houseLords.push({ house: h, sign, lordKey, lordSign, lordHouse });
  }
  const yogas = detectJanmaYogas(chart);
  const moonNakSpan = 360 / 27;
  const moonFrac = (chart.rows.find(r => r.key === 'chandra')!.sidLon % moonNakSpan) / moonNakSpan;
  const dashaLordKey = DASHA_ORDER[chart.moonNak.idx % 9];
  const dashaYears = DASHA_YEARS[dashaLordKey];
  return { chart, houseLords, yogas, dashaLordKey, dashaYears, dashaFractionElapsed: moonFrac };
}
