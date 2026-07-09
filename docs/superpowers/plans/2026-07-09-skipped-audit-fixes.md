# Clearing the Skipped Site-Audit Items — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the 5 remaining `⏭️ SKIPPED` site-audit items (Planets menu, Sunrise & Sunset, Moonrise & Moonset, Raksha Bandhan 2026 date, 2027 festival data) plus a newly-discovered Moon-formula drift bug, per `docs/superpowers/specs/2026-07-08-skipped-audit-fixes-design.md`.

**Architecture:** Six new live Astro pages built on the site's existing pattern of duplicating orbital-mechanics formulas inline in `<script>` blocks (static Astro cannot import TS modules client-side). Sunrise/Sunset and Moonrise/Moonset are location-aware (results genuinely depend on lat/lng, wired to the header's `locationchange` event). The 4 Planets pages are date-live only — graha ecliptic longitude is geocentric and does not depend on observer location anywhere else in this codebase, so they recompute from `new Date()` on load but do not listen for `locationchange` (see the note in Task 6). Before building any of the six, the canonical 26-term Moon-longitude formula is propagated to 17 files that still carry an older, incomplete 15-term version, since every new page depends on accurate Moon math. Two independent `festivals.ts` data fixes (Raksha Bandhan date, 2027 festival year) round out the work.

**Tech Stack:** Astro v7 (static output), TypeScript, vanilla client-side `<script>` blocks, Node 22.15 (supports `--experimental-strip-types` for ad-hoc TS verification scripts — no test framework exists in this repo).

## Global Constraints

- No automated test runner exists in this repo (no vitest/jest, no `tests/` directory). The correctness gate is `npm run build` plus targeted manual/numeric verification, per `CLAUDE.md`.
- Client-side `<script>` blocks cannot `import` from `src/lib/*.ts` — every formula must be duplicated inline (`CLAUDE.md` gotcha).
- Ayanamsha must use the full 3-term Lahiri formula: `23.85 + 1.3612*T - 0.000136*T*T`.
- Moon longitude must use the full canonical 26-term `dL` correction sum (given in Task 1 below) — never the older 15-term truncation.
- Any new page whose displayed values genuinely depend on observer lat/lng (Sunrise/Sunset, Moonrise/Moonset) must read `window.__initLoc` on load and listen for the `locationchange` `CustomEvent` (detail shape: `{name, lat, lng, tzOffset}`), matching the pattern in `src/pages/muhurta/rahu-kala.astro`. Pages whose values don't depend on location (the 4 Planets pages — see Task 6's note) skip this wiring rather than faking it.
- New pages must use the existing CSS conventions: `container`, `card`, `btn-primary`, `input`, `caption-mono`, `gradient-mesh` classes and `var(--color-*)` custom properties — no new design system.
- Whenever a new page or header link is added, `src/components/Header.astro` must be updated in all three places: desktop dropdown, mobile drawer, `searchItems` array (`CLAUDE.md` convention).
- Apostrophes inside single-quoted TS/JS strings must be escaped (`\'`) or use template literals.

---

## Task 1: Propagate canonical Moon formula to `src/lib/kundali.ts`

**Files:**
- Modify: `src/lib/kundali.ts:137-151` (`moonLon` function)

**Interfaces:**
- Consumes: nothing new.
- Produces: `moonLon(jd: number): number` — same signature, now returns the same value as `src/lib/panchang.ts`'s `moonLongitude(jd)` at any given `jd` (both use the identical 26-term formula).

- [ ] **Step 1: Confirm current divergence (baseline numeric check)**

Run:
```bash
node --experimental-strip-types -e "
import { calculatePanchang } from './src/lib/panchang.ts';
import { calculateKundali } from './src/lib/kundali.ts';
const date = new Date(Date.UTC(2026, 6, 9, 6, 0, 0));
const p = calculatePanchang(date, 0, 0, 0);
const k = calculateKundali(date, 0, 0, 0);
const chandra = k.grahas.find(g => g.id === 'chandra');
console.log('panchang.ts moonLongitude (sidereal):', p.moonLongitude);
console.log('kundali.ts chandra siderealLon:', chandra.siderealLon);
console.log('diff (deg):', Math.abs(p.moonLongitude - chandra.siderealLon));
"
```
Expected: `diff (deg)` prints a small non-zero value (~0.006, confirming the two files currently disagree because `kundali.ts` is missing 11 terms).

- [ ] **Step 2: Replace the truncated `dL` sum with the canonical 26-term version**

In `src/lib/kundali.ts`, replace the entire `moonLon` function body (lines 137-151):

```ts
function moonLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lm  = n360(218.3164477 + 481267.88123421 * T);
  const D   = n360(297.8501921 + 445267.1114034  * T);
  const M   = n360(357.5291092 +  35999.0502909  * T);
  const Mp  = n360(134.9633964 + 477198.8675055  * T);
  const F   = n360( 93.2720950 + 483202.0175233  * T);
  const [Dr, Mr, Mpr, Fr] = [D, M, Mp, F].map(toR);
  const dL = 6.288774*Math.sin(Mpr)+1.274027*Math.sin(2*Dr-Mpr)+0.658314*Math.sin(2*Dr)
    +0.213618*Math.sin(2*Mpr)-0.185116*Math.sin(Mr)-0.114332*Math.sin(2*Fr)
    +0.058793*Math.sin(2*Dr-2*Mpr)+0.057066*Math.sin(2*Dr-Mr-Mpr)+0.053322*Math.sin(2*Dr+Mpr)
    +0.045758*Math.sin(2*Dr-Mr)-0.040923*Math.sin(Mr-Mpr)-0.034720*Math.sin(Dr)
    -0.030383*Math.sin(Mr+Mpr)+0.015327*Math.sin(2*Dr-2*Fr);
  return n360(Lm + dL);
}
```

with:

```ts
function moonLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lm  = n360(218.3164477 + 481267.88123421 * T);
  const D   = n360(297.8501921 + 445267.1114034  * T);
  const M   = n360(357.5291092 +  35999.0502909  * T);
  const Mp  = n360(134.9633964 + 477198.8675055  * T);
  const F   = n360( 93.2720950 + 483202.0175233  * T);
  const [Dr, Mr, Mpr, Fr] = [D, M, Mp, F].map(toR);
  const dL = 6.288774*Math.sin(Mpr)+1.274027*Math.sin(2*Dr-Mpr)+0.658314*Math.sin(2*Dr)
    +0.213618*Math.sin(2*Mpr)-0.185116*Math.sin(Mr)-0.114332*Math.sin(2*Fr)
    +0.058793*Math.sin(2*Dr-2*Mpr)+0.057066*Math.sin(2*Dr-Mr-Mpr)+0.053322*Math.sin(2*Dr+Mpr)
    +0.045758*Math.sin(2*Dr-Mr)-0.040923*Math.sin(Mr-Mpr)-0.034720*Math.sin(Dr)
    -0.030383*Math.sin(Mr+Mpr)+0.015327*Math.sin(2*Dr-2*Fr)+0.010980*Math.sin(Mpr-2*Fr)
    +0.010675*Math.sin(4*Dr-Mpr)+0.010034*Math.sin(3*Mpr)+0.008548*Math.sin(4*Dr-2*Mpr)
    -0.007888*Math.sin(2*Dr+Mr-Mpr)-0.006766*Math.sin(2*Dr+Mr)-0.005163*Math.sin(Dr-Mpr)
    +0.004987*Math.sin(Dr+Mr)+0.004036*Math.sin(2*Dr-Mr+Mpr)+0.003994*Math.sin(2*Dr+2*Mpr)
    +0.003861*Math.sin(4*Dr)+0.003665*Math.sin(2*Dr-3*Mpr);
  return n360(Lm + dL);
}
```

- [ ] **Step 3: Verify the numeric divergence is gone**

Run the same command as Step 1:
```bash
node --experimental-strip-types -e "
import { calculatePanchang } from './src/lib/panchang.ts';
import { calculateKundali } from './src/lib/kundali.ts';
const date = new Date(Date.UTC(2026, 6, 9, 6, 0, 0));
const p = calculatePanchang(date, 0, 0, 0);
const k = calculateKundali(date, 0, 0, 0);
const chandra = k.grahas.find(g => g.id === 'chandra');
console.log('diff (deg):', Math.abs(p.moonLongitude - chandra.siderealLon));
"
```
Expected: `diff (deg)` now prints a value below `1e-9` (floating-point noise only).

- [ ] **Step 4: Run the build**

Run: `npm run build`
Expected: build succeeds with the same page count as before this change.

- [ ] **Step 5: Commit**

```bash
git add src/lib/kundali.ts
git commit -m "fix: propagate canonical 26-term Moon formula to kundali.ts"
```

---

## Task 2: Propagate canonical Moon formula to `KundaliWidget.astro`

**Files:**
- Modify: `src/components/KundaliWidget.astro:483-497` (`moonLon_K` function)

**Interfaces:**
- Consumes: nothing new.
- Produces: `moonLon_K(jd: number): number` inline client function, now term-for-term identical to `panchang.ts`'s canonical formula (with local variable names `Dr,Mr,Mpr,Fr` preserved).

- [ ] **Step 1: Replace the truncated `dL` sum**

In `src/components/KundaliWidget.astro`, replace:

```ts
function moonLon_K(jd: number): number {
  const T = (jd-2451545)/36525;
  const Lm = n360(218.3164477+481267.88123421*T);
  const D  = n360(297.8501921+445267.1114034*T);
  const M  = n360(357.5291092+35999.0502909*T);
  const Mp = n360(134.9633964+477198.8675055*T);
  const F  = n360(93.2720950+483202.0175233*T);
  const [Dr,Mr,Mpr,Fr] = [D,M,Mp,F].map(toR);
  const dL = 6.288774*Math.sin(Mpr)+1.274027*Math.sin(2*Dr-Mpr)+0.658314*Math.sin(2*Dr)
    +0.213618*Math.sin(2*Mpr)-0.185116*Math.sin(Mr)-0.114332*Math.sin(2*Fr)
    +0.058793*Math.sin(2*Dr-2*Mpr)+0.057066*Math.sin(2*Dr-Mr-Mpr)+0.053322*Math.sin(2*Dr+Mpr)
    +0.045758*Math.sin(2*Dr-Mr)-0.040923*Math.sin(Mr-Mpr)-0.034720*Math.sin(Dr)
    -0.030383*Math.sin(Mr+Mpr)+0.015327*Math.sin(2*Dr-2*Fr)+0.010034*Math.sin(3*Mpr);
  return n360(Lm + dL);
}
```

with:

```ts
function moonLon_K(jd: number): number {
  const T = (jd-2451545)/36525;
  const Lm = n360(218.3164477+481267.88123421*T);
  const D  = n360(297.8501921+445267.1114034*T);
  const M  = n360(357.5291092+35999.0502909*T);
  const Mp = n360(134.9633964+477198.8675055*T);
  const F  = n360(93.2720950+483202.0175233*T);
  const [Dr,Mr,Mpr,Fr] = [D,M,Mp,F].map(toR);
  const dL = 6.288774*Math.sin(Mpr)+1.274027*Math.sin(2*Dr-Mpr)+0.658314*Math.sin(2*Dr)
    +0.213618*Math.sin(2*Mpr)-0.185116*Math.sin(Mr)-0.114332*Math.sin(2*Fr)
    +0.058793*Math.sin(2*Dr-2*Mpr)+0.057066*Math.sin(2*Dr-Mr-Mpr)+0.053322*Math.sin(2*Dr+Mpr)
    +0.045758*Math.sin(2*Dr-Mr)-0.040923*Math.sin(Mr-Mpr)-0.034720*Math.sin(Dr)
    -0.030383*Math.sin(Mr+Mpr)+0.015327*Math.sin(2*Dr-2*Fr)+0.010980*Math.sin(Mpr-2*Fr)
    +0.010675*Math.sin(4*Dr-Mpr)+0.010034*Math.sin(3*Mpr)+0.008548*Math.sin(4*Dr-2*Mpr)
    -0.007888*Math.sin(2*Dr+Mr-Mpr)-0.006766*Math.sin(2*Dr+Mr)-0.005163*Math.sin(Dr-Mpr)
    +0.004987*Math.sin(Dr+Mr)+0.004036*Math.sin(2*Dr-Mr+Mpr)+0.003994*Math.sin(2*Dr+2*Mpr)
    +0.003861*Math.sin(4*Dr)+0.003665*Math.sin(2*Dr-3*Mpr);
  return n360(Lm + dL);
}
```

- [ ] **Step 2: Verify term-for-term match against the canonical source**

Run:
```bash
node -e "
const fs = require('fs');
const widget = fs.readFileSync('src/components/KundaliWidget.astro', 'utf8');
const panchang = fs.readFileSync('src/lib/panchang.ts', 'utf8');
const terms = [...panchang.matchAll(/[+-]\s*0\.\d{6}\s*\*\s*Math\.sin\([^)]*\)/g)].map(m => m[0].replace(/\s+/g,''));
const missing = terms.filter(t => !widget.replace(/\s+/g,'').includes(t.replace(/^\+/,'')));
console.log('missing terms:', missing.length === 0 ? 'none' : missing);
"
```
Expected: `missing terms: none`.

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/KundaliWidget.astro
git commit -m "fix: propagate canonical 26-term Moon formula to KundaliWidget.astro"
```

---

## Task 3: Propagate canonical Moon formula to all 15 `jyotish/*.astro` pages

**Files:**
- Modify: `src/pages/jyotish/kundali.astro`, `janma-kundali.astro`, `lagna.astro`, `horoscope-match.astro`, `rashi.astro`, `baby-names.astro`, `shraddha.astro`, `sahasra-chandrodaya.astro`, `kalasarpa.astro`, `sadesati.astro`, `mangal-dosha.astro`, `nakshatra.astro`, `pancha-pakshi.astro`, `gemstone.astro`, `rudraksha.astro`

**Interfaces:**
- Consumes: nothing new.
- Produces: each file's inline `function moonLon(jd){...}` now uses the canonical 26-term formula (same minified single-line style as the current 15-term version).

All 15 files currently contain this exact byte-identical line (verified via grep before writing this plan):

```
function moonLon(jd){const T=(jd-2451545)/36525;const Lm=n360(218.3164477+481267.88123421*T);const D=n360(297.8501921+445267.1114034*T);const M=n360(357.5291092+35999.0502909*T);const Mp=n360(134.9633964+477198.8675055*T);const F=n360(93.2720950+483202.0175233*T);const dL=6.288774*Math.sin(toR(Mp))+1.274027*Math.sin(toR(2*D-Mp))+0.658314*Math.sin(toR(2*D))+0.213618*Math.sin(toR(2*Mp))-0.185116*Math.sin(toR(M))-0.114332*Math.sin(toR(2*F))+0.058793*Math.sin(toR(2*D-2*Mp))+0.057066*Math.sin(toR(2*D-M-Mp))+0.053322*Math.sin(toR(2*D+Mp))+0.045758*Math.sin(toR(2*D-M))-0.040923*Math.sin(toR(M-Mp))-0.034720*Math.sin(toR(D))-0.030383*Math.sin(toR(M+Mp))+0.015327*Math.sin(toR(2*D-2*F))+0.010034*Math.sin(toR(3*Mp));return n360(Lm+dL);}
```

- [ ] **Step 1: Apply the identical replacement to all 15 files**

For each of the 15 files listed above, replace the exact line shown above with:

```
function moonLon(jd){const T=(jd-2451545)/36525;const Lm=n360(218.3164477+481267.88123421*T);const D=n360(297.8501921+445267.1114034*T);const M=n360(357.5291092+35999.0502909*T);const Mp=n360(134.9633964+477198.8675055*T);const F=n360(93.2720950+483202.0175233*T);const dL=6.288774*Math.sin(toR(Mp))+1.274027*Math.sin(toR(2*D-Mp))+0.658314*Math.sin(toR(2*D))+0.213618*Math.sin(toR(2*Mp))-0.185116*Math.sin(toR(M))-0.114332*Math.sin(toR(2*F))+0.058793*Math.sin(toR(2*D-2*Mp))+0.057066*Math.sin(toR(2*D-M-Mp))+0.053322*Math.sin(toR(2*D+Mp))+0.045758*Math.sin(toR(2*D-M))-0.040923*Math.sin(toR(M-Mp))-0.034720*Math.sin(toR(D))-0.030383*Math.sin(toR(M+Mp))+0.015327*Math.sin(toR(2*D-2*F))+0.010980*Math.sin(toR(Mp-2*F))+0.010675*Math.sin(toR(4*D-Mp))+0.010034*Math.sin(toR(3*Mp))+0.008548*Math.sin(toR(4*D-2*Mp))-0.007888*Math.sin(toR(2*D+M-Mp))-0.006766*Math.sin(toR(2*D+M))-0.005163*Math.sin(toR(D-Mp))+0.004987*Math.sin(toR(D+M))+0.004036*Math.sin(toR(2*D-M+Mp))+0.003994*Math.sin(toR(2*D+2*Mp))+0.003861*Math.sin(toR(4*D))+0.003665*Math.sin(toR(2*D-3*Mp));return n360(Lm+dL);}
```

- [ ] **Step 2: Verify all 15 files were updated and none are mid-truncated**

Run:
```bash
grep -rl "0.010034" src/pages/jyotish/*.astro | wc -l
grep -rl "0.003665" src/pages/jyotish/*.astro | wc -l
```
Expected: both commands print `15` (every file that had the old marker term also now has the new terminal term — confirms no file was left partially edited).

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: build succeeds, page count unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/pages/jyotish/*.astro
git commit -m "fix: propagate canonical 26-term Moon formula to all 15 jyotish calculator pages"
```

---

## Task 4: Sunrise & Sunset page

**Files:**
- Create: `src/pages/sunrise-sunset.astro`
- Modify: `src/components/Header.astro` (link wiring deferred to Task 10 — do not edit Header.astro in this task)

**Interfaces:**
- Consumes: `window.__initLoc`, `locationchange` event (from `LocationPicker.astro`, already global).
- Produces: a live page at `/sunrise-sunset` with today's sunrise/sunset/day-length for the visitor's location, recomputed on `locationchange`, plus a 7-day-ahead table.

- [ ] **Step 1: Create the page**

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Sunrise & Sunset Times — PanchangPath" description="Today's sunrise, sunset, and day length for your location, plus a 7-day forecast — computed live using precise astronomical formulas.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <p class="caption-mono" style="color:var(--color-mute);margin:0 0 8px;">सूर्योदय · सूर्यास्त · Sunrise &amp; Sunset</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Sunrise &amp; Sunset Times</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:520px;">Live sunrise, sunset, and day length for your location — recalculated automatically when you change location.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <div style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:28px;">
        <div>
          <label style="font-size:11px;font-weight:500;color:var(--color-mute);display:block;margin-bottom:5px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:0.06em;">Location</label>
          <select id="ss-city" class="input" style="height:38px;min-width:180px;"></select>
        </div>
      </div>

      <div id="ss-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:40px;"></div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 14px;">Next 7 Days</h3>
      <div id="ss-week" style="display:flex;flex-direction:column;gap:6px;max-width:640px;"></div>
    </div>
  </section>
</Layout>

<script>
const LOCS = [
  {name:'New Delhi',lat:28.6139,lng:77.209,tz:5.5},
  {name:'Mumbai',lat:19.076,lng:72.8777,tz:5.5},
  {name:'Bengaluru',lat:12.9716,lng:77.5946,tz:5.5},
  {name:'Chennai',lat:13.0827,lng:80.2707,tz:5.5},
  {name:'Kolkata',lat:22.5726,lng:88.3639,tz:5.5},
  {name:'Hyderabad',lat:17.385,lng:78.4867,tz:5.5},
  {name:'Jaipur',lat:26.9124,lng:75.7873,tz:5.5},
  {name:'Varanasi',lat:25.3176,lng:82.9739,tz:5.5},
  {name:'Dubai',lat:25.2048,lng:55.2708,tz:4},
  {name:'Singapore',lat:1.3521,lng:103.8198,tz:8},
  {name:'New York',lat:40.7128,lng:-74.006,tz:-4},
  {name:'London',lat:51.5074,lng:-0.1278,tz:1},
  {name:'Toronto',lat:43.6532,lng:-79.3832,tz:-4},
];

function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
const n360=(a:number)=>((a%360)+360)%360;
const toRad=(d:number)=>d*Math.PI/180;
const toDeg=(r:number)=>r*180/Math.PI;

function sunriseUTC(jd:number,lat:number,lng:number,rising:boolean){
  const T=(jd-2451545)/36525;
  const M=n360(357.52911+35999.05029*T);
  const L0=n360(280.46646+36000.76983*T);
  const C=(1.914602-0.004817*T)*Math.sin(toRad(M))+0.019993*Math.sin(2*toRad(M));
  const sunL=L0+C;
  const sinDec=Math.sin(toRad(23.4393))*Math.sin(toRad(sunL));
  const dec=Math.asin(sinDec);
  const cosHA=(Math.sin(toRad(-0.8333))-Math.sin(toRad(lat))*Math.sin(dec))/(Math.cos(toRad(lat))*Math.cos(dec));
  if(cosHA<-1||cosHA>1)return NaN;
  const ha=toDeg(Math.acos(cosHA));
  const e=0.016708634-0.000042037*T-0.0000001267*T*T;
  const eps0=23.4392911-(46.8150*T+0.00059*T*T-0.001813*T*T*T)/3600;
  const y=Math.pow(Math.tan(toRad(eps0)/2),2);
  const L0r=toRad(L0),Mr=toRad(M);
  const E=y*Math.sin(2*L0r)-2*e*Math.sin(Mr)+4*e*y*Math.sin(Mr)*Math.cos(2*L0r)-0.5*y*y*Math.sin(4*L0r)-1.25*e*e*Math.sin(2*Mr);
  const eot=toDeg(E)*4;
  const noon=12-lng/15-eot/60;
  return rising?noon-ha/15:noon+ha/15;
}

function fmtHours(h:number){
  const hh=Math.floor(((h%24)+24)%24), mm=Math.round((h-Math.floor(h))*60);
  return `${hh%12||12}:${String(mm).padStart(2,'0')} ${hh<12?'AM':'PM'}`;
}
function fmtDuration(mins:number){
  const h=Math.floor(mins/60), m=Math.round(mins%60);
  return `${h}h ${m}m`;
}

const sel=document.getElementById('ss-city') as HTMLSelectElement;
sel.innerHTML=LOCS.map(l=>`<option value="${l.name}">${l.name}</option>`).join('');

function applyHeaderLoc(loc:any){
  if(!loc||!loc.name)return;
  const norm=(s:string)=>s.trim().toLowerCase();
  let match=LOCS.find(l=>norm(l.name)===norm(loc.name));
  if(!match){
    match={name:loc.name,lat:loc.lat,lng:loc.lng,tz:loc.tzOffset};
    LOCS.unshift(match);
    sel.innerHTML=LOCS.map(l=>`<option value="${l.name}">${l.name}</option>`).join('');
  }
  sel.value=match.name;
}
if((window as any).__initLoc) applyHeaderLoc((window as any).__initLoc);
window.addEventListener('locationchange',(e:Event)=>{
  applyHeaderLoc((e as CustomEvent).detail);
  calculate();
});

function calculate(){
  const cityName=sel.value;
  const loc=LOCS.find(l=>l.name===cityName)||LOCS[0];
  const now=new Date();
  const y=now.getFullYear(), m=now.getMonth()+1, d=now.getDate();

  const jd=toJD(y,m,d,6-loc.tz);
  const srUTC=sunriseUTC(jd,loc.lat,loc.lng,true);
  const ssUTC=sunriseUTC(jd,loc.lat,loc.lng,false);
  const srLocal=srUTC+loc.tz, ssLocal=ssUTC+loc.tz;
  const dayMins=(ssLocal-srLocal)*60;

  const cards=document.getElementById('ss-cards');
  if(cards){
    cards.innerHTML=`
      <div class="card" style="padding:20px;">
        <p class="caption-mono" style="color:var(--color-mute);margin:0 0 6px;">SUNRISE</p>
        <p style="font-size:26px;font-weight:700;color:var(--color-ink);margin:0;font-family:var(--font-mono);">${fmtHours(srLocal)}</p>
      </div>
      <div class="card" style="padding:20px;">
        <p class="caption-mono" style="color:var(--color-mute);margin:0 0 6px;">SUNSET</p>
        <p style="font-size:26px;font-weight:700;color:var(--color-ink);margin:0;font-family:var(--font-mono);">${fmtHours(ssLocal)}</p>
      </div>
      <div class="card" style="padding:20px;">
        <p class="caption-mono" style="color:var(--color-mute);margin:0 0 6px;">DAY LENGTH</p>
        <p style="font-size:26px;font-weight:700;color:var(--color-ink);margin:0;font-family:var(--font-mono);">${fmtDuration(dayMins)}</p>
      </div>
    `;
  }

  const week=document.getElementById('ss-week');
  if(week){
    const days=[];
    for(let i=0;i<7;i++){
      const dt=new Date(y,m-1,d+i);
      const jdI=toJD(dt.getFullYear(),dt.getMonth()+1,dt.getDate(),6-loc.tz);
      const sr=sunriseUTC(jdI,loc.lat,loc.lng,true)+loc.tz;
      const ss=sunriseUTC(jdI,loc.lat,loc.lng,false)+loc.tz;
      days.push({label:i===0?'Today':dt.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}),sr,ss});
    }
    week.innerHTML=days.map(dy=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;background:${dy.label==='Today'?'var(--color-canvas-soft-2)':'transparent'};border:1px solid ${dy.label==='Today'?'var(--color-hairline)':'transparent'};">
        <span style="font-size:12px;font-weight:600;color:var(--color-ink);width:120px;">${dy.label}</span>
        <span style="flex:1;font-size:13px;color:var(--color-body-text);font-family:var(--font-mono);">${fmtHours(dy.sr)} – ${fmtHours(dy.ss)}</span>
      </div>
    `).join('');
  }
}

sel.addEventListener('change',calculate);
calculate();
</script>
```

- [ ] **Step 2: Run the build**

Run: `npm run build`
Expected: build succeeds; page count increases by 1.

- [ ] **Step 3: Manual live-update check**

Run `astro dev --background`, open `/sunrise-sunset` in a browser, use the header's location picker to switch city, and confirm the sunrise/sunset cards and 7-day table update without a page reload. Stop the dev server afterward (`astro dev stop`).

- [ ] **Step 4: Commit**

```bash
git add src/pages/sunrise-sunset.astro
git commit -m "feat: add live Sunrise & Sunset page"
```

---

## Task 5: Moonrise & Moonset page

**Files:**
- Create: `src/pages/moonrise-moonset.astro`

**Interfaces:**
- Consumes: `window.__initLoc`, `locationchange` event.
- Produces: a live page at `/moonrise-moonset` with today's moonrise/moonset and Moon illumination %, recomputed on `locationchange`, plus a 7-day-ahead table.

- [ ] **Step 1: Create the page**

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Moonrise & Moonset Times — PanchangPath" description="Today's moonrise, moonset, and Moon illumination percentage for your location, plus a 7-day forecast — computed live using precise astronomical formulas.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <p class="caption-mono" style="color:var(--color-mute);margin:0 0 8px;">चन्द्रोदय · चन्द्रास्त · Moonrise &amp; Moonset</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Moonrise &amp; Moonset Times</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:520px;">Live moonrise, moonset, and Moon illumination for your location — recalculated automatically when you change location.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <div style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:28px;">
        <div>
          <label style="font-size:11px;font-weight:500;color:var(--color-mute);display:block;margin-bottom:5px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:0.06em;">Location</label>
          <select id="ms-city" class="input" style="height:38px;min-width:180px;"></select>
        </div>
      </div>

      <div id="ms-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:40px;"></div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 14px;">Next 7 Days</h3>
      <div id="ms-week" style="display:flex;flex-direction:column;gap:6px;max-width:640px;"></div>
    </div>
  </section>
</Layout>

<script>
const LOCS = [
  {name:'New Delhi',lat:28.6139,lng:77.209,tz:5.5},
  {name:'Mumbai',lat:19.076,lng:72.8777,tz:5.5},
  {name:'Bengaluru',lat:12.9716,lng:77.5946,tz:5.5},
  {name:'Chennai',lat:13.0827,lng:80.2707,tz:5.5},
  {name:'Kolkata',lat:22.5726,lng:88.3639,tz:5.5},
  {name:'Hyderabad',lat:17.385,lng:78.4867,tz:5.5},
  {name:'Jaipur',lat:26.9124,lng:75.7873,tz:5.5},
  {name:'Varanasi',lat:25.3176,lng:82.9739,tz:5.5},
  {name:'Dubai',lat:25.2048,lng:55.2708,tz:4},
  {name:'Singapore',lat:1.3521,lng:103.8198,tz:8},
  {name:'New York',lat:40.7128,lng:-74.006,tz:-4},
  {name:'London',lat:51.5074,lng:-0.1278,tz:1},
  {name:'Toronto',lat:43.6532,lng:-79.3832,tz:-4},
];

function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
const n360=(a:number)=>((a%360)+360)%360;
const toRad=(d:number)=>d*Math.PI/180;
const toDeg=(r:number)=>r*180/Math.PI;

function sunLon(jd:number){
  const T=(jd-2451545)/36525;
  const L0=n360(280.46646+36000.76983*T+0.0003032*T*T);
  const M=n360(357.52911+35999.05029*T-0.0001537*T*T);
  const Mr=toRad(M);
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(Mr)+(0.019993-0.000101*T)*Math.sin(2*Mr)+0.000289*Math.sin(3*Mr);
  return n360(L0+C);
}

function moonLon(jd:number){
  const T=(jd-2451545)/36525;
  const Lm=n360(218.3164477+481267.88123421*T);
  const D=n360(297.8501921+445267.1114034*T);
  const M=n360(357.5291092+35999.0502909*T);
  const Mp=n360(134.9633964+477198.8675055*T);
  const F=n360(93.2720950+483202.0175233*T);
  const Dr=toRad(D),Mr=toRad(M),Mpr=toRad(Mp),Fr=toRad(F);
  const dL=6.288774*Math.sin(Mpr)+1.274027*Math.sin(2*Dr-Mpr)+0.658314*Math.sin(2*Dr)
    +0.213618*Math.sin(2*Mpr)-0.185116*Math.sin(Mr)-0.114332*Math.sin(2*Fr)
    +0.058793*Math.sin(2*Dr-2*Mpr)+0.057066*Math.sin(2*Dr-Mr-Mpr)+0.053322*Math.sin(2*Dr+Mpr)
    +0.045758*Math.sin(2*Dr-Mr)-0.040923*Math.sin(Mr-Mpr)-0.034720*Math.sin(Dr)
    -0.030383*Math.sin(Mr+Mpr)+0.015327*Math.sin(2*Dr-2*Fr)+0.010980*Math.sin(Mpr-2*Fr)
    +0.010675*Math.sin(4*Dr-Mpr)+0.010034*Math.sin(3*Mpr)+0.008548*Math.sin(4*Dr-2*Mpr)
    -0.007888*Math.sin(2*Dr+Mr-Mpr)-0.006766*Math.sin(2*Dr+Mr)-0.005163*Math.sin(Dr-Mpr)
    +0.004987*Math.sin(Dr+Mr)+0.004036*Math.sin(2*Dr-Mr+Mpr)+0.003994*Math.sin(2*Dr+2*Mpr)
    +0.003861*Math.sin(4*Dr)+0.003665*Math.sin(2*Dr-3*Mpr);
  return n360(Lm+dL);
}

function gmstDegrees(jd:number){
  const T=(jd-2451545)/36525;
  return n360(280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T);
}

function moonEquatorial(jd:number){
  const T=(jd-2451545)/36525;
  const lambda=moonLon(jd);
  const obliq=23.4392911-0.0130042*T;
  const lamR=toRad(lambda), epsR=toRad(obliq);
  const dec=Math.asin(Math.sin(epsR)*Math.sin(lamR));
  const ra=n360(toDeg(Math.atan2(Math.sin(lamR)*Math.cos(epsR),Math.cos(lamR))));
  return {ra, dec:toDeg(dec)};
}

function moonRiseSetUTC(jd0:number,lat:number,lng:number,rising:boolean,seedUTCHour:number){
  const h0=0.125;
  const latR=toRad(lat);
  let u=seedUTCHour;
  for(let i=0;i<6;i++){
    const jd=jd0+u/24;
    const {ra,dec}=moonEquatorial(jd);
    const decR=toRad(dec);
    const cosH0=(Math.sin(toRad(h0))-Math.sin(latR)*Math.sin(decR))/(Math.cos(latR)*Math.cos(decR));
    if(cosH0<-1||cosH0>1)return NaN;
    const H0=toDeg(Math.acos(cosH0));
    const lst=n360(gmstDegrees(jd)+lng);
    let H=((lst-ra+180)%360+360)%360-180;
    const target=rising?-H0:H0;
    let err=((H-target+180)%360+360)%360-180;
    const du=err/14.35;
    u-=du;
    if(Math.abs(du)<0.0005)break;
  }
  return u;
}

function sunriseUTC(jd:number,lat:number,lng:number,rising:boolean){
  const T=(jd-2451545)/36525;
  const M=n360(357.52911+35999.05029*T);
  const L0=n360(280.46646+36000.76983*T);
  const C=(1.914602-0.004817*T)*Math.sin(toRad(M))+0.019993*Math.sin(2*toRad(M));
  const sunL=L0+C;
  const sinDec=Math.sin(toRad(23.4393))*Math.sin(toRad(sunL));
  const dec=Math.asin(sinDec);
  const cosHA=(Math.sin(toRad(-0.8333))-Math.sin(toRad(lat))*Math.sin(dec))/(Math.cos(toRad(lat))*Math.cos(dec));
  if(cosHA<-1||cosHA>1)return NaN;
  const ha=toDeg(Math.acos(cosHA));
  const e=0.016708634-0.000042037*T-0.0000001267*T*T;
  const eps0=23.4392911-(46.8150*T+0.00059*T*T-0.001813*T*T*T)/3600;
  const y=Math.pow(Math.tan(toRad(eps0)/2),2);
  const L0r=toRad(L0),Mr=toRad(M);
  const E=y*Math.sin(2*L0r)-2*e*Math.sin(Mr)+4*e*y*Math.sin(Mr)*Math.cos(2*L0r)-0.5*y*y*Math.sin(4*L0r)-1.25*e*e*Math.sin(2*Mr);
  const eot=toDeg(E)*4;
  const noon=12-lng/15-eot/60;
  return rising?noon-ha/15:noon+ha/15;
}

function fmtHours(h:number){
  if(isNaN(h)) return '—';
  const hh=Math.floor(((h%24)+24)%24), mm=Math.round((h-Math.floor(h))*60);
  return `${hh%12||12}:${String(mm).padStart(2,'0')} ${hh<12?'AM':'PM'}`;
}

const sel=document.getElementById('ms-city') as HTMLSelectElement;
sel.innerHTML=LOCS.map(l=>`<option value="${l.name}">${l.name}</option>`).join('');

function applyHeaderLoc(loc:any){
  if(!loc||!loc.name)return;
  const norm=(s:string)=>s.trim().toLowerCase();
  let match=LOCS.find(l=>norm(l.name)===norm(loc.name));
  if(!match){
    match={name:loc.name,lat:loc.lat,lng:loc.lng,tz:loc.tzOffset};
    LOCS.unshift(match);
    sel.innerHTML=LOCS.map(l=>`<option value="${l.name}">${l.name}</option>`).join('');
  }
  sel.value=match.name;
}
if((window as any).__initLoc) applyHeaderLoc((window as any).__initLoc);
window.addEventListener('locationchange',(e:Event)=>{
  applyHeaderLoc((e as CustomEvent).detail);
  calculate();
});

function computeDay(y:number,m:number,d:number,loc:any){
  const jd=toJD(y,m,d,6-loc.tz);
  const jd0=jd-(6-loc.tz)/24;
  const srUTC=sunriseUTC(jd,loc.lat,loc.lng,true);
  const sunL=sunLon(jd), moonL=moonLon(jd);
  const elongation=n360(moonL-sunL);
  const moonAge=elongation/360*29.53;
  const moonriseSeedUTC=srUTC+moonAge*0.8;
  const moonsetSeedUTC=moonriseSeedUTC+12.42;
  const moonriseUTC=moonRiseSetUTC(jd0,loc.lat,loc.lng,true,moonriseSeedUTC);
  const moonsetUTC=moonRiseSetUTC(jd0,loc.lat,loc.lng,false,moonsetSeedUTC);
  const illumination=(1-Math.cos(toRad(elongation)))/2*100;
  return {
    moonrise: isNaN(moonriseUTC)?NaN:moonriseUTC+loc.tz,
    moonset: isNaN(moonsetUTC)?NaN:moonsetUTC+loc.tz,
    illumination,
  };
}

function calculate(){
  const cityName=sel.value;
  const loc=LOCS.find(l=>l.name===cityName)||LOCS[0];
  const now=new Date();
  const y=now.getFullYear(), m=now.getMonth()+1, d=now.getDate();
  const today=computeDay(y,m,d,loc);

  const cards=document.getElementById('ms-cards');
  if(cards){
    cards.innerHTML=`
      <div class="card" style="padding:20px;">
        <p class="caption-mono" style="color:var(--color-mute);margin:0 0 6px;">MOONRISE</p>
        <p style="font-size:26px;font-weight:700;color:var(--color-ink);margin:0;font-family:var(--font-mono);">${fmtHours(today.moonrise)}</p>
      </div>
      <div class="card" style="padding:20px;">
        <p class="caption-mono" style="color:var(--color-mute);margin:0 0 6px;">MOONSET</p>
        <p style="font-size:26px;font-weight:700;color:var(--color-ink);margin:0;font-family:var(--font-mono);">${fmtHours(today.moonset)}</p>
      </div>
      <div class="card" style="padding:20px;">
        <p class="caption-mono" style="color:var(--color-mute);margin:0 0 6px;">ILLUMINATION</p>
        <p style="font-size:26px;font-weight:700;color:var(--color-ink);margin:0;font-family:var(--font-mono);">${today.illumination.toFixed(0)}%</p>
      </div>
    `;
  }

  const week=document.getElementById('ms-week');
  if(week){
    const days=[];
    for(let i=0;i<7;i++){
      const dt=new Date(y,m-1,d+i);
      const day=computeDay(dt.getFullYear(),dt.getMonth()+1,dt.getDate(),loc);
      days.push({label:i===0?'Today':dt.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}),...day});
    }
    week.innerHTML=days.map(dy=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;background:${dy.label==='Today'?'var(--color-canvas-soft-2)':'transparent'};border:1px solid ${dy.label==='Today'?'var(--color-hairline)':'transparent'};">
        <span style="font-size:12px;font-weight:600;color:var(--color-ink);width:120px;">${dy.label}</span>
        <span style="flex:1;font-size:13px;color:var(--color-body-text);font-family:var(--font-mono);">${fmtHours(dy.moonrise)} – ${fmtHours(dy.moonset)}</span>
        <span style="font-size:12px;color:var(--color-mute);font-family:var(--font-mono);">${dy.illumination.toFixed(0)}%</span>
      </div>
    `).join('');
  }
}

sel.addEventListener('change',calculate);
calculate();
</script>
```

- [ ] **Step 2: Run the build**

Run: `npm run build`
Expected: build succeeds; page count increases by 1.

- [ ] **Step 3: Manual live-update check**

Run `astro dev --background`, open `/moonrise-moonset`, switch the header's location picker, confirm the cards and week table update live. Stop the dev server afterward.

- [ ] **Step 4: Commit**

```bash
git add src/pages/moonrise-moonset.astro
git commit -m "feat: add live Moonrise & Moonset page"
```

---

## Task 6: Planetary Positions page

**Files:**
- Create: `src/pages/planets/planetary-positions.astro`

**Interfaces:**
- Consumes: nothing external (date-live, not location-live — see note below).
- Produces: a live page at `/planets/planetary-positions` — a 9-row table (sign, nakshatra, degree, retrograde status) for all grahas, recomputed from `new Date()` on load, plus a short karakatva paragraph per graha.

**Note — deviation from the design doc:** the design doc says these pages should recompute "on `locationchange`" like the Sunrise/Sunset and Moonrise/Moonset pages. That doesn't apply here: graha ecliptic longitude (sign, nakshatra, degree, retrograde status) is geocentric and has no dependency on the observer's latitude/longitude anywhere else in this codebase either (compare `kundali.ts`'s `allTropicalLons`, which only takes `jd`, not `lat`/`lng` — only the separate Lagna/Ascendant calculation needs location, and this page doesn't show a Lagna). Wiring a `locationchange` listener here would be dead code that changes nothing. This deviation applies to Tasks 6–9 (all 4 Planets pages) and was intentional — flagged to the user when this plan was written.

- [ ] **Step 1: Create the page**

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Planetary Positions Today — PanchangPath" description="Live sidereal positions of all 9 Jyotish grahas — sign, nakshatra, degree, and retrograde status — for your location right now.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <p class="caption-mono" style="color:var(--color-mute);margin:0 0 8px;">ग्रह स्थिति · Planetary Positions</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Planetary Positions Today</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:520px;">Live sidereal (Lahiri) positions of all 9 grahas — updates automatically when you change location.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <div style="overflow-x:auto;margin-bottom:40px;">
        <table style="width:100%;border-collapse:collapse;min-width:640px;">
          <thead>
            <tr style="border-bottom:1px solid var(--color-hairline-strong);">
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Graha</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Sign</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Degree</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Nakshatra</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Motion</th>
            </tr>
          </thead>
          <tbody id="pp-rows"></tbody>
        </table>
      </div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 14px;">What Each Graha Signifies (Karakatva)</h3>
      <div id="pp-karakatva" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;"></div>
    </div>
  </section>
</Layout>

<style>
  #pp-rows tr { border-bottom: 1px solid var(--color-hairline); }
  #pp-rows td { padding: 10px 12px; font-size: 13px; color: var(--color-body-text); }
</style>

<script>
const LOCS = [
  {name:'New Delhi',lat:28.6139,lng:77.209,tz:5.5},
  {name:'Mumbai',lat:19.076,lng:72.8777,tz:5.5},
  {name:'Bengaluru',lat:12.9716,lng:77.5946,tz:5.5},
  {name:'Chennai',lat:13.0827,lng:80.2707,tz:5.5},
  {name:'Kolkata',lat:22.5726,lng:88.3639,tz:5.5},
  {name:'Dubai',lat:25.2048,lng:55.2708,tz:4},
  {name:'New York',lat:40.7128,lng:-74.006,tz:-4},
  {name:'London',lat:51.5074,lng:-0.1278,tz:1},
];

const n360=(a:number)=>((a%360)+360)%360;
const toR=(d:number)=>d*Math.PI/180;
const toD=(r:number)=>r*180/Math.PI;

function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
function ayanamsha(T:number){return 23.85+1.3612*T-0.000136*T*T;}
function sunLon(jd:number){
  const T=(jd-2451545)/36525;
  const L0=n360(280.46646+36000.76983*T+0.0003032*T*T);
  const M=n360(357.52911+35999.05029*T-0.0001537*T*T);
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(toR(M))+(0.019993-0.000101*T)*Math.sin(2*toR(M))+0.000289*Math.sin(3*toR(M));
  return n360(L0+C);
}
function moonLon(jd:number){
  const T=(jd-2451545)/36525;
  const Lm=n360(218.3164477+481267.88123421*T);
  const D=n360(297.8501921+445267.1114034*T);
  const M=n360(357.5291092+35999.0502909*T);
  const Mp=n360(134.9633964+477198.8675055*T);
  const F=n360(93.2720950+483202.0175233*T);
  const Dr=toR(D),Mr=toR(M),Mpr=toR(Mp),Fr=toR(F);
  const dL=6.288774*Math.sin(Mpr)+1.274027*Math.sin(2*Dr-Mpr)+0.658314*Math.sin(2*Dr)
    +0.213618*Math.sin(2*Mpr)-0.185116*Math.sin(Mr)-0.114332*Math.sin(2*Fr)
    +0.058793*Math.sin(2*Dr-2*Mpr)+0.057066*Math.sin(2*Dr-Mr-Mpr)+0.053322*Math.sin(2*Dr+Mpr)
    +0.045758*Math.sin(2*Dr-Mr)-0.040923*Math.sin(Mr-Mpr)-0.034720*Math.sin(Dr)
    -0.030383*Math.sin(Mr+Mpr)+0.015327*Math.sin(2*Dr-2*Fr)+0.010980*Math.sin(Mpr-2*Fr)
    +0.010675*Math.sin(4*Dr-Mpr)+0.010034*Math.sin(3*Mpr)+0.008548*Math.sin(4*Dr-2*Mpr)
    -0.007888*Math.sin(2*Dr+Mr-Mpr)-0.006766*Math.sin(2*Dr+Mr)-0.005163*Math.sin(Dr-Mpr)
    +0.004987*Math.sin(Dr+Mr)+0.004036*Math.sin(2*Dr-Mr+Mpr)+0.003994*Math.sin(2*Dr+2*Mpr)
    +0.003861*Math.sin(4*Dr)+0.003665*Math.sin(2*Dr-3*Mpr);
  return n360(Lm+dL);
}
function rahuLon(T:number){return n360(125.04452-1934.136261*T+0.0020708*T*T);}
function solveKepler(M:number,e:number){
  let E=M;
  for(let k=0;k<50;k++){const dE=(M-E+e*Math.sin(E))/(1-e*Math.cos(E));E+=dE;if(Math.abs(dE)<1e-10)break;}
  return E;
}
const ORB:Record<string,any>={
  mercury:{L:252.250906,Ld:149472.6746358,wp:77.456119,wpd:0.1588643,Om:48.330893,Omd:-0.1254229,i:7.004979,id:-0.005952,e:0.20563069,ed:0.00002527,a:0.38709831},
  venus:{L:181.979801,Ld:58517.815676,wp:131.563707,wpd:0.0036096,Om:76.67992,Omd:-0.278008,i:3.394662,id:-0.000857,e:0.00677323,ed:-0.00004938,a:0.72332102},
  earth:{L:100.464457,Ld:36000.7698278,wp:102.937348,wpd:0.3225557,Om:174.873174,Omd:-0.2410908,i:0,id:0.013055,e:0.01671022,ed:-0.00003804,a:1.00000018},
  mars:{L:355.432818,Ld:19140.2993313,wp:336.040768,wpd:0.4439016,Om:49.558093,Omd:-0.295025,i:1.849726,id:-0.008148,e:0.09341233,ed:0.00011902,a:1.52371243},
  jupiter:{L:34.351484,Ld:3034.9056746,wp:14.331309,wpd:0.2155402,Om:100.464441,Omd:0.1350208,i:1.30327,id:-0.001987,e:0.04839266,ed:-0.0001288,a:5.20248019},
  saturn:{L:50.077444,Ld:1222.1137943,wp:93.056787,wpd:0.5691095,Om:113.665524,Omd:-0.2566722,i:2.488878,id:0.002552,e:0.0541506,ed:-0.00036762,a:9.54149883},
};
function helioXY(el:any,T:number):[number,number]{
  const e=el.e+el.ed*T;
  const wp=n360(el.wp+el.wpd*T);
  const Om=n360(el.Om+el.Omd*T);
  const inc=el.i+el.id*T;
  const L=n360(el.L+el.Ld*T);
  const M=toR(n360(L-wp));
  const w=toR(n360(wp-Om));
  const Omega=toR(Om);
  const iR=toR(inc);
  const E=solveKepler(M,e);
  const nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));
  const r=el.a*(1-e*Math.cos(E));
  const arg=nu+w;
  const x=r*(Math.cos(Omega)*Math.cos(arg)-Math.sin(Omega)*Math.sin(arg)*Math.cos(iR));
  const y=r*(Math.sin(Omega)*Math.cos(arg)+Math.cos(Omega)*Math.sin(arg)*Math.cos(iR));
  return [x,y];
}

function allLons(jd:number){
  const T=(jd-2451545)/36525;
  const ay=ayanamsha(T);
  const [xE,yE]=helioXY(ORB.earth,T);
  const geo=(k:string)=>{const [xP,yP]=helioXY(ORB[k],T);return n360(toD(Math.atan2(yP-yE,xP-xE)));};
  const rahu=rahuLon(T);
  return {
    surya:sunLon(jd), chandra:moonLon(jd),
    mangal:geo('mars'), budha:geo('mercury'),
    guru:geo('jupiter'), shukra:geo('venus'), shani:geo('saturn'),
    rahu, ketu:n360(rahu+180), ay,
  };
}

const RASHI=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const NAKS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const GRAHAS=[
  {id:'surya',name:'Surya (Sun)',karak:'Soul, vitality, authority, leadership, and confidence.'},
  {id:'chandra',name:'Chandra (Moon)',karak:'Mind, emotions, mother, and intuition — brings emotional stability and clarity.'},
  {id:'mangal',name:'Mangal (Mars)',karak:'Courage, energy, and the drive to overcome obstacles.'},
  {id:'budha',name:'Budha (Mercury)',karak:'Intellect, communication, business acumen, and memory.'},
  {id:'guru',name:'Guru (Jupiter)',karak:'Wisdom, prosperity, good fortune, and spiritual growth.'},
  {id:'shukra',name:'Shukra (Venus)',karak:'Love, beauty, luxury, and material comforts.'},
  {id:'shani',name:'Shani (Saturn)',karak:'Discipline, longevity, career stability, and karmic lessons.'},
  {id:'rahu',name:'Rahu',karak:'Worldly ambition, obsession, and sudden unconventional gains.'},
  {id:'ketu',name:'Ketu',karak:'Detachment, spirituality, and past-life karma.'},
];

function fmtDeg(lon:number){
  const d=lon%30; const deg=Math.floor(d); const mn=Math.floor((d-deg)*60);
  return `${deg}°${String(mn).padStart(2,'0')}'`;
}
function nakInfo(sid:number){
  const idx=Math.floor(sid/(360/27))%27;
  return NAKS[idx];
}
function lonSpeed(lon0:number,lon1:number){
  let d=lon1-lon0;
  if(d>180)d-=360;
  if(d<-180)d+=360;
  return d;
}

function calculate(){
  const now=new Date();
  const jdNow=toJD(now.getFullYear(),now.getMonth()+1,now.getDate(),now.getUTCHours()+now.getUTCMinutes()/60);
  const lonsNow=allLons(jdNow);
  const lonsPrev=allLons(jdNow-1);

  const rows=document.getElementById('pp-rows');
  if(rows){
    rows.innerHTML=GRAHAS.map(g=>{
      const trop=(lonsNow as any)[g.id];
      const sid=n360(trop-lonsNow.ay);
      const sign=Math.floor(sid/30)%12;
      const tropPrev=(lonsPrev as any)[g.id];
      const speed=lonSpeed(tropPrev,trop);
      const isRetro=(g.id==='rahu'||g.id==='ketu')?true:(g.id!=='surya'&&g.id!=='chandra'&&speed<0);
      return `<tr>
        <td style="font-weight:600;color:var(--color-ink);">${g.name}</td>
        <td>${RASHI[sign]}</td>
        <td style="font-family:var(--font-mono);">${fmtDeg(sid)}</td>
        <td>${nakInfo(sid)}</td>
        <td>${isRetro?'<span style="color:#dc2626;font-weight:600;">Vakri (R)</span>':'<span style="color:#15803d;">Margi</span>'}</td>
      </tr>`;
    }).join('');
  }

  const karak=document.getElementById('pp-karakatva');
  if(karak){
    karak.innerHTML=GRAHAS.map(g=>`
      <div class="card" style="padding:14px;">
        <p style="font-size:13px;font-weight:600;color:var(--color-ink);margin:0 0 6px;">${g.name}</p>
        <p style="font-size:12px;color:var(--color-body-text);margin:0;line-height:1.5;">${g.karak}</p>
      </div>
    `).join('');
  }
}

calculate();
</script>
```

- [ ] **Step 2: Run the build**

Run: `npm run build`
Expected: build succeeds; page count increases by 1.

- [ ] **Step 3: Manual check**

Run `astro dev --background`, open `/planets/planetary-positions`, confirm all 9 rows render with plausible sign/nakshatra/degree values and at least one retrograde badge shows in red where applicable. Stop the dev server afterward.

- [ ] **Step 4: Commit**

```bash
git add src/pages/planets/planetary-positions.astro
git commit -m "feat: add live Planetary Positions page"
```

---

## Task 7: Rahu & Ketu page

**Files:**
- Create: `src/pages/planets/rahu-ketu.astro`

**Interfaces:**
- Consumes: nothing external (nodes' position doesn't depend on lat/lng, only date — this page is date-live but not location-live, matching that Rahu/Ketu longitude is a pure function of time).
- Produces: a live page at `/planets/rahu-ketu` with current node positions plus a 12-row Gochara (transit) table for all Moon-sign rashis.

**Classical Gochara ruleset (verify before hardcoding — see Step 1):** counting houses from the Moon sign, Rahu/Ketu (like Mars/Saturn) are favorable ("Upachaya") in houses 3, 6, 11 from the Moon sign; all other houses are challenging.

- [ ] **Step 1: Verify the ruleset against an independent source**

Use `WebFetch` against a reliable classical-astrology reference (e.g. search for "Rahu Ketu Gochara Upachaya houses 3 6 11 from Moon sign Vedic astrology") to confirm the 3/6/11-from-Moon "Upachaya" rule for Rahu/Ketu transits. This matches the ruleset already stated in the approved design doc (`docs/superpowers/specs/2026-07-08-skipped-audit-fixes-design.md`, "Classical Gochara ruleset" section) — the fetch is a confirmation step, not a discovery step. If a source contradicts it, stop and flag to the user before proceeding; otherwise continue with the ruleset as given below.

- [ ] **Step 2: Create the page**

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Rahu & Ketu Transit (Gochara) — PanchangPath" description="Live sidereal positions of Rahu and Ketu, plus the classical Gochara transit table across all 12 Moon-sign rashis.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <p class="caption-mono" style="color:var(--color-mute);margin:0 0 8px;">राहु केतु गोचर · Rahu &amp; Ketu Transit</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Rahu &amp; Ketu Transit (Gochara)</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:540px;">Live sidereal (Lahiri) positions of the lunar nodes, and the classical transit effect for each Moon-sign rashi.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <div id="rk-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:40px;"></div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 14px;">Gochara Effect by Moon Sign</h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;min-width:480px;">
          <thead>
            <tr style="border-bottom:1px solid var(--color-hairline-strong);">
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Moon Sign</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Rahu House</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Effect</th>
            </tr>
          </thead>
          <tbody id="rk-rows"></tbody>
        </table>
      </div>
    </div>
  </section>
</Layout>

<style>
  #rk-rows tr { border-bottom: 1px solid var(--color-hairline); }
  #rk-rows td { padding: 10px 12px; font-size: 13px; color: var(--color-body-text); }
</style>

<script>
const n360=(a:number)=>((a%360)+360)%360;
function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
function ayanamsha(T:number){return 23.85+1.3612*T-0.000136*T*T;}
function rahuLon(T:number){return n360(125.04452-1934.136261*T+0.0020708*T*T);}

const RASHI=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];

function fmtDeg(lon:number){
  const d=lon%30; const deg=Math.floor(d); const mn=Math.floor((d-deg)*60);
  return `${RASHI[Math.floor(lon/30)%12]} ${deg}°${String(mn).padStart(2,'0')}'`;
}

function houseFromMoon(moonSign:number,planetSign:number){
  return ((planetSign-moonSign+12)%12)+1;
}
function nodeGocharaLabel(house:number){
  return [3,6,11].includes(house) ? 'Favorable (Upachaya)' : 'Challenging';
}

function calculate(){
  const now=new Date();
  const jd=toJD(now.getFullYear(),now.getMonth()+1,now.getDate(),now.getUTCHours()+now.getUTCMinutes()/60);
  const T=(jd-2451545)/36525;
  const ay=ayanamsha(T);
  const rahuTrop=rahuLon(T);
  const rahuSid=n360(rahuTrop-ay);
  const ketuSid=n360(rahuSid+180);
  const rahuSign=Math.floor(rahuSid/30)%12;
  const ketuSign=Math.floor(ketuSid/30)%12;

  const cards=document.getElementById('rk-cards');
  if(cards){
    cards.innerHTML=`
      <div class="card" style="padding:20px;">
        <p class="caption-mono" style="color:var(--color-mute);margin:0 0 6px;">RAHU (North Node)</p>
        <p style="font-size:22px;font-weight:700;color:var(--color-ink);margin:0;">${fmtDeg(rahuSid)}</p>
      </div>
      <div class="card" style="padding:20px;">
        <p class="caption-mono" style="color:var(--color-mute);margin:0 0 6px;">KETU (South Node)</p>
        <p style="font-size:22px;font-weight:700;color:var(--color-ink);margin:0;">${fmtDeg(ketuSid)}</p>
      </div>
    `;
  }

  const rows=document.getElementById('rk-rows');
  if(rows){
    rows.innerHTML=RASHI.map((rashi,moonSign)=>{
      const house=houseFromMoon(moonSign,rahuSign);
      const label=nodeGocharaLabel(house);
      return `<tr>
        <td style="font-weight:600;color:var(--color-ink);">${rashi}</td>
        <td style="font-family:var(--font-mono);">${house}</td>
        <td style="color:${label.startsWith('Favorable')?'#15803d':'#b45309'};font-weight:600;">${label}</td>
      </tr>`;
    }).join('');
  }
}

calculate();
</script>
```

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: build succeeds; page count increases by 1.

- [ ] **Step 4: Manual check**

Run `astro dev --background`, open `/planets/rahu-ketu`, confirm Rahu and Ketu positions are exactly 180° apart (subtract the two displayed degree values) and the 12-row table shows exactly 3 "Favorable" rows. Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add src/pages/planets/rahu-ketu.astro
git commit -m "feat: add live Rahu & Ketu transit page"
```

---

## Task 8: Shani (Saturn) page

**Files:**
- Create: `src/pages/planets/shani.astro`

**Interfaces:**
- Consumes: nothing external (date-live, not location-live).
- Produces: a live page at `/planets/shani` with current Saturn position plus a 12-row Gochara table including Sade Sati / Kantaka Shani special states, and a link to `/jyotish/sadesati`.

**Classical Gochara ruleset:** counting houses from the Moon sign — houses 12, 1, 2 = **Sade Sati**; house 4 or 8 = **Kantaka Shani**; houses 3, 6, 11 = Favorable; all other houses = Challenging.

- [ ] **Step 1: Create the page**

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Shani (Saturn) Transit — PanchangPath" description="Live sidereal position of Saturn, plus the classical Sade Sati / Kantaka Shani Gochara table across all 12 Moon-sign rashis.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <p class="caption-mono" style="color:var(--color-mute);margin:0 0 8px;">शनि गोचर · Shani Transit</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Shani (Saturn) Transit</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:540px;">Live sidereal (Lahiri) position of Saturn, and the classical Sade Sati / Kantaka Shani transit table by Moon sign.</p>
      <a href="/jyotish/sadesati" style="display:inline-block;margin-top:14px;font-size:13px;color:var(--color-ink);text-decoration:underline;">→ Check your personal Shani Sadesati (uses your birth chart)</a>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <div id="sh-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:40px;"></div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 14px;">Gochara Effect by Moon Sign</h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;min-width:480px;">
          <thead>
            <tr style="border-bottom:1px solid var(--color-hairline-strong);">
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Moon Sign</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Saturn House</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Effect</th>
            </tr>
          </thead>
          <tbody id="sh-rows"></tbody>
        </table>
      </div>
    </div>
  </section>
</Layout>

<style>
  #sh-rows tr { border-bottom: 1px solid var(--color-hairline); }
  #sh-rows td { padding: 10px 12px; font-size: 13px; color: var(--color-body-text); }
</style>

<script>
const n360=(a:number)=>((a%360)+360)%360;
const toR=(d:number)=>d*Math.PI/180;
const toD=(r:number)=>r*180/Math.PI;
function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
function ayanamsha(T:number){return 23.85+1.3612*T-0.000136*T*T;}
function solveKepler(M:number,e:number){
  let E=M;
  for(let k=0;k<50;k++){const dE=(M-E+e*Math.sin(E))/(1-e*Math.cos(E));E+=dE;if(Math.abs(dE)<1e-10)break;}
  return E;
}
const ORB_EARTH={L:100.464457,Ld:36000.7698278,wp:102.937348,wpd:0.3225557,Om:174.873174,Omd:-0.2410908,i:0,id:0.013055,e:0.01671022,ed:-0.00003804,a:1.00000018};
const ORB_SATURN={L:50.077444,Ld:1222.1137943,wp:93.056787,wpd:0.5691095,Om:113.665524,Omd:-0.2566722,i:2.488878,id:0.002552,e:0.0541506,ed:-0.00036762,a:9.54149883};
function helioXY(el:any,T:number):[number,number]{
  const e=el.e+el.ed*T;
  const wp=n360(el.wp+el.wpd*T);
  const Om=n360(el.Om+el.Omd*T);
  const inc=el.i+el.id*T;
  const L=n360(el.L+el.Ld*T);
  const M=toR(n360(L-wp));
  const w=toR(n360(wp-Om));
  const Omega=toR(Om);
  const iR=toR(inc);
  const E=solveKepler(M,e);
  const nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));
  const r=el.a*(1-e*Math.cos(E));
  const arg=nu+w;
  const x=r*(Math.cos(Omega)*Math.cos(arg)-Math.sin(Omega)*Math.sin(arg)*Math.cos(iR));
  const y=r*(Math.sin(Omega)*Math.cos(arg)+Math.cos(Omega)*Math.sin(arg)*Math.cos(iR));
  return [x,y];
}
function saturnGeoLon(jd:number){
  const T=(jd-2451545)/36525;
  const [xE,yE]=helioXY(ORB_EARTH,T);
  const [xP,yP]=helioXY(ORB_SATURN,T);
  return n360(toD(Math.atan2(yP-yE,xP-xE)));
}

const RASHI=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];

function fmtDeg(lon:number){
  const d=lon%30; const deg=Math.floor(d); const mn=Math.floor((d-deg)*60);
  return `${RASHI[Math.floor(lon/30)%12]} ${deg}°${String(mn).padStart(2,'0')}'`;
}

function houseFromMoon(moonSign:number,planetSign:number){
  return ((planetSign-moonSign+12)%12)+1;
}
function shaniGocharaLabel(house:number){
  if([12,1,2].includes(house)) return 'Sade Sati';
  if(house===4||house===8) return 'Kantaka Shani';
  return [3,6,11].includes(house) ? 'Favorable (Upachaya)' : 'Challenging';
}

function calculate(){
  const now=new Date();
  const jd=toJD(now.getFullYear(),now.getMonth()+1,now.getDate(),now.getUTCHours()+now.getUTCMinutes()/60);
  const T=(jd-2451545)/36525;
  const ay=ayanamsha(T);
  const saturnTrop=saturnGeoLon(jd);
  const saturnSid=n360(saturnTrop-ay);
  const saturnSign=Math.floor(saturnSid/30)%12;

  const cards=document.getElementById('sh-cards');
  if(cards){
    cards.innerHTML=`
      <div class="card" style="padding:20px;">
        <p class="caption-mono" style="color:var(--color-mute);margin:0 0 6px;">SHANI (SATURN)</p>
        <p style="font-size:22px;font-weight:700;color:var(--color-ink);margin:0;">${fmtDeg(saturnSid)}</p>
      </div>
    `;
  }

  const rows=document.getElementById('sh-rows');
  if(rows){
    rows.innerHTML=RASHI.map((rashi,moonSign)=>{
      const house=houseFromMoon(moonSign,saturnSign);
      const label=shaniGocharaLabel(house);
      const color=label==='Favorable (Upachaya)'?'#15803d':label==='Sade Sati'?'#dc2626':label==='Kantaka Shani'?'#b45309':'#6b7280';
      return `<tr>
        <td style="font-weight:600;color:var(--color-ink);">${rashi}</td>
        <td style="font-family:var(--font-mono);">${house}</td>
        <td style="color:${color};font-weight:600;">${label}</td>
      </tr>`;
    }).join('');
  }
}

calculate();
</script>
```

- [ ] **Step 2: Run the build**

Run: `npm run build`
Expected: build succeeds; page count increases by 1.

- [ ] **Step 3: Manual check**

Run `astro dev --background`, open `/planets/shani`, confirm exactly 3 rows show "Sade Sati" (houses 12, 1, 2) and exactly 2 rows show "Kantaka Shani" (houses 4, 8), and the `/jyotish/sadesati` link works. Stop the dev server afterward.

- [ ] **Step 4: Commit**

```bash
git add src/pages/planets/shani.astro
git commit -m "feat: add live Shani (Saturn) transit page"
```

---

## Task 9: Gochara (combined transit) page

**Files:**
- Create: `src/pages/planets/gochara.astro`

**Interfaces:**
- Consumes: nothing external (date-live, not location-live).
- Produces: a live page at `/planets/gochara` — a 12-rashi × 5-planet (Mars, Jupiter, Saturn, Rahu, Ketu) grid, each cell a mechanically-derived label.

**Classical Gochara ruleset (Jupiter, the one new rule not yet used in Tasks 7–8):** counting houses from the Moon sign, Jupiter is favorable in houses 2, 5, 7, 9, 11; all other houses are neutral/challenging. Mars/Rahu/Ketu use the same 3/6/11 rule as Task 7; Saturn uses the same Sade Sati/Kantaka Shani/3-6-11 rule as Task 8.

- [ ] **Step 1: Verify the Jupiter ruleset against an independent source**

Use `WebFetch` (e.g. search for "Jupiter Guru Gochara favorable houses 2 5 7 9 11 from Moon sign Vedic astrology") to confirm the 2/5/7/9/11-from-Moon favorable rule for Jupiter transits, matching the design doc's stated ruleset. If a source contradicts it, stop and flag to the user; otherwise proceed.

- [ ] **Step 2: Create the page**

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Gochara — Planetary Transit Table — PanchangPath" description="Combined classical Gochara transit table for Mars, Jupiter, Saturn, Rahu, and Ketu across all 12 Moon-sign rashis, computed live.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <p class="caption-mono" style="color:var(--color-mute);margin:0 0 8px;">गोचर · Gochara</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Gochara — Combined Transit Table</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:560px;">The classical "slow-mover" transit effect — Mars, Jupiter, Saturn, Rahu, and Ketu — for each Moon-sign rashi, computed live from today's planetary positions.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;min-width:720px;">
          <thead>
            <tr style="border-bottom:1px solid var(--color-hairline-strong);">
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Moon Sign</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Mars</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Jupiter</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Saturn</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Rahu</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--color-mute);font-family:var(--font-mono);text-transform:uppercase;">Ketu</th>
            </tr>
          </thead>
          <tbody id="go-rows"></tbody>
        </table>
      </div>
    </div>
  </section>
</Layout>

<style>
  #go-rows tr { border-bottom: 1px solid var(--color-hairline); }
  #go-rows td { padding: 10px 12px; font-size: 12px; color: var(--color-body-text); }
</style>

<script>
const n360=(a:number)=>((a%360)+360)%360;
const toR=(d:number)=>d*Math.PI/180;
const toD=(r:number)=>r*180/Math.PI;
function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
function ayanamsha(T:number){return 23.85+1.3612*T-0.000136*T*T;}
function rahuLon(T:number){return n360(125.04452-1934.136261*T+0.0020708*T*T);}
function solveKepler(M:number,e:number){
  let E=M;
  for(let k=0;k<50;k++){const dE=(M-E+e*Math.sin(E))/(1-e*Math.cos(E));E+=dE;if(Math.abs(dE)<1e-10)break;}
  return E;
}
const ORB:Record<string,any>={
  earth:{L:100.464457,Ld:36000.7698278,wp:102.937348,wpd:0.3225557,Om:174.873174,Omd:-0.2410908,i:0,id:0.013055,e:0.01671022,ed:-0.00003804,a:1.00000018},
  mars:{L:355.432818,Ld:19140.2993313,wp:336.040768,wpd:0.4439016,Om:49.558093,Omd:-0.295025,i:1.849726,id:-0.008148,e:0.09341233,ed:0.00011902,a:1.52371243},
  jupiter:{L:34.351484,Ld:3034.9056746,wp:14.331309,wpd:0.2155402,Om:100.464441,Omd:0.1350208,i:1.30327,id:-0.001987,e:0.04839266,ed:-0.0001288,a:5.20248019},
  saturn:{L:50.077444,Ld:1222.1137943,wp:93.056787,wpd:0.5691095,Om:113.665524,Omd:-0.2566722,i:2.488878,id:0.002552,e:0.0541506,ed:-0.00036762,a:9.54149883},
};
function helioXY(el:any,T:number):[number,number]{
  const e=el.e+el.ed*T;
  const wp=n360(el.wp+el.wpd*T);
  const Om=n360(el.Om+el.Omd*T);
  const inc=el.i+el.id*T;
  const L=n360(el.L+el.Ld*T);
  const M=toR(n360(L-wp));
  const w=toR(n360(wp-Om));
  const Omega=toR(Om);
  const iR=toR(inc);
  const E=solveKepler(M,e);
  const nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));
  const r=el.a*(1-e*Math.cos(E));
  const arg=nu+w;
  const x=r*(Math.cos(Omega)*Math.cos(arg)-Math.sin(Omega)*Math.sin(arg)*Math.cos(iR));
  const y=r*(Math.sin(Omega)*Math.cos(arg)+Math.cos(Omega)*Math.sin(arg)*Math.cos(iR));
  return [x,y];
}
function geoLon(key:string,jd:number){
  const T=(jd-2451545)/36525;
  const [xE,yE]=helioXY(ORB.earth,T);
  const [xP,yP]=helioXY(ORB[key],T);
  return n360(toD(Math.atan2(yP-yE,xP-xE)));
}

const RASHI=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];

function houseFromMoon(moonSign:number,planetSign:number){
  return ((planetSign-moonSign+12)%12)+1;
}
function nodeOrMarsLabel(house:number){
  return [3,6,11].includes(house) ? 'Favorable' : 'Challenging';
}
function jupiterLabel(house:number){
  return [2,5,7,9,11].includes(house) ? 'Favorable' : 'Neutral';
}
function shaniLabel(house:number){
  if([12,1,2].includes(house)) return 'Sade Sati';
  if(house===4||house===8) return 'Kantaka';
  return [3,6,11].includes(house) ? 'Favorable' : 'Challenging';
}
function cellColor(label:string){
  if(label==='Favorable') return '#15803d';
  if(label==='Sade Sati') return '#dc2626';
  if(label==='Kantaka') return '#b45309';
  if(label==='Neutral') return '#6b7280';
  return '#92400e';
}

function calculate(){
  const now=new Date();
  const jd=toJD(now.getFullYear(),now.getMonth()+1,now.getDate(),now.getUTCHours()+now.getUTCMinutes()/60);
  const T=(jd-2451545)/36525;
  const ay=ayanamsha(T);

  const marsSign=Math.floor(n360(geoLon('mars',jd)-ay)/30)%12;
  const jupiterSign=Math.floor(n360(geoLon('jupiter',jd)-ay)/30)%12;
  const saturnSign=Math.floor(n360(geoLon('saturn',jd)-ay)/30)%12;
  const rahuSid=n360(rahuLon(T)-ay);
  const rahuSign=Math.floor(rahuSid/30)%12;
  const ketuSign=Math.floor(n360(rahuSid+180)/30)%12;

  const rows=document.getElementById('go-rows');
  if(rows){
    rows.innerHTML=RASHI.map((rashi,moonSign)=>{
      const mars=nodeOrMarsLabel(houseFromMoon(moonSign,marsSign));
      const jupiter=jupiterLabel(houseFromMoon(moonSign,jupiterSign));
      const saturn=shaniLabel(houseFromMoon(moonSign,saturnSign));
      const rahu=nodeOrMarsLabel(houseFromMoon(moonSign,rahuSign));
      const ketu=nodeOrMarsLabel(houseFromMoon(moonSign,ketuSign));
      const cell=(label:string)=>`<td style="color:${cellColor(label)};font-weight:600;">${label}</td>`;
      return `<tr>
        <td style="font-weight:600;color:var(--color-ink);">${rashi}</td>
        ${cell(mars)}${cell(jupiter)}${cell(saturn)}${cell(rahu)}${cell(ketu)}
      </tr>`;
    }).join('');
  }
}

calculate();
</script>
```

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: build succeeds; page count increases by 1.

- [ ] **Step 4: Manual check**

Run `astro dev --background`, open `/planets/gochara`, confirm the 12×5 grid renders with no blank cells and the Ketu column exactly matches the Rahu-Ketu page's Ketu sign (spot-check one row against `/planets/rahu-ketu`). Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add src/pages/planets/gochara.astro
git commit -m "feat: add live combined Gochara transit page"
```

---

## Task 10: Wire the 6 new pages into Header.astro

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: the 6 routes created in Tasks 4–9 (`/sunrise-sunset`, `/moonrise-moonset`, `/planets/planetary-positions`, `/planets/rahu-ketu`, `/planets/shani`, `/planets/gochara`).
- Produces: no new interface — this task only rewires existing nav markup.

- [ ] **Step 1: Fix the desktop dropdown**

In `src/components/Header.astro`, in the "Panchang" dropdown (around line 108-118):

Replace:
```astro
            <a href="/" class="dd-link">Sunrise &amp; Sunset</a>
            <a href="/" class="dd-link">Moonrise &amp; Moonset</a>
```
with:
```astro
            <a href="/sunrise-sunset" class="dd-link">Sunrise &amp; Sunset</a>
            <a href="/moonrise-moonset" class="dd-link">Moonrise &amp; Moonset</a>
```

In the "Planets" dropdown (around line 190-198):

Replace:
```astro
        <li class="nav-item has-dropdown">
          <a href="/" class="nav-cat">Planets <span class="nav-caret">▾</span></a>
          <div class="nav-dropdown">
            <a href="/" class="dd-link">Planetary Positions</a>
            <a href="/" class="dd-link">Rahu &amp; Ketu</a>
            <a href="/" class="dd-link">Shani (Saturn)</a>
            <a href="/" class="dd-link">Gochara</a>
          </div>
        </li>
```
with:
```astro
        <li class="nav-item has-dropdown">
          <a href="/planets/planetary-positions" class="nav-cat">Planets <span class="nav-caret">▾</span></a>
          <div class="nav-dropdown">
            <a href="/planets/planetary-positions" class="dd-link">Planetary Positions</a>
            <a href="/planets/rahu-ketu" class="dd-link">Rahu &amp; Ketu</a>
            <a href="/planets/shani" class="dd-link">Shani (Saturn)</a>
            <a href="/planets/gochara" class="dd-link">Gochara</a>
          </div>
        </li>
```

- [ ] **Step 2: Fix the mobile drawer**

In the "Panchang" drawer section (around line 265-273):

Replace:
```astro
          <a href="/" class="drawer-link">Sunrise &amp; Sunset</a>
          <a href="/" class="drawer-link">Moonrise &amp; Moonset</a>
```
with:
```astro
          <a href="/sunrise-sunset" class="drawer-link">Sunrise &amp; Sunset</a>
          <a href="/moonrise-moonset" class="drawer-link">Moonrise &amp; Moonset</a>
```

In the "Planets" drawer section (around line 358-363):

Replace:
```astro
        <div class="drawer-sub" id="m-planets">
          <a href="/" class="drawer-link">Planetary Positions</a>
          <a href="/" class="drawer-link">Rahu &amp; Ketu</a>
          <a href="/" class="drawer-link">Shani (Saturn)</a>
          <a href="/" class="drawer-link">Gochara</a>
        </div>
```
with:
```astro
        <div class="drawer-sub" id="m-planets">
          <a href="/planets/planetary-positions" class="drawer-link">Planetary Positions</a>
          <a href="/planets/rahu-ketu" class="drawer-link">Rahu &amp; Ketu</a>
          <a href="/planets/shani" class="drawer-link">Shani (Saturn)</a>
          <a href="/planets/gochara" class="drawer-link">Gochara</a>
        </div>
```

- [ ] **Step 3: Fix `searchItems`**

In the `searchItems` array (around line 1132-1155), replace:
```astro
    { label: "Sunrise & Sunset", url: "/" },
    { label: "Planetary Events", url: "/events" },
```
with:
```astro
    { label: "Sunrise & Sunset", url: "/sunrise-sunset" },
    { label: "Moonrise & Moonset", url: "/moonrise-moonset" },
    { label: "Planetary Positions", url: "/planets/planetary-positions" },
    { label: "Rahu & Ketu Transit", url: "/planets/rahu-ketu" },
    { label: "Shani (Saturn) Transit", url: "/planets/shani" },
    { label: "Gochara", url: "/planets/gochara" },
    { label: "Planetary Events", url: "/events" },
```

- [ ] **Step 4: Verify no `href="/"` placeholders remain for these 6 labels**

Run:
```bash
grep -n 'href="/"' src/components/Header.astro
```
Expected: the only remaining `href="/"` matches are the logo links (`class="logo-link"`), the clock widget, and the status strip (all intentionally point home) — none of the 6 "Sunrise & Sunset" / "Moonrise & Moonset" / "Planetary Positions" / "Rahu & Ketu" / "Shani (Saturn)" / "Gochara" lines should appear in the output.

- [ ] **Step 5: Run the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/Header.astro
git commit -m "fix: wire Sunrise/Sunset, Moonrise/Moonset, and 4 Planets pages into Header nav"
```

---

## Task 11: Verify and fix the Raksha Bandhan 2026 date

**Files:**
- Modify: `src/lib/festivals.ts:59` (conditionally)

**Interfaces:**
- Consumes: nothing.
- Produces: a verified `date` field for the Raksha Bandhan 2026 entry.

- [ ] **Step 1: Verify the date via WebFetch**

Use `WebFetch` against a reliable Hindu-panchang reference to determine Raksha Bandhan's 2026 date, accounting for Bhadra timing rules (the reason the original site audit flagged this — Raksha Bandhan is skipped during Bhadra Kaal, which can push the observed date). Record which source URL was used and what date it reports.

- [ ] **Step 2: Update the entry if needed**

Current line 59:
```ts
  { date: '2026-08-27', name: 'Raksha Bandhan',           nameHi: 'रक्षा बंधन',            type: 'major',    description: 'Sisters tie rakhi on brothers\' wrists, brothers vow to protect them.' },
```

If the source confirms `2026-08-28` (as the original audit suspected), change the `date` field to `'2026-08-28'`. If the source confirms `2026-08-27`, leave the line unchanged. Either way, add a trailing comment recording the source:

If changed:
```ts
  { date: '2026-08-28', name: 'Raksha Bandhan',           nameHi: 'रक्षा बंधन',            type: 'major',    description: 'Sisters tie rakhi on brothers\' wrists, brothers vow to protect them.' }, // verified against <source URL> — Bhadra Kaal pushes observance to 08-28
```

If unchanged:
```ts
  { date: '2026-08-27', name: 'Raksha Bandhan',           nameHi: 'रक्षा बंधन',            type: 'major',    description: 'Sisters tie rakhi on brothers\' wrists, brothers vow to protect them.' }, // verified against <source URL> — confirmed 08-27
```

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: build succeeds; `/festivals/raksha-bandhan-2026` (or the updated slug, since the slug function includes the year but not the date — confirm the slug is unaffected by a date-only change) still resolves.

- [ ] **Step 4: Commit**

```bash
git add src/lib/festivals.ts
git commit -m "fix: verify Raksha Bandhan 2026 date against Bhadra Kaal timing rules"
```

---

## Task 12: Add verified 2027 festival data

**Files:**
- Modify: `src/lib/festivals.ts` (rename export, add 2027 block)

**Interfaces:**
- Consumes: nothing.
- Produces: `FESTIVALS_2025_2027` (renamed from `FESTIVALS_2025_2026`) — same `Festival[]` shape, now covering 2025–2027.

- [ ] **Step 1: Rename the export and its usages**

In `src/lib/festivals.ts`, rename `FESTIVALS_2025_2026` to `FESTIVALS_2025_2027` at its declaration (line 10) and at both internal usages (lines 173, 181).

Run to find any other import sites:
```bash
grep -rn "FESTIVALS_2025_2026" src/
```
Expected after the rename within `festivals.ts`: no remaining matches anywhere in `src/` (if any other file imports it, rename there too, matching whatever import syntax that file uses).

- [ ] **Step 2: Verify each 2027 festival date via WebFetch**

Use `WebFetch` against a reliable Hindu-panchang reference (e.g. drikpanchang.com's 2027 festival calendar) to get verified 2027 dates for the following festivals, mirroring the existing 2026 list. Do **not** compute dates from this site's own Tithi engine — the original skip reason for this item was specifically that self-computed dates produced an astronomically-impossible result (two consecutive leap months in the same year-over-year comparison).

Festival list to verify (name — `type` — carry forward `description`/`nameHi` unchanged from the matching 2026 entry unless the source's copy differs meaningfully):
Makar Sankranti, Basant Panchami, Jaya Ekadashi, Maha Shivaratri, Holika Dahan, Holi, Ugadi / Gudi Padwa, Ram Navami, Hanuman Jayanti, Akshaya Tritiya, Buddha Purnima, Nirjala Ekadashi, Guru Purnima, Raksha Bandhan, Krishna Janmashtami, Ganesh Chaturthi, Navratri Begins, Maha Navami, Vijayadashami / Dussehra, Karwa Chauth, Dhanteras, Narak Chaturdashi, Diwali, Govardhan Puja, Bhai Dooj, Chhath Puja, Dev Uthani Ekadashi, Christmas.

`Makar Sankranti 2027-01-15` is already independently verified (from the original site audit) — use it as a sanity check: your WebFetched source should agree with this date. If it doesn't, treat that source as unreliable and try another before proceeding.

- [ ] **Step 3: Append the 2027 block**

Add a new `// ── 2027 ──...` section to the end of the `FESTIVALS_2025_2027` array (after the last 2026 entry, before the closing `];`), following the exact per-entry shape used elsewhere in the file:

```ts
export interface Festival {
  date: string; // YYYY-MM-DD
  name: string;
  nameHi: string;
  type: 'major' | 'vrat' | 'regional';
  description: string;
  longDesc?: string;
}
```

Each entry: `{ date: 'YYYY-MM-DD', name: '...', nameHi: '...', type: 'major'|'vrat'|'regional', description: '...' }` — use the `description`/`nameHi`/`type` values from the matching 2026 entry (they are date-independent), only the `date` field changes per the WebFetch-verified 2027 date. Add a trailing comment on the block recording the source URL, matching the existing convention (see the `// Narak Chaturdashi date is lower-confidence...` comment above the 2026 Dhanteras entry for the pattern).

- [ ] **Step 4: Sanity-check chronological ordering and spacing**

Run:
```bash
node -e "
const { FESTIVALS_2025_2027 } = require('./src/lib/festivals.ts');
" 2>&1 | head -5
```
This will fail (TS can't be required directly this way) — instead run:
```bash
node --experimental-strip-types -e "
import { FESTIVALS_2025_2027 } from './src/lib/festivals.ts';
const y2027 = FESTIVALS_2025_2027.filter(f => f.date.startsWith('2027'));
console.log('2027 entry count:', y2027.length);
console.log('dates in order:', y2027.every((f,i) => i===0 || f.date >= y2027[i-1].date));
const diwali26 = FESTIVALS_2025_2027.find(f => f.date === '2026-11-08' && f.name === 'Diwali');
const diwali27 = y2027.find(f => f.name === 'Diwali');
console.log('Diwali 2026:', diwali26?.date, '  Diwali 2027:', diwali27?.date);
"
```
Expected: `2027 entry count` matches the 28-festival list from Step 2, `dates in order: true`, and the Diwali 2026→2027 gap is roughly 354 or 384 days (one lunar year, accounting for whether a leap month falls in between) — not two consecutive short/long gaps that would imply an impossible double leap-month, which is what sank the original attempt.

- [ ] **Step 5: Run the build**

Run: `npm run build`
Expected: build succeeds; festival detail pages for 2027 entries are generated (`getStaticPaths` in `src/pages/festivals/[slug].astro` iterates the full array).

- [ ] **Step 6: Commit**

```bash
git add src/lib/festivals.ts
git commit -m "feat: add verified 2027 festival data, rename FESTIVALS_2025_2026 to FESTIVALS_2025_2027"
```

---

## Final verification (after all 12 tasks)

- [ ] Run `npm run build` one final time and confirm total page count is baseline + 7 (6 new pages + no page-count change from data-only tasks 11–12, though 12 adds ~28 new `/festivals/[slug]` pages so the real total increase is +6 nav pages +~28 festival detail pages).
- [ ] Run `node_modules/.bin/astro check` — expect the pre-existing large noise count (per `CLAUDE.md`), not a new spike concentrated in the 6 new files (spot check: `astro check 2>&1 | grep -c "planets/"` should be low/proportionate to file count, not disproportionately high).
- [ ] Update `CLAUDE.md`'s "Known Issues" section: remove the now-fixed items (Planets menu, Sunrise & Sunset, Moonrise & Moonset placeholders; Moon-formula propagation note in "Orbital mechanics" section can be updated to state all files are now on the 26-term formula) and update Raksha Bandhan / 2027-festival-data entries to reflect what was found.
