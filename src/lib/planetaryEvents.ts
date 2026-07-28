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
  descriptionHi: string;
  significance: string; // Jyotish significance paragraph
  significanceHi: string;
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

const SOLSTICE_EQUINOX_META: Record<number, { title: string; titleHi: string; desc: string; descHi: string }> = {
  0:   { title: 'Vernal Equinox (Vasant Sampat)',   titleHi: 'वसंत सम्पात',   desc: 'Sun crosses celestial equator northward. Day and night of equal length.', descHi: 'सूर्य आकाशीय भूमध्य रेखा को उत्तर की ओर पार करता है। दिन और रात बराबर अवधि के होते हैं।' },
  90:  { title: 'Summer Solstice (Dakshinayan)',    titleHi: 'दक्षिणायन',      desc: 'Sun reaches its northernmost point. Longest day of the year. Start of Dakshinayana — Sun begins southward journey.', descHi: 'सूर्य अपने सबसे उत्तरी बिंदु पर पहुंचता है। वर्ष का सबसे लंबा दिन। दक्षिणायन का आरंभ — सूर्य दक्षिण की ओर यात्रा शुरू करता है।' },
  180: { title: 'Autumnal Equinox (Sharad Sampat)', titleHi: 'शरद सम्पात',    desc: 'Sun crosses celestial equator southward. Day and night of equal length.', descHi: 'सूर्य आकाशीय भूमध्य रेखा को दक्षिण की ओर पार करता है। दिन और रात बराबर अवधि के होते हैं।' },
  270: { title: 'Winter Solstice (Uttarayan)',      titleHi: 'उत्तरायण',       desc: 'Sun reaches its southernmost point. Shortest day. Start of Uttarayana — Sun begins northward journey. Auspicious half of the year begins.', descHi: 'सूर्य अपने सबसे दक्षिणी बिंदु पर पहुंचता है। वर्ष का सबसे छोटा दिन। उत्तरायण का आरंभ — सूर्य उत्तर की ओर यात्रा शुरू करता है। वर्ष का शुभ अर्धांश आरंभ होता है।' },
};

const CONJUNCTION_PAIRS: [string, string, string, string][] = [
  // [planetA, planetB, description_suffix, description_suffix_hi]
  ['guru',   'shani',  'a rare conjunction that marks major socio-political shifts in Jyotish', 'एक दुर्लभ युति जो ज्योतिष में बड़े सामाजिक-राजनीतिक बदलावों का संकेत देती है'],
  ['mangal', 'shani',  'a tense combination — energy meets restriction', 'एक तनावपूर्ण संयोजन — ऊर्जा का सामना संयम से होता है'],
  ['mangal', 'guru',   'an auspicious union of energy and wisdom', 'ऊर्जा और ज्ञान का एक शुभ मिलन'],
  ['mangal', 'shukra', 'an intense combination of passion and beauty', 'जुनून और सौंदर्य का एक तीव्र संयोजन'],
  ['guru',   'shukra', 'expansion meets harmony — generally auspicious', 'विस्तार का सामना सामंजस्य से होता है — सामान्यतः शुभ'],
  ['budha',  'shukra', 'intellect meets beauty — favourable for arts and communication', 'बुद्धि का सामना सौंदर्य से होता है — कला और संचार के लिए अनुकूल'],
  ['shani',  'rahu',   'a deeply karmic conjunction — caution advised', 'एक गहन कर्मिक युति — सावधानी की सलाह दी जाती है'],
  ['guru',   'rahu',   'Guru Chandala Yoga — wisdom tested by illusion', 'गुरु चांडाल योग — ज्ञान की परीक्षा भ्रम से होती है'],
];

// ── Hindi date formatting (weekday + month names, Latin numerals — matches
// the convention used elsewhere on the site, e.g. panchang.ts's vara table) ──
const WEEKDAY_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
const WEEKDAY_HI_SHORT = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
const MONTH_HI = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const MONTH_HI_SHORT = ['जन', 'फर', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];

// Uses local-time getters (not UTC) to match toLocaleDateString('en-IN', ...)'s
// default of rendering in the system's local timezone, so the Hindi and English
// date strings for the same event never disagree by a day.
function formatDateHiShort(d: Date): string {
  return `${WEEKDAY_HI_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_HI_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

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
  // Same noon-epoch-aware conversion as dateFromJD() above — JD's fractional part is 0 at
  // noon UTC, not midnight, so `(jd % 1) * 24` was off by 12h (Issue #6). Route through the
  // JS Date (which IS midnight-epoch) instead of doing the noon-offset arithmetic directly.
  const d = dateFromJD(jd);
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
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
    descriptionHi: `${pm.nameHi} ${formatDateHiShort(dateObj)} को ${rashi.nameHi} राशि में प्रवेश करेगा।`,
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
    significanceHi: planet === 'surya'
      ? `सूर्य संक्रांति — सूर्य का मासिक राशि परिवर्तन एक प्रमुख पंचांग घटना है। संक्रांति एक नए सौर महीने की शुरुआत का प्रतीक है और मौसम, कृषि, तथा महीने की व्यापक ऊर्जा को प्रभावित करती है। संक्रांति के दिन दान करना अत्यंत पुण्यदायी माना जाता है।`
      : planet === 'guru'
      ? `बृहस्पति का राशि परिवर्तन (गुरु पेयार्ची) लगभग हर वर्ष एक बार होने वाली प्रमुख ज्योतिषीय घटना है। गुरु सबसे बड़ा शुभ ग्रह है और इसकी राशि स्थिति अगले 12 महीनों के लिए सभी 12 राशियों के भाग्य, शिक्षा, संतान और आध्यात्मिक विकास को प्रबल रूप से प्रभावित करती है।`
      : planet === 'shani'
      ? `शनि का राशि परिवर्तन (शनि पेयार्ची) हर 2.5 वर्ष में होने वाली एक निर्णायक ज्योतिषीय घटना है। शनि कर्म, अनुशासन और जीवन के पाठों का स्वामी है। इसकी राशि स्थिति विभिन्न चंद्र राशियों के लिए साढ़े साती (7.5 वर्ष की अवधि) और अष्टम शनि (8वें भाव में शनि) का निर्धारण करती है।`
      : planet === 'rahu' || planet === 'ketu'
      ? `राहु-केतु अक्ष का हर 18 महीने में होने वाला परिवर्तन (पेयार्ची) ज्योतिष की सबसे महत्वपूर्ण घटनाओं में से एक है। ये नोड पिछले कर्म (केतु) और भविष्य की इच्छाओं (राहु) का प्रतिनिधित्व करते हैं। इनकी नई स्थिति 18 महीनों के लिए पूरे विश्व और प्रत्येक चंद्र राशि के कर्मिक केंद्र को आकार देती है।`
      : planet === 'mangal'
      ? `मंगल ऊर्जा, साहस और क्रिया का ग्रह है। इसका हर 45–75 दिनों में होने वाला राशि परिवर्तन सामूहिक प्रेरणा और आक्रामकता को प्रभावित करता है। यह संपत्ति, भाई-बहन, सैन्य मामलों और शारीरिक ऊर्जा के लिए महत्वपूर्ण है।`
      : `${pm.nameHi} का ${rashi.nameHi} राशि में गोचर सभी राशियों के लिए ${rashi.nameHi}-संबंधित विषयों को प्रभावित करने वाली ग्रह ऊर्जा में बदलाव लाता है। भाव-विशेष परिणामों के लिए इस गोचर को अपनी व्यक्तिगत कुंडली पर जांचें।`,
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

  const significanceHi = isStart
    ? `${pm.nameHi} वक्री होता है — पृथ्वी से देखने पर यह पीछे की ओर गति करता प्रतीत होता है। ज्योतिष में, वक्री ग्रहों की ऊर्जा तीव्र और अंतर्मुखी हो जाती है। ${planet === 'budha' ? 'बुध वक्री देरी, गलतफहमी और तकनीकी गड़बड़ियों के लिए कुख्यात है। इस अवधि में अनुबंध पर हस्ताक्षर करने, नई परियोजनाएं शुरू करने, या बड़े निर्णय लेने से बचें। समीक्षा, पुनरावलोकन और चिंतन के लिए यह अच्छा समय है।' : planet === 'shukra' ? 'शुक्र वक्री हर 18 महीने में होता है और लगभग 40 दिनों तक रहता है। यह रिश्तों, वित्त और सौंदर्य संबंधी मूल्यों पर पुनर्विचार का समय है। पुराने रिश्ते फिर से सामने आ सकते हैं। विलासिता की खरीदारी और कॉस्मेटिक प्रक्रियाओं से बचें।' : planet === 'mangal' ? 'मंगल वक्री हर 26 महीने में होता है और लगभग 72 दिनों तक रहता है। ऊर्जा अंतर्मुखी हो जाती है — परियोजनाएं धीमी हो जाती हैं, विवाद अप्रत्याशित मोड़ लेते हैं। आक्रामक नई पहलों के बजाय इस समय का उपयोग आंतरिक कार्य के लिए करें।' : `${pm.nameHi} वक्री इसके प्रभावों को अंतर्मुखी बनाता है। ${pm.nameHi}-संबंधित विषयों की समीक्षा, पुनर्विचार और गहन चिंतन का समय है।`}`
    : `${pm.nameHi} मार्गी होता है — वक्री अवधि के बाद पुनः आगे की गति में लौटता है। ऊर्जा फिर से बहिर्मुखी होने लगती है। जो योजनाएं विलंबित या रुकी हुई थीं, वे अब आगे बढ़ सकती हैं। यह एक क्रमिक पुनरारंभ है, तत्काल नहीं — पूर्ण गति के लिए 2 सप्ताह का समय दें।`;

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
    descriptionHi: `${pm.nameHi} ${formatDateHiShort(dateObj)} को ${isStart ? 'वक्री गति आरंभ' : 'मार्गी गति पुनः आरंभ'} करेगा।`,
    significance,
    significanceHi,
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
    descriptionHi: `${pmA.nameHi} और ${pmB.nameHi} ${formatDateHiShort(dateObj)} को ${isOpposition ? 'प्रतियुति (180°)' : 'युति (0°)'} में हैं।`,
    significance: suffix
      ? `${pmA.name}–${pmB.name} ${isOpposition ? 'opposition' : 'conjunction'}: ${suffix[2]}. Planets in ${isOpposition ? 'opposition face off across signs' : 'conjunction blend their energies in the same degree'}, intensifying their combined significations in your natal chart.`
      : `This ${isOpposition ? 'opposition' : 'conjunction'} between ${pmA.name} and ${pmB.name} marks an important moment of peak energy/tension between their significations. Watch themes related to both planets closely.`,
    significanceHi: suffix
      ? `${pmA.nameHi}–${pmB.nameHi} ${isOpposition ? 'प्रतियुति' : 'युति'}: ${suffix[3]}। ${isOpposition ? 'प्रतियुति में ग्रह राशियों के आर-पार आमने-सामने होते हैं' : 'युति में ग्रह एक ही अंश में अपनी ऊर्जाओं का मिश्रण करते हैं'}, जिससे आपकी जन्म कुंडली में उनके संयुक्त प्रभाव तीव्र हो जाते हैं।`
      : `${pmA.nameHi} और ${pmB.nameHi} के बीच यह ${isOpposition ? 'प्रतियुति' : 'युति'} उनके प्रभावों के बीच चरम ऊर्जा/तनाव के एक महत्वपूर्ण क्षण को चिह्नित करती है। दोनों ग्रहों से जुड़े विषयों पर बारीकी से नज़र रखें।`,
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
    descriptionHi: meta.descHi,
    significance: `${meta.title} is an important astronomical transition. ${meta.desc} In Jyotish, the Uttarayan (start of northward journey) and Dakshinayan (start of southward journey) mark auspicious and inauspicious halves of the year respectively. The two equinoxes are solar midpoints.`,
    significanceHi: `${meta.titleHi} एक महत्वपूर्ण खगोलीय संक्रमण है। ${meta.descHi} ज्योतिष में, उत्तरायण (उत्तर की ओर यात्रा का आरंभ) और दक्षिणायन (दक्षिण की ओर यात्रा का आरंभ) क्रमशः वर्ष के शुभ और अशुभ अर्धांशों को चिह्नित करते हैं। दोनों विषुव सौर मध्यबिंदु हैं।`,
  };
}

function eclipseEvent(
  type: 'solar_eclipse' | 'lunar_eclipse',
  title: string, titleHi: string,
  dateISO: string, timeUTC: number,
  today: Date, desc: string, descHi: string,
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
    descriptionHi: descHi,
    significance: type === 'solar_eclipse'
      ? 'Surya Grahan (Solar Eclipse) occurs on a New Moon (Amavasya) when the Moon passes between Earth and Sun near the Rahu/Ketu axis. In Jyotish, eclipses are considered intensely karmic events. Mantras, meditation, and charitable giving during the eclipse are considered very powerful. Avoid eating during the eclipse window.'
      : 'Chandra Grahan (Lunar Eclipse) occurs on a Full Moon (Purnima) when Earth\'s shadow falls on the Moon near the Rahu/Ketu axis. The eclipse amplifies emotional and karmic energies. Traditionally, temples close during grahan, and bathing in holy rivers afterward is considered purifying. Pregnant women are advised to stay indoors.',
    significanceHi: type === 'solar_eclipse'
      ? 'सूर्य ग्रहण अमावस्या को होता है जब चंद्रमा राहु/केतु अक्ष के निकट पृथ्वी और सूर्य के बीच से गुजरता है। ज्योतिष में, ग्रहणों को अत्यंत कर्मिक घटनाएं माना जाता है। ग्रहण के दौरान मंत्र, ध्यान और दान अत्यंत प्रभावी माने जाते हैं। ग्रहण काल में भोजन करने से बचें।'
      : 'चंद्र ग्रहण पूर्णिमा को होता है जब पृथ्वी की छाया राहु/केतु अक्ष के निकट चंद्रमा पर पड़ती है। यह ग्रहण भावनात्मक और कर्मिक ऊर्जाओं को बढ़ाता है। परंपरागत रूप से, ग्रहण के दौरान मंदिर बंद रहते हैं, और बाद में पवित्र नदियों में स्नान करना शुद्धिकारी माना जाता है। गर्भवती महिलाओं को घर के अंदर रहने की सलाह दी जाती है।',
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
    descriptionHi: 'होली पूर्णिमा को एशिया, अफ्रीका, यूरोप में दिखाई देने वाला पूर्ण चंद्र ग्रहण।',
    significance: 'Chandra Grahan (Lunar Eclipse) occurs on a Full Moon (Purnima) when Earth\'s shadow falls on the Moon near the Rahu/Ketu axis. This eclipse coincides with Holi Purnima — an exceptionally powerful event. The eclipse amplifies emotional and karmic energies. Bathing in holy rivers afterward is considered purifying.',
    significanceHi: 'चंद्र ग्रहण पूर्णिमा को होता है जब पृथ्वी की छाया राहु/केतु अक्ष के निकट चंद्रमा पर पड़ती है। यह ग्रहण होली पूर्णिमा के साथ मेल खाता है — एक असाधारण रूप से शक्तिशाली घटना। यह ग्रहण भावनात्मक और कर्मिक ऊर्जाओं को बढ़ाता है। बाद में पवित्र नदियों में स्नान करना शुद्धिकारी माना जाता है।',
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
    descriptionHi: 'चैत्र अमावस्या को आंशिक सूर्य ग्रहण। उत्तर-पश्चिमी यूरोप और उत्तरी अफ्रीका में दिखाई देगा।',
    significance: 'Surya Grahan on Amavasya — the Moon passes between Earth and Sun near the Rahu/Ketu axis. A spiritually potent Amavasya. Avoid eating during the eclipse window; mantras and charity are considered highly effective.',
    significanceHi: 'अमावस्या को सूर्य ग्रहण — चंद्रमा राहु/केतु अक्ष के निकट पृथ्वी और सूर्य के बीच से गुजरता है। यह एक आध्यात्मिक रूप से शक्तिशाली अमावस्या है। ग्रहण काल में भोजन करने से बचें; मंत्र और दान अत्यंत प्रभावी माने जाते हैं।',
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
    descriptionHi: 'भाद्रपद पूर्णिमा को पूर्ण चंद्र ग्रहण — भारत, एशिया, यूरोप और अफ्रीका से दिखाई देगा।',
    significance: 'Total Chandra Grahan visible across India. The Moon turns blood-red during totality. Temples traditionally close during the grahan period. Mantras, especially the Mahamrityunjaya Mantra, recited during this time are considered exceptionally potent.',
    significanceHi: 'भारत भर में दिखाई देने वाला पूर्ण चंद्र ग्रहण। पूर्णता के दौरान चंद्रमा रक्त-लाल हो जाता है। ग्रहण काल में परंपरागत रूप से मंदिर बंद रहते हैं। इस समय जप किए गए मंत्र, विशेष रूप से महामृत्युंजय मंत्र, अत्यंत प्रभावी माने जाते हैं।',
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
    descriptionHi: 'दक्षिणी ऑस्ट्रेलिया और अंटार्कटिका में दिखाई देने वाला आंशिक सूर्य ग्रहण।',
    significance: 'Surya Grahan on Ashwin Amavasya — not visible from India, but the karmic intensity of the eclipse period applies. Avoid important new beginnings on this day.',
    significanceHi: 'आश्विन अमावस्या को सूर्य ग्रहण — भारत से दिखाई नहीं देगा, लेकिन ग्रहण काल की कर्मिक तीव्रता लागू होती है। इस दिन महत्वपूर्ण नई शुरुआतों से बचें।',
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
    descriptionHi: 'माघ अमावस्या को वलयाकार सूर्य ग्रहण ("अग्नि वलय")। अंटार्कटिका और दक्षिणी दक्षिण अमेरिका से दिखाई देगा।',
    significance: 'Surya Grahan on Magha Amavasya. In Jyotish, this eclipse near the Ketu end of the axis emphasizes past karma, spiritual liberation, and letting go. A powerful time for ancestral prayers (Pitru Tarpan).',
    significanceHi: 'माघ अमावस्या को सूर्य ग्रहण। ज्योतिष में, अक्ष के केतु छोर के निकट यह ग्रहण पिछले कर्म, आध्यात्मिक मुक्ति और त्याग पर बल देता है। पितृ तर्पण के लिए एक शक्तिशाली समय।',
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
    descriptionHi: 'ग्रीनलैंड, आइसलैंड, स्पेन और उत्तरी अफ्रीका में दिखाई देने वाला पूर्ण सूर्य ग्रहण। यूरोप और मध्य पूर्व में आंशिक रूप से दिखाई देगा।',
    significance: 'Total Surya Grahan — one of the most dramatic astronomical events. The path of totality crosses Europe. In Jyotish, a total solar eclipse is an extremely significant karmic event. Avoid eating, starting new ventures, or important decisions on this day. Extended fasting, prayer, and donation (danam) yield amplified merit.',
    significanceHi: 'पूर्ण सूर्य ग्रहण — सबसे नाटकीय खगोलीय घटनाओं में से एक। पूर्णता का पथ यूरोप से होकर गुजरता है। ज्योतिष में, पूर्ण सूर्य ग्रहण एक अत्यंत महत्वपूर्ण कर्मिक घटना है। इस दिन भोजन करने, नए उद्यम शुरू करने, या महत्वपूर्ण निर्णय लेने से बचें। विस्तारित उपवास, प्रार्थना और दान से बढ़ा हुआ पुण्य मिलता है।',
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
    descriptionHi: 'भाद्रपद पूर्णिमा को एशिया, ऑस्ट्रेलिया, प्रशांत और अमेरिका से दिखाई देने वाला आंशिक चंद्र ग्रहण।',
    significance: 'Partial Chandra Grahan on Purnima. A penumbral or partial eclipse still carries karmic weight in Jyotish. The traditional grahan rules (no food, prayer, post-eclipse bath) apply even for partial eclipses.',
    significanceHi: 'पूर्णिमा को आंशिक चंद्र ग्रहण। उपच्छाया या आंशिक ग्रहण भी ज्योतिष में कर्मिक महत्व रखता है। परंपरागत ग्रहण नियम (भोजन न करना, प्रार्थना, ग्रहण बाद स्नान) आंशिक ग्रहणों पर भी लागू होते हैं।',
  },
  {
    id: 'lunar-eclipse-2026-03-03',
    type: 'lunar_eclipse',
    icon: '🌕',
    badgeColor: '#1e1b4b',
    title: 'Total Lunar Eclipse (Chandra Grahan)',
    titleHi: 'पूर्ण चंद्र ग्रहण',
    label: 'Lunar Eclipse',
    labelHi: 'चंद्र ग्रहण',
    dateISO: '2026-03-03',
    timeUTC: 11.56,
    planets: ['chandra', 'rahu'],
    description: 'Total lunar eclipse on Purnima, widely visible from Asia (including India), Australia, and the Americas.',
    descriptionHi: 'पूर्णिमा को पूर्ण चंद्र ग्रहण, एशिया (भारत सहित), ऑस्ट्रेलिया और अमेरिका से व्यापक रूप से दिखाई देगा।',
    significance: 'Total Chandra Grahan on Purnima, visible from India. The Moon turns blood-red during totality. Temples traditionally close during the grahan period, and mantras recited during this time are considered exceptionally potent.',
    significanceHi: 'पूर्णिमा को पूर्ण चंद्र ग्रहण, भारत से दिखाई देगा। पूर्णता के दौरान चंद्रमा रक्त-लाल हो जाता है। ग्रहण काल में परंपरागत रूप से मंदिर बंद रहते हैं, और इस समय जप किए गए मंत्र अत्यंत प्रभावी माने जाते हैं।',
  },
  {
    id: 'solar-eclipse-2027-02-06',
    type: 'solar_eclipse',
    icon: '🌑',
    badgeColor: '#1e1b4b',
    title: 'Annular Solar Eclipse (Surya Grahan)',
    titleHi: 'वलयाकार सूर्य ग्रहण',
    label: 'Solar Eclipse',
    labelHi: 'सूर्य ग्रहण',
    dateISO: '2027-02-06',
    timeUTC: 16.01,
    planets: ['surya', 'chandra', 'rahu'],
    description: 'Annular solar eclipse ("ring of fire") on Amavasya. Path of annularity crosses South America and West Africa; not visible from India.',
    descriptionHi: 'अमावस्या को वलयाकार सूर्य ग्रहण ("अग्नि वलय")। वलयाकारता का पथ दक्षिण अमेरिका और पश्चिम अफ्रीका से होकर गुजरता है; भारत से दिखाई नहीं देगा।',
    significance: 'Surya Grahan on Amavasya. Not visible from India, but the karmic intensity of the eclipse period still applies in Jyotish — avoid important new beginnings on this day.',
    significanceHi: 'अमावस्या को सूर्य ग्रहण। भारत से दिखाई नहीं देगा, लेकिन ज्योतिष में ग्रहण काल की कर्मिक तीव्रता फिर भी लागू होती है — इस दिन महत्वपूर्ण नई शुरुआतों से बचें।',
  },
  {
    id: 'lunar-eclipse-2027-02-20',
    type: 'lunar_eclipse',
    icon: '🌕',
    badgeColor: '#1e1b4b',
    title: 'Penumbral Lunar Eclipse (Chandra Grahan)',
    titleHi: 'उपच्छाया चंद्र ग्रहण',
    label: 'Lunar Eclipse',
    labelHi: 'चंद्र ग्रहण',
    dateISO: '2027-02-20',
    timeUTC: 23.21,
    planets: ['chandra', 'rahu'],
    description: 'Penumbral lunar eclipse on Purnima — the Moon passes only through Earth\'s outer shadow, producing a subtle dimming rather than visible darkening.',
    descriptionHi: 'पूर्णिमा को उपच्छाया चंद्र ग्रहण — चंद्रमा केवल पृथ्वी की बाहरी छाया से गुजरता है, जिससे स्पष्ट अंधकार के बजाय हल्की धुंधलाहट होती है।',
    significance: 'Penumbral Chandra Grahan — a mild eclipse where the Moon only enters Earth\'s faint outer shadow. Traditional grahan observances are far less strict for penumbral eclipses, though the Purnima itself remains spiritually significant.',
    significanceHi: 'उपच्छाया चंद्र ग्रहण — एक हल्का ग्रहण जिसमें चंद्रमा केवल पृथ्वी की हल्की बाहरी छाया में प्रवेश करता है। उपच्छाया ग्रहणों के लिए परंपरागत ग्रहण नियम बहुत कम कठोर हैं, हालांकि पूर्णिमा स्वयं आध्यात्मिक रूप से महत्वपूर्ण बनी रहती है।',
  },
  {
    id: 'lunar-eclipse-2027-07-18',
    type: 'lunar_eclipse',
    icon: '🌕',
    badgeColor: '#1e1b4b',
    title: 'Penumbral Lunar Eclipse (Chandra Grahan)',
    titleHi: 'उपच्छाया चंद्र ग्रहण',
    label: 'Lunar Eclipse',
    labelHi: 'चंद्र ग्रहण',
    dateISO: '2027-07-18',
    timeUTC: 16.05,
    planets: ['chandra', 'rahu'],
    description: 'Extremely shallow penumbral lunar eclipse on Purnima — the Moon barely clips Earth\'s outer shadow and the dimming is imperceptible to the naked eye.',
    descriptionHi: 'पूर्णिमा को अत्यंत हल्का उपच्छाया चंद्र ग्रहण — चंद्रमा पृथ्वी की बाहरी छाया को मुश्किल से छूता है और धुंधलाहट नंगी आंखों से अगोचर होती है।',
    significance: 'A very marginal penumbral Chandra Grahan, essentially unobservable without instruments. Included here for completeness of the Rahu-Ketu axis timeline rather than for any visible or practical grahan observance.',
    significanceHi: 'एक अत्यंत मामूली उपच्छाया चंद्र ग्रहण, जो उपकरणों के बिना मूलतः अवलोकन योग्य नहीं है। इसे किसी दृश्य या व्यावहारिक ग्रहण पालन के बजाय राहु-केतु अक्ष की समयरेखा की पूर्णता के लिए शामिल किया गया है।',
  },
  {
    id: 'solar-eclipse-2027-08-02',
    type: 'solar_eclipse',
    icon: '🌑',
    badgeColor: '#1e1b4b',
    title: 'Total Solar Eclipse (Surya Grahan)',
    titleHi: 'पूर्ण सूर्य ग्रहण',
    label: 'Solar Eclipse',
    labelHi: 'सूर्य ग्रहण',
    dateISO: '2027-08-02',
    timeUTC: 10.13,
    planets: ['surya', 'chandra', 'rahu'],
    description: 'Total solar eclipse on Amavasya with a maximum totality of over 6 minutes — one of the longest total solar eclipses of the century. Path crosses North Africa and the Middle East, including Egypt and Saudi Arabia.',
    descriptionHi: 'अमावस्या को पूर्ण सूर्य ग्रहण, जिसकी अधिकतम पूर्णता 6 मिनट से अधिक है — इस शताब्दी के सबसे लंबे पूर्ण सूर्य ग्रहणों में से एक। पथ उत्तरी अफ्रीका और मध्य पूर्व, जिसमें मिस्र और सऊदी अरब शामिल हैं, से होकर गुजरता है।',
    significance: 'Total Surya Grahan — an extremely significant karmic event given its unusually long totality. In Jyotish, total solar eclipses call for avoiding eating, starting new ventures, or important decisions on this day. Extended fasting, prayer, and donation (danam) yield amplified merit.',
    significanceHi: 'पूर्ण सूर्य ग्रहण — इसकी असामान्य रूप से लंबी पूर्णता को देखते हुए एक अत्यंत महत्वपूर्ण कर्मिक घटना। ज्योतिष में, पूर्ण सूर्य ग्रहण इस दिन भोजन करने, नए उद्यम शुरू करने, या महत्वपूर्ण निर्णय लेने से बचने का आह्वान करते हैं। विस्तारित उपवास, प्रार्थना और दान से बढ़ा हुआ पुण्य मिलता है।',
  },
  {
    id: 'lunar-eclipse-2027-08-17',
    type: 'lunar_eclipse',
    icon: '🌕',
    badgeColor: '#1e1b4b',
    title: 'Penumbral Lunar Eclipse (Chandra Grahan)',
    titleHi: 'उपच्छाया चंद्र ग्रहण',
    label: 'Lunar Eclipse',
    labelHi: 'चंद्र ग्रहण',
    dateISO: '2027-08-17',
    timeUTC: 7.23,
    planets: ['chandra', 'rahu'],
    description: 'Penumbral lunar eclipse on Purnima — the Moon passes only through Earth\'s outer shadow, producing a subtle dimming rather than visible darkening.',
    descriptionHi: 'पूर्णिमा को उपच्छाया चंद्र ग्रहण — चंद्रमा केवल पृथ्वी की बाहरी छाया से गुजरता है, जिससे स्पष्ट अंधकार के बजाय हल्की धुंधलाहट होती है।',
    significance: 'Penumbral Chandra Grahan — a mild eclipse where the Moon only enters Earth\'s faint outer shadow. Traditional grahan observances are far less strict for penumbral eclipses, though the Purnima itself remains spiritually significant.',
    significanceHi: 'उपच्छाया चंद्र ग्रहण — एक हल्का ग्रहण जिसमें चंद्रमा केवल पृथ्वी की हल्की बाहरी छाया में प्रवेश करता है। उपच्छाया ग्रहणों के लिए परंपरागत ग्रहण नियम बहुत कम कठोर हैं, हालांकि पूर्णिमा स्वयं आध्यात्मिक रूप से महत्वपूर्ण बनी रहती है।',
  },
];
// Coverage: verified against Wikipedia/EclipseWise (NASA-derived) eclipse predictions through 2027-08-17 only.
// Events past that date will silently stop appearing — extend this table before then rather than assuming no eclipses are occurring.

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

        // Candidate-detection gate: a station is a sign change in daily angular velocity
        // (speed0/speed1 straddle zero), not a fixed magnitude cutoff. A fixed 0.002°/day
        // threshold worked for fast movers (Mercury/Venus) but was too tight for Mars/
        // Jupiter/Saturn, whose velocity near the true station point can be much smaller
        // (e.g. ~0.0005°/day) — those planets' stations never crossed the old gate at all.
        // Sign-change detection is robust across all five RETRO_PLANETS regardless of how
        // slowly each one moves near its station; the exact station moment is still found
        // by the same zero-crossing interpolation as before (Issue #7).
        if (speed0 > 0 && speed1 < 0) {
          // Retrograde starts — interpolate the actual station moment (velocity zero-crossing).
          // speed0 is the velocity over [jd-1, jd] (≈ velocity at jd-0.5); speed1 is the velocity
          // over [jd, jd+1] (≈ velocity at jd+0.5). Linear-interpolate between those two samples,
          // same technique interpolateCrossing() uses for longitude boundary crossings above.
          const frac = speed0 / (speed0 - speed1);
          const stationJD = (jd - 0.5) + frac;
          events.push(retrogradeEvent(planet as string, true, stationJD, today));
        } else if (speed0 < 0 && speed1 > 0) {
          // Direct motion resumes — same interpolation
          const frac = speed0 / (speed0 - speed1);
          const stationJD = (jd - 0.5) + frac;
          events.push(retrogradeEvent(planet as string, false, stationJD, today));
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

export function formatEventDateTime(e: PlanetaryEvent, tzOffsetHours = 5.5, hindi = false): string {
  const d = new Date(e.dateISO + 'T00:00:00Z');
  // When the tz-adjusted time rolls past midnight (or before it), shift the displayed
  // date by the same number of days — otherwise the date string and time string can
  // describe two different real moments (Issue #8).
  const rawMins = Math.round((e.timeUTC + tzOffsetHours) * 60);
  const dayOffset = Math.floor(rawMins / 1440);
  const totalMins = ((rawMins % 1440) + 1440) % 1440;
  if (dayOffset !== 0) d.setUTCDate(d.getUTCDate() + dayOffset);
  const dateStr = hindi
    ? `${WEEKDAY_HI_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_HI_SHORT[d.getMonth()]} ${d.getFullYear()}`
    : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
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
