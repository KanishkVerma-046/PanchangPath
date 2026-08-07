// Task 7.1 — mobile header language toggle, end to end, at 360px and 390px.
const { chromium } = require('playwright');
const BASE = 'https://panchangpath.com';

(async () => {
  const browser = await chromium.launch();
  for (const width of [360, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 780 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
    console.log(`\n===== ${width}px =====`);
    await page.goto(BASE, { waitUntil: 'networkidle' });

    // locate the language control in the header
    const pill = page.locator('header [id*="lang"], header [class*="lang"], header button:has-text("EN")').first();
    const visible = await pill.isVisible().catch(() => false);
    console.log(`language control visible: ${visible}`);
    if (!visible) { console.log('  FAIL: no language control found'); await ctx.close(); continue; }

    const box = await pill.boundingBox();
    console.log(`  tap target: ${Math.round(box.width)}x${Math.round(box.height)}px  (>=32px is usable)`);

    // 1. tap to open
    await pill.tap();
    await page.waitForTimeout(400);
    const menu = page.locator('[class*="lang"][class*="menu"], [id*="lang"][id*="menu"], [role="listbox"]').first();
    let opened = await menu.isVisible().catch(() => false);
    // fall back: any newly visible element containing "हिन्दी"
    const hindiOpt = page.locator('text=/^\\s*हिन्दी|हिंदी\\s*$/').first();
    const hindiVisible = await hindiOpt.isVisible().catch(() => false);
    console.log(`  after tap -> dropdown visible: ${opened || hindiVisible}`);
    if (!(opened || hindiVisible)) { console.log('  FAIL: dropdown did not open'); await ctx.close(); continue; }

    // does the dropdown render on-screen?
    const target = hindiVisible ? hindiOpt : menu;
    const mb = await target.boundingBox();
    if (mb) {
      const onScreen = mb.x >= -1 && mb.x + mb.width <= width + 1;
      console.log(`  dropdown x=${Math.round(mb.x)} w=${Math.round(mb.width)} -> fully on-screen: ${onScreen}`);
    }

    // 2. tap to select Hindi
    await target.tap();
    await page.waitForTimeout(700);

    // 3. did the site actually switch?
    const stored = await page.evaluate(() => localStorage.getItem('pp-lang'));
    const bodyText = await page.locator('body').innerText();
    const devanagariCount = (bodyText.match(/[ऀ-ॿ]/g) || []).length;
    console.log(`  localStorage pp-lang = ${stored}`);
    console.log(`  Devanagari chars on page: ${devanagariCount}`);
    console.log(`  SWITCHED: ${stored === 'hi' && devanagariCount > 200}`);

    // 4. does it persist across navigation?
    await page.goto(BASE + '/muhurta/choghadiya/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const stored2 = await page.evaluate(() => localStorage.getItem('pp-lang'));
    const dev2 = ((await page.locator('body').innerText()).match(/[ऀ-ॿ]/g) || []).length;
    console.log(`  after navigating to /muhurta/choghadiya: pp-lang=${stored2}, Devanagari=${dev2} -> persisted: ${stored2 === 'hi' && dev2 > 100}`);

    // 5. switch back to English
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const pill2 = page.locator('header [id*="lang"], header [class*="lang"], header button').first();
    await pill2.tap(); await page.waitForTimeout(400);
    const enOpt = page.locator('text=/^\\s*English\\s*$/').first();
    if (await enOpt.isVisible().catch(() => false)) {
      await enOpt.tap(); await page.waitForTimeout(600);
      const back = await page.evaluate(() => localStorage.getItem('pp-lang'));
      console.log(`  switch back to English -> pp-lang=${back}: ${back === 'en'}`);
    } else console.log('  NOTE: English option not found in reopened dropdown');

    console.log(`  JS errors: ${errors.length ? errors.join(' | ') : 'none'}`);
    await ctx.close();
  }
  await browser.close();
})();
