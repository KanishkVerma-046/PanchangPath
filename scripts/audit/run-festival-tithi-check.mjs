// Warn-only: compares every Tithi-based festival date in src/lib/festivals.ts with this site's
// own Tithi engine. Always exits 0. Run with `npm run audit:festival-tithi`.
import { register } from 'node:module';

register('../lib/ts-extension-resolve.mjs', import.meta.url);

const { FESTIVALS_2025_2027 } = await import('../../src/lib/festivals.ts');
const { sampleFestivalTithi } = await import('./lib/festivalTithiSampler.mjs');
const { checkFestivalTithis, formatFestivalTithiReport } = await import('./lib/checkFestivalTithi.mjs');

const result = checkFestivalTithis(FESTIVALS_2025_2027, sampleFestivalTithi);
for (const line of formatFestivalTithiReport(result)) console.log(line);
