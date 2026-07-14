import { readFileSync } from 'node:fs';
import { extractNavLinks, diffNavSets } from './lib/checkNavSync.mjs';

const source = readFileSync(new URL('../../src/components/Header.astro', import.meta.url), 'utf8');
const sets = extractNavLinks(source);
const diffs = diffNavSets(sets);

if (diffs.length === 0) {
  console.log('Desktop dropdown, mobile drawer, and searchItems are in sync.');
} else {
  console.log(`${diffs.length} URL(s) not present in all three nav surfaces:`);
  for (const d of diffs) {
    console.log(`  ${d.url} — desktop:${d.inDesktop} drawer:${d.inDrawer} search:${d.inSearch}`);
  }
}
