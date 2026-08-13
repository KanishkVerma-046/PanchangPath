import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeMinutes,
  formatMinutes12h,
  formatMinutes24h,
  formatMinutes24Plus,
  formatDecimalHours12h,
  formatDurationMins,
  formatDurationHours,
} from '../../../src/lib/time-format.ts';

// The bug this module exists to prevent: computing the hour with Math.floor and the minute
// with Math.round independently renders a minute of 60. Real sighting on 2026-08-13 —
// the homepage showed "Abhijit Muhurta: 11:60 AM – 12:53 PM".
test('never emits a :60 minute for any fractional input', () => {
  for (let m = 0; m < 1440; m += 1) {
    for (const frac of [0, 0.4, 0.5, 0.6, 0.9, 0.99, 0.999]) {
      const v = m + frac;
      for (const out of [formatMinutes12h(v), formatMinutes24h(v), formatMinutes24Plus(v, 350)]) {
        assert.ok(!/:60\b/.test(out), `":60" produced for ${v} -> ${out}`);
        const mins = Number(out.match(/:(\d{2})/)[1]);
        assert.ok(mins >= 0 && mins <= 59, `minute out of range for ${v} -> ${out}`);
      }
    }
  }
});

test('rounds up into the next hour instead of producing :60', () => {
  assert.equal(formatMinutes12h(719.6), '12:00 PM');   // was "11:60 AM"
  assert.equal(formatMinutes12h(59.8), '1:00 AM');     // was "12:60 AM"
  assert.equal(formatMinutes12h(1439.7), '12:00 AM');  // was "11:60 PM", wraps to midnight
  assert.equal(formatMinutes24h(719.6), '12:00');
  assert.equal(formatMinutes24h(1439.7), '00:00');
});

test('rounds down below the half-minute', () => {
  assert.equal(formatMinutes12h(719.4), '11:59 AM');
  assert.equal(formatMinutes12h(719.0), '11:59 AM');
  assert.equal(formatMinutes24h(719.4), '11:59');
});

test('formats ordinary times correctly across the 12h boundaries', () => {
  assert.equal(formatMinutes12h(0), '12:00 AM');
  assert.equal(formatMinutes12h(1), '12:01 AM');
  assert.equal(formatMinutes12h(360), '6:00 AM');
  assert.equal(formatMinutes12h(720), '12:00 PM');
  assert.equal(formatMinutes12h(721), '12:01 PM');
  assert.equal(formatMinutes12h(1080), '6:00 PM');
});

test('normalizeMinutes wraps negatives and overflow into [0,1440)', () => {
  assert.equal(normalizeMinutes(-1), 1439);
  assert.equal(normalizeMinutes(-0.4), 0);
  assert.equal(normalizeMinutes(1440), 0);
  assert.equal(normalizeMinutes(1500), 60);
  assert.equal(normalizeMinutes(1439.7), 0);
});

test('24+ format pushes pre-sunrise times past 24, and still carries correctly', () => {
  const sunrise = 350; // 05:50
  assert.equal(formatMinutes24Plus(90, sunrise), '25:30');   // 01:30 -> 25:30
  assert.equal(formatMinutes24Plus(400, sunrise), '06:40');  // after sunrise, unchanged
  assert.equal(formatMinutes24Plus(89.7, sunrise), '25:30'); // rounds, no :60
});

test('formatDecimalHours12h applies the tz offset and carries', () => {
  assert.equal(formatDecimalHours12h(0.5, 5.5), '6:00 AM');
  assert.equal(formatDecimalHours12h(11.9999, 0), '12:00 PM'); // was "11:60 AM"
  assert.equal(formatDecimalHours12h(23.9999, 0), '12:00 AM');
  assert.equal(formatDecimalHours12h(1.0, -5), '8:00 PM');     // previous day, wraps
});

test('durations carry instead of emitting 60m, and are not wrapped at 24h', () => {
  assert.equal(formatDurationMins(719.7), '12h 0m');  // was "11h 60m"
  assert.equal(formatDurationMins(719.4), '11h 59m');
  assert.equal(formatDurationMins(1500), '25h 0m');   // durations may exceed a day
  assert.equal(formatDurationHours(11.9999), '12h 0m');
  assert.equal(formatDurationHours(13.5), '13h 30m');
});

test('no duration input produces a 60m component', () => {
  for (let h = 0; h < 24; h += 1) {
    for (const frac of [0, 0.4, 0.5, 0.9, 0.99, 0.999]) {
      const out = formatDurationHours(h + frac);
      assert.ok(!/\b60m\b/.test(out), `"60m" produced for ${h + frac} -> ${out}`);
    }
  }
});
