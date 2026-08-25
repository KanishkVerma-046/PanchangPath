// Mangal Dosha (Kuja Dosha / "Manglik") house check + classical cancellation (Dosha Bhanga)
// logic, shared by jyotish/mangal-dosha.astro's calculator.
//
// Sign indices throughout: 0=Mesha 1=Vrishabha 2=Mithuna 3=Karka 4=Simha 5=Kanya 6=Tula
// 7=Vrishchika 8=Dhanu 9=Makara 10=Kumbha 11=Meena.
//
// Cancellation rules and their classical strength were cross-checked against multiple
// independent astrology sources (2026-08-25): Mars in its own sign (Mesha/Vrishchika),
// Mars exalted (Makara), Cancer/Leo Lagna (where Mars is yogakaraka), and Jupiter's
// conjunction with Mars are consistently described as FULL, near-unanimous cancellations
// across classical sources. Mars in a "weakening" sign (Karka/Simha/Kumbha/Meena) and the
// Moon's conjunction with Mars are recognised as reducing factors but with more mixed
// treatment across sources — one source explicitly calls Moon's influence "one mild
// modifier" rather than a full cancellation — so those two are treated as reducing
// severity rather than clearing the dosha outright.
//
// This only checks conjunction (angular proximity), not the broader classical graha
// drishti (aspect) definition for Jupiter/Moon — matches the scope the calculator already
// had before this file existed, and is stated explicitly rather than implied.

export const MANGAL_DOSHA_HOUSES = [1, 2, 4, 7, 8, 12] as const;

/** Classical house of `subjectSign` counted from `refSign` (1-indexed). */
export function marsHouseFrom(subjectSign: number, refSign: number): number {
  return ((subjectSign - refSign + 12) % 12) + 1;
}

export type CancelRuleKey = 'ownSign' | 'exalted' | 'yogakarakaLagna' | 'weakSign' | 'jupiterConjunct' | 'moonConjunct';
export type CancelStrength = 'Full' | 'Strong' | 'Moderate' | 'Partial';

export interface CancelRule {
  key: CancelRuleKey;
  strength: CancelStrength;
  applies: boolean;
}

export interface ReferenceHouse {
  ref: 'lagna' | 'moon' | 'venus';
  sign: number;
  house: number;
  isDosha: boolean;
}

export interface MangalDoshaInput {
  marsSign: number;
  lagnaSign: number;
  moonSign: number;
  venusSign: number;
  /** Absolute angular separation between Jupiter and Mars, in degrees. */
  jupiterMarsOrbDeg: number;
  /** Absolute angular separation between the Moon and Mars, in degrees. */
  moonMarsOrbDeg: number;
}

export type MangalDoshaSeverity = 'none' | 'cancelled' | 'low' | 'high';

export interface MangalDoshaResult {
  doshaCount: number;
  referenceHouses: ReferenceHouse[];
  present: boolean;
  cancelled: boolean;
  severity: MangalDoshaSeverity;
  cancelRules: CancelRule[];
}

// Rules whose classical agreement is strong enough to be treated as clearing the dosha
// outright, not just softening it. See file header for sourcing.
const FULL_CANCEL_KEYS: CancelRuleKey[] = ['ownSign', 'exalted', 'yogakarakaLagna', 'jupiterConjunct'];

export function evaluateMangalDosha(input: MangalDoshaInput): MangalDoshaResult {
  const { marsSign, lagnaSign, moonSign, venusSign, jupiterMarsOrbDeg, moonMarsOrbDeg } = input;

  const referenceHouses: ReferenceHouse[] = (
    [
      ['lagna', lagnaSign],
      ['moon', moonSign],
      ['venus', venusSign],
    ] as const
  ).map(([ref, sign]) => {
    const house = marsHouseFrom(marsSign, sign);
    return { ref, sign, house, isDosha: (MANGAL_DOSHA_HOUSES as readonly number[]).includes(house) };
  });

  const doshaCount = referenceHouses.filter(r => r.isDosha).length;
  const present = doshaCount > 0;

  const cancelRules: CancelRule[] = [
    { key: 'ownSign',         strength: 'Full',     applies: marsSign === 0 || marsSign === 7 },
    { key: 'exalted',         strength: 'Full',     applies: marsSign === 9 },
    { key: 'yogakarakaLagna', strength: 'Full',     applies: lagnaSign === 3 || lagnaSign === 4 },
    { key: 'jupiterConjunct', strength: 'Full',     applies: jupiterMarsOrbDeg < 10 },
    { key: 'weakSign',        strength: 'Partial',  applies: [3, 4, 10, 11].includes(marsSign) },
    { key: 'moonConjunct',    strength: 'Moderate', applies: moonMarsOrbDeg < 10 },
  ];

  if (!present) {
    return { doshaCount, referenceHouses, present, cancelled: false, severity: 'none', cancelRules };
  }

  const fullCancelApplies = cancelRules.some(r => FULL_CANCEL_KEYS.includes(r.key) && r.applies);
  if (fullCancelApplies) {
    return { doshaCount, referenceHouses, present, cancelled: true, severity: 'cancelled', cancelRules };
  }

  const anyReducingApplies = cancelRules.some(r => r.applies); // weakSign / moonConjunct only, here
  const severity: MangalDoshaSeverity = doshaCount >= 2 && !anyReducingApplies ? 'high' : 'low';
  return { doshaCount, referenceHouses, present, cancelled: false, severity, cancelRules };
}
