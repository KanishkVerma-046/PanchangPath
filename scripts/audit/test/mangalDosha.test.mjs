import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMangalDosha, marsHouseFrom, MANGAL_DOSHA_HOUSES } from '../../../src/lib/mangalDosha.ts';

// Sign indices: 0=Mesha(Aries) 1=Vrishabha(Taurus) 2=Mithuna(Gemini) 3=Karka(Cancer)
// 4=Simha(Leo) 5=Kanya(Virgo) 6=Tula(Libra) 7=Vrishchika(Scorpio) 8=Dhanu(Sagittarius)
// 9=Makara(Capricorn) 10=Kumbha(Aquarius) 11=Meena(Pisces)

test('marsHouseFrom computes the classical house-from-sign offset', () => {
  assert.equal(marsHouseFrom(1, 0), 2);   // Mars in Vrishabha, ref in Mesha -> 2nd house
  assert.equal(marsHouseFrom(0, 0), 1);   // same sign -> 1st house
  assert.equal(marsHouseFrom(0, 1), 12);  // Mars one sign behind ref -> 12th house
});

test('no dosha when Mars falls outside houses 1/2/4/7/8/12 from all three references', () => {
  const r = evaluateMangalDosha({
    marsSign: 2, lagnaSign: 0, moonSign: 0, venusSign: 0,
    jupiterMarsOrbDeg: 90, moonMarsOrbDeg: 90,
  });
  assert.equal(r.doshaCount, 0);
  assert.equal(r.present, false);
  assert.equal(r.cancelled, false);
  assert.equal(r.severity, 'none');
});

test('present with 2 of 3 references and no cancellation factor rates High severity', () => {
  // Mars in Vrishabha(1): house 2 from Mesha lagna (dosha), house 2 from Mesha moon (dosha),
  // house 11 from Karka venus (clear) -> doshaCount 2, no own/exalt/weak/lagna/conjunction factor.
  const r = evaluateMangalDosha({
    marsSign: 1, lagnaSign: 0, moonSign: 0, venusSign: 3,
    jupiterMarsOrbDeg: 90, moonMarsOrbDeg: 90,
  });
  assert.equal(r.doshaCount, 2);
  assert.equal(r.present, true);
  assert.equal(r.cancelled, false);
  assert.equal(r.severity, 'high');
});

test('present with only 1 of 3 references and no cancellation factor rates Low severity', () => {
  const r = evaluateMangalDosha({
    marsSign: 1, lagnaSign: 0, moonSign: 5, venusSign: 5,
    jupiterMarsOrbDeg: 90, moonMarsOrbDeg: 90,
  });
  assert.equal(r.doshaCount, 1);
  assert.equal(r.present, true);
  assert.equal(r.cancelled, false);
  assert.equal(r.severity, 'low');
});

test('exalted Mars (Makara) fully cancels an otherwise-present dosha', () => {
  const r = evaluateMangalDosha({
    marsSign: 9, lagnaSign: 6, moonSign: 6, venusSign: 1,
    jupiterMarsOrbDeg: 90, moonMarsOrbDeg: 90,
  });
  assert.equal(r.doshaCount, 2);
  assert.equal(r.present, true);
  assert.equal(r.cancelled, true);
  assert.equal(r.severity, 'cancelled');
  const exalted = r.cancelRules.find(c => c.key === 'exalted');
  assert.equal(exalted.applies, true);
  assert.equal(exalted.strength, 'Full');
});

test('exalted Mars with no dosha houses at all stays "none", not "cancelled" (nothing to cancel)', () => {
  const r = evaluateMangalDosha({
    marsSign: 9, lagnaSign: 0, moonSign: 0, venusSign: 0,
    jupiterMarsOrbDeg: 90, moonMarsOrbDeg: 90,
  });
  assert.equal(r.doshaCount, 0);
  assert.equal(r.present, false);
  assert.equal(r.cancelled, false);
  assert.equal(r.severity, 'none');
});

test('Jupiter conjunction within 10 degrees fully cancels even a 3-of-3 dosha', () => {
  const r = evaluateMangalDosha({
    marsSign: 1, lagnaSign: 0, moonSign: 0, venusSign: 6,
    jupiterMarsOrbDeg: 5, moonMarsOrbDeg: 90,
  });
  assert.equal(r.doshaCount, 3);
  assert.equal(r.present, true);
  assert.equal(r.cancelled, true);
  assert.equal(r.severity, 'cancelled');
});

test('a Partial-strength factor alone (weak sign) reduces severity but does not cancel', () => {
  // Mars in Karka(3), a "weakening" sign, not own/exalted, Karka lagna is NOT yogakaraka for lagna
  // itself here because lagnaSign(0)=Mesha is unrelated to Mars's own sign placement.
  const r = evaluateMangalDosha({
    marsSign: 3, lagnaSign: 0, moonSign: 0, venusSign: 1,
    jupiterMarsOrbDeg: 90, moonMarsOrbDeg: 90,
  });
  assert.equal(r.doshaCount, 2);
  assert.equal(r.present, true);
  assert.equal(r.cancelled, false);
  assert.equal(r.severity, 'low'); // downgraded from 'high' by the Partial weak-sign factor
  const weak = r.cancelRules.find(c => c.key === 'weakSign');
  assert.equal(weak.applies, true);
});

test('Cancer/Leo Lagna (yogakaraka) fully cancels regardless of Mars sign', () => {
  const r = evaluateMangalDosha({
    marsSign: 1, lagnaSign: 3, moonSign: 0, venusSign: 6,
    jupiterMarsOrbDeg: 90, moonMarsOrbDeg: 90,
  });
  assert.ok(r.doshaCount >= 1);
  assert.equal(r.cancelled, true);
  assert.equal(r.severity, 'cancelled');
});

test('MANGAL_DOSHA_HOUSES is exactly the classical six', () => {
  assert.deepEqual([...MANGAL_DOSHA_HOUSES].sort((a, b) => a - b), [1, 2, 4, 7, 8, 12]);
});
