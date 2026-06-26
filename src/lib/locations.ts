export interface Location {
  name: string;
  nameHi: string;
  lat: number;
  lng: number;
  tzOffset: number; // hours from UTC
  country: string;
}

export const LOCATIONS: Location[] = [
  // India
  { name: 'New Delhi', nameHi: 'नई दिल्ली', lat: 28.6139, lng: 77.2090, tzOffset: 5.5, country: 'India' },
  { name: 'Mumbai', nameHi: 'मुंबई', lat: 19.0760, lng: 72.8777, tzOffset: 5.5, country: 'India' },
  { name: 'Bengaluru', nameHi: 'बेंगलुरू', lat: 12.9716, lng: 77.5946, tzOffset: 5.5, country: 'India' },
  { name: 'Chennai', nameHi: 'चेन्नई', lat: 13.0827, lng: 80.2707, tzOffset: 5.5, country: 'India' },
  { name: 'Kolkata', nameHi: 'कोलकाता', lat: 22.5726, lng: 88.3639, tzOffset: 5.5, country: 'India' },
  { name: 'Hyderabad', nameHi: 'हैदराबाद', lat: 17.3850, lng: 78.4867, tzOffset: 5.5, country: 'India' },
  { name: 'Ahmedabad', nameHi: 'अहमदाबाद', lat: 23.0225, lng: 72.5714, tzOffset: 5.5, country: 'India' },
  { name: 'Pune', nameHi: 'पुणे', lat: 18.5204, lng: 73.8567, tzOffset: 5.5, country: 'India' },
  { name: 'Jaipur', nameHi: 'जयपुर', lat: 26.9124, lng: 75.7873, tzOffset: 5.5, country: 'India' },
  { name: 'Varanasi', nameHi: 'वाराणसी', lat: 25.3176, lng: 82.9739, tzOffset: 5.5, country: 'India' },
  { name: 'Lucknow', nameHi: 'लखनऊ', lat: 26.8467, lng: 80.9462, tzOffset: 5.5, country: 'India' },
  { name: 'Surat', nameHi: 'सूरत', lat: 21.1702, lng: 72.8311, tzOffset: 5.5, country: 'India' },
  { name: 'Patna', nameHi: 'पटना', lat: 25.5941, lng: 85.1376, tzOffset: 5.5, country: 'India' },
  { name: 'Bhopal', nameHi: 'भोपाल', lat: 23.2599, lng: 77.4126, tzOffset: 5.5, country: 'India' },
  { name: 'Indore', nameHi: 'इंदौर', lat: 22.7196, lng: 75.8577, tzOffset: 5.5, country: 'India' },
  { name: 'Nagpur', nameHi: 'नागपुर', lat: 21.1458, lng: 79.0882, tzOffset: 5.5, country: 'India' },
  { name: 'Chandigarh', nameHi: 'चंडीगढ़', lat: 30.7333, lng: 76.7794, tzOffset: 5.5, country: 'India' },
  { name: 'Coimbatore', nameHi: 'कोयम्बटूर', lat: 11.0168, lng: 76.9558, tzOffset: 5.5, country: 'India' },
  { name: 'Kochi', nameHi: 'कोची', lat: 9.9312, lng: 76.2673, tzOffset: 5.5, country: 'India' },
  { name: 'Thiruvananthapuram', nameHi: 'तिरुवनंतपुरम', lat: 8.5241, lng: 76.9366, tzOffset: 5.5, country: 'India' },
  { name: 'Vijayawada', nameHi: 'विजयवाड़ा', lat: 16.5062, lng: 80.6480, tzOffset: 5.5, country: 'India' },
  { name: 'Amritsar', nameHi: 'अमृतसर', lat: 31.6340, lng: 74.8723, tzOffset: 5.5, country: 'India' },
  { name: 'Dehradun', nameHi: 'देहरादून', lat: 30.3165, lng: 78.0322, tzOffset: 5.5, country: 'India' },
  { name: 'Haridwar', nameHi: 'हरिद्वार', lat: 29.9457, lng: 78.1642, tzOffset: 5.5, country: 'India' },
  { name: 'Ujjain', nameHi: 'उज्जैन', lat: 23.1765, lng: 75.7885, tzOffset: 5.5, country: 'India' },
  { name: 'Mathura', nameHi: 'मथुरा', lat: 27.4924, lng: 77.6737, tzOffset: 5.5, country: 'India' },
  { name: 'Vrindavan', nameHi: 'वृंदावन', lat: 27.5795, lng: 77.6994, tzOffset: 5.5, country: 'India' },
  { name: 'Prayagraj', nameHi: 'प्रयागराज', lat: 25.4358, lng: 81.8463, tzOffset: 5.5, country: 'India' },
  { name: 'Ayodhya', nameHi: 'अयोध्या', lat: 26.7922, lng: 82.1998, tzOffset: 5.5, country: 'India' },
  // International
  { name: 'Dubai', nameHi: 'दुबई', lat: 25.2048, lng: 55.2708, tzOffset: 4, country: 'UAE' },
  { name: 'Singapore', nameHi: 'सिंगापुर', lat: 1.3521, lng: 103.8198, tzOffset: 8, country: 'Singapore' },
  { name: 'London', nameHi: 'लंदन', lat: 51.5074, lng: -0.1278, tzOffset: 1, country: 'UK' },
  { name: 'New York', nameHi: 'न्यूयॉर्क', lat: 40.7128, lng: -74.0060, tzOffset: -4, country: 'USA' },
  { name: 'Toronto', nameHi: 'टोरंटो', lat: 43.6532, lng: -79.3832, tzOffset: -4, country: 'Canada' },
  { name: 'Sydney', nameHi: 'सिडनी', lat: -33.8688, lng: 151.2093, tzOffset: 10, country: 'Australia' },
  { name: 'Kuala Lumpur', nameHi: 'कुआलालंपुर', lat: 3.1390, lng: 101.6869, tzOffset: 8, country: 'Malaysia' },
];

export function getDefaultLocation(): Location {
  return LOCATIONS[0]; // New Delhi
}

export function findLocation(name: string): Location | undefined {
  return LOCATIONS.find(l => l.name.toLowerCase() === name.toLowerCase());
}
