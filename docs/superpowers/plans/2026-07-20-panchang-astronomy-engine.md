# Panchang Astronomy Engine Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-rolled, low-precision Meeus solar/lunar longitude series in `src/lib/panchang.ts` with the `astronomy-engine` library (VSOP87/ELP-2000-based), and eliminate the duplicate copies of that math in `index.astro` and `calendar.astro` by having their client-side scripts import the same functions from `panchang.ts` directly — one calculation engine, used identically at build time (Node) and in the browser.

**Architecture:** `astronomy-engine` is pure JS/TS with no native addon and no external ephemeris data files, so it runs identically under Node (`astro build`) and bundled into browser `<script>` tags (confirmed empirically — see Investigation Notes). `panchang.ts`'s `sunTrueLongitude()`/`moonLongitude()` internals are swapped to call it, keeping every existing exported function signature unchanged. The astronomy helper functions inside `panchang.ts` that are currently hand-duplicated in `index.astro`'s `calcPanchang()` and `calendar.astro`'s `quickPanchang()` are exported and imported directly, deleting the duplicate function bodies. DOM-update code, formatting logic (12h/24h/24+ toggle), and all interactivity are untouched.

**Tech Stack:** Astro v7 (`output: 'static'`), TypeScript, `astronomy-engine` (new dependency), Cloudflare Pages (static asset deploy only — confirmed no Cloudflare Functions/Workers exist in this project, so the native-vs-WASM ephemeris tradeoff that motivated earlier investigation does not apply).

## Global Constraints

- Astro v7, `output: 'static'` (default) — `astro.config.mjs` has no adapter. `panchang.ts` runs only at `astro build` time under Node, and (once imported client-side per this plan) bundled into browser JS via Vite. It never runs in a Cloudflare Workers/Functions runtime — none exist in this project.
- Node engine floor: `>=22.12.0` (`package.json`).
- Keep `calculatePanchang()`, `getHinduCalendarInfo()`, and `julianDay()` exported signatures in `src/lib/panchang.ts` byte-identical — nothing that imports them today should need to change.
- Keep the Lahiri ayanamsha formula (`23.85 + 1.3612*T - 0.000136*T²` in `lahiriAyanamsha()`) unchanged — only solar/lunar longitude internals change.
- Do not change the sunrise/sunset algorithm (`sunriseUTC()`, `equationOfTimeMinutes()`) — these stay Meeus-based per standing instruction; only export them so the client stops duplicating them verbatim.
- Do not modify `updateUI()`, `updateSummaryCard()`, `drawTimeline()`, `drawSummaryTimeline()`, `renderWithLoc()`, `applyLang()`, `minsToFmt()`, `fmtTime()` in `index.astro`, or `renderCalendar()`, `showPanel()` in `calendar.astro` — these are DOM/formatting glue, untouched.
- Out of scope for this plan (explicitly deferred to follow-up plans): `src/lib/kundali.ts`, `src/components/KundaliWidget.astro`, all 15 `src/pages/jyotish/*.astro`, all 9 `src/pages/muhurta/*.astro`. These duplicate a different calculation domain (Keplerian graha/planetary-position math for birth charts, not tithi/nakshatra/yoga/karana) and are ~4,600 lines across 26 files — too large and too different to fold into this plan safely.
- `package.json`'s `deploy` script (`astro build && wrangler pages deploy dist`) is not to be run as part of this plan — deployment is a separate, explicit user action.

## Investigation Notes (already verified — do not re-verify)

- **Astro client `<script>` tags CAN import local `.ts` modules.** `CLAUDE.md`'s existing gotcha ("Client-side scripts in static Astro — `<script>` blocks cannot import from TS server modules") is factually wrong and will be corrected as part of this plan. Verified empirically: a scratch page with `<script>import { calculatePanchang } from '../lib/panchang'; ...</script>` built cleanly via `astro build`, and the emitted JS bundle contained `panchang.ts`'s full minified function bodies. Confirmed by Astro's own docs (`client-side-scripts` guide): scripts without extra attributes are processed by Vite, support TypeScript, and bundle local file imports and npm packages automatically.
- **`astronomy-engine` API** (from `node_modules/astronomy-engine/astronomy.d.ts`, package version `2.1.19`):
  - `SunPosition(date: FlexibleDateTime): EclipticCoordinates` — `.elon` is the apparent geocentric ecliptic longitude of date, in degrees. Direct replacement for `sunTrueLongitude()`'s return value.
  - `EclipticGeoMoon(date: FlexibleDateTime): Spherical` — `.lon` is the Moon's geocentric ecliptic longitude, true equinox of date, in degrees. Direct replacement for `moonLongitude()`'s return value.
  - `type FlexibleDateTime = Date | number | AstroTime` — a plain `number` is interpreted as **UT in fractional days since the J2000 epoch**, i.e. exactly `jd - 2451545.0`. No `Date`/`AstroTime` construction needed; existing `jd` values convert with a single subtraction.
- **Bundle size impact measured empirically** (not estimated): importing only `SunPosition` + `EclipticGeoMoon` from `astronomy-engine` into a client `<script>` (Vite tree-shakes the rest of the library — planets, eclipses, etc.) adds **33.8KB minified / 14.4KB gzipped** to that page's script bundle. For context: `index.astro`'s entire current client bundle is 21.7KB minified/7.6KB gzip; `calendar.astro`'s is 8.4KB/2.9KB. This roughly doubles the homepage's script weight and quadruples the calendar page's. Real but not large in absolute terms — noted here for the record, no action required unless the user flags it as unacceptable after seeing Task 6's final measurement.
- `panchang.ts` has zero imports today (pure math, no Node-only dependencies), so it bundles cleanly into client JS with no special handling needed.

---

### Task 1: Install astronomy-engine

**Files:**
- Modify: `package.json` (adds dependency)
- Modify: `package-lock.json` (npm-managed)

**Interfaces:**
- Produces: `astronomy-engine` npm package available for import as `import { SunPosition, EclipticGeoMoon } from 'astronomy-engine'` from both `.ts` files (Node, build time) and `.astro` `<script>` blocks (browser, bundled by Vite).

- [ ] **Step 1: Install the package**

Run:
```bash
npm install astronomy-engine
```

Expected: `package.json` gains `"astronomy-engine": "^2.1.19"` (or newer patch) under `"dependencies"`. `npm install` exits 0.

- [ ] **Step 2: Verify it resolves under Node**

Run:
```bash
node -e "import('astronomy-engine').then(m => console.log(typeof m.SunPosition, typeof m.EclipticGeoMoon))"
```

Expected output: `function function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add astronomy-engine dependency for panchang.ts precision migration"
```

---

### Task 2: Migrate panchang.ts to astronomy-engine and export shared helpers

**Files:**
- Modify: `src/lib/panchang.ts`

**Interfaces:**
- Consumes: `SunPosition`, `EclipticGeoMoon` from `astronomy-engine` (installed in Task 1).
- Produces (new exports, in addition to the existing `julianDay`, `calculatePanchang`, `getHinduCalendarInfo`, `PanchangData`, `RASHIS`, `AMANTA_MONTHS`, `SAMVATSARA_NAMES`, `HinduCalendarInfo`):
  - `export function sunTrueLongitude(jd: number): number`
  - `export function moonLongitude(jd: number): number`
  - `export function lahiriAyanamsha(jd: number): number`
  - `export function equationOfTimeMinutes(T: number): number`
  - `export function sunriseUTC(jd: number, lat: number, lng: number, rising: boolean): number`
  - `export function gmstDegrees(jd: number): number`
  - `export function moonEquatorial(jd: number): { ra: number; dec: number }`
  - `export function moonRiseSetUTC(jd0: number, lat: number, lng: number, rising: boolean, seedUTCHour: number): number`
  - `export function findAngleCrossing(jdStart: number, targetLon: number, longitudeFn: (jd: number) => number): number`
  - These signatures are all unchanged from their current (private) form — only the `export` keyword is added, except `sunTrueLongitude`/`moonLongitude` whose internals change (signature unchanged).

- [ ] **Step 1: Add the import and swap `sunTrueLongitude`'s internals**

In `src/lib/panchang.ts`, add this import at the very top of the file (before the `PanchangData` interface):

```ts
// Panchang calculation engine using Jean Meeus astronomical algorithms
import { SunPosition, EclipticGeoMoon } from 'astronomy-engine';

export interface PanchangData {
```

Replace this function:

```ts
function sunTrueLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = toRad(M);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
    + 0.000289 * Math.sin(3 * Mr);
  return norm360(L0 + C);
}
```

with:

```ts
export function sunTrueLongitude(jd: number): number {
  return norm360(SunPosition(jd - 2451545.0).elon);
}
```

- [ ] **Step 2: Swap `moonLongitude`'s internals**

Replace this function (the entire 26-term `dL` series):

```ts
function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L = norm360(218.3164477 + 481267.88123421 * T);
  const D = norm360(297.8501921 + 445267.1114034 * T);
  const M = norm360(357.5291092 + 35999.0502909 * T);
  const Mp = norm360(134.9633964 + 477198.8675055 * T);
  const F = norm360(93.2720950 + 483202.0175233 * T);
  const Dr = toRad(D); const Mr = toRad(M); const Mpr = toRad(Mp); const Fr = toRad(F);
  const dL = 6.288774 * Math.sin(Mpr)
    + 1.274027 * Math.sin(2 * Dr - Mpr)
    + 0.658314 * Math.sin(2 * Dr)
    + 0.213618 * Math.sin(2 * Mpr)
    - 0.185116 * Math.sin(Mr)
    - 0.114332 * Math.sin(2 * Fr)
    + 0.058793 * Math.sin(2 * Dr - 2 * Mpr)
    + 0.057066 * Math.sin(2 * Dr - Mr - Mpr)
    + 0.053322 * Math.sin(2 * Dr + Mpr)
    + 0.045758 * Math.sin(2 * Dr - Mr)
    - 0.040923 * Math.sin(Mr - Mpr)
    - 0.034720 * Math.sin(Dr)
    - 0.030383 * Math.sin(Mr + Mpr)
    + 0.015327 * Math.sin(2 * Dr - 2 * Fr)
    + 0.010980 * Math.sin(Mpr - 2 * Fr)
    + 0.010675 * Math.sin(4 * Dr - Mpr)
    + 0.010034 * Math.sin(3 * Mpr)
    + 0.008548 * Math.sin(4 * Dr - 2 * Mpr)
    - 0.007888 * Math.sin(2 * Dr + Mr - Mpr)
    - 0.006766 * Math.sin(2 * Dr + Mr)
    - 0.005163 * Math.sin(Dr - Mpr)
    + 0.004987 * Math.sin(Dr + Mr)
    + 0.004036 * Math.sin(2 * Dr - Mr + Mpr)
    + 0.003994 * Math.sin(2 * Dr + 2 * Mpr)
    + 0.003861 * Math.sin(4 * Dr)
    + 0.003665 * Math.sin(2 * Dr - 3 * Mpr);
  return norm360(L + dL);
}
```

with:

```ts
export function moonLongitude(jd: number): number {
  return norm360(EclipticGeoMoon(jd - 2451545.0).lon);
}
```

- [ ] **Step 3: Export `lahiriAyanamsha` (no internal change)**

Change:

```ts
// Lahiri ayanamsha (degrees)
function lahiriAyanamsha(jd: number): number {
```

to:

```ts
// Lahiri ayanamsha (degrees)
export function lahiriAyanamsha(jd: number): number {
```

- [ ] **Step 4: Export `equationOfTimeMinutes`, `sunriseUTC`, `gmstDegrees`, `moonEquatorial`, `moonRiseSetUTC`, `findAngleCrossing` (no internal changes)**

Change each of these six function declarations by adding `export` in front — no other changes:

```ts
export function equationOfTimeMinutes(T: number): number {
```

```ts
export function sunriseUTC(jd: number, lat: number, lng: number, rising: boolean): number {
```

```ts
export function gmstDegrees(jd: number): number {
```

```ts
export function moonEquatorial(jd: number): { ra: number; dec: number } {
```

```ts
export function moonRiseSetUTC(jd0: number, lat: number, lng: number, rising: boolean, seedUTCHour: number): number {
```

```ts
export function findAngleCrossing(jdStart: number, targetLon: number, longitudeFn: (jd: number) => number): number {
```

(`julianDay` is already exported — no change needed there.)

- [ ] **Step 5: Build and confirm no errors**

Run:
```bash
npm run build
```

Expected: build completes with `[build] Complete!`, no TypeScript/build errors related to `panchang.ts` or `astronomy-engine`. (Pre-existing `astro check` noise from unrelated files is expected per `CLAUDE.md` and is not a failure signal — only `astro build` output matters here.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/panchang.ts
git commit -m "Migrate panchang.ts solar/lunar longitude to astronomy-engine, export shared helpers"
```

---

### Task 3: Verify calculatePanchang() against the three reference dates

**Files:**
- Create (temporary, deleted at end of task): `src/pages/verify-panchang-temp.astro`

**Interfaces:**
- Consumes: `calculatePanchang` from `src/lib/panchang.ts` (Task 2).

- [ ] **Step 1: Create the temporary verification page**

```astro
---
import { calculatePanchang } from '../lib/panchang';

const NEW_DELHI = { lat: 28.6139, lng: 77.2090, tzOffset: 5.5 };
const dates = [
  new Date('2026-07-20T00:00:00'),
  new Date('2026-07-26T00:00:00'),
  new Date('2026-08-12T00:00:00'),
];
const results = dates.map(d => ({
  date: d.toISOString().slice(0, 10),
  panchang: calculatePanchang(d, NEW_DELHI.lat, NEW_DELHI.lng, NEW_DELHI.tzOffset),
}));
---
<html><body>
<pre id="out">{JSON.stringify(results, null, 2)}</pre>
</body></html>
```

- [ ] **Step 2: Build and extract the output**

Run:
```bash
npm run build
```

Then read `dist/verify-panchang-temp/index.html` and extract the JSON content of the `<pre id="out">` element.

Expected: valid JSON with 3 entries, each containing `tithi.name`, `tithi.paksha`, `nakshatra.name`, `nakshatra.pada`, `yoga.name`, `karana.name`, `sunrise`, `sunset`, `sunLongitude`, `moonLongitude`, `ayanamsha` for New Delhi on 2026-07-20, 2026-07-26, and 2026-08-12.

- [ ] **Step 3: Report the values and delete the temporary page**

Report the extracted values to the user for cross-checking against independent references (this is the deliverable — do not skip reporting even if step 2's build succeeds).

Run:
```bash
rm src/pages/verify-panchang-temp.astro
```

No commit for this task — the verification page is not meant to ship. If the user asks to keep a permanent verification script instead of a throwaway page, that's a follow-up decision, not part of this plan.

---

### Task 4: Consolidate index.astro's client-side Panchang engine

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `julianDay`, `sunTrueLongitude`, `moonLongitude`, `lahiriAyanamsha`, `equationOfTimeMinutes`, `sunriseUTC`, `gmstDegrees`, `moonEquatorial`, `moonRiseSetUTC`, `findAngleCrossing` from `../lib/panchang` (Task 2).
- Produces: no change to `calcPanchang(date, loc)`'s return shape or `getHinduCalInfo(...)`'s return shape — both functions keep their exact current field names (`sunSidereal`, `moonSidereal`, `tithiPaksha`, `vsYear`, `ssYear`, `vsName`, etc.) so `updateUI`, `updateSummaryCard`, `drawTimeline`, `drawSummaryTimeline`, `renderWithLoc`, `applyLang` require zero changes.

- [ ] **Step 1: Replace the duplicated-math block with an import + trimmed local utilities**

In the `<script>` tag starting at line 301, replace this entire block (from the comment on line 302 through the end of `moonRiseSetUTC` on line 429):

```ts
// ─── Client-side Panchang engine ─────────────────────────────────────────
// Mirrors src/lib/panchang.ts + src/lib/panchang.ts#getHinduCalendarInfo

// ── Global display state ──
let timeFormat: '12h' | '24h' | '24p' = '12h';
let calSchool: 'amanta' | 'purnimanta' = 'amanta';
let chartVisible = false;
let srMinsGlobal = 0; // sunrise (mins from midnight) for 24+ format

const toRad = (d: number) => d * Math.PI / 180;
const toDeg = (r: number) => r * 180 / Math.PI;
const norm360 = (a: number) => ((a % 360) + 360) % 360;

function julianDay(year: number, month: number, day: number, hour = 0): number {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24 + B - 1524.5;
}

function sunTrueLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const M = norm360(357.52911 + 35999.05029 * T);
  const Mr = toRad(M);
  return norm360(L0 + (1.914602 - 0.004817 * T) * Math.sin(Mr) + 0.019993 * Math.sin(2 * Mr));
}

function moonLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L = norm360(218.3164477 + 481267.88123421 * T);
  const D = norm360(297.8501921 + 445267.1114034 * T);
  const M = norm360(357.5291092 + 35999.0502909 * T);
  const Mp = norm360(134.9633964 + 477198.8675055 * T);
  const F = norm360(93.2720950 + 483202.0175233 * T);
  const Dr = toRad(D), Mr = toRad(M), Mpr = toRad(Mp), Fr = toRad(F);
  const dL = 6.288774*Math.sin(Mpr)+1.274027*Math.sin(2*Dr-Mpr)+0.658314*Math.sin(2*Dr)
    +0.213618*Math.sin(2*Mpr)-0.185116*Math.sin(Mr)-0.114332*Math.sin(2*Fr)
    +0.058793*Math.sin(2*Dr-2*Mpr)+0.057066*Math.sin(2*Dr-Mr-Mpr)+0.053322*Math.sin(2*Dr+Mpr)
    +0.045758*Math.sin(2*Dr-Mr)-0.040923*Math.sin(Mr-Mpr)-0.034720*Math.sin(Dr)
    -0.030383*Math.sin(Mr+Mpr)+0.015327*Math.sin(2*Dr-2*Fr)+0.010980*Math.sin(Mpr-2*Fr)
    +0.010675*Math.sin(4*Dr-Mpr)+0.010034*Math.sin(3*Mpr)+0.008548*Math.sin(4*Dr-2*Mpr)
    -0.007888*Math.sin(2*Dr+Mr-Mpr)-0.006766*Math.sin(2*Dr+Mr)-0.005163*Math.sin(Dr-Mpr)
    +0.004987*Math.sin(Dr+Mr)+0.004036*Math.sin(2*Dr-Mr+Mpr)+0.003994*Math.sin(2*Dr+2*Mpr)
    +0.003861*Math.sin(4*Dr)+0.003665*Math.sin(2*Dr-3*Mpr);
  return norm360(L + dL);
}

function ayanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.85 + 1.3612 * T;
}

// Equation of Time in minutes (Meeus, Astronomical Algorithms ch. 28) — copied verbatim from
// src/lib/panchang.ts's equationOfTimeMinutes() so the client-side sunrise/sunset matches the
// server-rendered value (client scripts in static Astro can't import from src/lib — see
// CLAUDE.md's Gotchas).
function equationOfTimeMinutes(T: number): number {
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

function sunriseUTC(jd: number, lat: number, lng: number, rising: boolean): number {
  const T = (jd - 2451545.0) / 36525;
  const M = norm360(357.52911 + 35999.05029 * T);
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const Mr = toRad(M);
  const sunLon = L0 + (1.914602 - 0.004817 * T) * Math.sin(Mr) + 0.019993 * Math.sin(2 * Mr);
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

function gmstDegrees(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
}

function moonEquatorial(jd: number): { ra: number; dec: number } {
  const T = (jd - 2451545.0) / 36525;
  const lambda = moonLon(jd);
  const obliq = 23.4392911 - 0.0130042 * T;
  const lamR = toRad(lambda);
  const epsR = toRad(obliq);
  const dec = Math.asin(Math.sin(epsR) * Math.sin(lamR));
  const ra = norm360(toDeg(Math.atan2(Math.sin(lamR) * Math.cos(epsR), Math.cos(lamR))));
  return { ra, dec: toDeg(dec) };
}

// Iterative moonrise/moonset altitude-crossing solve — see src/lib/panchang.ts's
// moonRiseSetUTC for the full explanation of why the Moon needs this (unlike the Sun)
// and why the result is seeded from the old day-offset heuristic.
function moonRiseSetUTC(jd0: number, lat: number, lng: number, rising: boolean, seedUTCHour: number): number {
  const h0 = 0.125;
  const latR = toRad(lat);
  let u = seedUTCHour;
  for (let i = 0; i < 6; i++) {
    const jd = jd0 + u / 24;
    const { ra, dec } = moonEquatorial(jd);
    const decR = toRad(dec);
    const cosH0 = (Math.sin(toRad(h0)) - Math.sin(latR) * Math.sin(decR)) / (Math.cos(latR) * Math.cos(decR));
    if (cosH0 < -1 || cosH0 > 1) return NaN;
    const H0 = toDeg(Math.acos(cosH0));
    const lst = norm360(gmstDegrees(jd) + lng);
    let H = ((lst - ra + 180) % 360 + 360) % 360 - 180;
    const target = rising ? -H0 : H0;
    let err = ((H - target + 180) % 360 + 360) % 360 - 180;
    const du = err / 14.35;
    u -= du;
    if (Math.abs(du) < 0.0005) break;
  }
  return u;
}
```

with:

```ts
// ─── Client-side Panchang engine ─────────────────────────────────────────
// Orchestration and formatting only — astronomy math imported from src/lib/panchang.ts,
// the same functions the server-rendered "today" values use at build time.
import {
  julianDay,
  sunTrueLongitude as sunTrueLon,
  moonLongitude as moonLon,
  lahiriAyanamsha as ayanamsha,
  equationOfTimeMinutes,
  sunriseUTC,
  gmstDegrees,
  moonEquatorial,
  moonRiseSetUTC,
  findAngleCrossing,
} from '../lib/panchang';

// ── Global display state ──
let timeFormat: '12h' | '24h' | '24p' = '12h';
let calSchool: 'amanta' | 'purnimanta' = 'amanta';
let chartVisible = false;
let srMinsGlobal = 0; // sunrise (mins from midnight) for 24+ format

const norm360 = (a: number) => ((a % 360) + 360) % 360;
```

- [ ] **Step 2: Delete the now-duplicate local `findAngleCrossing`**

Replace this block (the comment and function immediately before `estimateEnd`):

```ts
// Iterative boundary-crossing solve — mirrors src/lib/panchang.ts's findAngleCrossing()/
// estimateEndTime(). Recomputes the actual instantaneous rate of change of the angle at each
// step (via finite difference) rather than assuming a fixed rate, which is what made the old
// single-linear-rate version run 45min-2.5h early vs. independent third-party sources (see
// docs/bugs/backlog.md).
function findAngleCrossing(jdStart: number, targetLon: number, lonFn: (jd: number) => number): number {
  let jd = jdStart;
  const dt = 1 / 1440; // 1 minute
  for (let i = 0; i < 8; i++) {
    const lonNow = lonFn(jd);
    let diff = targetLon - lonNow;
    diff = ((diff % 360) + 540) % 360 - 180;
    const lonNext = lonFn(jd + dt);
    let dLon = lonNext - lonNow;
    dLon = ((dLon % 360) + 540) % 360 - 180;
    const rate = dLon / dt;
    if (Math.abs(rate) < 1e-6) break;
    const dJd = diff / rate;
    jd += dJd;
    if (Math.abs(dJd) < 1 / 86400) break; // converged to ~1 second
  }
  return jd;
}

function estimateEnd(jd: number, step: number, tz: number, lonFn: (jd: number) => number): string {
```

with:

```ts
function estimateEnd(jd: number, step: number, tz: number, lonFn: (jd: number) => number): string {
```

(`findAngleCrossing` now resolves via the import added in Step 1 — `estimateEnd`'s body, which calls `findAngleCrossing(jd, targetLon, lonFn)`, requires no changes.)

- [ ] **Step 3: Build and confirm no errors**

Run:
```bash
npm run build
```

Expected: `[build] Complete!`, no errors. `calcPanchang()` and `getHinduCalInfo()` in this file require **zero body changes** — every call site (`sunTrueLon(jd)`, `moonLon(jd)`, `ayanamsha(jd)`, `sunriseUTC(...)`, `moonRiseSetUTC(...)`, `findAngleCrossing(...)` inside `estimateEnd`) now resolves through the Step 1 import via aliasing, so if the build fails, the cause is almost certainly a typo in the import list, not a logic error.

- [ ] **Step 4: Manual browser verification**

Run:
```bash
npm run dev
```

Open the homepage in a browser. Verify:
- The Panchang summary card loads with today's values.
- Changing the date picker updates the card instantly (no page reload) with new Tithi/Nakshatra/Yoga/Karana/sunrise/sunset values.
- Toggling the time format (12h / 24h / 24+) in the toolbar re-renders sunrise/sunset/end-times in the new format.
- Toggling Amanta/Purnimanta calendar school updates the month label.
- Changing location via the header's location picker updates the card, Kundali widget, and Vedic Clock.

Stop the dev server when done: `astro dev stop` (per this project's background-dev-server convention).

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "Consolidate index.astro's client Panchang engine onto panchang.ts imports"
```

---

### Task 5: Consolidate calendar.astro's quickPanchang()

**Files:**
- Modify: `src/pages/calendar.astro`

**Interfaces:**
- Consumes: `julianDay`, `sunTrueLongitude`, `moonLongitude`, `lahiriAyanamsha` from `../lib/panchang` (Task 2).
- Produces: `quickPanchang(date: Date): { tithi: string; nakshatra: string }` — same signature and return shape as today, so `renderCalendar()` and the initial cell-population loop require zero changes.

- [ ] **Step 1: Replace the duplicated-math block**

Replace this entire block:

```ts
const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const TITHIS = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
const toRad = (d: number) => d * Math.PI / 180;
const norm = (a: number) => ((a % 360) + 360) % 360;

function quickPanchang(date: Date) {
  const yr = date.getFullYear(), mo = date.getMonth()+1, dy = date.getDate();
  let y = yr, m = mo;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y/100), B = 2 - A + Math.floor(A/4);
  const jd = Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + dy + 6/24 + B - 1524.5;
  const T = (jd - 2451545)/36525;
  const L0 = norm(280.46646 + 36000.76983*T);
  const Msun = norm(357.52911 + 35999.05029*T);
  const sunLon = norm(L0 + (1.914602-0.004817*T)*Math.sin(toRad(Msun)) + 0.019993*Math.sin(2*toRad(Msun)));
  const moonL = norm(218.3164477 + 481267.88123421*T);
  const moonD = norm(297.8501921 + 445267.1114034*T);
  const moonMp = norm(134.9633964 + 477198.8675055*T);
  const dL = 6.288774*Math.sin(toRad(moonMp)) + 1.274027*Math.sin(toRad(2*moonD-moonMp)) + 0.658314*Math.sin(toRad(2*moonD)) + 0.213618*Math.sin(toRad(2*moonMp));
  const moonLon = norm(moonL + dL);
  const ay = 23.85 + 1.3612*T;
  const moonSid = norm(moonLon - ay);
  const elong = norm(moonLon - sunLon);
  const tithiIdx = Math.floor(elong/12)%30;
  const nakIdx = Math.floor(moonSid/(360/27))%27;
  const paksha = tithiIdx < 15 ? 'S' : 'K';
  return { tithi: paksha + ' ' + TITHIS[tithiIdx], nakshatra: NAKSHATRAS[nakIdx] };
}
```

with:

```ts
import { julianDay, sunTrueLongitude, moonLongitude, lahiriAyanamsha } from '../lib/panchang';

const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const TITHIS = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
const norm = (a: number) => ((a % 360) + 360) % 360;

function quickPanchang(date: Date) {
  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate(), 6);
  const sunLon = sunTrueLongitude(jd);
  const moonLon = moonLongitude(jd);
  const ay = lahiriAyanamsha(jd);
  const moonSid = norm(moonLon - ay);
  const elong = norm(moonLon - sunLon);
  const tithiIdx = Math.floor(elong/12)%30;
  const nakIdx = Math.floor(moonSid/(360/27))%27;
  const paksha = tithiIdx < 15 ? 'S' : 'K';
  return { tithi: paksha + ' ' + TITHIS[tithiIdx], nakshatra: NAKSHATRAS[nakIdx] };
}
```

(The `6` passed to `julianDay` reproduces the original's fixed `dy + 6/24` UTC snapshot — this function has never been location/timezone-aware; that behavior is preserved exactly, not changed.)

- [ ] **Step 2: Build and confirm no errors**

Run:
```bash
npm run build
```

Expected: `[build] Complete!`, no errors.

- [ ] **Step 3: Manual browser verification**

Run:
```bash
npm run dev
```

Open `/calendar` in a browser. Verify:
- The month grid loads with a Tithi label under each day number.
- Clicking a day opens the bottom-sheet/sidebar panel showing that day's Tithi and Nakshatra.
- Prev/Next month navigation re-renders correctly.

Stop the dev server: `astro dev stop`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/calendar.astro
git commit -m "Consolidate calendar.astro's quickPanchang onto panchang.ts imports"
```

---

### Task 6: Final verification, bundle-size report, and CLAUDE.md corrections

**Files:**
- Modify: `CLAUDE.md` (correct the disproven client-script-import gotcha; update Known Issues)

**Interfaces:**
- None (verification and documentation task).

- [ ] **Step 1: Full site build**

Run:
```bash
npm run build
```

Expected: `[build] Complete!`, same page count as before this plan (397 pages), no errors.

- [ ] **Step 2: Measure final bundle sizes**

Run:
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const m = html.match(/\/_astro\/index\.astro[^\"]+\.js/g);
const script = m[m.length - 1];
const buf = fs.readFileSync('dist' + script);
console.log('index.astro:', buf.length, 'bytes minified');
"
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/calendar/index.html', 'utf8');
const m = html.match(/\/_astro\/calendar\.astro[^\"]+\.js/g);
const script = m[m.length - 1];
const buf = fs.readFileSync('dist' + script);
console.log('calendar.astro:', buf.length, 'bytes minified');
"
```

Report these numbers to the user alongside the pre-migration baseline already on record (index.astro: 21,676 bytes / calendar.astro: 8,372 bytes minified) so the actual delta is visible, not just the earlier isolated astronomy-engine-only estimate.

- [ ] **Step 3: Correct the CLAUDE.md gotcha this plan disproved**

In `CLAUDE.md`, find this line under "Critical Gotchas":

```
- **Client-side scripts in static Astro** — `<script>` blocks cannot import from TS server modules; orbital math must be duplicated inline (see `KundaliWidget.astro` and every `jyotish/*.astro` calculator). This is a known source of copy-paste drift between pages — when fixing a formula bug, grep for the same constant/function name across all `jyotish/*.astro` and `muhurta/*.astro` pages, since it's likely duplicated 10-20 times.
```

Replace with:

```
- **Client-side scripts in static Astro CAN import from TS server modules** — corrected 2026-07-20: this was previously (incorrectly) documented as impossible. Astro's `<script>` tags (without `is:inline` or other attributes) are processed by Vite, support TypeScript, and bundle local file imports automatically — verified empirically and via Astro's own docs. `index.astro` and `calendar.astro` now import their Panchang math directly from `src/lib/panchang.ts` instead of duplicating it (see the 2026-07-20 astronomy-engine migration). `KundaliWidget.astro` and every `jyotish/*.astro`/`muhurta/*.astro` calculator still duplicate their orbital math inline — that was a design choice made under the mistaken belief above, not a technical requirement, and is a candidate for the same consolidation in a future pass. When fixing a formula bug in those files today, grep for the same constant/function name across all of them, since it's still duplicated 10-20 times there.
```

- [ ] **Step 4: Update the Ayanamsha Known Issue**

In `CLAUDE.md`, find:

```
### Ayanamsha
Lahiri: `23.85 + 1.3612*T - 0.000136*T²` (T = Julian centuries from J2000). **Known issue**: `index.astro` and `calendar.astro` still use a truncated 2-term version missing `-0.000136*T²` (fixed everywhere else 2026-07, including `muhurta/vivah.astro`, `muhurta/shubha-dates.astro`, `muhurta/panchaka.astro`, `muhurta/griha-pravesh.astro`, which previously had it too). Negligible impact today (~0.00001°) but inconsistent — use the full 3-term formula in any new/edited page.
```

Replace with:

```
### Ayanamsha
Lahiri: `23.85 + 1.3612*T - 0.000136*T²` (T = Julian centuries from J2000), in `panchang.ts`'s `lahiriAyanamsha()`. Fixed 2026-07-20: `index.astro` and `calendar.astro` now import this function directly instead of carrying their own truncated 2-term copies. **Still outstanding**: `muhurta/vivah.astro`, `muhurta/shubha-dates.astro`, `muhurta/panchaka.astro`, `muhurta/griha-pravesh.astro`, and the `kundali.ts`/`KundaliWidget.astro`/`jyotish/*.astro` family have their own inline ayanamsha copies — use the full 3-term formula in any new/edited page there until those are consolidated in a future pass.
```

- [ ] **Step 5: Add a new entry documenting this migration**

In `CLAUDE.md`, under "Known Issues (found via full-site audit, not yet fixed)", add a new fixed-issue line (near the other 2026-07 orbital-mechanics entries):

```
- ~~**Meeus low-precision lunar/solar series** (few-arcminute error affecting Tithi/Nakshatra/Yoga/Karana boundary times)~~ — fixed 2026-07-20: `panchang.ts`'s `sunTrueLongitude()`/`moonLongitude()` now call `astronomy-engine` (VSOP87/ELP-2000-based) instead of a hand-rolled truncated Meeus series; Lahiri ayanamsha subtraction and sunrise/sunset logic unchanged. `index.astro` and `calendar.astro` no longer duplicate this math — they import it from `panchang.ts` directly (see the corrected client-script-import gotcha above). `kundali.ts`/`KundaliWidget.astro`/`jyotish/*`/`muhurta/*` (~4,600 lines across 26 files, a different calculation domain — graha/planetary-position math, not tithi/nakshatra) are explicitly out of scope for this pass; see `docs/superpowers/plans/2026-07-20-panchang-astronomy-engine.md` for the follow-up plan boundary.
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "Document astronomy-engine migration and correct disproven client-script-import gotcha"
```

---

## Self-Review Notes

- **Spec coverage**: Task 1 covers the original step 1 (install, confirm dual-environment). Task 2 covers step 2 (panchang.ts internals) plus the "keep signatures unchanged" and "don't touch sunrise/sunset" constraints. Task 3 covers step 6 (report reference-date values). Tasks 4–5 cover step 3 (delete duplicates, import from panchang.ts) and step 4 (don't touch DOM glue — verified zero-diff by construction via import aliasing). Task 6 covers step 5 (bundle size) plus documentation hygiene the investigation surfaced (the disproven CLAUDE.md gotcha).
- **Placeholder scan**: every step has literal before/after code; no "add error handling"-style steps.
- **Type consistency**: `calcPanchang()`'s and `getHinduCalInfo()`'s return shapes in `index.astro`, and `quickPanchang()`'s in `calendar.astro`, are unchanged by construction (only their internal helper calls now resolve via import instead of local definition) — verified against every call site read in `updateUI`, `updateSummaryCard`, `drawTimeline`, `drawSummaryTimeline`, `renderWithLoc`, `applyLang`, `renderCalendar`, `showPanel`.
