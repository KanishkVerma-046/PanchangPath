const { chromium } = require('playwright');
const BASE = 'https://panchangpath.com';
const PAGES = [
  '/', '/calendar/', '/rashifal/', '/festivals/', '/events/', '/muhurta/', '/jyotish/',
  '/jyotish/kundali/', '/jyotish/janma-kundali/', '/jyotish/horoscope-match/', '/jyotish/mangal-dosha/',
  '/jyotish/kalasarpa/', '/jyotish/sadesati/', '/jyotish/gemstone/', '/jyotish/nakshatra/',
  '/jyotish/lagna/', '/jyotish/rashi/', '/jyotish/sunsign/', '/jyotish/rudraksha/',
  '/jyotish/pancha-pakshi/', '/jyotish/shraddha/', '/jyotish/sahasra-chandrodaya/',
  '/muhurta/choghadiya/', '/muhurta/hora/', '/muhurta/rahu-kala/', '/muhurta/lagna/',
  '/muhurta/abhijit/', '/muhurta/panchaka/', '/muhurta/vivah/', '/muhurta/griha-pravesh/',
  '/muhurta/shubha-dates/', '/sunrise-sunset/', '/moonrise-moonset/',
  '/planets/planetary-positions/', '/planets/gochara/', '/panchang/regional/',
  '/devotional/', '/devotional/durga-saptashati/', '/devotional/sundarkand/', '/prashnavali/',
];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });
  const bad = [];
  for (const u of PAGES) {
    const p = await ctx.newPage();
    try {
      await p.goto(BASE + u, { waitUntil: 'networkidle', timeout: 30000 });
      await p.waitForTimeout(350);
      await p.click('#f-calc', { timeout: 1200 }).catch(() => {});
      await p.waitForTimeout(900);
      const r = await p.evaluate(() => {
        const over = document.documentElement.scrollWidth - 360;
        const clipped = [];
        document.querySelectorAll('.card, table, #result > div').forEach(el => {
          const bb = el.getBoundingClientRect();
          if (bb.right > 361) {
            let n = el.parentElement, scr = false;
            while (n) { const o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll') { scr = true; break; } n = n.parentElement; }
            if (!scr) clipped.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} right=${Math.round(bb.right)}`);
          }
        });
        return { over, clipped: [...new Set(clipped)].slice(0, 2) };
      });
      const flag = r.over > 1 || r.clipped.length;
      if (flag) bad.push(`${u}  overflow=${r.over}px  clipped=[${r.clipped.join(', ')}]`);
      console.log(`${flag ? 'FAIL' : ' ok '} ${u} (overflow ${r.over}px)`);
    } catch (e) { console.log(`ERR  ${u}: ${e.message.slice(0, 50)}`); }
    await p.close();
  }
  console.log('\n===== PAGES WITH CLIPPED / OVERFLOWING CONTENT AT 360px =====');
  console.log(bad.length ? bad.join('\n') : 'none');
  await b.close();
})();
