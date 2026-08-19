// Shared FAQ content for Jyotish calculator pages — see
// docs/content-drafts/calculator-pages/_shared-faq-template.md (approved 2026-08-19).
// Q1 and Q2 are verbatim on every page; Q3 keeps its sentence structure but
// swaps the parenthetical example per page where the template specifies one.

export interface CalcFaqItem {
  q: string;
  a: string;
}

export const CALC_FAQ_Q1: CalcFaqItem = {
  q: 'What calculation method does this tool use?',
  a: 'This tool uses the Drik (astronomical) method with Lahiri Ayanamsha, the same standard used across PanchangPath. Planetary positions come from a high-precision ephemeris (astronomy-engine, based on VSOP87/ELP-2000 orbital theory) rather than simplified lookup tables — the same calculation engine used for every Panchang, Muhurta, and Kundali tool on this site.',
};

export const CALC_FAQ_Q2: CalcFaqItem = {
  q: 'How accurate are the results?',
  a: "Planetary and Lagna positions are computed from a high-precision ephemeris (astronomy-engine, based on VSOP87/ELP-2000 orbital theory), accurate to a few arcseconds. The site's Lahiri ayanamsha — the sidereal correction applied to those positions — is a fixed formula that runs slightly off from published, Swiss-Ephemeris-based reference values: about an arcminute today, growing slowly over time. For sign, Nakshatra, or house placement this is negligible in nearly every case — but the largest real source of error isn't the math at all, it's input: a result near any boundary is sensitive to the exact birth date, time, and location entered, and a birth time off by even a few minutes can shift a boundary-adjacent placement.",
};

export function calcFaqQ3(example: string = 'marriage, health, major purchases'): CalcFaqItem {
  return {
    q: 'Should I make decisions based on this?',
    a: `Treat this as a traditional Jyotish framework, not a guarantee. Nothing on PanchangPath constitutes religious or professional astrological guidance — for decisions that matter (${example}), these results are a starting point for your own judgment or a consultation, not a substitute for either.`,
  };
}

export function sharedCalcFaq(q3Example?: string): CalcFaqItem[] {
  return [CALC_FAQ_Q1, CALC_FAQ_Q2, calcFaqQ3(q3Example)];
}
