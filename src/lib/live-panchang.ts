// The live, current-instant Tithi and Nakshatra shown by the header status strip
// (Header.astro) and the homepage hero's "Right now" card (index.astro). Both read
// this one module, so they can't disagree. Unlike calculatePanchang(), which samples
// a fixed ~6 AM local time, these are the values at the real moment the page is viewed.
import { julianDay, sunTrueLongitude, moonLongitude, lahiriAyanamsha, findAngleCrossing, TITHIS, NAKSHATRAS } from './panchang';

export interface LiveTithiNakshatra {
  tithiIdx: number; // 0–29
  nakIdx: number;   // 0–26
  tithi: string;    // e.g. "Krishna Saptami"
  tithiHi: string;  // e.g. "कृष्ण सप्तमी"
  nakshatra: string;   // e.g. "Rohini Nakshatra"
  nakshatraHi: string; // e.g. "रोहिणी नक्षत्र"
}

function norm360(a: number) { return ((a % 360) + 360) % 360; }

// Tithi/Nakshatra are instant-based (Sun/Moon ecliptic longitude at this real moment), so
// no location offset belongs in this calculation at all. An earlier header formula
// (`now.getHours() - loc.tzOffset`) silently assumed the visitor's browser clock was already
// in the *selected location's* timezone, which is never true — Date getters always reflect
// the visitor's own device. Confirmed live: the same instant produced a full Tithi apart
// between an Asia/Kolkata and an America/Los_Angeles browser. Julian Day is UTC-referenced by
// definition (same convention as astro-core.ts/panchang.ts), so it's read straight from the
// instant's own UTC getters — timezone-independent by construction.
function instantJd(now: Date): number {
  return julianDay(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600);
}

const elongationFn = (jd: number) => norm360(moonLongitude(jd) - sunTrueLongitude(jd));
const moonSiderealFn = (jd: number) => norm360(moonLongitude(jd) - lahiriAyanamsha(jd));

/** EN/HI display labels for a Tithi index (0–29) and Nakshatra index (0–26). */
export function tithiNakshatraLabels(tithiIdx: number, nakIdx: number): LiveTithiNakshatra {
  const shukla = tithiIdx < 15;
  return {
    tithiIdx,
    nakIdx,
    tithi: `${shukla ? 'Shukla' : 'Krishna'} ${TITHIS[tithiIdx].name}`,
    tithiHi: `${shukla ? 'शुक्ल' : 'कृष्ण'} ${TITHIS[tithiIdx].nameHi}`,
    nakshatra: `${NAKSHATRAS[nakIdx].name} Nakshatra`,
    nakshatraHi: `${NAKSHATRAS[nakIdx].nameHi} नक्षत्र`,
  };
}

export function liveTithiNakshatra(now: Date = new Date()): LiveTithiNakshatra {
  const jd = instantJd(now);
  const tithiIdx = Math.floor(elongationFn(jd) / 12) % 30;
  const nakIdx = Math.floor(moonSiderealFn(jd) / (360 / 27)) % 27;
  return tithiNakshatraLabels(tithiIdx, nakIdx);
}

/** The next instant after `now` at which either the Tithi or the Nakshatra changes. */
export function nextLiveChange(now: Date = new Date()): Date {
  const jd = instantJd(now);
  const tithiEnd = findAngleCrossing(jd, (Math.floor(elongationFn(jd) / 12) + 1) * 12 % 360, elongationFn);
  const nakEnd = findAngleCrossing(jd, (Math.floor(moonSiderealFn(jd) / (360 / 27)) + 1) * (360 / 27) % 360, moonSiderealFn);
  return new Date((Math.min(tithiEnd, nakEnd) - 2440587.5) * 86400000);
}

// Re-renders at most a minute apart regardless, so a sleeping laptop or a changed system
// clock can't leave a stale value up for long.
const MAX_REFRESH_MS = 60_000;
// findAngleCrossing converges to ~1 s; landing just past the boundary means the re-render
// reads the new value rather than the old one.
const BOUNDARY_PAD_MS = 2_000;

/**
 * Calls render() now, again the moment the Tithi or Nakshatra changes (and at least once a
 * minute), on return from the back/forward cache, and whenever the tab becomes visible.
 */
export function watchLiveTithiNakshatra(render: (live: LiveTithiNakshatra) => void): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const tick = () => {
    const now = new Date();
    render(liveTithiNakshatra(now));
    const untilChange = nextLiveChange(now).getTime() - now.getTime() + BOUNDARY_PAD_MS;
    clearTimeout(timer);
    timer = setTimeout(tick, Math.max(1_000, Math.min(untilChange, MAX_REFRESH_MS)));
  };
  tick();
  window.addEventListener('pageshow', (e: PageTransitionEvent) => {
    if (e.persisted) tick();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tick();
  });
}
