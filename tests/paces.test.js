import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paceZones, fmtPace, fmtDuration, parseDuration } from '../paces.js';

test('Zonen für HM 1:45 und Ziel 3:29:30', () => {
  const z = paceZones(6300, 12570);
  assert.equal(fmtPace(z.mp[0]), '4:55');
  assert.equal(fmtPace(z.mp[1]), '5:00');
  assert.equal(fmtPace(z.easy[0]), '5:52');
  assert.equal(fmtPace(z.easy[1]), '6:28');
  assert.ok(z.interval[1] < z.tempo[0], 'Intervalle schneller als Schwelle');
  assert.ok(z.tempo[1] < z.easy[0], 'Schwelle schneller als locker');
  for (const [a, b] of Object.values(z)) assert.ok(a < b);
});

test('Schnellere HM-Zeit macht alle Zonen außer MP schneller', () => {
  const slow = paceZones(6300, 12570);
  const fast = paceZones(5940, 12570);
  for (const k of ['easy', 'long', 'tempo', 'interval', 'test']) assert.ok(fast[k][0] < slow[k][0], k);
  assert.deepEqual(fast.mp, slow.mp);
});

test('Formatierung', () => {
  assert.equal(fmtPace(298.6), '4:59');
  assert.equal(fmtPace(359.6), '6:00');
  assert.equal(fmtDuration(6300), '1:45:00');
  assert.equal(fmtDuration(2730), '45:30');
});

test('parseDuration', () => {
  assert.equal(parseDuration('1:45:00'), 6300);
  assert.equal(parseDuration('45:30'), 2730);
  assert.equal(parseDuration(' 45 '), 2700);
  assert.equal(parseDuration(''), null);
  assert.equal(parseDuration('abc'), null);
  assert.equal(parseDuration('1:2:3:4'), null);
  assert.equal(parseDuration('1,5'), null);
});
