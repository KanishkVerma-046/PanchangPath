export interface Location {
  name: string;
  nameHi?: string;
  lat: number;
  lng: number;
  tzOffset: number;  // standard UTC offset in hours (no DST) — for SSR calculations
  tz: string;        // IANA timezone identifier — for client-side DST detection
  elevation: number; // metres above sea level
  country: string;
  state?: string;
}

export const LOCATIONS: Location[] = [
  // ── INDIA ──────────────────────────────────────────────────────────────────
  { name:'New Delhi',       nameHi:'नई दिल्ली',       lat:28.6139,  lng:77.2090,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:216,  country:'India' },
  { name:'Mumbai',          nameHi:'मुंबई',           lat:19.0760,  lng:72.8777,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:14,   country:'India' },
  { name:'Bengaluru',       nameHi:'बेंगलुरू',        lat:12.9716,  lng:77.5946,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:920,  country:'India' },
  { name:'Chennai',         nameHi:'चेन्नई',          lat:13.0827,  lng:80.2707,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:6,    country:'India' },
  { name:'Kolkata',         nameHi:'कोलकाता',         lat:22.5726,  lng:88.3639,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:9,    country:'India' },
  { name:'Hyderabad',       nameHi:'हैदराबाद',        lat:17.3850,  lng:78.4867,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:542,  country:'India' },
  { name:'Ahmedabad',       nameHi:'अहमदाबाद',        lat:23.0225,  lng:72.5714,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:53,   country:'India' },
  { name:'Pune',            nameHi:'पुणे',            lat:18.5204,  lng:73.8567,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:559,  country:'India' },
  { name:'Jaipur',          nameHi:'जयपुर',           lat:26.9124,  lng:75.7873,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:431,  country:'India' },
  { name:'Varanasi',        nameHi:'वाराणसी',         lat:25.3176,  lng:82.9739,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:80,   country:'India' },
  { name:'Lucknow',         nameHi:'लखनऊ',            lat:26.8467,  lng:80.9462,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:123,  country:'India' },
  { name:'Surat',           nameHi:'सूरत',            lat:21.1702,  lng:72.8311,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:13,   country:'India' },
  { name:'Patna',           nameHi:'पटना',            lat:25.5941,  lng:85.1376,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:53,   country:'India' },
  { name:'Bhopal',          nameHi:'भोपाल',           lat:23.2599,  lng:77.4126,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:527,  country:'India' },
  { name:'Indore',          nameHi:'इंदौर',           lat:22.7196,  lng:75.8577,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:553,  country:'India' },
  { name:'Nagpur',          nameHi:'नागपुर',          lat:21.1458,  lng:79.0882,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:310,  country:'India' },
  { name:'Chandigarh',      nameHi:'चंडीगढ़',         lat:30.7333,  lng:76.7794,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:321,  country:'India' },
  { name:'Coimbatore',      nameHi:'कोयम्बटूर',      lat:11.0168,  lng:76.9558,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:411,  country:'India' },
  { name:'Kochi',           nameHi:'कोची',            lat:9.9312,   lng:76.2673,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:0,    country:'India' },
  { name:'Thiruvananthapuram', nameHi:'तिरुवनंतपुरम', lat:8.5241,   lng:76.9366,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:35,   country:'India' },
  { name:'Vijayawada',      nameHi:'विजयवाड़ा',       lat:16.5062,  lng:80.6480,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:20,   country:'India' },
  { name:'Amritsar',        nameHi:'अमृतसर',          lat:31.6340,  lng:74.8723,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:234,  country:'India' },
  { name:'Dehradun',        nameHi:'देहरादून',        lat:30.3165,  lng:78.0322,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:640,  country:'India' },
  { name:'Haridwar',        nameHi:'हरिद्वार',        lat:29.9457,  lng:78.1642,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:314,  country:'India' },
  { name:'Ujjain',          nameHi:'उज्जैन',          lat:23.1765,  lng:75.7885,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:490,  country:'India' },
  { name:'Mathura',         nameHi:'मथुरा',           lat:27.4924,  lng:77.6737,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:174,  country:'India' },
  { name:'Vrindavan',       nameHi:'वृंदावन',         lat:27.5795,  lng:77.6994,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:170,  country:'India' },
  { name:'Prayagraj',       nameHi:'प्रयागराज',       lat:25.4358,  lng:81.8463,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:98,   country:'India' },
  { name:'Ayodhya',         nameHi:'अयोध्या',         lat:26.7922,  lng:82.1998,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:93,   country:'India' },
  { name:'Rishikesh',       nameHi:'ऋषिकेश',          lat:30.0869,  lng:78.2676,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:356,  country:'India' },
  { name:'Tirupati',        nameHi:'तिरुपति',         lat:13.6288,  lng:79.4192,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:152,  country:'India' },
  { name:'Madurai',         nameHi:'मदुरई',           lat:9.9252,   lng:78.1198,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:101,  country:'India' },
  { name:'Agra',            nameHi:'आगरा',            lat:27.1767,  lng:78.0081,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:171,  country:'India' },
  { name:'Ranchi',          nameHi:'रांची',            lat:23.3441,  lng:85.3096,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:651,  country:'India' },
  { name:'Guwahati',        nameHi:'गुवाहाटी',        lat:26.1445,  lng:91.7362,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:55,   country:'India' },
  { name:'Bhubaneswar',     nameHi:'भुवनेश्वर',       lat:20.2961,  lng:85.8245,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:45,   country:'India' },
  { name:'Goa',             nameHi:'गोवा',            lat:15.2993,  lng:74.1240,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:7,    country:'India' },
  { name:'Mysuru',          nameHi:'मैसूरु',           lat:12.2958,  lng:76.6394,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:763,  country:'India' },
  { name:'Srinagar',        nameHi:'श्रीनगर',         lat:34.0837,  lng:74.7973,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:1585, country:'India' },
  { name:'Shimla',          nameHi:'शिमला',           lat:31.1048,  lng:77.1734,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:2206, country:'India' },
  { name:'Nashik',          nameHi:'नासिक',           lat:20.0000,  lng:73.7800,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:565,  country:'India' },
  { name:'Jodhpur',         nameHi:'जोधपुर',          lat:26.2389,  lng:73.0243,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:231,  country:'India' },
  { name:'Udaipur',         nameHi:'उदयपुर',          lat:24.5854,  lng:73.7125,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:598,  country:'India' },
  { name:'Visakhapatnam',   nameHi:'विशाखापट्टनम',    lat:17.6868,  lng:83.2185,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:45,   country:'India' },
  { name:'Ludhiana',        nameHi:'लुधियाना',        lat:30.9010,  lng:75.8573,  tzOffset:5.5, tz:'Asia/Kolkata',        elevation:244,  country:'India' },

  // ── PAKISTAN / NEPAL / SRI LANKA / BANGLADESH ───────────────────────────
  { name:'Karachi',         lat:24.8607,  lng:67.0011,  tzOffset:5,   tz:'Asia/Karachi',          elevation:8,    country:'Pakistan' },
  { name:'Lahore',          lat:31.5204,  lng:74.3587,  tzOffset:5,   tz:'Asia/Karachi',          elevation:217,  country:'Pakistan' },
  { name:'Kathmandu',       nameHi:'काठमांडू',         lat:27.7172,  lng:85.3240,  tzOffset:5.75, tz:'Asia/Kathmandu',      elevation:1400, country:'Nepal' },
  { name:'Colombo',         lat:6.9271,   lng:79.8612,  tzOffset:5.5, tz:'Asia/Colombo',          elevation:7,    country:'Sri Lanka' },
  { name:'Dhaka',           lat:23.8103,  lng:90.4125,  tzOffset:6,   tz:'Asia/Dhaka',            elevation:8,    country:'Bangladesh' },

  // ── MIDDLE EAST ──────────────────────────────────────────────────────────
  { name:'Dubai',           nameHi:'दुबई',            lat:25.2048,  lng:55.2708,  tzOffset:4,   tz:'Asia/Dubai',            elevation:5,    country:'UAE' },
  { name:'Abu Dhabi',       lat:24.4539,  lng:54.3773,  tzOffset:4,   tz:'Asia/Dubai',            elevation:27,   country:'UAE' },
  { name:'Sharjah',         lat:25.3463,  lng:55.4209,  tzOffset:4,   tz:'Asia/Dubai',            elevation:9,    country:'UAE' },
  { name:'Riyadh',          lat:24.7136,  lng:46.6753,  tzOffset:3,   tz:'Asia/Riyadh',           elevation:612,  country:'Saudi Arabia' },
  { name:'Jeddah',          lat:21.2854,  lng:39.2376,  tzOffset:3,   tz:'Asia/Riyadh',           elevation:12,   country:'Saudi Arabia' },
  { name:'Mecca',           nameHi:'मक्का',           lat:21.3891,  lng:39.8579,  tzOffset:3,   tz:'Asia/Riyadh',           elevation:277,  country:'Saudi Arabia' },
  { name:'Medina',          lat:24.5247,  lng:39.5692,  tzOffset:3,   tz:'Asia/Riyadh',           elevation:597,  country:'Saudi Arabia' },
  { name:'Kuwait City',     lat:29.3759,  lng:47.9774,  tzOffset:3,   tz:'Asia/Kuwait',           elevation:55,   country:'Kuwait' },
  { name:'Doha',            lat:25.2854,  lng:51.5310,  tzOffset:3,   tz:'Asia/Qatar',            elevation:10,   country:'Qatar' },
  { name:'Manama',          lat:26.2235,  lng:50.5876,  tzOffset:3,   tz:'Asia/Bahrain',          elevation:2,    country:'Bahrain' },
  { name:'Muscat',          lat:23.5880,  lng:58.3829,  tzOffset:4,   tz:'Asia/Muscat',           elevation:8,    country:'Oman' },
  { name:'Tehran',          lat:35.6892,  lng:51.3890,  tzOffset:3.5, tz:'Asia/Tehran',           elevation:1191, country:'Iran' },

  // ── SOUTH EAST ASIA ──────────────────────────────────────────────────────
  { name:'Singapore',       nameHi:'सिंगापुर',        lat:1.3521,   lng:103.8198, tzOffset:8,   tz:'Asia/Singapore',        elevation:15,   country:'Singapore' },
  { name:'Kuala Lumpur',    nameHi:'कुआलालंपुर',      lat:3.1390,   lng:101.6869, tzOffset:8,   tz:'Asia/Kuala_Lumpur',     elevation:70,   country:'Malaysia' },
  { name:'Bangkok',         lat:13.7563,  lng:100.5018, tzOffset:7,   tz:'Asia/Bangkok',          elevation:1,    country:'Thailand' },
  { name:'Jakarta',         lat:-6.2088,  lng:106.8456, tzOffset:7,   tz:'Asia/Jakarta',          elevation:8,    country:'Indonesia' },
  { name:'Manila',          lat:14.5995,  lng:120.9842, tzOffset:8,   tz:'Asia/Manila',           elevation:16,   country:'Philippines' },
  { name:'Ho Chi Minh City', lat:10.8231, lng:106.6297, tzOffset:7,   tz:'Asia/Ho_Chi_Minh',      elevation:19,   country:'Vietnam' },

  // ── EAST ASIA ────────────────────────────────────────────────────────────
  { name:'Tokyo',           lat:35.6762,  lng:139.6503, tzOffset:9,   tz:'Asia/Tokyo',            elevation:40,   country:'Japan' },
  { name:'Osaka',           lat:34.6937,  lng:135.5023, tzOffset:9,   tz:'Asia/Tokyo',            elevation:5,    country:'Japan' },
  { name:'Seoul',           lat:37.5665,  lng:126.9780, tzOffset:9,   tz:'Asia/Seoul',            elevation:38,   country:'South Korea' },
  { name:'Beijing',         lat:39.9042,  lng:116.4074, tzOffset:8,   tz:'Asia/Shanghai',         elevation:43,   country:'China' },
  { name:'Shanghai',        lat:31.2304,  lng:121.4737, tzOffset:8,   tz:'Asia/Shanghai',         elevation:4,    country:'China' },
  { name:'Hong Kong',       lat:22.3193,  lng:114.1694, tzOffset:8,   tz:'Asia/Hong_Kong',        elevation:8,    country:'China (HK)' },
  { name:'Taipei',          lat:25.0330,  lng:121.5654, tzOffset:8,   tz:'Asia/Taipei',           elevation:5,    country:'Taiwan' },

  // ── CENTRAL / WEST ASIA ──────────────────────────────────────────────────
  { name:'Tashkent',        lat:41.2995,  lng:69.2401,  tzOffset:5,   tz:'Asia/Tashkent',         elevation:440,  country:'Uzbekistan' },
  { name:'Almaty',          lat:43.2220,  lng:76.8512,  tzOffset:6,   tz:'Asia/Almaty',           elevation:773,  country:'Kazakhstan' },
  { name:'Kabul',           lat:34.5553,  lng:69.2075,  tzOffset:4.5, tz:'Asia/Kabul',            elevation:1790, country:'Afghanistan' },
  { name:'Islamabad',       lat:33.7294,  lng:73.0931,  tzOffset:5,   tz:'Asia/Karachi',          elevation:540,  country:'Pakistan' },

  // ── EUROPE ───────────────────────────────────────────────────────────────
  { name:'London',          nameHi:'लंदन',            lat:51.5074,  lng:-0.1278,  tzOffset:0,   tz:'Europe/London',         elevation:11,   country:'UK' },
  { name:'Birmingham',      lat:52.4862,  lng:-1.8904,  tzOffset:0,   tz:'Europe/London',         elevation:140,  country:'UK' },
  { name:'Leicester',       lat:52.6369,  lng:-1.1398,  tzOffset:0,   tz:'Europe/London',         elevation:65,   country:'UK' },
  { name:'Manchester',      lat:53.4808,  lng:-2.2426,  tzOffset:0,   tz:'Europe/London',         elevation:75,   country:'UK' },
  { name:'Glasgow',         lat:55.8642,  lng:-4.2518,  tzOffset:0,   tz:'Europe/London',         elevation:8,    country:'UK' },
  { name:'Paris',           lat:48.8566,  lng:2.3522,   tzOffset:1,   tz:'Europe/Paris',          elevation:35,   country:'France' },
  { name:'Berlin',          lat:52.5200,  lng:13.4050,  tzOffset:1,   tz:'Europe/Berlin',         elevation:34,   country:'Germany' },
  { name:'Frankfurt',       lat:50.1109,  lng:8.6821,   tzOffset:1,   tz:'Europe/Berlin',         elevation:112,  country:'Germany' },
  { name:'Amsterdam',       lat:52.3676,  lng:4.9041,   tzOffset:1,   tz:'Europe/Amsterdam',      elevation:-2,   country:'Netherlands' },
  { name:'Madrid',          lat:40.4168,  lng:-3.7038,  tzOffset:1,   tz:'Europe/Madrid',         elevation:667,  country:'Spain' },
  { name:'Rome',            lat:41.9028,  lng:12.4964,  tzOffset:1,   tz:'Europe/Rome',           elevation:21,   country:'Italy' },
  { name:'Zurich',          lat:47.3769,  lng:8.5417,   tzOffset:1,   tz:'Europe/Zurich',         elevation:408,  country:'Switzerland' },
  { name:'Vienna',          lat:48.2082,  lng:16.3738,  tzOffset:1,   tz:'Europe/Vienna',         elevation:171,  country:'Austria' },
  { name:'Stockholm',       lat:59.3293,  lng:18.0686,  tzOffset:1,   tz:'Europe/Stockholm',      elevation:28,   country:'Sweden' },
  { name:'Oslo',            lat:59.9139,  lng:10.7522,  tzOffset:1,   tz:'Europe/Oslo',           elevation:23,   country:'Norway' },
  { name:'Copenhagen',      lat:55.6761,  lng:12.5683,  tzOffset:1,   tz:'Europe/Copenhagen',     elevation:14,   country:'Denmark' },
  { name:'Brussels',        lat:50.8503,  lng:4.3517,   tzOffset:1,   tz:'Europe/Brussels',       elevation:56,   country:'Belgium' },
  { name:'Dublin',          lat:53.3498,  lng:-6.2603,  tzOffset:0,   tz:'Europe/Dublin',         elevation:9,    country:'Ireland' },
  { name:'Lisbon',          lat:38.7169,  lng:-9.1395,  tzOffset:0,   tz:'Europe/Lisbon',         elevation:18,   country:'Portugal' },
  { name:'Athens',          lat:37.9838,  lng:23.7275,  tzOffset:2,   tz:'Europe/Athens',         elevation:70,   country:'Greece' },
  { name:'Warsaw',          lat:52.2297,  lng:21.0122,  tzOffset:1,   tz:'Europe/Warsaw',         elevation:113,  country:'Poland' },
  { name:'Prague',          lat:50.0755,  lng:14.4378,  tzOffset:1,   tz:'Europe/Prague',         elevation:202,  country:'Czechia' },
  { name:'Budapest',        lat:47.4979,  lng:19.0402,  tzOffset:1,   tz:'Europe/Budapest',       elevation:102,  country:'Hungary' },
  { name:'Moscow',          lat:55.7558,  lng:37.6173,  tzOffset:3,   tz:'Europe/Moscow',         elevation:156,  country:'Russia' },
  { name:'St. Petersburg',  lat:59.9311,  lng:30.3609,  tzOffset:3,   tz:'Europe/Moscow',         elevation:5,    country:'Russia' },

  // ── AFRICA ───────────────────────────────────────────────────────────────
  { name:'Cairo',           lat:30.0444,  lng:31.2357,  tzOffset:2,   tz:'Africa/Cairo',          elevation:74,   country:'Egypt' },
  { name:'Lagos',           lat:6.5244,   lng:3.3792,   tzOffset:1,   tz:'Africa/Lagos',          elevation:41,   country:'Nigeria' },
  { name:'Nairobi',         lat:-1.2921,  lng:36.8219,  tzOffset:3,   tz:'Africa/Nairobi',        elevation:1795, country:'Kenya' },
  { name:'Johannesburg',    lat:-26.2041, lng:28.0473,  tzOffset:2,   tz:'Africa/Johannesburg',   elevation:1753, country:'South Africa' },
  { name:'Cape Town',       lat:-33.9249, lng:18.4241,  tzOffset:2,   tz:'Africa/Johannesburg',   elevation:42,   country:'South Africa' },
  { name:'Addis Ababa',     lat:9.0320,   lng:38.7469,  tzOffset:3,   tz:'Africa/Addis_Ababa',    elevation:2355, country:'Ethiopia' },
  { name:'Dar es Salaam',   lat:-6.7924,  lng:39.2083,  tzOffset:3,   tz:'Africa/Dar_es_Salaam',  elevation:55,   country:'Tanzania' },
  { name:'Kampala',         lat:0.3476,   lng:32.5825,  tzOffset:3,   tz:'Africa/Kampala',        elevation:1190, country:'Uganda' },

  // ── NORTH AMERICA — USA ───────────────────────────────────────────────────
  { name:'New York',        nameHi:'न्यूयॉर्क',        lat:40.7128,  lng:-74.0060, tzOffset:-5,  tz:'America/New_York',      elevation:10,   country:'USA',    state:'NY' },
  { name:'Edison',          lat:40.5187,  lng:-74.4121, tzOffset:-5,  tz:'America/New_York',      elevation:15,   country:'USA',    state:'NJ' },
  { name:'Jersey City',     lat:40.7178,  lng:-74.0431, tzOffset:-5,  tz:'America/New_York',      elevation:11,   country:'USA',    state:'NJ' },
  { name:'Philadelphia',    lat:39.9526,  lng:-75.1652, tzOffset:-5,  tz:'America/New_York',      elevation:12,   country:'USA',    state:'PA' },
  { name:'Washington DC',   lat:38.9072,  lng:-77.0369, tzOffset:-5,  tz:'America/New_York',      elevation:7,    country:'USA',    state:'DC' },
  { name:'Boston',          lat:42.3601,  lng:-71.0589, tzOffset:-5,  tz:'America/New_York',      elevation:9,    country:'USA',    state:'MA' },
  { name:'Atlanta',         lat:33.7490,  lng:-84.3880, tzOffset:-5,  tz:'America/New_York',      elevation:320,  country:'USA',    state:'GA' },
  { name:'Miami',           lat:25.7617,  lng:-80.1918, tzOffset:-5,  tz:'America/New_York',      elevation:2,    country:'USA',    state:'FL' },
  { name:'Orlando',         lat:28.5383,  lng:-81.3792, tzOffset:-5,  tz:'America/New_York',      elevation:67,   country:'USA',    state:'FL' },
  { name:'Chicago',         lat:41.8781,  lng:-87.6298, tzOffset:-6,  tz:'America/Chicago',       elevation:181,  country:'USA',    state:'IL' },
  { name:'Houston',         lat:29.7604,  lng:-95.3698, tzOffset:-6,  tz:'America/Chicago',       elevation:15,   country:'USA',    state:'TX' },
  { name:'Dallas',          lat:32.7767,  lng:-96.7970, tzOffset:-6,  tz:'America/Chicago',       elevation:139,  country:'USA',    state:'TX' },
  { name:'Austin',          lat:30.2672,  lng:-97.7431, tzOffset:-6,  tz:'America/Chicago',       elevation:150,  country:'USA',    state:'TX' },
  { name:'Minneapolis',     lat:44.9778,  lng:-93.2650, tzOffset:-6,  tz:'America/Chicago',       elevation:264,  country:'USA',    state:'MN' },
  { name:'Denver',          lat:39.7392,  lng:-104.9903,tzOffset:-7,  tz:'America/Denver',        elevation:1609, country:'USA',    state:'CO' },
  { name:'Phoenix',         lat:33.4484,  lng:-112.0740,tzOffset:-7,  tz:'America/Phoenix',       elevation:331,  country:'USA',    state:'AZ' },
  { name:'Los Angeles',     lat:34.0522,  lng:-118.2437,tzOffset:-8,  tz:'America/Los_Angeles',   elevation:93,   country:'USA',    state:'CA' },
  { name:'San Francisco',   lat:37.7749,  lng:-122.4194,tzOffset:-8,  tz:'America/Los_Angeles',   elevation:16,   country:'USA',    state:'CA' },
  { name:'San Jose',        lat:37.3382,  lng:-121.8863,tzOffset:-8,  tz:'America/Los_Angeles',   elevation:27,   country:'USA',    state:'CA' },
  { name:'Seattle',         lat:47.6062,  lng:-122.3321,tzOffset:-8,  tz:'America/Los_Angeles',   elevation:55,   country:'USA',    state:'WA' },
  { name:'Las Vegas',       lat:36.1699,  lng:-115.1398,tzOffset:-8,  tz:'America/Los_Angeles',   elevation:610,  country:'USA',    state:'NV' },
  { name:'Detroit',         lat:42.3314,  lng:-83.0458, tzOffset:-5,  tz:'America/Detroit',       elevation:183,  country:'USA',    state:'MI' },
  { name:'Columbus',        lat:39.9612,  lng:-82.9988, tzOffset:-5,  tz:'America/New_York',      elevation:260,  country:'USA',    state:'OH' },
  { name:'Charlotte',       lat:35.2271,  lng:-80.8431, tzOffset:-5,  tz:'America/New_York',      elevation:229,  country:'USA',    state:'NC' },

  // ── CANADA ────────────────────────────────────────────────────────────────
  { name:'Toronto',         nameHi:'टोरंटो',           lat:43.6532,  lng:-79.3832, tzOffset:-5,  tz:'America/Toronto',       elevation:76,   country:'Canada', state:'ON' },
  { name:'Vancouver',       lat:49.2827,  lng:-123.1207,tzOffset:-8,  tz:'America/Vancouver',     elevation:70,   country:'Canada', state:'BC' },
  { name:'Calgary',         lat:51.0447,  lng:-114.0719,tzOffset:-7,  tz:'America/Edmonton',      elevation:1045, country:'Canada', state:'AB' },
  { name:'Edmonton',        lat:53.5461,  lng:-113.4938,tzOffset:-7,  tz:'America/Edmonton',      elevation:668,  country:'Canada', state:'AB' },
  { name:'Montreal',        lat:45.5017,  lng:-73.5673, tzOffset:-5,  tz:'America/Toronto',       elevation:76,   country:'Canada', state:'QC' },
  { name:'Ottawa',          lat:45.4215,  lng:-75.6972, tzOffset:-5,  tz:'America/Toronto',       elevation:70,   country:'Canada', state:'ON' },
  { name:'Mississauga',     lat:43.5890,  lng:-79.6441, tzOffset:-5,  tz:'America/Toronto',       elevation:156,  country:'Canada', state:'ON' },
  { name:'Brampton',        lat:43.6833,  lng:-79.7667, tzOffset:-5,  tz:'America/Toronto',       elevation:198,  country:'Canada', state:'ON' },

  // ── LATIN AMERICA ─────────────────────────────────────────────────────────
  { name:'Mexico City',     lat:19.4326,  lng:-99.1332, tzOffset:-6,  tz:'America/Mexico_City',   elevation:2240, country:'Mexico' },
  { name:'Sao Paulo',       lat:-23.5505, lng:-46.6333, tzOffset:-3,  tz:'America/Sao_Paulo',     elevation:760,  country:'Brazil' },
  { name:'Rio de Janeiro',  lat:-22.9068, lng:-43.1729, tzOffset:-3,  tz:'America/Sao_Paulo',     elevation:10,   country:'Brazil' },
  { name:'Buenos Aires',    lat:-34.6037, lng:-58.3816, tzOffset:-3,  tz:'America/Argentina/Buenos_Aires', elevation:25, country:'Argentina' },
  { name:'Bogota',          lat:4.7110,   lng:-74.0721, tzOffset:-5,  tz:'America/Bogota',        elevation:2625, country:'Colombia' },
  { name:'Lima',            lat:-12.0464, lng:-77.0428, tzOffset:-5,  tz:'America/Lima',          elevation:154,  country:'Peru' },
  { name:'Santiago',        lat:-33.4489, lng:-70.6693, tzOffset:-4,  tz:'America/Santiago',      elevation:567,  country:'Chile' },
  { name:'Caracas',         lat:10.4806,  lng:-66.9036, tzOffset:-4,  tz:'America/Caracas',       elevation:900,  country:'Venezuela' },
  { name:'Suriname',        lat:5.8520,   lng:-55.2038, tzOffset:-3,  tz:'America/Paramaribo',    elevation:1,    country:'Suriname' },
  { name:'Trinidad',        lat:10.6918,  lng:-61.2225, tzOffset:-4,  tz:'America/Port_of_Spain', elevation:14,   country:'Trinidad' },

  // ── AUSTRALIA / NZ ────────────────────────────────────────────────────────
  { name:'Sydney',          nameHi:'सिडनी',            lat:-33.8688, lng:151.2093, tzOffset:10,  tz:'Australia/Sydney',      elevation:39,   country:'Australia' },
  { name:'Melbourne',       lat:-37.8136, lng:144.9631, tzOffset:10,  tz:'Australia/Melbourne',   elevation:31,   country:'Australia' },
  { name:'Brisbane',        lat:-27.4698, lng:153.0251, tzOffset:10,  tz:'Australia/Brisbane',    elevation:27,   country:'Australia' },
  { name:'Perth',           lat:-31.9505, lng:115.8605, tzOffset:8,   tz:'Australia/Perth',       elevation:36,   country:'Australia' },
  { name:'Adelaide',        lat:-34.9285, lng:138.6007, tzOffset:9.5, tz:'Australia/Adelaide',    elevation:50,   country:'Australia' },
  { name:'Auckland',        lat:-36.8509, lng:174.7645, tzOffset:12,  tz:'Pacific/Auckland',      elevation:25,   country:'New Zealand' },
  { name:'Wellington',      lat:-41.2866, lng:174.7756, tzOffset:12,  tz:'Pacific/Auckland',      elevation:126,  country:'New Zealand' },
];

export function getDefaultLocation(): Location {
  return LOCATIONS[0]; // New Delhi
}

export function findLocation(name: string): Location | undefined {
  return LOCATIONS.find(l => l.name.toLowerCase() === name.toLowerCase());
}

export function searchLocations(query: string, limit = 10): Location[] {
  const q = query.toLowerCase().trim();
  if (!q) return LOCATIONS.slice(0, limit);
  return LOCATIONS
    .filter(l =>
      l.name.toLowerCase().includes(q) ||
      (l.nameHi ?? '').includes(q) ||
      l.country.toLowerCase().includes(q) ||
      (l.state ?? '').toLowerCase().includes(q)
    )
    .slice(0, limit);
}
