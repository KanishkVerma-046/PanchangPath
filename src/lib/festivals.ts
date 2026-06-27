export interface Festival {
  date: string; // YYYY-MM-DD
  name: string;
  nameHi: string;
  type: 'major' | 'vrat' | 'regional';
  description: string;
  longDesc?: string;
}

export const FESTIVALS_2025_2026: Festival[] = [
  // ── 2025 ──────────────────────────────────────────────────────────────────
  { date: '2025-01-13', name: 'Lohri',                    nameHi: 'लोहड़ी',               type: 'regional', description: 'Harvest festival of Punjab marking the end of winter solstice.',      longDesc: 'Lohri is a popular Punjabi folk festival celebrated on the night before Makar Sankranti. Bonfires are lit, and people dance and sing folk songs around the fire. Sesame seeds, jaggery, and popcorn are offered to the fire.' },
  { date: '2025-01-14', name: 'Makar Sankranti',          nameHi: 'मकर संक्रांति',        type: 'major',    description: 'Sun enters Capricorn — harvest & kite festival.',                      longDesc: 'Makar Sankranti marks the transition of the Sun into the zodiac sign of Capricorn (Makara). It is one of the few Hindu festivals observed on a fixed solar date. Celebrated with kite flying, sesame-jaggery sweets, and ritual dips in holy rivers.' },
  { date: '2025-01-14', name: 'Pongal',                   nameHi: 'पोंगल',                type: 'regional', description: 'Tamil harvest festival celebrated for four days.',                     longDesc: 'Pongal is a multi-day harvest festival celebrated predominantly in Tamil Nadu. The word Pongal means "to boil" and refers to the traditional dish made from newly harvested rice boiled with milk and jaggery.' },
  { date: '2025-02-02', name: 'Basant Panchami',          nameHi: 'बसंत पंचमी',           type: 'major',    description: 'Festival of spring and worship of Goddess Saraswati.',                 longDesc: 'Basant Panchami heralds the arrival of spring and is dedicated to Saraswati, the goddess of knowledge, music, and arts. Yellow clothes are worn and yellow foods are prepared. Schools and colleges hold special Saraswati Puja ceremonies.' },
  { date: '2025-02-12', name: 'Jaya Ekadashi',            nameHi: 'जया एकादशी',           type: 'vrat',     description: 'Ekadashi fast in Magha month — liberates from ghostly existence.',      longDesc: 'Jaya Ekadashi falls in the Shukla Paksha of the Hindu month of Magha. According to scriptures, observing this fast liberates the soul from the cycle of ghostly existence. Devotees fast, stay awake at night, and worship Lord Vishnu.' },
  { date: '2025-02-26', name: 'Maha Shivaratri',          nameHi: 'महाशिवरात्रि',          type: 'major',    description: 'The great night of Lord Shiva — all-night vigil and fast.',          longDesc: 'Maha Shivaratri, "the great night of Shiva", is one of the most significant Hindu festivals. Devotees observe an all-night vigil, fast, and offer Bilva leaves, milk, and bael fruit to Shivalinga. The festival symbolizes the overcoming of darkness and ignorance.' },
  { date: '2025-03-13', name: 'Holika Dahan',             nameHi: 'होलिका दहन',            type: 'major',    description: 'Bonfire lit on the eve of Holi symbolizing triumph of good over evil.', longDesc: 'Holika Dahan commemorates the burning of the demoness Holika, who tried to kill the devotee Prahlad. Large bonfires are lit in public spaces, and people perform pradakshina (circumambulation) around the fire while singing devotional songs.' },
  { date: '2025-03-14', name: 'Holi',                     nameHi: 'होली',                  type: 'major',    description: 'Festival of colors celebrating the arrival of spring.',               longDesc: 'Holi is the festival of colors, celebrated with great enthusiasm across India. People throw colored powder and water at each other, dance, sing, and share sweets. It celebrates the eternal love of Radha and Krishna and the victory of good over evil.' },
  { date: '2025-03-30', name: 'Ugadi / Gudi Padwa',       nameHi: 'उगादि / गुड़ी पड़वा',   type: 'major',    description: 'Hindu New Year celebrated in Deccan and Maharashtra.',                 longDesc: 'Ugadi (Telugu/Kannada) and Gudi Padwa (Marathi) mark the Hindu New Year according to the lunar calendar. A new Samvatsara begins on this day. The celebration involves hoisting the Gudi (symbolic flag), making pachadi (a dish with six tastes), and receiving the new year\'s panchanga.' },
  { date: '2025-04-06', name: 'Ram Navami',               nameHi: 'राम नवमी',              type: 'major',    description: 'Birthday of Lord Rama, the seventh avatar of Vishnu.',               longDesc: 'Ram Navami celebrates the birth of Lord Rama, the seventh avatar of Vishnu, on the ninth day (Navami) of Chaitra month. Temples are decorated, prayers are offered, and the Ramayana is read. Processions carrying images of Rama, Sita, Lakshmana, and Hanuman are taken out.' },
  { date: '2025-04-12', name: 'Hanuman Jayanti',          nameHi: 'हनुमान जयंती',          type: 'major',    description: 'Birthday of Lord Hanuman, the divine devotee of Rama.',             longDesc: 'Hanuman Jayanti commemorates the birth of Lord Hanuman, the embodiment of devotion, strength, and selfless service. Devotees visit Hanuman temples, recite the Hanuman Chalisa, and observe fasts. Sindoor (vermillion) is offered to Hanuman\'s idol as a mark of devotion.' },
  { date: '2025-04-30', name: 'Akshaya Tritiya',          nameHi: 'अक्षय तृतीया',          type: 'major',    description: 'Auspicious day for new beginnings — gold purchases bring prosperity.',  longDesc: 'Akshaya Tritiya, also known as Akha Teej, is one of the four most sacred days in the Hindu calendar. "Akshaya" means "never diminishing" — any charitable deed or auspicious beginning on this day is believed to bring never-ending good fortune. Gold and property purchases are considered especially auspicious.' },
  { date: '2025-05-12', name: 'Buddha Purnima',           nameHi: 'बुद्ध पूर्णिमा',        type: 'major',    description: 'Birth of Gautama Buddha — observed by Hindus and Buddhists alike.',   longDesc: 'Buddha Purnima, also called Vesak, celebrates the birth, enlightenment, and death of Gautama Buddha. For Hindus, Buddha is considered the ninth avatar of Vishnu. Devotees visit temples and monasteries, offer prayers, and distribute food to the poor.' },
  { date: '2025-06-06', name: 'Nirjala Ekadashi',         nameHi: 'निर्जला एकादशी',        type: 'vrat',     description: 'Strictest Ekadashi fast — no water or food for 24 hours.',          longDesc: 'Nirjala Ekadashi is considered the most important of all 24 Ekadashis. "Nirjala" means without water, and devotees observe a complete fast without even a drop of water. It is believed that observing this single Ekadashi earns the merit of all 24 Ekadashis combined.' },
  { date: '2025-07-11', name: 'Guru Purnima',             nameHi: 'गुरु पूर्णिमा',         type: 'major',    description: 'Day to honor spiritual teachers and the guru-disciple tradition.',    longDesc: 'Guru Purnima is dedicated to spiritual and academic teachers. It is celebrated on the full moon day of the Hindu month of Ashadha. The day commemorates Maharshi Vyasa, who is regarded as the Adi-Guru of the Hindu tradition, as it is believed to be his birth anniversary.' },
  { date: '2025-08-09', name: 'Naga Panchami',            nameHi: 'नाग पंचमी',             type: 'major',    description: 'Worship of serpent deities for protection and blessings.',           longDesc: 'Naga Panchami is a traditional worship of snakes observed by Hindus throughout India. Milk is offered to serpents, and prayers are offered to serpent gods like Naga, Ananta, and Vasuki. The festival falls on the fifth day (Panchami) of the bright half of Shravan month.' },
  { date: '2025-08-09', name: 'Raksha Bandhan',           nameHi: 'रक्षा बंधन',            type: 'major',    description: 'Sisters tie rakhi on brothers\' wrists, brothers vow to protect them.',  longDesc: 'Raksha Bandhan celebrates the bond between brothers and sisters. Sisters tie a sacred thread (rakhi) on their brothers\' wrists, symbolizing their love and prayers for their brothers\' well-being, while brothers pledge to protect their sisters. The festival has deep mythological roots.' },
  { date: '2025-08-16', name: 'Krishna Janmashtami',      nameHi: 'कृष्ण जन्माष्टमी',     type: 'major',    description: 'Birthday of Lord Krishna, the eighth avatar of Vishnu.',              longDesc: 'Janmashtami celebrates the birth of Lord Krishna at midnight on the eighth day of the dark fortnight of Bhadrapada month. Temples are elaborately decorated, bhajans are sung throughout the night, and the idol of baby Krishna is given a ceremonial bath at midnight.' },
  { date: '2025-08-27', name: 'Ganesh Chaturthi',         nameHi: 'गणेश चतुर्थी',          type: 'major',    description: 'Birthday of Lord Ganesha — begins 10-day festival.',               longDesc: 'Ganesh Chaturthi, also known as Vinayaka Chaturthi, celebrates the birth of Lord Ganesha. Elaborate clay idols of Ganesha are installed in homes and public pandals. For 10 days, devotees offer prayers, modak (sweet dumplings), and other sweets before the final immersion.' },
  { date: '2025-09-06', name: 'Ganesh Visarjan',          nameHi: 'गणेश विसर्जन',          type: 'major',    description: 'Immersion of Ganesha idol on Anant Chaturdashi — grand conclusion.', longDesc: 'Ganesh Visarjan marks the end of the 10-day Ganesh Chaturthi festival. The idol of Ganesha is taken in a grand procession and immersed in a water body. The immersion symbolizes the cycle of creation and dissolution, and Ganesha\'s return to his divine abode on Mount Kailash.' },
  { date: '2025-10-02', name: 'Navratri Begins',          nameHi: 'नवरात्रि प्रारंभ',       type: 'major',    description: 'Nine nights of Goddess Durga worship — fasting and Garba dancing.',  longDesc: 'Navratri ("nine nights") is a major Hindu festival dedicated to the nine forms of Goddess Durga. Each of the nine nights is dedicated to one manifestation of Durga. The festival is celebrated with fasting, prayer, Garba and Dandiya dance, and reading the Devi Mahatmyam.' },
  { date: '2025-10-11', name: 'Maha Navami',              nameHi: 'महानवमी',               type: 'major',    description: 'Ninth day of Navratri — worship of Goddess Siddhidatri.',           longDesc: 'Maha Navami is the ninth and last day of Navratri, dedicated to Goddess Siddhidatri, the bestower of supernatural powers. Kanya Puja (worship of young girls as embodiments of the goddess) is performed on this day. Weapons and tools of trade are also worshipped.' },
  { date: '2025-10-12', name: 'Vijayadashami / Dussehra', nameHi: 'विजयदशमी / दशहरा',     type: 'major',    description: 'Rama\'s victory over Ravana — effigies burned across India.',         longDesc: 'Vijayadashami celebrates Lord Rama\'s victory over the demon king Ravana. Enormous effigies of Ravana, Kumbhakarna, and Meghanath are burned in public grounds. In Bengal, it marks the end of Durga Puja, with the immersion of Durga\'s idol.' },
  { date: '2025-10-20', name: 'Karwa Chauth',             nameHi: 'करवा चौथ',              type: 'vrat',     description: 'Married women fast from sunrise to moonrise for their husbands.',     longDesc: 'Karwa Chauth is observed by married Hindu women who fast from sunrise to moonrise for the long life and well-being of their husbands. The fast is broken after sighting the moon and looking at it through a sieve, then looking at the husband\'s face.' },
  { date: '2025-10-20', name: 'Dhanteras',                nameHi: 'धनतेरस',                type: 'major',    description: 'Festival of wealth — buying gold and silver brings prosperity.',      longDesc: 'Dhanteras marks the beginning of the five-day Diwali festival. "Dhan" means wealth and "Teras" refers to the 13th day of the lunar fortnight. Purchasing gold, silver, or new utensils on this day is considered highly auspicious as it is said to multiply wealth.' },
  { date: '2025-10-21', name: 'Narak Chaturdashi',        nameHi: 'नरक चतुर्दशी',          type: 'major',    description: 'Choti Diwali — Krishna\'s victory over Narakasura.',                 longDesc: 'Narak Chaturdashi, also called Choti Diwali or Kali Chaudas, commemorates the killing of the demon Narakasura by Lord Krishna. It is also associated with the legend of Hanuman and the ritual of applying oil and bathing before sunrise.' },
  { date: '2025-10-20', name: 'Diwali',                   nameHi: 'दीपावली',               type: 'major',    description: 'Festival of lights — Lakshmi Puja, fireworks, and sweets.',         longDesc: 'Diwali, the festival of lights, is one of the most important Hindu festivals. It marks the return of Lord Rama to Ayodhya after defeating Ravana. Rows of clay lamps (diyas) are lit to welcome Goddess Lakshmi. Fireworks, sweets, and new clothes mark the celebrations.' },
  { date: '2025-10-22', name: 'Govardhan Puja',           nameHi: 'गोवर्धन पूजा',          type: 'major',    description: 'Annakut — mountain of food offered to Krishna.',                     longDesc: 'Govardhan Puja commemorates Krishna lifting the Govardhan hill to protect the villagers of Vrindavan from Indra\'s wrath. A mountain of food (Annakut) is created and offered to Lord Krishna before being distributed as prasad.' },
  { date: '2025-10-23', name: 'Bhai Dooj',                nameHi: 'भाई दूज',               type: 'major',    description: 'Festival celebrating the bond of siblings after Diwali.',           longDesc: 'Bhai Dooj (Yama Dwitiya) is a festival celebrating the relationship between brothers and sisters. Sisters apply tilak on their brothers\' foreheads and pray for their long life, while brothers give gifts. The legend involves Yama visiting his sister Yamuna on this day.' },
  { date: '2025-10-28', name: 'Chhath Puja',              nameHi: 'छठ पूजा',               type: 'major',    description: 'Sun worship at riverbanks — major festival in Bihar, UP, and Jharkhand.', longDesc: 'Chhath Puja is dedicated to the Sun God (Surya) and his wife Usha/Pratyusha. Devotees stand in water and offer arghya to the rising and setting sun. The festival involves four days of rituals including holy bathing, fasting, standing in water, and offering prasad.' },
  { date: '2025-11-05', name: 'Dev Uthani Ekadashi',      nameHi: 'देव उठनी एकादशी',       type: 'major',    description: 'Lord Vishnu awakens from four-month cosmic sleep — weddings resume.',  longDesc: 'Dev Uthani Ekadashi (Prabodhini Ekadashi) marks the end of the Chaturmas period when Lord Vishnu awakens from his four-month cosmic sleep. All auspicious occasions including weddings, upanayana, and griha pravesh that were paused during Chaturmas resume from this day.' },
  { date: '2025-12-25', name: 'Christmas',                nameHi: 'क्रिसमस',               type: 'regional', description: 'National public holiday celebrated across India.' },

  // ── 2026 ──────────────────────────────────────────────────────────────────
  { date: '2026-01-14', name: 'Makar Sankranti',          nameHi: 'मकर संक्रांति',        type: 'major',    description: 'Sun enters Capricorn — harvest & kite festival.',                      longDesc: 'Makar Sankranti marks the transition of the Sun into the zodiac sign of Capricorn. It is one of the few Hindu festivals observed on a fixed solar date. Celebrated with kite flying, sesame-jaggery sweets, and ritual dips in holy rivers.' },
  { date: '2026-01-23', name: 'Basant Panchami',          nameHi: 'बसंत पंचमी',           type: 'major',    description: 'Festival of spring and worship of Goddess Saraswati.',                 longDesc: 'Basant Panchami heralds the arrival of spring and is dedicated to Saraswati, the goddess of knowledge, music, and arts. Yellow clothes are worn and yellow foods are prepared.' },
  { date: '2026-02-15', name: 'Maha Shivaratri',          nameHi: 'महाशिवरात्रि',          type: 'major',    description: 'The great night of Lord Shiva — all-night vigil and fast.',          longDesc: 'Maha Shivaratri is one of the most significant Hindu festivals. Devotees observe an all-night vigil, fast, and offer Bilva leaves and milk to Shivalinga.' },
  { date: '2026-03-03', name: 'Holika Dahan',             nameHi: 'होलिका दहन',            type: 'major',    description: 'Bonfire lit on the eve of Holi symbolizing triumph of good over evil.' },
  { date: '2026-03-04', name: 'Holi',                     nameHi: 'होली',                  type: 'major',    description: 'Festival of colors celebrating the arrival of spring.',               longDesc: 'Holi is the festival of colors, celebrated with great enthusiasm across India. People throw colored powder and water at each other, dance, sing, and share sweets.' },
  { date: '2026-03-19', name: 'Ugadi / Gudi Padwa',       nameHi: 'उगादि / गुड़ी पड़वा',   type: 'major',    description: 'Hindu New Year celebrated in Deccan and Maharashtra.' },
  { date: '2026-03-26', name: 'Ram Navami',               nameHi: 'राम नवमी',              type: 'major',    description: 'Birthday of Lord Rama, the seventh avatar of Vishnu.' },
  { date: '2026-04-01', name: 'Hanuman Jayanti',          nameHi: 'हनुमान जयंती',          type: 'major',    description: 'Birthday of Lord Hanuman, the divine devotee of Rama.' },
  { date: '2026-04-20', name: 'Akshaya Tritiya',          nameHi: 'अक्षय तृतीया',          type: 'major',    description: 'Auspicious day for new beginnings — gold purchases bring prosperity.' },
  { date: '2026-05-01', name: 'Buddha Purnima',           nameHi: 'बुद्ध पूर्णिमा',        type: 'major',    description: 'Birth of Gautama Buddha — observed by Hindus and Buddhists alike.' },
  { date: '2026-07-01', name: 'Guru Purnima',             nameHi: 'गुरु पूर्णिमा',         type: 'major',    description: 'Day to honor spiritual teachers and the guru-disciple tradition.' },
  { date: '2026-08-05', name: 'Raksha Bandhan',           nameHi: 'रक्षा बंधन',            type: 'major',    description: 'Sisters tie rakhi on brothers\' wrists, brothers vow to protect them.' },
  { date: '2026-08-16', name: 'Ganesh Chaturthi',         nameHi: 'गणेश चतुर्थी',          type: 'major',    description: 'Birthday of Lord Ganesha — begins 10-day festival.' },
  { date: '2026-08-22', name: 'Krishna Janmashtami',      nameHi: 'कृष्ण जन्माष्टमी',     type: 'major',    description: 'Birthday of Lord Krishna, the eighth avatar of Vishnu.' },
  { date: '2026-10-09', name: 'Diwali',                   nameHi: 'दीपावली',               type: 'major',    description: 'Festival of lights — Lakshmi Puja, fireworks, and sweets.',         longDesc: 'Diwali, the festival of lights, marks the return of Lord Rama to Ayodhya after defeating Ravana. Rows of clay lamps (diyas) are lit to welcome Goddess Lakshmi.' },
];

// ── Icon & gradient color per festival (name-keyed) ───────────────────────

const FESTIVAL_ICON: Record<string, string> = {
  'Lohri': '🔥',
  'Makar Sankranti': '🪁',
  'Pongal': '🌾',
  'Basant Panchami': '🌸',
  'Jaya Ekadashi': '🙏',
  'Maha Shivaratri': '🕉️',
  'Holika Dahan': '🔥',
  'Holi': '🎨',
  'Ugadi / Gudi Padwa': '🎋',
  'Ram Navami': '🏹',
  'Hanuman Jayanti': '🐒',
  'Akshaya Tritiya': '⭐',
  'Buddha Purnima': '☸️',
  'Nirjala Ekadashi': '🙏',
  'Guru Purnima': '🙏',
  'Naga Panchami': '🐍',
  'Raksha Bandhan': '🧵',
  'Krishna Janmashtami': '🪈',
  'Ganesh Chaturthi': '🐘',
  'Ganesh Visarjan': '🐘',
  'Navratri Begins': '🌺',
  'Maha Navami': '🌺',
  'Vijayadashami / Dussehra': '🏹',
  'Karwa Chauth': '🌙',
  'Dhanteras': '💰',
  'Narak Chaturdashi': '🪔',
  'Diwali': '🪔',
  'Govardhan Puja': '⛰️',
  'Bhai Dooj': '🎀',
  'Chhath Puja': '☀️',
  'Dev Uthani Ekadashi': '🙏',
  'Christmas': '⭐',
};

const FESTIVAL_GRADIENT: Record<string, string> = {
  'Diwali':                   'linear-gradient(135deg,#FF9933 0%,#FFD700 100%)',
  'Holi':                     'linear-gradient(135deg,#FF6B6B 0%,#FF9933 40%,#4ECDC4 100%)',
  'Maha Shivaratri':          'linear-gradient(135deg,#1e1b4b 0%,#4338CA 100%)',
  'Holika Dahan':             'linear-gradient(135deg,#dc2626 0%,#ea580c 100%)',
  'Lohri':                    'linear-gradient(135deg,#dc2626 0%,#b45309 100%)',
  'Ram Navami':               'linear-gradient(135deg,#1d4ed8 0%,#6d28d9 100%)',
  'Hanuman Jayanti':          'linear-gradient(135deg,#b45309 0%,#FF9933 100%)',
  'Krishna Janmashtami':      'linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%)',
  'Ganesh Chaturthi':         'linear-gradient(135deg,#FF9933 0%,#d97706 100%)',
  'Ganesh Visarjan':          'linear-gradient(135deg,#d97706 0%,#0ea5e9 100%)',
  'Navratri Begins':          'linear-gradient(135deg,#be185d 0%,#7C3AED 100%)',
  'Maha Navami':              'linear-gradient(135deg,#9d174d 0%,#7e22ce 100%)',
  'Vijayadashami / Dussehra':'linear-gradient(135deg,#b45309 0%,#dc2626 100%)',
  'Chhath Puja':              'linear-gradient(135deg,#d97706 0%,#f59e0b 100%)',
  'Karwa Chauth':             'linear-gradient(135deg,#312e81 0%,#6d28d9 50%,#be185d 100%)',
  'Dhanteras':                'linear-gradient(135deg,#d97706 0%,#eab308 100%)',
  'Akshaya Tritiya':          'linear-gradient(135deg,#d97706 0%,#ca8a04 100%)',
  'Guru Purnima':             'linear-gradient(135deg,#FF9933 0%,#f97316 100%)',
  'Makar Sankranti':          'linear-gradient(135deg,#0ea5e9 0%,#FF9933 100%)',
  'Basant Panchami':          'linear-gradient(135deg,#ca8a04 0%,#eab308 100%)',
  'Raksha Bandhan':           'linear-gradient(135deg,#be185d 0%,#FF9933 100%)',
  'Buddha Purnima':           'linear-gradient(135deg,#d97706 0%,#78350f 100%)',
  'Pongal':                   'linear-gradient(135deg,#15803d 0%,#d97706 100%)',
};

const TYPE_GRADIENT: Record<string, string> = {
  major:    'linear-gradient(135deg,#FF9933 0%,#e07000 100%)',
  vrat:     'linear-gradient(135deg,#7C3AED 0%,#4C1D95 100%)',
  regional: 'linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%)',
};

export function getFestivalIcon(f: Festival): string {
  return FESTIVAL_ICON[f.name] ?? (f.type === 'vrat' ? '🙏' : '🪷');
}

export function getFestivalGradient(f: Festival): string {
  return FESTIVAL_GRADIENT[f.name] ?? TYPE_GRADIENT[f.type];
}

// ── Slug helpers ──────────────────────────────────────────────────────────

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

export function getFestivalSlug(f: Festival): string {
  return `${slugify(f.name)}-${f.date.slice(0, 4)}`;
}

// ── Query helpers ─────────────────────────────────────────────────────────

export function getUpcomingFestivals(date: Date, count = 5): Festival[] {
  const dateStr = date.toISOString().split('T')[0];
  return FESTIVALS_2025_2026
    .filter(f => f.date >= dateStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

export function getTodayFestivals(date: Date): Festival[] {
  const dateStr = date.toISOString().split('T')[0];
  return FESTIVALS_2025_2026.filter(f => f.date === dateStr);
}

export function daysUntil(date: Date, festivalDate: string): number {
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const fd    = new Date(festivalDate);
  return Math.round((fd.getTime() - today.getTime()) / 86_400_000);
}

export function formatCountdown(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} Days`;
}
