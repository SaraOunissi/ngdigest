// Unit tests for the observatoire market store (append-only, dedup-aware).
// Run: node --test "observatoire/**/*.test.mjs"
// by test/observatoire-hardening

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadStore, saveStore, mergeBatch } from './market-store.mjs';

function offer(fingerprint, overrides = {}) {
  return {
    fingerprint,
    firstSeen: '2026-06-14',
    lastSeen: '2026-06-14',
    techno: 'angular',
    ...overrides,
  };
}

// --- mergeBatch (dedup: stock vs flux) -------------------------------------

test('mergeBatch: first run counts every offer as new', () => {
  const store = new Map();
  const res = mergeBatch(store, [offer('a'), offer('b')], '2026-06-14');
  assert.deepEqual(res, { newCount: 2, updatedCount: 0 });
  assert.equal(store.size, 2);
});

test('mergeBatch: a known offer bumps lastSeen and is not recounted as new', () => {
  const store = new Map();
  mergeBatch(store, [offer('a')], '2026-06-14');
  const res = mergeBatch(store, [offer('a')], '2026-06-21');
  assert.deepEqual(res, { newCount: 0, updatedCount: 1 });
  assert.equal(store.get('a').lastSeen, '2026-06-21');
  // firstSeen stays at the original sighting
  assert.equal(store.get('a').firstSeen, '2026-06-14');
});

test('mergeBatch: mixed batch splits into new vs still-online', () => {
  const store = new Map();
  mergeBatch(store, [offer('a'), offer('b')], '2026-06-14');
  const res = mergeBatch(store, [offer('a'), offer('b'), offer('c')], '2026-06-21');
  assert.deepEqual(res, { newCount: 1, updatedCount: 2 });
  assert.equal(store.size, 3);
});

test('mergeBatch: a brand-new offer records firstSeen at its scan date', () => {
  const store = new Map();
  mergeBatch(store, [offer('a', { firstSeen: '2020-01-01' })], '2026-06-21');
  // firstSeen is set from the scanDate, not carried from the raw offer
  assert.equal(store.get('a').firstSeen, '2026-06-21');
});

// --- loadStore / saveStore round-trip --------------------------------------

test('saveStore + loadStore: round-trips the store by fingerprint', () => {
  const dir = mkdtempSync(join(tmpdir(), 'obs-store-'));
  const path = join(dir, 'market.jsonl');
  try {
    const store = new Map();
    mergeBatch(store, [offer('b'), offer('a')], '2026-06-14');
    saveStore(path, store);

    const reloaded = loadStore(path);
    assert.equal(reloaded.size, 2);
    assert.equal(reloaded.get('a').techno, 'angular');
    assert.equal(reloaded.get('b').fingerprint, 'b');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('loadStore: returns an empty map when the file is missing', () => {
  const map = loadStore(join(tmpdir(), 'does-not-exist-observatoire.jsonl'));
  assert.equal(map.size, 0);
});

test('loadStore: tolerates malformed JSONL lines (audit-safe)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'obs-store-'));
  const path = join(dir, 'market.jsonl');
  try {
    writeFileSync(
      path,
      ['{"fingerprint":"a","techno":"angular"}', 'not json at all', '{"fingerprint":"b"}', ''].join('\n'),
      'utf8',
    );
    const map = loadStore(path);
    assert.equal(map.size, 2);
    assert.equal(map.get('a').techno, 'angular');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
