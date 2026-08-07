const { chromium } = require('playwright');
const BASE = 'https://panchangpath.com';

// Real test inputs: born 1990-08-15 14:30, New Delhi.
const CASES = [
  { url: '/jyotish/kundali/',        fill: { '#f-name': 'Test User', '#f-date': '1990-08-15', '#f-time': '14:30' }, sel: '#f-city' },
  { url: '/jyotish/janma-kundali/',  fill: { '#f-name': 'Test User', '#f-date': '1990-08-15', '#f-time': '14:30' }, sel: '#f-city' },
  { url: '/jyotish/horoscope-match/',fill: { '#b-date': '1990-08-15', '#b-time': '14:30', '#g-date': '1992-03-22', '#g-time': '09:15' }, sel: '#b-city', sel2: '#g-city' },
  { url: '/jyotish/mangal-dosha/',   fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sel: '#f-city' },
  { url: '/jyotish/kalasarpa/',      fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sel: '#f-city' },
  { url: '/jyotish/sadesati/',       fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sel: '#f-city' },
  { url: '/jyotish/gemstone/',       fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sel: '#f-city' },
  { url: '/jyotish/nakshatra/',      fill: { '#f-date': '1990-08-15', '#f-time': '14:30' }, sel: '#f-city' },
  { url: '/muhurta/choghadiya/',     fill: { '#chog-date': '2026-08-15' }, sel: '#chog-city' },
  { url: '/muhurta/rahu-kala/',      fill: { '#rk-date': '2026-08-15' }, sel: '#rk-city' },
  { url: '/prashnavali/',            fill: {} },
];

const BAD = /\bNaN\b|\bundefined\b|\bnull\b|\[object Object\]|Infinity|—\s*—/;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  for (const c of CASES) {
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 140)));
    await page.goto(BASE + c.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const before = await page.locator('body').innerText();

    for (const [sel, val] of Object.entries(c.fill)) {
      await page.fill(sel, val).catch(e => errs.push(`fill ${sel}: ${e.message.slice(0, 60)}`));
    }
    for (const s of [c.sel, c.sel2].filter(Boolean)) {
      await page.selectOption(s, { index: 0 }).catch(() => {});
    }

    // find and click the action button (skip nav/header buttons)
    const clicked = await page.evaluate(() => {
      const skip = ['hamburger', 'dark-toggle', 'mic-btn', 'lp-pill', 'lng-pill'];
      const re = /calculate|generate|match|show|find|reveal|get |पूछ|गणना|देख|प्रश्न/i;
      const btns = [...document.querySelectorAll('button')].filter(b => {
        const r = b.getBoundingClientRect();
        return r.width > 0 && !skip.includes(b.id) && !/›/.test(b.textContent) && re.test(b.textContent || '');
      });
      if (!btns.length) return null;
      btns[0].click();
      return (btns[0].textContent || '').trim().slice(0, 30);
    });
    await page.waitForTimeout(1400);
    const after = await page.locator('body').innerText();

    const grew = after.length - before.length;
    const newText = after.slice(before.length > after.length ? 0 : 0);
    const bad = BAD.test(after);
    const badSample = bad ? (after.match(new RegExp('.{0,40}(' + BAD.source + ').{0,40}')) || [''])[0].replace(/\n/g, ' ') : '';

    console.log(`\n${c.url}`);
    console.log(`  clicked: ${clicked === null ? 'NO BUTTON FOUND' : '"' + clicked + '"'}`);
    console.log(`  page text delta: ${grew >= 0 ? '+' : ''}${grew} chars`);
    console.log(`  placeholder/NaN markers: ${bad ? 'FOUND -> ' + badSample : 'none'}`);
    console.log(`  JS errors: ${errs.length ? errs.join(' | ') : 'none'}`);
    console.log(`  VERDICT: ${!bad && errs.length === 0 && clicked !== null && grew > 20 ? 'PASS' : 'REVIEW'}`);
    await page.close();
  }
  await browser.close();
})();
