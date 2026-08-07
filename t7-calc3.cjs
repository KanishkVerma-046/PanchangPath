const { chromium } = require('playwright');
const BASE = 'https://panchangpath.com';
const CASES = [
  { n: 'Kundali',        url: '/jyotish/kundali/',         fill: { '#f-name': 'Test User', '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Janma Kundali',  url: '/jyotish/janma-kundali/',   fill: { '#f-name': 'Test User', '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Gun Milan',      url: '/jyotish/horoscope-match/', fill: { '#b-date': '1990-08-15', '#b-time': '14:30', '#g-date': '1992-03-22', '#g-time': '09:15' }, sels: ['#b-city', '#g-city'] },
  { n: 'Mangal Dosha',   url: '/jyotish/mangal-dosha/',    fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Kalasarpa',      url: '/jyotish/kalasarpa/',       fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Shani Sadesati', url: '/jyotish/sadesati/',        fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Gemstone',       url: '/jyotish/gemstone/',        fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Nakshatra',      url: '/jyotish/nakshatra/',       fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sels: ['#f-city'] },
  { n: 'Rahu Kala',      url: '/muhurta/rahu-kala/',       fill: { '#rk-date': '2026-08-15' }, sels: ['#rk-city'] },
  { n: 'Prashnavali',    url: '/prashnavali/',             fill: {}, sels: [] },
];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
  for (const c of CASES) {
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 120)));
    await page.goto(BASE + c.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    // record which elements are hidden BEFORE
    const hiddenBefore = await page.evaluate(() =>
      [...document.querySelectorAll('[id]')].filter(e => e.offsetParent === null).map(e => e.id));

    for (const [s, v] of Object.entries(c.fill)) await page.fill(s, v).catch(() => {});
    for (const s of c.sels) await page.selectOption(s, { index: 0 }).catch(() => {});
    await page.evaluate(() => {
      const skip = ['hamburger', 'dark-toggle', 'mic-btn', 'lp-pill', 'lng-pill'];
      const re = /calculate|generate|match|show|find|reveal|touch|oracle|पूछ|गणना/i;
      const b = [...document.querySelectorAll('button')].find(x => x.getBoundingClientRect().width > 0
        && !skip.includes(x.id) && !/›/.test(x.textContent) && re.test(x.textContent || ''));
      if (b) b.click();
    });
    await page.waitForTimeout(1800);

    // elements that became visible = the result region
    const revealed = await page.evaluate((hb) => {
      return [...document.querySelectorAll('[id]')]
        .filter(e => hb.includes(e.id) && e.offsetParent !== null)
        .map(e => ({ id: e.id, txt: (e.innerText || '').replace(/\s+/g, ' ').trim() }))
        .filter(x => x.txt.length > 30);
    }, hiddenBefore);

    console.log(`\n════ ${c.n}  ${c.url}`);
    if (revealed.length) {
      const r = revealed.sort((a, b) => b.txt.length - a.txt.length)[0];
      console.log(`  result region #${r.id} (${r.txt.length} chars):`);
      console.log('    ' + r.txt.slice(0, 420));
    } else {
      // already-visible result: print tail of main content
      const tail = await page.evaluate(() => {
        const m = document.querySelector('main') || document.body;
        const c = m.cloneNode(true);
        c.querySelectorAll('header,footer,nav,script,style,select,#lng-dropdown').forEach(e => e.remove());
        const t = c.innerText.replace(/\s+/g, ' ').trim();
        return t.slice(-450);
      });
      console.log('  (no newly-revealed region) tail of content:');
      console.log('    ' + tail);
    }
    console.log(`  JS errors: ${errs.length ? errs.join(' | ') : 'none'}`);
    await page.close();
  }
  await browser.close();
})();
