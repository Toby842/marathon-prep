import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage = {
  getItem: k => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
};
const { load, save, toJson, fromJson } = await import('../store.js');

beforeEach(() => mem.clear());

test('Leerer Speicher liefert Standardwerte', () => {
  assert.deepEqual(load(), { settings: { hm: 6300, goal: 12570 }, logs: {} });
});

test('Speichern und Laden', () => {
  const s = load();
  s.logs['w1-0'] = { status: 'done', km: 4.2, sec: 1500 };
  s.settings.hm = 6000;
  save(s);
  assert.deepEqual(load(), s);
});

test('Kaputter Speicher fällt auf Standardwerte zurück', () => {
  mem.set('marathon-prep-v1', '{kaputt');
  assert.deepEqual(load().logs, {});
});

test('Export/Import Rundreise', () => {
  const s = { settings: { hm: 6100, goal: 12500 }, logs: { 'w2-3': { status: 'skipped' } } };
  assert.deepEqual(fromJson(toJson(s)), s);
});

test('Import lehnt Unsinn ab', () => {
  assert.throws(() => fromJson('42'));
  assert.throws(() => fromJson('{"logs": "x"}'));
  assert.throws(() => fromJson('nicht json'));
});
