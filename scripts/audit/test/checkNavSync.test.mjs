import test from 'node:test';
import assert from 'node:assert/strict';
import { extractNavLinks, diffNavSets } from '../lib/checkNavSync.mjs';

const fixture = `
  <a href="/muhurta/rahu-kala" class="dd-link">Rahu Kalam</a>
  <a href="/jyotish/kundali" class="dd-link">Kundali Generator</a>
  <a href="/muhurta/rahu-kala" class="drawer-link">Rahu Kalam</a>
  <a href="/jyotish" class="dd-link dd-link-accent">All Calculators</a>

  const searchItems = [
    { label: "Rahu Kala", url: "/muhurta/rahu-kala" },
    { label: "Sunrise & Sunset", url: "/sunrise-sunset" },
  ];
`;

test('extractNavLinks pulls dd-link, drawer-link, and searchItems urls into separate sets', () => {
  const sets = extractNavLinks(fixture);
  assert.deepEqual(
    Array.from(sets.desktop).sort(),
    ['/jyotish', '/jyotish/kundali', '/muhurta/rahu-kala'].sort()
  );
  assert.deepEqual(Array.from(sets.drawer).sort(), ['/muhurta/rahu-kala']);
  assert.deepEqual(
    Array.from(sets.search).sort(),
    ['/muhurta/rahu-kala', '/sunrise-sunset'].sort()
  );
});

test('diffNavSets reports every url missing from at least one of the three surfaces', () => {
  const sets = extractNavLinks(fixture);
  const diffs = diffNavSets(sets);
  const byUrl = Object.fromEntries(diffs.map((d) => [d.url, d]));

  assert.equal(byUrl['/jyotish/kundali'].inDrawer, false);
  assert.equal(byUrl['/jyotish/kundali'].inSearch, false);
  assert.equal(byUrl['/sunrise-sunset'].inDesktop, false);
  assert.equal(byUrl['/sunrise-sunset'].inDrawer, false);
  assert.equal(byUrl['/muhurta/rahu-kala'], undefined);
});
