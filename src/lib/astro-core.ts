// Shared astronomy engine — the one place every astronomy-engine call lives, plus the small
// geometry/utility functions that sit directly on top of it (ayanamsha, rise/set, Lagna).
// See docs/superpowers/plans/2026-07-21-full-site-astronomy-engine-scope.md §4 for the design.
import { SunPosition, EclipticGeoMoon, GeoVector, Ecliptic, Body, Observer, SearchRiseSet } from 'astronomy-engine';

function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }
function norm360(a: number) { return ((a % 360) + 360) % 360; }

// astronomy-engine reads a bare number as UT days since the J2000 epoch, i.e. jd - 2451545.0 —
// pass a raw Julian Day here and the result is off by ~6700 years with no type error.
export function sunLongitude(jd: number): number {
  return norm360(SunPosition(jd - 2451545.0).elon);
}

export function moonLongitude(jd: number): number {
  return norm360(EclipticGeoMoon(jd - 2451545.0).lon);
}

export type OuterPlanet = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

const PLANET_BODY: Record<OuterPlanet, Body> = {
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
};

// Geocentric apparent ecliptic longitude (aberration-corrected), same convention as
// sunLongitude()/moonLongitude() above — replaces kundali.ts's Keplerian-ORB + Kepler-solver
// scheme for these 5 bodies. Sun/Moon keep their own dedicated astronomy-engine functions above.
export function planetLongitude(body: OuterPlanet, jd: number): number {
  const vec = GeoVector(PLANET_BODY[body], jd - 2451545.0, true);
  return norm360(Ecliptic(vec).elon);
}

// Rahu/Ketu (lunar nodes) aren't physical bodies astronomy-engine tracks directly — this is the
// same mean-node polynomial kundali.ts already used, kept as-is (see migration scope doc §4).
export function rahuLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
}

export function ketuLongitude(jd: number): number {
  return norm360(rahuLongitude(jd) + 180);
}

// Lahiri ayanamsha (degrees) — moved verbatim from panchang.ts, no logic change.
export function lahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.85 + 1.3612 * T - 0.000136 * T * T;
}

// Equation of Time in minutes (Meeus, Astronomical Algorithms ch. 28) — moved verbatim.
export function equationOfTimeMinutes(T: number): number {
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const epsilon0 = 23.4392911 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  const y = Math.pow(Math.tan(toRad(epsilon0) / 2), 2);
  const L0r = toRad(L0);
  const Mr = toRad(M);
  const E = y * Math.sin(2 * L0r) - 2 * e * Math.sin(Mr) + 4 * e * y * Math.sin(Mr) * Math.cos(2 * L0r)
    - 0.5 * y * y * Math.sin(4 * L0r) - 1.25 * e * e * Math.sin(2 * Mr);
  return toDeg(E) * 4;
}

// Sunrise/Sunset in decimal hours UTC using the standard formula — moved verbatim.
export function sunriseUTC(jd: number, lat: number, lng: number, rising: boolean): number {
  const T = (jd - 2451545.0) / 36525;
  const M = norm360(357.52911 + 35999.05029 * T);
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const Mr = toRad(M);
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mr) + 0.019993 * Math.sin(2 * Mr);
  const sunLon = L0 + C;
  const obliq = 23.4393 - 0.0000004 * T * 36525;
  const sinDec = Math.sin(toRad(obliq)) * Math.sin(toRad(sunLon));
  const dec = Math.asin(sinDec);
  const latR = toRad(lat);
  const cosHA = (Math.sin(toRad(-0.8333)) - Math.sin(latR) * Math.sin(dec)) / (Math.cos(latR) * Math.cos(dec));
  if (cosHA < -1 || cosHA > 1) return NaN;
  const HA = toDeg(Math.acos(cosHA));
  const eot = equationOfTimeMinutes(T);
  const noon = 12 - lng / 15 - eot / 60;
  return rising ? noon - HA / 15 : noon + HA / 15;
}

// Greenwich Mean Sidereal Time in degrees, valid for any jd (Meeus ch. 12) — moved verbatim.
export function gmstDegrees(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
}

// Moon's geocentric equatorial position (RA/Dec), including the Moon's ecliptic latitude.
// Longitude-only Panchang elements (Tithi/Nakshatra/Yoga/Karana) can ignore β, but declination
// cannot: the Moon swings ±5.145° off the ecliptic, and that error feeds straight into any
// hour-angle/altitude geometry. Dropping β here previously cost moonrise up to ~42 minutes.
export function moonEquatorial(jd: number): { ra: number; dec: number } {
  const T = (jd - 2451545.0) / 36525;
  const { lon, lat } = EclipticGeoMoon(jd - 2451545.0);
  const obliq = 23.4392911 - 0.0130042 * T;
  const lamR = toRad(lon);
  const betR = toRad(lat);
  const epsR = toRad(obliq);
  const dec = Math.asin(Math.sin(betR) * Math.cos(epsR) + Math.cos(betR) * Math.sin(epsR) * Math.sin(lamR));
  const ra = norm360(toDeg(Math.atan2(
    Math.sin(lamR) * Math.cos(epsR) - Math.tan(betR) * Math.sin(epsR),
    Math.cos(lamR),
  )));
  return { ra, dec: toDeg(dec) };
}

// Moonrise/moonset in decimal UTC hours, in the same "UTC hour relative to this calendar
// date's 0h UTC" frame sunriseUTC() returns — so fmtTime(result, tzOffset) still applies.
//
// Delegates to astronomy-engine's SearchRiseSet, which handles topocentric parallax, refraction
// and the Moon's ecliptic latitude properly. This replaced a hand-rolled altitude-crossing
// solver that (a) computed declination with β forced to 0, costing up to ~42 min, and (b) was
// seeded by a `sunrise + moonAge*0.8` heuristic that landed on the *next* day's moonrise on
// 48 of 300 sampled city-days.
//
// The search is anchored to local midnight so the event returned is the one that actually falls
// on the location's own calendar date. Returns null when there is genuinely no such event that
// day — the lunar day is ~24h50m, so roughly one day a month has no moonrise (or no moonset)
// at all. Callers must render that case honestly rather than printing a neighbouring day's time.
//
// jd0 = Julian Day at 0h UTC of the calendar date; tzOffset = the location's UTC offset in hours.
export function moonRiseSetUTC(
  jd0: number, lat: number, lng: number, rising: boolean, tzOffset: number,
): number | null {
  const localMidnightJd = jd0 - tzOffset / 24;
  const observer = new Observer(lat, lng, 0);
  const event = SearchRiseSet(Body.Moon, observer, rising ? +1 : -1, localMidnightJd - 2451545.0, 1);
  if (!event) return null;
  return (event.ut + 2451545.0 - jd0) * 24;
}

// Iteratively finds the JD at which `longitudeFn(jd)` (a 0-360° wrapped angle) next crosses
// `targetLon`, using the actual instantaneous rate of change of that specific angle at each
// step rather than an assumed fixed rate. Moved verbatim from panchang.ts.
export function findAngleCrossing(jdStart: number, targetLon: number, longitudeFn: (jd: number) => number): number {
  let jd = jdStart;
  const dt = 1 / 1440; // 1 minute, for the finite-difference instantaneous-rate estimate
  for (let i = 0; i < 8; i++) {
    const lonNow = longitudeFn(jd);
    let diff = targetLon - lonNow;
    diff = ((diff % 360) + 540) % 360 - 180; // shortest signed distance to target, (-180, 180]
    const lonNext = longitudeFn(jd + dt);
    let dLon = lonNext - lonNow;
    dLon = ((dLon % 360) + 540) % 360 - 180;
    const rate = dLon / dt; // actual degrees/day rate right now, not an assumed constant
    if (Math.abs(rate) < 1e-6) break;
    const dJd = diff / rate;
    jd += dJd;
    if (Math.abs(dJd) < 1 / 86400) break; // converged to ~1 second
  }
  return jd;
}

// Lagna (Ascendant) tropical ecliptic longitude — observer geometry (GMST + obliquity +
// latitude), not ephemeris; astronomy-engine has no "Vedic ascendant" function either. Moved
// verbatim from kundali.ts to remove the last per-file copy (see migration scope doc §3).
export function calcLagna(jd: number, lat: number, lng: number): number {
  const T = (jd - 2451545.0) / 36525;
  const eps = 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
  const GMST = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
  const RAMC = toRad(norm360(GMST + lng));
  const e = toRad(eps), phi = toRad(lat);
  // atan2 (not atan + a cos(RAMC)-based quadrant patch) is required here: the old patch assumed
  // the denominator's sign tracked cos(RAMC), which is false whenever
  // sin(e)*tan(phi) + cos(e)*sin(RAMC) flips sign independently of cos(RAMC) — that produced
  // spurious ~180° jumps in the Ascendant at certain times of day/latitude (Issue #9). Sign of
  // both atan2 args is flipped relative to the raw tan(Asc) numerator/denominator because the
  // unflipped pairing (-cos(RAMC), that sum) resolves to the Descendant, not the Ascendant —
  // verified against a brute-force horizon-crossing/azimuth ground truth (eastern-horizon
  // ecliptic-horizon intersection) at 2-hour steps across a full day, exact match to <0.001°.
  const A = toDeg(Math.atan2(Math.cos(RAMC), -(Math.sin(e) * Math.tan(phi) + Math.cos(e) * Math.sin(RAMC))));
  return norm360(A);
}

// Retrograde: sign of a planet's instantaneous geocentric-longitude rate, via finite difference
// against jd+1 day — same method kundali.ts's ORB scheme used, now driven by astronomy-engine's
// more accurate positions instead. Sun/Moon are never retrograde and Rahu/Ketu are always
// retrograde in mean motion; callers special-case those rather than calling this for them.
export function isRetrograde(body: OuterPlanet, jd: number): boolean {
  const lon0 = planetLongitude(body, jd);
  const lon1 = planetLongitude(body, jd + 1);
  let d = lon1 - lon0;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d < 0;
}

// Combust: whether a body's angular distance from the Sun (shortest arc) is within combustDeg.
// combustDeg varies per-planet (and per-retrograde-state for Budha/Shukra) — that selection is
// domain knowledge the caller owns; this is just the geometry.
export function isCombust(sunLon: number, bodyLon: number, combustDeg: number): boolean {
  let angDist = Math.abs(bodyLon - sunLon);
  if (angDist > 180) angDist = 360 - angDist;
  return angDist < combustDeg;
}
