import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFestivals,
  checkFestivalOrder,
  DEFAULT_ORDER_RULES,
} from '../lib/checkFestivalOrder.mjs';

test('parseFestivals extracts date/name pairs from festivals.ts-style object literals', () => {
  const source = `
    export const FESTIVALS_2025_2027 = [
      { date: '2025-10-20', name: 'Dhanteras', nameHi: 'धनतेरस', type: 'major', description: 'x' },
      { date: '2025-10-21', name: 'Narak Chaturdashi', nameHi: 'नरक चतुर्दशी', type: 'major', description: 'x' },
      { date: '2025-10-20', name: 'Diwali', nameHi: 'दीपावली', type: 'major', description: 'x' },
    ];
  `;
  const festivals = parseFestivals(source);
  assert.deepEqual(festivals, [
    { date: '2025-10-20', name: 'Dhanteras', year: '2025' },
    { date: '2025-10-21', name: 'Narak Chaturdashi', year: '2025' },
    { date: '2025-10-20', name: 'Diwali', year: '2025' },
  ]);
});

test('checkFestivalOrder finds no violations for correctly-ordered festivals', () => {
  const festivals = [
    { date: '2025-10-20', name: 'Dhanteras', year: '2025' },
    { date: '2025-10-19', name: 'Narak Chaturdashi', year: '2025' },
    { date: '2025-10-20', name: 'Diwali', year: '2025' },
  ];
  const violations = checkFestivalOrder(festivals, DEFAULT_ORDER_RULES);
  assert.deepEqual(violations, []);
});

test('checkFestivalOrder flags the known Narak Chaturdashi-after-Diwali pattern', () => {
  const festivals = [
    { date: '2025-10-20', name: 'Dhanteras', year: '2025' },
    { date: '2025-10-21', name: 'Narak Chaturdashi', year: '2025' },
    { date: '2025-10-20', name: 'Diwali', year: '2025' },
  ];
  const violations = checkFestivalOrder(festivals, DEFAULT_ORDER_RULES);
  assert.deepEqual(violations, [
    {
      year: '2025',
      before: 'Narak Chaturdashi',
      beforeDate: '2025-10-21',
      after: 'Diwali',
      afterDate: '2025-10-20',
    },
  ]);
});
