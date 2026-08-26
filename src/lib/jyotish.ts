// jyotish.ts — shared data + calculation library for Jyotish / Astrology calculators.
// Corrected 2026-08-18: contrary to this file's old note, static Astro's client <script>
// blocks CAN import from local .ts modules (see CLAUDE.md's Critical Gotchas) — most of this
// file's calculation math historically lived duplicated inline in each page's <script> block
// instead, which is exactly the divergence risk the SEO-prerender rollout is retiring page by
// page. Pancha Pakshi's engine below is the first calculation logic added directly here.

import { sunriseUTC, moonLongitude, lahiriAyanamsha, sunTrueLongitude } from './panchang';

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
  traits: string;   // personality profile paragraph (English)
}

// Merged 2026-08-26 (Jyotish Tier-1 prerender pass): traits/traitsHi promoted from the richer
// local array that used to live only in nakshatra.astro's client <script> — see NAKSHATRA_TRAITS_HI
// below for the Hindi parallel array. Both nakshatra.astro's frontmatter (prerendered "All 27
// Nakshatras" grid) and its client <script> now import this single array so they can't diverge.
export const NAKSHATRAS: Nakshatra[] = [
  { n: 'Ashwini', h: 'अश्विनी', lord: 'Ketu', yoni: 'Horse', gana: 'Deva', nadi: 'Adi', varna: 'Vaishya', deity: 'Ashwini Kumaras', symbol: 'Horse\'s head', p: ['Chu', 'Che', 'Cho', 'La'], traits: 'Quick-minded and energetically pioneering, you start projects with great enthusiasm and possess natural healing instincts. Impatience can undermine follow-through, but your courage and spontaneity make you a natural trailblazer and leader.' },
  { n: 'Bharani', h: 'भरणी', lord: 'Venus', yoni: 'Elephant', gana: 'Manushya', nadi: 'Madhya', varna: 'Mleccha', deity: 'Yama', symbol: 'Yoni', p: ['Li', 'Lu', 'Le', 'Lo'], traits: 'Intense, creative and deeply responsible, you carry great burdens with strength and purpose. Passionate and fiercely determined, you are drawn to life\'s extremes — beauty, art and deep transformation. Truth matters to you above all.' },
  { n: 'Krittika', h: 'कृत्तिका', lord: 'Sun', yoni: 'Sheep', gana: 'Rakshasa', nadi: 'Antya', varna: 'Brahmin', deity: 'Agni', symbol: 'Razor / Flame', p: ['A', 'I', 'U', 'E'], traits: 'Sharp-minded, ambitious and highly critical, you burn away the impure and demand excellence from yourself and others. Your fiery clarity can be uncompromising, but it is also your greatest strength — cutting through illusion to find truth.' },
  { n: 'Rohini', h: 'रोहिणी', lord: 'Moon', yoni: 'Serpent', gana: 'Manushya', nadi: 'Antya', varna: 'Shudra', deity: 'Brahma', symbol: 'Chariot / Ox cart', p: ['O', 'Va', 'Vi', 'Vu'], traits: 'Charming, artistic and deeply sensual, you have a natural magnetism and love of beauty, fertility and comfort. Highly creative and pleasure-loving, you may become possessive of what you cherish. Stability and aesthetic richness are your life\'s rewards.' },
  { n: 'Mrigashira', h: 'मृगशिरा', lord: 'Mars', yoni: 'Serpent', gana: 'Deva', nadi: 'Madhya', varna: 'Vaishya', deity: 'Soma', symbol: 'Deer\'s head', p: ['Ve', 'Vo', 'Ka', 'Ki'], traits: 'Eternally curious and gently searching, you are a seeker of the ideal — in love, knowledge and beauty. Sensitive, communicative and restless, you bring fresh perspectives and creative insight wherever you go.' },
  { n: 'Ardra', h: 'आर्द्रा', lord: 'Rahu', yoni: 'Dog', gana: 'Manushya', nadi: 'Adi', varna: 'Mleccha', deity: 'Rudra', symbol: 'Teardrop', p: ['Ku', 'Gha', 'Ing', 'Ja'], traits: 'Intense and transformative, you possess a sharp and penetrating intellect capable of thriving through storms of change. Your life may include dramatic disruptions, but each one deepens your insight. Raw, honest and unafraid of the dark.' },
  { n: 'Punarvasu', h: 'पुनर्वसु', lord: 'Jupiter', yoni: 'Cat', gana: 'Deva', nadi: 'Adi', varna: 'Brahmin', deity: 'Aditi', symbol: 'Quiver of arrows', p: ['Ke', 'Ko', 'Ha', 'Hi'], traits: 'Optimistic, philosophical and gifted with renewal, you bounce back from difficulties with inspiring resilience. Generous, expansive and freedom-loving, you are happiest when learning, growing and sharing wisdom with others.' },
  { n: 'Pushya', h: 'पुष्य', lord: 'Saturn', yoni: 'Sheep', gana: 'Deva', nadi: 'Madhya', varna: 'Kshatriya', deity: 'Brihaspati', symbol: 'Cow\'s udder / Lotus', p: ['Hu', 'He', 'Ho', 'Da'], traits: 'Nurturing, devoted and deeply traditional, you are a natural caretaker who brings stability, prosperity and spiritual warmth to those around you. Patient and principled, your inner strength grows steadily over time.' },
  { n: 'Ashlesha', h: 'अश्लेषा', lord: 'Mercury', yoni: 'Cat', gana: 'Rakshasa', nadi: 'Antya', varna: 'Mleccha', deity: 'Nagas', symbol: 'Coiled serpent', p: ['Di', 'Du', 'De', 'Do'], traits: 'Shrewd, perceptive and emotionally complex, you possess great strategic intelligence and a powerful ability to read people. Persuasive and resilient, you can be secretive, but your determination and psychological depth are formidable gifts.' },
  { n: 'Magha', h: 'मघा', lord: 'Ketu', yoni: 'Rat', gana: 'Rakshasa', nadi: 'Antya', varna: 'Shudra', deity: 'Pitris', symbol: 'Royal throne', p: ['Ma', 'Mi', 'Mu', 'Me'], traits: 'Proud, regal and rooted in ancestral tradition, you are a natural leader with a strong sense of lineage and dignity. Generous and commanding, you thrive in positions of authority and honour the past as a foundation for greatness.' },
  { n: 'Purva Phalguni', h: 'पूर्व फाल्गुनी', lord: 'Venus', yoni: 'Rat', gana: 'Manushya', nadi: 'Madhya', varna: 'Brahmin', deity: 'Bhaga', symbol: 'Front legs of bed', p: ['Mo', 'Ta', 'Ti', 'Tu'], traits: 'Creative, romantic and pleasure-loving, you radiate natural charisma and a love of luxury, beauty and sensory experience. Generous in love and friendship, you are a devoted partner and gifted artist who thrives in rest and celebration.' },
  { n: 'Uttara Phalguni', h: 'उत्तर फाल्गुनी', lord: 'Sun', yoni: 'Cow', gana: 'Manushya', nadi: 'Antya', varna: 'Kshatriya', deity: 'Aryaman', symbol: 'Back legs of bed', p: ['Te', 'To', 'Pa', 'Pi'], traits: 'Reliable, helpful and ethically disciplined, you are the steady, dependable pillar others lean on. Balancing creativity with service, you seek long-term relationships and commitments built on mutual respect and shared values.' },
  { n: 'Hasta', h: 'हस्त', lord: 'Moon', yoni: 'Buffalo', gana: 'Deva', nadi: 'Adi', varna: 'Vaishya', deity: 'Savitar', symbol: 'Hand / Fist', p: ['Pu', 'Sha', 'Na', 'Tha'], traits: 'Clever, resourceful and exceptionally skilled with your hands, you are a master of craft, humour and practical intelligence. Sharp-witted and adaptable, you manifest your intentions quickly and have a gift for healing and service.' },
  { n: 'Chitra', h: 'चित्रा', lord: 'Mars', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Kshatriya', deity: 'Vishwakarma', symbol: 'Bright jewel / Pearl', p: ['Pe', 'Po', 'Ra', 'Ri'], traits: 'Artistic, glamorous and technically brilliant, you have an extraordinary aesthetic sensibility and a relentless drive for perfection. Innovative, visually gifted and detail-oriented, you build beautiful things with precision and passion.' },
  { n: 'Swati', h: 'स्वाती', lord: 'Rahu', yoni: 'Buffalo', gana: 'Deva', nadi: 'Adi', varna: 'Mleccha', deity: 'Vayu', symbol: 'Coral / Young shoot', p: ['Ru', 'Re', 'Ro', 'Ta'], traits: 'Independent, diplomatic and fair-minded like the wind, you bend without breaking and excel in commerce, networking and mediation. Self-motivated and socially skilled, you value personal freedom and bring balance wherever you go.' },
  { n: 'Vishakha', h: 'विशाखा', lord: 'Jupiter', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Brahmin', deity: 'Indra-Agni', symbol: 'Triumphal gateway', p: ['Ti', 'Tu', 'Te', 'To'], traits: 'Goal-oriented, ambitious and fiercely competitive, you are a driven achiever who stays focused until every aim is fulfilled. Patient and persistent beneath your intensity, you have great power to transform society through principled leadership.' },
  { n: 'Anuradha', h: 'अनुराधा', lord: 'Saturn', yoni: 'Deer', gana: 'Deva', nadi: 'Adi', varna: 'Kshatriya', deity: 'Mitra', symbol: 'Lotus / Staff', p: ['Na', 'Ni', 'Nu', 'Ne'], traits: 'Devoted, organized and resilient, you excel at building lasting friendships and sustaining organisations. Spiritually inclined and adaptable, you thrive through adversity and your quiet loyalty inspires deep bonds of trust in all relationships.' },
  { n: 'Jyeshtha', h: 'ज्येष्ठा', lord: 'Mercury', yoni: 'Deer', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Brahmin', deity: 'Indra', symbol: 'Circular amulet', p: ['No', 'Ya', 'Yi', 'Yu'], traits: 'Senior, protective and intensely responsible, you carry a deep sense of duty toward those in your care. Proud and courageous, with a fierce loyalty that demands respect. Jealousy and control are the shadows you are here to master.' },
  { n: 'Mula', h: 'मूल', lord: 'Ketu', yoni: 'Dog', gana: 'Rakshasa', nadi: 'Antya', varna: 'Mleccha', deity: 'Nirriti', symbol: 'Tied roots', p: ['Ye', 'Yo', 'Bha', 'Bhi'], traits: 'Philosophical, investigative and unafraid to uproot the old, you dive to the root of everything. A truth-seeker who questions foundations and transforms through destruction. Freedom, inquiry and spiritual liberation are your deepest drives.' },
  { n: 'Purva Ashadha', h: 'पूर्वाषाढा', lord: 'Venus', yoni: 'Monkey', gana: 'Manushya', nadi: 'Adi', varna: 'Brahmin', deity: 'Apas', symbol: 'Elephant tusk / Fan', p: ['Bhu', 'Dha', 'Bha', 'Pha'], traits: 'Optimistic, proud and powerfully persuasive, you have a magnetic drive and an unshakeable belief in your path. Resilient under opposition and gifted with natural leadership, you inspire others through your vision and spirited determination.' },
  { n: 'Uttara Ashadha', h: 'उत्तराषाढा', lord: 'Sun', yoni: 'Mongoose', gana: 'Manushya', nadi: 'Madhya', varna: 'Kshatriya', deity: 'Vishvadevas', symbol: 'Elephant tusk / Planks', p: ['Bhe', 'Bho', 'Ja', 'Ji'], traits: 'Ethical, determined and universally principled, you move slowly but surely toward lofty, lasting goals. An enduring leader with a broad perspective and deep integrity — your victories, once won, are never easily reversed.' },
  { n: 'Shravana', h: 'श्रवण', lord: 'Moon', yoni: 'Monkey', gana: 'Deva', nadi: 'Antya', varna: 'Mleccha', deity: 'Vishnu', symbol: 'Three footprints / Ear', p: ['Khi', 'Khu', 'Khe', 'Kho'], traits: 'An exceptional listener and lifelong learner, you have an organized mind, wide knowledge and a deep connection to the spoken and sacred word. Social, empathetic and skilled in communication, you preserve and transmit wisdom across generations.' },
  { n: 'Dhanishtha', h: 'धनिष्ठा', lord: 'Mars', yoni: 'Lion', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Shudra', deity: 'Vasus', symbol: 'Drum / Flute', p: ['Ga', 'Gi', 'Gu', 'Ge'], traits: 'Musical, courageous and powerfully ambitious, you have natural rhythm, group leadership and the drive to accumulate wealth. Generous by nature but career-focused, you may at times prioritise achievement over intimate relationships.' },
  { n: 'Shatabhisha', h: 'शतभिषा', lord: 'Rahu', yoni: 'Horse', gana: 'Rakshasa', nadi: 'Adi', varna: 'Mleccha', deity: 'Varuna', symbol: 'Empty circle / 100 healers', p: ['Go', 'Sa', 'Si', 'Su'], traits: 'Independent, scientific and deeply philosophical, you are drawn to healing, hidden knowledge and the mysteries of the cosmos. Introspective and secretive, you carry strong humanitarian ideals and work best when given complete creative freedom.' },
  { n: 'Purva Bhadrapada', h: 'पूर्वभाद्रपदा', lord: 'Jupiter', yoni: 'Lion', gana: 'Manushya', nadi: 'Madhya', varna: 'Brahmin', deity: 'Aja Ekapada', symbol: 'Front of funeral cot', p: ['Se', 'So', 'Da', 'Di'], traits: 'Intense, passionate and deeply idealistic, you are willing to sacrifice comfort and convention for your beliefs. Spiritually powerful and courageous, you can be extreme or impulsive — yet your visionary fire ignites real transformation.' },
  { n: 'Uttara Bhadrapada', h: 'उत्तरभाद्रपदा', lord: 'Saturn', yoni: 'Cow', gana: 'Manushya', nadi: 'Antya', varna: 'Kshatriya', deity: 'Ahir Budhnya', symbol: 'Back of funeral cot / Snake', p: ['Du', 'Tha', 'Jha', 'Nya'], traits: 'Wise, patient and profoundly compassionate, you are a deep thinker with extraordinary inner strength and spiritual endurance. A quiet warrior who serves selflessly, your power grows beneath the surface and impacts lives in ways rarely visible.' },
  { n: 'Revati', h: 'रेवती', lord: 'Mercury', yoni: 'Elephant', gana: 'Deva', nadi: 'Antya', varna: 'Brahmin', deity: 'Pushan', symbol: 'Fish / Drum', p: ['De', 'Do', 'Cha', 'Chi'], traits: 'Compassionate, nurturing and deeply spiritual, you carry a universal love and the gift of empathy. Artistic, imaginative and gentle, you are a bridge-builder who completes cycles and guides souls gently across transitions and thresholds.' },
];

// Hindi parallel to each entry's `traits` above, same index order (Ashwini..Revati).
export const NAKSHATRA_TRAITS_HI: string[] = [
  'तीव्र बुद्धि और ऊर्जावान रूप से अग्रणी, आप उत्साह के साथ कार्य आरंभ करते हैं और स्वाभाविक उपचार क्षमता रखते हैं। अधीरता निरंतरता को कमजोर कर सकती है, लेकिन आपका साहस और सहजता आपको एक स्वाभाविक अग्रदूत और नेता बनाती है।',
  'तीव्र, रचनात्मक और गहराई से जिम्मेदार, आप बड़े बोझ को शक्ति और उद्देश्य के साथ उठाते हैं। जुनूनी और दृढ़, आप जीवन की चरम सीमाओं — सौंदर्य, कला और गहरे परिवर्तन — की ओर आकर्षित होते हैं। सत्य आपके लिए सबसे अधिक मायने रखता है।',
  'तीक्ष्ण बुद्धि, महत्वाकांक्षी और अत्यंत आलोचनात्मक, आप अशुद्धि को जला देते हैं और स्वयं व दूसरों से उत्कृष्टता की मांग करते हैं। आपकी अग्निमय स्पष्टता कठोर हो सकती है, लेकिन यह आपकी सबसे बड़ी शक्ति भी है — भ्रम को काटकर सत्य तक पहुंचना।',
  'आकर्षक, कलात्मक और गहराई से कामुक, आपमें स्वाभाविक चुंबकत्व और सौंदर्य, उर्वरता व आराम के प्रति प्रेम है। अत्यंत रचनात्मक और सुख-प्रिय, आप जो प्रिय है उसके प्रति स्वामित्व की भावना रख सकते हैं। स्थिरता और सौंदर्यात्मक समृद्धि आपके जीवन के पुरस्कार हैं।',
  'सदैव जिज्ञासु और कोमलता से खोजते हुए, आप प्रेम, ज्ञान और सौंदर्य में आदर्श के खोजी हैं। संवेदनशील, संचारशील और बेचैन, आप जहां भी जाते हैं ताजा दृष्टिकोण और रचनात्मक अंतर्दृष्टि लाते हैं।',
  'तीव्र और परिवर्तनकारी, आपमें एक तीक्ष्ण और भेदक बुद्धि है जो परिवर्तन के तूफानों से गुजरने में सक्षम है। आपके जीवन में नाटकीय व्यवधान आ सकते हैं, लेकिन हर एक आपकी अंतर्दृष्टि को गहरा करता है। कच्चे, ईमानदार और अंधकार से निर्भय।',
  'आशावादी, दार्शनिक और नवीनीकरण के उपहार से संपन्न, आप कठिनाइयों से प्रेरणादायक लचीलेपन के साथ उबरते हैं। उदार, विस्तृत और स्वतंत्रता-प्रिय, आप सीखने, बढ़ने और दूसरों के साथ ज्ञान बांटने में सबसे प्रसन्न रहते हैं।',
  'पालन-पोषण करने वाला, समर्पित और गहराई से पारंपरिक, आप एक स्वाभाविक देखभालकर्ता हैं जो आसपास के लोगों को स्थिरता, समृद्धि और आध्यात्मिक गर्मजोशी प्रदान करते हैं। धैर्यवान और सिद्धांतवादी, आपकी आंतरिक शक्ति समय के साथ स्थिर रूप से बढ़ती है।',
  'चतुर, अंतर्दृष्टिपूर्ण और भावनात्मक रूप से जटिल, आपमें महान रणनीतिक बुद्धि और लोगों को पढ़ने की शक्तिशाली क्षमता है। मनाने में कुशल और लचीले, आप गोपनीय हो सकते हैं, लेकिन आपकी दृढ़ता और मनोवैज्ञानिक गहराई असाधारण उपहार हैं।',
  'गर्वित, राजसी और पैतृक परंपरा में निहित, आप एक स्वाभाविक नेता हैं जिसमें वंश और गरिमा की प्रबल भावना है। उदार और आदेशात्मक, आप अधिकार के पदों पर फलते-फूलते हैं और महानता की नींव के रूप में अतीत का सम्मान करते हैं।',
  'रचनात्मक, रोमांटिक और सुख-प्रिय, आप स्वाभाविक करिश्मा और विलासिता, सौंदर्य व संवेदी अनुभव के प्रति प्रेम बिखेरते हैं। प्रेम और मित्रता में उदार, आप एक समर्पित साथी और प्रतिभाशाली कलाकार हैं जो विश्राम व उत्सव में फलते-फूलते हैं।',
  'विश्वसनीय, सहायक और नैतिक रूप से अनुशासित, आप वह स्थिर, भरोसेमंद स्तंभ हैं जिस पर दूसरे निर्भर करते हैं। रचनात्मकता को सेवा के साथ संतुलित करते हुए, आप पारस्परिक सम्मान और साझा मूल्यों पर निर्मित दीर्घकालिक रिश्ते और प्रतिबद्धताएं चाहते हैं।',
  'चतुर, साधनसंपन्न और अपने हाथों से असाधारण रूप से कुशल, आप शिल्प, हास्य और व्यावहारिक बुद्धि के स्वामी हैं। तीक्ष्ण-बुद्धि और अनुकूलनशील, आप अपने इरादों को तेजी से साकार करते हैं और उपचार व सेवा का उपहार रखते हैं।',
  'कलात्मक, चमकदार और तकनीकी रूप से प्रतिभाशाली, आपमें असाधारण सौंदर्य-बोध और पूर्णता के लिए अथक प्रयास है। नवोन्मेषी, दृश्य रूप से प्रतिभाशाली और विस्तार-उन्मुख, आप सटीकता और जुनून के साथ सुंदर चीजें बनाते हैं।',
  'हवा की तरह स्वतंत्र, कूटनीतिक और निष्पक्ष, आप बिना टूटे झुकते हैं और वाणिज्य, नेटवर्किंग व मध्यस्थता में उत्कृष्ट हैं। स्व-प्रेरित और सामाजिक रूप से कुशल, आप व्यक्तिगत स्वतंत्रता को महत्व देते हैं और जहां भी जाते हैं संतुलन लाते हैं।',
  'समर्पित, संगठित और लचीले, आप स्थायी मित्रता बनाने और संगठनों को बनाए रखने में उत्कृष्ट हैं। आध्यात्मिक रूप से इच्छुक और अनुकूलनशील, आप विपरीत परिस्थितियों से फलते-फूलते हैं और आपकी शांत निष्ठा सभी रिश्तों में गहरे विश्वास के बंधन को प्रेरित करती है।',
  'वरिष्ठ, सुरक्षात्मक और अत्यंत जिम्मेदार, आप अपनी देखभाल में रहने वालों के प्रति कर्तव्य की गहरी भावना रखते हैं। गर्वित और साहसी, प्रबल निष्ठा के साथ जो सम्मान की मांग करती है। ईर्ष्या और नियंत्रण वे छायाएं हैं जिन्हें आपको साधना है।',
  'दार्शनिक, अन्वेषक और पुराने को उखाड़ने से न डरने वाले, आप हर चीज की जड़ तक जाते हैं। एक सत्य-खोजी जो नींवों पर प्रश्न उठाता है और विनाश के माध्यम से रूपांतरित होता है। स्वतंत्रता, जिज्ञासा और आध्यात्मिक मुक्ति आपकी गहरी प्रेरणाएं हैं।',
  'आशावादी, गर्वित और शक्तिशाली रूप से प्रेरक, आपमें चुंबकीय ऊर्जा और अपने मार्ग में अटूट विश्वास है। विरोध के सामने लचीले और स्वाभाविक नेतृत्व से संपन्न, आप अपनी दृष्टि और उत्साही दृढ़ संकल्प से दूसरों को प्रेरित करते हैं।',
  'नैतिक, दृढ़ और सार्वभौमिक रूप से सिद्धांतवादी, आप धीरे लेकिन निश्चित रूप से उच्च, स्थायी लक्ष्यों की ओर बढ़ते हैं। व्यापक दृष्टिकोण और गहरी सत्यनिष्ठा वाले स्थायी नेता — आपकी जीतें, एक बार प्राप्त होने पर, आसानी से पलटती नहीं हैं।',
  'एक असाधारण श्रोता और आजीवन शिक्षार्थी, आपमें एक व्यवस्थित मन, व्यापक ज्ञान और बोले गए व पवित्र शब्द से गहरा जुड़ाव है। सामाजिक, सहानुभूतिपूर्ण और संचार में कुशल, आप पीढ़ियों में ज्ञान को संरक्षित और प्रसारित करते हैं।',
  'संगीतमय, साहसी और शक्तिशाली रूप से महत्वाकांक्षी, आपमें स्वाभाविक लय, समूह नेतृत्व और धन संचय करने की प्रेरणा है। स्वभाव से उदार लेकिन करियर-केंद्रित, आप कभी-कभी घनिष्ठ रिश्तों से अधिक उपलब्धि को प्राथमिकता दे सकते हैं।',
  'स्वतंत्र, वैज्ञानिक और गहराई से दार्शनिक, आप उपचार, छिपे ज्ञान और ब्रह्मांड के रहस्यों की ओर आकर्षित होते हैं। आत्मनिरीक्षक और गोपनीय, आप प्रबल मानवतावादी आदर्श रखते हैं और पूर्ण रचनात्मक स्वतंत्रता मिलने पर सबसे अच्छा काम करते हैं।',
  'तीव्र, जुनूनी और गहराई से आदर्शवादी, आप अपने विश्वासों के लिए आराम और परंपरा त्यागने को तैयार हैं। आध्यात्मिक रूप से शक्तिशाली और साहसी, आप चरम या आवेगी हो सकते हैं — फिर भी आपकी दूरदर्शी अग्नि वास्तविक परिवर्तन प्रज्ज्वलित करती है।',
  'विवेकपूर्ण, धैर्यवान और गहराई से करुणामय, आप असाधारण आंतरिक शक्ति और आध्यात्मिक सहनशक्ति वाले गहन विचारक हैं। एक शांत योद्धा जो निःस्वार्थ भाव से सेवा करता है, आपकी शक्ति सतह के नीचे बढ़ती है और जीवन को उन तरीकों से प्रभावित करती है जो शायद ही दिखाई देते हैं।',
  'दयालु, पालन-पोषण करने वाले और गहराई से आध्यात्मिक, आप एक सार्वभौमिक प्रेम और सहानुभूति का उपहार वहन करते हैं। कलात्मक, कल्पनाशील और कोमल, आप एक सेतु-निर्माता हैं जो चक्रों को पूर्ण करता है और आत्माओं को कोमलता से संक्रमणों व दहलीजों के पार मार्गदर्शन करता है।',
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
  color: string;
  benefit: string;
  benefitHi: string;
  mantra: string;
  day: string;
  metal: string;
  wear: string;
}

// Promoted 2026-08-26 (Jyotish Tier-1 prerender pass) from the richer local array that used to
// live only in rudraksha.astro's client <script> (color/benefitHi/day/metal/wear weren't in the
// old thinner version here). Both rudraksha.astro's frontmatter (prerendered "All 14 Mukhis"
// grid) and its client <script> now import this single array so they can't diverge.
export const RUDRAKSHA: RudrakshaBead[] = [
  { mukhi: 1, deity: 'Shiva (Mahadeva)', planet: 'Sun', color: '#f59e0b', benefit: 'Supreme consciousness, strong willpower, heart health and leadership. Removes sins of the past and connects the wearer to divine energy.', benefitHi: 'सर्वोच्च चेतना, प्रबल इच्छाशक्ति, हृदय स्वास्थ्य और नेतृत्व। भूतकाल के पापों को दूर करता है और धारक को दिव्य ऊर्जा से जोड़ता है।', mantra: 'Om Hreem Namah', day: 'Sunday', metal: 'Gold', wear: 'Right hand / neck' },
  { mukhi: 2, deity: 'Ardhanareeshvara', planet: 'Moon', color: '#6366f1', benefit: 'Emotional balance, harmony in relationships, calms the mind. Strengthens bonds and improves communication between partners.', benefitHi: 'भावनात्मक संतुलन, रिश्तों में सामंजस्य, मन को शांत करता है। बंधनों को मजबूत करता है और साझेदारों के बीच संवाद में सुधार करता है।', mantra: 'Om Namah', day: 'Monday', metal: 'Silver', wear: 'Left hand / neck' },
  { mukhi: 3, deity: 'Agni / Brahma', planet: 'Mars', color: '#ef4444', benefit: 'Confidence, freedom from past karma and fear. Boosts courage, vitality and helps overcome enemies. Good for siblings and communication.', benefitHi: 'आत्मविश्वास, पूर्व कर्म और भय से मुक्ति। साहस, जीवनशक्ति बढ़ाता है और शत्रुओं पर विजय पाने में सहायक। भाई-बहनों और संचार के लिए शुभ।', mantra: 'Om Kleem Namah', day: 'Tuesday', metal: 'Copper', wear: 'Right hand' },
  { mukhi: 4, deity: 'Brahma', planet: 'Mercury', color: '#10b981', benefit: 'Intellect, creativity and concentration. Removes mental fog and enhances communication, learning and creative power.', benefitHi: 'बुद्धि, रचनात्मकता और एकाग्रता। मानसिक धुंधलापन दूर करता है और संचार, सीखने व रचनात्मक क्षमता बढ़ाता है।', mantra: 'Om Hreem Namah', day: 'Wednesday', metal: 'Gold', wear: 'Right hand' },
  { mukhi: 5, deity: 'Kalagni / Pancha Rudra', planet: 'Jupiter', color: '#f59e0b', benefit: 'General wellbeing, wisdom, peace of mind and spiritual growth. The most universally safe and beneficial bead — suitable for all.', benefitHi: 'सामान्य कल्याण, ज्ञान, मानसिक शांति और आध्यात्मिक विकास। सबसे सुरक्षित और लाभकारी दाना — सभी के लिए उपयुक्त।', mantra: 'Om Hreem Namah', day: 'Thursday', metal: 'Gold', wear: 'Any finger / neck' },
  { mukhi: 6, deity: 'Kartikeya', planet: 'Venus', color: '#a78bfa', benefit: 'Willpower, attraction, material comforts and luxury. Enhances creativity, relationships and removes obstacles from personal life.', benefitHi: 'इच्छाशक्ति, आकर्षण, भौतिक सुख-सुविधाएं और विलासिता। रचनात्मकता, रिश्तों को बढ़ाता है और व्यक्तिगत जीवन की बाधाएं दूर करता है।', mantra: 'Om Hreem Hoom Namah', day: 'Friday', metal: 'Silver', wear: 'Right hand' },
  { mukhi: 7, deity: 'Mahalakshmi / Saptarishi', planet: 'Saturn', color: '#3b82f6', benefit: 'Financial prosperity, removes poverty and illness. Channels Saturn energy positively for career stability and longevity.', benefitHi: 'आर्थिक समृद्धि, दरिद्रता और रोग दूर करता है। करियर स्थिरता व दीर्घायु के लिए शनि ऊर्जा को सकारात्मक दिशा देता है।', mantra: 'Om Hoom Namah', day: 'Saturday', metal: 'Gold/Silver', wear: 'Right hand' },
  { mukhi: 8, deity: 'Ganesha', planet: 'Rahu', color: '#8b5cf6', benefit: 'Removes obstacles and negativity. Brings success in endeavors, protects against black magic and sudden misfortune.', benefitHi: 'बाधाएं और नकारात्मकता दूर करता है। प्रयासों में सफलता लाता है, तंत्र-मंत्र और अचानक दुर्भाग्य से रक्षा करता है।', mantra: 'Om Ganeshaya Namah', day: 'Saturday', metal: 'Gold', wear: 'Right hand' },
  { mukhi: 9, deity: 'Durga / Bhairava', planet: 'Ketu', color: '#ec4899', benefit: 'Fearlessness, spiritual power and liberation. Enhances intuition, protects from evil eye and accelerates spiritual growth.', benefitHi: 'निर्भयता, आध्यात्मिक शक्ति और मुक्ति। अंतर्ज्ञान बढ़ाता है, बुरी नजर से रक्षा करता है और आध्यात्मिक विकास को गति देता है।', mantra: 'Om Hreem Hoom Namah', day: 'Tuesday', metal: 'Copper', wear: 'Right hand' },
  { mukhi: 10, deity: 'Vishnu (Dashavatara)', planet: 'All Planets', color: '#0ea5e9', benefit: 'Peace, divine protection and harmony. Balances all planetary energies simultaneously. Suitable for anyone facing multiple challenges.', benefitHi: 'शांति, दिव्य सुरक्षा और सामंजस्य। सभी ग्रहों की ऊर्जाओं को एक साथ संतुलित करता है। कई चुनौतियों का सामना कर रहे किसी भी व्यक्ति के लिए उपयुक्त।', mantra: 'Om Hreem Namah Namah', day: 'Any', metal: 'Gold', wear: 'Neck' },
  { mukhi: 11, deity: 'Hanuman / Ekadasha Rudra', planet: 'Sun', color: '#f97316', benefit: 'Meditation, intuition and the spirit of adventure. Enhances leadership qualities and removes ego. Good for spiritual practitioners.', benefitHi: 'ध्यान, अंतर्ज्ञान और साहसिक भावना। नेतृत्व गुण बढ़ाता है और अहंकार दूर करता है। आध्यात्मिक साधकों के लिए शुभ।', mantra: 'Om Hreem Hoom Namah', day: 'Sunday', metal: 'Gold', wear: 'Neck' },
  { mukhi: 12, deity: 'Aditya (Sun God)', planet: 'Sun', color: '#eab308', benefit: 'Radiance, leadership and removal of obstacles. Enhances fame, confidence and connection to the solar divine energy.', benefitHi: 'तेज, नेतृत्व और बाधाओं का निवारण। प्रसिद्धि, आत्मविश्वास और सौर दिव्य ऊर्जा से जुड़ाव बढ़ाता है।', mantra: 'Om Kraum Sraum Raum Namah', day: 'Sunday', metal: 'Gold', wear: 'Right hand / neck' },
  { mukhi: 13, deity: 'Vishwakarma / Kartikeya', planet: 'Venus / Jupiter', color: '#14b8a6', benefit: 'Prosperity, worldly success and creative power. Bestows all material and spiritual pleasures and heightens sensory perception.', benefitHi: 'समृद्धि, सांसारिक सफलता और रचनात्मक शक्ति। सभी भौतिक और आध्यात्मिक सुख प्रदान करता है और इंद्रिय बोध को तीव्र करता है।', mantra: 'Om Hreem Namah', day: 'Friday', metal: 'Silver', wear: 'Right hand' },
  { mukhi: 14, deity: 'Shiva (Deva Mani)', planet: 'Saturn / Rahu', color: '#1e3a5f', benefit: 'The highest protection and ultimate divine power. Enhances intuition, third-eye awareness and spiritual transformation. Use with guidance.', benefitHi: 'सर्वोच्च सुरक्षा और परम दिव्य शक्ति। अंतर्ज्ञान, तृतीय नेत्र जागरूकता और आध्यात्मिक रूपांतरण बढ़ाता है। मार्गदर्शन के साथ उपयोग करें।', mantra: 'Om Namah', day: 'Saturday', metal: 'Silver', wear: 'Neck (after consultation)' },
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

// ── Rashi reference profiles ──────────────────────────────────────────────
// Promoted 2026-08-26 (Jyotish Tier-1 prerender pass) from rashi.astro's client-only DESC/COLOR/
// GEM/etc. arrays (they never had a jyotish.ts home before — RASHIS/RASHI_HI/RASHI_EN above are a
// separate, thinner, historically-unused set). rashi.astro's frontmatter (new "All 12 Rashis"
// reference grid) and its client <script> both import this single array.
export interface RashiProfile {
  name: string; h: string; en: string; lord: string; elem: string; qual: string;
  color: string; colorHi: string; day: string; gem: string; gemHi: string;
  compat: string; num: string; desc: string; descHi: string;
}
export const RASHI_PROFILES: RashiProfile[] = [
  { name: 'Mesha', h: 'मेष', en: 'Aries', lord: 'Mars', elem: 'Fire', qual: 'Movable', color: 'Red, Orange', colorHi: 'लाल, नारंगी', day: 'Tuesday', gem: 'Red Coral', gemHi: 'लाल मूंगा', compat: 'Leo, Sagittarius', num: '1, 9', desc: 'Energetic, pioneering and bold. Mesha natives are natural leaders — courageous, competitive and quick to act, though sometimes impatient.', descHi: 'ऊर्जावान, अग्रणी और साहसी। मेष निवासी स्वाभाविक नेता होते हैं — साहसी, प्रतिस्पर्धी और तुरंत कार्य करने वाले, हालांकि कभी-कभी अधीर।' },
  { name: 'Vrishabha', h: 'वृषभ', en: 'Taurus', lord: 'Venus', elem: 'Earth', qual: 'Fixed', color: 'White, Cream', colorHi: 'सफेद, क्रीम', day: 'Friday', gem: 'Diamond / Pearl', gemHi: 'हीरा / मोती', compat: 'Virgo, Capricorn', num: '2, 6', desc: 'Steady, patient and sensual. Vrishabha values comfort, beauty and security, with strong determination and loyalty.', descHi: 'स्थिर, धैर्यवान और कामुक। वृषभ आराम, सौंदर्य और सुरक्षा को महत्व देता है, प्रबल दृढ़ता और वफादारी के साथ।' },
  { name: 'Mithuna', h: 'मिथुन', en: 'Gemini', lord: 'Mercury', elem: 'Air', qual: 'Dual', color: 'Green, Yellow', colorHi: 'हरा, पीला', day: 'Wednesday', gem: 'Emerald', gemHi: 'पन्ना', compat: 'Libra, Aquarius', num: '3, 5', desc: 'Curious, witty and communicative. Mithuna is versatile and intellectual, thriving on variety, learning and conversation.', descHi: 'जिज्ञासु, चतुर और संचारशील। मिथुन बहुमुखी और बौद्धिक है, विविधता, सीखने और बातचीत में फलता-फूलता है।' },
  { name: 'Karka', h: 'कर्क', en: 'Cancer', lord: 'Moon', elem: 'Water', qual: 'Movable', color: 'Silver, Pearl', colorHi: 'चांदी, मोती', day: 'Monday', gem: 'Pearl', gemHi: 'मोती', compat: 'Scorpio, Pisces', num: '2, 7', desc: 'Nurturing, emotional and intuitive. Karka is deeply caring and protective of family, with a strong inner world.', descHi: 'पालन-पोषण करने वाला, भावुक और सहज-ज्ञानी। कर्क परिवार के प्रति गहराई से देखभाल करने वाला और सुरक्षात्मक है, प्रबल आंतरिक जगत के साथ।' },
  { name: 'Simha', h: 'सिंह', en: 'Leo', lord: 'Sun', elem: 'Fire', qual: 'Fixed', color: 'Gold, Orange', colorHi: 'सोना, नारंगी', day: 'Sunday', gem: 'Ruby', gemHi: 'माणिक्य', compat: 'Aries, Sagittarius', num: '1, 4', desc: 'Confident, generous and charismatic. Simha loves recognition and leads with warmth, pride and creativity.', descHi: 'आत्मविश्वासी, उदार और करिश्माई। सिंह पहचान पसंद करता है और गर्मजोशी, गर्व व रचनात्मकता के साथ नेतृत्व करता है।' },
  { name: 'Kanya', h: 'कन्या', en: 'Virgo', lord: 'Mercury', elem: 'Earth', qual: 'Dual', color: 'Grey, Dark Green', colorHi: 'ग्रे, गहरा हरा', day: 'Wednesday', gem: 'Emerald', gemHi: 'पन्ना', compat: 'Taurus, Capricorn', num: '3, 5', desc: 'Analytical, practical and meticulous. Kanya is service-minded, detail-oriented and seeks perfection.', descHi: 'विश्लेषणात्मक, व्यावहारिक और सूक्ष्म। कन्या सेवा-प्रधान, विस्तार-उन्मुख है और पूर्णता की खोज करती है।' },
  { name: 'Tula', h: 'तुला', en: 'Libra', lord: 'Venus', elem: 'Air', qual: 'Movable', color: 'White, Light Blue', colorHi: 'सफेद, हल्का नीला', day: 'Friday', gem: 'Diamond', gemHi: 'हीरा', compat: 'Gemini, Aquarius', num: '1, 6', desc: 'Harmonious, diplomatic and charming. Tula craves balance, partnership and beauty, with a strong sense of fairness.', descHi: 'सामंजस्यपूर्ण, कूटनीतिक और आकर्षक। तुला संतुलन, साझेदारी और सौंदर्य चाहता है, प्रबल निष्पक्षता की भावना के साथ।' },
  { name: 'Vrishchika', h: 'वृश्चिक', en: 'Scorpio', lord: 'Mars', elem: 'Water', qual: 'Fixed', color: 'Red, Maroon', colorHi: 'लाल, मैरून', day: 'Tuesday', gem: 'Red Coral', gemHi: 'लाल मूंगा', compat: 'Cancer, Pisces', num: '2, 3', desc: 'Intense, passionate and secretive. Vrishchika is determined and transformative, with deep emotional power.', descHi: 'तीव्र, जुनूनी और गोपनीय। वृश्चिक दृढ़ और परिवर्तनकारी है, गहरी भावनात्मक शक्ति के साथ।' },
  { name: 'Dhanu', h: 'धनु', en: 'Sagittarius', lord: 'Jupiter', elem: 'Fire', qual: 'Dual', color: 'Yellow, Orange', colorHi: 'पीला, नारंगी', day: 'Thursday', gem: 'Yellow Sapphire', gemHi: 'पुखराज', compat: 'Aries, Leo', num: '3, 9', desc: 'Optimistic, philosophical and adventurous. Dhanu loves freedom, travel and the pursuit of truth and wisdom.', descHi: 'आशावादी, दार्शनिक और साहसिक। धनु स्वतंत्रता, यात्रा और सत्य व ज्ञान की खोज पसंद करता है।' },
  { name: 'Makara', h: 'मकर', en: 'Capricorn', lord: 'Saturn', elem: 'Earth', qual: 'Movable', color: 'Black, Dark Blue', colorHi: 'काला, गहरा नीला', day: 'Saturday', gem: 'Blue Sapphire', gemHi: 'नीलम', compat: 'Taurus, Virgo', num: '6, 8', desc: 'Ambitious, disciplined and responsible. Makara is hardworking and practical, climbing steadily toward goals.', descHi: 'महत्वाकांक्षी, अनुशासित और जिम्मेदार। मकर परिश्रमी और व्यावहारिक है, लक्ष्यों की ओर स्थिर रूप से बढ़ता है।' },
  { name: 'Kumbha', h: 'कुम्भ', en: 'Aquarius', lord: 'Saturn', elem: 'Air', qual: 'Fixed', color: 'Sky Blue, Violet', colorHi: 'आसमानी नीला, बैंगनी', day: 'Saturday', gem: 'Blue Sapphire', gemHi: 'नीलम', compat: 'Gemini, Libra', num: '4, 8', desc: 'Innovative, humanitarian and independent. Kumbha is original and forward-thinking, valuing ideals and community.', descHi: 'नवोन्मेषी, मानवतावादी और स्वतंत्र। कुम्भ मौलिक और अग्रगामी सोच वाला है, आदर्शों और समुदाय को महत्व देता है।' },
  { name: 'Meena', h: 'मीन', en: 'Pisces', lord: 'Jupiter', elem: 'Water', qual: 'Dual', color: 'Sea Green, Lavender', colorHi: 'समुद्री हरा, लैवेंडर', day: 'Thursday', gem: 'Yellow Sapphire', gemHi: 'पुखराज', compat: 'Cancer, Scorpio', num: '3, 7', desc: 'Compassionate, imaginative and spiritual. Meena is sensitive and artistic, with deep empathy and intuition.', descHi: 'दयालु, कल्पनाशील और आध्यात्मिक। मीन संवेदनशील और कलात्मक है, गहरी सहानुभूति और अंतर्ज्ञान के साथ।' },
];

// ── Lagna house reference ─────────────────────────────────────────────────
// Promoted 2026-08-26 (Jyotish Tier-1 prerender pass): lagna.astro's client script has always
// carried this static 12-house significance table (HOUSES/HOUSES_HI) interleaved with the
// computed per-chart rashi in its #house-list grid. This export is the pure static half, split
// out for lagna.astro's new "12 Houses — General Significance" prerendered reference table; the
// existing computed grid (signOfHouse, personal to each birth chart) stays client-only and
// unchanged, now reading its significance text from this same array instead of a local copy.
export const LAGNA_HOUSES: string[] = ['Self, body, personality', 'Wealth, family, speech', 'Courage, siblings, effort', 'Home, mother, happiness', 'Children, intellect, romance', 'Enemies, health, debts', 'Marriage, partnership', 'Longevity, transformation', 'Fortune, dharma, father', 'Career, status, karma', 'Gains, friends, desires', 'Loss, expenses, moksha'];
export const LAGNA_HOUSES_HI: string[] = ['स्वयं, शरीर, व्यक्तित्व', 'धन, परिवार, वाणी', 'साहस, भाई-बहन, प्रयास', 'घर, मां, सुख', 'संतान, बुद्धि, प्रेम', 'शत्रु, स्वास्थ्य, ऋण', 'विवाह, साझेदारी', 'आयु, परिवर्तन', 'भाग्य, धर्म, पिता', 'करियर, प्रतिष्ठा, कर्म', 'लाभ, मित्र, इच्छाएं', 'हानि, व्यय, मोक्ष'];

// ── Kalasarpa type/effect reference ───────────────────────────────────────
// Promoted 2026-08-26 (Jyotish Tier-1 prerender pass) from kalasarpa.astro's client-only
// KALASARPA_TYPES/KS_EFFECTS/KS_EFFECTS_HI arrays — the richest static content found in the
// 2026-08-26 scoping audit (12 types x Anuloma/Viloma = 24 reference paragraphs), previously
// invisible to crawlers since only the one paragraph matching a visitor's own chart ever rendered.
export const KALASARPA_TYPES: string[] = ['Ananta', 'Kulika', 'Vasuki', 'Shankhapala', 'Padma', 'Mahapadma', 'Takshaka', 'Karkotak', 'Shankhachud', 'Ghatak', 'Vishadhar', 'Sheshanaga'];
export interface KalasarpaEffect { a: string; v: string; aHi: string; vHi: string; }
export const KALASARPA_EFFECTS: KalasarpaEffect[] = [
  { a: 'Early life brings persistent career and financial struggles requiring extraordinary effort. Delays test patience deeply, yet those who persevere achieve remarkable success. Many great public figures carry this yoga.', v: 'Intense ambition and drive for leadership arise, but relationships and health may suffer. True transformation comes through selfless service and the cultivation of humility.', aHi: 'प्रारंभिक जीवन में करियर और वित्तीय संघर्ष निरंतर बने रहते हैं जिनके लिए असाधारण प्रयास की आवश्यकता होती है। देरी धैर्य की गहरी परीक्षा लेती है, फिर भी जो टिके रहते हैं वे उल्लेखनीय सफलता प्राप्त करते हैं। कई महान सार्वजनिक हस्तियां यह योग रखती हैं।', vHi: 'नेतृत्व की तीव्र महत्वाकांक्षा और लालसा उत्पन्न होती है, लेकिन रिश्ते और स्वास्थ्य प्रभावित हो सकते हैं। सच्चा परिवर्तन निःस्वार्थ सेवा और विनम्रता के अभ्यास से आता है।' },
  { a: 'Instability in wealth and family life — often through sudden loss — is the hallmark of this type. The desire for material security is tested repeatedly. Healing arts and service-based vocations provide the most fulfilling outlet.', v: 'Challenges arise through the maternal lineage and through deep attachments to comfort and possessions. Releasing accumulated clinging becomes the central spiritual practice.', aHi: 'धन और पारिवारिक जीवन में अस्थिरता — अक्सर अचानक हानि के रूप में — इस प्रकार की पहचान है। भौतिक सुरक्षा की इच्छा बार-बार परखी जाती है। उपचार कला और सेवा-आधारित व्यवसाय सबसे संतोषजनक मार्ग प्रदान करते हैं।', vHi: 'मातृ वंश के माध्यम से और सुख-सुविधाओं व वस्तुओं के प्रति गहरे लगाव के माध्यम से चुनौतियां आती हैं। संचित मोह को छोड़ना केंद्रीय आध्यात्मिक अभ्यास बन जाता है।' },
  { a: 'Delays and confusion afflict siblings, communication and business partnerships. The intellect is brilliant but scattered. Research, writing and solitary intellectual pursuits compensate for frustrations in personal relationships.', v: 'Mental restlessness and a relentless hunger for knowledge can come at the cost of material stability. Adaptability is both the greatest gift and the greatest challenge.', aHi: 'भाई-बहनों, संचार और व्यावसायिक साझेदारियों में देरी और भ्रम बना रहता है। बुद्धि प्रखर परंतु बिखरी हुई होती है। शोध, लेखन और एकांत बौद्धिक कार्य व्यक्तिगत संबंधों की निराशा की भरपाई करते हैं।', vHi: 'मानसिक बेचैनी और ज्ञान की अथक भूख भौतिक स्थिरता की कीमत पर आ सकती है। अनुकूलनशीलता ही सबसे बड़ा उपहार और सबसे बड़ी चुनौती दोनों है।' },
  { a: 'Emotional turbulence and disruption to home, mother and the inner life define the early path. Deep sensitivity may cause the native to absorb collective suffering. Water rituals and devotional practice bring profound relief.', v: 'Intense psychic sensitivity and an unsettled home life push the native toward surrender. Peace is found through devotion and dedicated spiritual practice rather than outer security.', aHi: 'घर, मां और आंतरिक जीवन में भावनात्मक उथल-पुथल और व्यवधान प्रारंभिक मार्ग को परिभाषित करते हैं। गहरी संवेदनशीलता के कारण सामूहिक पीड़ा को आत्मसात करना पड़ सकता है। जल अनुष्ठान और भक्ति अभ्यास गहरी राहत लाते हैं।', vHi: 'तीव्र मानसिक संवेदनशीलता और अस्थिर घरेलू जीवन व्यक्ति को समर्पण की ओर धकेलते हैं। शांति बाहरी सुरक्षा के बजाय भक्ति और समर्पित आध्यात्मिक अभ्यास से मिलती है।' },
  { a: 'One of the most powerful types — associated with extraordinary eventual achievement. Obstacles in progeny, creative expression and authority characterise the early years. Spiritual discipline and persistence unlock remarkable inner potential.', v: 'Ego conflicts and battles for recognition are recurring tests. Humility and willingness to serve without credit are the keys that unlock this yoga\'s latent greatness.', aHi: 'सबसे शक्तिशाली प्रकारों में से एक — असाधारण अंतिम उपलब्धि से जुड़ा हुआ। संतान, रचनात्मक अभिव्यक्ति और अधिकार में बाधाएं प्रारंभिक वर्षों की विशेषता हैं। आध्यात्मिक अनुशासन और दृढ़ता उल्लेखनीय आंतरिक क्षमता को खोलते हैं।', vHi: 'अहंकार संघर्ष और पहचान के लिए लड़ाइयां बार-बार होने वाली परीक्षाएं हैं। विनम्रता और बिना श्रेय के सेवा करने की इच्छा ही इस योग की गुप्त महानता को खोलने वाली कुंजियां हैं।' },
  { a: 'Karmic delays in health, service and analytical work shape the path. A methodical mind struggles with perfectionism and self-criticism. Service, healing and ego-surrender transform this yoga into mastery.', v: 'The discriminating faculty becomes hyper-developed, producing intense self-doubt. A spiritual practice emphasising acceptance and self-compassion is the essential remedy.', aHi: 'स्वास्थ्य, सेवा और विश्लेषणात्मक कार्य में कर्मिक देरी मार्ग को आकार देती है। व्यवस्थित मन पूर्णतावाद और आत्म-आलोचना से जूझता है। सेवा, उपचार और अहंकार-समर्पण इस योग को निपुणता में बदल देते हैं।', vHi: 'विवेक क्षमता अति-विकसित हो जाती है, जिससे तीव्र आत्म-संदेह उत्पन्न होता है। स्वीकृति और आत्म-करुणा पर जोर देने वाला आध्यात्मिक अभ्यास आवश्यक उपाय है।' },
  { a: 'Disruptions and sudden separations in marriage and close partnerships are recurring. Legal troubles are possible. Exceptional artistic gifts are the compensating grace — channelling creativity resolves much karma.', v: 'Restlessness in partnerships and a tendency toward abrupt separations arise. Deep inner work and devoted creative practice bring the balance that eludes outer relationships.', aHi: 'विवाह और घनिष्ठ साझेदारियों में व्यवधान और अचानक अलगाव बार-बार होते हैं। कानूनी परेशानियां संभव हैं। असाधारण कलात्मक प्रतिभा क्षतिपूर्ति करने वाली कृपा है — रचनात्मकता को दिशा देना अधिकांश कर्म का समाधान करता है।', vHi: 'साझेदारियों में बेचैनी और अचानक अलगाव की प्रवृत्ति उत्पन्न होती है। गहरा आंतरिक कार्य और समर्पित रचनात्मक अभ्यास वह संतुलन लाते हैं जो बाहरी रिश्तों में नहीं मिलता।' },
  { a: 'Sudden reversals of fortune, intense transformation and a magnetic personality characterise Karkotak. Betrayal and regeneration are recurring themes. Occult knowledge and deep psychology offer the path of power and resolution.', v: 'The secretive nature intensifies and the pull toward extremes becomes compelling. Shadow work and psycho-spiritual practice are essential for conscious evolution.', aHi: 'भाग्य में अचानक उलटफेर, तीव्र परिवर्तन और चुंबकीय व्यक्तित्व करकोटक की विशेषताएं हैं। विश्वासघात और पुनर्जनन बार-बार आने वाले विषय हैं। गुप्त ज्ञान और गहरा मनोविज्ञान शक्ति और समाधान का मार्ग प्रदान करते हैं।', vHi: 'गोपनीय स्वभाव तीव्र हो जाता है और अतियों की ओर खिंचाव बलवान होता जाता है। सचेत विकास के लिए छाया-कार्य और मनो-आध्यात्मिक अभ्यास आवश्यक हैं।' },
  { a: 'Philosophical crises and challenges in dharma, higher education and travel mark the path. Faith is tested repeatedly. Those who persist through spiritual drought find profound and lasting wisdom on the other side.', v: 'Conflict between personal belief and outer reality creates recurring suffering. Pilgrimage, scriptural study and the practice of teaching what one is learning bring deep relief.', aHi: 'दर्शन संबंधी संकट और धर्म, उच्च शिक्षा तथा यात्रा में चुनौतियां मार्ग को चिह्नित करती हैं। आस्था बार-बार परखी जाती है। जो आध्यात्मिक सूखे के दौर से गुजरते हैं वे दूसरी ओर गहन और स्थायी ज्ञान पाते हैं।', vHi: 'व्यक्तिगत विश्वास और बाहरी वास्तविकता के बीच संघर्ष बार-बार पीड़ा उत्पन्न करता है। तीर्थयात्रा, शास्त्र अध्ययन और जो सीखा जा रहा है उसे सिखाने का अभ्यास गहरी राहत लाता है।' },
  { a: 'Obstacles in career, public life and dealings with authority make Ghatak one of the most visible and testing types. The native works with exceptional diligence, often with long-delayed recognition. Worldly success eventually arrives, built on character.', v: 'Conflict with institutions and authority figures recurs. Service in a genuinely humble capacity, rather than the pursuit of power, opens the door to lasting achievement.', aHi: 'करियर, सार्वजनिक जीवन और अधिकारियों के साथ व्यवहार में बाधाएं घातक को सबसे दृश्यमान और परीक्षा लेने वाले प्रकारों में से एक बनाती हैं। व्यक्ति असाधारण परिश्रम से काम करता है, अक्सर देर से पहचान मिलती है। सांसारिक सफलता अंततः चरित्र पर निर्मित होकर आती है।', vHi: 'संस्थाओं और अधिकारियों के साथ संघर्ष बार-बार होता है। शक्ति की खोज के बजाय वास्तव में विनम्र क्षमता में सेवा करना स्थायी उपलब्धि का द्वार खोलता है।' },
  { a: 'Social isolation and gains through unconventional or hidden means characterise Vishadhar. The native is ahead of their time — a visionary humanitarian often misunderstood by contemporaries. Technology and service to the marginalised are natural callings.', v: 'Eccentric tendencies intensify and the longing to belong while remaining apart creates a painful paradox. Community service and innovative humanitarian work resolve this tension.', aHi: 'सामाजिक अलगाव और अपरंपरागत या छिपे साधनों से लाभ विषधर की विशेषताएं हैं। व्यक्ति अपने समय से आगे है — एक दूरदर्शी मानवतावादी जिसे अक्सर समकालीन लोग गलत समझते हैं। प्रौद्योगिकी और वंचितों की सेवा स्वाभाविक बुलावे हैं।', vHi: 'सनकी प्रवृत्तियां तीव्र होती हैं और अलग रहते हुए भी संबंधित होने की चाहत एक पीड़ादायक विरोधाभास पैदा करती है। सामुदायिक सेवा और नवोन्मेषी मानवतावादी कार्य इस तनाव का समाधान करते हैं।' },
  { a: 'Losses, expenses and a deep pull toward spiritual renunciation mark the most karmically loaded Kalasarpa type. The material world offers little lasting satisfaction, but the path to moksha and inner liberation becomes directly accessible.', v: 'The confusion between spiritual seeking and self-undoing must be consciously navigated. Surrender to a living spiritual tradition and devotional art are the liberating paths.', aHi: 'हानि, खर्च और आध्यात्मिक त्याग की गहरी लालसा सबसे अधिक कर्मिक भार वाले कालसर्प प्रकार को चिह्नित करते हैं। भौतिक संसार बहुत कम स्थायी संतुष्टि प्रदान करता है, लेकिन मोक्ष और आंतरिक मुक्ति का मार्ग सीधे सुलभ हो जाता है।', vHi: 'आध्यात्मिक खोज और आत्म-विनाश के बीच का भ्रम सचेत रूप से पार करना होगा। किसी जीवंत आध्यात्मिक परंपरा और भक्ति कला के प्रति समर्पण मुक्तिदायक मार्ग हैं।' },
];

// ── Pitru Paksha / Shraddha engine ────────────────────────────────────────
// Promoted 2026-08-26 (Jyotish Tier-1 prerender pass) verbatim from shraddha.astro's client
// <script> (computePitruPaksha and its helpers) — zero personal-input dependency (year only), the
// single best-ROI prerender candidate in the 2026-08-26 scoping audit. shraddha.astro's
// frontmatter (prerendered Pitru Paksha schedule table) and its client <script> (death-date/tithi
// lookup, which cross-references this same schedule) both import these exports so the schedule
// can never diverge between build time and client recalculation.
const MOON_SUN_RATE_PP = 12.19;
function findElongationPP(jdSeed: number, targetElong: number): number {
  let jd = jdSeed;
  let err = ((targetElong - (((moonLongitude(jd) - sunTrueLongitude(jd)) % 360) + 360) % 360) % 360 + 360) % 360;
  jd += err / MOON_SUN_RATE_PP;
  for (let i = 0; i < 4; i++) {
    let e = ((targetElong - (((moonLongitude(jd) - sunTrueLongitude(jd)) % 360) + 360) % 360) % 360 + 360) % 360;
    if (e > 180) e -= 360;
    jd += e / MOON_SUN_RATE_PP;
  }
  return jd;
}
// Used only for walking backward one tithi-boundary at a time in computePitruPaksha below, where
// the seed is always <1.1 days from its target -- unlike findElongationPP above (whose unsigned
// first step deliberately always advances forward to find "the next occurrence", relied on by its
// jdAmaEnd call site), this uses a signed correction from the first step so it converges to the
// *nearest* crossing rather than always jumping forward, which would overshoot by a full lunar month.
function refineTithiBoundaryPP(jdSeed: number, targetElong: number): number {
  let jd = jdSeed;
  for (let i = 0; i < 6; i++) {
    let e = ((targetElong - (((moonLongitude(jd) - sunTrueLongitude(jd)) % 360) + 360) % 360) % 360 + 360) % 360;
    if (e > 180) e -= 360;
    jd += e / MOON_SUN_RATE_PP;
  }
  return jd;
}
function findSunSiderealCrossingPP(jdSeed: number, targetDeg: number): number {
  let jd = jdSeed;
  for (let i = 0; i < 6; i++) {
    let err = targetDeg - (((sunTrueLongitude(jd) - lahiriAyanamsha(jd)) % 360) + 360) % 360;
    if (err > 180) err -= 360; if (err < -180) err += 360;
    jd += err / 0.9856;
  }
  return jd;
}
function toJDPP(y: number, m: number, d: number, h: number): number {
  let yy = y, mm = m;
  if (mm <= 2) { yy--; mm += 12; }
  const A = Math.floor(yy / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + h / 24 + B - 1524.5;
}
// Shraddha day-assignment uses Aparahna Kaal (the 4th of 5 equal parts of daylight, the
// traditional afternoon window Dharmashastra prescribes for Shraddha rites) rather than the
// sunrise-tithi rule used elsewhere on the site for festivals/Panchang elements. A tithi is
// "Aparahna-vyapini" (assigned to a calendar day) if its span overlaps that day's Aparahna
// window at all -- not just at one sampled instant, since a tithi can start or end mid-window.
// Two classical edge cases fall out of this: Vriddhi (a long tithi overlaps two consecutive
// days' Aparahna windows -- take the first day) and Kshaya (a short tithi overlaps no day's
// Aparahna window at all -- take the day whose window is temporally nearest to the tithi's span).
const PP_ND_LAT = 28.6139, PP_ND_LNG = 77.2090;
function aparahnaWindowJD(y: number, m: number, d: number): [number, number] {
  const jdNoon = toJDPP(y, m, d, 12);
  const srUTC = sunriseUTC(jdNoon, PP_ND_LAT, PP_ND_LNG, true);
  const ssUTC = sunriseUTC(jdNoon, PP_ND_LAT, PP_ND_LNG, false);
  const dayStart = toJDPP(y, m, d, 0);
  return [dayStart + (srUTC + 3 / 5 * (ssUTC - srUTC)) / 24, dayStart + (srUTC + 4 / 5 * (ssUTC - srUTC)) / 24];
}
export const PP_TITHI_NAME: Record<number, string> = { 15: 'Purnima', 16: 'Pratipada', 17: 'Dwitiya', 18: 'Tritiya', 19: 'Chaturthi', 20: 'Panchami', 21: 'Shashthi', 22: 'Saptami', 23: 'Ashtami', 24: 'Navami', 25: 'Dashami', 26: 'Ekadashi', 27: 'Dwadashi', 28: 'Trayodashi', 29: 'Chaturdashi', 30: 'Amavasya' };
export const PP_TITHI_NOTE: Record<number, string> = {
  15: 'Purnima Shraddha (for those who died on a Purnima)', 16: 'Pratipada Shraddha', 17: 'Dwitiya Shraddha', 18: 'Tritiya Shraddha',
  19: 'Chaturthi Shraddha', 20: 'Panchami Shraddha (Bharani for unmarried)', 21: 'Shashthi Shraddha', 22: 'Saptami Shraddha',
  23: 'Ashtami Shraddha', 24: 'Navami / Matru Navami (for mothers)', 25: 'Dashami Shraddha', 26: 'Ekadashi Shraddha',
  27: 'Dwadashi Shraddha (for sanyasis)', 28: 'Trayodashi Shraddha', 29: 'Chaturdashi Shraddha (for those who died unnaturally)',
  30: 'Sarva Pitru Amavasya (all ancestors, unknown tithi)',
};
export const PP_TITHI_NOTE_HI: Record<number, string> = {
  15: 'पूर्णिमा श्राद्ध (जो पूर्णिमा को मृत्यु को प्राप्त हुए)', 16: 'प्रतिपदा श्राद्ध', 17: 'द्वितीया श्राद्ध', 18: 'तृतीया श्राद्ध',
  19: 'चतुर्थी श्राद्ध', 20: 'पंचमी श्राद्ध (अविवाहितों हेतु भरणी)', 21: 'षष्ठी श्राद्ध', 22: 'सप्तमी श्राद्ध',
  23: 'अष्टमी श्राद्ध', 24: 'नवमी / मातृ नवमी (माताओं हेतु)', 25: 'दशमी श्राद्ध', 26: 'एकादशी श्राद्ध',
  27: 'द्वादशी श्राद्ध (संन्यासियों हेतु)', 28: 'त्रयोदशी श्राद्ध', 29: 'चतुर्दशी श्राद्ध (अप्राकृतिक मृत्यु वालों हेतु)',
  30: 'सर्व पितृ अमावस्या (सभी पूर्वज, अज्ञात तिथि)',
};
export interface PitruPakshaDay { date: string; m: number; d: number; tithi: string; note: string; t: number; }
// Computes Pitru Paksha (Purnima start -> Sarva Pitru Amavasya end) for New Delhi/IST for any year.
// Verified against drikpanchang.com for 2025/2026/2027: exact match for all three years, all 16
// rows present with no gaps or duplicate dates (see the original 2026-07-21 fix commit for the
// two rejected simpler approaches this version replaced).
export function computePitruPaksha(year: number): PitruPakshaDay[] {
  const PP_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const jdSeed = toJDPP(year, 8, 20, 12);
  const jdKanyaStart = findSunSiderealCrossingPP(jdSeed, 150);
  const jdKanyaEnd = findSunSiderealCrossingPP(jdKanyaStart + 5, 180);
  let jdAmaEnd = findElongationPP(jdKanyaStart, 360);
  if (jdAmaEnd < jdKanyaStart) jdAmaEnd = findElongationPP(jdKanyaStart + 1, 360);
  if (jdAmaEnd > jdKanyaEnd) jdAmaEnd = findElongationPP(jdKanyaEnd - 1, 360);

  // Precisely locate every tithi boundary from Purnima-start (elongation 168°) through
  // Amavasya-end (elongation 360°/0°), walking backward 12° at a time from jdAmaEnd.
  const NUM_B = 17; // elongations 168,180,...,360 -> bounds for the 16 tithis Purnima(15)..Amavasya(30)
  const boundaries = new Array(NUM_B);
  boundaries[NUM_B - 1] = jdAmaEnd;
  for (let k = NUM_B - 2; k >= 0; k--) {
    boundaries[k] = refineTithiBoundaryPP(boundaries[k + 1] - 1, 168 + 12 * k);
  }

  const approxCalDate = new Date(Date.UTC(year, 7, 20));
  approxCalDate.setUTCDate(approxCalDate.getUTCDate() + Math.round(jdAmaEnd - jdSeed) - 23);
  const days: { y: number; m: number; d: number; aStart: number; aEnd: number }[] = [];
  const cursor = new Date(approxCalDate);
  for (let i = 0; i < 46; i++) {
    const y = cursor.getUTCFullYear(), m = cursor.getUTCMonth() + 1, d = cursor.getUTCDate();
    const [aStart, aEnd] = aparahnaWindowJD(y, m, d);
    days.push({ y, m, d, aStart, aEnd });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const schedule: PitruPakshaDay[] = [];
  for (let k = 0; k < NUM_B - 1; k++) {
    const t = 15 + k;
    const tStart = boundaries[k], tEnd = boundaries[k + 1];
    const overlapping = days.filter(day => Math.min(tEnd, day.aEnd) > Math.max(tStart, day.aStart));
    let chosen: { y: number; m: number; d: number; aStart: number; aEnd: number } | undefined;
    if (overlapping.length >= 1) {
      chosen = overlapping[0]; // Vriddhi (overlaps 2 days): use the first, per convention
    } else {
      let bestGap = Infinity;
      for (const day of days) {
        const gap = Math.max(tStart - day.aEnd, day.aStart - tEnd, 0); // Kshaya: nearest day's window
        if (gap < bestGap) { bestGap = gap; chosen = day; }
      }
    }
    schedule.push({ date: `${PP_MONTHS[chosen!.m - 1]} ${chosen!.d}`, m: chosen!.m, d: chosen!.d, tithi: PP_TITHI_NAME[t], note: PP_TITHI_NOTE[t], t });
  }
  return schedule;
}

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
