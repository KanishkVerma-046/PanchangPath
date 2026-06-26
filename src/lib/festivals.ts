export interface Festival {
  date: string; // YYYY-MM-DD
  name: string;
  nameHi: string;
  type: 'major' | 'vrat' | 'regional';
  description: string;
}

export const FESTIVALS_2025_2026: Festival[] = [
  // 2025
  { date: '2025-01-13', name: 'Lohri', nameHi: 'लोहड़ी', type: 'regional', description: 'Harvest festival of Punjab' },
  { date: '2025-01-14', name: 'Makar Sankranti', nameHi: 'मकर संक्रांति', type: 'major', description: 'Sun enters Capricorn — harvest & kite festival' },
  { date: '2025-01-14', name: 'Pongal', nameHi: 'पोंगल', type: 'regional', description: 'Tamil harvest festival' },
  { date: '2025-02-02', name: 'Basant Panchami', nameHi: 'बसंत पंचमी', type: 'major', description: 'Festival of spring, Saraswati Puja' },
  { date: '2025-02-12', name: 'Jaya Ekadashi', nameHi: 'जया एकादशी', type: 'vrat', description: 'Ekadashi fast in Magha month' },
  { date: '2025-02-26', name: 'Maha Shivaratri', nameHi: 'महाशिवरात्रि', type: 'major', description: 'The great night of Lord Shiva' },
  { date: '2025-03-13', name: 'Holika Dahan', nameHi: 'होलिका दहन', type: 'major', description: 'Bonfire on the eve of Holi' },
  { date: '2025-03-14', name: 'Holi', nameHi: 'होली', type: 'major', description: 'Festival of colors' },
  { date: '2025-03-30', name: 'Ugadi / Gudi Padwa', nameHi: 'उगादि / गुड़ी पड़वा', type: 'major', description: 'Hindu New Year (Vikram Samvat)' },
  { date: '2025-04-06', name: 'Ram Navami', nameHi: 'राम नवमी', type: 'major', description: 'Birthday of Lord Rama' },
  { date: '2025-04-12', name: 'Hanuman Jayanti', nameHi: 'हनुमान जयंती', type: 'major', description: 'Birthday of Lord Hanuman' },
  { date: '2025-04-30', name: 'Akshaya Tritiya', nameHi: 'अक्षय तृतीया', type: 'major', description: 'Auspicious day for new beginnings' },
  { date: '2025-05-12', name: 'Buddha Purnima', nameHi: 'बुद्ध पूर्णिमा', type: 'major', description: 'Birth of Gautama Buddha' },
  { date: '2025-06-06', name: 'Nirjala Ekadashi', nameHi: 'निर्जला एकादशी', type: 'vrat', description: 'Strictest Ekadashi fast without water' },
  { date: '2025-07-11', name: 'Guru Purnima', nameHi: 'गुरु पूर्णिमा', type: 'major', description: 'Day to honor spiritual teachers' },
  { date: '2025-08-09', name: 'Naga Panchami', nameHi: 'नाग पंचमी', type: 'major', description: 'Worship of serpent deities' },
  { date: '2025-08-09', name: 'Raksha Bandhan', nameHi: 'रक्षा बंधन', type: 'major', description: 'Festival of brother-sister bond' },
  { date: '2025-08-16', name: 'Krishna Janmashtami', nameHi: 'कृष्ण जन्माष्टमी', type: 'major', description: 'Birthday of Lord Krishna' },
  { date: '2025-08-27', name: 'Ganesh Chaturthi', nameHi: 'गणेश चतुर्थी', type: 'major', description: 'Birthday of Lord Ganesha' },
  { date: '2025-09-06', name: 'Ganesh Visarjan', nameHi: 'गणेश विसर्जन', type: 'major', description: 'Immersion of Ganesh idol (Anant Chaturdashi)' },
  { date: '2025-10-02', name: 'Navratri Begins', nameHi: 'नवरात्रि प्रारंभ', type: 'major', description: 'Nine nights of Goddess Durga worship' },
  { date: '2025-10-11', name: 'Maha Navami', nameHi: 'महानवमी', type: 'major', description: 'Ninth day of Navratri' },
  { date: '2025-10-12', name: 'Vijayadashami / Dussehra', nameHi: 'विजयदशमी / दशहरा', type: 'major', description: 'Victory of good over evil' },
  { date: '2025-10-20', name: 'Karwa Chauth', nameHi: 'करवा चौथ', type: 'vrat', description: 'Fast by married women for long life of their husbands' },
  { date: '2025-10-20', name: 'Dhanteras', nameHi: 'धनतेरस', type: 'major', description: 'Festival of wealth and prosperity' },
  { date: '2025-10-21', name: 'Narak Chaturdashi', nameHi: 'नरक चतुर्दशी', type: 'major', description: 'Choti Diwali' },
  { date: '2025-10-20', name: 'Diwali', nameHi: 'दीपावली', type: 'major', description: 'Festival of lights — Lakshmi Puja' },
  { date: '2025-10-22', name: 'Govardhan Puja', nameHi: 'गोवर्धन पूजा', type: 'major', description: 'Annakut — offering of food to Krishna' },
  { date: '2025-10-23', name: 'Bhai Dooj', nameHi: 'भाई दूज', type: 'major', description: 'Festival celebrating sibling bond' },
  { date: '2025-10-28', name: 'Chhath Puja', nameHi: 'छठ पूजा', type: 'major', description: 'Sun worship — major festival in Bihar/UP' },
  { date: '2025-11-05', name: 'Dev Uthani Ekadashi', nameHi: 'देव उठनी एकादशी', type: 'major', description: 'Lord Vishnu awakens from cosmic sleep' },
  { date: '2025-12-25', name: 'Christmas', nameHi: 'क्रिसमस', type: 'regional', description: 'National holiday' },

  // 2026
  { date: '2026-01-14', name: 'Makar Sankranti', nameHi: 'मकर संक्रांति', type: 'major', description: 'Sun enters Capricorn — harvest & kite festival' },
  { date: '2026-01-23', name: 'Basant Panchami', nameHi: 'बसंत पंचमी', type: 'major', description: 'Festival of spring, Saraswati Puja' },
  { date: '2026-02-15', name: 'Maha Shivaratri', nameHi: 'महाशिवरात्रि', type: 'major', description: 'The great night of Lord Shiva' },
  { date: '2026-03-03', name: 'Holika Dahan', nameHi: 'होलिका दहन', type: 'major', description: 'Bonfire on the eve of Holi' },
  { date: '2026-03-04', name: 'Holi', nameHi: 'होली', type: 'major', description: 'Festival of colors' },
  { date: '2026-03-19', name: 'Ugadi / Gudi Padwa', nameHi: 'उगादि / गुड़ी पड़वा', type: 'major', description: 'Hindu New Year' },
  { date: '2026-03-26', name: 'Ram Navami', nameHi: 'राम नवमी', type: 'major', description: 'Birthday of Lord Rama' },
  { date: '2026-04-01', name: 'Hanuman Jayanti', nameHi: 'हनुमान जयंती', type: 'major', description: 'Birthday of Lord Hanuman' },
  { date: '2026-04-20', name: 'Akshaya Tritiya', nameHi: 'अक्षय तृतीया', type: 'major', description: 'Auspicious day for new beginnings' },
  { date: '2026-05-01', name: 'Buddha Purnima', nameHi: 'बुद्ध पूर्णिमा', type: 'major', description: 'Birth of Gautama Buddha' },
  { date: '2026-07-01', name: 'Guru Purnima', nameHi: 'गुरु पूर्णिमा', type: 'major', description: 'Day to honor spiritual teachers' },
  { date: '2026-08-05', name: 'Raksha Bandhan', nameHi: 'रक्षा बंधन', type: 'major', description: 'Festival of brother-sister bond' },
  { date: '2026-08-16', name: 'Ganesh Chaturthi', nameHi: 'गणेश चतुर्थी', type: 'major', description: 'Birthday of Lord Ganesha' },
  { date: '2026-08-22', name: 'Krishna Janmashtami', nameHi: 'कृष्ण जन्माष्टमी', type: 'major', description: 'Birthday of Lord Krishna' },
  { date: '2026-10-09', name: 'Diwali', nameHi: 'दीपावली', type: 'major', description: 'Festival of lights — Lakshmi Puja' },
];

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
  const fd = new Date(festivalDate);
  const diff = fd.getTime() - date.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
