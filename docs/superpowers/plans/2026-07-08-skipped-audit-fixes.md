# Clearing Skipped Site-Audit Items — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Progress (updated 2026-07-09)

**Tasks 1-3 complete and task-reviewed clean.** Tasks 4-13 not yet started.

**See `docs/superpowers/plans/2026-07-09-skipped-audit-fixes-status.md` (same directory) for the full, git-committed task status table, the resume prompt, and pre-flight decisions.** That file is the durable source of truth — this section is a pointer to it, kept brief so it doesn't drift out of sync.

Quick facts: executing via superpowers:subagent-driven-development in worktree `C:\Users\kanis\Desktop\AI Side Hustles\Panchang Path\.claude\worktrees\skipped-audit-fixes` (branch `worktree-skipped-audit-fixes`), not yet merged to `master`. Commits `553d3ca`, `dc98893`, `a405848` are Tasks 1, 2, 3 respectively (`git log` is authoritative if the ledger is ever lost).

---

**Goal:** Clear the last 5 `⏭️ SKIPPED` items from the site's two audit fix-prompt docs (4 new nav pages + 2 festival-data fixes), plus propagate a newly-discovered Moon-longitude formula drift fix to 17 files that still use a stale, less-precise version.

**Architecture:** New pages follow the site's established "static Astro page + inline `<script>` duplicating real astronomical formulas" pattern (client scripts cannot import server TS modules — see CLAUDE.md gotchas). Sunrise/Sunset and Moonrise/Moonset pages are location-dependent and reuse the `LOCS` array + `locationchange` event pattern already used by `muhurta/rahu-kala.astro`. The four Planets pages are **not** location-dependent (geocentric planetary longitude doesn't depend on the observer's lat/lng — only rise/set times and Lagna do), so instead they self-refresh on a timer using the real current instant (`new Date()`).

**Tech Stack:** Astro v7 static pages, inline TypeScript/JS `<script>` blocks, no new dependencies.

## Global Constraints

- Client-side `<script>` blocks cannot import from `src/lib/*.ts` — every formula must be duplicated inline (CLAUDE.md gotcha).
- Apostrophes inside single-quoted TS/JS strings must be escaped with `\'` or use template literals (CLAUDE.md gotcha).
- All 3 nav-sync locations (desktop dropdown, mobile drawer, `searchItems` array) must be updated together whenever a page is added (CLAUDE.md convention).
- New pages must compute from the real current date/time and real formulas already verified elsewhere on the site — no static/canned output (this is the whole point of the work; see `docs/superpowers/specs/2026-07-08-skipped-audit-fixes-design.md`).
- The classical Gochara ruleset (Tasks 7-9) is fixed and already cross-verified — do not invent or adjust it: **Mars/Rahu/Ketu/Saturn favorable = houses 3, 6, 11 from Moon sign; Jupiter favorable = houses 2, 5, 7, 9, 11; Saturn's Sade Sati = houses 12, 1, 2; Saturn's Ashtam Shani = house 8.**
- `npm run build` must pass after every task (345+ pages currently, expect +6).

---

## Task 1: Propagate 26-term Moon formula to `src/lib/kundali.ts`

**Files:**
- Modify: `src/lib/kundali.ts:137-151`
- Test: scratchpad verification script (not committed)

**Interfaces:**
- Consumes: nothing new (pure internal formula fix)
- Produces: `moonLon(jd: number): number` — now returns the same value as `src/lib/panchang.ts`'s `moonLongitude(jd)` for any `jd`, within floating-point rounding. Tasks 6-9 (new Planets pages) will duplicate this exact 26-term formula inline.

- [x] **Step 1: Write a verification script comparing old vs. new formula against the canonical `panchang.ts` output**

Create `C:\Users\kanis\AppData\Local\Temp\claude\C--Users-kanis-Desktop-AI-Side-Hustles-Panchang-Path\c61fb34a-c817-43e4-8599-5778d09ad502\scratchpad\verify-moon-formula.mjs`:

```js
const n360 = a => ((a % 360) + 360) % 360;
const toR = d => d * Math.PI / 180;

function moonLon_canonical(jd) {
  const T = (jd - 2451545.0) / 36525;
  const L = n360(218.3164477 + 481267.88123421 * T);
  const D = n360(297.8501921 + 445267.1114034 * T);
  const M = n360(357.5291092 + 35999.0502909 * T);
  const Mp = n360(134.9633964 + 477198.8675055 * T);
  const F = n360(93.2720950 + 483202.0175233 * T);
  const Dr = toR(D), Mr = toR(M), Mpr = toR(Mp), Fr = toR(F);
  const dL = 6.288774 * Math.sin(Mpr) + 1.274027 * Math.sin(2 * Dr - Mpr) + 0.658314 * Math.sin(2 * Dr)
    + 0.213618 * Math.sin(2 * Mpr) - 0.185116 * Math.sin(Mr) - 0.114332 * Math.sin(2 * Fr)
    + 0.058793 * Math.sin(2 * Dr - 2 * Mpr) + 0.057066 * Math.sin(2 * Dr - Mr - Mpr) + 0.053322 * Math.sin(2 * Dr + Mpr)
    + 0.045758 * Math.sin(2 * Dr - Mr) - 0.040923 * Math.sin(Mr - Mpr) - 0.034720 * Math.sin(Dr)
    - 0.030383 * Math.sin(Mr + Mpr) + 0.015327 * Math.sin(2 * Dr - 2 * Fr) + 0.010980 * Math.sin(Mpr - 2 * Fr)
    + 0.010675 * Math.sin(4 * Dr - Mpr) + 0.010034 * Math.sin(3 * Mpr) + 0.008548 * Math.sin(4 * Dr - 2 * Mpr)
    - 0.007888 * Math.sin(2 * Dr + Mr - Mpr) - 0.006766 * Math.sin(2 * Dr + Mr) - 0.005163 * Math.sin(Dr - Mpr)
    + 0.004987 * Math.sin(Dr + Mr) + 0.004036 * Math.sin(2 * Dr - Mr + Mpr) + 0.003994 * Math.sin(2 * Dr + 2 * Mpr)
    + 0.003861 * Math.sin(4 * Dr) + 0.003665 * Math.sin(2 * Dr - 3 * Mpr);
  return n360(L + dL);
}

function moonLon_old15term(jd) {
  const T = (jd - 2451545.0) / 36525;
  const L = n360(218.3164477 + 481267.88123421 * T);
  const D = n360(297.8501921 + 445267.1114034 * T);
  const M = n360(357.5291092 + 35999.0502909 * T);
  const Mp = n360(134.9633964 + 477198.8675055 * T);
  const F = n360(93.2720950 + 483202.0175233 * T);
  const Dr = toR(D), Mr = toR(M), Mpr = toR(Mp), Fr = toR(F);
  const dL = 6.288774 * Math.sin(Mpr) + 1.274027 * Math.sin(2 * Dr - Mpr) + 0.658314 * Math.sin(2 * Dr)
    + 0.213618 * Math.sin(2 * Mpr) - 0.185116 * Math.sin(Mr) - 0.114332 * Math.sin(2 * Fr)
    + 0.058793 * Math.sin(2 * Dr - 2 * Mpr) + 0.057066 * Math.sin(2 * Dr - Mr - Mpr) + 0.053322 * Math.sin(2 * Dr + Mpr)
    + 0.045758 * Math.sin(2 * Dr - Mr) - 0.040923 * Math.sin(Mr - Mpr) - 0.034720 * Math.sin(Dr)
    - 0.030383 * Math.sin(Mr + Mpr) + 0.015327 * Math.sin(2 * Dr - 2 * Fr) + 0.010034 * Math.sin(3 * Mpr);
  return n360(L + dL);
}

// Julian Day for 2026-11-15 12:00 UTC (near a lunar perigee window — where the higher-order terms matter most)
function toJD(y, m, d, h) { if (m <= 2) { y--; m += 12; } const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + h / 24 + B - 1524.5; }
const jd = toJD(2026, 11, 15, 12);

const canonical = moonLon_canonical(jd);
const old15 = moonLon_old15term(jd);
console.log('Canonical (26-term):', canonical.toFixed(6));
console.log('Old (15-term):      ', old15.toFixed(6));
console.log('Difference (deg):   ', Math.abs(canonical - old15).toFixed(6));
if (Math.abs(canonical - old15) < 1e-9) throw new Error('FAIL: old and new formulas should differ, but do not');
console.log('PASS: old and new formulas differ as expected, confirming the 11 extra terms have a measurable effect');
```

- [x] **Step 2: Run the verification script to confirm the old and new formulas currently differ**

Run: `node "C:\Users\kanis\AppData\Local\Temp\claude\C--Users-kanis-Desktop-AI-Side-Hustles-Panchang-Path\c61fb34a-c817-43e4-8599-5778d09ad502\scratchpad\verify-moon-formula.mjs"`
Expected output ends with: `PASS: old and new formulas differ as expected, confirming the 11 extra terms have a measurable effect`

- [x] **Step 3: Replace `kundali.ts`'s 15-term `dL` sum with the canonical 26-term version**

In `src/lib/kundali.ts`, replace this exact block (lines 137-151):

```typescript
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
    -0.030383*Math.sin(Mr+Mpr)+0.015327*Math.sin(2*Dr-2*Fr)+0.010034*Math.sin(3*Mpr);
  return n360(Lm + dL);
}
```

with:

```typescript
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

- [x] **Step 4: Run `npm run build` to confirm no TypeScript/build errors**

Run: `npm run build`
Expected: build completes successfully (same page count as before, ~345+ pages)

- [x] **Step 5: Commit**

```bash
git add src/lib/kundali.ts
git commit -m "$(cat <<'EOF'
Propagate canonical 26-term Moon formula to kundali.ts

kundali.ts was still on the 15-term dL correction sum from before
panchang.ts's canonical moonLongitude() was later extended to 26 terms
(during the moonrise/moonset truthfulness-audit fix). This brings
kundali.ts's moonLon() back in sync so the new Planets pages (which
build on this file's math) use the most accurate available formula.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Propagate the same fix to `KundaliWidget.astro`

**Files:**
- Modify: `src/components/KundaliWidget.astro:483-497`

**Interfaces:**
- Consumes: nothing new
- Produces: `moonLon_K(jd: number): number` now matches the canonical formula.

- [x] **Step 1: Replace the 15-term `dL` sum**

In `src/components/KundaliWidget.astro`, replace this exact block:

```typescript
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

```typescript
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

- [x] **Step 2: Run `npm run build` to confirm no errors**

Run: `npm run build`
Expected: build completes successfully

- [x] **Step 3: Commit**

```bash
git add src/components/KundaliWidget.astro
git commit -m "$(cat <<'EOF'
Propagate canonical 26-term Moon formula to KundaliWidget.astro

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Propagate the same fix to all 15 `jyotish/*.astro` pages

**Files:**
- Modify: `src/pages/jyotish/kundali.astro`, `janma-kundali.astro`, `lagna.astro`, `horoscope-match.astro`, `rashi.astro`, `baby-names.astro`, `shraddha.astro`, `sahasra-chandrodaya.astro`, `kalasarpa.astro`, `sadesati.astro`, `mangal-dosha.astro`, `nakshatra.astro`, `pancha-pakshi.astro`, `gemstone.astro`, `rudraksha.astro`

**Interfaces:**
- Consumes: nothing new
- Produces: each file's `moonLon(jd)` now matches the canonical formula. Verified byte-identical across all 15 files before this fix (confirmed via direct read of `kundali.astro`, `janma-kundali.astro`, `lagna.astro`, `pancha-pakshi.astro`).

- [x] **Step 1: Apply the identical one-line replacement to each of the 15 files**

Every one of the 15 files contains this exact single-line minified function (confirm with a read of the target line before editing — line numbers noted below from the original audit, but re-locate via search for `function moonLon(jd){const T=` since line numbers can drift):

Old (in each file):
```
function moonLon(jd){const T=(jd-2451545)/36525;const Lm=n360(218.3164477+481267.88123421*T);const D=n360(297.8501921+445267.1114034*T);const M=n360(357.5291092+35999.0502909*T);const Mp=n360(134.9633964+477198.8675055*T);const F=n360(93.2720950+483202.0175233*T);const dL=6.288774*Math.sin(toR(Mp))+1.274027*Math.sin(toR(2*D-Mp))+0.658314*Math.sin(toR(2*D))+0.213618*Math.sin(toR(2*Mp))-0.185116*Math.sin(toR(M))-0.114332*Math.sin(toR(2*F))+0.058793*Math.sin(toR(2*D-2*Mp))+0.057066*Math.sin(toR(2*D-M-Mp))+0.053322*Math.sin(toR(2*D+Mp))+0.045758*Math.sin(toR(2*D-M))-0.040923*Math.sin(toR(M-Mp))-0.034720*Math.sin(toR(D))-0.030383*Math.sin(toR(M+Mp))+0.015327*Math.sin(toR(2*D-2*F))+0.010034*Math.sin(toR(3*Mp));return n360(Lm+dL);}
```

New (in each file):
```
function moonLon(jd){const T=(jd-2451545)/36525;const Lm=n360(218.3164477+481267.88123421*T);const D=n360(297.8501921+445267.1114034*T);const M=n360(357.5291092+35999.0502909*T);const Mp=n360(134.9633964+477198.8675055*T);const F=n360(93.2720950+483202.0175233*T);const dL=6.288774*Math.sin(toR(Mp))+1.274027*Math.sin(toR(2*D-Mp))+0.658314*Math.sin(toR(2*D))+0.213618*Math.sin(toR(2*Mp))-0.185116*Math.sin(toR(M))-0.114332*Math.sin(toR(2*F))+0.058793*Math.sin(toR(2*D-2*Mp))+0.057066*Math.sin(toR(2*D-M-Mp))+0.053322*Math.sin(toR(2*D+Mp))+0.045758*Math.sin(toR(2*D-M))-0.040923*Math.sin(toR(M-Mp))-0.034720*Math.sin(toR(D))-0.030383*Math.sin(toR(M+Mp))+0.015327*Math.sin(toR(2*D-2*F))+0.010980*Math.sin(toR(Mp-2*F))+0.010675*Math.sin(toR(4*D-Mp))+0.010034*Math.sin(toR(3*Mp))+0.008548*Math.sin(toR(4*D-2*Mp))-0.007888*Math.sin(toR(2*D+M-Mp))-0.006766*Math.sin(toR(2*D+M))-0.005163*Math.sin(toR(D-Mp))+0.004987*Math.sin(toR(D+M))+0.004036*Math.sin(toR(2*D-M+Mp))+0.003994*Math.sin(toR(2*D+2*Mp))+0.003861*Math.sin(toR(4*D))+0.003665*Math.sin(toR(2*D-3*Mp));return n360(Lm+dL);}
```

Apply this exact replacement to each of these 15 files (one Edit operation per file):
1. `src/pages/jyotish/kundali.astro`
2. `src/pages/jyotish/janma-kundali.astro`
3. `src/pages/jyotish/lagna.astro`
4. `src/pages/jyotish/horoscope-match.astro`
5. `src/pages/jyotish/rashi.astro`
6. `src/pages/jyotish/baby-names.astro`
7. `src/pages/jyotish/shraddha.astro`
8. `src/pages/jyotish/sahasra-chandrodaya.astro`
9. `src/pages/jyotish/kalasarpa.astro`
10. `src/pages/jyotish/sadesati.astro`
11. `src/pages/jyotish/mangal-dosha.astro`
12. `src/pages/jyotish/nakshatra.astro`
13. `src/pages/jyotish/pancha-pakshi.astro`
14. `src/pages/jyotish/gemstone.astro`
15. `src/pages/jyotish/rudraksha.astro`

- [x] **Step 2: Verify every file was updated — grep for the old truncated pattern (should return zero matches) and the new final term (should return 15 matches)**

Run: `grep -rl "0.010034\*Math.sin(toR(3\*Mp));return n360(Lm+dL);" src/pages/jyotish/`
Expected: no output (zero matches — confirms no file still ends right after the 15th term)

Run: `grep -rl "0.003665\*Math.sin(toR(2\*D-3\*Mp))" src/pages/jyotish/`
Expected: exactly the 15 file paths listed above

- [x] **Step 3: Run `npm run build` to confirm no errors**

Run: `npm run build`
Expected: build completes successfully

- [x] **Step 4: Commit**

```bash
git add src/pages/jyotish/kundali.astro src/pages/jyotish/janma-kundali.astro src/pages/jyotish/lagna.astro src/pages/jyotish/horoscope-match.astro src/pages/jyotish/rashi.astro src/pages/jyotish/baby-names.astro src/pages/jyotish/shraddha.astro src/pages/jyotish/sahasra-chandrodaya.astro src/pages/jyotish/kalasarpa.astro src/pages/jyotish/sadesati.astro src/pages/jyotish/mangal-dosha.astro src/pages/jyotish/nakshatra.astro src/pages/jyotish/pancha-pakshi.astro src/pages/jyotish/gemstone.astro src/pages/jyotish/rudraksha.astro
git commit -m "$(cat <<'EOF'
Propagate canonical 26-term Moon formula to all 15 jyotish calculators

Same drift as kundali.ts/KundaliWidget.astro (previous 2 commits) —
these pages copy the Moon dL formula inline per the client-script
constraint and had all silently fallen behind panchang.ts's later
26-term extension.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Sunrise & Sunset page

**Files:**
- Create: `src/pages/sunrise-sunset.astro`

**Interfaces:**
- Consumes: nothing (self-contained, follows `muhurta/rahu-kala.astro`'s LOCS + locationchange pattern)
- Produces: a page at `/sunrise-sunset` that Task 10 (Header wiring) will link to.

- [ ] **Step 1: Create the page**

Create `src/pages/sunrise-sunset.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Sunrise & Sunset Times — PanchangPath" description="Today's sunrise and sunset time for your location, plus a 7-day outlook, computed from real Meeus solar-position astronomy — not a static table.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <a href="/" style="font-size:12px;color:var(--color-mute);text-decoration:none;">← Today's Panchang</a>
      <p class="caption-mono" style="color:var(--color-mute);margin:12px 0 8px;">सूर्योदय · सूर्यास्त · SUNRISE &amp; SUNSET</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Sunrise &amp; Sunset</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:500px;">Today's sunrise and sunset time for your location, computed live from the same Meeus solar-position formula used across the site — plus a 7-day outlook.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <div style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:32px;">
        <div>
          <label style="font-size:11px;font-weight:500;color:var(--color-mute);display:block;margin-bottom:5px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:0.06em;">Location</label>
          <select id="ss-city" class="input" style="height:38px;min-width:160px;"></select>
        </div>
      </div>

      <div id="ss-today" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:40px;"></div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 14px;">Next 7 Days</h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;max-width:640px;" id="ss-week">
          <thead><tr>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Date</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Sunrise</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Sunset</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Day Length</th>
          </tr></thead>
          <tbody id="ss-week-body"></tbody>
        </table>
      </div>
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
  {name:'New York',lat:40.7128,lng:-74.006,tz:-4},
  {name:'London',lat:51.5074,lng:-0.1278,tz:1},
];

function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
const n360=(a:number)=>((a%360)+360)%360;
const toRad=(d:number)=>d*Math.PI/180;
const toDeg=(r:number)=>r*180/Math.PI;

// Meeus equation-of-time-corrected sunrise/sunset — same formula as src/lib/panchang.ts's sunriseUTC()
function sunriseUTC(jd:number,lat:number,lng:number,rising=true){
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

function decHoursToTime(h:number,tz:number){
  const local=h+tz;
  const hh=Math.floor(((local%24)+24)%24);
  const mm=Math.round((local-Math.floor(local))*60);
  const ap=hh<12?'AM':'PM';
  const h12=hh%12||12;
  return `${h12}:${String(mm).padStart(2,'0')} ${ap}`;
}
function fmtDuration(hoursDecimal:number){
  const h=Math.floor(hoursDecimal);
  const m=Math.round((hoursDecimal-h)*60);
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
  const y=now.getFullYear(),m=now.getMonth()+1,d=now.getDate();

  const jd=toJD(y,m,d,6-loc.tz);
  const srUTC=sunriseUTC(jd,loc.lat,loc.lng,true);
  const ssUTC=sunriseUTC(jd,loc.lat,loc.lng,false);
  const dayLenHours=ssUTC-srUTC;

  const todayEl=document.getElementById('ss-today');
  if(todayEl){
    todayEl.innerHTML=[
      {label:'Sunrise',value:decHoursToTime(srUTC,loc.tz),color:'#d97706'},
      {label:'Sunset',value:decHoursToTime(ssUTC,loc.tz),color:'#dc2626'},
      {label:'Day Length',value:fmtDuration(dayLenHours),color:'var(--color-ink)'},
    ].map(c=>`<div class="card" style="padding:20px;text-align:center;"><p style="font-size:11px;color:var(--color-mute);text-transform:uppercase;letter-spacing:0.06em;font-family:var(--font-mono);margin:0 0 8px;">${c.label}</p><p style="font-size:24px;font-weight:700;color:${c.color};margin:0;font-family:var(--font-mono);">${c.value}</p></div>`).join('');
  }

  const weekBody=document.getElementById('ss-week-body');
  if(weekBody){
    let rows='';
    for(let i=0;i<7;i++){
      const dt=new Date(y,m-1,d+i);
      const jdI=toJD(dt.getFullYear(),dt.getMonth()+1,dt.getDate(),6-loc.tz);
      const sr=sunriseUTC(jdI,loc.lat,loc.lng,true);
      const ss=sunriseUTC(jdI,loc.lat,loc.lng,false);
      const dayName=dt.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
      rows+=`<tr><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-ink);font-weight:${i===0?'700':'400'};">${dayName}${i===0?' (Today)':''}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-body-text);font-family:var(--font-mono);">${decHoursToTime(sr,loc.tz)}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-body-text);font-family:var(--font-mono);">${decHoursToTime(ss,loc.tz)}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-body-text);font-family:var(--font-mono);">${fmtDuration(ss-sr)}</td></tr>`;
    }
    weekBody.innerHTML=rows;
  }
}

sel.addEventListener('change',calculate);
calculate();
</script>
```

- [ ] **Step 2: Run `npm run build` to confirm the new page builds**

Run: `npm run build`
Expected: build succeeds, page count increases by 1 (`/sunrise-sunset`)

- [ ] **Step 3: Start the dev server and manually verify live behavior**

Run: `astro dev --background`, then open `http://localhost:4321/sunrise-sunset` in a browser.
Expected: sunrise/sunset times for New Delhi shown for today's actual date; changing the location dropdown recomputes both today's panel and the 7-day table; values are plausible for the season (e.g. in July, New Delhi sunrise ~05:2x AM, sunset ~07:2x PM).

- [ ] **Step 4: Commit**

```bash
git add src/pages/sunrise-sunset.astro
git commit -m "$(cat <<'EOF'
Add Sunrise & Sunset page

Clears site-audit-fix-prompts.md #4 (previously skipped as a feature
addition). Reuses the site's existing Meeus equation-of-time sunrise
formula, live per-location, plus a 7-day outlook.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Moonrise & Moonset page

**Files:**
- Create: `src/pages/moonrise-moonset.astro`

**Interfaces:**
- Consumes: nothing (self-contained)
- Produces: a page at `/moonrise-moonset` that Task 10 will link to.

- [ ] **Step 1: Create the page**

Create `src/pages/moonrise-moonset.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Moonrise & Moonset Times — PanchangPath" description="Today's moonrise and moonset time for your location plus current moon phase, computed from a real iterative topocentric altitude-crossing solver — not a rough heuristic.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <a href="/" style="font-size:12px;color:var(--color-mute);text-decoration:none;">← Today's Panchang</a>
      <p class="caption-mono" style="color:var(--color-mute);margin:12px 0 8px;">चंद्रोदय · चंद्रास्त · MOONRISE &amp; MOONSET</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Moonrise &amp; Moonset</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:520px;">Today's moonrise and moonset time for your location, computed with a real iterative topocentric altitude-crossing solver (the Moon moves too fast for a single daily snapshot), plus the current moon phase.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <div style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:32px;">
        <div>
          <label style="font-size:11px;font-weight:500;color:var(--color-mute);display:block;margin-bottom:5px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:0.06em;">Location</label>
          <select id="ms-city" class="input" style="height:38px;min-width:160px;"></select>
        </div>
      </div>

      <div id="ms-today" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:40px;"></div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 14px;">Next 7 Days</h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;max-width:680px;" id="ms-week">
          <thead><tr>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Date</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Moonrise</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Moonset</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Phase</th>
          </tr></thead>
          <tbody id="ms-week-body"></tbody>
        </table>
      </div>
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
  {name:'New York',lat:40.7128,lng:-74.006,tz:-4},
  {name:'London',lat:51.5074,lng:-0.1278,tz:1},
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
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(toRad(M))+(0.019993-0.000101*T)*Math.sin(2*toRad(M))+0.000289*Math.sin(3*toRad(M));
  return n360(L0+C);
}
// Canonical 26-term Moon longitude (matches src/lib/panchang.ts's moonLongitude, post Task 1-3 fix)
function moonLon(jd:number){
  const T=(jd-2451545)/36525;
  const L=n360(218.3164477+481267.88123421*T);
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
  return n360(L+dL);
}
function sunriseUTC(jd:number,lat:number,lng:number,rising=true){
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
function gmstDegrees(jd:number){
  const T=(jd-2451545)/36525;
  return n360(280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T);
}
function moonEquatorial(jd:number){
  const T=(jd-2451545)/36525;
  const lambda=moonLon(jd);
  const obliq=23.4392911-0.0130042*T;
  const lamR=toRad(lambda),epsR=toRad(obliq);
  const dec=Math.asin(Math.sin(epsR)*Math.sin(lamR));
  const ra=n360(toDeg(Math.atan2(Math.sin(lamR)*Math.cos(epsR),Math.cos(lamR))));
  return {ra,dec:toDeg(dec)};
}
// Iterative topocentric altitude-crossing solver — matches src/lib/panchang.ts's moonRiseSetUTC()
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
function decHoursToTime(h:number,tz:number){
  const local=h+tz;
  const hh=Math.floor(((local%24)+24)%24);
  const mm=Math.round((local-Math.floor(local))*60);
  const ap=hh<12?'AM':'PM';
  const h12=hh%12||12;
  return `${h12}:${String(mm).padStart(2,'0')} ${ap}`;
}
const PHASE_NAMES=['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
function moonPhase(jd:number){
  const elong=n360(moonLon(jd)-sunLon(jd));
  const illumPct=Math.round((1-Math.cos(toRad(elong)))/2*100);
  const bin=Math.floor(((elong+22.5)%360)/45);
  return {illumPct,name:PHASE_NAMES[bin]};
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

function computeForDate(y:number,m:number,d:number,loc:any){
  const jd=toJD(y,m,d,6-loc.tz);
  const jdMidnightUTC=toJD(y,m,d,0);
  const srUTC=sunriseUTC(jd,loc.lat,loc.lng,true);
  const elong=n360(moonLon(jd)-sunLon(jd));
  const moonAge=elong/360*29.53;
  const moonriseSeedUTC=srUTC+moonAge*0.8;
  const moonsetSeedUTC=moonriseSeedUTC+12.42;
  const moonriseUTC=moonRiseSetUTC(jdMidnightUTC,loc.lat,loc.lng,true,moonriseSeedUTC);
  const moonsetUTC=moonRiseSetUTC(jdMidnightUTC,loc.lat,loc.lng,false,moonsetSeedUTC);
  const phase=moonPhase(jd);
  return {moonriseUTC,moonsetUTC,phase};
}

function calculate(){
  const cityName=sel.value;
  const loc=LOCS.find(l=>l.name===cityName)||LOCS[0];
  const now=new Date();
  const y=now.getFullYear(),m=now.getMonth()+1,d=now.getDate();

  const {moonriseUTC,moonsetUTC,phase}=computeForDate(y,m,d,loc);

  const todayEl=document.getElementById('ms-today');
  if(todayEl){
    todayEl.innerHTML=[
      {label:'Moonrise',value:isNaN(moonriseUTC)?'—':decHoursToTime(moonriseUTC,loc.tz),color:'#6366f1'},
      {label:'Moonset',value:isNaN(moonsetUTC)?'—':decHoursToTime(moonsetUTC,loc.tz),color:'#4338ca'},
      {label:'Moon Phase',value:phase.name,color:'var(--color-ink)'},
      {label:'Illumination',value:phase.illumPct+'%',color:'var(--color-ink)'},
    ].map(c=>`<div class="card" style="padding:20px;text-align:center;"><p style="font-size:11px;color:var(--color-mute);text-transform:uppercase;letter-spacing:0.06em;font-family:var(--font-mono);margin:0 0 8px;">${c.label}</p><p style="font-size:${c.label==='Moon Phase'?'16':'24'}px;font-weight:700;color:${c.color};margin:0;font-family:var(--font-mono);">${c.value}</p></div>`).join('');
  }

  const weekBody=document.getElementById('ms-week-body');
  if(weekBody){
    let rows='';
    for(let i=0;i<7;i++){
      const dt=new Date(y,m-1,d+i);
      const r=computeForDate(dt.getFullYear(),dt.getMonth()+1,dt.getDate(),loc);
      const dayName=dt.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
      rows+=`<tr><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-ink);font-weight:${i===0?'700':'400'};">${dayName}${i===0?' (Today)':''}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-body-text);font-family:var(--font-mono);">${isNaN(r.moonriseUTC)?'—':decHoursToTime(r.moonriseUTC,loc.tz)}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-body-text);font-family:var(--font-mono);">${isNaN(r.moonsetUTC)?'—':decHoursToTime(r.moonsetUTC,loc.tz)}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-body-text);">${r.phase.name} (${r.phase.illumPct}%)</td></tr>`;
    }
    weekBody.innerHTML=rows;
  }
}

sel.addEventListener('change',calculate);
calculate();
</script>
```

- [ ] **Step 2: Run `npm run build` to confirm the new page builds**

Run: `npm run build`
Expected: build succeeds, page count increases by 1 (`/moonrise-moonset`)

- [ ] **Step 3: Manually verify in dev server**

Run: `astro dev --background`, open `http://localhost:4321/moonrise-moonset`.
Expected: moonrise/moonset times shown for today; phase name and illumination % are internally consistent with the current real moon phase (spot-check against a known almanac or phone weather app's moon-phase widget); changing location recomputes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/moonrise-moonset.astro
git commit -m "$(cat <<'EOF'
Add Moonrise & Moonset page

Clears site-audit-fix-prompts.md #5 (previously skipped). Uses the
real iterative topocentric altitude-crossing solver added during the
truthfulness-audit moonrise fix, plus real moon-phase illumination
derived from the Sun-Moon elongation.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Planetary Positions page

**Files:**
- Create: `src/pages/planets/planetary-positions.astro`

**Interfaces:**
- Consumes: nothing new
- Produces: a page at `/planets/planetary-positions`. Establishes the shared Kepler/graha computation block (`LOCS`-free — location-independent) that Tasks 7-9 duplicate.
- Also produces: the confirmed classical Gochara ruleset (already cross-verified via WebSearch against independent sources during planning — see Global Constraints) for Tasks 7-9 to hardcode identically.

- [ ] **Step 1: Create the page**

Create `src/pages/planets/planetary-positions.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Planetary Positions Today — Live Graha Sphuta — PanchangPath" description="Real-time sidereal positions of all 9 grahas (Sun through Ketu) — sign, nakshatra, degree, and retrograde status, computed live from Keplerian orbital mechanics.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <a href="/jyotish" style="font-size:12px;color:var(--color-mute);text-decoration:none;">← Jyotish Tools</a>
      <p class="caption-mono" style="color:var(--color-mute);margin:12px 0 8px;">ग्रह स्फुट · PLANETARY POSITIONS</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Planetary Positions Today</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:540px;">Live sidereal (Lahiri ayanamsha) positions of all 9 grahas, recomputed from real Keplerian orbital mechanics — the same engine behind this site's Kundali generator. Updates automatically as the planets move.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <p id="pp-updated" style="font-size:11px;color:var(--color-mute);font-family:var(--font-mono);margin:0 0 16px;"></p>
      <div class="card" style="padding:20px;overflow-x:auto;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;" id="pp-table">
          <thead><tr>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Graha</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Rashi</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Degree</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Nakshatra</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Pada</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Motion</th>
          </tr></thead>
          <tbody id="pp-body"></tbody>
        </table>
      </div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 14px;">What Each Graha Signifies</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;" id="pp-significations"></div>
    </div>
  </section>
</Layout>

<script>
const n360=(a:number)=>((a%360)+360)%360;
const toR=(d:number)=>d*Math.PI/180;
const toD=(r:number)=>r*180/Math.PI;
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
function solveKepler(M:number,e:number){let E=M;for(let k=0;k<50;k++){const dE=(M-E+e*Math.sin(E))/(1-e*Math.cos(E));E+=dE;if(Math.abs(dE)<1e-10)break;}return E;}
const ORB:any={
  mercury:{L:252.250906,Ld:149472.6746358,wp:77.456119,wpd:0.1588643,Om:48.330893,Omd:-0.1254229,i:7.004979,id:-0.005952,e:0.20563069,ed:0.00002527,a:0.38709831},
  venus:{L:181.979801,Ld:58517.815676,wp:131.563707,wpd:0.0036096,Om:76.67992,Omd:-0.278008,i:3.394662,id:-0.000857,e:0.00677323,ed:-0.00004938,a:0.72332102},
  earth:{L:100.464457,Ld:36000.7698278,wp:102.937348,wpd:0.3225557,Om:174.873174,Omd:-0.2410908,i:0,id:0.013055,e:0.01671022,ed:-0.00003804,a:1.00000018},
  mars:{L:355.432818,Ld:19140.2993313,wp:336.040768,wpd:0.4439016,Om:49.558093,Omd:-0.295025,i:1.849726,id:-0.008148,e:0.09341233,ed:0.00011902,a:1.52371243},
  jupiter:{L:34.351484,Ld:3034.9056746,wp:14.331309,wpd:0.2155402,Om:100.464441,Omd:0.1350208,i:1.30327,id:-0.001987,e:0.04839266,ed:-0.0001288,a:5.20248019},
  saturn:{L:50.077444,Ld:1222.1137943,wp:93.056787,wpd:0.5691095,Om:113.665524,Omd:-0.2566722,i:2.488878,id:0.002552,e:0.0541506,ed:-0.00036762,a:9.54149883},
};
function helioXY(el:any,T:number):[number,number]{
  const e=el.e+el.ed*T;const wp=n360(el.wp+el.wpd*T);const Om=n360(el.Om+el.Omd*T);
  const inc=el.i+el.id*T;const L=n360(el.L+el.Ld*T);
  const M=toR(n360(L-wp));const w=toR(n360(wp-Om));const Omega=toR(Om);const iR=toR(inc);
  const E=solveKepler(M,e);
  const nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));
  const r=el.a*(1-e*Math.cos(E));const arg=nu+w;
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
  return {surya:sunLon(jd),chandra:moonLon(jd),mangal:geo('mars'),budha:geo('mercury'),guru:geo('jupiter'),shukra:geo('venus'),shani:geo('saturn'),rahu,ketu:n360(rahu+180),ay};
}
function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
const RASHI=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const NAKS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const PLANETS=[
  ['surya','Surya (Sun)','Soul, vitality, self-confidence, authority, father, government service, and overall health.'],
  ['chandra','Chandra (Moon)','Mind, emotions, intuition, mother, and the emotional core used for daily Rashifal and Muhurta decisions.'],
  ['mangal','Mangal (Mars)','Energy, courage, siblings, land and property, conflict, and drive to take action.'],
  ['budha','Budha (Mercury)','Intellect, communication, business acumen, education, and analytical skill.'],
  ['guru','Guru (Jupiter)','Wisdom, wealth, children, spirituality, teachers, and expansion or growth.'],
  ['shukra','Shukra (Venus)','Love, marriage, beauty, luxury, art, and relationships.'],
  ['shani','Shani (Saturn)','Discipline, longevity, hard work, career, delays, and karmic lessons.'],
  ['rahu','Rahu','Worldly desire, obsession, foreign connections, sudden change, and illusion.'],
  ['ketu','Ketu','Detachment, spirituality, past-life karma, and liberation.'],
];
function fmtDMS(lon:number){
  const d=lon%30;const deg=Math.floor(d);const mn=Math.floor((d-deg)*60);
  return deg+'°'+String(mn).padStart(2,'0')+"'";
}
function nakInfo(sid:number){
  const idx=Math.floor(sid/(360/27))%27;
  const pada=Math.floor((sid%(360/27))/((360/27)/4))+1;
  return {name:NAKS[idx],pada};
}

function render(){
  const now=new Date();
  const jd=toJD(now.getUTCFullYear(),now.getUTCMonth()+1,now.getUTCDate(),now.getUTCHours()+now.getUTCMinutes()/60);
  const L=allLons(jd);
  const Lp=allLons(jd+1);
  const ay=L.ay;

  const updatedEl=document.getElementById('pp-updated');
  if(updatedEl)updatedEl.textContent='Last updated: '+now.toLocaleTimeString()+' (auto-refreshes every 60s)';

  let rows='';
  PLANETS.forEach(([k,full])=>{
    const sid=n360((L as any)[k]-ay);
    const sign=Math.floor(sid/30);
    const nk=nakInfo(sid);
    let motion='Direct';
    if(k==='rahu'||k==='ketu')motion='Retrograde';
    else if(k!=='surya'&&k!=='chandra'){
      const cur=n360((L as any)[k]-ay);
      const nxt=n360((Lp as any)[k]-(Lp as any).ay);
      let diff=nxt-cur;if(diff>180)diff-=360;if(diff<-180)diff+=360;
      motion=diff<0?'Retrograde':'Direct';
    }
    rows+=`<tr><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-ink);font-weight:600;">${full}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);">${RASHI[sign]} (${RASHI_EN[sign]})</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);font-family:var(--font-mono);">${fmtDMS(sid)}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);">${nk.name}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);">${nk.pada}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:${motion==='Retrograde'?'#dc2626':'var(--color-body-text)'};">${motion}</td></tr>`;
  });
  const body=document.getElementById('pp-body');
  if(body)body.innerHTML=rows;

  const sigEl=document.getElementById('pp-significations');
  if(sigEl&&!sigEl.dataset.rendered){
    sigEl.dataset.rendered='1';
    sigEl.innerHTML=PLANETS.map(([,full,desc])=>`<div class="card" style="padding:16px;"><p style="font-size:13px;font-weight:600;color:var(--color-ink);margin:0 0 6px;">${full}</p><p style="font-size:12px;color:var(--color-body-text);margin:0;line-height:1.6;">${desc}</p></div>`).join('');
  }
}

render();
setInterval(render,60000);
</script>
```

- [ ] **Step 2: Run `npm run build` to confirm the new page builds**

Run: `npm run build`
Expected: build succeeds, page count increases by 1 (`/planets/planetary-positions`)

- [ ] **Step 3: Manually verify in dev server**

Run: `astro dev --background`, open `http://localhost:4321/planets/planetary-positions`.
Expected: all 9 grahas shown with plausible current sign/nakshatra; cross-check Moon's sign against `/jyotish/rashi` or the homepage's Today's Panchang panel for the same instant — they should agree (all now share the same canonical 26-term Moon formula post Tasks 1-3).

- [ ] **Step 4: Commit**

```bash
git add src/pages/planets/planetary-positions.astro
git commit -m "$(cat <<'EOF'
Add Planetary Positions page

First of 4 new Planets pages clearing site-audit-fix-prompts.md #1
(previously skipped). Live sidereal positions for all 9 grahas,
computed from real Keplerian orbital mechanics (same engine as the
Kundali generator), auto-refreshing every 60s. Not location-dependent
— geocentric planetary longitude doesn't vary with observer position,
only rise/set times and Lagna do.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Rahu & Ketu page

**Files:**
- Create: `src/pages/planets/rahu-ketu.astro`

**Interfaces:**
- Consumes: the same Kepler block as Task 6 (duplicated inline, per the client-script constraint)
- Produces: a page at `/planets/rahu-ketu`

- [ ] **Step 1: Create the page**

Create `src/pages/planets/rahu-ketu.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Rahu & Ketu Transit Today — PanchangPath" description="Live sidereal position of Rahu and Ketu, plus the classical Gochara (transit) favorable/challenging table for all 12 Moon-sign rashis.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <a href="/jyotish" style="font-size:12px;color:var(--color-mute);text-decoration:none;">← Jyotish Tools</a>
      <p class="caption-mono" style="color:var(--color-mute);margin:12px 0 8px;">राहु · केतु · RAHU &amp; KETU</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Rahu &amp; Ketu Transit</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:540px;">Rahu and Ketu are the lunar nodes — shadow points where the Moon's orbit crosses the ecliptic, always exactly 180° apart. Live sidereal position below, plus the classical Gochara (transit) favorable/challenging table by Moon sign.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <p id="rk-updated" style="font-size:11px;color:var(--color-mute);font-family:var(--font-mono);margin:0 0 16px;"></p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:36px;" id="rk-current"></div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 6px;">Gochara (Transit) Effect by Moon Sign</h3>
      <p style="font-size:12px;color:var(--color-mute);margin:0 0 14px;max-width:600px;">Classical Vedic transit theory: Rahu and Ketu give favorable results when transiting the 3rd, 6th, or 11th house counted from your natal Moon sign (the "Upachaya" houses). All other positions are considered more challenging.</p>
      <div class="card" style="padding:20px;overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;" id="rk-table">
          <thead><tr>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Your Moon Sign</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Rahu's House</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Rahu Effect</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Ketu's House</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Ketu Effect</th>
          </tr></thead>
          <tbody id="rk-body"></tbody>
        </table>
      </div>
    </div>
  </section>
</Layout>

<script>
const n360=(a:number)=>((a%360)+360)%360;
const toR=(d:number)=>d*Math.PI/180;
const toD=(r:number)=>r*180/Math.PI;
function ayanamsha(T:number){return 23.85+1.3612*T-0.000136*T*T;}
function rahuLon(T:number){return n360(125.04452-1934.136261*T+0.0020708*T*T);}
function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
const RASHI=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const NAKS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
function fmtDMS(lon:number){const d=lon%30;const deg=Math.floor(d);const mn=Math.floor((d-deg)*60);return deg+'°'+String(mn).padStart(2,'0')+"'";}
function nakInfo(sid:number){const idx=Math.floor(sid/(360/27))%27;const pada=Math.floor((sid%(360/27))/((360/27)/4))+1;return {name:NAKS[idx],pada};}

// Classical Gochara ruleset — cross-verified against independent sources during planning (see plan Global Constraints). Do not modify without re-verifying.
const FAVORABLE_HOUSES=[3,6,11];
function houseFromMoon(moonSignIdx:number,planetSignIdx:number){
  return ((planetSignIdx-moonSignIdx+12)%12)+1;
}
function classify(house:number){
  return FAVORABLE_HOUSES.includes(house) ? {label:'Favorable',cls:'favorable'} : {label:'Challenging',cls:'challenging'};
}

function render(){
  const now=new Date();
  const jd=toJD(now.getUTCFullYear(),now.getUTCMonth()+1,now.getUTCDate(),now.getUTCHours()+now.getUTCMinutes()/60);
  const T=(jd-2451545)/36525;
  const ay=ayanamsha(T);
  const rahuTrop=rahuLon(T);
  const ketuTrop=n360(rahuTrop+180);
  const rahuSid=n360(rahuTrop-ay);
  const ketuSid=n360(ketuTrop-ay);
  const rahuSign=Math.floor(rahuSid/30);
  const ketuSign=Math.floor(ketuSid/30);
  const rahuNak=nakInfo(rahuSid);
  const ketuNak=nakInfo(ketuSid);

  const updatedEl=document.getElementById('rk-updated');
  if(updatedEl)updatedEl.textContent='Last updated: '+now.toLocaleTimeString()+' (auto-refreshes every 60s)';

  const curEl=document.getElementById('rk-current');
  if(curEl){
    curEl.innerHTML=[
      {label:'Rahu',sign:rahuSign,deg:rahuSid,nak:rahuNak,color:'#7c3aed'},
      {label:'Ketu',sign:ketuSign,deg:ketuSid,nak:ketuNak,color:'#4338ca'},
    ].map(p=>`<div class="card" style="padding:20px;"><p style="font-size:14px;font-weight:700;color:${p.color};margin:0 0 6px;">${p.label}</p><p style="font-size:18px;font-weight:600;color:var(--color-ink);margin:0 0 4px;">${RASHI[p.sign]} (${RASHI_EN[p.sign]})</p><p style="font-size:12px;color:var(--color-mute);margin:0;font-family:var(--font-mono);">${fmtDMS(p.deg)} · ${p.nak.name} Pada ${p.nak.pada}</p></div>`).join('');
  }

  let rows='';
  for(let moonSign=0;moonSign<12;moonSign++){
    const rahuHouse=houseFromMoon(moonSign,rahuSign);
    const ketuHouse=houseFromMoon(moonSign,ketuSign);
    const rahuCls=classify(rahuHouse);
    const ketuCls=classify(ketuHouse);
    rows+=`<tr><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-ink);font-weight:600;">${RASHI[moonSign]} (${RASHI_EN[moonSign]})</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);">${rahuHouse}${rahuHouse===1?'st':rahuHouse===2?'nd':rahuHouse===3?'rd':'th'} house</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:${rahuCls.cls==='favorable'?'#15803d':'#dc2626'};font-weight:600;">${rahuCls.label}</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);">${ketuHouse}${ketuHouse===1?'st':ketuHouse===2?'nd':ketuHouse===3?'rd':'th'} house</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:${ketuCls.cls==='favorable'?'#15803d':'#dc2626'};font-weight:600;">${ketuCls.label}</td></tr>`;
  }
  const body=document.getElementById('rk-body');
  if(body)body.innerHTML=rows;
}

render();
setInterval(render,60000);
</script>
```

- [ ] **Step 2: Run `npm run build`**

Run: `npm run build`
Expected: build succeeds, page count increases by 1

- [ ] **Step 3: Manually verify**

Open `http://localhost:4321/planets/rahu-ketu` in the dev server.
Expected: Rahu and Ketu shown exactly 6 signs (180°) apart; the 12-row table shows exactly 3 "Favorable" rows for Rahu and 3 for Ketu (houses 3, 6, 11 each), with the rest "Challenging".

- [ ] **Step 4: Commit**

```bash
git add src/pages/planets/rahu-ketu.astro
git commit -m "$(cat <<'EOF'
Add Rahu & Ketu transit page

Live node position plus the classical Gochara favorable-house table
(3rd/6th/11th from Moon sign), cross-verified against independent
Vedic astrology references during planning — not invented.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Shani (Saturn) page

**Files:**
- Create: `src/pages/planets/shani.astro`

**Interfaces:**
- Consumes: same Kepler block pattern as Tasks 6-7
- Produces: a page at `/planets/shani`, links out to `/jyotish/sadesati`

- [ ] **Step 1: Create the page**

Create `src/pages/planets/shani.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Shani (Saturn) Transit Today — Sade Sati Table — PanchangPath" description="Live sidereal position of Saturn plus the classical Sade Sati / Ashtam Shani / favorable transit table for all 12 Moon-sign rashis.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <a href="/jyotish" style="font-size:12px;color:var(--color-mute);text-decoration:none;">← Jyotish Tools</a>
      <p class="caption-mono" style="color:var(--color-mute);margin:12px 0 8px;">शनि · SHANI (SATURN)</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Shani (Saturn) Transit</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:540px;">Live sidereal position of Saturn, plus the classical Sade Sati and Ashtam Shani transit table by Moon sign. For a personalized Sade Sati phase check against your own birth chart, use the <a href="/jyotish/sadesati" style="color:var(--color-saffron-deep,#d97706);">Shani Sadesati Calculator</a>.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <p id="sh-updated" style="font-size:11px;color:var(--color-mute);font-family:var(--font-mono);margin:0 0 16px;"></p>
      <div class="card" style="padding:20px;max-width:320px;margin-bottom:36px;" id="sh-current"></div>

      <h3 style="font-size:15px;font-weight:600;color:var(--color-ink);margin:0 0 6px;">Saturn Gochara (Transit) Effect by Moon Sign</h3>
      <p style="font-size:12px;color:var(--color-mute);margin:0 0 14px;max-width:600px;">Sade Sati (houses 12, 1, 2 from your Moon sign) is the well-known 7.5-year Saturn transit cycle. Ashtam Shani (house 8) is also considered particularly challenging. Houses 3, 6, and 11 are favorable ("Upachaya"); the rest are neutral.</p>
      <div class="card" style="padding:20px;overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;" id="sh-table">
          <thead><tr>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Your Moon Sign</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Saturn's House</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Effect</th>
          </tr></thead>
          <tbody id="sh-body"></tbody>
        </table>
      </div>
    </div>
  </section>
</Layout>

<script>
const n360=(a:number)=>((a%360)+360)%360;
const toR=(d:number)=>d*Math.PI/180;
const toD=(r:number)=>r*180/Math.PI;
function ayanamsha(T:number){return 23.85+1.3612*T-0.000136*T*T;}
function solveKepler(M:number,e:number){let E=M;for(let k=0;k<50;k++){const dE=(M-E+e*Math.sin(E))/(1-e*Math.cos(E));E+=dE;if(Math.abs(dE)<1e-10)break;}return E;}
const ORB:any={
  earth:{L:100.464457,Ld:36000.7698278,wp:102.937348,wpd:0.3225557,Om:174.873174,Omd:-0.2410908,i:0,id:0.013055,e:0.01671022,ed:-0.00003804,a:1.00000018},
  saturn:{L:50.077444,Ld:1222.1137943,wp:93.056787,wpd:0.5691095,Om:113.665524,Omd:-0.2566722,i:2.488878,id:0.002552,e:0.0541506,ed:-0.00036762,a:9.54149883},
};
function helioXY(el:any,T:number):[number,number]{
  const e=el.e+el.ed*T;const wp=n360(el.wp+el.wpd*T);const Om=n360(el.Om+el.Omd*T);
  const inc=el.i+el.id*T;const L=n360(el.L+el.Ld*T);
  const M=toR(n360(L-wp));const w=toR(n360(wp-Om));const Omega=toR(Om);const iR=toR(inc);
  const E=solveKepler(M,e);
  const nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));
  const r=el.a*(1-e*Math.cos(E));const arg=nu+w;
  const x=r*(Math.cos(Omega)*Math.cos(arg)-Math.sin(Omega)*Math.sin(arg)*Math.cos(iR));
  const y=r*(Math.sin(Omega)*Math.cos(arg)+Math.cos(Omega)*Math.sin(arg)*Math.cos(iR));
  return [x,y];
}
function saturnGeoLon(T:number){
  const [xE,yE]=helioXY(ORB.earth,T);
  const [xP,yP]=helioXY(ORB.saturn,T);
  return n360(toD(Math.atan2(yP-yE,xP-xE)));
}
function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
const RASHI=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const NAKS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
function fmtDMS(lon:number){const d=lon%30;const deg=Math.floor(d);const mn=Math.floor((d-deg)*60);return deg+'°'+String(mn).padStart(2,'0')+"'";}
function nakInfo(sid:number){const idx=Math.floor(sid/(360/27))%27;const pada=Math.floor((sid%(360/27))/((360/27)/4))+1;return {name:NAKS[idx],pada};}

// Classical Gochara ruleset — cross-verified during planning (see plan Global Constraints). Do not modify without re-verifying.
function houseFromMoon(moonSignIdx:number,planetSignIdx:number){
  return ((planetSignIdx-moonSignIdx+12)%12)+1;
}
function classifyShani(house:number){
  if([12,1,2].includes(house))return {label:'Sade Sati',cls:'challenging'};
  if(house===8)return {label:'Ashtam Shani',cls:'challenging'};
  if([3,6,11].includes(house))return {label:'Favorable',cls:'favorable'};
  return {label:'Neutral',cls:'neutral'};
}

function render(){
  const now=new Date();
  const jd=toJD(now.getUTCFullYear(),now.getUTCMonth()+1,now.getUTCDate(),now.getUTCHours()+now.getUTCMinutes()/60);
  const T=(jd-2451545)/36525;
  const ay=ayanamsha(T);
  const saturnTrop=saturnGeoLon(T);
  const saturnSid=n360(saturnTrop-ay);
  const saturnSign=Math.floor(saturnSid/30);
  const nak=nakInfo(saturnSid);

  const updatedEl=document.getElementById('sh-updated');
  if(updatedEl)updatedEl.textContent='Last updated: '+now.toLocaleTimeString()+' (auto-refreshes every 60s)';

  const curEl=document.getElementById('sh-current');
  if(curEl){
    curEl.innerHTML=`<p style="font-size:14px;font-weight:700;color:#374151;margin:0 0 6px;">Shani (Saturn)</p><p style="font-size:20px;font-weight:600;color:var(--color-ink);margin:0 0 4px;">${RASHI[saturnSign]} (${RASHI_EN[saturnSign]})</p><p style="font-size:12px;color:var(--color-mute);margin:0;font-family:var(--font-mono);">${fmtDMS(saturnSid)} · ${nak.name} Pada ${nak.pada}</p>`;
  }

  let rows='';
  for(let moonSign=0;moonSign<12;moonSign++){
    const house=houseFromMoon(moonSign,saturnSign);
    const c=classifyShani(house);
    const color=c.cls==='favorable'?'#15803d':c.cls==='challenging'?'#dc2626':'var(--color-body-text)';
    rows+=`<tr><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-ink);font-weight:600;">${RASHI[moonSign]} (${RASHI_EN[moonSign]})</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);">${house}${house===1?'st':house===2?'nd':house===3?'rd':'th'} house</td><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:${color};font-weight:600;">${c.label}</td></tr>`;
  }
  const body=document.getElementById('sh-body');
  if(body)body.innerHTML=rows;
}

render();
setInterval(render,60000);
</script>
```

- [ ] **Step 2: Run `npm run build`**

Run: `npm run build`
Expected: build succeeds, page count increases by 1

- [ ] **Step 3: Manually verify**

Open `http://localhost:4321/planets/shani`.
Expected: exactly 3 rows labeled "Sade Sati" (the sign Saturn is in, and the two adjacent signs), exactly 1 row "Ashtam Shani", exactly 3 rows "Favorable", remaining 5 rows "Neutral".

- [ ] **Step 4: Commit**

```bash
git add src/pages/planets/shani.astro
git commit -m "$(cat <<'EOF'
Add Shani (Saturn) transit page

Live Saturn position plus the classical Sade Sati (12th/1st/2nd from
Moon) and Ashtam Shani (8th) transit table, cross-verified against
independent Vedic astrology references during planning. Links to the
existing Shani Sadesati calculator for personalized natal detail.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Gochara (combined transit) page

**Files:**
- Create: `src/pages/planets/gochara.astro`

**Interfaces:**
- Consumes: same Kepler block pattern as Tasks 6-8, combining Mars/Jupiter/Saturn/Rahu/Ketu
- Produces: a page at `/planets/gochara`

- [ ] **Step 1: Create the page**

Create `src/pages/planets/gochara.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Gochara — Planetary Transit Table Today — PanchangPath" description="Live Gochara (transit) grid for Mars, Jupiter, Saturn, Rahu, and Ketu across all 12 Moon-sign rashis, using the classical Vedic house-from-Moon transit framework.">

  <section style="background:var(--color-canvas);border-bottom:1px solid var(--color-hairline);padding:40px 0 32px;position:relative;overflow:hidden;">
    <div class="gradient-mesh" style="position:absolute;inset:0;opacity:0.4;pointer-events:none;"></div>
    <div class="container" style="position:relative;">
      <a href="/jyotish" style="font-size:12px;color:var(--color-mute);text-decoration:none;">← Jyotish Tools</a>
      <p class="caption-mono" style="color:var(--color-mute);margin:12px 0 8px;">गोचर · GOCHARA</p>
      <h1 style="font-size:30px;font-weight:600;letter-spacing:-1.2px;color:var(--color-ink);margin:0 0 10px;">Gochara — Transit Table</h1>
      <p style="font-size:15px;color:var(--color-body-text);margin:0;max-width:560px;">Classical Vedic Gochara (planetary transit) theory concerns itself with the five "slow movers" — Mars, Jupiter, Saturn, Rahu, and Ketu — and whether they currently sit in a favorable or challenging house counted from your natal Moon sign. Find your Moon sign's row below.</p>
    </div>
  </section>

  <section style="padding:28px 0 48px;">
    <div class="container">
      <p id="gc-updated" style="font-size:11px;color:var(--color-mute);font-family:var(--font-mono);margin:0 0 16px;"></p>
      <div class="card" style="padding:20px;overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:640px;" id="gc-table">
          <thead><tr>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Your Moon Sign</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Mars</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Jupiter</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Saturn</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Rahu</th>
            <th style="text-align:left;padding:6px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-mute);font-weight:600;font-size:11px;text-transform:uppercase;">Ketu</th>
          </tr></thead>
          <tbody id="gc-body"></tbody>
        </table>
      </div>
      <p style="font-size:11px;color:var(--color-mute);margin:16px 0 0;max-width:600px;">Mars/Rahu/Ketu/Saturn: favorable in houses 3, 6, 11 from Moon sign ("Upachaya"). Jupiter: favorable in houses 2, 5, 7, 9, 11. Saturn additionally shows Sade Sati (12, 1, 2) and Ashtam Shani (8) as challenging.</p>
    </div>
  </section>
</Layout>

<script>
const n360=(a:number)=>((a%360)+360)%360;
const toR=(d:number)=>d*Math.PI/180;
const toD=(r:number)=>r*180/Math.PI;
function ayanamsha(T:number){return 23.85+1.3612*T-0.000136*T*T;}
function rahuLon(T:number){return n360(125.04452-1934.136261*T+0.0020708*T*T);}
function solveKepler(M:number,e:number){let E=M;for(let k=0;k<50;k++){const dE=(M-E+e*Math.sin(E))/(1-e*Math.cos(E));E+=dE;if(Math.abs(dE)<1e-10)break;}return E;}
const ORB:any={
  earth:{L:100.464457,Ld:36000.7698278,wp:102.937348,wpd:0.3225557,Om:174.873174,Omd:-0.2410908,i:0,id:0.013055,e:0.01671022,ed:-0.00003804,a:1.00000018},
  mars:{L:355.432818,Ld:19140.2993313,wp:336.040768,wpd:0.4439016,Om:49.558093,Omd:-0.295025,i:1.849726,id:-0.008148,e:0.09341233,ed:0.00011902,a:1.52371243},
  jupiter:{L:34.351484,Ld:3034.9056746,wp:14.331309,wpd:0.2155402,Om:100.464441,Omd:0.1350208,i:1.30327,id:-0.001987,e:0.04839266,ed:-0.0001288,a:5.20248019},
  saturn:{L:50.077444,Ld:1222.1137943,wp:93.056787,wpd:0.5691095,Om:113.665524,Omd:-0.2566722,i:2.488878,id:0.002552,e:0.0541506,ed:-0.00036762,a:9.54149883},
};
function helioXY(el:any,T:number):[number,number]{
  const e=el.e+el.ed*T;const wp=n360(el.wp+el.wpd*T);const Om=n360(el.Om+el.Omd*T);
  const inc=el.i+el.id*T;const L=n360(el.L+el.Ld*T);
  const M=toR(n360(L-wp));const w=toR(n360(wp-Om));const Omega=toR(Om);const iR=toR(inc);
  const E=solveKepler(M,e);
  const nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));
  const r=el.a*(1-e*Math.cos(E));const arg=nu+w;
  const x=r*(Math.cos(Omega)*Math.cos(arg)-Math.sin(Omega)*Math.sin(arg)*Math.cos(iR));
  const y=r*(Math.sin(Omega)*Math.cos(arg)+Math.cos(Omega)*Math.sin(arg)*Math.cos(iR));
  return [x,y];
}
function geoLon(key:string,T:number){
  const [xE,yE]=helioXY(ORB.earth,T);
  const [xP,yP]=helioXY(ORB[key],T);
  return n360(toD(Math.atan2(yP-yE,xP-xE)));
}
function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
const RASHI=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// Classical Gochara ruleset — cross-verified during planning (see plan Global Constraints). Do not modify without re-verifying.
function houseFromMoon(moonSignIdx:number,planetSignIdx:number){
  return ((planetSignIdx-moonSignIdx+12)%12)+1;
}
function classifyGeneric(house:number,favorable:number[]){
  return favorable.includes(house) ? {label:'Favorable',cls:'favorable'} : {label:'Challenging',cls:'challenging'};
}
function classifyShani(house:number){
  if([12,1,2].includes(house))return {label:'Sade Sati',cls:'challenging'};
  if(house===8)return {label:'Ashtam Shani',cls:'challenging'};
  if([3,6,11].includes(house))return {label:'Favorable',cls:'favorable'};
  return {label:'Neutral',cls:'neutral'};
}
function cellHtml(c:{label:string,cls:string}){
  const color=c.cls==='favorable'?'#15803d':c.cls==='challenging'?'#dc2626':'var(--color-body-text)';
  return `<td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:${color};font-weight:600;font-size:12px;">${c.label}</td>`;
}

function render(){
  const now=new Date();
  const jd=toJD(now.getUTCFullYear(),now.getUTCMonth()+1,now.getUTCDate(),now.getUTCHours()+now.getUTCMinutes()/60);
  const T=(jd-2451545)/36525;
  const ay=ayanamsha(T);

  const mangalSign=Math.floor(n360(geoLon('mars',T)-ay)/30);
  const guruSign=Math.floor(n360(geoLon('jupiter',T)-ay)/30);
  const shaniSign=Math.floor(n360(geoLon('saturn',T)-ay)/30);
  const rahuTrop=rahuLon(T);
  const rahuSign=Math.floor(n360(rahuTrop-ay)/30);
  const ketuSign=Math.floor(n360(n360(rahuTrop+180)-ay)/30);

  const updatedEl=document.getElementById('gc-updated');
  if(updatedEl)updatedEl.textContent='Last updated: '+now.toLocaleTimeString()+' (auto-refreshes every 60s)';

  let rows='';
  for(let moonSign=0;moonSign<12;moonSign++){
    const hMangal=houseFromMoon(moonSign,mangalSign);
    const hGuru=houseFromMoon(moonSign,guruSign);
    const hShani=houseFromMoon(moonSign,shaniSign);
    const hRahu=houseFromMoon(moonSign,rahuSign);
    const hKetu=houseFromMoon(moonSign,ketuSign);
    rows+=`<tr><td style="padding:7px 10px;border-bottom:1px solid var(--color-hairline);color:var(--color-ink);font-weight:600;">${RASHI[moonSign]} (${RASHI_EN[moonSign]})</td>`
      +cellHtml(classifyGeneric(hMangal,[3,6,11]))
      +cellHtml(classifyGeneric(hGuru,[2,5,7,9,11]))
      +cellHtml(classifyShani(hShani))
      +cellHtml(classifyGeneric(hRahu,[3,6,11]))
      +cellHtml(classifyGeneric(hKetu,[3,6,11]))
      +'</tr>';
  }
  const body=document.getElementById('gc-body');
  if(body)body.innerHTML=rows;
}

render();
setInterval(render,60000);
</script>
```

- [ ] **Step 2: Run `npm run build`**

Run: `npm run build`
Expected: build succeeds, page count increases by 1

- [ ] **Step 3: Manually verify**

Open `http://localhost:4321/planets/gochara`.
Expected: 12-row grid renders; Jupiter column shows exactly 5 "Favorable" rows, Mars/Rahu/Ketu columns each show exactly 3 "Favorable" rows, Saturn column shows the same distribution as the Shani page (3 Sade Sati, 1 Ashtam Shani, 3 Favorable, 5 Neutral).

- [ ] **Step 4: Commit**

```bash
git add src/pages/planets/gochara.astro
git commit -m "$(cat <<'EOF'
Add Gochara (combined transit) page

Fourth and final new Planets page. 12-rashi x 5-planet grid (Mars,
Jupiter, Saturn, Rahu, Ketu), each cell mechanically derived from the
same cross-verified classical house-from-Moon ruleset used on the
Rahu & Ketu and Shani pages — no per-cell invented text.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Wire all 6 new pages into Header.astro

**Files:**
- Modify: `src/components/Header.astro` (desktop dropdown ~line 108-197, mobile drawer ~line 265-363, `searchItems` ~line 1132-1180)

**Interfaces:**
- Consumes: the 6 new routes from Tasks 4-9: `/sunrise-sunset`, `/moonrise-moonset`, `/planets/planetary-positions`, `/planets/rahu-ketu`, `/planets/shani`, `/planets/gochara`
- Produces: no new interfaces (terminal task for nav wiring)

- [ ] **Step 1: Fix the desktop dropdown — Panchang menu (Sunrise/Moonrise)**

In `src/components/Header.astro`, replace:

```html
            <a href="/" class="dd-link">Sunrise &amp; Sunset</a>
            <a href="/" class="dd-link">Moonrise &amp; Moonset</a>
```

(inside the `Panchang` `nav-dropdown`, i.e. the first occurrence, immediately after `Monthly Calendar` and before `Rahu Kalam`) with:

```html
            <a href="/sunrise-sunset" class="dd-link">Sunrise &amp; Sunset</a>
            <a href="/moonrise-moonset" class="dd-link">Moonrise &amp; Moonset</a>
```

- [ ] **Step 2: Fix the desktop dropdown — Planets menu**

Replace:

```html
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

```html
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

- [ ] **Step 3: Fix the mobile drawer — Panchang section (Sunrise/Moonrise)**

Replace:

```html
          <a href="/" class="drawer-link">Sunrise &amp; Sunset</a>
          <a href="/" class="drawer-link">Moonrise &amp; Moonset</a>
```

with:

```html
          <a href="/sunrise-sunset" class="drawer-link">Sunrise &amp; Sunset</a>
          <a href="/moonrise-moonset" class="drawer-link">Moonrise &amp; Moonset</a>
```

- [ ] **Step 4: Fix the mobile drawer — Planets section**

Replace:

```html
        <div class="drawer-sub" id="m-planets">
          <a href="/" class="drawer-link">Planetary Positions</a>
          <a href="/" class="drawer-link">Rahu &amp; Ketu</a>
          <a href="/" class="drawer-link">Shani (Saturn)</a>
          <a href="/" class="drawer-link">Gochara</a>
        </div>
```

with:

```html
        <div class="drawer-sub" id="m-planets">
          <a href="/planets/planetary-positions" class="drawer-link">Planetary Positions</a>
          <a href="/planets/rahu-ketu" class="drawer-link">Rahu &amp; Ketu</a>
          <a href="/planets/shani" class="drawer-link">Shani (Saturn)</a>
          <a href="/planets/gochara" class="drawer-link">Gochara</a>
        </div>
```

- [ ] **Step 5: Fix `searchItems` — update the existing Sunrise & Sunset entry and add the other 5**

Replace:

```javascript
    { label: "Sunrise & Sunset", url: "/" },
```

with:

```javascript
    { label: "Sunrise & Sunset", url: "/sunrise-sunset" },
    { label: "Moonrise & Moonset", url: "/moonrise-moonset" },
    { label: "Planetary Positions", url: "/planets/planetary-positions" },
    { label: "Rahu & Ketu", url: "/planets/rahu-ketu" },
    { label: "Shani (Saturn) Transit", url: "/planets/shani" },
    { label: "Gochara", url: "/planets/gochara" },
```

- [ ] **Step 6: Verify no stray `href="/"` placeholders remain for these labels**

Run: `grep -n 'class="dd-link">Sunrise\|class="dd-link">Moonrise\|class="dd-link">Planetary Positions\|class="dd-link">Rahu\|class="dd-link">Shani\|class="dd-link">Gochara\|class="drawer-link">Sunrise\|class="drawer-link">Moonrise\|class="drawer-link">Planetary Positions\|class="drawer-link">Rahu\|class="drawer-link">Shani\|class="drawer-link">Gochara' src/components/Header.astro`
Expected: every matched line has a real `href` (not `href="/"`) — visually confirm each line in the output

- [ ] **Step 7: Run `npm run build`**

Run: `npm run build`
Expected: build completes successfully

- [ ] **Step 8: Manually verify nav in dev server**

Open `http://localhost:4321/`, check the desktop "Panchang" and "Planets" dropdown menus, open the mobile drawer (resize window or use device toolbar), and use the header search box typing "gochara" / "moonrise" / "shani" — each should navigate to the correct new page.

- [ ] **Step 9: Commit**

```bash
git add src/components/Header.astro
git commit -m "$(cat <<'EOF'
Wire Sunrise/Sunset, Moonrise/Moonset, and 4 Planets pages into nav

Clears the remaining href="/" placeholders in the Panchang and Planets
menus. Updated in all three required locations per CLAUDE.md's sync
convention: desktop dropdown, mobile drawer, and searchItems.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Fix Raksha Bandhan 2026 date

**Files:**
- Modify: `src/lib/festivals.ts:59`

**Interfaces:**
- Consumes: nothing
- Produces: corrected `Festival` entry

- [ ] **Step 1: Apply the verified date correction**

Verified via `WebSearch` during planning (drikpanchang.com): Raksha Bandhan 2026 falls on **Friday, August 28** — Bhadra Kaal ends before sunrise that day, so the entire morning (5:57 AM–9:48 AM) is clear and auspicious, confirming the date isn't pushed to evening by Bhadra timing rules.

In `src/lib/festivals.ts`, replace:

```typescript
  { date: '2026-08-27', name: 'Raksha Bandhan',           nameHi: 'रक्षा बंधन',            type: 'major',    description: 'Sisters tie rakhi on brothers\' wrists, brothers vow to protect them.' },
```

with:

```typescript
  // Verified 2026-08-28 via drikpanchang.com (WebSearch, 2026-07-08) — Bhadra Kaal ends before sunrise this year, so the full morning is auspicious with no evening-shift needed
  { date: '2026-08-28', name: 'Raksha Bandhan',           nameHi: 'रक्षा बंधन',            type: 'major',    description: 'Sisters tie rakhi on brothers\' wrists, brothers vow to protect them.' },
```

- [ ] **Step 2: Confirm array ordering is still date-sorted**

Run: `grep -n "date: '2026-0[7-9]" src/lib/festivals.ts`
Expected: dates appear in ascending order (`2026-07-29` Guru Purnima, `2026-08-28` Raksha Bandhan, `2026-09-04` Krishna Janmashtami, `2026-09-14` Ganesh Chaturthi) — no reordering needed since 08-28 still falls between 07-29 and 09-04

- [ ] **Step 3: Run `npm run build`**

Run: `npm run build`
Expected: build completes successfully; `/festivals/raksha-bandhan-2026` still generates (slug derived from name+year, unaffected by the date change)

- [ ] **Step 4: Commit**

```bash
git add src/lib/festivals.ts
git commit -m "$(cat <<'EOF'
Fix Raksha Bandhan 2026 date: Aug 27 -> Aug 28

Clears site-audit-fix-prompts.md #26 (previously skipped, pending
verification). Confirmed via drikpanchang.com: Raksha Bandhan 2026
falls on Friday, August 28, with Bhadra Kaal ending before sunrise.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Add 2027 festival data

**Files:**
- Modify: `src/lib/festivals.ts` (rename constant + append 2027 block)
- Modify: `src/pages/festivals.astro`, `src/pages/calendar.astro`, `src/pages/festivals/[slug].astro` (update import name)

**Interfaces:**
- Consumes: nothing
- Produces: `FESTIVALS_2025_2027` (renamed from `FESTIVALS_2025_2026`) — same `Festival[]` shape, now extended through end of 2027

- [ ] **Step 1: Rename the exported constant**

In `src/lib/festivals.ts`, replace:

```typescript
export const FESTIVALS_2025_2026: Festival[] = [
```

with:

```typescript
export const FESTIVALS_2025_2027: Festival[] = [
```

- [ ] **Step 2: Update the 2 internal usages in the same file**

In `src/lib/festivals.ts`, replace:

```typescript
export function getUpcomingFestivals(date: Date, count = 5): Festival[] {
  const dateStr = date.toISOString().split('T')[0];
  return FESTIVALS_2025_2026
    .filter(f => f.date >= dateStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

export function getTodayFestivals(date: Date): Festival[] {
  const dateStr = date.toISOString().split('T')[0];
  return FESTIVALS_2025_2026.filter(f => f.date === dateStr);
}
```

with:

```typescript
export function getUpcomingFestivals(date: Date, count = 5): Festival[] {
  const dateStr = date.toISOString().split('T')[0];
  return FESTIVALS_2025_2027
    .filter(f => f.date >= dateStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

export function getTodayFestivals(date: Date): Festival[] {
  const dateStr = date.toISOString().split('T')[0];
  return FESTIVALS_2025_2027.filter(f => f.date === dateStr);
}
```

- [ ] **Step 3: Update the 3 external import sites**

In `src/pages/festivals.astro`, replace:
```typescript
import { FESTIVALS_2025_2026, daysUntil } from '../lib/festivals';
```
with:
```typescript
import { FESTIVALS_2025_2027, daysUntil } from '../lib/festivals';
```
and replace both remaining uses of `FESTIVALS_2025_2026` in that file (the `upcoming` and `past` filter lines) with `FESTIVALS_2025_2027`.

In `src/pages/calendar.astro`, replace:
```typescript
import { FESTIVALS_2025_2026 } from '../lib/festivals';
```
with:
```typescript
import { FESTIVALS_2025_2027 } from '../lib/festivals';
```
and replace the 2 remaining uses (`typeof FESTIVALS_2025_2026[0][]` and `for (const f of FESTIVALS_2025_2026)`) with `FESTIVALS_2025_2027`.

In `src/pages/festivals/[slug].astro`, replace:
```typescript
  FESTIVALS_2025_2026,
```
with:
```typescript
  FESTIVALS_2025_2027,
```
and replace the 2 remaining uses (`return FESTIVALS_2025_2026.map(...)` and `[...FESTIVALS_2025_2026].sort(...)`) with `FESTIVALS_2025_2027`.

- [ ] **Step 4: Verify no references to the old name remain**

Run: `grep -rn "FESTIVALS_2025_2026" src/`
Expected: no output

- [ ] **Step 5: Append the 2027 festival block**

Dates verified via `WebFetch` against `drikpanchang.com`'s 2027 Hindu Calendar (New Delhi) during planning, 2026-07-08. Lohri is derived as the day before Makar Sankranti (same relationship as the existing 2025 data); Christmas is a fixed Gregorian date needing no lookup. Sanity check: Diwali 2026-11-08 → Diwali 2027-10-29 is 355 days apart, consistent with the normal ~11-day lunar-calendar drift per year (not a leap-month year), and Makar Sankranti 2027-01-15 matches the original 2026-07 audit's independently-verified date.

In `src/lib/festivals.ts`, replace the closing line of the array:

```typescript
  { date: '2026-11-21', name: 'Dev Uthani Ekadashi',      nameHi: 'देव उठनी एकादशी',       type: 'major',    description: 'Lord Vishnu awakens from four-month cosmic sleep — weddings resume.',  longDesc: 'Dev Uthani Ekadashi (Prabodhini Ekadashi) marks the end of the Chaturmas period when Lord Vishnu awakens from his four-month cosmic sleep. All auspicious occasions including weddings, upanayana, and griha pravesh that were paused during Chaturmas resume from this day.' },
];
```

with:

```typescript
  { date: '2026-11-21', name: 'Dev Uthani Ekadashi',      nameHi: 'देव उठनी एकादशी',       type: 'major',    description: 'Lord Vishnu awakens from four-month cosmic sleep — weddings resume.',  longDesc: 'Dev Uthani Ekadashi (Prabodhini Ekadashi) marks the end of the Chaturmas period when Lord Vishnu awakens from his four-month cosmic sleep. All auspicious occasions including weddings, upanayana, and griha pravesh that were paused during Chaturmas resume from this day.' },
  // 2027 block — dates sourced from drikpanchang.com's 2027 Hindu Calendar (New Delhi) via WebFetch, 2026-07-08
  { date: '2027-01-14', name: 'Lohri',                    nameHi: 'लोहड़ी',               type: 'regional', description: 'Harvest festival of Punjab marking the end of winter solstice.',      longDesc: 'Lohri is a popular Punjabi folk festival celebrated on the night before Makar Sankranti. Bonfires are lit, and people dance and sing folk songs around the fire. Sesame seeds, jaggery, and popcorn are offered to the fire.' },
  { date: '2027-01-15', name: 'Makar Sankranti',          nameHi: 'मकर संक्रांति',        type: 'major',    description: 'Sun enters Capricorn — harvest & kite festival.',                      longDesc: 'Makar Sankranti marks the transition of the Sun into the zodiac sign of Capricorn (Makara). It is one of the few Hindu festivals observed on a fixed solar date. Celebrated with kite flying, sesame-jaggery sweets, and ritual dips in holy rivers.' },
  { date: '2027-01-15', name: 'Pongal',                   nameHi: 'पोंगल',                type: 'regional', description: 'Tamil harvest festival celebrated for four days.',                     longDesc: 'Pongal is a multi-day harvest festival celebrated predominantly in Tamil Nadu. The word Pongal means "to boil" and refers to the traditional dish made from newly harvested rice boiled with milk and jaggery.' },
  { date: '2027-02-11', name: 'Basant Panchami',          nameHi: 'बसंत पंचमी',           type: 'major',    description: 'Worship of Goddess Saraswati — festival of knowledge and arts.' },
  { date: '2027-03-06', name: 'Maha Shivaratri',          nameHi: 'महाशिवरात्रि',         type: 'major',    description: 'The great night of Lord Shiva — fasting and night-long worship.' },
  { date: '2027-03-21', name: 'Holika Dahan',             nameHi: 'होलिका दहन',           type: 'major',    description: 'Bonfire lit the night before Holi, symbolizing the triumph of good over evil.' },
  { date: '2027-03-22', name: 'Holi',                     nameHi: 'होली',                 type: 'major',    description: 'Festival of colors celebrating the arrival of spring.' },
  { date: '2027-04-07', name: 'Ugadi / Gudi Padwa',       nameHi: 'उगादी / गुड़ी पड़वा',   type: 'major',    description: 'Hindu New Year for Andhra, Telangana, Karnataka and Maharashtra.' },
  { date: '2027-04-15', name: 'Ram Navami',               nameHi: 'राम नवमी',             type: 'major',    description: 'Birthday of Lord Rama, the seventh avatar of Vishnu.' },
  { date: '2027-04-20', name: 'Hanuman Jayanti',          nameHi: 'हनुमान जयंती',         type: 'major',    description: 'Birthday of Lord Hanuman, the devoted disciple of Rama.' },
  { date: '2027-05-09', name: 'Akshaya Tritiya',          nameHi: 'अक्षय तृतीया',          type: 'major',    description: 'Auspicious day for new beginnings — gold purchases bring prosperity.' },
  { date: '2027-05-20', name: 'Buddha Purnima',           nameHi: 'बुद्ध पूर्णिमा',        type: 'major',    description: 'Birth of Gautama Buddha — observed by Hindus and Buddhists alike.' },
  { date: '2027-06-14', name: 'Nirjala Ekadashi',         nameHi: 'निर्जला एकादशी',        type: 'vrat',     description: 'Strictest Ekadashi fast — no water or food for 24 hours.',          longDesc: 'Nirjala Ekadashi is considered the most important of all 24 Ekadashis. "Nirjala" means without water, and devotees observe a complete fast without even a drop of water. It is believed that observing this single Ekadashi earns the merit of all 24 Ekadashis combined.' },
  { date: '2027-07-18', name: 'Guru Purnima',             nameHi: 'गुरु पूर्णिमा',         type: 'major',    description: 'Day to honor spiritual teachers and the guru-disciple tradition.' },
  { date: '2027-08-17', name: 'Raksha Bandhan',           nameHi: 'रक्षा बंधन',            type: 'major',    description: 'Sisters tie rakhi on brothers\' wrists, brothers vow to protect them.' },
  { date: '2027-08-25', name: 'Krishna Janmashtami',      nameHi: 'कृष्ण जन्माष्टमी',     type: 'major',    description: 'Birthday of Lord Krishna, the eighth avatar of Vishnu.' },
  { date: '2027-09-04', name: 'Ganesh Chaturthi',         nameHi: 'गणेश चतुर्थी',          type: 'major',    description: 'Birthday of Lord Ganesha — begins 10-day festival.' },
  { date: '2027-09-30', name: 'Navratri Begins',          nameHi: 'नवरात्रि प्रारंभ',       type: 'major',    description: 'Nine nights of Goddess Durga worship — fasting and Garba dancing.',  longDesc: 'Navratri ("nine nights") is a major Hindu festival dedicated to the nine forms of Goddess Durga. Each of the nine nights is dedicated to one manifestation of Durga. The festival is celebrated with fasting, prayer, Garba and Dandiya dance, and reading the Devi Mahatmyam.' },
  { date: '2027-10-08', name: 'Maha Navami',              nameHi: 'महानवमी',               type: 'major',    description: 'Ninth day of Navratri — worship of Goddess Siddhidatri.',           longDesc: 'Maha Navami is the ninth and last day of Navratri, dedicated to Goddess Siddhidatri, the bestower of supernatural powers. Kanya Puja (worship of young girls as embodiments of the goddess) is performed on this day. Weapons and tools of trade are also worshipped.' },
  { date: '2027-10-09', name: 'Vijayadashami / Dussehra', nameHi: 'विजयदशमी / दशहरा',     type: 'major',    description: 'Rama\'s victory over Ravana — effigies burned across India.',         longDesc: 'Vijayadashami celebrates Lord Rama\'s victory over the demon king Ravana. Enormous effigies of Ravana, Kumbhakarna, and Meghanath are burned in public grounds. In Bengal, it marks the end of Durga Puja, with the immersion of Durga\'s idol.' },
  { date: '2027-10-18', name: 'Karwa Chauth',             nameHi: 'करवा चौथ',              type: 'vrat',     description: 'Married women fast from sunrise to moonrise for their husbands.',     longDesc: 'Karwa Chauth is observed by married Hindu women who fast from sunrise to moonrise for the long life and well-being of their husbands. The fast is broken after sighting the moon and looking at it through a sieve, then looking at the husband\'s face.' },
  { date: '2027-10-27', name: 'Dhanteras',                nameHi: 'धनतेरस',                type: 'major',    description: 'Festival of wealth — buying gold and silver brings prosperity.',      longDesc: 'Dhanteras marks the beginning of the five-day Diwali festival. "Dhan" means wealth and "Teras" refers to the 13th day of the lunar fortnight. Purchasing gold, silver, or new utensils on this day is considered highly auspicious as it is said to multiply wealth.' },
  { date: '2027-10-28', name: 'Narak Chaturdashi',        nameHi: 'नरक चतुर्दशी',          type: 'major',    description: 'Choti Diwali — Krishna\'s victory over Narakasura.',                 longDesc: 'Narak Chaturdashi, also called Choti Diwali or Kali Chaudas, commemorates the killing of the demon Narakasura by Lord Krishna. It is also associated with the legend of Hanuman and the ritual of applying oil and bathing before sunrise.' },
  { date: '2027-10-29', name: 'Diwali',                   nameHi: 'दीपावली',               type: 'major',    description: 'Festival of lights — Lakshmi Puja, fireworks, and sweets.',         longDesc: 'Diwali, the festival of lights, marks the return of Lord Rama to Ayodhya after defeating Ravana. Rows of clay lamps (diyas) are lit to welcome Goddess Lakshmi.' },
  { date: '2027-10-30', name: 'Govardhan Puja',           nameHi: 'गोवर्धन पूजा',          type: 'major',    description: 'Annakut — mountain of food offered to Krishna.',                     longDesc: 'Govardhan Puja commemorates Krishna lifting the Govardhan hill to protect the villagers of Vrindavan from Indra\'s wrath. A mountain of food (Annakut) is created and offered to Lord Krishna before being distributed as prasad.' },
  { date: '2027-10-31', name: 'Bhai Dooj',                nameHi: 'भाई दूज',               type: 'major',    description: 'Festival celebrating the bond of siblings after Diwali.',           longDesc: 'Bhai Dooj (Yama Dwitiya) is a festival celebrating the relationship between brothers and sisters. Sisters apply tilak on their brothers\' foreheads and pray for their long life, while brothers give gifts. The legend involves Yama visiting his sister Yamuna on this day.' },
  { date: '2027-11-04', name: 'Chhath Puja',              nameHi: 'छठ पूजा',               type: 'major',    description: 'Sun worship at riverbanks — major festival in Bihar, UP, and Jharkhand.', longDesc: 'Chhath Puja is dedicated to the Sun God (Surya) and his wife Usha/Pratyusha. Devotees stand in water and offer arghya to the rising and setting sun. The festival involves four days of rituals including holy bathing, fasting, standing in water, and offering prasad.' },
  { date: '2027-11-10', name: 'Dev Uthani Ekadashi',      nameHi: 'देव उठनी एकादशी',       type: 'major',    description: 'Lord Vishnu awakens from four-month cosmic sleep — weddings resume.',  longDesc: 'Dev Uthani Ekadashi (Prabodhini Ekadashi) marks the end of the Chaturmas period when Lord Vishnu awakens from his four-month cosmic sleep. All auspicious occasions including weddings, upanayana, and griha pravesh that were paused during Chaturmas resume from this day.' },
  { date: '2027-12-25', name: 'Christmas',                nameHi: 'क्रिसमस',               type: 'regional', description: 'National public holiday celebrated across India.' },
];
```

- [ ] **Step 6: Verify the array is fully date-sorted and every festival name has an icon/gradient (all 2027 names reuse existing keys, so no new `FESTIVAL_ICON`/`FESTIVAL_GRADIENT` entries are needed)**

Run: `node -e "const fs=require('fs');const src=fs.readFileSync('src/lib/festivals.ts','utf8');const dates=[...src.matchAll(/date: '(\d{4}-\d{2}-\d{2})'/g)].map(m=>m[1]);let sorted=true;for(let i=1;i<dates.length;i++){if(dates[i]<dates[i-1]){sorted=false;console.log('OUT OF ORDER at',i,dates[i-1],'->',dates[i]);}}console.log(sorted?'PASS: all '+dates.length+' dates are in ascending order':'FAIL');"`
Expected: `PASS: all 76 dates are in ascending order` (approximate count — confirm it prints PASS, not FAIL)

- [ ] **Step 7: Run `npm run build`**

Run: `npm run build`
Expected: build completes successfully; `/calendar` and `/festivals` pages now include 2027 entries; new `/festivals/[slug]-2027` detail pages generate (e.g. `/festivals/diwali-2027`); page count increases by ~28

- [ ] **Step 8: Manually verify in dev server**

Open `http://localhost:4321/festivals` and confirm 2027 festivals appear in the "past"/"upcoming" split correctly relative to today's date (2026-07-08); open `http://localhost:4321/calendar`, navigate forward to January 2027, and confirm Makar Sankranti/Lohri/Pongal show on the calendar grid.

- [ ] **Step 9: Commit**

```bash
git add src/lib/festivals.ts src/pages/festivals.astro src/pages/calendar.astro "src/pages/festivals/[slug].astro"
git commit -m "$(cat <<'EOF'
Add 2027 festival data

Clears site-audit-fix-prompts.md #28 (previously skipped after the
amanta-month bug made self-computed dates unreliable — that bug is now
fixed). Dates sourced from drikpanchang.com's 2027 Hindu Calendar via
WebFetch rather than recomputed from this site's own Tithi engine, per
the original skip reason. Renamed FESTIVALS_2025_2026 to
FESTIVALS_2025_2027 and updated all 3 import sites.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Final full-site verification

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: build completes with no errors; final page count is the pre-project count + ~34 (6 new standalone pages + ~28 new festival detail pages)

- [ ] **Step 2: Grep-sweep confirms no remaining stale Moon formula**

Run: `grep -rl "0.010034\*Math.sin(3\*Mpr);" src/lib/kundali.ts src/components/KundaliWidget.astro src/pages/jyotish/*.astro`
Expected: no output (zero matches — confirms no file still terminates at the old 15th term)

- [ ] **Step 3: Grep-sweep confirms no remaining `href="/"` placeholders for the 6 fixed nav labels**

Run: `grep -n 'Sunrise\|Moonrise\|Planetary Positions\|Rahu &amp; Ketu\|Shani (Saturn)\|Gochara' src/components/Header.astro | grep 'href="/"'`
Expected: no output

- [ ] **Step 4: Dev server smoke test across all 6 new pages**

Run: `astro dev --background` (if not already running), then visit each of:
- `http://localhost:4321/sunrise-sunset`
- `http://localhost:4321/moonrise-moonset`
- `http://localhost:4321/planets/planetary-positions`
- `http://localhost:4321/planets/rahu-ketu`
- `http://localhost:4321/planets/shani`
- `http://localhost:4321/planets/gochara`

Expected: each loads without console errors, shows live-computed data for the current real date/time, dark mode toggle (header) doesn't break layout on any of them.

- [ ] **Step 5: Update CLAUDE.md's Known Issues section**

In `CLAUDE.md`, find the bullet:

```
- Header.astro has several placeholder `href="/"` nav items still unfixed: Sunrise & Sunset, Moonrise & Moonset, and the entire Planets menu (Planetary Positions, Rahu & Ketu, Shani, Gochara) — no dedicated pages exist for these yet. ~~Gallery menu~~ (removed 2026-07, no pages existed).
```

Replace with:

```
- ~~Header.astro placeholder Sunrise & Sunset, Moonrise & Moonset, and Planets menu links~~ — fixed 2026-07: added `/sunrise-sunset`, `/moonrise-moonset`, and `/planets/{planetary-positions,rahu-ketu,shani,gochara}` (all live, real-astronomy pages; the 4 Planets pages are location-independent and self-refresh every 60s), wired into all 3 nav-sync locations. ~~Gallery menu~~ (removed 2026-07, no pages existed).
```

Also find and update the Orbital Mechanics section's Moon-formula bullet to note the 26-term propagation to `kundali.ts`/`KundaliWidget.astro`/all 15 `jyotish/*.astro` pages (previously only `panchang.ts`/`index.astro`/`Header.astro` had it).

Also update the two remaining bullets that are now resolved:
```
- **Raksha Bandhan 2026 possibly off by a day** — still unfixed, lower confidence; audit suggests `2026-08-28` instead of `2026-08-27` but this needs independent re-verification against drikpanchang.com (Bhadra timing rules) before changing.
```
becomes:
```
- ~~Raksha Bandhan 2026 possibly off by a day~~ — fixed 2026-07: confirmed `2026-08-28` via drikpanchang.com (Bhadra Kaal ends before sunrise that day).
```
and:
```
- **No 2027 festival data at all** — still unfixed. ...
```
becomes:
```
- ~~No 2027 festival data at all~~ — fixed 2026-07: added a full 2027 block to `src/lib/festivals.ts` (renamed `FESTIVALS_2025_2026` → `FESTIVALS_2025_2027`), sourced from drikpanchang.com's 2027 Hindu Calendar.
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
Update CLAUDE.md Known Issues after clearing the 5 skipped audit items

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
