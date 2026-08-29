// Shared FAQ content for Jyotish calculator pages — see
// docs/content-drafts/calculator-pages/_shared-faq-template.md (approved 2026-08-19).
// Q1 and Q2 are verbatim on every page; Q3 keeps its sentence structure but
// swaps the parenthetical example per page where the template specifies one.

export interface CalcFaqItem {
  q: string;
  qHi: string;
  a: string;
  aHi: string;
}

export const CALC_FAQ_Q1: CalcFaqItem = {
  q: 'What calculation method does this tool use?',
  qHi: 'यह उपकरण कौन सी गणना पद्धति उपयोग करता है?',
  a: 'This tool uses the Drik (astronomical) method with Lahiri Ayanamsha, the same standard used across PanchangPath. Planetary positions come from a high-precision ephemeris (astronomy-engine, based on VSOP87/ELP-2000 orbital theory) rather than simplified lookup tables — the same calculation engine used for every Panchang, Muhurta, and Kundali tool on this site.',
  aHi: 'यह उपकरण लाहिड़ी अयनांश के साथ द्रिक (खगोलीय) पद्धति का उपयोग करता है, वही मानक जो पूरे पंचांगपथ में उपयोग होता है। ग्रह स्थितियां सरल लुकअप सारणियों के बजाय एक उच्च-सटीकता एफेमेरिस (astronomy-engine, VSOP87/ELP-2000 कक्षीय सिद्धांत पर आधारित) से प्राप्त होती हैं — यही गणना इंजन इस साइट के प्रत्येक पंचांग, मुहूर्त और कुंडली उपकरण में उपयोग होता है।',
};

export const CALC_FAQ_Q2: CalcFaqItem = {
  q: 'How accurate are the results?',
  qHi: 'परिणाम कितने सटीक हैं?',
  a: "Planetary and Lagna positions are computed from a high-precision ephemeris (astronomy-engine, based on VSOP87/ELP-2000 orbital theory), accurate to a few arcseconds. The site's Lahiri ayanamsha — the sidereal correction applied to those positions — is a fixed formula that runs slightly off from published, Swiss-Ephemeris-based reference values: about an arcminute today, growing slowly over time. For sign, Nakshatra, or house placement this is negligible in nearly every case — but the largest real source of error isn't the math at all, it's input: a result near any boundary is sensitive to the exact birth date, time, and location entered, and a birth time off by even a few minutes can shift a boundary-adjacent placement.",
  aHi: 'ग्रह और लग्न की स्थितियां एक उच्च-सटीकता एफेमेरिस (astronomy-engine, VSOP87/ELP-2000 कक्षीय सिद्धांत पर आधारित) से परिकलित की जाती हैं, जो कुछ आर्कसेकंड तक सटीक होती हैं। साइट का लाहिड़ी अयनांश — इन स्थितियों पर लागू सिडेरियल सुधार — एक निश्चित सूत्र है जो प्रकाशित, स्विस-एफेमेरिस-आधारित संदर्भ मूल्यों से थोड़ा हटकर चलता है: आज लगभग एक आर्कमिनट, जो समय के साथ धीरे-धीरे बढ़ रहा है। राशि, नक्षत्र, या भाव निर्धारण के लिए यह लगभग हर मामले में नगण्य है — लेकिन त्रुटि का सबसे बड़ा वास्तविक स्रोत गणित नहीं, बल्कि इनपुट है: किसी सीमा-रेखा के पास का परिणाम दर्ज किए गए सटीक जन्म तिथि, समय, और स्थान के प्रति संवेदनशील होता है, और कुछ मिनटों की गलत जन्म-समय भी सीमा-निकट स्थिति को बदल सकती है।',
};

export function calcFaqQ3(
  example: string = 'marriage, health, major purchases',
  exampleHi: string = 'विवाह, स्वास्थ्य, बड़ी खरीदारी',
): CalcFaqItem {
  return {
    q: 'Should I make decisions based on this?',
    qHi: 'क्या मुझे इसके आधार पर निर्णय लेने चाहिए?',
    a: `Treat this as a traditional Jyotish framework, not a guarantee. Nothing on PanchangPath constitutes religious or professional astrological guidance — for decisions that matter (${example}), these results are a starting point for your own judgment or a consultation, not a substitute for either.`,
    aHi: `इसे एक पारंपरिक ज्योतिष ढांचा मानें, गारंटी नहीं। पंचांगपथ पर कुछ भी धार्मिक या पेशेवर ज्योतिषीय मार्गदर्शन नहीं माना जाना चाहिए — महत्वपूर्ण निर्णयों (${exampleHi}) के लिए, ये परिणाम आपके अपने विवेक या किसी परामर्श की शुरुआत मात्र हैं, किसी भी विकल्प का स्थान नहीं।`,
  };
}

export function sharedCalcFaq(q3Example?: string, q3ExampleHi?: string): CalcFaqItem[] {
  return [CALC_FAQ_Q1, CALC_FAQ_Q2, calcFaqQ3(q3Example, q3ExampleHi)];
}
