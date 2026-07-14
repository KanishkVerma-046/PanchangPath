# Full-Site Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Playwright-based crawler plus supporting checker scripts that inspect every generated page of PanchangPath (~350 routes), then use their output — combined with a targeted manual visual/data pass — to produce a single written audit report at `docs/audits/2026-07-14-full-site-audit.md`.

**Architecture:** A small collection of pure, unit-tested Node ESM modules under `scripts/audit/lib/` (route enumeration, internal-link checking, Playwright-driven page analysis, festival-date-ordering checking, header-nav-sync checking), wired together by a `scripts/audit/crawl.mjs` orchestrator that drives a real Chromium instance against the built site (`astro preview`) and two small CLI runners for the data-correctness checks. Manual review (visual screenshots, spot-checks, known-issue regression check) fills the gaps a script can't cover, and everything is merged into the final markdown report.

**Tech Stack:** Node.js (>=22.12.0, ESM, built-in `node:test` runner), Playwright (`playwright` npm package, already a devDependency — browser automation only, no `@playwright/test` runner involved).

## Global Constraints

- Node >= 22.12.0 (per `package.json` engines) — use built-in `node:test`/`node:assert`, no new test framework dependency.
- Playwright version already pinned at `^1.61.1` in devDependencies — do not add `@playwright/test`, use the `playwright` package's `chromium.launch()` API directly.
- The crawler must run against `astro preview` (the built `dist/`), never `astro dev` — results must reflect what actually ships.
- No fixes to `src/` are applied as part of this plan — this is a report-only audit. Only files under `scripts/audit/`, `docs/audits/`, and `package.json`/`.gitignore` are touched.
- Report location is fixed: `docs/audits/2026-07-14-full-site-audit.md`.
- Screenshots and raw crawl JSON output (`scripts/audit/output/`) are generated artifacts — never commit them.

---

## File Structure

```
scripts/audit/
  lib/
    routes.mjs              # Task 1 — dist/ → route list
    checkLinks.mjs           # Task 2 — internal link extraction/validation
    pageChecks.mjs           # Task 3 — Playwright page analysis (overflow, alt, ids, dead links)
    checkFestivalOrder.mjs   # Task 4 — festival chronological-order checker
    checkNavSync.mjs         # Task 5 — header nav 3-way sync checker
  test/
    routes.test.mjs
    checkLinks.test.mjs
    pageChecks.test.mjs
    checkFestivalOrder.test.mjs
    checkNavSync.test.mjs
  crawl.mjs                  # Task 6 — orchestrator, produces crawl-results.json + screenshots
  run-festival-check.mjs     # Task 4 — CLI wrapper
  run-nav-sync.mjs           # Task 5 — CLI wrapper
  output/                    # gitignored — crawl-results.json, screenshots/
docs/audits/
  notes/
    2026-07-14-visual-review.md       # Task 7
    2026-07-14-data-correctness.md    # Task 8
  2026-07-14-full-site-audit.md       # Task 9 — final deliverable
```

---

### Task 1: Route enumerator

**Files:**
- Create: `scripts/audit/lib/routes.mjs`
- Test: `scripts/audit/test/routes.test.mjs`
- Modify: `package.json` (add `"test:audit": "node --test scripts/audit/test"` script)
- Modify: `.gitignore` (add `scripts/audit/output/`)

**Interfaces:**
- Produces: `enumerateRoutes(distDir: string): string[]` (sorted, unique route paths, e.g. `'/'`, `'/festivals/diwali-2025/'`, `'/404'`), `htmlPathToRoute(relativeHtmlPath: string): string`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/audit/test/routes.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { enumerateRoutes, htmlPathToRoute } from '../lib/routes.mjs';

test('htmlPathToRoute converts root index.html to /', () => {
  assert.equal(htmlPathToRoute('index.html'), '/');
});

test('htmlPathToRoute converts nested index.html to a trailing-slash route', () => {
  assert.equal(htmlPathToRoute('festivals/diwali-2025/index.html'), '/festivals/diwali-2025/');
});

test('htmlPathToRoute converts a bare page file to a slash-prefixed, no-trailing-slash route', () => {
  assert.equal(htmlPathToRoute('404.html'), '/404');
});

test('enumerateRoutes walks a directory tree and returns sorted routes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'audit-routes-'));
  writeFileSync(join(dir, 'index.html'), '<html></html>');
  mkdirSync(join(dir, 'about'));
  writeFileSync(join(dir, 'about', 'index.html'), '<html></html>');
  mkdirSync(join(dir, 'festivals', 'diwali-2025'), { recursive: true });
  writeFileSync(join(dir, 'festivals', 'diwali-2025', 'index.html'), '<html></html>');
  writeFileSync(join(dir, '404.html'), '<html></html>');

  const routes = enumerateRoutes(dir);

  assert.deepEqual(routes, ['/', '/404', '/about/', '/festivals/diwali-2025/']);
  rmSync(dir, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/audit/test/routes.test.mjs`
Expected: FAIL — `Cannot find module '../lib/routes.mjs'`

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/audit/lib/routes.mjs
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export function enumerateRoutes(distDir) {
  const routes = [];
  walk(distDir, distDir, routes);
  return routes.sort();
}

function walk(dir, root, routes) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, root, routes);
    } else if (entry.endsWith('.html')) {
      routes.push(htmlPathToRoute(relative(root, full)));
    }
  }
}

export function htmlPathToRoute(relPath) {
  const posixPath = relPath.split(sep).join('/');
  if (posixPath === 'index.html') return '/';
  if (posixPath.endsWith('/index.html')) {
    return '/' + posixPath.slice(0, -'index.html'.length);
  }
  return '/' + posixPath.slice(0, -'.html'.length);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/audit/test/routes.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 5: Add the test:audit script and .gitignore entry**

In `package.json`, add to `"scripts"`:
```json
"test:audit": "node --test scripts/audit/test"
```

In `.gitignore`, add:
```
scripts/audit/output/
```

- [ ] **Step 6: Commit**

```bash
git add scripts/audit/lib/routes.mjs scripts/audit/test/routes.test.mjs package.json .gitignore
git commit -m "Add route enumerator for full-site audit crawler"
```

---

### Task 2: Internal link checker

**Files:**
- Create: `scripts/audit/lib/checkLinks.mjs`
- Test: `scripts/audit/test/checkLinks.test.mjs`

**Interfaces:**
- Consumes: none (pure functions over strings)
- Produces: `extractInternalLinks(html: string, origin: string): string[]`, `findBrokenLinks(links: string[], knownRoutes: Set<string>): string[]`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/audit/test/checkLinks.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractInternalLinks, findBrokenLinks } from '../lib/checkLinks.mjs';

test('extractInternalLinks pulls same-origin/relative hrefs, strips query+hash, ignores external/mailto/anchor links', () => {
  const html = `
    <a href="/festivals/diwali-2025">Diwali</a>
    <a href="https://panchangpath.com/about">About</a>
    <a href="https://external.com/x">External</a>
    <a href="mailto:hi@panchangpath.com">Email</a>
    <a href="#section">Anchor</a>
    <a href="/muhurta/shubha-dates?activity=vehicle">Shubha Dates</a>
  `;
  const links = extractInternalLinks(html, 'https://panchangpath.com');
  assert.deepEqual(
    links.sort(),
    ['/about', '/festivals/diwali-2025', '/muhurta/shubha-dates'].sort()
  );
});

test('findBrokenLinks flags links missing from the known route set, ignoring trailing-slash differences', () => {
  const known = new Set(['/', '/festivals/diwali-2025/', '/muhurta/shubha-dates/']);
  const broken = findBrokenLinks(
    ['/festivals/diwali-2025', '/muhurta/shubha-dates', '/does-not-exist'],
    known
  );
  assert.deepEqual(broken, ['/does-not-exist']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/audit/test/checkLinks.test.mjs`
Expected: FAIL — `Cannot find module '../lib/checkLinks.mjs'`

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/audit/lib/checkLinks.mjs
export function extractInternalLinks(html, origin) {
  const hrefRegex = /<a\s[^>]*href="([^"]+)"/g;
  const links = [];
  let m;
  while ((m = hrefRegex.exec(html))) {
    const href = m[1];
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    ) {
      continue;
    }
    let path;
    if (href.startsWith(origin)) {
      path = href.slice(origin.length);
    } else if (href.startsWith('http://') || href.startsWith('https://')) {
      continue;
    } else {
      path = href;
    }
    path = path.split('?')[0].split('#')[0];
    if (!path.startsWith('/')) path = '/' + path;
    links.push(path);
  }
  return links;
}

export function findBrokenLinks(links, knownRoutes) {
  const normalizedKnown = new Set(Array.from(knownRoutes).map(normalizeForCompare));
  return links.filter((link) => !normalizedKnown.has(normalizeForCompare(link)));
}

function normalizeForCompare(route) {
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(route);
  if (hasExtension || route === '') return route;
  return route.endsWith('/') ? route : route + '/';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/audit/test/checkLinks.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/audit/lib/checkLinks.mjs scripts/audit/test/checkLinks.test.mjs
git commit -m "Add internal link extraction/validation for full-site audit crawler"
```

---

### Task 3: Playwright page analyzer

**Files:**
- Create: `scripts/audit/lib/pageChecks.mjs`
- Test: `scripts/audit/test/pageChecks.test.mjs`

**Interfaces:**
- Consumes: a live Playwright `Page` object (already navigated to the target page)
- Produces: `analyzePage(page): Promise<{ overflow: boolean, missingAlt: string[], brokenImages: string[], duplicateIds: string[], deadLinks: string[] }>`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/audit/test/pageChecks.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { analyzePage } from '../lib/pageChecks.mjs';

test('analyzePage detects overflow, missing alt text, duplicate ids, and dead links', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
    await page.setContent(`
      <html><body>
        <div style="width:2000px">wide content forces horizontal overflow</div>
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="has alt">
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">
        <div id="dup"></div>
        <span id="dup"></span>
        <a href="#">dead link</a>
        <a href="/festivals">real link</a>
      </body></html>
    `);

    const result = await analyzePage(page);

    assert.equal(result.overflow, true);
    assert.equal(result.missingAlt.length, 1);
    assert.deepEqual(result.duplicateIds, ['dup']);
    assert.equal(result.deadLinks.length, 1);
  } finally {
    await browser.close();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/audit/test/pageChecks.test.mjs`
Expected: FAIL — `Cannot find module '../lib/pageChecks.mjs'`

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/audit/lib/pageChecks.mjs
export async function analyzePage(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );

  const missingAlt = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((img) => !img.hasAttribute('alt') || img.getAttribute('alt').trim() === '')
      .map((img) => img.getAttribute('src') || '(no src)')
  );

  const brokenImages = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src') || '(no src)')
  );

  const duplicateIds = await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    const seen = new Set();
    const dupes = new Set();
    for (const id of ids) {
      if (seen.has(id)) dupes.add(id);
      seen.add(id);
    }
    return Array.from(dupes);
  });

  const deadLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .filter((a) => {
        const href = a.getAttribute('href');
        return !href || href.trim() === '' || href.trim() === '#';
      })
      .map((a) => a.outerHTML.slice(0, 160))
  );

  return { overflow, missingAlt, brokenImages, duplicateIds, deadLinks };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/audit/test/pageChecks.test.mjs`
Expected: PASS (1 test) — this launches a real headless Chromium, so it will take a few seconds longer than the other unit tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/audit/lib/pageChecks.mjs scripts/audit/test/pageChecks.test.mjs
git commit -m "Add Playwright-driven page analyzer for full-site audit crawler"
```

---

### Task 4: Festival chronological-order checker

**Files:**
- Create: `scripts/audit/lib/checkFestivalOrder.mjs`
- Create: `scripts/audit/run-festival-check.mjs`
- Test: `scripts/audit/test/checkFestivalOrder.test.mjs`

**Interfaces:**
- Consumes: raw text of `src/lib/festivals.ts`
- Produces: `parseFestivals(sourceText: string): {date: string, name: string, year: string}[]`, `checkFestivalOrder(festivals, rules: [string, string][]): {year, before, beforeDate, after, afterDate}[]`, `DEFAULT_ORDER_RULES: [string, string][]`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/audit/test/checkFestivalOrder.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFestivals,
  checkFestivalOrder,
  DEFAULT_ORDER_RULES,
} from '../lib/checkFestivalOrder.mjs';

test('parseFestivals extracts date/name pairs from festivals.ts-style object literals', () => {
  const source = `
    export const FESTIVALS_2025_2027 = [
      { date: '2025-10-20', name: 'Dhanteras', nameHi: 'धनतेरस', type: 'major', description: 'x' },
      { date: '2025-10-21', name: 'Narak Chaturdashi', nameHi: 'नरक चतुर्दशी', type: 'major', description: 'x' },
      { date: '2025-10-20', name: 'Diwali', nameHi: 'दीपावली', type: 'major', description: 'x' },
    ];
  `;
  const festivals = parseFestivals(source);
  assert.deepEqual(festivals, [
    { date: '2025-10-20', name: 'Dhanteras', year: '2025' },
    { date: '2025-10-21', name: 'Narak Chaturdashi', year: '2025' },
    { date: '2025-10-20', name: 'Diwali', year: '2025' },
  ]);
});

test('checkFestivalOrder finds no violations for correctly-ordered festivals', () => {
  const festivals = [
    { date: '2025-10-20', name: 'Dhanteras', year: '2025' },
    { date: '2025-10-19', name: 'Narak Chaturdashi', year: '2025' },
    { date: '2025-10-20', name: 'Diwali', year: '2025' },
  ];
  const violations = checkFestivalOrder(festivals, DEFAULT_ORDER_RULES);
  assert.deepEqual(violations, []);
});

test('checkFestivalOrder flags the known Narak Chaturdashi-after-Diwali pattern', () => {
  const festivals = [
    { date: '2025-10-20', name: 'Dhanteras', year: '2025' },
    { date: '2025-10-21', name: 'Narak Chaturdashi', year: '2025' },
    { date: '2025-10-20', name: 'Diwali', year: '2025' },
  ];
  const violations = checkFestivalOrder(festivals, DEFAULT_ORDER_RULES);
  assert.deepEqual(violations, [
    {
      year: '2025',
      before: 'Narak Chaturdashi',
      beforeDate: '2025-10-21',
      after: 'Diwali',
      afterDate: '2025-10-20',
    },
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/audit/test/checkFestivalOrder.test.mjs`
Expected: FAIL — `Cannot find module '../lib/checkFestivalOrder.mjs'`

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/audit/lib/checkFestivalOrder.mjs
export const DEFAULT_ORDER_RULES = [
  ['Navratri Begins', 'Maha Navami'],
  ['Maha Navami', 'Vijayadashami / Dussehra'],
  ['Dhanteras', 'Diwali'],
  ['Narak Chaturdashi', 'Diwali'],
  ['Diwali', 'Govardhan Puja'],
  ['Govardhan Puja', 'Bhai Dooj'],
  ['Holika Dahan', 'Holi'],
  ['Ganesh Chaturthi', 'Ganesh Visarjan'],
];

export function parseFestivals(sourceText) {
  const regex = /\{\s*date:\s*'([^']+)',\s*name:\s*'([^']+)'/g;
  const festivals = [];
  let m;
  while ((m = regex.exec(sourceText))) {
    festivals.push({ date: m[1], name: m[2], year: m[1].slice(0, 4) });
  }
  return festivals;
}

export function checkFestivalOrder(festivals, rules) {
  const byYear = new Map();
  for (const f of festivals) {
    if (!byYear.has(f.year)) byYear.set(f.year, new Map());
    byYear.get(f.year).set(f.name, f.date);
  }
  const violations = [];
  for (const [year, byName] of byYear) {
    for (const [before, after] of rules) {
      const beforeDate = byName.get(before);
      const afterDate = byName.get(after);
      if (beforeDate && afterDate && beforeDate > afterDate) {
        violations.push({ year, before, beforeDate, after, afterDate });
      }
    }
  }
  return violations.sort((a, b) => a.year.localeCompare(b.year));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/audit/test/checkFestivalOrder.test.mjs`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the CLI runner**

```javascript
// scripts/audit/run-festival-check.mjs
import { readFileSync } from 'node:fs';
import { parseFestivals, checkFestivalOrder, DEFAULT_ORDER_RULES } from './lib/checkFestivalOrder.mjs';

const source = readFileSync(new URL('../../src/lib/festivals.ts', import.meta.url), 'utf8');
const festivals = parseFestivals(source);
const violations = checkFestivalOrder(festivals, DEFAULT_ORDER_RULES);

if (violations.length === 0) {
  console.log('No festival ordering violations found.');
} else {
  console.log(`${violations.length} violation(s):`);
  for (const v of violations) {
    console.log(
      `  [${v.year}] ${v.before} (${v.beforeDate}) should precede ${v.after} (${v.afterDate}) but does not`
    );
  }
}
```

- [ ] **Step 6: Run the CLI against the real file to sanity-check it works**

Run: `node scripts/audit/run-festival-check.mjs`
Expected: at least one violation printed for `[2025] Narak Chaturdashi (2025-10-21) should precede Diwali (2025-10-20) but does not` — this is the already-known, not-yet-fixed bug from CLAUDE.md, so seeing it confirms the checker works against real data. Do not fix it — that's out of scope for this audit.

- [ ] **Step 7: Commit**

```bash
git add scripts/audit/lib/checkFestivalOrder.mjs scripts/audit/run-festival-check.mjs scripts/audit/test/checkFestivalOrder.test.mjs
git commit -m "Add festival chronological-order checker for full-site audit"
```

---

### Task 5: Header nav 3-way sync checker

**Files:**
- Create: `scripts/audit/lib/checkNavSync.mjs`
- Create: `scripts/audit/run-nav-sync.mjs`
- Test: `scripts/audit/test/checkNavSync.test.mjs`

**Interfaces:**
- Consumes: raw text of `src/components/Header.astro`
- Produces: `extractNavLinks(sourceText): { desktop: Set<string>, drawer: Set<string>, search: Set<string> }`, `diffNavSets(sets): { url: string, inDesktop: boolean, inDrawer: boolean, inSearch: boolean }[]`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/audit/test/checkNavSync.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractNavLinks, diffNavSets } from '../lib/checkNavSync.mjs';

const fixture = `
  <a href="/muhurta/rahu-kala" class="dd-link">Rahu Kalam</a>
  <a href="/jyotish/kundali" class="dd-link">Kundali Generator</a>
  <a href="/muhurta/rahu-kala" class="drawer-link">Rahu Kalam</a>
  <a href="/jyotish" class="dd-link dd-link-accent">All Calculators</a>

  const searchItems = [
    { label: "Rahu Kala", url: "/muhurta/rahu-kala" },
    { label: "Sunrise & Sunset", url: "/sunrise-sunset" },
  ];
`;

test('extractNavLinks pulls dd-link, drawer-link, and searchItems urls into separate sets', () => {
  const sets = extractNavLinks(fixture);
  assert.deepEqual(
    Array.from(sets.desktop).sort(),
    ['/jyotish', '/jyotish/kundali', '/muhurta/rahu-kala'].sort()
  );
  assert.deepEqual(Array.from(sets.drawer).sort(), ['/muhurta/rahu-kala']);
  assert.deepEqual(
    Array.from(sets.search).sort(),
    ['/muhurta/rahu-kala', '/sunrise-sunset'].sort()
  );
});

test('diffNavSets reports every url missing from at least one of the three surfaces', () => {
  const sets = extractNavLinks(fixture);
  const diffs = diffNavSets(sets);
  const byUrl = Object.fromEntries(diffs.map((d) => [d.url, d]));

  assert.equal(byUrl['/jyotish/kundali'].inDrawer, false);
  assert.equal(byUrl['/jyotish/kundali'].inSearch, false);
  assert.equal(byUrl['/sunrise-sunset'].inDesktop, false);
  assert.equal(byUrl['/sunrise-sunset'].inDrawer, false);
  assert.equal(byUrl['/muhurta/rahu-kala'], undefined);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/audit/test/checkNavSync.test.mjs`
Expected: FAIL — `Cannot find module '../lib/checkNavSync.mjs'`

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/audit/lib/checkNavSync.mjs
function extractByClass(source, className) {
  const regex = new RegExp(`<a\\s+href="([^"]+)"\\s+class="${className}\\b`, 'g');
  const set = new Set();
  let m;
  while ((m = regex.exec(source))) set.add(normalizeUrl(m[1]));
  return set;
}

function extractSearchItems(source) {
  const set = new Set();
  const match = source.match(/const searchItems = \[([\s\S]*?)\n\s*\];/);
  if (!match) return set;
  const itemRegex = /url:\s*"([^"]+)"/g;
  let m;
  while ((m = itemRegex.exec(match[1]))) set.add(normalizeUrl(m[1]));
  return set;
}

function normalizeUrl(url) {
  return url.split('?')[0].split('#')[0];
}

export function extractNavLinks(source) {
  return {
    desktop: extractByClass(source, 'dd-link'),
    drawer: extractByClass(source, 'drawer-link'),
    search: extractSearchItems(source),
  };
}

export function diffNavSets({ desktop, drawer, search }) {
  const all = new Set([...desktop, ...drawer, ...search]);
  const diffs = [];
  for (const url of all) {
    const inDesktop = desktop.has(url);
    const inDrawer = drawer.has(url);
    const inSearch = search.has(url);
    if (!(inDesktop && inDrawer && inSearch)) {
      diffs.push({ url, inDesktop, inDrawer, inSearch });
    }
  }
  return diffs.sort((a, b) => a.url.localeCompare(b.url));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/audit/test/checkNavSync.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 5: Write the CLI runner**

```javascript
// scripts/audit/run-nav-sync.mjs
import { readFileSync } from 'node:fs';
import { extractNavLinks, diffNavSets } from './lib/checkNavSync.mjs';

const source = readFileSync(new URL('../../src/components/Header.astro', import.meta.url), 'utf8');
const sets = extractNavLinks(source);
const diffs = diffNavSets(sets);

if (diffs.length === 0) {
  console.log('Desktop dropdown, mobile drawer, and searchItems are in sync.');
} else {
  console.log(`${diffs.length} URL(s) not present in all three nav surfaces:`);
  for (const d of diffs) {
    console.log(`  ${d.url} — desktop:${d.inDesktop} drawer:${d.inDrawer} search:${d.inSearch}`);
  }
}
```

- [ ] **Step 6: Run the CLI against the real file**

Run: `node scripts/audit/run-nav-sync.mjs`
Expected: some output — either "in sync" or a list of mismatched URLs. Note: this regex-based extractor is a heuristic (e.g. it normalizes away query strings, so `/muhurta/shubha-dates?activity=vehicle` and `/muhurta/shubha-dates` collapse to one URL); treat its output as candidates for manual confirmation in Task 8, not ground truth.

- [ ] **Step 7: Commit**

```bash
git add scripts/audit/lib/checkNavSync.mjs scripts/audit/run-nav-sync.mjs scripts/audit/test/checkNavSync.test.mjs
git commit -m "Add header nav 3-way sync checker for full-site audit"
```

---

### Task 6: Crawl orchestrator — full site run

**Files:**
- Create: `scripts/audit/crawl.mjs`
- Modify: `package.json` (add `"audit:crawl": "node scripts/audit/crawl.mjs"` script)

**Interfaces:**
- Consumes: `enumerateRoutes` from Task 1, `extractInternalLinks`/`findBrokenLinks` from Task 2, `analyzePage` from Task 3
- Produces: `scripts/audit/output/crawl-results.json` (array of `{ route, breakpoints: { mobile, tablet, desktop } }` records, each breakpoint entry containing `status, consoleErrors, failedRequests, brokenLinks, missingAlt, brokenImages, duplicateIds, deadLinks, overflow, screenshot, flagged`) and `scripts/audit/output/screenshots/<route>/<breakpoint>.png` files — consumed by Tasks 7 and 9.

- [ ] **Step 1: Write the orchestrator**

```javascript
// scripts/audit/crawl.mjs
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { enumerateRoutes } from './lib/routes.mjs';
import { extractInternalLinks, findBrokenLinks } from './lib/checkLinks.mjs';
import { analyzePage } from './lib/pageChecks.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(HERE, '..', '..', 'dist');
const OUTPUT_DIR = join(HERE, 'output');
const BASE_URL = process.env.AUDIT_BASE_URL || 'http://localhost:4321';

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

function routeToDirName(route) {
  const trimmed = route.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '_');
  return trimmed === '' ? 'root' : trimmed;
}

async function checkOneBreakpoint(browser, route, knownRoutes, bp) {
  const page = await browser.newPage({ viewport: { width: bp.width, height: bp.height } });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const failedRequests = [];
  page.on('response', (res) => {
    if (!res.ok() && res.request().resourceType() !== 'document') {
      failedRequests.push({ url: res.url(), status: res.status() });
    }
  });

  try {
    const url = new URL(route, BASE_URL).toString();
    const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    const status = response ? response.status() : null;

    const html = await page.content();
    const links = extractInternalLinks(html, BASE_URL);
    const brokenLinks = findBrokenLinks(links, knownRoutes);

    const checks = await analyzePage(page);

    const screenshotDir = join(OUTPUT_DIR, 'screenshots', routeToDirName(route));
    mkdirSync(screenshotDir, { recursive: true });
    const screenshotPath = join(screenshotDir, `${bp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // missingAlt is deliberately excluded from `flagged` — it's common and cosmetic
    // (Low severity); including it would flag most pages and defeat the point of
    // scoping visual review to templates + genuine outliers.
    const flagged =
      status !== 200 ||
      consoleErrors.length > 0 ||
      failedRequests.length > 0 ||
      brokenLinks.length > 0 ||
      checks.overflow ||
      checks.brokenImages.length > 0 ||
      checks.duplicateIds.length > 0 ||
      checks.deadLinks.length > 0;

    return {
      status,
      consoleErrors,
      failedRequests,
      brokenLinks,
      ...checks,
      screenshot: screenshotPath,
      flagged,
    };
  } catch (err) {
    return { error: err.message, flagged: true };
  } finally {
    await page.close();
  }
}

async function main() {
  const routes = enumerateRoutes(DIST_DIR);
  const knownRoutes = new Set(routes);
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const results = [];

  for (const route of routes) {
    const record = { route, breakpoints: {} };
    for (const bp of BREAKPOINTS) {
      record.breakpoints[bp.name] = await checkOneBreakpoint(browser, route, knownRoutes, bp);
    }
    results.push(record);
    console.log(`checked ${route}`);
  }

  await browser.close();
  const outputPath = join(OUTPUT_DIR, 'crawl-results.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Done. ${results.length} routes checked. Output: ${outputPath}`);
}

main();
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `"scripts"`:
```json
"audit:crawl": "node scripts/audit/crawl.mjs"
```

- [ ] **Step 3: Build the site and start the preview server**

Run: `npm run build`
Expected: build succeeds, `dist/` populated.

In a separate terminal (or background process), run: `npm run preview`
Expected: prints a URL, typically `http://localhost:4321`. If it prints a different port, export `AUDIT_BASE_URL` accordingly before Step 4 (e.g. `AUDIT_BASE_URL=http://localhost:4322`).

- [ ] **Step 4: Run the full crawl**

Run: `npm run audit:crawl`
Expected: one `checked /route` line per page (~350 routes × 3 breakpoints internally, so this will take a while — plan for 20-60 minutes depending on machine; the per-route log line lets you monitor progress). Finishes with `Done. <N> routes checked. Output: .../crawl-results.json`.

- [ ] **Step 5: Verify the output**

Run:
```bash
node -e "const r = JSON.parse(require('fs').readFileSync('scripts/audit/output/crawl-results.json')); console.log('records:', r.length); console.log('flagged:', r.filter(x => Object.values(x.breakpoints).some(b => b.flagged)).length);"
```
Expected: `records:` matches the route count from `enumerateRoutes` (spot-check by also running `node -e "console.log(require('./scripts/audit/lib/routes.mjs'))"` — or just trust the crawl log's final count against how many `checked` lines were printed). Confirm at least one known route, e.g. `/festivals/diwali-2025/`, is present with `status: 200`.

- [ ] **Step 6: Commit**

```bash
git add scripts/audit/crawl.mjs package.json
git commit -m "Add crawl orchestrator for full-site audit; run full crawl"
```

(The generated `scripts/audit/output/` directory is gitignored and stays local — it's the raw input to Tasks 7 and 9, not a deliverable itself.)

---

### Task 7: Visual review pass

**Files:**
- Create: `docs/audits/notes/2026-07-14-visual-review.md`

**Interfaces:**
- Consumes: `scripts/audit/output/crawl-results.json` and `scripts/audit/output/screenshots/` from Task 6
- Produces: `docs/audits/notes/2026-07-14-visual-review.md`, consumed by Task 9

- [ ] **Step 1: List the unique templates to review**

Open a screenshot (desktop breakpoint at minimum; mobile too for anything content-dense) for one representative route from each of these template groups:

- Top-level: `/`, `/about`, `/calendar`, `/contact`, `/kundali`, `/muhurta`, `/jyotish`, `/festivals`, `/prashnavali`, `/privacy`, `/terms`, `/sunrise-sunset`, `/moonrise-moonset`, `/404`, `/500`, `/devotional`, `/panchang/regional`, `/events`, `/rashifal`, `/blog`
- Blog: one `/blog/<slug>` post
- Jyotish (15): `/jyotish/{gemstone,horoscope-match,janma-kundali,kalasarpa,kundali,lagna,mangal-dosha,nakshatra,pancha-pakshi,rashi,rudraksha,sadesati,sahasra-chandrodaya,shraddha,sunsign}`
- Muhurta (9): `/muhurta/{abhijit,choghadiya,griha-pravesh,hora,lagna,panchaka,rahu-kala,shubha-dates,vivah}`
- Devotional (index + 1 detail per category, 10 categories + sundarkand's single detail): `/devotional/{aarti,ashtakam,chalisa,durga-saptashati,mantra,namavali,puja-vidhi,stotram,vrat-katha,yantra}` index and one `[slug]` each, plus `/devotional/sundarkand/<its-one-slug>`
- Panchang regional: `/panchang/regional` hub + one `/panchang/<region>` example
- Festivals: `/festivals` hub + one `/festivals/<slug>` example
- Events: `/events` hub + one `/events/<id>` example
- Rashifal: `/rashifal` hub + one `/rashifal/<rashi>` example
- Planets (4, each distinct): `/planets/{planetary-positions,rahu-ketu,shani,gochara}`

- [ ] **Step 2: Review flagged pages**

Load `scripts/audit/output/crawl-results.json`, filter to records where any breakpoint has `flagged: true`, and open each flagged screenshot. For every flagged page, either confirm it's a genuine visual/layout problem or note it as a false positive (e.g. an intentionally wide horizontally-scrollable table).

- [ ] **Step 3: Record findings**

For every genuine issue found in Steps 1–2, append an entry to `docs/audits/notes/2026-07-14-visual-review.md` using this format:

```markdown
### <route> (<breakpoint>)
- **Issue:** <what's visually wrong, described concretely>
- **Screenshot:** scripts/audit/output/screenshots/<dir>/<breakpoint>.png
- **Severity guess:** Critical | High | Medium | Low
```

If a template has no issues, skip it — the notes file should only contain actual findings, not a checklist of clean pages.

- [ ] **Step 4: Commit**

```bash
git add docs/audits/notes/2026-07-14-visual-review.md
git commit -m "Record visual review findings for full-site audit"
```

---

### Task 8: Data/content correctness pass

**Files:**
- Create: `docs/audits/notes/2026-07-14-data-correctness.md`

**Interfaces:**
- Consumes: `run-festival-check.mjs`/`run-nav-sync.mjs` output (Tasks 4–5), CLAUDE.md's "Known Issues" section, drikpanchang.com
- Produces: `docs/audits/notes/2026-07-14-data-correctness.md`, consumed by Task 9

- [ ] **Step 1: Festival ordering**

Run: `node scripts/audit/run-festival-check.mjs`
Copy its output verbatim into the notes file under a `## Festival Ordering` heading.

- [ ] **Step 2: Header nav sync**

Run: `node scripts/audit/run-nav-sync.mjs`
Copy its output into the notes file under a `## Header Nav Sync` heading. For each reported mismatch, manually open `src/components/Header.astro` and confirm whether it's a real gap or a false positive from the checker's query-string normalization (see Task 5, Step 6 note).

- [ ] **Step 3: Known-issues regression check**

Open `CLAUDE.md`'s "Known Issues" section. For each still-open bullet (not struck through), grep the referenced file for the described pattern to confirm it's still present in current code. For each struck-through ("fixed") bullet, spot-check one that seems risky to re-verify it's actually fixed. Record any mismatches (marked-open-but-actually-fixed, or marked-fixed-but-actually-still-broken) in the notes file under a `## Known Issues Regression Check` heading.

- [ ] **Step 4: Stale markers scan**

Run:
```bash
grep -rn "TODO\|FIXME" src/
grep -rn "console.log" src/
```
Record any hits (file:line + context) in the notes file under a `## Stale Markers` heading.

- [ ] **Step 5: Astronomy spot-check**

For 2026-07-14, New Delhi: open the running dev/preview server's homepage with location set to New Delhi and record the displayed Tithi, Nakshatra, Yoga, Karana, and Rahu Kalam window. Separately, `WebFetch` drikpanchang.com's panchang page for New Delhi on that date and extract the same five values. Record both sets of values side by side in the notes file under a `## Astronomy Spot-Check (2026-07-14, New Delhi)` heading, noting any mismatches.

- [ ] **Step 6: Commit**

```bash
git add docs/audits/notes/2026-07-14-data-correctness.md
git commit -m "Record data/content correctness findings for full-site audit"
```

---

### Task 9: Compile final report

**Files:**
- Create: `docs/audits/2026-07-14-full-site-audit.md`

**Interfaces:**
- Consumes: `scripts/audit/output/crawl-results.json` (Task 6), `docs/audits/notes/2026-07-14-visual-review.md` (Task 7), `docs/audits/notes/2026-07-14-data-correctness.md` (Task 8), `CLAUDE.md`

- [ ] **Step 1: Extract automated findings**

From `scripts/audit/output/crawl-results.json`, list every record with any `flagged: true` breakpoint, grouped by which field triggered it (`brokenLinks`, `consoleErrors`, `failedRequests`, `overflow`, `brokenImages`, `duplicateIds`, `deadLinks`, non-200 `status`).

- [ ] **Step 2: Write the report using this skeleton**

```markdown
# Full-Site Audit — 2026-07-14

Scope: ~<N> generated pages, crawled via `scripts/audit/crawl.mjs`
(automated: broken links/images, console errors, horizontal overflow at
375/768/1440px, duplicate DOM ids, dead links — zero sampling) plus a
manual visual pass over every unique page template and every
automatically-flagged page, plus a manual data/content correctness pass.

Findings already tracked in CLAUDE.md's "Known Issues" section are marked
as such rather than repeated here.

## Critical

### Broken Links
...

### Data Accuracy
...

### UI/Responsive
...

## High

### Broken Links
...

### Data Accuracy
...

### UI/Responsive
...

### Dead Controls
...

## Medium

### UI/Responsive
...

### Content Quality
...

## Low

### Content Quality/SEO
...

## Already Tracked in CLAUDE.md

<list of findings from this audit that duplicate an existing Known Issues
bullet, each with a one-line pointer to the CLAUDE.md bullet>

## Appendix: Crawl Summary

- Routes checked: <N>
- Routes flagged: <N>
- Raw data: `scripts/audit/output/crawl-results.json` (not committed — regenerate via `npm run audit:crawl`)
```

Fill every section with real findings from Tasks 6–8's output. Each finding needs a `file:line` or route reference, a one-line description, and evidence (screenshot path, checker output line, or drikpanchang comparison value). Omit any severity/area combination with zero findings rather than leaving a placeholder.

- [ ] **Step 3: Cross-reference CLAUDE.md**

For each finding, check whether it matches an existing CLAUDE.md Known Issues bullet. If so, move it to the "Already Tracked in CLAUDE.md" section instead of listing it as new.

- [ ] **Step 4: Commit**

```bash
git add docs/audits/2026-07-14-full-site-audit.md
git commit -m "Add full-site audit report"
```

---

## Self-Review Notes

- **Spec coverage:** Phase 1 (build/enumerate) → Task 1. Phase 2 (automated crawl) → Tasks 1–3, 6. Phase 3 (visual review scope) → Task 7. Phase 4 (data/content correctness) → Tasks 4, 5, 8. Phase 5 (report) → Task 9. All five spec phases have a corresponding task.
- **Placeholder scan:** no TBD/TODO markers; Tasks 7–9 depend on investigation results that can't be known ahead of time, but every step specifies the exact procedure, commands, and output format rather than leaving the "how" vague.
- **Type consistency:** `analyzePage` returns `deadLinks` (not `deadControls`) consistently across Tasks 3, 6, and 9's field list. `checkFestivalOrder`/`parseFestivals`/`DEFAULT_ORDER_RULES` names match between Task 4's module, its test, and its CLI runner. `extractNavLinks`/`diffNavSets` match between Task 5's module, test, and CLI runner.
