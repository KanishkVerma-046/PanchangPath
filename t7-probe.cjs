const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const lang of ['en', 'hi']) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto('https://panchangpath.com', { waitUntil: 'networkidle' });
    await page.evaluate(l => localStorage.setItem('pp-lang', l), lang);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const info = await page.evaluate(() => {
      const h = document.querySelector('header');
      const out = [];
      h.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (el.id || el.className)) {
          const cls = typeof el.className === 'string' ? el.className : '';
          if (/lang/i.test(el.id) || /lang/i.test(cls)) {
            out.push(`${el.tagName.toLowerCase()} id="${el.id}" class="${cls}" text="${(el.textContent||'').trim().slice(0,20)}" box=${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
        }
      });
      return out;
    });
    console.log(`\n=== pp-lang=${lang} — header elements matching /lang/:`);
    info.forEach(i => console.log('  ' + i));
    await ctx.close();
  }
  await browser.close();
})();
