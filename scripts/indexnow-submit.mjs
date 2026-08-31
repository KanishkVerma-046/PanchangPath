#!/usr/bin/env node
// Submits URLs to the IndexNow API (https://www.indexnow.org/) so participating
// search engines (Bing, Yandex, ...) can crawl new/changed content immediately
// instead of waiting for their next scheduled crawl. Usable both as a CLI and
// as an importable function.
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const INDEXNOW_KEY = '40561200baba459aa3fc4b890c7e49df';
const HOST = 'panchangpath.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

export async function submitToIndexNow(urls) {
  if (!urls || urls.length === 0) {
    throw new Error('[indexnow] no URLs to submit');
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    }),
  });

  const body = await res.text();

  if (!res.ok) {
    console.error(
      `[indexnow] submission FAILED for ${urls.length} URL(s) — HTTP ${res.status}${body ? `: ${body}` : ' (no response body)'}`
    );
    throw new Error(`IndexNow submission failed: HTTP ${res.status}`);
  }

  console.log(
    `[indexnow] submitted ${urls.length} URL(s) successfully — HTTP ${res.status}${body ? `: ${body}` : ' (no response body)'}`
  );
  return { ok: true, status: res.status, body };
}

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function loadSitemapUrls(source) {
  const isRemote = /^https?:\/\//.test(source);
  const xml = isRemote ? await (await fetch(source)).text() : readFileSync(source, 'utf8');
  const urls = extractSitemapUrls(xml);
  if (urls.length === 0) {
    throw new Error(`[indexnow] no <loc> URLs found in sitemap source: ${source}`);
  }
  return urls;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      'Usage:\n' +
        '  node scripts/indexnow-submit.mjs <url> [url2 ...]\n' +
        '  node scripts/indexnow-submit.mjs --sitemap [path-or-url]   (default: dist/sitemap.xml)'
    );
    process.exit(1);
  }

  let urls;
  if (args[0] === '--sitemap') {
    const source = args[1] || 'dist/sitemap.xml';
    if (!/^https?:\/\//.test(source) && !existsSync(source)) {
      console.error(`[indexnow] sitemap file not found: ${source}`);
      process.exit(1);
    }
    urls = await loadSitemapUrls(source);
    console.log(`[indexnow] loaded ${urls.length} URL(s) from ${source}`);
  } else {
    urls = args;
  }

  try {
    await submitToIndexNow(urls);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

const isMain =
  process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
