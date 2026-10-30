import test from 'node:test';
import assert from 'node:assert/strict';
import { istDateParts, istTodayISO, daysBetweenISO, addDaysISO } from '../../../src/lib/ist-date.ts';
import {
  getUpcomingFestivals,
  getTodayFestivals,
  getUpcomingMajorFestivals,
  daysUntil,
} from '../../../src/lib/festivals.ts';

const at = (iso) => new Date(iso);

// The bug this module exists to prevent: on 2026-10-30 the homepage, built by the daily
// cron at 2026-10-29T22:59Z (04:29 IST), labelled the 29 Oct festival "Today" because the
// build read the UTC date.
test('the 2026-10-30 CI build instant resolves to 30 Oct IST, not the UTC date', () => {
  assert.equal(istTodayISO(at('2026-10-29T22:59:16Z')), '2026-10-30');
});

test('IST midnight is 18:30 UTC: the date flips exactly there', () => {
  assert.equal(istTodayISO(at('2026-10-29T18:29:59.999Z')), '2026-10-29');
  assert.equal(istTodayISO(at('2026-10-29T18:30:00.000Z')), '2026-10-30');
});

test('every minute of the 00:00–05:30 IST window reads as the IST date, not the UTC date', () => {
  // 00:00 IST = 18:30 UTC (previous UTC day) through 05:29 IST = 23:59 UTC.
  for (let m = 0; m < 330; m++) {
    const instant = new Date(Date.UTC(2026, 9, 29, 18, 30) + m * 60_000);
    assert.equal(instant.toISOString().slice(0, 10), '2026-10-29', 'UTC date is the previous day');
    assert.equal(istTodayISO(instant), '2026-10-30', `minute ${m} of the window`);
  }
  // 05:30 IST onwards UTC catches up and both agree.
  assert.equal(istTodayISO(at('2026-10-30T00:00:00Z')), '2026-10-30');
});

test('month boundary: 1 Nov starts at 18:30 UTC on 31 Oct', () => {
  assert.equal(istTodayISO(at('2026-10-31T18:29:00Z')), '2026-10-31');
  assert.equal(istTodayISO(at('2026-10-31T18:30:00Z')), '2026-11-01');
  assert.deepEqual(istDateParts(at('2026-10-31T21:55:00Z')), { year: 2026, month: 11, day: 1, weekday: 0 });
});

test('year boundary: 1 Jan starts at 18:30 UTC on 31 Dec', () => {
  assert.equal(istTodayISO(at('2026-12-31T18:29:00Z')), '2026-12-31');
  assert.equal(istTodayISO(at('2026-12-31T18:30:00Z')), '2027-01-01');
  assert.equal(istDateParts(at('2026-12-31T22:00:00Z')).year, 2027);
});

test('leap day', () => {
  assert.equal(istTodayISO(at('2028-02-28T18:30:00Z')), '2028-02-29');
  assert.equal(istTodayISO(at('2028-02-29T18:30:00Z')), '2028-03-01');
});

test('weekday follows the IST date', () => {
  // 2026-10-30 is a Friday; at 22:59 UTC on Thursday 29th it is already Friday in India.
  assert.equal(istDateParts(at('2026-10-29T22:59:00Z')).weekday, 5);
});

test('result is the same whatever the host timezone is', () => {
  const saved = process.env.TZ;
  try {
    const results = new Set();
    for (const tz of ['UTC', 'Asia/Kolkata', 'America/Los_Angeles', 'Pacific/Kiritimati', 'Pacific/Pago_Pago']) {
      process.env.TZ = tz;
      results.add(istTodayISO(at('2026-10-29T22:59:16Z')));
      results.add(daysUntil(at('2026-10-29T22:59:16Z'), '2026-11-06'));
    }
    assert.deepEqual([...results], ['2026-10-30', 7]);
  } finally {
    if (saved === undefined) delete process.env.TZ; else process.env.TZ = saved;
  }
});

test('daysBetweenISO counts calendar days across month and year boundaries', () => {
  assert.equal(daysBetweenISO('2026-10-30', '2026-10-30'), 0);
  assert.equal(daysBetweenISO('2026-10-30', '2026-11-06'), 7);
  assert.equal(daysBetweenISO('2026-10-30', '2026-10-29'), -1);
  assert.equal(daysBetweenISO('2026-12-31', '2027-01-01'), 1);
  assert.equal(daysBetweenISO('2026-01-01', '2027-01-01'), 365);
  assert.equal(daysBetweenISO('2028-01-01', '2029-01-01'), 366);
});

test('addDaysISO rolls over months and years', () => {
  assert.equal(addDaysISO('2026-10-31', 1), '2026-11-01');
  assert.equal(addDaysISO('2026-12-31', 1), '2027-01-01');
  assert.equal(addDaysISO('2026-03-01', -1), '2026-02-28');
  assert.equal(addDaysISO('2028-03-01', -1), '2028-02-29');
});

test('malformed or impossible dates throw rather than silently rolling over', () => {
  assert.throws(() => daysBetweenISO('2026-10-30', '2026-11-6'));
  assert.throws(() => daysBetweenISO('2026-10-30T00:00:00Z', '2026-11-06'));
  assert.throws(() => addDaysISO('2026-02-30', 0));
});

// festivals.ts consumers, at the real failing build instant.
test('festival helpers use the IST date at the 2026-10-30 CI build instant', () => {
  const build = at('2026-10-29T22:59:16Z');
  assert.ok(!getUpcomingFestivals(build, 8).some(f => f.date === '2026-10-29'), 'Karva Chauth (29 Oct) is past');
  assert.deepEqual(getTodayFestivals(build), []);
  assert.equal(daysUntil(build, '2026-11-06'), 7);
  assert.equal(daysUntil(build, '2026-11-08'), 9);
  assert.equal(daysUntil(build, '2026-10-29'), -1);
  assert.ok(getUpcomingMajorFestivals(3, build).every(f => f.date >= '2026-10-30'));
});

test('a festival is "today" for the whole IST day, including before 05:30 IST', () => {
  // 1 Nov 2026 01:00 IST = 31 Oct 19:30 UTC.
  const names = getTodayFestivals(at('2026-10-31T19:30:00Z')).map(f => f.name);
  assert.ok(names.includes('Ahoi Ashtami'));
});
