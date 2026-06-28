// Regional Panchang translation data for 11 Indian traditions

export type RegionCode = 'bn' | 'as' | 'ta' | 'ml' | 'mr' | 'gu' | 'kn' | 'te' | 'or' | 'ne' | 'iskcon';

export interface RegionDef {
  code: RegionCode;
  slug: string;
  name: string;         // English
  nativeName: string;   // Own script
  calendarName: string; // e.g. "Bengali Panjika"
  script: string;
  defaultCity: string;
  defaultLat: number;
  defaultLng: number;
  defaultTzOffset: number;
  monthSystem: 'solar' | 'lunar';
  // Solar: month = sunRashiIdx mapped through solarMonthMap
  // Lunar: month = amantaMonthIdx from getHinduCalendarInfo
  solarMonthMap: number[];   // length 12: solarMonthMap[sunRashiIdx] = monthArrayIdx; [] for lunar
  months: string[];          // 12 month names
  tithiShukla: string[];     // 15: Pratipada…Purnima
  tithiKrishna: string[];    // 15: Pratipada…Amavasya
  nakshatras: string[];      // 27
  varas: string[];           // 7 (Sun…Sat)
  paksha: [string, string];  // [Shukla label, Krishna label]
  description: string;
  specialNote: string;
  getYear(sunSidereal: number, gregYear: number, vsYear: number, ssYear: number): {
    num: number;
    name?: string;
    era: string;
    displayLabel: string;
  };
}

// ── Shared Sanskrit base names (for fallback / ISKCON) ─────────────────────
const TITHI_SHUKLA_EN = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
];
const TITHI_KRISHNA_EN = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya',
];
const NAKSHATRA_EN = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

const SAMVATSARA_60 = [
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

// ── Identity map for solar traditions starting from Mesha (Aries=0) ─────────
const SOLAR_MESHA_FIRST: number[] = [0,1,2,3,4,5,6,7,8,9,10,11];
// Malayalam starts from Simha (Leo=4): Chingam=index0 when sunRashiIdx=4
const SOLAR_SIMHA_FIRST: number[] = [8,9,10,11,0,1,2,3,4,5,6,7];
// Lunar traditions don't use this
const NO_SOLAR_MAP: number[] = [];

// ── REGIONS ────────────────────────────────────────────────────────────────
export const REGIONS: RegionDef[] = [

  // ── Bengali Panjika ────────────────────────────────────────────────────
  {
    code: 'bn',
    slug: 'bengali',
    name: 'Bengali',
    nativeName: 'বাংলা',
    calendarName: 'Bengali Panjika',
    script: 'Bengali',
    defaultCity: 'Kolkata',
    defaultLat: 22.5726,
    defaultLng: 88.3639,
    defaultTzOffset: 5.5,
    monthSystem: 'solar',
    solarMonthMap: SOLAR_MESHA_FIRST,
    months: [
      'বৈশাখ','জ্যৈষ্ঠ','আষাঢ়','শ্রাবণ','ভাদ্র','আশ্বিন',
      'কার্তিক','অগ্রহায়ণ','পৌষ','মাঘ','ফাল্গুন','চৈত্র',
    ],
    tithiShukla: [
      'প্রতিপদ','দ্বিতীয়া','তৃতীয়া','চতুর্থী','পঞ্চমী',
      'ষষ্ঠী','সপ্তমী','অষ্টমী','নবমী','দশমী',
      'একাদশী','দ্বাদশী','ত্রয়োদশী','চতুর্দশী','পূর্ণিমা',
    ],
    tithiKrishna: [
      'প্রতিপদ','দ্বিতীয়া','তৃতীয়া','চতুর্থী','পঞ্চমী',
      'ষষ্ঠী','সপ্তমী','অষ্টমী','নবমী','দশমী',
      'একাদশী','দ্বাদশী','ত্রয়োদশী','চতুর্দশী','অমাবস্যা',
    ],
    nakshatras: [
      'অশ্বিনী','ভরণী','কৃত্তিকা','রোহিণী','মৃগশিরা','আর্দ্রা',
      'পুনর্বসু','পুষ্যা','আশ্লেষা','মঘা','পূর্ব ফাল্গুনী','উত্তর ফাল্গুনী',
      'হস্তা','চিত্রা','স্বাতী','বিশাখা','অনুরাধা','জ্যেষ্ঠা',
      'মূলা','পূর্বাষাঢ়া','উত্তরাষাঢ়া','শ্রবণা','ধনিষ্ঠা',
      'শতভিষা','পূর্ব ভাদ্রপদ','উত্তর ভাদ্রপদ','রেবতী',
    ],
    varas: ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'],
    paksha: ['শুক্লপক্ষ','কৃষ্ণপক্ষ'],
    description: 'The Bengali Panjika follows a solar calendar (Bangabda), with the year beginning when the Sun enters Mesha (Aries) in mid-April.',
    specialNote: 'Poila Boishakh (Baishakh 1) marks the Bengali New Year, celebrated across West Bengal and Bangladesh.',
    getYear(sunSidereal, gregYear) {
      // Bangabda year increments when Sun crosses 0° (Mesha)
      const sunRashiIdx = Math.floor(sunSidereal / 30);
      // If Sun is in Mesha or beyond (i.e., Baishakh 1 has passed), year = gregYear - 593
      const num = sunRashiIdx >= 0 ? gregYear - 593 : gregYear - 594;
      return { num, era: 'বঙ্গাব্দ', displayLabel: `${num} বঙ্গাব্দ` };
    },
  },

  // ── Assamese Panjika ───────────────────────────────────────────────────
  {
    code: 'as',
    slug: 'assamese',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    calendarName: 'Assamese Panjika',
    script: 'Assamese',
    defaultCity: 'Guwahati',
    defaultLat: 26.1445,
    defaultLng: 91.7362,
    defaultTzOffset: 5.5,
    monthSystem: 'solar',
    solarMonthMap: SOLAR_MESHA_FIRST,
    months: [
      'বহাগ','জেঠ','আহাৰ','শাওণ','ভাদ','আহিন',
      'কাতি','অগ্ৰহায়ণ','পুহ','মাঘ','ফাগুন','চ\'ত',
    ],
    tithiShukla: [
      'প্ৰতিপদা','দ্বিতীয়া','তৃতীয়া','চতুৰ্থী','পঞ্চমী',
      'ষষ্ঠী','সপ্তমী','অষ্টমী','নৱমী','দশমী',
      'একাদশী','দ্বাদশী','ত্ৰয়োদশী','চতুৰ্দশী','পূৰ্ণিমা',
    ],
    tithiKrishna: [
      'প্ৰতিপদা','দ্বিতীয়া','তৃতীয়া','চতুৰ্থী','পঞ্চমী',
      'ষষ্ঠী','সপ্তমী','অষ্টমী','নৱমী','দশমী',
      'একাদশী','দ্বাদশী','ত্ৰয়োদশী','চতুৰ্দশী','অমাৱস্যা',
    ],
    nakshatras: [
      'অশ্বিনী','ভৰণী','কৃত্তিকা','ৰোহিণী','মৃগশিৰা','আৰ্দ্ৰা',
      'পুনৰ্বসু','পুষ্যা','আশ্লেষা','মঘা','পূৰ্ব ফাল্গুনী','উত্তৰ ফাল্গুনী',
      'হস্তা','চিত্ৰা','স্বাতী','বিশাখা','অনুৰাধা','জ্যেষ্ঠা',
      'মূলা','পূৰ্বাষাঢ়া','উত্তৰাষাঢ়া','শ্ৰৱণা','ধনিষ্ঠা',
      'শতভিষা','পূৰ্ব ভাদ্ৰপদ','উত্তৰ ভাদ্ৰপদ','ৰেৱতী',
    ],
    varas: ['দেওবাৰ','সোমবাৰ','মঙ্গলবাৰ','বুধবাৰ','বৃহস্পতিবাৰ','শুক্ৰবাৰ','শনিবাৰ'],
    paksha: ['শুক্লপক্ষ','কৃষ্ণপক্ষ'],
    description: 'The Assamese Panjika follows a solar calendar with the new year (Rongali Bihu) beginning when the Sun enters Mesha.',
    specialNote: 'Rongali Bihu (Bohag Bihu) marks the Assamese New Year in mid-April, when the Sun enters the Mesha rashi.',
    getYear(sunSidereal, gregYear) {
      // Same as Bangabda for Assamese Panjika purposes
      const num = gregYear - 593;
      return { num, era: 'বঙ্গাব্দ', displayLabel: `${num} বঙ্গাব্দ` };
    },
  },

  // ── Tamil Panchangam ───────────────────────────────────────────────────
  {
    code: 'ta',
    slug: 'tamil',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    calendarName: 'Tamil Panchangam',
    script: 'Tamil',
    defaultCity: 'Chennai',
    defaultLat: 13.0827,
    defaultLng: 80.2707,
    defaultTzOffset: 5.5,
    monthSystem: 'solar',
    solarMonthMap: SOLAR_MESHA_FIRST,
    months: [
      'சித்திரை','வைகாசி','ஆனி','ஆடி','ஆவணி','புரட்டாசி',
      'ஐப்பசி','கார்த்திகை','மார்கழி','தை','மாசி','பங்குனி',
    ],
    tithiShukla: [
      'பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி',
      'சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி',
      'ஏகாதசி','துவாதசி','திரயோதசி','சதுர்தசி','பௌர்ணமி',
    ],
    tithiKrishna: [
      'பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி',
      'சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி',
      'ஏகாதசி','துவாதசி','திரயோதசி','சதுர்தசி','அமாவாசை',
    ],
    nakshatras: [
      'அஸ்வினி','பரணி','கார்த்திகை','ரோகிணி','மிருகசீரிஷம்','திருவாதிரை',
      'புனர்பூசம்','பூசம்','ஆயில்யம்','மகம்','பூரம்','உத்திரம்',
      'அஸ்தம்','சித்திரை','சுவாதி','விசாகம்','அனுஷம்','கேட்டை',
      'மூலம்','பூராடம்','உத்திராடம்','திருவோணம்','அவிட்டம்',
      'சதயம்','பூரட்டாதி','உத்திரட்டாதி','ரேவதி',
    ],
    varas: ['ஞாயிறு','திங்கள்','செவ்வாய்','புதன்','வியாழன்','வெள்ளி','சனி'],
    paksha: ['சுக்ல பக்ஷம்','கிருஷ்ண பக்ஷம்'],
    description: 'The Tamil Panchangam follows a solar calendar (Sauramanam), with months corresponding to the Sun\'s transit through each Rashi. The year begins with Chithirai when the Sun enters Mesha.',
    specialNote: 'Tamil New Year (Puthandu) falls on Chithirai 1 when the Sun enters the Mesha rashi, usually around April 14.',
    getYear(sunSidereal, gregYear, vsYear) {
      const samvatsara = SAMVATSARA_60[(vsYear - 1) % 60];
      const num = gregYear + 31; // Thiruvalluvar year (approximate)
      return { num, name: samvatsara, era: 'திருவள்ளுவர் ஆண்டு', displayLabel: `${samvatsara} (${num})` };
    },
  },

  // ── Malayalam Panchangam ───────────────────────────────────────────────
  {
    code: 'ml',
    slug: 'malayalam',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    calendarName: 'Malayalam Panchangam',
    script: 'Malayalam',
    defaultCity: 'Thiruvananthapuram',
    defaultLat: 8.5241,
    defaultLng: 76.9366,
    defaultTzOffset: 5.5,
    monthSystem: 'solar',
    solarMonthMap: SOLAR_SIMHA_FIRST,  // Chingam=Simha, so Simha(4)→index0
    months: [
      'ചിങ്ങം','കന്നി','തുലാം','വൃശ്ചികം','ധനു','മകരം',
      'കുംഭം','മീനം','മേടം','ഇടവം','മിഥുനം','കർക്കടകം',
    ],
    tithiShukla: [
      'പ്രതിപദം','ദ്വിതീയ','തൃതീയ','ചതുർഥി','പഞ്ചമി',
      'ഷഷ്ഠി','സപ്തമി','അഷ്ടമി','നവമി','ദശമി',
      'ഏകാദശി','ദ്വാദശി','ത്രയോദശി','ചതുർദശി','പൗർണമി',
    ],
    tithiKrishna: [
      'പ്രതിപദം','ദ്വിതീയ','തൃതീയ','ചതുർഥി','പഞ്ചമി',
      'ഷഷ്ഠി','സപ്തമി','അഷ്ടമി','നവമി','ദശമി',
      'ഏകാദശി','ദ്വാദശി','ത്രയോദശി','ചതുർദശി','അമാവാസ്യ',
    ],
    nakshatras: [
      'അശ്വതി','ഭരണി','കാർത്തിക','രോഹിണി','മകയിരം','തിരുവാതിര',
      'പുണർതം','പൂയം','ആയില്യം','മകം','പൂരം','ഉത്രം',
      'അത്തം','ചിത്ര','ചോതി','വിശാഖം','അനിഴം','തൃക്കേട്ട',
      'മൂലം','പൂരാടം','ഉത്രാടം','തിരുവോണം','അവിട്ടം',
      'ചതയം','പൂരുരുട്ടാതി','ഉത്രട്ടാതി','രേവതി',
    ],
    varas: ['ഞായർ','തിങ്കൾ','ചൊവ്വ','ബുധൻ','വ്യാഴം','വെള്ളി','ശനി'],
    paksha: ['ശുക്ലപക്ഷം','കൃഷ്ണപക്ഷം'],
    description: 'The Malayalam Panchangam follows the Kolla Varsham solar calendar, with the year beginning when the Sun enters Simha (Leo). The first month is Chingam.',
    specialNote: 'Vishu (Malayalam New Year in the astronomical sense) falls when the Sun enters Medam (Mesha/Aries). Onam is celebrated in Chingam.',
    getYear(sunSidereal, gregYear) {
      // Kolla Varsham: year increments when Sun enters Simha (120°)
      const sunRashiIdx = Math.floor(sunSidereal / 30);
      const num = sunRashiIdx >= 4 ? gregYear - 824 : gregYear - 825;
      return { num, era: 'കൊല്ലവർഷം', displayLabel: `${num} കൊ.വ.` };
    },
  },

  // ── Marathi Panchang ───────────────────────────────────────────────────
  {
    code: 'mr',
    slug: 'marathi',
    name: 'Marathi',
    nativeName: 'मराठी',
    calendarName: 'Marathi Panchang',
    script: 'Devanagari',
    defaultCity: 'Mumbai',
    defaultLat: 19.0760,
    defaultLng: 72.8777,
    defaultTzOffset: 5.5,
    monthSystem: 'lunar',
    solarMonthMap: NO_SOLAR_MAP,
    months: [
      'चैत्र','वैशाख','ज्येष्ठ','आषाढ','श्रावण','भाद्रपद',
      'आश्विन','कार्तिक','मार्गशीर्ष','पौष','माघ','फाल्गुन',
    ],
    tithiShukla: [
      'प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी',
      'षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी',
      'एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पौर्णिमा',
    ],
    tithiKrishna: [
      'प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी',
      'षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी',
      'एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','अमावस्या',
    ],
    nakshatras: [
      'अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशीर्ष','आर्द्रा',
      'पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी',
      'हस्त','चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा',
      'मूळ','पूर्व आषाढा','उत्तर आषाढा','श्रवण','धनिष्ठा',
      'शतभिषा','पूर्व भाद्रपदा','उत्तर भाद्रपदा','रेवती',
    ],
    varas: ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'],
    paksha: ['शुक्ल पक्ष','कृष्ण पक्ष'],
    description: 'The Marathi Panchang follows the Amanta lunar calendar (Vikram Samvat), with the new year (Gudi Padwa) on Chaitra Shukla Pratipada.',
    specialNote: 'Gudi Padwa marks the Marathi New Year. Ganesh Chaturthi (Bhadrapada Shukla Chaturthi) is the most celebrated festival.',
    getYear(sunSidereal, gregYear, vsYear) {
      const samvatsara = SAMVATSARA_60[(vsYear - 1) % 60];
      return { num: vsYear, name: samvatsara, era: 'विक्रम संवत', displayLabel: `${samvatsara} संवत ${vsYear}` };
    },
  },

  // ── Gujarati Panchang ──────────────────────────────────────────────────
  {
    code: 'gu',
    slug: 'gujarati',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    calendarName: 'Gujarati Panchang',
    script: 'Gujarati',
    defaultCity: 'Ahmedabad',
    defaultLat: 23.0225,
    defaultLng: 72.5714,
    defaultTzOffset: 5.5,
    monthSystem: 'lunar',
    solarMonthMap: NO_SOLAR_MAP,
    months: [
      'ચૈત્ર','વૈશાખ','જ્યેષ્ઠ','અષાઢ','શ્રાવણ','ભાદ્રપદ',
      'આસો','કારતક','માગશર','પોષ','મહા','ફાગણ',
    ],
    tithiShukla: [
      'એકમ','બીજ','ત્રીજ','ચોથ','પાંચમ',
      'છઠ','સાતમ','આઠમ','નોમ','દશમ',
      'અગિયારસ','બારસ','તેરશ','ચૌદ','પૂનમ',
    ],
    tithiKrishna: [
      'એકમ','બીજ','ત્રીજ','ચોથ','પાંચમ',
      'છઠ','સાતમ','આઠમ','નોમ','દશમ',
      'અગિયારસ','બારસ','તેરશ','ચૌદ','અમાસ',
    ],
    nakshatras: [
      'અશ્વિની','ભરણી','કૃત્તિકા','રોહિણી','મૃગશીર','આર્દ્રા',
      'પુનર્વસુ','પુષ્ય','અશ્લેષા','મઘા','પૂર્વ ફાલ્ગુની','ઉત્તર ફાલ્ગુની',
      'હસ્ત','ચિત્રા','સ્વાતિ','વિશાખા','અનુરાધા','જ્યેષ્ઠા',
      'મૂળ','પૂર્વ અષાઢ','ઉત્તર અષાઢ','શ્રવણ','ધનિષ્ઠા',
      'શતભિષ','પૂર્વ ભાદ્રપદ','ઉત્તર ભાદ્રપદ','રેવતી',
    ],
    varas: ['રવિવાર','સોમવાર','મંગળવાર','બુધવાર','ગુરુવાર','શુક્રવાર','શનિવાર'],
    paksha: ['સુદ','વદ'],
    description: 'The Gujarati Panchang uses colloquial names for tithis (Ekam, Bij, Trij…) and starts the new year (Bestu Varas) on the day after Diwali.',
    specialNote: 'Bestu Varas (Gujarati New Year) falls on Kartika Shukla Pratipada — the day after Diwali. Diwali itself marks the end of the Gujarati year.',
    getYear(sunSidereal, gregYear, vsYear) {
      return { num: vsYear, era: 'વિક્રમ સંવત', displayLabel: `સં. ${vsYear}` };
    },
  },

  // ── Kannada Panchangam ─────────────────────────────────────────────────
  {
    code: 'kn',
    slug: 'kannada',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    calendarName: 'Kannada Panchangam',
    script: 'Kannada',
    defaultCity: 'Bengaluru',
    defaultLat: 12.9716,
    defaultLng: 77.5946,
    defaultTzOffset: 5.5,
    monthSystem: 'lunar',
    solarMonthMap: NO_SOLAR_MAP,
    months: [
      'ಚೈತ್ರ','ವೈಶಾಖ','ಜ್ಯೇಷ್ಠ','ಆಷಾಢ','ಶ್ರಾವಣ','ಭಾದ್ರಪದ',
      'ಆಶ್ವಯುಜ','ಕಾರ್ತೀಕ','ಮಾರ್ಗಶಿರ','ಪುಷ್ಯ','ಮಾಘ','ಫಾಲ್ಗುಣ',
    ],
    tithiShukla: [
      'ಪ್ರತಿಪದ','ದ್ವಿತೀಯ','ತೃತೀಯ','ಚತುರ್ಥಿ','ಪಂಚಮಿ',
      'ಷಷ್ಠಿ','ಸಪ್ತಮಿ','ಅಷ್ಟಮಿ','ನವಮಿ','ದಶಮಿ',
      'ಏಕಾದಶಿ','ದ್ವಾದಶಿ','ತ್ರಯೋದಶಿ','ಚತುರ್ದಶಿ','ಹುಣ್ಣಿಮೆ',
    ],
    tithiKrishna: [
      'ಪ್ರತಿಪದ','ದ್ವಿತೀಯ','ತೃತೀಯ','ಚತುರ್ಥಿ','ಪಂಚಮಿ',
      'ಷಷ್ಠಿ','ಸಪ್ತಮಿ','ಅಷ್ಟಮಿ','ನವಮಿ','ದಶಮಿ',
      'ಏಕಾದಶಿ','ದ್ವಾದಶಿ','ತ್ರಯೋದಶಿ','ಚತುರ್ದಶಿ','ಅಮಾವಾಸ್ಯೆ',
    ],
    nakshatras: [
      'ಅಶ್ವಿನಿ','ಭರಣಿ','ಕೃತ್ತಿಕ','ರೋಹಿಣಿ','ಮೃಗಶಿರ','ಆರ್ದ್ರ',
      'ಪುನರ್ವಸು','ಪುಷ್ಯ','ಆಶ್ಲೇಷ','ಮಘ','ಪೂರ್ವ ಫಲ್ಗುಣಿ','ಉತ್ತರ ಫಲ್ಗುಣಿ',
      'ಹಸ್ತ','ಚಿತ್ರ','ಸ್ವಾತಿ','ವಿಶಾಖ','ಅನುರಾಧ','ಜ್ಯೇಷ್ಠ',
      'ಮೂಲ','ಪೂರ್ವಾಷಾಢ','ಉತ್ತರಾಷಾಢ','ಶ್ರವಣ','ಧನಿಷ್ಠ',
      'ಶತಭಿಷ','ಪೂರ್ವಭಾದ್ರ','ಉತ್ತರಭಾದ್ರ','ರೇವತಿ',
    ],
    varas: ['ಭಾನುವಾರ','ಸೋಮವಾರ','ಮಂಗಳವಾರ','ಬುಧವಾರ','ಗುರುವಾರ','ಶುಕ್ರವಾರ','ಶನಿವಾರ'],
    paksha: ['ಶುಕ್ಲ ಪಕ್ಷ','ಕೃಷ್ಣ ಪಕ್ಷ'],
    description: 'The Kannada Panchangam uses the Amanta lunar calendar with Shalivahana Saka year. Yugadi (New Year) falls on Chaitra Shukla Pratipada.',
    specialNote: 'Ugadi (Yugadi) is the Kannada New Year. Holigondamare (Holi) and Gowri-Ganesha are major festivals.',
    getYear(sunSidereal, gregYear, vsYear, ssYear) {
      const samvatsara = SAMVATSARA_60[(vsYear - 1) % 60];
      return { num: ssYear, name: samvatsara, era: 'ಶಾಲಿವಾಹನ ಶಕ', displayLabel: `${samvatsara} ಶಕ ${ssYear}` };
    },
  },

  // ── Telugu Panchangam ──────────────────────────────────────────────────
  {
    code: 'te',
    slug: 'telugu',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    calendarName: 'Telugu Panchangam',
    script: 'Telugu',
    defaultCity: 'Hyderabad',
    defaultLat: 17.3850,
    defaultLng: 78.4867,
    defaultTzOffset: 5.5,
    monthSystem: 'lunar',
    solarMonthMap: NO_SOLAR_MAP,
    months: [
      'చైత్ర','వైశాఖ','జ్యేష్ఠ','ఆషాఢ','శ్రావణ','భాద్రపద',
      'ఆశ్వయుజ','కార్తీక','మార్గశిర','పుష్య','మాఘ','ఫాల్గుణ',
    ],
    tithiShukla: [
      'పాడ్యమి','విదియ','తదియ','చవితి','పంచమి',
      'షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి',
      'ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','పౌర్ణమి',
    ],
    tithiKrishna: [
      'పాడ్యమి','విదియ','తదియ','చవితి','పంచమి',
      'షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి',
      'ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','అమావాస్య',
    ],
    nakshatras: [
      'అశ్వని','భరణి','కృత్తిక','రోహిణి','మృగశిర','ఆర్ద్ర',
      'పునర్వసు','పుష్యమి','ఆశ్లేష','మఘ','పూర్వ ఫల్గుని','ఉత్తర ఫల్గుని',
      'హస్త','చిత్ర','స్వాతి','విశాఖ','అనురాధ','జ్యేష్ఠ',
      'మూల','పూర్వాషాఢ','ఉత్తరాషాఢ','శ్రవణ','ధనిష్ఠ',
      'శతభిష','పూర్వభాద్ర','ఉత్తరభాద్ర','రేవతి',
    ],
    varas: ['ఆదివారం','సోమవారం','మంగళవారం','బుధవారం','గురువారం','శుక్రవారం','శనివారం'],
    paksha: ['శుక్ల పక్షం','కృష్ణ పక్షం'],
    description: 'The Telugu Panchangam follows the Amanta lunar calendar with colloquial tithi names (Padyami, Vidiya…). Ugadi marks the Telugu New Year.',
    specialNote: 'Ugadi (Telugu New Year) falls on Chaitra Shukla Pratipada. The Panchangam reading on Ugadi day is a sacred tradition.',
    getYear(sunSidereal, gregYear, vsYear, ssYear) {
      const samvatsara = SAMVATSARA_60[(vsYear - 1) % 60];
      return { num: ssYear, name: samvatsara, era: 'శాలివాహన శక', displayLabel: `${samvatsara} శక ${ssYear}` };
    },
  },

  // ── Odia Panji ────────────────────────────────────────────────────────
  {
    code: 'or',
    slug: 'odia',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    calendarName: 'Odia Panji',
    script: 'Odia',
    defaultCity: 'Bhubaneswar',
    defaultLat: 20.2961,
    defaultLng: 85.8245,
    defaultTzOffset: 5.5,
    monthSystem: 'lunar',
    solarMonthMap: NO_SOLAR_MAP,
    months: [
      'ଚୈତ୍ର','ବୈଶାଖ','ଜ୍ୟୈଷ୍ଠ','ଆଷାଢ','ଶ୍ରାବଣ','ଭାଦ୍ର',
      'ଆଶ୍ୱିନ','କାର୍ତ୍ତିକ','ମାର୍ଗଶୀର','ପୌଷ','ମାଘ','ଫାଲ୍ଗୁନ',
    ],
    tithiShukla: [
      'ପ୍ରତିପଦ','ଦ୍ୱିତୀୟା','ତୃତୀୟା','ଚତୁର୍ଥୀ','ପଞ୍ଚମୀ',
      'ଷଷ୍ଠୀ','ସପ୍ତମୀ','ଅଷ୍ଟମୀ','ନବମୀ','ଦଶମୀ',
      'ଏକାଦଶୀ','ଦ୍ୱାଦଶୀ','ତ୍ରୟୋଦଶୀ','ଚତୁର୍ଦ୍ଦଶୀ','ପୂର୍ଣ୍ଣିମା',
    ],
    tithiKrishna: [
      'ପ୍ରତିପଦ','ଦ୍ୱିତୀୟା','ତୃତୀୟା','ଚତୁର୍ଥୀ','ପଞ୍ଚମୀ',
      'ଷଷ୍ଠୀ','ସପ୍ତମୀ','ଅଷ୍ଟମୀ','ନବମୀ','ଦଶମୀ',
      'ଏକାଦଶୀ','ଦ୍ୱାଦଶୀ','ତ୍ରୟୋଦଶୀ','ଚତୁର୍ଦ୍ଦଶୀ','ଅମାବାସ୍ୟା',
    ],
    nakshatras: [
      'ଅଶ୍ୱିନୀ','ଭରଣୀ','କୃତ୍ତିକା','ରୋହିଣୀ','ମୃଗଶୀର','ଆର୍ଦ୍ର',
      'ପୁନର୍ବସୁ','ପୁଷ୍ୟ','ଆଶ୍ଲେଷ','ମଘା','ପୂର୍ବ ଫଲ୍ଗୁନୀ','ଉତ୍ତର ଫଲ୍ଗୁନୀ',
      'ହସ୍ତ','ଚିତ୍ରା','ସ୍ୱାତୀ','ବିଶଖା','ଅନୁରାଧା','ଜ୍ୟେଷ୍ଠା',
      'ମୂଳ','ପୂର୍ବ ଆଷଢ','ଉତ୍ତର ଆଷଢ','ଶ୍ରବଣ','ଧନିଷ୍ଠ',
      'ଶତଭିଷ','ପୂର୍ବ ଭାଦ୍ରପଦ','ଉତ୍ତର ଭାଦ୍ରପଦ','ରେବତୀ',
    ],
    varas: ['ରବିବାର','ସୋମବାର','ମଙ୍ଗଳବାର','ବୁଧବାର','ଗୁରୁବାର','ଶୁକ୍ରବାର','ଶନିବାର'],
    paksha: ['ଶୁକ୍ଳ ପକ୍ଷ','କୃଷ୍ଣ ପକ୍ଷ'],
    description: 'The Odia Panji follows a lunar calendar (Vikram Samvat) with the new year (Pana Sankranti) on Mesha Sankranti in mid-April.',
    specialNote: 'The Rath Yatra of Puri (Ashadha Shukla Dwitiya) is the most sacred Odia festival. Pana Sankranti marks the Odia New Year.',
    getYear(sunSidereal, gregYear, vsYear) {
      return { num: vsYear, era: 'ଵିକ୍ରମ ସମ୍ବତ', displayLabel: `ସମ୍ବତ ${vsYear}` };
    },
  },

  // ── Nepali Patro ───────────────────────────────────────────────────────
  {
    code: 'ne',
    slug: 'nepali',
    name: 'Nepali',
    nativeName: 'नेपाली',
    calendarName: 'Nepali Patro',
    script: 'Devanagari',
    defaultCity: 'Kathmandu',
    defaultLat: 27.7172,
    defaultLng: 85.3240,
    defaultTzOffset: 5.75,
    monthSystem: 'solar',
    solarMonthMap: SOLAR_MESHA_FIRST,
    months: [
      'बैशाख','जेठ','असार','साउन','भदौ','असोज',
      'कात्तिक','मंसिर','पुस','माघ','फागुन','चैत',
    ],
    tithiShukla: [
      'प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पञ्चमी',
      'षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी',
      'एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा',
    ],
    tithiKrishna: [
      'प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पञ्चमी',
      'षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी',
      'एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','औंसी',
    ],
    nakshatras: [
      'अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा',
      'पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्वफाल्गुनी','उत्तरफाल्गुनी',
      'हस्त','चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा',
      'मूल','पूर्वाषाढा','उत्तराषाढा','श्रवण','धनिष्ठा',
      'शतभिषा','पूर्वभाद्रपदा','उत्तरभाद्रपदा','रेवती',
    ],
    varas: ['आइतवार','सोमवार','मंगलवार','बुधवार','बिहिवार','शुक्रवार','शनिवार'],
    paksha: ['शुक्ल पक्ष','कृष्ण पक्ष'],
    description: 'The Nepali Patro follows the Bikram Sambat solar calendar. The year begins with Baisakh when the Sun enters Mesha (Aries).',
    specialNote: 'Bikram Sambat is Nepal\'s official national calendar. Naya Barsha (New Year) starts on Baisakh 1, usually around April 14.',
    getYear(sunSidereal, gregYear, vsYear) {
      return { num: vsYear, era: 'विक्रम सम्वत', displayLabel: `वि.सं. ${vsYear}` };
    },
  },

  // ── ISKCON Vaishnava Panchang ──────────────────────────────────────────
  {
    code: 'iskcon',
    slug: 'iskcon',
    name: 'ISKCON',
    nativeName: 'वैष्णव',
    calendarName: 'ISKCON Vaishnava Panchang',
    script: 'Devanagari / English',
    defaultCity: 'Vrindavan',
    defaultLat: 27.5789,
    defaultLng: 77.6964,
    defaultTzOffset: 5.5,
    monthSystem: 'lunar',
    solarMonthMap: NO_SOLAR_MAP,
    months: [
      'Vishnu (Chaitra)','Madhusudana (Vaishakha)','Trivikrama (Jyeshtha)','Vamana (Ashadha)',
      'Shridhara (Shravana)','Hrishikesha (Bhadrapada)','Padmanabha (Ashvin)','Damodara (Kartika)',
      'Keshava (Margashirsha)','Narayana (Pausha)','Madhava (Magha)','Govinda (Phalguna)',
    ],
    tithiShukla: TITHI_SHUKLA_EN,
    tithiKrishna: TITHI_KRISHNA_EN,
    nakshatras: NAKSHATRA_EN,
    varas: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    paksha: ['Shukla Paksha','Krishna Paksha'],
    description: 'The ISKCON Vaishnava Panchang highlights Ekadashi fasting days, appearance and disappearance days of Vaishnava acharyas, and the sacred Damodara (Kartika) month.',
    specialNote: 'Each month is named after a form of Lord Vishnu. Kartika (Damodara) month is especially sacred. Ekadashi is observed twice monthly.',
    getYear(sunSidereal, gregYear) {
      // Gaurabda: years since Chaitanya Mahaprabhu\'s birth (1486 CE)
      // After Gaura Purnima (~Feb/March), year increments
      const sunRashiIdx = Math.floor(sunSidereal / 30);
      // If Sun is past Meena (330°+) or in Chaitra onward = new Gaurabda has started
      const gaurabda = sunRashiIdx <= 10 ? gregYear - 1486 : gregYear - 1487;
      return { num: Math.max(gaurabda, 1), era: 'Gaurabda', displayLabel: `Gaurabda ${Math.max(gaurabda, 1)}` };
    },
  },
];

// ── Lookup helpers ─────────────────────────────────────────────────────────
export function getRegionBySlug(slug: string): RegionDef | undefined {
  return REGIONS.find(r => r.slug === slug);
}

export function getSolarMonthIndex(region: RegionDef, sunSidereal: number): number {
  const sunRashiIdx = Math.floor(sunSidereal / 30) % 12;
  if (region.monthSystem !== 'solar' || region.solarMonthMap.length === 0) return -1;
  return region.solarMonthMap[sunRashiIdx];
}

export function getRegionalTithiName(region: RegionDef, tithiNumber: number, paksha: 'Shukla' | 'Krishna'): string {
  // tithiNumber is 1-30; 1-15 = Shukla Pratipada…Purnima; 16-30 = Krishna Pratipada…Amavasya
  const idx = (tithiNumber - 1) % 15; // 0-14
  if (paksha === 'Shukla') return region.tithiShukla[idx] || TITHI_SHUKLA_EN[idx];
  return region.tithiKrishna[idx] || TITHI_KRISHNA_EN[idx];
}

export function getRegionalNakshatraName(region: RegionDef, nakshatraIdx: number): string {
  return region.nakshatras[nakshatraIdx] || NAKSHATRA_EN[nakshatraIdx];
}

export function getRegionalVaraName(region: RegionDef, weekday: number): string {
  return region.varas[weekday] || ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][weekday];
}
