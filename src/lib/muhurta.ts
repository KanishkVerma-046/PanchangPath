// Muhurta tools — data, types, and server-side scoring functions

export type ChoghadiyaType = 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Udveg' | 'Kaal' | 'Rog';
export type Quality = 'best' | 'good' | 'neutral' | 'bad';

export interface ChoghadiyaInfo {
  nameHi: string;
  quality: Quality;
  planet: string;
  planetHi: string;
  color: string;
  bgColor: string;
  suitable: string[];
}

export const CHOGHADIYA_INFO: Record<ChoghadiyaType, ChoghadiyaInfo> = {
  Amrit: {
    nameHi: 'अमृत', quality: 'best', planet: 'Moon', planetHi: 'चंद्र',
    color: '#16803D', bgColor: '#DCF3E3',
    suitable: ['All activities', 'Travel', 'Business', 'Marriage', 'Medicine', 'Education'],
  },
  Shubh: {
    nameHi: 'शुभ', quality: 'good', planet: 'Jupiter', planetHi: 'गुरु',
    color: '#97690F', bgColor: '#FBF0D9',
    suitable: ['Marriage', 'Religious ceremonies', 'Education', 'New ventures'],
  },
  Labh: {
    nameHi: 'लाभ', quality: 'good', planet: 'Mercury', planetHi: 'बुध',
    color: '#B5390A', bgColor: '#FBE4D2',
    suitable: ['Business', 'Trade', 'Financial dealings', 'Accounting'],
  },
  Char: {
    nameHi: 'चर', quality: 'neutral', planet: 'Venus', planetHi: 'शुक्र',
    color: '#8C7660', bgColor: '#F5E7C8',
    suitable: ['Travel', 'Movement', 'Shopping'],
  },
  Udveg: {
    nameHi: 'उद्वेग', quality: 'bad', planet: 'Sun', planetHi: 'सूर्य',
    color: '#C81E1E', bgColor: '#FBE0DE',
    suitable: ['Government work only'],
  },
  Kaal: {
    nameHi: 'काल', quality: 'bad', planet: 'Saturn', planetHi: 'शनि',
    color: '#3A2712', bgColor: '#E8D9BE',
    suitable: [],
  },
  Rog: {
    nameHi: 'रोग', quality: 'bad', planet: 'Mars', planetHi: 'मंगल',
    color: '#7F2700', bgColor: '#FBE4D2',
    suitable: [],
  },
};

// Day Choghadiya sequences by weekday (0=Sun … 6=Sat)
export const DAY_CHOG: ChoghadiyaType[][] = [
  ['Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg'],
  ['Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit'],
  ['Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog'],
  ['Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh'],
  ['Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh'],
  ['Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char'],
  ['Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal'],
];

export const NIGHT_CHOG: ChoghadiyaType[][] = [
  ['Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh'],
  ['Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char'],
  ['Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal'],
  ['Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg'],
  ['Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit'],
  ['Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog'],
  ['Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh'],
];

// Hora planets sequence; HORA_START[weekday] = starting index into HORA_PLANETS
export const HORA_PLANETS = ['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'] as const;
export const HORA_PLANETS_HI = ['सूर्य','शुक्र','बुध','चंद्र','शनि','गुरु','मंगल'];
export const HORA_START: number[] = [0, 3, 6, 2, 5, 1, 4];

export const HORA_QUALITY: Record<string, Quality> = {
  Sun: 'neutral', Venus: 'good', Mercury: 'good',
  Moon: 'best', Saturn: 'bad', Jupiter: 'best', Mars: 'bad',
};

export const HORA_SUITABLE: Record<string, string[]> = {
  Sun: ['Govt work','Authority matters','Father-related'],
  Venus: ['Romance','Arts','Luxury purchase','Beauty'],
  Mercury: ['Writing','Business','Education','Communication'],
  Moon: ['Travel','Agriculture','Emotional matters','All auspicious work'],
  Saturn: ['Mining','Machinery','Long-term discipline'],
  Jupiter: ['Spiritual work','Teaching','Marriage','Financial investments'],
  Mars: ['Surgery','Physical work','Competition'],
};

// Nakshatra names (server-side, for scoring functions)
export const NAK_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

export const TITHI_NAMES = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami',
  'Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi',
  'Purnima','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi',
  'Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi',
  'Chaturdashi','Amavasya',
];

export const VARA_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Panchaka nakshatras (22–26, 0-indexed)
export const PANCHAKA_NAKS = [22, 23, 24, 25, 26];

// Rashi names
export const RASHI_NAMES = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena',
];
export const RASHI_NAMES_HI = [
  'मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या',
  'तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन',
];
export const RASHI_LORDS = [
  'Mars','Venus','Mercury','Moon','Sun','Mercury',
  'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter',
];

// ── Scoring criteria by activity type ────────────────────────────────────────

export type ActivityType = 'vivah' | 'griha-pravesh' | 'vehicle' | 'property' | 'business' | 'general';

interface MuhurtaCriteria {
  label: string;
  labelHi: string;
  goodNakshatras: number[];
  goodTithis: number[];  // 0-indexed
  goodVaras: number[];   // 0=Sun
  avoidNakshatras: number[];
  avoidTithis: number[];
}

export const MUHURTA_CRITERIA: Record<ActivityType, MuhurtaCriteria> = {
  vivah: {
    label: 'Vivah (Marriage)',
    labelHi: 'विवाह',
    goodNakshatras: [3, 4, 6, 7, 9, 11, 12, 14, 16, 20, 25, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    avoidNakshatras: [0, 1, 5, 8, 15, 17, 18, 22, 23, 24],
    avoidTithis: [3, 8, 13, 14, 29],
  },
  'griha-pravesh': {
    label: 'Griha Pravesh (House Entry)',
    labelHi: 'गृह प्रवेश',
    goodNakshatras: [3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    avoidNakshatras: [1, 5, 8, 17, 18, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
  vehicle: {
    label: 'Vehicle Purchase',
    labelHi: 'वाहन खरीद',
    goodNakshatras: [0, 3, 4, 6, 7, 12, 14, 21, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [0, 1, 3, 4, 5],
    avoidNakshatras: [1, 5, 8, 17, 18, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
  property: {
    label: 'Property Purchase',
    labelHi: 'संपत्ति खरीद',
    goodNakshatras: [3, 6, 7, 11, 12, 21, 22, 25, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    avoidNakshatras: [1, 5, 8, 17, 18, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
  business: {
    label: 'Business / New Venture',
    labelHi: 'व्यापार शुरू',
    goodNakshatras: [0, 3, 4, 6, 7, 11, 12, 14, 20, 21, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    avoidNakshatras: [5, 8, 17, 18, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
  general: {
    label: 'General Auspicious Date',
    labelHi: 'शुभ दिन',
    goodNakshatras: [3, 4, 6, 7, 11, 12, 14, 16, 20, 21, 26],
    goodTithis: [1, 2, 4, 6, 9, 10, 11, 12],
    goodVaras: [1, 3, 4, 5],
    avoidNakshatras: [5, 8, 17, 23, 24],
    avoidTithis: [3, 8, 13, 29],
  },
};

// ── Gowri Panchangam ──────────────────────────────────────────────────────────

export type GowriType = 'Amrutham' | 'Sudham' | 'Labham' | 'Uthamam' | 'Rogam' | 'Dhanam' | 'Charam' | 'Visha';

export const GOWRI_INFO: Record<GowriType, { nameHi: string; quality: Quality; color: string }> = {
  Amrutham: { nameHi: 'अमृतम्', quality: 'best', color: '#16803D' },
  Sudham:   { nameHi: 'सुधम्',  quality: 'good', color: '#97690F' },
  Labham:   { nameHi: 'लाभम्',  quality: 'good', color: '#B5390A' },
  Uthamam:  { nameHi: 'उत्तमम्', quality: 'good', color: '#7F2700' },
  Rogam:    { nameHi: 'रोगम्',   quality: 'bad',  color: '#C81E1E' },
  Dhanam:   { nameHi: 'धनम्',   quality: 'neutral', color: '#8C7660' },
  Charam:   { nameHi: 'चरम्',   quality: 'neutral', color: '#5A4636' },
  Visha:    { nameHi: 'विषम्',  quality: 'bad',  color: '#3A2712' },
};

export const GOWRI_DAY: GowriType[][] = [
  ['Amrutham','Sudham','Uthamam','Labham','Rogam','Dhanam','Charam','Visha'],   // Sun
  ['Charam','Visha','Amrutham','Sudham','Uthamam','Labham','Rogam','Dhanam'],   // Mon
  ['Labham','Rogam','Dhanam','Charam','Visha','Amrutham','Sudham','Uthamam'],   // Tue
  ['Amrutham','Sudham','Uthamam','Labham','Rogam','Dhanam','Charam','Visha'],   // Wed
  ['Uthamam','Labham','Rogam','Dhanam','Charam','Visha','Amrutham','Sudham'],   // Thu
  ['Sudham','Uthamam','Labham','Rogam','Dhanam','Charam','Visha','Amrutham'],   // Fri
  ['Rogam','Dhanam','Charam','Visha','Amrutham','Sudham','Uthamam','Labham'],   // Sat
];

export const GOWRI_NIGHT: GowriType[][] = [
  ['Rogam','Dhanam','Charam','Visha','Amrutham','Sudham','Uthamam','Labham'],   // Sun
  ['Uthamam','Labham','Rogam','Dhanam','Charam','Visha','Amrutham','Sudham'],   // Mon
  ['Sudham','Uthamam','Labham','Rogam','Dhanam','Charam','Visha','Amrutham'],   // Tue
  ['Rogam','Dhanam','Charam','Visha','Amrutham','Sudham','Uthamam','Labham'],   // Wed
  ['Visha','Amrutham','Sudham','Uthamam','Labham','Rogam','Dhanam','Charam'],   // Thu
  ['Dhanam','Charam','Visha','Amrutham','Sudham','Uthamam','Labham','Rogam'],   // Fri
  ['Labham','Rogam','Dhanam','Charam','Visha','Amrutham','Sudham','Uthamam'],   // Sat
];
