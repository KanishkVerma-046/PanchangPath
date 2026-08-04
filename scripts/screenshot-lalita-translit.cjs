const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 3800 } });
  await page.goto('http://localhost:4321/devotional/stotram/lalita-sahasranama-stotram', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const toggle = await page.$('text=Show Transliteration');
  if (toggle) {
    await toggle.click();
    await page.waitForTimeout(300);
  } else {
    console.log('No toggle found');
  }

  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log('full height', fullHeight);

  const viewportHeight = 3800;
  const positions = [];
  for (let y = 0; y < fullHeight - viewportHeight; y += viewportHeight) {
    positions.push(y);
  }
  positions.push(Math.max(0, fullHeight - viewportHeight));

  let i = 0;
  for (const y of positions) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, left: 0, behavior: 'instant' }), y);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `scripts/lalita-tl-slice-${i}.png` });
    i++;
  }
  await browser.close();
  console.log('done, slices:', i);
})();
