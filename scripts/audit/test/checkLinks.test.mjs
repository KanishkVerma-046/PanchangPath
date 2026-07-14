import test from 'node:test';
import assert from 'node:assert/strict';
import { extractInternalLinks, findBrokenLinks } from '../lib/checkLinks.mjs';

test('extractInternalLinks pulls same-origin/relative hrefs, strips query+hash, ignores external/mailto/anchor links', () => {
  const html = `
    <a href="/festivals/diwali-2025">Diwali</a>
    <a href="https://panchangpath.com/about">About</a>
    <a href="https://external.com/x">External</a>
    <a href="mailto:hi@panchangpath.com">Email</a>
    <a href="#section">Anchor</a>
    <a href="/muhurta/shubha-dates?activity=vehicle">Shubha Dates</a>
  `;
  const links = extractInternalLinks(html, 'https://panchangpath.com');
  assert.deepEqual(
    links.sort(),
    ['/about', '/festivals/diwali-2025', '/muhurta/shubha-dates'].sort()
  );
});

test('findBrokenLinks flags links missing from the known route set, ignoring trailing-slash differences', () => {
  const known = new Set(['/', '/festivals/diwali-2025/', '/muhurta/shubha-dates/']);
  const broken = findBrokenLinks(
    ['/festivals/diwali-2025', '/muhurta/shubha-dates', '/does-not-exist'],
    known
  );
  assert.deepEqual(broken, ['/does-not-exist']);
});
