export async function analyzePage(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );

  const missingAlt = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((img) => !img.hasAttribute('alt') || img.getAttribute('alt').trim() === '')
      .map((img) => img.getAttribute('src') || '(no src)')
  );

  const brokenImages = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src') || '(no src)')
  );

  const duplicateIds = await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    const seen = new Set();
    const dupes = new Set();
    for (const id of ids) {
      if (seen.has(id)) dupes.add(id);
      seen.add(id);
    }
    return Array.from(dupes);
  });

  const deadLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .filter((a) => {
        const href = a.getAttribute('href');
        return !href || href.trim() === '' || href.trim() === '#';
      })
      .map((a) => a.outerHTML.slice(0, 160))
  );

  return { overflow, missingAlt, brokenImages, duplicateIds, deadLinks };
}
