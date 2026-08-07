const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const width of [360, 390]) {
    console.log(`\n========== ${width}px ==========`);
    const ctx = await browser.newContext({ viewport: { width, height: 780 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 120)));
    await page.goto('https://panchangpath.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('  pill label:', (await page.locator('#lng-label').innerText()).trim());

    // ---- 1. tap pill to open ----
    await page.locator('#lng-pill').tap();
    await page.waitForTimeout(400);
    const ddHidden = await page.locator('#lng-dropdown').evaluate(e => e.hidden);
    const expanded = await page.locator('#lng-pill').getAttribute('aria-expanded');
    console.log(`  after tap: dropdown hidden=${ddHidden}, aria-expanded=${expanded}  ${!ddHidden && expanded === 'true' ? 'PASS' : 'FAIL'}`);

    // ---- 2. dropdown geometry + hit-testing (backdrop interception is the classic regression) ----
    const geo = await page.evaluate(() => {
      const dd = document.getElementById('lng-dropdown');
      const r = dd.getBoundingClientRect();
      const opts = [...dd.querySelectorAll('.lng-opt')].map(o => {
        const b = o.getBoundingClientRect();
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        return {
          code: o.dataset.code,
          label: o.textContent.trim().replace(/\s+/g, ' ').slice(0, 22),
          x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
          hitOwn: !!(hit && (hit === o || o.contains(hit))),
          hitId: hit ? (hit.id || hit.className || hit.tagName) : 'null',
        };
      });
      return { dd: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, opts };
    });
    const onScreen = geo.dd.x >= 0 && geo.dd.x + geo.dd.w <= width && geo.dd.y >= 0;
    console.log(`  dropdown box: x=${geo.dd.x} y=${geo.dd.y} ${geo.dd.w}x${geo.dd.h} -> fully on-screen: ${onScreen ? 'PASS' : 'FAIL'}`);
    console.log(`  options (${geo.opts.length}):`);
    geo.opts.forEach(o => console.log(`     [${o.code}] "${o.label}" ${o.w}x${o.h} @${o.x},${o.y}  tap-reaches-option: ${o.hitOwn ? 'yes' : 'NO -> hits ' + o.hitId}`));
    const blocked = geo.opts.filter(o => !o.hitOwn);
    console.log(`  tap-blocked options: ${blocked.length === 0 ? 'none  PASS' : blocked.map(b => b.code).join(',') + '  FAIL'}`);

    // ---- 3. actually tap Hindi ----
    await page.locator('.lng-opt[data-code="hi"]').tap();
    await page.waitForTimeout(900);
    const l1 = await page.evaluate(() => localStorage.getItem('pp-lang'));
    const dd1 = await page.locator('#lng-dropdown').evaluate(e => e.hidden);
    const d1 = ((await page.locator('body').innerText()).match(/[ऀ-ॿ]/g) || []).length;
    console.log(`  select HI -> pp-lang=${l1}, dropdown closed=${dd1}, pill="${(await page.locator('#lng-label').innerText()).trim()}", Devanagari=${d1}  ${l1 === 'hi' && dd1 && d1 > 200 ? 'PASS' : 'FAIL'}`);

    // ---- 4. reopen and switch back to English ----
    await page.locator('#lng-pill').tap(); await page.waitForTimeout(400);
    const enVis = await page.locator('.lng-opt[data-code="en"]').isVisible();
    await page.locator('.lng-opt[data-code="en"]').tap();
    await page.waitForTimeout(900);
    const l2 = await page.evaluate(() => localStorage.getItem('pp-lang'));
    const d2 = ((await page.locator('body').innerText()).match(/[ऀ-ॿ]/g) || []).length;
    console.log(`  reopen (EN option visible=${enVis}) -> pp-lang=${l2}, pill="${(await page.locator('#lng-label').innerText()).trim()}", Devanagari=${d2}  ${l2 === 'en' ? 'PASS' : 'FAIL'}`);

    // ---- 5. persistence across navigation ----
    await page.evaluate(() => localStorage.setItem('pp-lang', 'hi'));
    await page.goto('https://panchangpath.com/jyotish/kundali/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const d3 = ((await page.locator('body').innerText()).match(/[ऀ-ॿ]/g) || []).length;
    console.log(`  HI persists onto /jyotish/kundali: Devanagari=${d3}  ${d3 > 100 ? 'PASS' : 'FAIL'}`);

    console.log('  JS errors:', errs.length ? errs.join(' | ') : 'none');
    await ctx.close();
  }
  await browser.close();
})();
