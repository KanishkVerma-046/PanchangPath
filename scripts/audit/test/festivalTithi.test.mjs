import test from 'node:test';
import assert from 'node:assert/strict';
import { FESTIVALS_2025_2027 } from '../../../src/lib/festivals.ts';
import { sampleFestivalTithi } from '../lib/festivalTithiSampler.mjs';
import {
  checkFestivalTithis,
  formatFestivalTithiReport,
  tithiLabel,
  EXPECTED_TITHI,
  NON_TITHI,
} from '../lib/checkFestivalTithi.mjs';

const sampler = (table) => (date) => ({ engine: table[date] });

test('tithiLabel covers both pakshas, Purnima and Amavasya', () => {
  assert.equal(tithiLabel(1), 'Shukla Pratipada');
  assert.equal(tithiLabel(15), 'Shukla Purnima');
  assert.equal(tithiLabel(16), 'Krishna Pratipada');
  assert.equal(tithiLabel(29), 'Krishna Chaturdashi');
  assert.equal(tithiLabel(30), 'Amavasya');
});

test('a mismatch warns, a match is silent, and an allowlisted mismatch carries its reason', () => {
  const festivals = [
    { name: 'Diwali', date: '2030-01-01' },
    { name: 'Diwali', date: '2030-01-02' },
    { name: 'Diwali', date: '2030-01-03' },
  ];
  const result = checkFestivalTithis(festivals, sampler({ '2030-01-01': 30, '2030-01-02': 29, '2030-01-03': 29 }), {
    allowlist: [{ name: 'Diwali', date: '2030-01-03', reason: 'Pradosh rule' }],
  });
  assert.deepEqual(result.warnings.map((w) => w.date), ['2030-01-02']);
  assert.deepEqual(result.allowlisted.map((w) => [w.date, w.reason]), [['2030-01-03', 'Pradosh rule']]);
  assert.deepEqual(result.staleAllowlist, []);
});

test('solar/Gregorian festivals are skipped; unknown names and unused allowlist entries are reported', () => {
  const result = checkFestivalTithis(
    [{ name: 'Lohri', date: '2030-01-13' }, { name: 'Some New Vrat', date: '2030-02-01' }, { name: 'Holi', date: '2030-03-01' }],
    sampler({ '2030-03-01': 16 }),
    { allowlist: [{ name: 'Holi', date: '2030-03-01', reason: 'x' }] }
  );
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.unclassified.map((f) => f.name), ['Some New Vrat']);
  assert.deepEqual(result.staleAllowlist.map((a) => a.name), ['Holi']);
});

test('every festival name in festivals.ts is classified as Tithi-based or solar', () => {
  for (const f of FESTIVALS_2025_2027) {
    assert.ok(f.name in EXPECTED_TITHI || NON_TITHI.has(f.name), `${f.date} ${f.name}: add it to EXPECTED_TITHI or NON_TITHI`);
  }
});

// Warn only: mismatches against the engine are printed as test diagnostics, never failures.
// The engine samples 6 AM and models no observance rules, so a mismatch means "check this
// against DrikPanchang", not "this date is wrong".
test('festival dates vs the Tithi engine (warn only)', (t) => {
  const result = checkFestivalTithis(FESTIVALS_2025_2027, sampleFestivalTithi);
  for (const line of formatFestivalTithiReport(result)) t.diagnostic(line);
});
