const { chromium } = require('playwright');
const BASE = 'https://panchangpath.com';
const CASES = [
  { n: 'Kundali',        url: '/jyotish/kundali/',         res: '#result', fill: { '#f-name': 'Test User', '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Janma Kundali',  url: '/jyotish/janma-kundali/',   res: '#result', fill: { '#f-name': 'Test User', '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Gun Milan',      url: '/jyotish/horoscope-match/', res: '#result', fill: { '#b-date': '1990-08-15', '#b-time': '14:30', '#g-date': '1992-03-22', '#g-time': '09:15' }, sels: ['#b-city', '#g-city'] },
  { n: 'Mangal Dosha',   url: '/jyotish/mangal-dosha/',    res: '#result', fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Kalasarpa',      url: '/jyotish/kalasarpa/',       res: '#result', fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Shani Sadesati', url: '/jyotish/sadesati/',        res: '#result', fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Gemstone',       url: '/jyotish/gemstone/',        res: '#result', fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Nakshatra',      url: '/jyotish/nakshatra/',       res: '#result', fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1200 } });
  for (const c of CASES) {
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 120)));
    await page.goto(BASE + c.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    for (const [s, v] of Object.entries(c.fill)) await page.fill(s, v).catch(() => {});
    for (const s of c.sels) await page.selectOption(s, { index: 0 }).catch(() => {});
    await page.evaluate(() => {
      const skip = ['hamburger', 'dark-toggle', 'mic-btn', 'lp-pill', 'lng-pill'];
      const re = /calculate|generate|match|show|find/i;
      const btn = [...document.querySelectorAll('button')].find(x => x.getBoundingClientRect().width > 0
        && !skip.includes(x.id) && !/›/.test(x.textContent) && re.test(x.textContent || ''));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1800);
    const txt = await page.locator(c.res).innerText().catch(() => '(result element not found)');
    const flat = txt.replace(/\s+/g, ' ').trim();
    console.log(`\n════ ${c.n}`);
    console.log('  ' + flat.slice(0, 560));
    console.log(`  [${flat.length} chars | NaN/undefined: ${/\bNaN\b|\bundefined\b|\[object/.test(flat) ? 'YES' : 'no'} | JS errors: ${errs.length ? errs.join('|') : 'none'}]`);
    await page.close();
  }
  await b.close();
})();
