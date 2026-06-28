export interface Rashi {
  id: string;
  name: string;
  nameHi: string;
  english: string;
  symbol: string;
  element: string;
  quality: string;
  lord: string;
  lordHi: string;
  luckyColor: string;
  luckyColorHex: string;
  luckyNumbers: number[];
  luckyDay: string;
  gradient: string;
  nameLetters: string[];
  predictions: {
    daily: string[];
    weekly: string;
    monthly: string;
    yearly: string;
  };
}

export const RASHIS: Rashi[] = [
  {
    id: "mesha",
    name: "Mesha",
    nameHi: "मेष",
    english: "Aries",
    symbol: "♈",
    element: "Fire",
    quality: "Cardinal",
    lord: "Mars",
    lordHi: "मंगल",
    luckyColor: "Red",
    luckyColorHex: "#dc2626",
    luckyNumbers: [1, 8, 17],
    luckyDay: "Tuesday",
    gradient: "linear-gradient(135deg,#ff6b35,#f7931e)",
    nameLetters: ["Chu", "Che", "Cho", "La", "Li", "Lu", "Le", "Lo", "A"],
    predictions: {
      daily: [
        "Mars, your ruling planet, ignites your ambitions with exceptional force today. A professional opportunity that has been developing quietly steps into full view — approach it with your characteristic boldness. Relationships flourish when you lead with warmth rather than urgency. Channel surplus energy into evening exercise for maximum benefit.",
        "Financial clarity arrives today, empowering you to act on a decision you have been weighing carefully. Your natural courage helps you navigate a challenge that others avoid. An honest, direct conversation dissolves a lingering misunderstanding with someone close. Avoid impulsive purchases; patience serves you well.",
        "Creative fire burns unusually bright today. A project or idea that has been simmering is ready to move forward — present it with confidence. A chance encounter in professional or social settings may spark a collaboration richer than you anticipate. Health is strong; physical activity amplifies your natural drive.",
        "Family matters take the center stage and your quiet leadership within the home circle is genuinely appreciated. At work, your ideas gain traction precisely when you express them clearly. Afternoon favors important decisions and meaningful networking. Allow yourself genuine rest before the night.",
        "A surge of optimism accompanies you through this day. Long-standing goals feel tangibly within reach, and an elder or mentor offers guidance that resonates at a deeper level. Financial discipline today lays the foundation for abundance tomorrow. A meditative practice in the morning brings unusual peace."
      ],
      weekly: "This week unfolds with Mars energizing your ambitions in meaningful and measurable ways. Early on, a professional matter that has stalled begins to move decisively — push forward without hesitation. Midweek brings welcome movement in a financial situation, potentially through a new source or overdue resolution. Relationships need attention around Wednesday; a heartfelt conversation heals what logic alone could not. The weekend is ideal for creative work, family time, and strategic rest. A week of tangible progress and renewed confidence.",
      monthly: "Mesha natives enter this month with renewed energy and real opportunity. The first week is ideal for launching projects, establishing new contacts, and taking initiative. Around the second week, finances come into focus — review your outgoings and consider one sound long-term investment. The third week brings social vitality and the possibility of a meaningful new connection. The final days are best used for consolidating what you have built and setting clear intentions ahead. Mars favors the bold this month — step forward without second-guessing yourself.",
      yearly: "This year marks a period of significant growth and personal transformation for Mesha natives. The first quarter accelerates professional advancement — promotions, expansions, or new roles become realistic possibilities. Mid-year brings a powerful focus on relationships; what you build or rebuild now will stand for years to come. Finances improve steadily through disciplined effort and strategic thinking. Health remains strong when you balance your natural intensity with adequate recovery. The final quarter is particularly potent for spiritual deepening and long-range goal-setting. Mars keeps your inner fire burning brightly throughout the year."
    }
  },
  {
    id: "vrishabha",
    name: "Vrishabha",
    nameHi: "वृषभ",
    english: "Taurus",
    symbol: "♉",
    element: "Earth",
    quality: "Fixed",
    lord: "Venus",
    lordHi: "शुक्र",
    luckyColor: "White",
    luckyColorHex: "#10b981",
    luckyNumbers: [2, 6, 15],
    luckyDay: "Friday",
    gradient: "linear-gradient(135deg,#11998e,#38ef7d)",
    nameLetters: ["I", "U", "E", "O", "Va", "Vi", "Vu", "Ve", "Vo"],
    predictions: {
      daily: [
        "Venus, your ruling planet, casts a gracious light on your relationships and creative endeavors today. A project you have nurtured with patience receives well-deserved recognition. Finances are stable — a wise decision made earlier begins to show its returns. Evening gatherings bring genuine warmth and joy.",
        "Your patience is your power today. While others rush, your steady and deliberate approach earns deep respect in professional settings. A heartfelt exchange with a family member strengthens your bond in lasting ways. Guard your health by avoiding overindulgence in rich foods or late nights.",
        "Your artistic sensibilities shine with particular brilliance today. Pursue any creative endeavor with confidence — the results will exceed your own expectations. Financially, a new or additional income stream deserves serious exploration. Love and harmony fill your domestic world beautifully.",
        "A day for quiet reflection and inner strengthening. Philosophical or spiritual pursuits bring unexpected clarity on a matter that has puzzled you. Professional matters advance steadily and reliably. Someone from your past may reach out with an offer or an apology that deserves thoughtful consideration.",
        "Practical matters take priority, and your earth energy makes you unusually effective today. Financial planning, property decisions, or long-term security measures benefit from your focused attention. Your reliability earns genuine appreciation from colleagues and loved ones alike. An evening in nature deeply recharges your spirit."
      ],
      weekly: "Venus blesses your week with grace and creative momentum. The beginning of the week favors artistic projects and meaningful conversations — take advantage of this receptive energy. A midweek financial insight points toward a wiser allocation of your resources. Relationships deepen beautifully through small, consistent acts of affection and presence. By the weekend, a sense of earned contentment settles over you. Use Sunday to plan and prepare for a particularly productive week ahead.",
      monthly: "This month asks Vrishabha natives to trust their natural steadiness. The first half favors financial review and creative investment — a quiet but important decision made now has lasting impact. Around mid-month, relationships move into a more harmonious phase; a long-standing tension resolves with grace. The final two weeks are ideal for consolidating efforts and enjoying the material and emotional security you have built. Venus brings beauty and pleasure to daily life when you slow down enough to notice it.",
      yearly: "Vrishabha natives experience this as a year of quiet but profound consolidation and growth. Financially, steady improvements compound through the year, especially if you invest wisely in the first quarter. Relationships deepen rather than expand — quality over quantity is the theme. Creatively, this is one of your finest years; projects that blend beauty with purpose find their audience. Health benefits from consistent, enjoyable physical practices rather than extreme regimens. By year's end, you will look back at genuine and lasting accomplishments that were built one patient day at a time."
    }
  },
  {
    id: "mithuna",
    name: "Mithuna",
    nameHi: "मिथुन",
    english: "Gemini",
    symbol: "♊",
    element: "Air",
    quality: "Mutable",
    lord: "Mercury",
    lordHi: "बुध",
    luckyColor: "Yellow",
    luckyColorHex: "#d97706",
    luckyNumbers: [3, 5, 14],
    luckyDay: "Wednesday",
    gradient: "linear-gradient(135deg,#7928ca,#a855f7)",
    nameLetters: ["Ka", "Ki", "Ku", "Gha", "Da", "Cha", "Ke"],
    predictions: {
      daily: [
        "Mercury sharpens your wit and communication to a fine edge today. Intellectual exchanges and meaningful conversations bring deep satisfaction. A business negotiation tilts in your favor when you remain articulate and calm. Social energy is high — embrace it with your characteristic adaptability.",
        "Ideas arrive in a flowing stream today — capture the best ones before they scatter. A short journey or a simple change of environment fuels fresh inspiration. Professional collaborations thrive when you take the initiative confidently. Romance deepens through intellectual connection rather than grand gestures.",
        "Your adaptability is your greatest strength as circumstances shift unexpectedly. Both planned activities and spontaneous moments yield rewarding outcomes. A sibling, friend, or close peer plays a meaningful role in today's events. Health flourishes through mental stimulation balanced with physical movement.",
        "Your natural charm draws people toward you today, and a new acquaintance could become a valuable long-term ally. Financial matters benefit from careful review rather than new decisions today. Digital communications, writing, or presentations deserve extra care — precision pays well. An evening of learning enriches your already fertile mind.",
        "Communication opens doors today that have remained closed for some time. Express your thoughts with clarity and authenticity — misunderstandings dissolve when you speak from the heart. A creative project receives an unexpected breakthrough. Trust the speed and intelligence of your mercurial mind."
      ],
      weekly: "Mercury rules this week with exceptional influence over communication, travel, and intellectual pursuits. Early in the week, an important message or opportunity arrives through a connection you have cultivated. Midweek is ideal for negotiations, presentations, and collaborative brainstorming — your ideas are unusually persuasive. A social gathering midweek introduces someone who broadens your horizon. The weekend favors short travel or simply a change of scenery that refreshes your perspective. A mentally stimulating and socially vibrant week.",
      monthly: "Mithuna natives experience this month as a whirlwind of ideas, conversations, and connections. The first week is ideal for launching communication-heavy projects, making key calls, and expanding your network. Around the second week, a financial matter benefits from a clever and unconventional approach. The third week heightens social activity — attend gatherings and be open to meaningful new relationships. The final week is best for organizing the information and insights you have gathered and preparing for what comes next. Mercury keeps your mind sharp and your connections alive all month.",
      yearly: "This year, Mithuna natives are called to deepen what they know rather than simply accumulate new knowledge. The first quarter brings an exciting professional development — a project, role, or platform that stretches your versatile mind. Relationships benefit from more depth and less breadth; genuine connection nourishes you more than surface-level socializing. Financially, multiple income streams become possible — nurture them patiently. Mid-year brings travel or study opportunities that expand your worldview substantially. By year's end, you emerge more articulate, more connected, and more purposefully directed than you began."
    }
  },
  {
    id: "karka",
    name: "Karka",
    nameHi: "कर्क",
    english: "Cancer",
    symbol: "♋",
    element: "Water",
    quality: "Cardinal",
    lord: "Moon",
    lordHi: "चन्द्र",
    luckyColor: "White",
    luckyColorHex: "#6366f1",
    luckyNumbers: [2, 7, 11],
    luckyDay: "Monday",
    gradient: "linear-gradient(135deg,#1e90ff,#6dd5fa)",
    nameLetters: ["Hi", "Hu", "He", "Ho", "Da", "Di", "Du", "De", "Do"],
    predictions: {
      daily: [
        "The Moon deepens your emotional intelligence to remarkable levels today, making you a natural healer for those in your orbit. Family bonds strengthen through genuine, unhurried presence. A domestic matter that needed resolution finds its harmony. Your intuition guides you toward exactly the right financial choice.",
        "Your sensitivity to what others feel but do not say makes you extraordinarily effective in both personal and professional relationships today. A home-related matter receives positive energy and moves forward smoothly. A cherished memory inspires a creative idea worth pursuing. Health is nourished by home-cooked food and early rest.",
        "Emotions run deep but clear today — honor what you feel without being swept away. Career matters benefit from your empathetic leadership style, which others find reassuring. Financial abundance grows through prudent saving rather than earning. A loved one needs your calm and steady reassurance.",
        "Home and family form the heart of today's most meaningful moments. A celebration or gathering, however simple, brings profound satisfaction. Your creative gifts surface unexpectedly in a practical context. Your nurturing energy attracts deep trust and quiet appreciation from all around you.",
        "Inner wisdom guides outer decisions with unusual clarity today. Professional superiors notice your steady, quiet contributions in ways that have real consequence. Romance flourishes through emotional vulnerability and honest sharing. A healing conversation repairs a rift that has lingered longer than it should have."
      ],
      weekly: "The Moon's shifting phases bring emotional richness to your week. Early in the week, family matters or home improvements deserve your attention and will reward it. Midweek brings a professional opportunity that aligns beautifully with your natural gifts for care and connection. A creative project receives meaningful momentum around Thursday. The weekend is best for nurturing yourself and the relationships that matter most. Overall, a week of emotional depth, creative expression, and domestic warmth.",
      monthly: "This month, Karka natives move through a deeply personal and rewarding cycle. The first week asks you to tend to home and family with extra care — your investment here pays invisible but lasting dividends. The second week shifts attention to professional matters where your intuitive understanding of people becomes your competitive advantage. Around the third week, a financial improvement arrives through patience rather than effort. The final days invite spiritual renewal and self-care. The Moon guides you beautifully this month — trust her rhythms.",
      yearly: "Karka natives enter this year with an invitation to deepen their emotional foundation and expand from there. The first half of the year is particularly significant for home, family, and inner healing — decisions made now shape your domestic life for years ahead. Professionally, your empathetic approach gains recognition in unexpected ways, possibly leading to a role that lets you combine caring and leading. Financially, stability grows through disciplined habits and one wise long-term commitment. In the second half of the year, creative and spiritual pursuits flourish with unusual richness. By the year's end, you feel more rooted and more yourself than ever before."
    }
  },
  {
    id: "simha",
    name: "Simha",
    nameHi: "सिंह",
    english: "Leo",
    symbol: "♌",
    element: "Fire",
    quality: "Fixed",
    lord: "Sun",
    lordHi: "सूर्य",
    luckyColor: "Gold",
    luckyColorHex: "#f59e0b",
    luckyNumbers: [1, 5, 9],
    luckyDay: "Sunday",
    gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
    nameLetters: ["Ma", "Mi", "Mu", "Me", "Mo", "Ta", "Ti", "Tu", "Te"],
    predictions: {
      daily: [
        "The Sun, your ruling luminary, fills you with exceptional confidence and natural charisma today. Leadership opportunities arise organically — step into them without hesitation. Creative work earns recognition and genuine praise. Romance sparkles with a gesture that comes directly from the heart.",
        "Your natural authority commands respect in group settings today. A project you championed wholeheartedly receives enthusiastic support. Family members look to you for guidance, and your instincts prove sound and reassuring. Financial recognition for past efforts arrives or is confirmed in a satisfying way.",
        "Radiance flows from within today, attracting positive attention from all directions. Use your influence to uplift rather than merely to impress — the goodwill returns to you multiplied. An artistic or performance-related opportunity deserves serious and immediate consideration. Evening socializing is particularly enjoyable and rewarding.",
        "Ambition and generosity walk hand in hand today. While you pursue your goals with signature flair, a small act of kindness creates unexpectedly lasting impact. Professional recognition may come through an unusual or indirect channel. Health is excellent — physical activity amplifies your already impressive vitality.",
        "A creative project reaches a milestone that brings deep and genuine satisfaction. The spotlight falls on you today, and the audience — professional or personal — is fully receptive. Capitalize on this favorable energy without overextending. A mentor or senior person's acknowledgment confirms the direction you have been moving."
      ],
      weekly: "The Sun shines brilliantly on your week, bringing visibility, recognition, and creative momentum. Early in the week, a leadership opportunity presents itself — embrace it with characteristic warmth and authority. Midweek brings a financial positive, possibly a confirmation or approval you have been waiting for. A creative breakthrough occurs around Thursday, adding excitement to your professional output. The weekend is best for romance, family connection, and activities that recharge your royal spirit. A week that rewards your authenticity and natural gifts.",
      monthly: "Simha natives experience this month as a time of creative peak and public recognition. The first week is ideal for big presentations, leadership initiatives, and showcasing your talents — the stage is yours. A financial matter that has been uncertain resolves favorably around the second week. Mid-month brings romantic or social energy that lifts your spirits beautifully. The final week is for consolidating your gains and planning the next act with the strategic mind behind your shining heart. The Sun ensures you are seen and appreciated this month.",
      yearly: "This year, the Sun grants Simha natives unusual visibility and recognition across nearly every domain of life. The first quarter is exceptionally favorable for career advancement — a promotion, a new platform, or a public role that honors your gifts becomes real. Relationships are enriched when you balance your natural need for admiration with genuine curiosity about others. Financially, creative ventures and personal branding opportunities offer the best returns. Health flourishes through consistent physical activity and periodic recovery. By mid-year, a creative project reaches a pinnacle. The year's final quarter is deeply fulfilling for spiritual growth and legacy-building."
    }
  },
  {
    id: "kanya",
    name: "Kanya",
    nameHi: "कन्या",
    english: "Virgo",
    symbol: "♍",
    element: "Earth",
    quality: "Mutable",
    lord: "Mercury",
    lordHi: "बुध",
    luckyColor: "Green",
    luckyColorHex: "#16a34a",
    luckyNumbers: [3, 6, 15],
    luckyDay: "Wednesday",
    gradient: "linear-gradient(135deg,#56ab2f,#a8e063)",
    nameLetters: ["To", "Pa", "Pi", "Pu", "Sha", "Na", "Tha", "Pe", "Po"],
    predictions: {
      daily: [
        "Mercury guides your analytical mind to exceptional precision today. A complex problem unravels elegantly through your methodical approach. Professional efficiency impresses even your most discerning colleagues. Health improves markedly when you bring the same attention to your diet and daily routine.",
        "Detail-oriented work produces outstanding results today. Your ability to notice what others overlook becomes your professional superpower. Finances benefit from a careful review of ongoing expenses and commitments. A quiet evening of reading or personal study renews your intellectual spark.",
        "Service to others brings genuine and deep personal satisfaction today. Your practical advice helps a friend or colleague navigate a complex situation with grace. Professional recognition comes through your consistent reliability rather than a single dramatic act. A wellness practice started now becomes a lasting and treasured habit.",
        "Use your critical faculties constructively today — for refinement and improvement rather than judgment. A long-term project advances significantly through your careful and sustained attention. Financial matters benefit from consulting a knowledgeable expert before acting. Relationships flourish when you allow yourself to relax your exacting standards.",
        "Practicality and intelligence combine with unusual power today. An administrative or organizational challenge yields to your characteristic efficiency. A skillful negotiation produces better results than you anticipated. Evening journaling, planning, or any quiet solo practice brings clarity and calm."
      ],
      weekly: "Mercury brings analytical sharpness and practical momentum to your week. Early on, a detailed project or complex task benefits enormously from your focused attention — schedule time for deep work. Midweek, a health or wellness matter deserves your careful investigation; addressing it now prevents complications later. A helpful conversation around Thursday offers a practical solution to a problem you have been carrying. The weekend is ideal for organizing your environment and planning ahead with your characteristic precision. A productive and grounding week.",
      monthly: "This month asks Kanya natives to trust their methodical, careful approach — it is precisely what the moment requires. The first week is ideal for detailed work, research, and health improvements. A professional recognition or advancement arrives quietly but meaningfully in the second week. Around mid-month, a financial matter benefits from your careful analysis and an expert consultation. The final days of the month are best for reflection and preparation. Mercury keeps your mind sharp and your service to others deeply effective throughout.",
      yearly: "Kanya natives experience this as a year of professional refinement and health transformation. In the first quarter, a major work project benefits from your disciplined intelligence and earns recognition that opens important doors. Relationships improve significantly when you practice expressing appreciation as readily as you offer critique. Financially, careful management in the first half yields genuine security by the year's close. A health or wellness journey begun this year has lasting and meaningful results. Mid-year brings a creative or analytical breakthrough in your area of expertise. By year's end, your reputation for precision and reliability stands stronger than ever."
    }
  },
  {
    id: "tula",
    name: "Tula",
    nameHi: "तुला",
    english: "Libra",
    symbol: "♎",
    element: "Air",
    quality: "Cardinal",
    lord: "Venus",
    lordHi: "शुक्र",
    luckyColor: "White",
    luckyColorHex: "#ec4899",
    luckyNumbers: [2, 7, 15],
    luckyDay: "Friday",
    gradient: "linear-gradient(135deg,#ff9a9e,#fecfef)",
    nameLetters: ["Ra", "Ri", "Ru", "Re", "Ro", "Ta", "Ti", "Tu", "Te"],
    predictions: {
      daily: [
        "Venus graces your interpersonal world with exceptional harmony today. Partnerships of all kinds — romantic, professional, creative — benefit from your rare diplomatic gift. A fair decision in a complex situation earns lasting respect. Beauty and aesthetic pleasures renew your spirit in subtle but meaningful ways.",
        "Balance is both your theme and your natural gift today. Competing priorities align into a workable rhythm under your calm guidance. A long-debated decision finally becomes clear when you trust your instincts as much as your logic. Financial gains come through partnership or collaborative effort.",
        "Your innate sense of fairness gracefully resolves a workplace or social tension today. Connections flourish at any gathering or event you attend. A creative collaboration offers both financial and personal rewards. Your sense of beauty and harmony makes every environment you enter more pleasant.",
        "Harmony in your closest relationships enriches every other area of your life today. Romantic energies are especially warm — small, thoughtful gestures create the most lasting memories. A professional opportunity related to arts, law, diplomacy, or aesthetics deserves close and enthusiastic attention. Let beauty nourish your soul.",
        "The scales find their perfect equilibrium today, giving you unusual clarity on a matter that has long seemed unresolvable. A legal or contractual matter moves in your favor. Your social grace and interpersonal intelligence solve a problem that pure logic could not touch. Evening companionship brings joy."
      ],
      weekly: "Venus brings harmony, beauty, and social grace to your entire week. Early in the week, a relationship — personal or professional — deepens through a candid and caring conversation. Midweek is excellent for creative projects and aesthetic decisions; your taste is impeccable right now. A collaborative opportunity around Thursday is worth exploring seriously. The weekend is ideal for social gatherings, romantic connection, and any pursuit that brings you joy and beauty. A week of meaningful connections and harmonious progress.",
      monthly: "This month, Tula natives experience a cycle of relational richness and creative abundance. The first week favors partnerships — make the time to nurture your closest connections. A financial matter tied to shared resources or a joint venture moves forward in the second week. Mid-month brings social and creative energy that fills your life with beauty and stimulating exchange. The final week is for rest, reflection, and appreciating how far you have come. Venus ensures that love and harmony find you this month when you reach for them.",
      yearly: "This year, Tula natives are invited into a rich and rewarding cycle of relationships and creative expression. The first quarter brings significant developments in a partnership — romantic, business, or creative — that shapes the year ahead. Financial decisions made with a trusted partner in the first half pay well in the second. Your artistic talents find a broader audience or deeper expression mid-year. Health improves through beautiful, enjoyable practices — dance, music, time in nature. The final quarter brings a sense of completeness and elegance to the year. Venus ensures this is a year of genuine beauty and meaningful connection."
    }
  },
  {
    id: "vrishchika",
    name: "Vrishchika",
    nameHi: "वृश्चिक",
    english: "Scorpio",
    symbol: "♏",
    element: "Water",
    quality: "Fixed",
    lord: "Mars",
    lordHi: "मंगल",
    luckyColor: "Red",
    luckyColorHex: "#b91c1c",
    luckyNumbers: [1, 4, 8],
    luckyDay: "Tuesday",
    gradient: "linear-gradient(135deg,#8b0000,#c0392b)",
    nameLetters: ["To", "Na", "Ni", "Nu", "Ne", "No", "Ya", "Yi", "Yu"],
    predictions: {
      daily: [
        "Your penetrating intuition navigates hidden currents with uncommon skill today. A concealed matter surfaces in a way that works entirely in your favor. Transformation is your companion — embrace change rather than resist it. Emotional intensity, channeled wisely, becomes creative and professional power.",
        "Your investigative nature uncovers valuable information that others have missed entirely. A financial matter linked to shared resources, an inheritance, or a partnership moves forward decisively. Intense focus on a single goal produces significant progress. Trust your regenerative power — what seems like an ending is always a beginning.",
        "Passion fuels both your ambitions and your relationships with unusual intensity today. Your magnetic presence draws important people into your orbit naturally. A long-hidden truth comes to light, and though surprising, it ultimately serves your highest good. Detoxification practices benefit your health in both body and mind.",
        "Transformation energy runs particularly strong today — release what no longer serves you with courageous trust. Professional power grows through strategic insight rather than visible force. Romance deepens through authentic emotional vulnerability. An unexpected ally emerges from a source that surprises you pleasantly.",
        "Your resilience in the face of complexity inspires those around you, quietly and powerfully. A negotiation or strategic decision reaches a turning point solidly in your favor. Financial matters tied to research, investigation, or deep analysis show promising returns. Spiritual and psychological insight deepens with unusual clarity."
      ],
      weekly: "Transformation energy permeates your week in powerful and productive ways. Early in the week, a strategic move in your professional life sets a significant and rewarding process in motion. Midweek, a financial or resource-related matter benefits from your characteristic depth of research and analysis. Emotional conversations around Thursday clear the air and open space for deeper, more authentic connection. The weekend is ideal for introspection, spiritual practice, and releasing what no longer belongs in your life. A week of depth, power, and meaningful forward movement.",
      monthly: "This month, Vrishchika natives experience a cycle of deep transformation and strategic advancement. The first week is ideal for research, investigation, and behind-the-scenes preparation — your groundwork now shapes the public results later. A financial opportunity connected to shared resources or investment appears in the second week. Mid-month brings intense relational energy — honest conversations now deepen bonds that will last. The final week is for internal renewal and preparing for a significant next cycle. Mars and the depths of your Vrishchika nature give you extraordinary resilience and focus this month.",
      yearly: "This year, the Scorpio forces of regeneration and strategic power work unmistakably in your favor. In the first quarter, a professional or financial matter requires deep investigation — your willingness to look beneath the surface produces extraordinary results. Relationships are transformed through courageous honesty in the mid-year period; what is released makes space for something far richer. Financial empowerment comes through shared ventures, inheritance matters, or investments that you approach with your signature depth. Health benefits dramatically from detoxification and psychological healing practices. By year's end, you have risen from a chrysalis into something more powerful, more purposeful, and more authentically yourself."
    }
  },
  {
    id: "dhanu",
    name: "Dhanu",
    nameHi: "धनु",
    english: "Sagittarius",
    symbol: "♐",
    element: "Fire",
    quality: "Mutable",
    lord: "Jupiter",
    lordHi: "गुरु",
    luckyColor: "Yellow",
    luckyColorHex: "#7c3aed",
    luckyNumbers: [3, 9, 12],
    luckyDay: "Thursday",
    gradient: "linear-gradient(135deg,#4776e6,#8e54e9)",
    nameLetters: ["Ye", "Yo", "Bha", "Bhi", "Bhu", "Dha", "Fa", "Bhe"],
    predictions: {
      daily: [
        "Jupiter, your generous ruling planet, expands your horizons today in tangible and exciting ways. A philosophical insight translates directly into practical wisdom. Travel, learning, or cross-cultural connections bring both excitement and real opportunity. Your optimism is your greatest asset — protect and share it freely.",
        "Freedom and purposeful adventure call to your spirit today. A professional opportunity with international, academic, or philosophical dimensions deserves enthusiastic and immediate exploration. Your honesty, though sometimes blunt, wins the deep respect of those who truly matter. Financial blessings tend to follow genuine generosity.",
        "Your natural enthusiasm ignites those around you like a flame. Leadership in an academic, spiritual, or journalistic endeavor brings meaningful recognition. Long-distance connections prove more fruitful than you anticipated. A higher philosophical truth crystallizes with unusual clarity, bringing deep inner peace.",
        "The archer's aim is precise today — set your sights on the highest target and release with full confidence. A legal, educational, or cross-cultural matter resolves favorably. Your breadth of perspective solves a problem that narrower minds have struggled with for months. Romance flourishes through shared ideals and genuine laughter.",
        "Expansion in every meaningful dimension marks this day. Financial growth, intellectual broadening, and spiritual deepening occur almost simultaneously. Your philosophical perspective helps a friend gain valuable, freeing clarity. Evening is ideal for planning an adventure, long-distance communication, or studying something that has long fascinated you."
      ],
      weekly: "Jupiter blesses your week with expansion, wisdom, and fortunate connections. Early in the week, an educational or travel-related opportunity appears — explore it with your characteristic optimism. Midweek brings a philosophical or spiritual insight that shifts your perspective on a challenge you have been carrying. A fortunate financial development around Thursday rewards a risk you took with integrity. The weekend is perfect for outdoor adventure, meaningful study, or long-distance connection. An expansive and horizon-widening week.",
      monthly: "Dhanu natives enter this month with the wind of Jupiter fully at their backs. The first week is ideal for launching anything that requires vision, optimism, and a broad perspective. Around the second week, an educational pursuit, travel plan, or cultural connection opens a door you did not know was there. Mid-month brings philosophical depth to your personal relationships — conversations go beyond the surface. The final week rewards your generosity and authenticity with unexpected but fitting returns. Jupiter keeps your arrow flying true and far this month.",
      yearly: "This year, Jupiter invites Dhanu natives into one of their finest cycles of growth, wisdom, and fortunate expansion. The first quarter brings a significant learning, travel, or philosophical development that shapes your entire year. Professionally, opportunities with international scope or educational dimension prove especially rewarding. Relationships deepen through shared ideals, humor, and a mutual hunger for meaning. Financially, generosity and investment in self-development bring surprisingly strong returns. Health flourishes through outdoor activity and sustained connection with nature and community. The year closes with a genuine sense of having grown in wisdom, in connection, and in joyful purpose."
    }
  },
  {
    id: "makara",
    name: "Makara",
    nameHi: "मकर",
    english: "Capricorn",
    symbol: "♑",
    element: "Earth",
    quality: "Cardinal",
    lord: "Saturn",
    lordHi: "शनि",
    luckyColor: "Black",
    luckyColorHex: "#374151",
    luckyNumbers: [1, 4, 10],
    luckyDay: "Saturday",
    gradient: "linear-gradient(135deg,#2c3e50,#4a6741)",
    nameLetters: ["Bho", "Ja", "Ji", "Khi", "Khu", "Khe", "Kho", "Ga", "Gi"],
    predictions: {
      daily: [
        "Saturn rewards your patient and steadfast efforts with concrete results today. A professional milestone long in preparation becomes a tangible reality. Elders or people in authority offer recognition that carries genuine weight. Financial planning set in motion earlier now bears excellent and visible fruit.",
        "Perseverance is your highest power today, and circumstances conspire to test and then reward it richly. A structural or organizational challenge at work yields to your methodical and disciplined approach. Family responsibilities, though demanding, bring their own quietly profound satisfaction.",
        "Your ambition and groundedness align perfectly today — your goals are appropriately ambitious, and your methods are completely sound. A long-term investment begins to show genuinely promising signs. Relationships within professional hierarchies improve markedly through your consistent integrity. Health benefits most from structured and regular physical activity.",
        "Structure and discipline create the freedom you genuinely desire today. A major project moves into a decisive new phase. Financial matters tied to property, long-term savings, or planned security receive favorable energy. Respect from colleagues and superiors feels especially earned and meaningful today.",
        "The mountain goat reaches the next summit today, steadily and without fanfare. Hard-won achievements receive acknowledgment from the people whose opinion matters most to you. A professional or financial negotiation rewards the most patient party — which is always you. Domestic responsibilities are completed with characteristic thoroughness and quiet pride."
      ],
      weekly: "Saturn brings discipline, structure, and earned reward to your week. Early on, a long-term project demands your full attention and focus — give it completely. Midweek, an elder, authority figure, or established institution offers support or recognition that carries real weight. A financial matter progresses favorably around Thursday through your patient and principled approach. The weekend is for rest, family connection, and the quiet satisfaction of reviewing what you have built. A week of solid, lasting progress.",
      monthly: "This month, Makara natives are asked to stay the patient and steady course — it is exactly the right strategy. The first week favors professional consolidation and disciplined financial planning. A significant career development or long-awaited recognition arrives in the second week. Mid-month brings family and home matters into focus; investments here pay invisible but lasting dividends. The final days are ideal for rest, strategic reflection, and preparing for the next climb. Saturn rewards your integrity and persistence faithfully and fully this month.",
      yearly: "This year, Saturn invites Makara natives into a time of significant and lasting achievement. The first quarter brings a major professional development — a promotion, a founding moment, or an accomplishment that defines the next chapter. Financially, patient long-term strategies that you have been faithfully executing begin to show remarkable results. Relationships with family and respected mentors deepen through consistent presence and care. Health requires disciplined attention to both body and rest — the rewards are lasting vitality. In the second half of the year, a creative or spiritual dimension opens unexpectedly, enriching your famously practical nature. The year closes with a sense of earned pride and genuine, well-built security."
    }
  },
  {
    id: "kumbha",
    name: "Kumbha",
    nameHi: "कुम्भ",
    english: "Aquarius",
    symbol: "♒",
    element: "Air",
    quality: "Fixed",
    lord: "Saturn",
    lordHi: "शनि",
    luckyColor: "Blue",
    luckyColorHex: "#0284c7",
    luckyNumbers: [4, 7, 11],
    luckyDay: "Saturday",
    gradient: "linear-gradient(135deg,#00b4db,#0083b0)",
    nameLetters: ["Gu", "Ge", "Go", "Sa", "Si", "Su", "Se", "So", "Da"],
    predictions: {
      daily: [
        "Innovative thinking sets you apart in remarkable ways today. An unconventional solution to a persistent problem earns admiration from unexpected quarters. Humanitarian impulses and intellectual brilliance combine into a powerful and effective force. Friendship and community connections carry unusual energy and promise today.",
        "Your visionary perspective is an extraordinary gift to those around you today. A group project or community initiative benefits immensely from your forward-thinking leadership and genuine care. Technological or scientific pursuits show particular promise. A friend brings news that aligns perfectly with a long-held aspiration of yours.",
        "Originality is your decisive competitive advantage today. Where others follow convention, your unique approach opens entirely new possibilities for everyone. Financial gains through technology, innovation, or non-traditional channels are genuinely indicated. Intellectual friendships deepen through passionate and stimulating shared conversation.",
        "Social engagement, meaningful discourse, and authentic human connection energize you today. A cause you believe in gains important momentum through your advocacy and presence. Professional opportunities arise through your network rather than through conventional channels. Evening time with like-minded friends renews your spirit completely.",
        "Breakthroughs arrive when you trust your most unconventional instincts today. A humanitarian or community project reaches a meaningful milestone. A friendship or network connection opens an unexpected professional door. Your characteristic detachment gives you liberating clarity on a personal matter that has felt complicated."
      ],
      weekly: "Your revolutionary spirit and humanitarian heart make this a week of meaningful impact. Early on, an innovative idea or project receives the support it has long deserved — move it forward decisively. Midweek, a technological or digital opportunity presents itself; your ahead-of-the-curve thinking is perfectly suited to it. A community connection or friendship around Thursday opens an important professional door. The weekend is best for recharging through authentic social engagement and intellectual exploration. A week of creative breakthroughs and community connection.",
      monthly: "Kumbha natives experience this month as a time of social richness and innovative breakthrough. The first week is ideal for community initiatives, group projects, and expanding your network in meaningful ways. A technological or unconventional financial opportunity appears around the second week — investigate it with your characteristic open mind. Mid-month brings friendship, intellectual community, and the sense of belonging to something larger than yourself. The final week is best for vision work — imagining and planning the future you want to create. Saturn and your Aquarian originality make you a force for genuine progress this month.",
      yearly: "This year, Kumbha natives are called into their fullest expression as innovators, humanitarians, and visionaries. The first quarter brings a breakthrough in your field of expertise or a cause you champion — your unconventional thinking is recognized and rewarded. Relationships are enriched through intellectual kinship and genuine shared purpose rather than surface compatibility. Financially, platforms, technologies, and collaborative ventures offer the most promising returns. Health benefits from community-based activities, mental stimulation, and friendships that genuinely nourish you. A significant creative or social contribution in the mid-year period earns recognition that surprises and delights you. The year closes with a powerful sense of having contributed something genuinely meaningful to the world."
    }
  },
  {
    id: "meena",
    name: "Meena",
    nameHi: "मीन",
    english: "Pisces",
    symbol: "♓",
    element: "Water",
    quality: "Mutable",
    lord: "Jupiter",
    lordHi: "गुरु",
    luckyColor: "Sea Green",
    luckyColorHex: "#0d9488",
    luckyNumbers: [3, 7, 12],
    luckyDay: "Thursday",
    gradient: "linear-gradient(135deg,#834d9b,#d04ed6)",
    nameLetters: ["Di", "Du", "Tha", "Jha", "Na", "De", "Do", "Cha", "Chi"],
    predictions: {
      daily: [
        "Jupiter deepens your spiritual perception and creative intuition to extraordinary levels today. An artistic project reaches a new and transcendent dimension. Intuitive flashes guide you unerringly toward the right decision in a complex personal matter. Compassionate service to another person brings profound and lasting inner fulfillment.",
        "Dreams and inner visions carry important messages today — pay gentle but careful attention. Your creative imagination produces work of unusual beauty and emotional depth. A spiritual practice or pilgrimage of any kind nourishes your soul in ways that stay with you. Financial matters benefit from following deep intuition over rigid strategy.",
        "Your deep and natural empathy serves as a true healing balm for those in your circle today. An artistic or spiritual endeavor reaches a moment of genuine grace. Romantic love flows with unusual tenderness and depth. A charitable act or selfless service brings blessings that return to you many times over.",
        "The boundary between the seen and unseen grows unusually thin today, gifting you with extraordinary insight. A long-puzzling situation becomes beautifully, liberatingly clear. Creative work flows with almost effortless grace. A spiritual mentor or guiding presence arrives at precisely the moment you most need them, in whatever form.",
        "Your compassion and creativity combine into something rare and genuinely needed today. Professional opportunities in healing, arts, spirituality, or service are especially favored. A financial matter connected to hidden resources or a past obligation clarifies in a positive direction. Meditation or contemplative practice opens inner doors that enrich everything else."
      ],
      weekly: "Jupiter bathes your week in spiritual grace and creative abundance. Early on, an artistic or compassionate project receives unexpected recognition or support — accept it graciously. Midweek brings a spiritual insight or synchronistic encounter that shifts your perspective in a lasting way. A financial matter tied to creative work or service receives a positive development around Thursday. The weekend is ideal for meditation, creative expression, time near water, and the company of those who truly understand you. A week of deep beauty and meaningful contribution.",
      monthly: "This month, Meena natives flow through a deeply creative and spiritually rich cycle. The first week is ideal for artistic projects, healing practices, and service-oriented work. Around the second week, a financial improvement arrives through creative work or a generous and unexpected source. Mid-month brings spiritual depth and the possibility of a meaningful encounter with a teacher, guide, or sacred text that shifts something fundamental. The final days of the month are for deep rest, inner renewal, and trusting the mystery. Jupiter ensures that your compassion and creativity are seen and valued this month.",
      yearly: "This year, Meena natives enter one of their most spiritually and creatively expansive cycles in recent memory. The first quarter is ideal for artistic projects, healing journeys, and compassionate service that aligns deeply with your soul's purpose. Professionally, opportunities in creative, therapeutic, or spiritual fields prove deeply rewarding and surprisingly practical. Financially, what you give freely in service returns to you through channels you did not plan or anticipate. Relationships are enriched by your extraordinary emotional depth and your capacity for unconditional love. Health benefits from water-based practices, contemplative movement, and nourishing your inner life as faithfully as your outer one. By the year's close, you stand at a beautiful threshold — more whole, more open, and more luminously yourself than when you began."
    }
  }
];

export function getRashiById(id: string): Rashi | undefined {
  return RASHIS.find(r => r.id === id);
}

export function getDailyPrediction(rashi: Rashi, date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return rashi.predictions.daily[dayOfYear % rashi.predictions.daily.length];
}

const NAME_LETTER_MAP: Record<string, string> = {
  chu: "mesha", che: "mesha", cho: "mesha", la: "mesha", li: "mesha", lu: "mesha", le: "mesha", lo: "mesha",
  i: "vrishabha", u: "vrishabha", e: "vrishabha", o: "vrishabha", va: "vrishabha", vi: "vrishabha", vu: "vrishabha", ve: "vrishabha", vo: "vrishabha",
  ka: "mithuna", ki: "mithuna", ku: "mithuna", gha: "mithuna", cha: "mithuna", ke: "mithuna",
  hi: "karka", hu: "karka", he: "karka", ho: "karka",
  ma: "simha", mi: "simha", mu: "simha", me: "simha", mo: "simha",
  ta: "simha", ti: "simha", tu: "simha", te: "simha",
  pa: "kanya", pi: "kanya", pu: "kanya", sha: "kanya", na: "kanya", tha: "kanya", pe: "kanya", po: "kanya",
  ra: "tula", ri: "tula", ru: "tula", re: "tula", ro: "tula",
  to: "vrishchika", ni: "vrishchika", nu: "vrishchika", ne: "vrishchika", no: "vrishchika", ya: "vrishchika", yi: "vrishchika", yu: "vrishchika",
  ye: "dhanu", yo: "dhanu", bha: "dhanu", bhi: "dhanu", bhu: "dhanu", dha: "dhanu", fa: "dhanu", bhe: "dhanu",
  bho: "makara", ja: "makara", ji: "makara", khi: "makara", khu: "makara", khe: "makara", kho: "makara", ga: "makara", gi: "makara",
  gu: "kumbha", ge: "kumbha", go: "kumbha", sa: "kumbha", si: "kumbha", su: "kumbha", se: "kumbha", so: "kumbha",
  di: "meena", du: "meena", jha: "meena", de: "meena", do: "meena", chi: "meena",
};

export function getRashiByNameLetter(name: string): Rashi | undefined {
  if (!name) return undefined;
  const lower = name.trim().toLowerCase();
  for (let len = 3; len >= 1; len--) {
    const key = lower.slice(0, len);
    if (NAME_LETTER_MAP[key]) return getRashiById(NAME_LETTER_MAP[key]);
  }
  return undefined;
}

// Approximate sidereal sun sign from birth date (simplified)
export function getRashiByBirthDate(date: Date): Rashi {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const md = month * 100 + day;
  // Sidereal (Vedic) dates, approximately shifted ~23 days from Western
  if (md >= 414 && md <= 514) return RASHIS[0];  // Mesha: Apr 14 – May 14
  if (md >= 515 && md <= 614) return RASHIS[1];  // Vrishabha: May 15 – Jun 14
  if (md >= 615 && md <= 715) return RASHIS[2];  // Mithuna: Jun 15 – Jul 15
  if (md >= 716 && md <= 816) return RASHIS[3];  // Karka: Jul 16 – Aug 16
  if (md >= 817 && md <= 916) return RASHIS[4];  // Simha: Aug 17 – Sep 16
  if (md >= 917 && md <= 1017) return RASHIS[5]; // Kanya: Sep 17 – Oct 17
  if (md >= 1018 && md <= 1115) return RASHIS[6]; // Tula: Oct 18 – Nov 15
  if (md >= 1116 && md <= 1214) return RASHIS[7]; // Vrishchika: Nov 16 – Dec 14
  if (md >= 1215 || md <= 113) return RASHIS[8];  // Dhanu: Dec 15 – Jan 13
  if (md >= 114 && md <= 212) return RASHIS[9];   // Makara: Jan 14 – Feb 12
  if (md >= 213 && md <= 313) return RASHIS[10];  // Kumbha: Feb 13 – Mar 13
  return RASHIS[11]; // Meena: Mar 14 – Apr 13
}

export const PRASHNAVALI_ANSWERS: string[] = [
  "The stars align in your favor. Trust the path unfolding before you.",
  "Patience is the highest virtue now. The fruit will ripen in its own time.",
  "You already know the answer in your heart. Listen to that still, quiet voice.",
  "A new beginning is closer than it appears. Take the first step with courage.",
  "Seek guidance from a wise elder or experienced friend before acting.",
  "The Universe is orchestrating something better than what you have imagined.",
  "Release your attachment to the outcome. Freedom lies in the surrender.",
  "Your intentions are pure and your efforts will be blessed.",
  "This is a time for rest and inner preparation, not outer action.",
  "A significant change is coming. Welcome it with an open and trusting heart.",
  "The obstacle you face is the teacher you need. Learn from it deeply.",
  "Generosity and service to others will open the very door you seek.",
  "A loved one holds a key piece of wisdom — ask them with humility.",
  "Focus your energy. Scattered efforts will not bring the result you desire.",
  "The divine is testing your faith. Continue steadfastly and you will be rewarded.",
  "Something unexpected will arrive soon and shift your entire perspective.",
  "The path through is shorter than you think — one courageous step at a time.",
  "Pray, meditate, and still your mind. Clarity will arise from the silence.",
  "Your ancestors and divine guides are with you. You are never truly alone.",
  "This situation calls for diplomacy and grace. Harsh action will only delay results.",
  "A past effort you had forgotten will bear fruit in surprising and pleasing ways.",
  "The answer lies not in doing more, but in being more still and present.",
  "Trust in divine timing. What is meant for you will not miss you.",
  "A creative solution exists. Let your imagination move freely beyond conventions.",
  "Your health and inner peace must come first. Everything else follows from this.",
  "An honest conversation will break through this impasse more swiftly than you expect.",
  "You have the strength for this. Draw on the courage of your ancestors.",
  "The darkness before you is the doorway to the dawn. Walk through it.",
  "Collaboration is favored now. What you cannot do alone, others will help you complete.",
  "A journey — inner or outer — holds the answer to what you are seeking.",
  "The signs around you are auspicious. Proceed with confidence and gratitude.",
  "Gratitude opens all the closed doors. Count your blessings before taking the next step.",
  "Something you have been holding too tightly must be released. Then it can return transformed.",
  "A dream or vision in the coming nights will carry an important message for you.",
  "This is the right path. The difficulty is not a sign to stop, but to deepen your resolve.",
  "Give freely and receive freely. The cycle of abundance begins with an open hand.",
  "Your spiritual practice is your anchor now. Return to it with renewed devotion.",
  "An apology — given or received — will heal what no other action can.",
  "Look for the hidden blessing in what currently appears as a difficulty.",
  "The answer you seek requires stillness, not more searching. Pause. Breathe. Listen.",
  "A period of transformation is underway. Trust the process even when you cannot see the outcome.",
  "Simple, consistent daily action will achieve what grand gestures never could.",
  "The divine Mother is watching over this situation. You are held and supported.",
  "Forgiveness — of yourself and others — is the key that unlocks this door.",
  "Your heart already knows. Trust what it is quietly telling you.",
  "A meeting or connection in the very near future will shift everything for the better.",
  "Dharma requires courage. Act with integrity and the Universe will stand behind you.",
  "What you are asking for is already on its way. Prepare to receive it gratefully.",
  "Let go of comparison with others. Your path is uniquely and perfectly designed for you.",
  "Worship, prayer, and devotion offered now will multiply your blessings a hundredfold.",
  "The answer is yes — but the timing is not yet. Prepare yourself and wait with faith.",
  "The answer is no — and this refusal is itself a profound gift from the Universe.",
  "Look to nature for guidance. She is whispering the answer you seek.",
  "Service without expectation is your fastest path to the result you desire.",
  "Share your dream or question with a trusted friend. Their perspective will illuminate yours.",
  "A sacred text, mantra, or teaching holds the specific guidance you are searching for.",
  "The Divine is redirecting you toward something even greater. Trust the detour.",
  "Your determination alone will not be enough — surrender is equally needed here.",
  "Auspicious planetary energies support your endeavor at this time.",
  "An old chapter is closing beautifully. A magnificent new one is about to begin.",
  "Feed the hungry, light a lamp, plant a tree. Your answer lies in this simple act.",
  "Your suffering has a purpose. It is forging a strength that will serve you for years.",
  "The Guru within you knows. Find a quiet place and ask that inner teacher.",
  "Begin with what you have, where you are. The path will reveal itself as you walk it.",
  "A fast, a prayer, or a ritual vow made with genuine sincerity will bring swift clarity.",
  "Visit a temple or sacred space. The divine vibration there carries your answer.",
  "This matter is in divine hands. Release it with trust and focus on your duties.",
  "The fruit of your sincere past prayers is ripening now. Receive it with open hands.",
  "A gentle and honest approach will succeed where force and urgency have not.",
  "Something beyond your current understanding is at work here. Have faith.",
  "Your current struggles are burning away what no longer belongs. Something purer is emerging.",
  "The right door will open at the right moment. Focus on being ready when it does.",
  "Chant a mantra that resonates with your heart. The vibration carries your intention forward.",
  "A river does not worry about the rocks in its path. Flow around the obstacle.",
  "Your light is needed in this situation. Step forward and share it without holding back.",
  "Rest, sleep, and restoration are the medicine you most need right now.",
  "A financial improvement is on its way — expect it within one lunar cycle.",
  "The relationship you are wondering about holds great potential if you water it with care.",
  "Your creativity is the key. An artistic or imaginative approach will unlock what logic cannot.",
  "Stand firm in your truth. What is right will be vindicated in its proper time.",
  "The person you are thinking of wishes you well and holds you in their heart.",
  "A spiritual practice of 40 days will transform this situation in ways beyond your expectation.",
  "Offer water to the sun at dawn for seven days. Clarity will dawn with it.",
  "Your prayers are heard. The answer is being prepared for the right moment.",
  "Open your hands, open your heart, and let the Universe surprise and delight you.",
  "What is done with love always bears fruit. Act with love and leave the rest to the divine.",
  "The seemingly impossible is possible — but only when you genuinely believe it is.",
  "A small act of courage today will prevent a much greater difficulty later.",
  "The answer will come to you in an unexpected and perhaps even playful form. Stay alert.",
  "Your question contains its own answer. Re-read what you have asked very carefully.",
  "Be the change you seek. The outer world rearranges itself when your inner world shifts.",
  "This blessing is being withheld only long enough for you to truly value and cherish it.",
  "The divine sees your sincerity and devotion. Continue. You are closer than you know.",
  "A mother's blessing or a grandmother's prayer carries exceptional power in this matter.",
  "Speak less. Observe more. Act only when the moment is unmistakably clear.",
  "Your ancestors are guiding this situation from the unseen realm. Trust them completely.",
  "Both the question and the answer are one. Sit in that silence and know.",
  "Om Namah Shivaya. All shall be well. All shall be well. And all manner of thing shall be well.",
  "Hari Om Tat Sat. The truth of the divine is your protection and your ultimate answer.",
  "Jai Mata Di. The divine Mother's grace is upon you now and always. Proceed in peace.",
];
