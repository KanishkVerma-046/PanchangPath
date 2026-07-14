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
