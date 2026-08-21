// FAQ content for /faq — grouped by category, English + Hindi pairs.
// `html: true` marks answers that contain safe inline markup (e.g. links to
// other tools); everything else is plain text swapped via data-hi.

export interface FAQItem {
  q: string;
  qHi: string;
  a: string;
  aHi: string;
  html?: boolean;
}

export interface FAQCategory {
  id: string;
  label: string;
  labelHi: string;
  items: FAQItem[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'panchang-basics',
    label: 'Panchang Basics',
    labelHi: 'पंचांग की मूल बातें',
    items: [
      {
        q: 'What is a Panchang and what do its five parts mean?',
        qHi: 'पंचांग क्या है और इसके पांच अंगों का क्या अर्थ है?',
        a: 'A Panchang (पंचांग) is the traditional Hindu almanac used to plan daily life, from a morning puja to a wedding date. The word literally means "five limbs": Tithi (lunar day), Vara (weekday), Nakshatra (lunar mansion), Yoga (a Sun-Moon angular combination), and Karana (half-Tithi). Together these five elements describe the astrological character of a given day.',
        aHi: 'पंचांग पारंपरिक हिंदू ज्योतिष कैलेंडर है, जिसका उपयोग सुबह की पूजा से लेकर विवाह की तिथि तक, दैनिक जीवन की योजना बनाने के लिए किया जाता है। इस शब्द का शाब्दिक अर्थ है "पांच अंग": तिथि (चंद्र दिवस), वार (सप्ताह का दिन), नक्षत्र (चंद्र मंडल), योग (सूर्य-चंद्र का कोणीय संयोजन), और करण (आधी तिथि)। ये पांचों तत्व मिलकर किसी दिन का ज्योतिषीय स्वरूप बताते हैं।',
      },
      {
        q: 'What is Tithi, and why does it matter?',
        qHi: 'तिथि क्या है, और यह क्यों महत्वपूर्ण है?',
        a: 'Tithi is the lunar day, based on the angular distance between the Sun and Moon. There are 30 Tithis in a lunar month — 15 in Shukla Paksha (waxing) and 15 in Krishna Paksha (waning). Each Tithi has a traditional quality: some are considered favorable for new beginnings (like Dwitiya or Panchami), while others are better suited to spiritual practice (like Ekadashi or Amavasya).',
        aHi: 'तिथि चंद्र दिवस है, जो सूर्य और चंद्रमा के बीच कोणीय दूरी पर आधारित है। एक चंद्र मास में 30 तिथियां होती हैं — शुक्ल पक्ष (बढ़ता चंद्रमा) में 15 और कृष्ण पक्ष (घटता चंद्रमा) में 15। प्रत्येक तिथि का अपना पारंपरिक गुण होता है: कुछ नई शुरुआत के लिए शुभ मानी जाती हैं (जैसे द्वितीया या पंचमी), जबकि कुछ आध्यात्मिक साधना के लिए अधिक उपयुक्त होती हैं (जैसे एकादशी या अमावस्या)।',
      },
      {
        q: 'What is Nakshatra?',
        qHi: 'नक्षत्र क्या है?',
        a: "Nakshatra is the lunar mansion — one of 27 segments of the sky the Moon passes through, each with its own traditional character and ruling planet/deity. It's used alongside Tithi to judge how suitable a given day or moment is for different activities.",
        aHi: 'नक्षत्र चंद्र मंडल है — आकाश के 27 खंडों में से एक, जिनसे होकर चंद्रमा गुजरता है, और प्रत्येक का अपना पारंपरिक स्वभाव तथा शासक ग्रह/देवता होता है। इसका उपयोग तिथि के साथ मिलकर यह आंकने के लिए किया जाता है कि कोई दिन या क्षण विभिन्न कार्यों के लिए कितना उपयुक्त है।',
      },
      {
        q: 'What is Rahu Kalam, and why should I avoid starting work then?',
        qHi: 'राहु काल क्या है, और इस दौरान कार्य शुरू करने से क्यों बचना चाहिए?',
        a: "Rahu Kalam is a daily period considered inauspicious in Hindu tradition, calculated as roughly one-eighth of the time between local sunrise and sunset — typically 75 to 105 minutes depending on the season and your location, not a fixed length. It shifts every day because it's calculated from local sunrise and sunset. Many people avoid starting new or important ventures — travel, business, ceremonies — during this window.",
        aHi: 'राहु काल एक दैनिक अवधि है जो हिंदू परंपरा में अशुभ मानी जाती है, और इसकी गणना स्थानीय सूर्योदय व सूर्यास्त के बीच के समय के लगभग आठवें हिस्से के रूप में की जाती है — आमतौर पर मौसम और आपके स्थान के आधार पर 75 से 105 मिनट तक, न कि कोई निश्चित अवधि। यह हर दिन बदलती है क्योंकि इसकी गणना स्थानीय सूर्योदय और सूर्यास्त से की जाती है। कई लोग इस अवधि के दौरान नए या महत्वपूर्ण कार्य — यात्रा, व्यापार, समारोह — शुरू करने से बचते हैं।',
      },
      {
        q: "What's the difference between Gulika Kalam, Yamaganda, and Rahu Kalam?",
        qHi: 'गुलिक काल, यमगण्ड, और राहु काल में क्या अंतर है?',
        a: "All three are daily inauspicious periods, each about one-eighth of daylight hours, but ruled by different influences: Rahu Kalam by Rahu, Gulika Kalam by Saturn's son Gulika (avoid starting new ventures), and Yamaganda by Yama, the lord of death (avoid travel). All three shift daily with sunrise/sunset and are recalculated for your exact location.",
        aHi: 'ये तीनों दैनिक अशुभ अवधियां हैं, प्रत्येक दिन के प्रकाश समय का लगभग आठवां हिस्सा, लेकिन अलग-अलग प्रभावों द्वारा शासित होती हैं: राहु काल पर राहु का, गुलिक काल पर शनि के पुत्र गुलिक का (नए कार्य शुरू करने से बचें), और यमगण्ड पर यम, मृत्यु के देवता का प्रभाव होता है (यात्रा से बचें)। ये तीनों प्रतिदिन सूर्योदय/सूर्यास्त के साथ बदलती हैं और आपके सटीक स्थान के लिए पुनर्गणना की जाती हैं।',
      },
      {
        q: "Why do Panchang timings (like Tithi end-time) look different from another website?",
        qHi: 'पंचांग समय (जैसे तिथि समाप्ति समय) किसी अन्य वेबसाइट से अलग क्यों दिखते हैं?',
        a: "Small differences (a few minutes) are normal and usually come down to slightly different geographic coordinates or rounding in the underlying calculation — not an error. Larger differences (hours, or a different day entirely) usually mean the two sites use different calculation methods or a different Ayanamsha — see the next section.",
        aHi: 'छोटे अंतर (कुछ मिनट) सामान्य हैं और आमतौर पर थोड़े अलग भौगोलिक निर्देशांक या अंतर्निहित गणना में पूर्णांकन के कारण होते हैं — यह कोई त्रुटि नहीं है। बड़े अंतर (घंटों का, या पूरी तरह अलग दिन) आमतौर पर इसका मतलब है कि दोनों साइटें अलग-अलग गणना पद्धति या अलग अयनांश का उपयोग करती हैं — अगला भाग देखें।',
      },
    ],
  },
  {
    id: 'accuracy-methodology',
    label: 'Accuracy & Methodology',
    labelHi: 'सटीकता और पद्धति',
    items: [
      {
        q: 'What calculation method does PanchangPath use (Drik vs. traditional)?',
        qHi: 'पंचांगपथ कौन सी गणना पद्धति उपयोग करता है (द्रिक बनाम पारंपरिक)?',
        a: "PanchangPath uses the Drik (astronomical) method — precise, real-time planetary positions rather than older fixed-cycle approximations like traditional Surya Siddhanta tables. This is the same modern approach used by India's official Rashtriya Panchang and most contemporary panchang publishers.",
        aHi: 'पंचांगपथ द्रिक (खगोलीय) पद्धति का उपयोग करता है — पारंपरिक सूर्य सिद्धांत सारणियों जैसी पुरानी निश्चित-चक्र अनुमानित पद्धतियों के बजाय सटीक, वास्तविक-समय ग्रह स्थितियां। यह वही आधुनिक दृष्टिकोण है जिसका उपयोग भारत के आधिकारिक राष्ट्रीय पंचांग और अधिकांश समकालीन पंचांग प्रकाशक करते हैं।',
      },
      {
        q: 'What is Lahiri Ayanamsha, and why does it matter?',
        qHi: 'लाहिड़ी अयनांश क्या है, और यह क्यों महत्वपूर्ण है?',
        a: "Ayanamsha is the angular offset between the tropical zodiac (based on the seasons) and the sidereal zodiac (based on fixed star positions) — needed because Vedic astrology uses the sidereal zodiac. Lahiri Ayanamsha was recommended by the Indian government's Calendar Reform Committee, which studied the question from 1952 to 1955; the resulting Saka-era national calendar took effect on 22 March 1957 and remains the standard used by India's official almanac and most traditional Panchang publishers. PanchangPath uses Lahiri Ayanamsha so results align with what a traditional pandit's Panchang would show.",
        aHi: 'अयनांश उष्णकटिबंधीय राशिचक्र (ऋतुओं पर आधारित) और सिडेरियल राशिचक्र (स्थिर तारों की स्थिति पर आधारित) के बीच कोणीय अंतर है — यह आवश्यक है क्योंकि वैदिक ज्योतिष सिडेरियल राशिचक्र का उपयोग करता है। लाहिड़ी अयनांश की सिफारिश भारत सरकार की कैलेंडर सुधार समिति ने की थी, जिसने 1952 से 1955 तक इस विषय का अध्ययन किया; इसके परिणामस्वरूप शक-युग आधारित राष्ट्रीय कैलेंडर 22 मार्च 1957 से प्रभावी हुआ और यह आज भी भारत के आधिकारिक पंचांग और अधिकांश पारंपरिक पंचांग प्रकाशकों द्वारा उपयोग किया जाने वाला मानक है। पंचांगपथ लाहिड़ी अयनांश का उपयोग करता है ताकि परिणाम पारंपरिक पंडित के पंचांग से मेल खाएं।',
      },
      {
        q: "Why might your Panchang differ slightly from a printed almanac or a local pandit's?",
        qHi: 'आपका पंचांग किसी छपे हुए पंचांग या स्थानीय पंडित के पंचांग से थोड़ा अलग क्यों हो सकता है?',
        a: "Most differences are due to a different Ayanamsha (e.g. KP vs. Lahiri), a different calculation method (Drik vs. traditional Surya Siddhanta-based), or regional conventions (e.g. some South Indian traditions use Vakya Panchangam). These aren't errors on either side — they're different, legitimate traditions. PanchangPath's Lahiri + Drik combination is chosen specifically to match the most widely used modern standard.",
        aHi: 'अधिकांश अंतर अलग अयनांश (जैसे केपी बनाम लाहिड़ी), अलग गणना पद्धति (द्रिक बनाम पारंपरिक सूर्य सिद्धांत-आधारित), या क्षेत्रीय परंपराओं (जैसे कुछ दक्षिण भारतीय परंपराएं वाक्य पंचांगम का उपयोग करती हैं) के कारण होते हैं। ये किसी भी पक्ष की त्रुटि नहीं हैं — ये अलग, वैध परंपराएं हैं। पंचांगपथ का लाहिड़ी + द्रिक संयोजन विशेष रूप से सबसे व्यापक रूप से उपयोग किए जाने वाले आधुनिक मानक से मेल खाने के लिए चुना गया है।',
      },
      {
        q: "Does PanchangPath's data match India's official Rashtriya Panchang?",
        qHi: 'क्या पंचांगपथ का डेटा भारत के आधिकारिक राष्ट्रीय पंचांग से मेल खाता है?',
        a: "Yes — both use the Drik (astronomical) method with Lahiri Ayanamsha, the same sidereal standard adopted by India's Calendar Reform Committee.",
        aHi: 'हां — दोनों लाहिड़ी अयनांश के साथ द्रिक (खगोलीय) पद्धति का उपयोग करते हैं, वही सिडेरियल मानक जिसे भारत की कैलेंडर सुधार समिति ने अपनाया था।',
      },
    ],
  },
  {
    id: 'using-this-site',
    label: 'Using This Site',
    labelHi: 'इस साइट का उपयोग',
    items: [
      {
        q: 'Is PanchangPath really free to use, with no sign-up?',
        qHi: 'क्या पंचांगपथ वाकई उपयोग के लिए मुफ्त है, बिना साइन-अप के?',
        a: 'Yes. Every calculator, the full Panchang, Kundali, Rashifal, Muhurta tools, and the devotional library are free to use — no sign-up, no paywall, and no premium tier holding features back.',
        aHi: 'हां। हर कैलकुलेटर, पूर्ण पंचांग, कुंडली, राशिफल, मुहूर्त उपकरण, और भक्ति पुस्तकालय मुफ्त उपयोग के लिए उपलब्ध हैं — बिना साइन-अप, बिना पेवॉल, और बिना किसी प्रीमियम स्तर के जो सुविधाओं को रोके रखे।',
      },
      {
        q: 'How does the site know my location, and can I change it?',
        qHi: 'साइट मेरा स्थान कैसे जानती है, और क्या मैं इसे बदल सकता/सकती हूं?',
        a: 'PanchangPath auto-detects your approximate location so timings (sunrise, Rahu Kalam, etc.) are accurate for you by default. You can change the city manually at any time using the location selector — this matters because timings like sunrise, sunset, and the inauspicious periods are calculated for your exact coordinates, not a national average.',
        aHi: 'पंचांगपथ आपका अनुमानित स्थान स्वतः पहचान लेता है ताकि सूर्योदय, राहु काल आदि समय डिफ़ॉल्ट रूप से आपके लिए सटीक हों। आप स्थान चयनकर्ता का उपयोग करके किसी भी समय शहर को मैन्युअल रूप से बदल सकते हैं — यह महत्वपूर्ण है क्योंकि सूर्योदय, सूर्यास्त, और अशुभ अवधियों जैसे समय आपके सटीक निर्देशांकों के लिए गणना किए जाते हैं, न कि किसी राष्ट्रीय औसत के लिए।',
      },
      {
        q: 'Is my birth data (for Kundali/Rashifal) stored anywhere?',
        qHi: 'क्या मेरा जन्म विवरण (कुंडली/राशिफल के लिए) कहीं संग्रहीत होता है?',
        a: 'No. Every Kundali, Janma Kundali, Horoscope Match, and Rashifal-by-birth-date calculation on PanchangPath runs entirely in your own browser — the date, time, and place of birth you enter are used only in that moment to compute the chart or result. Nothing is sent to a server: the site has no backend that receives birth details, and none of these fields are written to cookies or local storage (which PanchangPath uses only for your language, theme, and last-picked city). Once you close or refresh the page, that input is gone.',
        aHi: 'नहीं। पंचांगपथ पर हर कुंडली, जन्म कुंडली, कुंडली मिलान, और जन्मतिथि-आधारित राशिफल गणना पूरी तरह आपके अपने ब्राउज़र में होती है — आपके द्वारा दर्ज की गई जन्म तिथि, समय, और स्थान का उपयोग केवल उसी क्षण चार्ट या परिणाम की गणना के लिए किया जाता है। कुछ भी सर्वर पर नहीं भेजा जाता: इस साइट का कोई बैकएंड नहीं है जो जन्म विवरण प्राप्त करे, और इनमें से कोई भी फ़ील्ड कुकीज़ या लोकल स्टोरेज में नहीं लिखी जाती (जिसका उपयोग पंचांगपथ केवल आपकी भाषा, थीम, और अंतिम चुने गए शहर के लिए करता है)। पृष्ठ बंद या रीफ्रेश करते ही वह इनपुट समाप्त हो जाता है।',
      },
      {
        q: 'Can I switch the whole site to Hindi?',
        qHi: 'क्या मैं पूरी साइट को हिंदी में बदल सकता/सकती हूं?',
        a: 'Yes — use the language toggle in the header to switch between English and Hindi. This applies across Panchang details, Tithi/Nakshatra names, festival names, the devotional library, and site navigation.',
        aHi: 'हां — अंग्रेज़ी और हिंदी के बीच स्विच करने के लिए हेडर में भाषा टॉगल का उपयोग करें। यह पंचांग विवरण, तिथि/नक्षत्र नाम, त्योहार के नाम, भक्ति पुस्तकालय, और साइट नेविगेशन में लागू होता है।',
      },
      {
        q: 'Does it work correctly for locations outside India?',
        qHi: 'क्या यह भारत के बाहर के स्थानों के लिए सही ढंग से काम करता है?',
        a: 'Yes — Panchang elements like Tithi, Nakshatra, and Yoga are universal at any given moment, but the exact transition times, along with location-dependent timings like Rahu Kalam and sunrise/sunset, are recalculated based on your city\'s exact coordinates and timezone, wherever you are in the world.',
        aHi: 'हां — तिथि, नक्षत्र, और योग जैसे पंचांग तत्व किसी भी क्षण में सार्वभौमिक होते हैं, लेकिन सटीक परिवर्तन समय, साथ ही राहु काल और सूर्योदय/सूर्यास्त जैसे स्थान-निर्भर समय, आपके शहर के सटीक निर्देशांक और समय क्षेत्र के आधार पर पुनर्गणना किए जाते हैं, चाहे आप दुनिया में कहीं भी हों।',
      },
    ],
  },
  {
    id: 'muhurta-timing',
    label: 'Muhurta & Auspicious Timing',
    labelHi: 'मुहूर्त और शुभ समय',
    items: [
      {
        q: 'What is Abhijit Muhurta?',
        qHi: 'अभिजीत मुहूर्त क्या है?',
        a: 'Abhijit Muhurta is a window centered on true solar noon, considered one of the most universally auspicious times of day — suitable for starting important work regardless of other daily timing considerations, with one traditional exception: on Wednesdays, Abhijit is considered weak and this override doesn\'t apply. It spans day length ÷ 15, which works out to roughly 40 to 55 minutes depending on the season and your location, not a fixed 48 minutes.',
        aHi: 'अभिजीत मुहूर्त सही सौर मध्याह्न पर केंद्रित एक अवधि है, जिसे दिन के सबसे सार्वभौमिक रूप से शुभ समयों में से एक माना जाता है — अन्य दैनिक समय संबंधी विचारों की परवाह किए बिना महत्वपूर्ण कार्य शुरू करने के लिए उपयुक्त, एक पारंपरिक अपवाद के साथ: बुधवार को अभिजित कमजोर माना जाता है और यह छूट लागू नहीं होती। यह दिन की लंबाई ÷ 15 तक फैला होता है, जो मौसम और आपके स्थान के आधार पर लगभग 40 से 55 मिनट के बराबर होता है, न कि कोई निश्चित 48 मिनट।',
      },
      {
        q: 'How do I find a good date for a wedding or Griha Pravesh?',
        qHi: 'विवाह या गृह प्रवेश के लिए अच्छी तिथि कैसे खोजूं?',
        a: 'Use the dedicated <a href="/muhurta/vivah">Vivah Muhurat</a> and <a href="/muhurta/griha-pravesh">Griha Pravesh Muhurat</a> finders, which scan upcoming dates and rank them based on traditional auspicious-timing criteria for that specific purpose. There\'s also a general <a href="/muhurta/shubha-dates">Shubh Muhurat</a> date-scorer for other purposes like vehicle or property purchase.',
        aHi: 'समर्पित <a href="/muhurta/vivah">विवाह मुहूर्त</a> और <a href="/muhurta/griha-pravesh">गृह प्रवेश मुहूर्त</a> खोजकों का उपयोग करें, जो आगामी तिथियों को स्कैन करते हैं और उस विशेष उद्देश्य के लिए पारंपरिक शुभ-समय मानदंडों के आधार पर उन्हें रैंक करते हैं। वाहन या संपत्ति खरीद जैसे अन्य उद्देश्यों के लिए एक सामान्य <a href="/muhurta/shubha-dates">शुभ मुहूर्त</a> तिथि-स्कोरर भी उपलब्ध है।',
        html: true,
      },
      {
        q: 'What is Choghadiya, and how do I use it?',
        qHi: 'चौघड़िया क्या है, और मैं इसका उपयोग कैसे करूं?',
        a: "Choghadiya divides daylight and nighttime hours into eight segments each, labeling each as auspicious, neutral, or inauspicious for different kinds of activities. It's a simpler, hour-by-hour alternative to checking Muhurta tables individually.",
        aHi: 'चौघड़िया दिन और रात के घंटों को आठ-आठ खंडों में विभाजित करता है, और प्रत्येक को विभिन्न प्रकार के कार्यों के लिए शुभ, तटस्थ, या अशुभ के रूप में चिह्नित करता है। यह अलग-अलग मुहूर्त सारणियां जांचने का एक सरल, घंटे-दर-घंटे विकल्प है।',
      },
    ],
  },
  {
    id: 'kundali-rashifal-jyotish',
    label: 'Kundali, Rashifal & Jyotish Tools',
    labelHi: 'कुंडली, राशिफल और ज्योतिष उपकरण',
    items: [
      {
        q: 'What information do I need to generate a Kundali?',
        qHi: 'कुंडली बनाने के लिए मुझे कौन सी जानकारी चाहिए?',
        a: 'Your date of birth, time of birth, and place of birth. Birth time matters particularly for the Lagna (Ascendant) and house placements — even a small difference in birth time can shift these, so use the most accurate time available (e.g. from a birth certificate) where possible.',
        aHi: 'आपकी जन्म तिथि, जन्म समय, और जन्म स्थान। जन्म समय विशेष रूप से लग्न और भाव स्थितियों के लिए महत्वपूर्ण है — जन्म समय में एक छोटा सा अंतर भी इन्हें बदल सकता है, इसलिए जहां संभव हो सबसे सटीक उपलब्ध समय (जैसे जन्म प्रमाण पत्र से) का उपयोग करें।',
      },
      {
        q: "What's the difference between my Rashi (Moon sign) and my Western zodiac sign?",
        qHi: 'मेरी राशि (चंद्र राशि) और पाश्चात्य राशि में क्या अंतर है?',
        a: "Your Western zodiac sign is based on the Sun's position using the tropical zodiac. Your Rashi (Moon sign) in Vedic astrology is based on the Moon's position using the sidereal zodiac, which is offset from the tropical zodiac by the Ayanamsha (currently about 24 degrees). Because of this offset, your Rashi is very often a different sign than your Western sun sign.",
        aHi: 'आपकी पाश्चात्य राशि उष्णकटिबंधीय राशिचक्र का उपयोग करते हुए सूर्य की स्थिति पर आधारित होती है। वैदिक ज्योतिष में आपकी राशि (चंद्र राशि) सिडेरियल राशिचक्र का उपयोग करते हुए चंद्रमा की स्थिति पर आधारित होती है, जो अयनांश (वर्तमान में लगभग 24 डिग्री) से उष्णकटिबंधीय राशिचक्र से हटी हुई है। इस अंतर के कारण, आपकी राशि अक्सर आपकी पाश्चात्य सूर्य राशि से अलग होती है।',
      },
      {
        q: 'How is Kundali Matching (Gun Milan) scored?',
        qHi: 'कुंडली मिलान (गुण मिलान) का स्कोर कैसे तय होता है?',
        a: 'Kundali Matching uses the traditional Ashtakoota (8-factor) system, scoring compatibility between two birth charts out of 36 points based on factors like Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi.',
        aHi: 'कुंडली मिलान पारंपरिक अष्टकूट (8-कारक) प्रणाली का उपयोग करता है, जो वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट, और नाड़ी जैसे कारकों के आधार पर दो जन्म कुंडलियों के बीच अनुकूलता को 36 अंकों में स्कोर करता है।',
      },
      {
        q: 'What is Mangal Dosha / Kalasarpa Yoga?',
        qHi: 'मंगल दोष / कालसर्प योग क्या है?',
        a: 'Mangal Dosha (also called Kuja Dosha) flags a birth chart where Mars is placed in a position traditionally believed to affect married life. Kalasarpa Yoga checks whether all seven other planets fall between Rahu and Ketu in the chart. Both are among the most commonly checked compatibility factors before marriage in Vedic astrology.',
        aHi: 'मंगल दोष (जिसे कुज दोष भी कहा जाता है) उस जन्म कुंडली को चिह्नित करता है जिसमें मंगल एक ऐसी स्थिति में होता है जिसे पारंपरिक रूप से वैवाहिक जीवन को प्रभावित करने वाला माना जाता है। कालसर्प योग जांचता है कि क्या कुंडली में अन्य सभी सात ग्रह राहु और केतु के बीच आते हैं। वैदिक ज्योतिष में विवाह से पहले जांचे जाने वाले सबसे सामान्य अनुकूलता कारकों में दोनों शामिल हैं।',
      },
    ],
  },
  {
    id: 'devotional-library',
    label: 'Devotional Library',
    labelHi: 'भक्ति पुस्तकालय',
    items: [
      {
        q: 'Are the Aarti/Chalisa/Stotram lyrics verified against traditional texts?',
        qHi: 'क्या आरती/चालीसा/स्तोत्रम् के बोल पारंपरिक ग्रंथों से सत्यापित हैं?',
        a: "Yes — every text in the devotional library is checked against traditional reference sources rather than paraphrased, so the Sanskrit/Hindi shown matches what's printed in standard prayer books and authoritative editions (e.g. Gita Press for larger scriptural texts like Durga Saptashati and Sundarkand).",
        aHi: 'हां — भक्ति पुस्तकालय के हर पाठ को पैराफ्रेज़ करने के बजाय पारंपरिक संदर्भ स्रोतों से जांचा गया है, ताकि दिखाया गया संस्कृत/हिंदी मानक प्रार्थना पुस्तकों और प्रामाणिक संस्करणों (जैसे दुर्गा सप्तशती और सुंदरकांड जैसे बड़े शास्त्रीय ग्रंथों के लिए गीता प्रेस) में छपे पाठ से मेल खाए।',
      },
      {
        q: 'Can I get the transliteration and meaning, not just Sanskrit/Hindi?',
        qHi: 'क्या मुझे केवल संस्कृत/हिंदी के बजाय लिप्यंतरण और अर्थ भी मिल सकता है?',
        a: 'Yes — most devotional texts include Devanagari lyrics, Roman-script transliteration, and an English meaning/explanation together on the same page.',
        aHi: 'हां — अधिकांश भक्ति पाठों में देवनागरी बोल, रोमन-लिपि लिप्यंतरण, और अंग्रेज़ी अर्थ/व्याख्या एक ही पृष्ठ पर एक साथ शामिल हैं।',
      },
    ],
  },
];
