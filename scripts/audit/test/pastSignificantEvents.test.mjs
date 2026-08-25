import test from 'node:test';
import assert from 'node:assert/strict';
import { getPastSignificantEvents } from '../../../src/lib/planetaryEvents.ts';

// Saturn entered Meena (Pisces) on 2025-03-29, independently confirmed against
// drikpanchang.com and pavitrajyotish.com (both give 29 March 2025; times differ only
// by observer timezone). Task: extend the same "stays reachable past its date" retention
// already given to eclipses and Rahu/Ketu axis-shift transits to Saturn's ~2.5-year sign
// transits (Shani Peyarchi / Sadesati onset-end triggers).
test('getPastSignificantEvents retains the 2025-03-29 Saturn transit into Meena (Pisces)', () => {
  const today = new Date('2026-08-25T00:00:00Z');
  const events = getPastSignificantEvents(today, 1000);
  const saturnTransits = events.filter(e => e.type === 'sign_transit' && e.planets.includes('shani'));
  assert.ok(saturnTransits.length >= 1, 'expected at least one past Saturn sign_transit event');
  const meenaEntry = saturnTransits.find(e => e.dateISO >= '2025-03-27' && e.dateISO <= '2025-03-31');
  assert.ok(meenaEntry, `expected a Saturn transit around 2025-03-29, got dates: ${saturnTransits.map(e => e.dateISO).join(', ')}`);
});

test('getPastSignificantEvents does not include past Jupiter or Mars sign transits', () => {
  const today = new Date('2026-08-25T00:00:00Z');
  const events = getPastSignificantEvents(today, 1000);
  const guruOrMangalTransits = events.filter(
    e => e.type === 'sign_transit' && (e.planets.includes('guru') || e.planets.includes('mangal')),
  );
  assert.equal(guruOrMangalTransits.length, 0, `expected no past Jupiter/Mars transits, got: ${JSON.stringify(guruOrMangalTransits.map(e => e.id))}`);
});
