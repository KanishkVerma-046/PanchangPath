// Upcoming planetary event scanner
// Detects sign transits, retrograde/direct stations, conjunctions, eclipses,
// and equinoxes/solstices using day-by-day position scanning.

import { allTropicalLons, RASHIS } from './kundali';

// ── Types ─────────────────────────────────────────────────────────────────

export type EventType =
  | 'sign_transit'
  | 'retrograde_start'
  | 'direct_start'
  | 'conjunction'
  | 'opposition'
  | 'solar_eclipse'
  | 'lunar_eclipse'
  | 'solstice_equinox';

export interface PlanetaryEvent {
  id: string;
  type: EventType;
  icon: string;
  badgeColor: string;
  title: string;
  titleHi: string;
  label: string;        // "Sign Transit", "Retrograde", etc.
  labelHi: string;
  dateISO: string;      // YYYY-MM-DD
  timeUTC: number;      // decimal hours UTC (e.g. 14.5 = 14:30)
  daysAway: number;
  planets: string[];
  description: string;
  significance: string; // Jyotish significance paragraph
}

// ── Reference data ────────────────────────────────────────────────────────

const PLANET_META: Record<string, { name: string; nameHi: string; symbol: string; color: string }> = {
  surya:   { name: 'Sun (Surya)',      nameHi: 'सूर्य',  symbol: '☉', color: '#e07000' },
  chandra: { name: 'Moon (Chandra)',   nameHi: 'चन्द्र', symbol: '☽', color: '#6d7a8a' },
  mangal:  { name: 'Mars (Mangal)',    nameHi: 'मंगल',   symbol: '♂', color: '#dc2626' },
  budha:   { name: 'Mercury (Budha)',  nameHi: 'बुध',    symbol: '☿', color: '#15803d' },
  guru:    { name: 'Jupiter (Guru)',   nameHi: 'गुरु',   symbol: '♃', color: '#b45309' },
  shukra:  { name: 'Venus (Shukra)',   nameHi: 'शुक्र',  symbol: '♀', color: '#be185d' },
  shani:   { name: 'Saturn (Shani)',   nameHi: 'शनि',    symbol: '♄', color: '#4338CA' },
  rahu:    { name: 'Rahu',            nameHi: 'राहु',   symbol: '☊', color: '#374151' },
  ketu:    { name: 'Ketu',            nameHi: 'केतु',   symbol: '☋', color: '#78350f' },
};

const SOLSTICE_EQUINOX_META: Record<number, { title: string; titleHi: string; desc: string }> = {
  0:   { title: 'Vernal Equinox (Vasant Sampat)',   titleHi: 'वसंत सम्पात',   desc: 'Sun crosses celestial equator northward. Day and night of equal length.' },
  90:  { title: 'Summer Solstice (Dakshinayan)',    titleHi: 'दक्षिणायन',      desc: 'Sun reaches its northernmost point. Longest day of the year. Start of Dakshinayana — Sun begins southward journey.' },
  180: { title: 'Autumnal Equinox (Sharad Sampat)', titleHi: 'शरद सम्पात',    desc: 'Sun crosses celestial equator southward. Day and night of equal length.' },
  270: { title: 'Winter Solstice (Uttarayan)',      titleHi: 'उत्तरायण',       desc: 'Sun reaches its southernmost point. Shortest day. Start of Uttarayana — Sun begins northward journey. Auspicious half of the year begins.' },
};

const CONJUNCTION_PAIRS: [string, string, string][] = [
  // [planetA, planetB, description_suffix]
  ['guru',   'shani',  'a rare conjunction that marks major socio-political shifts in Jyotish'],
  ['mangal', 'shani',  'a tense combination — energy meets restriction'],
  ['mangal', 'guru',   'an auspicious union of energy and wisdom'],
  ['mangal', 'shukra', 'an intense combination of passion and beauty'],
  ['guru',   'shukra', 'expansion meets harmony — generally auspicious'],
  ['budha',  'shukra', 'intellect meets beauty — favourable for arts and communication'],
  ['shani',  'rahu',   'a deeply karmic conjunction — caution advised'],
  ['guru',   'rahu',   'Guru Chandala Yoga — wisdom tested by illusion'],
];

// ── JD helpers ────────────────────────────────────────────────────────────

function jdFromDate(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5;
}

function dateFromJD(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

function jdToISO(jd: number): string {
  return dateFromJD(jd).toISOString().split('T')[0];
}

function jdToTimeUTC(jd: number): number {
  return (jd % 1) * 24; // fractional part × 24
}

function angDiff(a: number, b: number): number {
  let d = b - a;
  if (d > 180)  d -= 360;
  if (d < -180) d += 360;
  return d;
}

// Linear interpolation JD when `lon` crosses `boundary` between jd and jd+1
function interpolateCrossing(lon0: number, lon1: number, boundary: number): number {
  // Normalise both to distance from boundary
  let d0 = ((lon0 - boundary) % 360 + 360) % 360;
  let d1 = ((lon1 - boundary) % 360 + 360) % 360;
  if (d0 > 180) d0 -= 360;
  if (d1 > 180) d1 -= 360;
  if (d0 * d1 >= 0) return 0.5; // no crossing, fallback
  return d0 / (d0 - d1);
}

// ── Slug for URL ──────────────────────────────────────────────────────────

function makeId(parts: string[]): string {
  return parts.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}

// ── Event builders ────────────────────────────────────────────────────────

function signTransitEvent(
  planet: string, signIdx: number, jd: number, today: Date,
): PlanetaryEvent {
  const pm = PLANET_META[planet];
  const rashi = RASHIS[signIdx];
  const isRahu = planet === 'rahu' || planet === 'ketu';
  const dirNote = isRahu ? ' (retrograde)' : '';
  const dateObj = dateFromJD(jd);
  const daysAway = Math.round((dateObj.getTime() - today.getTime()) / 86400000);

  const month = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  const id = makeId([planet, 'enters', rashi.name, String(dateObj.getUTCFullYear()), String(dateObj.getUTCMonth() + 1)]);

  return {
    id,
    type: 'sign_transit',
    icon: pm.symbol,
    badgeColor: pm.color,
    title: `${pm.name} enters ${rashi.name}${dirNote}`,
    titleHi: `${pm.nameHi} ${rashi.nameHi} में${dirNote ? ' (वक्री)' : ''}`,
    label: planet === 'surya' ? 'Sankranti' : 'Sign Transit',
    labelHi: planet === 'surya' ? 'संक्रांति' : 'राशि परिवर्तन',
    dateISO: jdToISO(jd),
    timeUTC: jdToTimeUTC(jd),
    daysAway,
    planets: [planet],
    description: `${pm.name} moves into ${rashi.name} (${rashi.en}) on ${dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}.`,
    significance: planet === 'surya'
      ? `Surya Sankranti — the Sun's monthly sign change is a major Panchang event. Sankranti marks the start of a new solar month and influences weather, agriculture, and the broader energy of the month. Charity (danam) on Sankranti day is considered highly meritorious.`
      : planet === 'guru'
      ? `Jupiter's sign change (Guru Peyarchi) is a major Jyotish event occurring roughly once per year. Jupiter is the greatest benefic and its sign placement strongly influences the collective fortune, education, children, and spiritual growth for all 12 rashis over the next 12 months.`
      : planet === 'shani'
      ? `Saturn's sign transit (Shani Peyarchi) is a defining Jyotish event happening every 2.5 years. Saturn rules karma, discipline, and life lessons. Its rashi placement determines the Sadesati (7.5-year period) and Ashtama Shani (Saturn in 8th house) for different moon signs.`
      : planet === 'rahu' || planet === 'ketu'
      ? `The Rahu-Ketu axis shift (Peyarchi) every 18 months is one of the most significant events in Jyotish. The nodes represent past karma (Ketu) and future desires (Rahu). Their new placement shapes the karmic focus for the entire world and each individual moon sign for 18 months.`
      : planet === 'mangal'
      ? `Mars (Mangal) is the planet of energy, courage, and action. Its sign transit every 45–75 days shifts the collective drive and aggression. Important for property, siblings, military matters, and physical vitality.`
      : `${pm.name}'s transit into ${rashi.name} shifts the planetary energy affecting ${rashi.en}-related themes for all rashis. Track this transit on your personal chart for house-specific results.`,
  };
}

function retrogradeEvent(
  planet: string, isStart: boolean, jd: number, today: Date,
): PlanetaryEvent {
  const pm = PLANET_META[planet];
  const dateObj = dateFromJD(jd);
  const daysAway = Math.round((dateObj.getTime() - today.getTime()) / 86400000);
  const id = makeId([planet, isStart ? 'vakri' : 'margi', String(dateObj.getUTCFullYear()), String(dateObj.getUTCMonth() + 1)]);

  const significance = isStart
    ? `${pm.name} stations retrograde — appearing to move backward from Earth's perspective. In Jyotish, retrograde (Vakri) planets have intensified, internalized energy. ${planet === 'budha' ? 'Mercury retrograde is infamous for delays, miscommunications, and technology glitches. Avoid signing contracts, starting new projects, or making major decisions during this period. Good time for reviewing, re-doing, and reflecting.' : planet === 'shukra' ? 'Venus retrograde occurs every 18 months and lasts ~40 days. It is a time for reconsidering relationships, finances, and aesthetic values. Past relationships may resurface. Avoid luxury purchases and cosmetic procedures.' : planet === 'mangal' ? 'Mars retrograde occurs every 26 months and lasts ~72 days. Energy is internalized — projects slow down, disputes take unexpected turns. Use this time for inner work rather than aggressive new initiatives.' : `${pm.name} retrograde shifts its significations inward. A time for review, revisitation, and deep contemplation of ${pm.name}-related matters.`}`
    : `${pm.name} stations direct — returning to forward motion after its retrograde period. Energy begins to externalize again. Plans that were delayed or stalled may now move forward. A gradual pick-up, not an immediate snap-back — give it 2 weeks for full momentum.`;

  return {
    id,
    type: isStart ? 'retrograde_start' : 'direct_start',
    icon: isStart ? `${pm.symbol}℞` : pm.symbol,
    badgeColor: isStart ? '#dc2626' : '#15803d',
    title: `${pm.name} ${isStart ? 'turns Retrograde (Vakri)' : 'turns Direct (Margi)'}`,
    titleHi: `${pm.nameHi} ${isStart ? 'वक्री' : 'मार्गी'} होते हैं`,
    label: isStart ? 'Retrograde' : 'Direct Station',
    labelHi: isStart ? 'वक्री' : 'मार्गी',
    dateISO: jdToISO(jd),
    timeUTC: jdToTimeUTC(jd),
    daysAway,
    planets: [planet],
    description: `${pm.name} ${isStart ? 'begins retrograde motion' : 'resumes direct motion'} on ${dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}.`,
    significance,
  };
}

function conjunctionEvent(
  pA: string, pB: string, jd: number, today: Date, isOpposition: boolean,
): PlanetaryEvent {
  const pmA = PLANET_META[pA], pmB = PLANET_META[pB];
  const dateObj = dateFromJD(jd);
  const daysAway = Math.round((dateObj.getTime() - today.getTime()) / 86400000);
  const type = isOpposition ? 'opposition' : 'conjunction';
  const id = makeId([pA, pB, type, String(dateObj.getUTCFullYear()), String(dateObj.getUTCMonth() + 1)]);
  const suffix = CONJUNCTION_PAIRS.find(([a, b]) => (a === pA && b === pB) || (a === pB && b === pA));

  return {
    id,
    type,
    icon: `${pmA.symbol}${isOpposition ? '☍' : '☌'}${pmB.symbol}`,
    badgeColor: '#7C3AED',
    title: `${pmA.name} ${isOpposition ? 'opposes' : 'conjunct'} ${pmB.name}`,
    titleHi: `${pmA.nameHi} ${isOpposition ? 'विपरीत' : 'युति'} ${pmB.nameHi}`,
    label: isOpposition ? 'Opposition' : 'Conjunction',
    labelHi: isOpposition ? 'विपरीत' : 'युति',
    dateISO: jdToISO(jd),
    timeUTC: jdToTimeUTC(jd),
    daysAway,
    planets: [pA, pB],
    description: `${pmA.name} and ${pmB.name} are in ${isOpposition ? 'opposition (180°)' : 'conjunction (0°)'} on ${dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}.`,
    significance: suffix
      ? `${pmA.name}–${pmB.name} ${isOpposition ? 'opposition' : 'conjunction'}: ${suffix[2]}. Planets in ${isOpposition ? 'opposition face off across signs' : 'conjunction blend their energies in the same degree'}, intensifying their combined significations in your natal chart.`
      : `This ${isOpposition ? 'opposition' : 'conjunction'} between ${pmA.name} and ${pmB.name} marks an important moment of peak energy/tension between their significations. Watch themes related to both planets closely.`,
  };
}

function solsticeEquinoxEvent(tropDeg: number, jd: number, today: Date): PlanetaryEvent {
  const meta = SOLSTICE_EQUINOX_META[tropDeg];
  const dateObj = dateFromJD(jd);
  const daysAway = Math.round((dateObj.getTime() - today.getTime()) / 86400000);
  const id = makeId([meta.title.split(' ')[0], 'solstice-equinox', String(dateObj.getUTCFullYear())]);

  return {
    id,
    type: 'solstice_equinox',
    icon: tropDeg === 0 ? '🌱' : tropDeg === 90 ? '☀️' : tropDeg === 180 ? '🍂' : '❄️',
    badgeColor: '#0ea5e9',
    title: meta.title,
    titleHi: meta.titleHi,
    label: tropDeg === 90 || tropDeg === 270 ? 'Solstice' : 'Equinox',
    labelHi: tropDeg === 90 || tropDeg === 270 ? 'अयनांत' : 'विषुव',
    dateISO: jdToISO(jd),
    timeUTC: jdToTimeUTC(jd),
    daysAway,
    planets: ['surya'],
    description: meta.desc,
    significance: `${meta.title} is an important astronomical transition. ${meta.desc} In Jyotish, the Uttarayan (start of northward journey) and Dakshinayan (start of southward journey) mark auspicious and inauspicious halves of the year respectively. The two equinoxes are solar midpoints.`,
  };
}

function eclipseEvent(
  type: 'solar_eclipse' | 'lunar_eclipse',
  title: string, titleHi: string,
  dateISO: string, timeUTC: number,
  today: Date, desc: string,
): PlanetaryEvent {
  const dateObj = new Date(dateISO + 'T12:00:00Z');
  const daysAway = Math.round((dateObj.getTime() - today.getTime()) / 86400000);
  const id = makeId([type.replace('_', '-'), dateISO]);
  return {
    id,
    type,
    icon: type === 'solar_eclipse' ? '🌑' : '🌕',
    badgeColor: '#1e1b4b',
    title,
    titleHi,
    label: type === 'solar_eclipse' ? 'Solar Eclipse' : 'Lunar Eclipse',
    labelHi: type === 'solar_eclipse' ? 'सूर्य ग्रहण' : 'चंद्र ग्रहण',
    dateISO,
    timeUTC,
    daysAway,
    planets: type === 'solar_eclipse' ? ['surya', 'chandra', 'rahu'] : ['chandra', 'rahu'],
    description: desc,
    significance: type === 'solar_eclipse'
      ? 'Surya Grahan (Solar Eclipse) occurs on a New Moon (Amavasya) when the Moon passes between Earth and Sun near the Rahu/Ketu axis. In Jyotish, eclipses are considered intensely karmic events. Mantras, meditation, and charitable giving during the eclipse are considered very powerful. Avoid eating during the eclipse window.'
      : 'Chandra Grahan (Lunar Eclipse) occurs on a Full Moon (Purnima) when Earth\'s shadow falls on the Moon near the Rahu/Ketu axis. The eclipse amplifies emotional and karmic energies. Traditionally, temples close during grahan, and bathing in holy rivers afterward is considered purifying. Pregnant women are advised to stay indoors.',
  };
}

// ── Known eclipses 2025–2026 (NASA/JPL verified) ─────────────────────────

const KNOWN_ECLIPSES: Omit<PlanetaryEvent, 'daysAway'>[] = [
  {
    id: 'lunar-eclipse-2025-03-14',
    type: 'lunar_eclipse',
    icon: '🌕',
    badgeColor: '#1e1b4b',
    title: 'Total Lunar Eclipse (Chandra Grahan)',
    titleHi: 'पूर्ण चंद्र ग्रहण',
    label: 'Lunar Eclipse',
    labelHi: 'चंद्र ग्रहण',
    dateISO: '2025-03-14',
    timeUTC: 6.97,
    planets: ['chandra', 'rahu'],
    description: 'Total lunar eclipse visible across Asia, Africa, Europe on Holi Purnima.',
    significance: 'Chandra Grahan (Lunar Eclipse) occurs on a Full Moon (Purnima) when Earth\'s shadow falls on the Moon near the Rahu/Ketu axis. This eclipse coincides with Holi Purnima — an exceptionally powerful event. The eclipse amplifies emotional and karmic energies. Bathing in holy rivers afterward is considered purifying.',
  },
  {
    id: 'solar-eclipse-2025-03-29',
    type: 'solar_eclipse',
    icon: '🌑',
    badgeColor: '#1e1b4b',
    title: 'Partial Solar Eclipse (Surya Grahan)',
    titleHi: 'आंशिक सूर्य ग्रहण',
    label: 'Solar Eclipse',
    labelHi: 'सूर्य ग्रहण',
    dateISO: '2025-03-29',
    timeUTC: 10.48,
    planets: ['surya', 'chandra', 'rahu'],
    description: 'Partial solar eclipse on Chaitra Amavasya. Visible in northwestern Europe and northern Africa.',
    significance: 'Surya Grahan on Amavasya — the Moon passes between Earth and Sun near the Rahu/Ketu axis. A spiritually potent Amavasya. Avoid eating during the eclipse window; mantras and charity are considered highly effective.',
  },
  {
    id: 'lunar-eclipse-2025-09-07',
    type: 'lunar_eclipse',
    icon: '🌕',
    badgeColor: '#1e1b4b',
    title: 'Total Lunar Eclipse (Chandra Grahan)',
    titleHi: 'पूर्ण चंद्र ग्रहण',
    label: 'Lunar Eclipse',
    labelHi: 'चंद्र ग्रहण',
    dateISO: '2025-09-07',
    timeUTC: 18.2,
    planets: ['chandra', 'rahu'],
    description: 'Total lunar eclipse on Bhadrapada Purnima — visible from India, Asia, Europe and Africa.',
    significance: 'Total Chandra Grahan visible across India. The Moon turns blood-red during totality. Temples traditionally close during the grahan period. Mantras, especially the Mahamrityunjaya Mantra, recited during this time are considered exceptionally potent.',
  },
  {
    id: 'solar-eclipse-2025-09-21',
    type: 'solar_eclipse',
    icon: '🌑',
    badgeColor: '#1e1b4b',
    title: 'Partial Solar Eclipse (Surya Grahan)',
    titleHi: 'आंशिक सूर्य ग्रहण',
    label: 'Solar Eclipse',
    labelHi: 'सूर्य ग्रहण',
    dateISO: '2025-09-21',
    timeUTC: 19.42,
    planets: ['surya', 'chandra', 'rahu'],
    description: 'Partial solar eclipse visible in southern Australia and Antarctica.',
    significance: 'Surya Grahan on Ashwin Amavasya — not visible from India, but the karmic intensity of the eclipse period applies. Avoid important new beginnings on this day.',
  },
  {
    id: 'solar-eclipse-2026-02-17',
    type: 'solar_eclipse',
    icon: '🌑',
    badgeColor: '#1e1b4b',
    title: 'Annular Solar Eclipse (Surya Grahan)',
    titleHi: 'वलयाकार सूर्य ग्रहण',
    label: 'Solar Eclipse',
    labelHi: 'सूर्य ग्रहण',
    dateISO: '2026-02-17',
    timeUTC: 12.02,
    planets: ['surya', 'chandra', 'rahu'],
    description: 'Annular solar eclipse ("ring of fire") on Magha Amavasya. Visible from Antarctica and southern South America.',
    significance: 'Surya Grahan on Magha Amavasya. In Jyotish, this eclipse near the Ketu end of the axis emphasizes past karma, spiritual liberation, and letting go. A powerful time for ancestral prayers (Pitru Tarpan).',
  },
  {
    id: 'solar-eclipse-2026-08-12',
    type: 'solar_eclipse',
    icon: '🌑',
    badgeColor: '#1e1b4b',
    title: 'Total Solar Eclipse (Surya Grahan)',
    titleHi: 'पूर्ण सूर्य ग्रहण',
    label: 'Solar Eclipse',
    labelHi: 'सूर्य ग्रहण',
    dateISO: '2026-08-12',
    timeUTC: 17.45,
    planets: ['surya', 'chandra', 'rahu'],
    description: 'Total solar eclipse visible across Greenland, Iceland, Spain, and northern Africa. Partial visibility in Europe and Middle East.',
    significance: 'Total Surya Grahan — one of the most dramatic astronomical events. The path of totality crosses Europe. In Jyotish, a total solar eclipse is an extremely significant karmic event. Avoid eating, starting new ventures, or important decisions on this day. Extended fasting, prayer, and donation (danam) yield amplified merit.',
  },
  {
    id: 'lunar-eclipse-2026-08-28',
    type: 'lunar_eclipse',
    icon: '🌕',
    badgeColor: '#1e1b4b',
    title: 'Partial Lunar Eclipse (Chandra Grahan)',
    titleHi: 'आंशिक चंद्र ग्रहण',
    label: 'Lunar Eclipse',
    labelHi: 'चंद्र ग्रहण',
    dateISO: '2026-08-28',
    timeUTC: 4.33,
    planets: ['chandra', 'rahu'],
    description: 'Partial lunar eclipse visible from Asia, Australia, Pacific, and Americas on Bhadrapada Purnima.',
    significance: 'Partial Chandra Grahan on Purnima. A penumbral or partial eclipse still carries karmic weight in Jyotish. The traditional grahan rules (no food, prayer, post-eclipse bath) apply even for partial eclipses.',
  },
];

// ── Main scanner ──────────────────────────────────────────────────────────

export function computeUpcomingEvents(today: Date, daysAhead = 365): PlanetaryEvent[] {
  const fromJD  = jdFromDate(today);
  const toJD    = fromJD + daysAhead;
  const todayMS = today.getTime();

  // Precompute daily positions (fromJD-1 to toJD+1 for retrograde speed comparison)
  const N = daysAhead + 3;
  type Snap = ReturnType<typeof allTropicalLons>;
  const snaps: Snap[] = [];
  for (let i = 0; i < N; i++) {
    snaps.push(allTropicalLons(fromJD - 1 + i));
  }
  // snaps[0] = JD fromJD-1, snaps[1] = JD fromJD, ..., snaps[N-1] = JD toJD+1

  const events: PlanetaryEvent[] = [];

  // Planets to track for sign transits (skip Chandra — transits every 2.3 days)
  const TRANSIT_PLANETS: (keyof Snap)[] = ['surya', 'mangal', 'budha', 'guru', 'shukra', 'shani', 'rahu'];
  // Planets to track for retrograde (Sun, Moon, Rahu, Ketu never go retrograde in this model)
  const RETRO_PLANETS: (keyof Snap)[] = ['budha', 'shukra', 'mangal', 'guru', 'shani'];

  for (let i = 1; i < N - 1; i++) {
    const jd  = fromJD - 1 + i; // current day JD
    const s0  = snaps[i - 1];   // yesterday
    const s1  = snaps[i];       // today
    const s2  = snaps[i + 1];   // tomorrow
    const ay  = s1.ayanamsha;

    // Skip if outside range
    const inRange = jd >= fromJD && jd <= toJD;

    // ── Sign transits ──────────────────────────────────────────────────
    if (inRange) {
      for (const planet of TRANSIT_PLANETS) {
        const sid0 = (s0[planet] as number - s0.ayanamsha + 360000) % 360;
        const sid1 = (s1[planet] as number - s1.ayanamsha + 360000) % 360;
        const sign0 = Math.floor(sid0 / 30) % 12;
        const sign1 = Math.floor(sid1 / 30) % 12;

        if (sign0 !== sign1) {
          // Avoid detecting rapid double-crossings (retrograde re-entry): confirm sign stays for >1 day
          const sid2 = (s2[planet] as number - s2.ayanamsha + 360000) % 360;
          const sign2 = Math.floor(sid2 / 30) % 12;
          if (sign2 === sign1 || planet === 'rahu') { // Rahu: always retrograde, sign changes are clear
            // Interpolate fraction within day
            const frac = interpolateCrossing(sid0, sid1, sign1 * 30);
            const transitJD = (fromJD - 1 + i - 1) + frac;
            events.push(signTransitEvent(planet as string, sign1, transitJD, today));
          }
        }
      }
    }

    // ── Retrograde / direct stations ───────────────────────────────────
    if (inRange) {
      for (const planet of RETRO_PLANETS) {
        const speed0 = angDiff(s0[planet] as number, s1[planet] as number);
        const speed1 = angDiff(s1[planet] as number, s2[planet] as number);

        if (speed0 > 0.002 && speed1 < -0.002) {
          // Retrograde starts (use mid-day estimate)
          events.push(retrogradeEvent(planet as string, true, jd + 0.5, today));
        } else if (speed0 < -0.002 && speed1 > 0.002) {
          // Direct motion resumes
          events.push(retrogradeEvent(planet as string, false, jd + 0.5, today));
        }
      }
    }

    // ── Solstices & Equinoxes (tropical Sun at 0, 90, 180, 270) ───────
    if (inRange) {
      for (const deg of [0, 90, 180, 270] as number[]) {
        const prev = s0.surya;
        const curr = s1.surya;
        // Check if Sun crossed `deg` in the right direction
        const dPrev = ((prev - deg + 360) % 360);
        const dCurr = ((curr - deg + 360) % 360);
        if (dPrev > 180 && dCurr < 180) {
          // Forward crossing
          const frac = interpolateCrossing(prev, curr, deg);
          const solJD = (fromJD - 1 + i - 1) + frac;
          events.push(solsticeEquinoxEvent(deg, solJD, today));
        }
      }
    }

    // ── Conjunctions / Oppositions between slow planets ────────────────
    if (inRange) {
      for (const [pA, pB] of CONJUNCTION_PAIRS) {
        const lonA0 = s0[pA as keyof Snap] as number;
        const lonA1 = s1[pA as keyof Snap] as number;
        const lonB0 = s0[pB as keyof Snap] as number;
        const lonB1 = s1[pB as keyof Snap] as number;

        const diff0 = angDiff(lonA0, lonB0);
        const diff1 = angDiff(lonA1, lonB1);

        // Conjunction (diff crosses 0)
        if (Math.abs(diff0) < 8 && Math.abs(diff1) < 8) {
          if (diff0 * diff1 <= 0 && Math.abs(diff0 - diff1) < 5) {
            const frac = diff0 / (diff0 - diff1);
            events.push(conjunctionEvent(pA, pB, jd - 1 + frac, today, false));
          }
        }

        // Opposition (diff crosses ±180)
        const opp0 = diff0 > 0 ? diff0 - 180 : diff0 + 180;
        const opp1 = diff1 > 0 ? diff1 - 180 : diff1 + 180;
        if (Math.abs(opp0) < 8 && Math.abs(opp1) < 8 && opp0 * opp1 <= 0) {
          const frac = opp0 / (opp0 - opp1);
          events.push(conjunctionEvent(pA, pB, jd - 1 + frac, today, true));
        }
      }
    }
  }

  // ── Known eclipses ────────────────────────────────────────────────────
  for (const eclipse of KNOWN_ECLIPSES) {
    const d = new Date(eclipse.dateISO + 'T12:00:00Z');
    const daysAway = Math.round((d.getTime() - todayMS) / 86400000);
    if (daysAway >= 0 && daysAway <= daysAhead) {
      events.push({ ...eclipse, daysAway });
    }
  }

  // Deduplicate by id, sort by date
  const seen = new Set<string>();
  const unique = events.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  return unique
    .filter(e => e.daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway || a.dateISO.localeCompare(b.dateISO));
}

// ── Formatting helpers ────────────────────────────────────────────────────

export function formatEventDateTime(e: PlanetaryEvent, tzOffsetHours = 5.5): string {
  const d = new Date(e.dateISO + 'T00:00:00Z');
  const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const totalMins = Math.round((e.timeUTC + tzOffsetHours) * 60) % 1440;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const ap = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return `${dateStr} · ${h12}:${String(m).padStart(2,'0')} ${ap} IST`;
}

export function formatCountdownLabel(daysAway: number): string {
  if (daysAway === 0) return 'Today';
  if (daysAway === 1) return 'Tomorrow';
  if (daysAway < 7)   return `${daysAway} Days`;
  if (daysAway < 30)  return `${Math.floor(daysAway / 7)}w ${daysAway % 7}d`;
  const months = Math.floor(daysAway / 30);
  const rem    = daysAway % 30;
  return rem > 0 ? `${months}m ${rem}d` : `${months} Month${months > 1 ? 's' : ''}`;
}
