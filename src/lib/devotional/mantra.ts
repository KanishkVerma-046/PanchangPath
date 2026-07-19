import type { DevotionalItem } from './types';

export const MANTRAS: DevotionalItem[] = [
  {
    slug: 'gayatri-mantra',
    title: 'Gayatri Mantra',
    titleHi: 'गायत्री मंत्र',
    deity: 'Savitr / Surya', deityHi: 'सविता देव',
    icon: '🕉️',
    lyricsHi: `ॐ भूर्भुवः स्वः
तत्सवितुर्वरेण्यं।
भर्गो देवस्य धीमहि।
धियो यो नः प्रचोदयात्॥`,
    transliteration: `Om Bhur Bhuvah Swah,
Tat Savitur Varenyam,
Bhargo Devasya Dheemahi,
Dhiyo Yo Nah Prachodayat.`,
    meaning: 'Om, the Earth, the Atmosphere, the Heavens — we meditate on the glorious splendour of the Divine Sun (Savitr); may that radiant light illuminate and guide our intellect. From the Rigveda (3.62.10), this is considered the most sacred of all Vedic mantras, addressed to Savitr (the sun as the animating solar deity) as the source of enlightenment.',
    benefits: 'Traditionally chanted 108 times at sunrise, noon and sunset (the three Sandhya periods). Believed to purify the mind, sharpen the intellect and awaken spiritual wisdom. Recited during Upanayana (sacred thread ceremony) as the first mantra taught to a student.',
  },
  {
    slug: 'mahamrityunjaya-mantra',
    title: 'Mahamrityunjaya Mantra',
    titleHi: 'महामृत्युंजय मंत्र',
    deity: 'Shiva', deityHi: 'भगवान शिव',
    icon: '🔱',
    lyricsHi: `ॐ त्र्यम्बकं यजामहे
सुगन्धिं पुष्टिवर्धनम्।
उर्वारुकमिव बन्धनान्
मृत्योर्मुक्षीय माऽमृतात्॥`,
    transliteration: `Om Tryambakam Yajamahe
Sugandhim Pushtivardhanam,
Urvarukamiva Bandhanan
Mrityor Mukshiya Ma'mritat.`,
    meaning: 'We worship the three-eyed Lord Shiva who is fragrant and nourishes all beings; may he liberate us from death, like a ripe cucumber freed from its bondage to the vine, but not from immortality (i.e., liberate us into immortality, not away from it). From the Rigveda (7.59.12) and also found in the Yajurveda, this mantra is dedicated to Shiva as Tryambaka ("three-eyed one").',
    benefits: 'Chanted for healing, longevity and overcoming fear of death — traditionally recited for the seriously ill, and as a protective chant 108 times daily, particularly powerful during Maha Shivaratri and Mondays.',
  },
  {
    slug: 'om-namah-shivaya',
    title: 'Om Namah Shivaya (Shiva Panchakshari)',
    titleHi: 'ॐ नमः शिवाय (शिव पञ्चाक्षरी)',
    deity: 'Shiva', deityHi: 'भगवान शिव',
    icon: '🔱',
    lyricsHi: `ॐ नमः शिवाय।`,
    transliteration: `Om Namah Shivaya.`,
    meaning: 'Om, salutations to Shiva. This is the Panchakshari ("five-syllable") mantra — Na-Ma-Shi-Va-Ya — each syllable corresponding to one of the five elements (earth, water, fire, air, ether) and one of Shiva\'s five faces. It is considered the most fundamental mantra of Shaivism.',
    benefits: 'Chanted continuously (japa) using a Rudraksha mala of 108 beads, especially on Mondays and during Shravan month and Maha Shivaratri, for inner peace, purification and dissolution of ego.',
  },
  {
    slug: 'om-namo-narayanaya',
    title: 'Om Namo Narayanaya (Vishnu Ashtakshari)',
    titleHi: 'ॐ नमो नारायणाय (विष्णु अष्टाक्षरी)',
    deity: 'Vishnu', deityHi: 'भगवान विष्णु / नारायण',
    icon: '🪷',
    lyricsHi: `ॐ नमो नारायणाय।`,
    transliteration: `Om Namo Narayanaya.`,
    meaning: 'Om, salutations to Narayana (Vishnu, the one who resides in and pervades the cosmic waters). This is the Ashtakshari ("eight-syllable") mantra of Vishnu, one of the most sacred mantras in Vaishnavism, especially central to Sri Vaishnava tradition.',
    benefits: 'Chanted for surrender (sharanagati), peace and protection, especially on Thursdays and Ekadashi, and widely used in Vaikuntha temples and by Vaishnava practitioners as their primary japa mantra.',
  },
  {
    slug: 'om-namo-bhagavate-vasudevaya',
    title: 'Om Namo Bhagavate Vasudevaya',
    titleHi: 'ॐ नमो भगवते वासुदेवाय',
    deity: 'Krishna / Vasudeva', deityHi: 'भगवान श्रीकृष्ण (वासुदेव)',
    icon: '🪈',
    lyricsHi: `ॐ नमो भगवते वासुदेवाय।`,
    transliteration: `Om Namo Bhagavate Vasudevaya.`,
    meaning: 'Om, salutations to the divine Lord Vasudeva (Krishna, son of Vasudeva). This is the Dwadashakshari ("twelve-syllable") mantra, one of the most powerful mantras in Vaishnava and Bhagavata tradition, encompassing the entirety of Krishna bhakti.',
    benefits: 'Chanted for devotion, purification and spiritual growth, especially during Janmashtami and Ekadashi; considered by the Bhagavata Purana to grant liberation to any sincere devotee who recites it.',
  },
  {
    slug: 'shanti-mantra',
    title: 'Shanti Mantra',
    titleHi: 'शांति मंत्र',
    deity: 'Universal / Vedic invocation', deityHi: 'सार्वभौम शांति आवाहन',
    icon: '🕊️',
    lyricsHi: `ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः
पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः।
वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः
सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥
ॐ शान्तिः शान्तिः शान्तिः॥`,
    transliteration: `Om Dyauh Shantir Antariksham Shantih
Prithvi Shantir Apah Shantir Oshadhayah Shantih,
Vanaspatayah Shantir Vishvedevah Shantir Brahma Shantih
Sarvam Shantih Shantireva Shantih Sa Ma Shantiredhi.
Om Shanti Shanti Shanti.`,
    meaning: 'Om, may there be peace in heaven, peace in the atmosphere, peace on earth, peace in the water, peace in the herbs and plants, peace in the trees, peace in the celestial beings, peace in Brahman (the absolute), peace in all things, and may that peace come to me. From the Yajurveda, this mantra invokes peace across all realms of existence.',
    benefits: 'Chanted at the start and end of Vedic recitations, yajnas and yoga sessions, and to conclude any spiritual gathering, invoking harmony between the individual and the cosmos.',
  },
  {
    slug: 'ganesh-mantra',
    title: 'Ganesh Mantra',
    titleHi: 'गणेश मंत्र',
    deity: 'Ganesha', deityHi: 'श्री गणेश जी',
    icon: '🐘',
    lyricsHi: `ॐ गं गणपतये नमः।`,
    transliteration: `Om Gam Ganapataye Namah.`,
    meaning: 'Om, salutations to Ganapati (Ganesha), invoked through his seed syllable (bija mantra) "Gam". Ganesha is worshipped first before any undertaking as Vighnaharta, the remover of obstacles.',
    benefits: 'Chanted before starting any new venture, journey, exam or ceremony, and throughout the ten days of Ganesh Chaturthi, for removal of obstacles and auspicious beginnings.',
  },
  {
    slug: 'navgraha-mantras',
    title: 'Navgraha Mantras (All Nine Planets)',
    titleHi: 'नवग्रह मंत्र (नौ ग्रह)',
    deity: 'Navagrahas', deityHi: 'नवग्रह देवता',
    icon: '🪐',
    lyricsHi: `सूर्य: ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः।
चंद्र: ॐ श्रां श्रीं श्रौं सः चंद्राय नमः।
मंगल: ॐ क्रां क्रीं क्रौं सः भौमाय नमः।
बुध: ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः।
गुरु (बृहस्पति): ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः।
शुक्र: ॐ द्रां द्रीं द्रौं सः शुक्राय नमः।
शनि: ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः।
राहु: ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः।
केतु: ॐ स्रां स्रीं स्रौं सः केतवे नमः।`,
    transliteration: `Surya: Om Hram Hreem Hraum Sah Suryaya Namah.
Chandra: Om Shram Shreem Shraum Sah Chandraya Namah.
Mangal: Om Kram Kreem Kraum Sah Bhaumaya Namah.
Budh: Om Bram Breem Braum Sah Budhaya Namah.
Guru (Brihaspati): Om Gram Greem Graum Sah Gurave Namah.
Shukra: Om Dram Dreem Draum Sah Shukraya Namah.
Shani: Om Pram Preem Praum Sah Shanaishcharaya Namah.
Rahu: Om Bhram Bhreem Bhraum Sah Rahave Namah.
Ketu: Om Sram Sreem Sraum Sah Ketave Namah.`,
    meaning: 'Each of the nine planetary deities (Navagrahas) — Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu and Ketu — has its own bija (seed-syllable) mantra used to pacify or strengthen its influence on a person\'s birth chart (kundali).',
    benefits: 'Recited according to which planet is causing difficulty in a person\'s chart (as identified by a Jyotish consultation), typically 108 times on the day of the week ruled by that planet — e.g. the Shani mantra on Saturdays, Surya mantra at sunrise on Sundays.',
  },
  {
    slug: 'durga-devi-mantra',
    title: 'Durga / Devi Mantra',
    titleHi: 'दुर्गा / देवी मंत्र',
    deity: 'Durga', deityHi: 'माँ दुर्गा',
    icon: '🔱',
    lyricsHi: `ॐ दुं दुर्गायै नमः।

सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके।
शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥`,
    transliteration: `Om Dum Durgayai Namah.

Sarva-mangala-mangalye Shive Sarvartha-sadhike,
Sharanye Tryambake Gauri Narayani Namo'stu Te.`,
    meaning: 'Om, salutations to Durga (through her bija "Dum"). The accompanying verse from the Durga Saptashati salutes the Goddess as the auspiciousness of all auspicious things, the accomplisher of every purpose, the refuge of all, and the three-eyed Gauri — an expression of total surrender.',
    benefits: 'Chanted during Navratri, on Tuesdays and Fridays, and whenever seeking protection, strength or the removal of difficulties through the Divine Mother\'s grace.',
  },
  {
    slug: 'lakshmi-mantra',
    title: 'Lakshmi Mantra',
    titleHi: 'लक्ष्मी मंत्र',
    deity: 'Lakshmi', deityHi: 'माँ लक्ष्मी',
    icon: '🪙',
    lyricsHi: `ॐ श्रीं महालक्ष्म्यै नमः।`,
    transliteration: `Om Shreem Mahalakshmyai Namah.`,
    meaning: 'Om, salutations to Mahalakshmi, invoked through her bija mantra "Shreem" — the seed syllable associated with abundance, beauty and prosperity.',
    benefits: 'Chanted on Fridays, during Diwali (especially Lakshmi Puja night) and Sharad Purnima, for financial prosperity, abundance and removal of poverty.',
  },
  {
    slug: 'saraswati-mantra',
    title: 'Saraswati Mantra',
    titleHi: 'सरस्वती मंत्र',
    deity: 'Saraswati', deityHi: 'माँ सरस्वती',
    icon: '📖',
    lyricsHi: `ॐ ऐं सरस्वत्यै नमः।`,
    transliteration: `Om Aim Saraswatyai Namah.`,
    meaning: 'Om, salutations to Saraswati, invoked through her bija mantra "Aim" — the seed syllable associated with knowledge, speech and wisdom.',
    benefits: 'Chanted before study, exams and creative work, and during Basant Panchami, for clarity of thought, memory and skill in the arts and sciences.',
  },
  {
    slug: 'hanuman-mantra',
    title: 'Hanuman Mantra',
    titleHi: 'हनुमान मंत्र',
    deity: 'Hanuman', deityHi: 'श्री हनुमान जी',
    icon: '🐒',
    lyricsHi: `ॐ हं हनुमते नमः।

ॐ हं हनुमते रुद्रात्मकाय हुं फट्।`,
    transliteration: `Om Ham Hanumate Namah.

Om Hum Hanumate Rudratmakaya Hum Phat.`,
    meaning: 'Om, salutations to Hanuman. The first is a simple bija mantra; the second, more intense form invokes Hanuman as an embodiment of Rudra (Shiva\'s fierce aspect), used for stronger protection against fear and negative forces.',
    benefits: 'Chanted on Tuesdays and Saturdays for courage, protection from evil influences, and strength to overcome obstacles and fear.',
  },
  {
    slug: 'guru-mantra',
    title: 'Guru Mantra',
    titleHi: 'गुरु मंत्र',
    deity: 'Guru / Brihaspati', deityHi: 'गुरु देव / बृहस्पति',
    icon: '🙏',
    lyricsHi: `ॐ गुरवे नमः।

ॐ ब्रां ब्रीं ब्रौं सः गुरवे नमः।`,
    transliteration: `Om Gurave Namah.

Om Bram Breem Braum Sah Gurave Namah.`,
    meaning: 'Om, salutations to the Guru — both the spiritual teacher and Brihaspati, the planetary deity of wisdom, knowledge and expansion. The second is Brihaspati\'s bija mantra for astrological purposes.',
    benefits: 'Chanted on Thursdays for wisdom, guidance and success in education, marriage and spiritual growth; also used to strengthen a weak Jupiter (Guru) in one\'s birth chart.',
  },
  {
    slug: 'kuber-mantra',
    title: 'Kuber Mantra',
    titleHi: 'कुबेर मंत्र',
    deity: 'Kuber', deityHi: 'कुबेर देव',
    icon: '💰',
    lyricsHi: `ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये
धनधान्यसमृद्धिं मे देहि दापय स्वाहा।`,
    transliteration: `Om Yakshaya Kuberaya Vaishravanaya Dhana-Dhanyadhipataye
Dhana-Dhanya-Samriddhim Me Dehi Dapaya Swaha.`,
    meaning: 'Om, salutations to Yaksha Kubera, son of Vishrava, lord of wealth and grain — grant me abundance of wealth and grain, and cause it to be given. Kubera is the treasurer of the gods and guardian of the north direction.',
    benefits: 'Chanted on Kubera Jayanti (falling near Dhanteras) and Fridays, for financial stability, business growth and material abundance.',
  },
  {
    slug: 'om-pranava-mantra',
    title: 'Om (Pranava Mantra)',
    titleHi: 'ॐ (प्रणव मंत्र)',
    deity: 'Universal / Brahman', deityHi: 'ब्रह्म / परमात्मा',
    icon: '🕉️',
    lyricsHi: `ॐ॥`,
    transliteration: `Om (Aum).`,
    meaning: 'Om, also called the Pranava mantra, is considered the primordial sound of the universe — the vibration from which all creation emerged. Its three sounds (A-U-M) represent creation, preservation and dissolution, and the silence after it represents the transcendent fourth state (turiya) — pure consciousness beyond the three.',
    benefits: 'Chanted at the start of any mantra, prayer or meditation session; considered the seed of all mantras. Regular Om chanting is used for grounding, focus and connecting with the underlying unity of existence.',
  },
];
