// Shared types & category metadata for the Devotional Content Library

export interface DevotionalItem {
  slug: string;
  title: string;       // English/transliterated title
  titleHi: string;      // Devanagari title
  deity?: string;        // Presiding deity (English)
  deityHi?: string;      // Presiding deity (Devanagari)
  icon: string;          // emoji
  lyricsHi: string;      // Devanagari text, lines separated by \n
  transliteration?: string; // Roman transliteration, lines separated by \n
  meaning?: string;      // English meaning / summary
  benefits?: string;     // When / why it is recited, benefits
}

export type DevotionalCategoryId =
  | 'aarti' | 'chalisa' | 'stotram' | 'ashtakam' | 'mantra' | 'yantra'
  | 'namavali' | 'durga-saptashati' | 'sundarkand' | 'nama-ramayanam'
  | 'vrat-katha' | 'puja-vidhi';

export interface CategoryMeta {
  id: DevotionalCategoryId;
  label: string;
  labelHi: string;
  icon: string;
  gradient: string;
  description: string;
  url: string;
  built: boolean;
}

export const CATEGORY_META: Record<DevotionalCategoryId, CategoryMeta> = {
  'aarti': {
    id: 'aarti', label: 'Aarti Collection', labelHi: 'आरती संग्रह', icon: '🪔',
    gradient: 'linear-gradient(135deg,#FF9933 0%,#d97706 100%)',
    description: 'Devotional lamp-waving hymns sung to deities during puja, with Hindi lyrics, transliteration and meaning.',
    url: '/devotional/aarti', built: true,
  },
  'chalisa': {
    id: 'chalisa', label: 'Chalisa Collection', labelHi: 'चालीसा संग्रह', icon: '📿',
    gradient: 'linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%)',
    description: 'Forty-verse devotional hymns praising a deity\'s virtues and deeds, recited for blessings and protection.',
    url: '/devotional/chalisa', built: true,
  },
  'stotram': {
    id: 'stotram', label: 'Stotram Collection', labelHi: 'स्तोत्र संग्रह', icon: '📜',
    gradient: 'linear-gradient(135deg,#7C3AED 0%,#4C1D95 100%)',
    description: 'Sanskrit hymns of praise composed by sages, recited for spiritual merit and divine grace.',
    url: '/devotional/stotram', built: true,
  },
  'ashtakam': {
    id: 'ashtakam', label: 'Ashtakam Collection', labelHi: 'अष्टकम् संग्रह', icon: '🎋',
    gradient: 'linear-gradient(135deg,#1d4ed8 0%,#1e3a8a 100%)',
    description: 'Eight-verse Sanskrit hymns dedicated to a single deity, prized for their concise devotional power.',
    url: '/devotional/ashtakam', built: true,
  },
  'mantra': {
    id: 'mantra', label: 'Vedic Mantras', labelHi: 'वैदिक मंत्र', icon: '🕉️',
    gradient: 'linear-gradient(135deg,#0d9488 0%,#134e4a 100%)',
    description: 'Sacred Vedic chants with word-for-word translation, meaning and japa instructions.',
    url: '/devotional/mantra', built: true,
  },
  'yantra': {
    id: 'yantra', label: 'Vedic Yantras', labelHi: 'वैदिक यंत्र', icon: '🔯',
    gradient: 'linear-gradient(135deg,#4338CA 0%,#312e81 100%)',
    description: 'Sacred geometric diagrams for worship, with installation, puja vidhi and benefits for each yantra.',
    url: '/devotional/yantra', built: true,
  },
  'namavali': {
    id: 'namavali', label: 'Deity Namavali', labelHi: 'नामावली', icon: '📇',
    gradient: 'linear-gradient(135deg,#be185d 0%,#831843 100%)',
    description: '108 (Ashtottara Shatanamavali) and 1000-name (Sahasranamavali) lists of deities for archana and japa.',
    url: '/devotional/namavali', built: true,
  },
  'durga-saptashati': {
    id: 'durga-saptashati', label: 'Durga Saptashati', labelHi: 'दुर्गा सप्तशती', icon: '⚔️',
    gradient: 'linear-gradient(135deg,#9d174d 0%,#500724 100%)',
    description: 'All 13 chapters of the Devi Mahatmyam — the epic of Goddess Durga\'s victory over the asuras.',
    url: '/devotional/durga-saptashati', built: false,
  },
  'sundarkand': {
    id: 'sundarkand', label: 'Sundarkand', labelHi: 'सुंदरकांड', icon: '🐒',
    gradient: 'linear-gradient(135deg,#c2410c 0%,#7c2d12 100%)',
    description: 'The fifth book of the Ramcharitmanas, recounting Hanuman\'s journey to Lanka — recited for courage and protection.',
    url: '/devotional/sundarkand', built: false,
  },
  'nama-ramayanam': {
    id: 'nama-ramayanam', label: 'Nama Ramayanam', labelHi: 'नाम रामायणम्', icon: '🏹',
    gradient: 'linear-gradient(135deg,#0369a1 0%,#0c4a6e 100%)',
    description: 'The Ramayana story told entirely through the names and glory of Sri Rama, sung as a devotional chant.',
    url: '/devotional/nama-ramayanam', built: false,
  },
  'vrat-katha': {
    id: 'vrat-katha', label: 'Vrat Katha', labelHi: 'व्रत कथा', icon: '🙏',
    gradient: 'linear-gradient(135deg,#92400e 0%,#451a03 100%)',
    description: 'Traditional stories recited while observing a fast, explaining its origin and significance.',
    url: '/devotional/vrat-katha', built: true,
  },
  'puja-vidhi': {
    id: 'puja-vidhi', label: 'Puja Vidhi', labelHi: 'पूजा विधि', icon: '🛕',
    gradient: 'linear-gradient(135deg,#15803d 0%,#14532d 100%)',
    description: 'Step-by-step ritual procedure guides for performing puja correctly during major festivals.',
    url: '/devotional/puja-vidhi', built: true,
  },
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}
