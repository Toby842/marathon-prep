import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weeks, weekIndexFor, daysUntilRace, START, RACE, TYPES, PHASES } from '../plan.js';

const DAY = 86400000;
const plan = weeks();

test('31 Wochen mit je 4 Workouts', () => {
  assert.equal(plan.length, 31);
  for (const w of plan) assert.equal(w.workouts.length, 4, `Woche ${w.n}`);
});

test('Wochen laufen Mo–So, letzte Woche endet am Renntag', () => {
  assert.equal(new Date(START).getUTCDay(), 1);
  for (const w of plan) {
    assert.equal(new Date(w.start).getUTCDay(), 1);
    assert.equal(new Date(w.end).getUTCDay(), 0);
  }
  assert.equal(plan.at(-1).end, RACE);
});

test('Marathon ist das letzte Workout, genau einmal', () => {
  const races = plan.flatMap(w => w.workouts).filter(x => x.t === 'race');
  assert.equal(races.length, 1);
  assert.equal(plan.at(-1).workouts.at(-1).t, 'race');
});

test('Alle Typen und Phasen sind bekannt, IDs eindeutig', () => {
  const all = plan.flatMap(w => w.workouts);
  for (const x of all) {
    assert.ok(TYPES[x.t], x.t);
    assert.ok(x.km > 0 && x.d);
  }
  for (const w of plan) assert.ok(PHASES.includes(w.phase));
  assert.equal(new Set(all.map(x => x.id)).size, all.length);
});

// Vergleich mit dem Maximum der zwei Vorwochen, damit Entlastungswochen nicht als Basis zählen.
const prevMax = (values, i) => Math.max(values[i - 1], values[i - 2] ?? 0);

test('Umfang: Start 15 km, Spitze 55–60 km, nie mehr als +25 % (außer Rennwoche)', () => {
  const km = plan.map(w => w.km);
  assert.equal(km[0], 15);
  const peak = Math.max(...km);
  assert.ok(peak >= 55 && peak <= 60, `Spitze ${peak}`);
  for (let i = 1; i < km.length - 1; i++) {
    assert.ok(km[i] <= prevMax(km, i) * 1.25 + 1, `Woche ${i + 1}: ${km[i - 1]} -> ${km[i]}`);
  }
});

test('Langer Lauf steigt nie um mehr als 4 km', () => {
  const long = plan.map(w => w.workouts.find(x => x.t === 'long')?.km ?? 0);
  for (let i = 1; i < long.length; i++) {
    if (long[i]) assert.ok(long[i] - prevMax(long, i) <= 4, `Woche ${i + 1}: ${long[i - 1]} -> ${long[i]}`);
  }
});

test('weekIndexFor: Wochengrenzen und Begrenzung', () => {
  const local = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();
  assert.equal(weekIndexFor(local(2026, 10, 1)), 1);
  assert.equal(weekIndexFor(local(2026, 10, 19, 0)), 1);
  assert.equal(weekIndexFor(local(2026, 10, 25, 23)), 1);
  assert.equal(weekIndexFor(local(2026, 10, 26, 0)), 2);
  assert.equal(weekIndexFor(local(2027, 5, 23)), 31);
  assert.equal(weekIndexFor(local(2027, 8, 1)), 31);
});

test('daysUntilRace', () => {
  assert.equal(daysUntilRace(new Date(2027, 4, 23, 8).getTime()), 0);
  assert.equal(daysUntilRace(new Date(2027, 4, 22, 23).getTime()), 1);
  assert.equal(daysUntilRace(new Date(2026, 9, 19).getTime()), (RACE - START) / DAY);
});
