const { chromium } = require('playwright');
const PAGES = [
  '/jyotish/kundali/', '/jyotish/horoscope-match/', '/jyotish/mangal-dosha/',
  '/jyotish/kalasarpa/', '/jyotish/sadesati/', '/jyotish/janma-kundali/',
  '/jyotish/gemstone/', '/jyotish/nakshatra/',
  '/muhurta/choghadiya/', '/muhurta/rahu-kala/', '/prashnavali/',
];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    await page.goto('https://panchangpath.com' + p, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(400);
    const info = await page.evaluate(() => {
      const f = [];
      document.querySelectorAll('input,select,textarea').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0) f.push(`${el.tagName.toLowerCase()}#${el.id || '-'}[${el.type || ''}]`);
      });
      const btns = [];
      document.querySelectorAll('button').forEach(el => {
        const r = el.getBoundingClientRect();
        const t = (el.textContent || '').trim().slice(0, 20);
        if (r.width > 0 && t && !/^(EN|हिं)$/.test(t) && el.id !== 'hamburger' && el.id !== 'dark-toggle' && el.id !== 'mic-btn' && el.id !== 'lp-pill' && el.id !== 'lng-pill')
          btns.push(`${el.id || '-'}:"${t}"`);
      });
      return { f, btns };
    });
    console.log(`\n${p}`);
    console.log('  fields: ' + (info.f.join(' ') || '(none)'));
    console.log('  buttons: ' + (info.btns.slice(0, 6).join(' ') || '(none)'));
    await page.close();
  }
  await b.close();
})();
