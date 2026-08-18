// jyotish.ts — shared data + calculation library for Jyotish / Astrology calculators.
// Corrected 2026-08-18: contrary to this file's old note, static Astro's client <script>
// blocks CAN import from local .ts modules (see CLAUDE.md's Critical Gotchas) — most of this
// file's calculation math historically lived duplicated inline in each page's <script> block
// instead, which is exactly the divergence risk the SEO-prerender rollout is retiring page by
// page. Pancha Pakshi's engine below is the first calculation logic added directly here.

import { sunriseUTC, moonLongitude, lahiriAyanamsha } from './panchang';

export interface Nakshatra {
  n: string;        // English name
  h: string;        // Hindi name
  lord: string;     // planetary lord
  yoni: string;     // animal symbol
  gana: string;     // Deva / Manushya / Rakshasa
  nadi: string;     // Adi / Madhya / Antya
  varna: string;    // Brahmin / Kshatriya / Vaishya / Shudra / Mleccha
  deity: string;    // presiding deity
  symbol: string;   // symbol / motif
  p: string[];      // 4 pada starting syllables
}

export const NAKSHATRAS: Nakshatra[] = [
  { n: 'Ashwini', h: 'अश्विनी', lord: 'Ketu', yoni: 'Horse', gana: 'Deva', nadi: 'Adi', varna: 'Vaishya', deity: 'Ashwini Kumaras', symbol: 'Horse\'s head', p: ['Chu', 'Che', 'Cho', 'La'] },
  { n: 'Bharani', h: 'भरणी', lord: 'Venus', yoni: 'Elephant', gana: 'Manushya', nadi: 'Madhya', varna: 'Mleccha', deity: 'Yama', symbol: 'Yoni', p: ['Li', 'Lu', 'Le', 'Lo'] },
  { n: 'Krittika', h: 'कृत्तिका', lord: 'Sun', yoni: 'Sheep', gana: 'Rakshasa', nadi: 'Antya', varna: 'Brahmin', deity: 'Agni', symbol: 'Razor / Flame', p: ['A', 'I', 'U', 'E'] },
  { n: 'Rohini', h: 'रोहिणी', lord: 'Moon', yoni: 'Serpent', gana: 'Manushya', nadi: 'Antya', varna: 'Shudra', deity: 'Brahma', symbol: 'Chariot / Ox cart', p: ['O', 'Va', 'Vi', 'Vu'] },
  { n: 'Mrigashira', h: 'मृगशिरा', lord: 'Mars', yoni: 'Serpent', gana: 'Deva', nadi: 'Madhya', varna: 'Vaishya', deity: 'Soma', symbol: 'Deer\'s head', p: ['Ve', 'Vo', 'Ka', 'Ki'] },
  { n: 'Ardra', h: 'आर्द्रा', lord: 'Rahu', yoni: 'Dog', gana: 'Manushya', nadi: 'Adi', varna: 'Mleccha', deity: 'Rudra', symbol: 'Teardrop', p: ['Ku', 'Gha', 'Ing', 'Ja'] },
  { n: 'Punarvasu', h: 'पुनर्वसु', lord: 'Jupiter', yoni: 'Cat', gana: 'Deva', nadi: 'Adi', varna: 'Brahmin', deity: 'Aditi', symbol: 'Quiver of arrows', p: ['Ke', 'Ko', 'Ha', 'Hi'] },
  { n: 'Pushya', h: 'पुष्य', lord: 'Saturn', yoni: 'Sheep', gana: 'Deva', nadi: 'Madhya', varna: 'Kshatriya', deity: 'Brihaspati', symbol: 'Cow\'s udder / Lotus', p: ['Hu', 'He', 'Ho', 'Da'] },
  { n: 'Ashlesha', h: 'अश्लेषा', lord: 'Mercury', yoni: 'Cat', gana: 'Rakshasa', nadi: 'Antya', varna: 'Mleccha', deity: 'Nagas', symbol: 'Coiled serpent', p: ['Di', 'Du', 'De', 'Do'] },
  { n: 'Magha', h: 'मघा', lord: 'Ketu', yoni: 'Rat', gana: 'Rakshasa', nadi: 'Antya', varna: 'Shudra', deity: 'Pitris', symbol: 'Royal throne', p: ['Ma', 'Mi', 'Mu', 'Me'] },
  { n: 'Purva Phalguni', h: 'पूर्व फाल्गुनी', lord: 'Venus', yoni: 'Rat', gana: 'Manushya', nadi: 'Madhya', varna: 'Brahmin', deity: 'Bhaga', symbol: 'Front legs of bed', p: ['Mo', 'Ta', 'Ti', 'Tu'] },
  { n: 'Uttara Phalguni', h: 'उत्तर फाल्गुनी', lord: 'Sun', yoni: 'Cow', gana: 'Manushya', nadi: 'Antya', varna: 'Kshatriya', deity: 'Aryaman', symbol: 'Back legs of bed', p: ['Te', 'To', 'Pa', 'Pi'] },
  { n: 'Hasta', h: 'हस्त', lord: 'Moon', yoni: 'Buffalo', gana: 'Deva', nadi: 'Adi', varna: 'Vaishya', deity: 'Savitar', symbol: 'Hand / Fist', p: ['Pu', 'Sha', 'Na', 'Tha'] },
  { n: 'Chitra', h: 'चित्रा', lord: 'Mars', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Kshatriya', deity: 'Vishwakarma', symbol: 'Bright jewel / Pearl', p: ['Pe', 'Po', 'Ra', 'Ri'] },
  { n: 'Swati', h: 'स्वाती', lord: 'Rahu', yoni: 'Buffalo', gana: 'Deva', nadi: 'Adi', varna: 'Mleccha', deity: 'Vayu', symbol: 'Coral / Young shoot', p: ['Ru', 'Re', 'Ro', 'Ta'] },
  { n: 'Vishakha', h: 'विशाखा', lord: 'Jupiter', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Brahmin', deity: 'Indra-Agni', symbol: 'Triumphal gateway', p: ['Ti', 'Tu', 'Te', 'To'] },
  { n: 'Anuradha', h: 'अनुराधा', lord: 'Saturn', yoni: 'Deer', gana: 'Deva', nadi: 'Adi', varna: 'Kshatriya', deity: 'Mitra', symbol: 'Lotus / Staff', p: ['Na', 'Ni', 'Nu', 'Ne'] },
  { n: 'Jyeshtha', h: 'ज्येष्ठा', lord: 'Mercury', yoni: 'Deer', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Brahmin', deity: 'Indra', symbol: 'Circular amulet', p: ['No', 'Ya', 'Yi', 'Yu'] },
  { n: 'Mula', h: 'मूल', lord: 'Ketu', yoni: 'Dog', gana: 'Rakshasa', nadi: 'Antya', varna: 'Mleccha', deity: 'Nirriti', symbol: 'Tied roots', p: ['Ye', 'Yo', 'Bha', 'Bhi'] },
  { n: 'Purva Ashadha', h: 'पूर्वाषाढा', lord: 'Venus', yoni: 'Monkey', gana: 'Manushya', nadi: 'Adi', varna: 'Brahmin', deity: 'Apas', symbol: 'Elephant tusk / Fan', p: ['Bhu', 'Dha', 'Bha', 'Pha'] },
  { n: 'Uttara Ashadha', h: 'उत्तराषाढा', lord: 'Sun', yoni: 'Mongoose', gana: 'Manushya', nadi: 'Madhya', varna: 'Kshatriya', deity: 'Vishvadevas', symbol: 'Elephant tusk / Planks', p: ['Bhe', 'Bho', 'Ja', 'Ji'] },
  { n: 'Shravana', h: 'श्रवण', lord: 'Moon', yoni: 'Monkey', gana: 'Deva', nadi: 'Antya', varna: 'Mleccha', deity: 'Vishnu', symbol: 'Three footprints / Ear', p: ['Khi', 'Khu', 'Khe', 'Kho'] },
  { n: 'Dhanishtha', h: 'धनिष्ठा', lord: 'Mars', yoni: 'Lion', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Shudra', deity: 'Vasus', symbol: 'Drum / Flute', p: ['Ga', 'Gi', 'Gu', 'Ge'] },
  { n: 'Shatabhisha', h: 'शतभिषा', lord: 'Rahu', yoni: 'Horse', gana: 'Rakshasa', nadi: 'Adi', varna: 'Mleccha', deity: 'Varuna', symbol: 'Empty circle / 100 healers', p: ['Go', 'Sa', 'Si', 'Su'] },
  { n: 'Purva Bhadrapada', h: 'पूर्वभाद्रपदा', lord: 'Jupiter', yoni: 'Lion', gana: 'Manushya', nadi: 'Madhya', varna: 'Brahmin', deity: 'Aja Ekapada', symbol: 'Front of funeral cot', p: ['Se', 'So', 'Da', 'Di'] },
  { n: 'Uttara Bhadrapada', h: 'उत्तरभाद्रपदा', lord: 'Saturn', yoni: 'Cow', gana: 'Manushya', nadi: 'Antya', varna: 'Kshatriya', deity: 'Ahir Budhnya', symbol: 'Back of funeral cot / Snake', p: ['Du', 'Tha', 'Jha', 'Nya'] },
  { n: 'Revati', h: 'रेवती', lord: 'Mercury', yoni: 'Elephant', gana: 'Deva', nadi: 'Antya', varna: 'Brahmin', deity: 'Pushan', symbol: 'Fish / Drum', p: ['De', 'Do', 'Cha', 'Chi'] },
];

export interface Gemstone {
  planet: string;
  p: string;        // Sanskrit planet name
  name: string;     // gemstone English
  nameHi: string;   // gemstone Hindi
  substitute: string;
  metal: string;
  finger: string;
  day: string;
  color: string;
  desc: string;
}

export const GEMSTONES: Gemstone[] = [
  { planet: 'Sun', p: 'Surya', name: 'Ruby', nameHi: 'माणिक्य', substitute: 'Red Garnet', metal: 'Gold', finger: 'Ring', day: 'Sunday', color: '#dc2626', desc: 'Enhances leadership, vitality, and confidence. Recommended for a weak Sun.' },
  { planet: 'Moon', p: 'Chandra', name: 'Pearl', nameHi: 'मोती', substitute: 'Moonstone', metal: 'Silver', finger: 'Little', day: 'Monday', color: '#6366f1', desc: 'Brings emotional stability, clarity of mind, and strengthens intuition.' },
  { planet: 'Mars', p: 'Mangal', name: 'Red Coral', nameHi: 'मूंगा', substitute: 'Red Carnelian', metal: 'Gold/Copper', finger: 'Ring', day: 'Tuesday', color: '#f97316', desc: 'Boosts courage, energy, and helps overcome obstacles and enemies.' },
  { planet: 'Mercury', p: 'Budha', name: 'Emerald', nameHi: 'पन्ना', substitute: 'Green Tourmaline', metal: 'Gold', finger: 'Little', day: 'Wednesday', color: '#10b981', desc: 'Improves intellect, communication, business acumen, and memory.' },
  { planet: 'Jupiter', p: 'Guru', name: 'Yellow Sapphire', nameHi: 'पुखराज', substitute: 'Yellow Topaz / Citrine', metal: 'Gold', finger: 'Index', day: 'Thursday', color: '#f59e0b', desc: 'Brings wisdom, prosperity, good fortune, and spiritual growth.' },
  { planet: 'Venus', p: 'Shukra', name: 'Diamond', nameHi: 'हीरा', substitute: 'White Sapphire / Zircon', metal: 'White Gold/Platinum', finger: 'Middle', day: 'Friday', color: '#a78bfa', desc: 'Attracts love, luxury, beauty, and material comforts.' },
  { planet: 'Saturn', p: 'Shani', name: 'Blue Sapphire', nameHi: 'नीलम', substitute: 'Amethyst / Blue Spinel', metal: 'Gold/Silver', finger: 'Middle', day: 'Saturday', color: '#3b82f6', desc: 'Removes obstacles, brings discipline, longevity, and career stability.' },
  { planet: 'Rahu', p: 'Rahu', name: 'Hessonite', nameHi: 'गोमेद', substitute: 'Orange Zircon', metal: 'Silver', finger: 'Middle', day: 'Saturday', color: '#78716c', desc: 'Mitigates Rahu\'s malefic effects, brings clarity and spiritual advancement.' },
  { planet: 'Ketu', p: 'Ketu', name: 'Cat\'s Eye', nameHi: 'लहसुनिया', substitute: 'Alexandrite', metal: 'Silver', finger: 'Middle', day: 'Tuesday', color: '#84cc16', desc: 'Removes Ketu doshas, enhances psychic abilities and detachment.' },
];

export interface RudrakshaBead {
  mukhi: number;
  deity: string;
  planet: string;
  benefit: string;
  mantra: string;
  rashi: string;
}

export const RUDRAKSHA: RudrakshaBead[] = [
  { mukhi: 1, deity: 'Shiva', planet: 'Sun', benefit: 'Supreme consciousness, leadership, heart health', mantra: 'Om Hreem Namah', rashi: 'All' },
  { mukhi: 2, deity: 'Ardhanareeshvara', planet: 'Moon', benefit: 'Harmony in relationships, emotional balance', mantra: 'Om Namah', rashi: 'Karka' },
  { mukhi: 3, deity: 'Agni / Brahma', planet: 'Mars', benefit: 'Confidence, freedom from past karma', mantra: 'Om Kleem Namah', rashi: 'Mesha/Vrishchika' },
  { mukhi: 4, deity: 'Brahma', planet: 'Mercury', benefit: 'Intellect, creativity, concentration', mantra: 'Om Hreem Namah', rashi: 'Mithuna/Kanya' },
  { mukhi: 5, deity: 'Kalagni / Rudra', planet: 'Jupiter', benefit: 'General wellbeing, wisdom, peace of mind', mantra: 'Om Hreem Namah', rashi: 'All' },
  { mukhi: 6, deity: 'Kartikeya', planet: 'Venus', benefit: 'Willpower, attraction, material comforts', mantra: 'Om Hreem Hoom Namah', rashi: 'Vrishabha/Tula' },
  { mukhi: 7, deity: 'Mahalakshmi', planet: 'Saturn', benefit: 'Financial prosperity, health, removes poverty', mantra: 'Om Hoom Namah', rashi: 'Makara/Kumbha' },
  { mukhi: 8, deity: 'Ganesha', planet: 'Rahu', benefit: 'Removes obstacles, success in endeavors', mantra: 'Om Ganeshaya Namah', rashi: 'All' },
  { mukhi: 9, deity: 'Durga / Bhairava', planet: 'Ketu', benefit: 'Fearlessness, spiritual power, liberation', mantra: 'Om Hreem Hoom Namah', rashi: 'All' },
  { mukhi: 10, deity: 'Vishnu', planet: 'All', benefit: 'Peace, protection from negative energies', mantra: 'Om Hreem Namah Namah', rashi: 'All' },
  { mukhi: 11, deity: 'Hanuman / Ekadasha Rudra', planet: 'Sun', benefit: 'Meditation, intuition, adventure', mantra: 'Om Hreem Hoom Namah', rashi: 'All' },
  { mukhi: 12, deity: 'Aditya / Sun', planet: 'Sun', benefit: 'Radiance, leadership, removes obstacles', mantra: 'Om Kraum Sraum Raum Namah', rashi: 'Simha' },
  { mukhi: 13, deity: 'Vishwakarma', planet: 'Venus/Jupiter', benefit: 'Prosperity, worldly success, creative power', mantra: 'Om Hreem Namah', rashi: 'All' },
  { mukhi: 14, deity: 'Shiva (Deva Mani)', planet: 'Saturn/Rahu', benefit: 'Highest protection, intuition, ultimate power', mantra: 'Om Namah', rashi: 'All' },
];

// Ashta Kuta reference arrays (indexed by nakshatra 0-26)
// Gana: Deva / Manushya / Rakshasa
export const KUTA_GANA: string[] = ['Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya', 'Deva', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva'];
// Nadi: Adi / Madhya / Antya
export const KUTA_NADI: string[] = ['Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Antya', 'Adi', 'Madhya', 'Adi', 'Madhya', 'Adi', 'Madhya', 'Antya', 'Adi', 'Madhya', 'Antya', 'Adi', 'Madhya', 'Antya', 'Antya', 'Antya'];

export interface WesternSign {
  name: string;
  h: string;
  sym: string;
  from: [number, number];
  to: [number, number];
  el: string;
  ruler: string;
  quality: string;
}

export const WESTERN_SIGNS: WesternSign[] = [
  { name: 'Aries', h: 'मेष', sym: '♈', from: [3, 21], to: [4, 19], el: 'Fire', ruler: 'Mars', quality: 'Cardinal' },
  { name: 'Taurus', h: 'वृषभ', sym: '♉', from: [4, 20], to: [5, 20], el: 'Earth', ruler: 'Venus', quality: 'Fixed' },
  { name: 'Gemini', h: 'मिथुन', sym: '♊', from: [5, 21], to: [6, 20], el: 'Air', ruler: 'Mercury', quality: 'Mutable' },
  { name: 'Cancer', h: 'कर्क', sym: '♋', from: [6, 21], to: [7, 22], el: 'Water', ruler: 'Moon', quality: 'Cardinal' },
  { name: 'Leo', h: 'सिंह', sym: '♌', from: [7, 23], to: [8, 22], el: 'Fire', ruler: 'Sun', quality: 'Fixed' },
  { name: 'Virgo', h: 'कन्या', sym: '♍', from: [8, 23], to: [9, 22], el: 'Earth', ruler: 'Mercury', quality: 'Mutable' },
  { name: 'Libra', h: 'तुला', sym: '♎', from: [9, 23], to: [10, 22], el: 'Air', ruler: 'Venus', quality: 'Cardinal' },
  { name: 'Scorpio', h: 'वृश्चिक', sym: '♏', from: [10, 23], to: [11, 21], el: 'Water', ruler: 'Mars', quality: 'Fixed' },
  { name: 'Sagittarius', h: 'धनु', sym: '♐', from: [11, 22], to: [12, 21], el: 'Fire', ruler: 'Jupiter', quality: 'Mutable' },
  { name: 'Capricorn', h: 'मकर', sym: '♑', from: [12, 22], to: [1, 19], el: 'Earth', ruler: 'Saturn', quality: 'Cardinal' },
  { name: 'Aquarius', h: 'कुम्भ', sym: '♒', from: [1, 20], to: [2, 18], el: 'Air', ruler: 'Saturn', quality: 'Fixed' },
  { name: 'Pisces', h: 'मीन', sym: '♓', from: [2, 19], to: [3, 20], el: 'Water', ruler: 'Jupiter', quality: 'Mutable' },
];

export const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
export const RASHI_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
export const RASHI_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// ── Pancha Pakshi engine ──────────────────────────────────────────────────
// Single source of truth for /jyotish/pancha-pakshi's build-time prerender (Astro frontmatter,
// today/New Delhi/noon default) AND its client <script> (birth-date and quick-lookup
// recalculation). Both call sites import these same functions so they can never compute two
// different answers — see CLAUDE.md, 2026-08-18 SEO-prerender rollout.

function pkJD(y: number, m: number, d: number, h: number): number {
  let yy = y, mm = m;
  if (mm <= 2) { yy--; mm += 12; }
  const A = Math.floor(yy / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + h / 24 + B - 1524.5;
}
const pkNorm360 = (a: number) => ((a % 360) + 360) % 360;

// Day ruling bird by weekday (0=Sun..6=Sat). 0=Vulture,1=Owl,2=Crow,3=Cock,4=Peacock.
const PK_DAY_BIRD = [0, 1, 2, 3, 4, 0, 1];

/** Birth bird (0-4) from a birth moment: nakshatra of the Moon at that instant, mod 5. */
export function pakshiBirthBird(y: number, m: number, d: number, hourDecimalLocal: number, tzOffset: number): number {
  const jd = pkJD(y, m, d, hourDecimalLocal - tzOffset);
  const nakIdx = Math.floor(pkNorm360(moonLongitude(jd) - lahiriAyanamsha(jd)) / (360 / 27));
  return nakIdx % 5;
}

export interface PakshiPeriod { activityIdx: number; start: number; end: number }

export interface PakshiResult {
  birthBird: number;
  dayBird: number;
  weekday: number;
  srMins: number;
  ssMins: number;
  day: PakshiPeriod[];
  night: PakshiPeriod[];
}

/** Today's (civil date y/m/d, at lat/lng/tzOffset) 5 day + 5 night activity periods for a
 *  given birth bird. Deliberately carries no live/current-time data — "NOW" highlighting is a
 *  visitor-clock concern and must stay client-side only. */
export function computePanchaPakshi(y: number, m: number, d: number, lat: number, lng: number, tzOffset: number, birthBird: number): PakshiResult {
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const dayBird = PK_DAY_BIRD[weekday];
  const jd = pkJD(y, m, d, 6 - tzOffset);
  const jdNext = pkJD(y, m, d + 1, 6 - tzOffset);
  const srMins = sunriseUTC(jd, lat, lng, true) * 60 + tzOffset * 60;
  const ssMins = sunriseUTC(jd, lat, lng, false) * 60 + tzOffset * 60;
  const srNextMins = sunriseUTC(jdNext, lat, lng, true) * 60 + tzOffset * 60 + 1440;
  const dayDur = (ssMins - srMins) / 5;
  const nightDur = (srNextMins - ssMins) / 5;

  const day: PakshiPeriod[] = Array.from({ length: 5 }, (_, i) => {
    const rulingBird = (dayBird + i) % 5;
    const s = srMins + i * dayDur;
    return { activityIdx: (birthBird - rulingBird + 5) % 5, start: s, end: s + dayDur };
  });
  const night: PakshiPeriod[] = Array.from({ length: 5 }, (_, i) => {
    const rulingBird = (dayBird + i + 2) % 5;
    const s = ssMins + i * nightDur;
    return { activityIdx: (birthBird - rulingBird + 5) % 5, start: s, end: s + nightDur };
  });

  return { birthBird, dayBird, weekday, srMins, ssMins, day, night };
}
