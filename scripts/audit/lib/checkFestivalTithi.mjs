// Warn-only consistency check: does each festival entry's date fall on the Tithi its name says
// it should, according to this site's own engine? The engine (calculatePanchang) samples a fixed
// 6 AM New Delhi time and models no observance rules (Pradosh, Nishita, Madhyahna, moonrise,
// Smarta vs Vaishnava), so a published date can legitimately differ from it. Those known,
// justified cases live in ALLOWLIST with a one-line reason; anything else is a warning to
// investigate against DrikPanchang (New Delhi), never an automatic failure.

/** Tithi numbers: 1–15 Shukla Pratipada–Purnima, 16–29 Krishna Pratipada–Chaturdashi, 30 Amavasya. */
const S = (n) => n;
const K = (n) => 15 + n;
const AMAVASYA = 30;

const TITHI_NAMES = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];

export function tithiLabel(n) {
  if (n === 15) return 'Shukla Purnima';
  if (n === AMAVASYA) return 'Amavasya';
  return n < 15 ? `Shukla ${TITHI_NAMES[n - 1]}` : `Krishna ${TITHI_NAMES[n - 16]}`;
}

/** The Tithi each festival is observed on, keyed by its `name` in festivals.ts. */
export const EXPECTED_TITHI = {
  'Basant Panchami': S(5),
  'Jaya Ekadashi': S(11),
  'Maha Shivaratri': K(14),
  'Holika Dahan': S(15),
  'Holi': K(1),
  'Ugadi / Gudi Padwa': S(1),
  'Ram Navami': S(9),
  'Hanuman Jayanti': S(15),
  'Akshaya Tritiya': S(3),
  'Buddha Purnima': S(15),
  'Nirjala Ekadashi': S(11),
  'Guru Purnima': S(15),
  'Naga Panchami': S(5),
  'Raksha Bandhan': S(15),
  'Krishna Janmashtami': K(8),
  'Ganesh Chaturthi': S(4),
  'Ganesh Visarjan': S(14),
  'Navratri Begins': S(1),
  'Durga Ashtami': S(8),
  'Maha Navami': S(9),
  'Vijayadashami / Dussehra': S(10),
  'Sharad Purnima': S(15),
  'Karva Chauth': K(4),
  'Ahoi Ashtami': K(8),
  'Dhanteras': K(13),
  'Narak Chaturdashi': K(14),
  'Diwali': AMAVASYA,
  'Govardhan Puja': S(1),
  'Bhai Dooj': S(2),
  'Chhath Puja': S(6),
  'Dev Uthani Ekadashi': S(11),
  'Tulsi Vivah': S(12),
  'Kartik Purnima / Dev Deepawali': S(15),
  'Vivah Panchami': S(5),
  'Gita Jayanti / Mokshada Ekadashi': S(11),
};

/** Festivals fixed by the solar or Gregorian calendar, not a Tithi — never checked. */
export const NON_TITHI = new Set(['Lohri', 'Makar Sankranti', 'Pongal', 'Christmas']);

/**
 * Known, justified exceptions: { name, date, reason }. Keep each reason to one line. Only add an
 * entry when the date has been checked against DrikPanchang (New Delhi) or equivalent and the
 * difference is explained by an observance rule or the 6 AM sampling, not when it merely looks
 * plausible.
 */
export const ALLOWLIST = [
  // 2025 (dates audited 2026-10-30 against DrikPanchang New Delhi + prokerala.com)
  { name: 'Basant Panchami', date: '2025-02-02', reason: 'Panchami begins after sunrise and prevails by sunset; DrikPanchang New Delhi + prokerala.com give Feb 2.' },
  { name: 'Maha Shivaratri', date: '2025-02-26', reason: 'Nishita-kala rule: Chaturdashi prevails at midnight; DrikPanchang New Delhi + prokerala.com.' },
  { name: 'Holika Dahan', date: '2025-03-13', reason: 'Pradosh-vyapini Purnima (begins after sunrise, prevails at sunset); DrikPanchang New Delhi + prokerala.com.' },
  { name: 'Holi', date: '2025-03-14', reason: 'Day after Holika Dahan (Purnima still at sunrise); DrikPanchang New Delhi + prokerala.com.' },
  { name: 'Krishna Janmashtami', date: '2025-08-15', reason: 'Smarta date, Nishita rule: Ashtami begins 11:49 PM and prevails at midnight; DrikPanchang New Delhi + prokerala.com (ISKCON: Aug 16).' },
  { name: 'Dhanteras', date: '2025-10-18', reason: 'Pradosh-vyapini Trayodashi (prevails at sunset); DrikPanchang New Delhi + prokerala.com.' },
  { name: 'Diwali', date: '2025-10-20', reason: 'Pradosh-vyapini Amavasya: 3:44 PM Oct 20 -> 5:54 PM Oct 21 covers only Oct 20\'s evening; DrikPanchang New Delhi (prokerala.com, Ujjain: Oct 21).' },
  { name: 'Chhath Puja', date: '2025-10-27', reason: '6 AM sampling artifact: Shashthi prevails at true sunrise (6:30 AM); DrikPanchang New Delhi + prokerala.com.' },
  { name: 'Dev Uthani Ekadashi', date: '2025-11-01', reason: 'Smarta date: Ekadashi 9:11 AM Nov 1 -> 7:31 AM Nov 2; DrikPanchang New Delhi + prokerala.com (Vaishnava: Nov 2).' },
  // 2026
  { name: 'Maha Shivaratri', date: '2026-02-15', reason: 'Nishita-kala rule: Chaturdashi 5:04 PM Feb 15 -> 5:34 PM Feb 16 prevails at midnight; DrikPanchang New Delhi + prokerala.com.' },
  { name: 'Ugadi / Gudi Padwa', date: '2026-03-19', reason: 'Amavasya ends 6:52 AM Mar 19 and Pratipada ends before Mar 20\'s sunrise, so the day it begins is taken; DrikPanchang New Delhi + prokerala.com.' },
  { name: 'Ram Navami', date: '2026-03-26', reason: 'Smarta date, Madhyahna rule: Navami from 11:48 AM Mar 26; DrikPanchang New Delhi + prokerala.com (ISKCON: Mar 27).' },
  { name: 'Akshaya Tritiya', date: '2026-04-19', reason: 'Tritiya 10:49 AM Apr 19 -> 7:27 AM Apr 20, Purvahna rule (puja muhurat 10:49 AM-12:20 PM Apr 19); DrikPanchang New Delhi + 2 sources.' },
  { name: 'Ganesh Chaturthi', date: '2026-09-14', reason: 'Madhyahna-vyapini Chaturthi (begins after sunrise); reconfirmed via WebSearch in the 2026-08-22 SEO pass (CLAUDE.md).' },
  { name: 'Maha Navami', date: '2026-10-19', reason: 'Ashtami ends 10:51 AM, then Navami prevails; DrikPanchang New Delhi lists Maha Navami (and Durga Ashtami) on Oct 19.' },
  { name: 'Vijayadashami / Dussehra', date: '2026-10-20', reason: 'Aparahna rule: Dashami from 12:50 PM covers Aparahna (1:14-3:30 PM); DrikPanchang New Delhi + panchangbodh.com (prokerala.com, Ujjain: Oct 21).' },
  { name: 'Sharad Purnima', date: '2026-10-25', reason: 'Night rule: Purnima begins 11:55 AM and prevails through the night; DrikPanchang New Delhi + prokerala.com.' },
  { name: 'Ahoi Ashtami', date: '2026-11-01', reason: 'Observed when Ashtami prevails at dusk; DrikPanchang + daanyam.in (festivals.ts comment).' },
  { name: 'Dhanteras', date: '2026-11-06', reason: 'Pradosh rule: Trayodashi 10:30 AM Nov 6 -> 10:47 AM Nov 7; DrikPanchang New Delhi + muhuratchoghadiya.com.' },
  { name: 'Diwali', date: '2026-11-08', reason: 'Pradosh-vyapini Amavasya (begins after sunrise, prevails at sunset); date corrected and verified 2026-07 (CLAUDE.md).' },
  { name: 'Dev Uthani Ekadashi', date: '2026-11-20', reason: 'Smarta date: Ekadashi 7:15 AM Nov 20 -> before Nov 21\'s sunrise (touches no sunrise); DrikPanchang New Delhi + prokerala.com (Vaishnava: Nov 21).' },
  { name: 'Tulsi Vivah', date: '2026-11-21', reason: '6 AM sampling artifact: Dwadashi prevails at true sunrise (6:48 AM); DrikPanchang New Delhi + prokerala.com give Nov 21.' },
  // 2027
  { name: 'Maha Shivaratri', date: '2027-03-06', reason: 'Nishita-kala rule: Chaturdashi prevails at midnight; 2027 block matched DrikPanchang (festivals.ts comment).' },
  { name: 'Holika Dahan', date: '2027-03-21', reason: 'Pradosh-vyapini Purnima (begins 6:21 PM); verified against DrikPanchang New Delhi, 2026-08-27 audit (festivals.ts comment).' },
  { name: 'Holi', date: '2027-03-22', reason: 'Day after Holika Dahan (Purnima still at sunrise); verified against DrikPanchang New Delhi, 2026-08-27 audit (festivals.ts comment).' },
  { name: 'Navratri Begins', date: '2027-09-30', reason: 'Pratipada begins after sunrise; DrikPanchang-verified in the 2026-08-27 audit (CLAUDE.md, Batch 2).' },
  { name: 'Maha Navami', date: '2027-10-08', reason: 'Navami begins after sunrise and prevails by evening; 2027 block matched DrikPanchang (festivals.ts comment).' },
  { name: 'Vijayadashami / Dussehra', date: '2027-10-09', reason: 'Aparahna-vyapini Dashami (begins after sunrise); 2027 block matched DrikPanchang (festivals.ts comment).' },
  { name: 'Sharad Purnima', date: '2027-10-14', reason: 'Night rule: Purnima 6:49 PM Oct 14 -> 7:16 PM Oct 15 prevails at midnight Oct 14; DrikPanchang New Delhi + prokerala.com.' },
  { name: 'Karva Chauth', date: '2027-10-18', reason: 'Chaturthi at moonrise (begins after sunset); DrikPanchang-verified in the 2026-08-27 audit (CLAUDE.md, Batch 2).' },
];

/**
 * @param festivals {{ name: string, date: string }[]}
 * @param sample {(dateISO: string) => { engine: number }} — the engine's Tithi number for a date
 * @returns {{ warnings, allowlisted, unclassified, staleAllowlist }}
 */
export function checkFestivalTithis(festivals, sample, { expected = EXPECTED_TITHI, nonTithi = NON_TITHI, allowlist = ALLOWLIST } = {}) {
  const allow = new Map(allowlist.map((a) => [`${a.name}|${a.date}`, a]));
  const usedAllow = new Set();
  const warnings = [];
  const allowlisted = [];
  const unclassified = [];
  for (const f of festivals) {
    if (nonTithi.has(f.name)) continue;
    const want = expected[f.name];
    if (want === undefined) {
      unclassified.push(f);
      continue;
    }
    const samples = sample(f.date);
    if (samples.engine === want) continue;
    const key = `${f.name}|${f.date}`;
    const finding = { ...f, expected: want, samples };
    if (allow.has(key)) {
      usedAllow.add(key);
      allowlisted.push({ ...finding, reason: allow.get(key).reason });
    } else {
      warnings.push(finding);
    }
  }
  const staleAllowlist = allowlist.filter((a) => !usedAllow.has(`${a.name}|${a.date}`));
  return { warnings, allowlisted, unclassified, staleAllowlist };
}

/** Human-readable report lines for checkFestivalTithis()' result. */
export function formatFestivalTithiReport({ warnings, allowlisted, unclassified, staleAllowlist }) {
  const lines = [];
  const row = (f) => {
    const s = f.samples;
    const extra = s.sunrise === undefined ? '' :
      ` | sunrise ${s.sunriseTime}: ${tithiLabel(s.sunrise)}; sunset ${s.sunsetTime}: ${tithiLabel(s.sunset)}; midnight: ${tithiLabel(s.midnight)}`;
    return `${f.date}  ${f.name} — expected ${tithiLabel(f.expected)}, engine (6 AM) ${tithiLabel(s.engine)}${extra}`;
  };
  lines.push(`${warnings.length} warning(s):`);
  for (const f of warnings) lines.push(`  WARN ${row(f)}`);
  lines.push(`${allowlisted.length} allowlisted exception(s):`);
  for (const f of allowlisted) lines.push(`  ok   ${row(f)}\n         reason: ${f.reason}`);
  if (unclassified.length) {
    lines.push(`${unclassified.length} festival(s) with no expected Tithi (add to EXPECTED_TITHI or NON_TITHI):`);
    for (const f of unclassified) lines.push(`  ?    ${f.date}  ${f.name}`);
  }
  if (staleAllowlist.length) {
    lines.push(`${staleAllowlist.length} allowlist entr(y/ies) no longer needed (date now matches, or entry gone):`);
    for (const a of staleAllowlist) lines.push(`  -    ${a.date}  ${a.name}`);
  }
  return lines;
}
