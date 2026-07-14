import { readFileSync } from 'node:fs';
import { parseFestivals, checkFestivalOrder, DEFAULT_ORDER_RULES } from './lib/checkFestivalOrder.mjs';

const source = readFileSync(new URL('../../src/lib/festivals.ts', import.meta.url), 'utf8');
const festivals = parseFestivals(source);
const violations = checkFestivalOrder(festivals, DEFAULT_ORDER_RULES);

if (violations.length === 0) {
  console.log('No festival ordering violations found.');
} else {
  console.log(`${violations.length} violation(s):`);
  for (const v of violations) {
    console.log(
      `  [${v.year}] ${v.before} (${v.beforeDate}) should precede ${v.after} (${v.afterDate}) but does not`
    );
  }
}
