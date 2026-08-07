const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const width of [360, 390]) {
    console.log(`\n===== ${width}px : full round-trip EN -> HI -> EN =====`);
    const ctx = await browser.newContext({ viewport: { width, height: 780 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 120)));
    await page.goto('https://panchangpath.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const pill = page.locator('#lng-pill');
    console.log('  pill label (EN state):', (await pill.innerText()).trim());

    // --- open ---
    await pill.tap(); await page.waitForTimeout(450);
    const opts = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('button,a,li,[role="option"],[data-lang]').forEach(el => {
        const r = el.getBoundingClientRect();
        const t = (el.textContent || '').trim();
        if (r.width > 0 && r.height > 0 && r.top >= 0 && r.top < 600 && t && t.length < 25 && el.id !== 'lng-pill')
          out.push({ t, x: Math.round(r.x), w: Math.round(r.width), dl: el.getAttribute('data-lang') || '' });
      });
      return out;
    });
    const langOpts = opts.filter(o => o.dl || /English|हिन्दी|हिंदी/.test(o.t));
    console.log('  dropdown options:', langOpts.map(o => `"${o.t}"${o.dl ? `[${o.dl}]` : ''}`).join(', ') || '(none detected)');
    const offscreen = langOpts.filter(o => o.x < 0 || o.x + o.w > width);
    console.log('  options rendered off-screen:', offscreen.length === 0 ? 'none' : JSON.stringify(offscreen));

    // --- select Hindi ---
    const hi = page.locator('[data-lang="hi"]').first();
    const hiOk = await hi.isVisible().catch(() => false);
    await (hiOk ? hi : page.locator('text=/हिन्दी|हिंदी/').first()).tap();
    await page.waitForTimeout(800);
    const l1 = await page.evaluate(() => localStorage.getItem('pp-lang'));
    const d1 = ((await page.locator('body').innerText()).match(/[ऀ-ॿ]/g) || []).length;
    const pillHi = (await pill.innerText()).trim();
    console.log(`  -> HI: pp-lang=${l1}, pill="${pillHi}", Devanagari=${d1}  ${l1 === 'hi' && d1 > 200 ? 'PASS' : 'FAIL'}`);

    // --- reopen and select English ---
    await pill.tap(); await page.waitForTimeout(450);
    const en = page.locator('[data-lang="en"]').first();
    const enOk = await en.isVisible().catch(() => false);
    console.log('  English option visible on reopen:', enOk);
    if (enOk) {
      await en.tap(); await page.waitForTimeout(800);
      const l2 = await page.evaluate(() => localStorage.getItem('pp-lang'));
      const d2 = ((await page.locator('body').innerText()).match(/[ऀ-ॿ]/g) || []).length;
      console.log(`  -> EN: pp-lang=${l2}, pill="${(await pill.innerText()).trim()}", Devanagari=${d2}  ${l2 === 'en' ? 'PASS' : 'FAIL'}`);
    }
    console.log('  JS errors:', errs.length ? errs.join(' | ') : 'none');
    await ctx.close();
  }
  await browser.close();
})();
