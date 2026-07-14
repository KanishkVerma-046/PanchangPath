import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { analyzePage } from '../lib/pageChecks.mjs';

test('analyzePage detects overflow, missing alt text, duplicate ids, and dead links', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
    await page.setContent(`
      <html><body>
        <div style="width:2000px">wide content forces horizontal overflow</div>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" alt="has alt">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=">
        <img src="does-not-exist.png" alt="broken image">
        <div id="dup"></div>
        <span id="dup"></span>
        <a href="#">dead link</a>
        <a href="/festivals">real link</a>
      </body></html>
    `);

    const result = await analyzePage(page);

    assert.equal(result.overflow, true);
    assert.equal(result.missingAlt.length, 1);
    assert.equal(result.brokenImages.length, 1);
    assert.deepEqual(result.duplicateIds, ['dup']);
    assert.equal(result.deadLinks.length, 1);
  } finally {
    await browser.close();
  }
});
