const { chromium } = require('playwright');
const BASE = 'https://panchangpath.com';

const CASES = [
  { n: 'Kundali',        url: '/jyotish/kundali/',         fill: { '#f-name': 'Test User', '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'], expect: /Lagna|Ascendant|Rashi|Nakshatra/i },
  { n: 'Janma Kundali',  url: '/jyotish/janma-kundali/',   fill: { '#f-name': 'Test User', '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'], expect: /Dasha|Lagna|Rashi/i },
  { n: 'Gun Milan',      url: '/jyotish/horoscope-match/', fill: { '#b-date': '1990-08-15', '#b-time': '14:30', '#g-date': '1992-03-22', '#g-time': '09:15' }, sels: ['#b-city', '#g-city'], expect: /\d+\s*\/\s*36|Guna|Koota/i },
  { n: 'Mangal Dosha',   url: '/jyotish/mangal-dosha/',    fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'], expect: /Manglik|Mangal|Dosha/i },
  { n: 'Kalasarpa',      url: '/jyotish/kalasarpa/',       fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'], expect: /Kalasarpa|Kaal ?Sarp|Rahu|Ketu/i },
  { n: 'Shani Sadesati', url: '/jyotish/sadesati/',        fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'], expect: /Sade ?Sati|Shani|Saturn|Dhaiya/i },
  { n: 'Gemstone',       url: '/jyotish/gemstone/',        fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'], expect: /Ruby|Pearl|Coral|Emerald|Sapphire|Diamond|Gemstone/i },
  { n: 'Nakshatra',      url: '/jyotish/nakshatra/',       fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'], expect: /Nakshatra|Pada|Lord/i },
  { n: 'Choghadiya',     url: '/muhurta/choghadiya/',      fill: { '#chog-date': '2026-08-15' }, sels: ['#chog-city'], expect: /Amrit|Shubh|Labh|Char|Rog|Udveg|Kaal/i },
  { n: 'Rahu Kala',      url: '/muhurta/rahu-kala/',       fill: { '#rk-date': '2026-08-15' }, sels: ['#rk-city'], expect: /Rahu|Gulika|Yamaganda/i },
  { n: 'Prashnavali',    url: '/prashnavali/',             fill: {}, sels: [], expect: /.{40,}/ },
];
const BAD = /\bNaN\b|\bundefined\b|\[object Object\]|Infinity/;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
  for (const c of CASES) {
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 140)));
    await page.goto(BASE + c.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    for (const [sel, val] of Object.entries(c.fill)) await page.fill(sel, val).catch(() => {});
    for (const s of c.sels) await page.selectOption(s, { index: 0 }).catch(() => {});
    // fire input/change so auto-calculating pages recompute
    await page.evaluate(() => document.querySelectorAll('input,select').forEach(e => {
      e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
    }));
    await page.evaluate(() => {
      const skip = ['hamburger', 'dark-toggle', 'mic-btn', 'lp-pill', 'lng-pill'];
      const re = /calculate|generate|match|show|find|reveal|ask|पूछ|गणना/i;
      const b = [...document.querySelectorAll('button')].find(x => x.getBoundingClientRect().width > 0
        && !skip.includes(x.id) && !/›/.test(x.textContent) && re.test(x.textContent || ''));
      if (b) b.click();
    });
    await page.waitForTimeout(1600);

    // grab main content, minus header/footer/nav
    const out = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      const clone = main.cloneNode(true);
      clone.querySelectorAll('header,footer,nav,script,style,#lng-dropdown').forEach(e => e.remove());
      return clone.innerText.replace(/\n{2,}/g, '\n').trim();
    });
    const body = out.replace(/\s+/g, ' ');
    const matched = c.expect.test(body);
    const bad = BAD.test(body);
    console.log(`\n--- ${c.n}  (${c.url})`);
    console.log(`    output chars: ${out.length} | expected-content match: ${matched ? 'yes' : 'NO'} | NaN/undefined: ${bad ? 'YES' : 'no'} | JS errors: ${errs.length || 'none'}`);
    if (errs.length) console.log('    ERRORS: ' + errs.join(' | '));
    // print a representative slice of the actual computed output
    const idx = body.search(c.expect);
    console.log('    sample: ' + body.slice(Math.max(0, idx - 60), Math.max(0, idx) + 240).trim());
    console.log(`    VERDICT: ${matched && !bad && !errs.length ? 'PASS' : 'FAIL/REVIEW'}`);
    await page.close();
  }
  await browser.close();
})();
