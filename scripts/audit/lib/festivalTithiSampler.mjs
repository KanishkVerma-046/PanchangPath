// Samples the site's own Tithi engine (src/lib/panchang.ts) for a festival date at New Delhi.
// Needs the extensionless-.ts resolver registered (scripts/lib/ts-extension-resolve.mjs) and
// `node --experimental-strip-types`, as the test suite and run-festival-tithi-check.mjs do.
import { calculatePanchang, julianDay, moonLongitude, sunTrueLongitude } from '../../../src/lib/panchang.ts';
import { parseMinutes12h } from '../../../src/lib/time-format.ts';

const NEW_DELHI = { lat: 28.6139, lng: 77.209, tz: 5.5 };

/** Tithi number 1–30 (1–15 Shukla, 16–29 Krishna Pratipada–Chaturdashi, 30 Amavasya) at an instant. */
function tithiAtInstant(ms) {
  const d = new Date(ms);
  const jd = julianDay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600);
  const elong = (((moonLongitude(jd) - sunTrueLongitude(jd)) % 360) + 360) % 360;
  return (Math.floor(elong / 12) % 30) + 1;
}

/**
 * For a 'YYYY-MM-DD' (New Delhi civil date): the engine's own value (calculatePanchang, which
 * samples a fixed 6 AM local) plus the Tithi at true sunrise, sunset and the following local
 * midnight, for triaging mismatches.
 */
export function sampleFestivalTithi(dateISO) {
  const p = calculatePanchang(new Date(`${dateISO}T12:00:00+05:30`), NEW_DELHI.lat, NEW_DELHI.lng, NEW_DELHI.tz);
  const midnightIstMs = Date.parse(`${dateISO}T00:00:00+05:30`);
  const atLocalMinutes = (mins) => tithiAtInstant(midnightIstMs + mins * 60_000);
  return {
    engine: p.tithi.number,
    sunrise: atLocalMinutes(parseMinutes12h(p.sunrise)),
    sunset: atLocalMinutes(parseMinutes12h(p.sunset)),
    midnight: atLocalMinutes(24 * 60),
    sunriseTime: p.sunrise,
    sunsetTime: p.sunset,
  };
}
