const { chromium } = require('playwright');
const BASE = 'https://panchangpath.com';
const PAGES = [
  ['Homepage',          '/'],
  ['Kundali calc',      '/jyotish/kundali/'],
  ['Lagna table',       '/muhurta/lagna/'],
  ['Monthly calendar',  '/calendar/'],
  ['Durga Saptashati',  '/devotional/durga-saptashati/'],
  ['Sundarkand',        '/devotional/sundarkand/'],
  ['Festival detail',   '/festivals/diwali-2026/'],
  ['Rashifal',          '/rashifal/'],
  ['Regional panchang', '/panchang/regional/'],
];
const lum = c => { const m = c.match(/\d+/g); return m ? (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) : null; };

(async () => {
  const browser = await chromium.launch();

  console.log('##### 7.3  DARK MODE #####');
  for (const [name, url] of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 90)));
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.click('#dark-toggle').catch(() => {});
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      // find any text that is nearly the same luminance as its background
      const bad = [];
      const els = [...document.querySelectorAll('h1,h2,h3,p,td,th,a,span,li')].slice(0, 400);
      const L = c => { const m = c.match(/\d+/g); return m ? (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) : null; };
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 6 || !el.textContent.trim()) continue;
        let bg = 'rgba(0, 0, 0, 0)', n = el;
        while (n && bg === 'rgba(0, 0, 0, 0)') { bg = getComputedStyle(n).backgroundColor; n = n.parentElement; }
        const fg = getComputedStyle(el).color;
        const lf = L(fg), lb = L(bg);
        if (lf !== null && lb !== null && Math.abs(lf - lb) < 32) bad.push(`"${el.textContent.trim().slice(0, 24)}" fg=${fg} bg=${bg}`);
      }
      return { bg: cs.backgroundColor, cls: document.documentElement.className, bad: bad.slice(0, 4), badN: bad.length };
    });
    const isDark = lum(r.bg) !== null && lum(r.bg) < 90;
    console.log(`  ${name.padEnd(19)} light-bg=${light.padEnd(18)} dark-bg=${r.bg.padEnd(18)} html.class="${r.cls}" -> dark applied: ${isDark ? 'PASS' : 'FAIL'} | low-contrast text: ${r.badN === 0 ? 'none' : r.badN + ' -> ' + r.bad[0]}${errs.length ? ' | JS ERR ' + errs[0] : ''}`);
    await ctx.close();
  }

  console.log('\n##### 7.4  MOBILE RESPONSIVENESS #####');
  const RESP = [['Kundali chart', '/jyotish/kundali/'], ['Lagna table', '/muhurta/lagna/'],
                ['Monthly calendar', '/calendar/'], ['Durga Saptashati ch.1', '/devotional/durga-saptashati/'],
                ['Sundarkand', '/devotional/sundarkand/'], ['Homepage', '/']];
  for (const width of [360, 390]) {
    console.log(`  --- ${width}px ---`);
    for (const [name, url] of RESP) {
      const ctx = await browser.newContext({ viewport: { width, height: 780 }, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      if (url.includes('kundali')) { await page.click('#f-calc').catch(() => {}); await page.waitForTimeout(1200); }
      const r = await page.evaluate((w) => {
        const de = document.documentElement;
        const overflow = de.scrollWidth - w;
        const wide = [];
        document.querySelectorAll('table,svg,pre,.card,div').forEach(el => {
          const b = el.getBoundingClientRect();
          if (b.width > w + 2) {
            // is it inside a horizontally scrollable ancestor?
            let n = el.parentElement, scrollable = false;
            while (n) { const o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll') { scrollable = true; break; } n = n.parentElement; }
            if (!scrollable) wide.push(`${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} ${Math.round(b.width)}px`);
          }
        });
        return { overflow, wide: [...new Set(wide)].slice(0, 3) };
      }, width);
      console.log(`    ${name.padEnd(23)} page h-overflow: ${r.overflow > 1 ? r.overflow + 'px  FAIL' : 'none  PASS'} | unscrollable wide elements: ${r.wide.length ? r.wide.join(', ') + '  FAIL' : 'none  PASS'}`);
      await ctx.close();
    }
  }
  await browser.close();
})();
