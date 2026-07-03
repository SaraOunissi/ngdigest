// Unit tests for the observatoire aggregator (weekly snapshot).
// The internal helpers (isoWeek, tally, median, midpoint) are exercised through
// the public aggregate() on small hand-built offer sets.
// Run: node --test "observatoire/**/*.test.mjs"
// by test/observatoire-hardening

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { aggregate } from './aggregator.mjs';

/** Minimal ObserveOffer factory — only the fields the aggregator reads. */
function offer(overrides = {}) {
  return {
    fingerprint: overrides.fingerprint ?? 'fp',
    firstSeen: '2026-06-15',
    lastSeen: '2026-06-15',
    techno: 'angular',
    posteType: 'front',
    seniority: 'senior',
    remote: 'full',
    officeDaysPerWeek: null,
    zone: 'FR',
    city: 'Paris',
    contractType: 'cdi',
    salaryMin: null,
    salaryMax: null,
    tjmMin: null,
    tjmMax: null,
    isDevRel: false,
    ...overrides,
  };
}

const OPTS = { asOf: '2026-06-21', windowDays: 21 };

test('aggregate: counts live offers as stock', () => {
  const snap = aggregate([offer(), offer(), offer()], OPTS);
  assert.equal(snap.counts.stock, 3);
});

test('aggregate: drops offers whose lastSeen is outside the window', () => {
  const stale = offer({ lastSeen: '2026-01-01' }); // way older than 21 days
  const fresh = offer({ lastSeen: '2026-06-20' });
  const snap = aggregate([stale, fresh], OPTS);
  assert.equal(snap.counts.stock, 1);
});

test('aggregate: flux counts offers first seen in the asOf ISO week', () => {
  const thisWeek = offer({ firstSeen: '2026-06-21', lastSeen: '2026-06-21' });
  const older = offer({ firstSeen: '2026-06-01', lastSeen: '2026-06-20' });
  const snap = aggregate([thisWeek, older], OPTS);
  assert.equal(snap.counts.stock, 2);
  assert.equal(snap.counts.flux, 1);
});

test('aggregate: distributions tally each dimension', () => {
  const snap = aggregate(
    [
      offer({ techno: 'angular', posteType: 'front' }),
      offer({ techno: 'react', posteType: 'fullstack' }),
      offer({ techno: 'angular', posteType: 'back' }),
    ],
    OPTS,
  );
  assert.equal(snap.distributions.techno.angular, 2);
  assert.equal(snap.distributions.techno.react, 1);
  assert.equal(snap.distributions.techno.vue, 0);
  assert.equal(snap.distributions.posteType.front, 1);
  assert.equal(snap.distributions.posteType.fullstack, 1);
  assert.equal(snap.distributions.posteType.back, 1);
});

test('aggregate: cityTop is ranked by frequency', () => {
  const snap = aggregate(
    [
      offer({ city: 'Paris' }),
      offer({ city: 'Paris' }),
      offer({ city: 'Lyon' }),
      offer({ city: null }),
    ],
    OPTS,
  );
  assert.deepEqual(snap.distributions.cityTop[0], { city: 'Paris', count: 2 });
  assert.deepEqual(snap.distributions.cityTop[1], { city: 'Lyon', count: 1 });
});

test('aggregate: median CDI salary by seniority is expressed in k€', () => {
  const snap = aggregate(
    [
      offer({ seniority: 'senior', contractType: 'cdi', salaryMin: 60000, salaryMax: 80000 }),
      offer({ seniority: 'senior', contractType: 'cdi', salaryMin: 50000, salaryMax: 70000 }),
    ],
    OPTS,
  );
  // midpoints 70000 and 60000 → median 65000 → 65 k€
  assert.equal(snap.salary.cdiMedianBySeniority.senior, 65);
});

test('aggregate: TJM median by seniority ignores CDI-only entries', () => {
  const snap = aggregate(
    [
      offer({ seniority: 'senior', contractType: 'freelance', tjmMin: 600, tjmMax: 700 }),
      offer({ seniority: 'senior', contractType: 'freelance', tjmMin: 500, tjmMax: 500 }),
    ],
    OPTS,
  );
  // midpoints 650 and 500 → median 575
  assert.equal(snap.salary.tjmMedianBySeniority.senior, 575);
});

test('aggregate: average office days averages only quantified hybrids', () => {
  const snap = aggregate(
    [
      offer({ remote: 'hybride', officeDaysPerWeek: 2 }),
      offer({ remote: 'hybride', officeDaysPerWeek: 3 }),
      offer({ remote: 'hybride', officeDaysPerWeek: null }), // ignored
      offer({ remote: 'full' }),
    ],
    OPTS,
  );
  assert.equal(snap.hybrid.avgOfficeDaysPerWeek, 2.5);
});

test('aggregate: devRelCount counts flagged offers', () => {
  const snap = aggregate([offer({ isDevRel: true }), offer(), offer({ isDevRel: true })], OPTS);
  assert.equal(snap.devRelCount, 2);
});

test('aggregate: methodology surfaces sources, queries and offersFound', () => {
  const snap = aggregate([offer(), offer()], {
    ...OPTS,
    sources: ['france-travail'],
    queries: ['développeur angular'],
  });
  assert.deepEqual(snap.methodology.sources, ['france-travail']);
  assert.deepEqual(snap.methodology.queries, ['développeur angular']);
  assert.equal(snap.methodology.offersFound, 2);
  assert.equal(snap.week, '2026-W25');
});

test('aggregate: an empty store yields zeroed distributions, not crashes', () => {
  const snap = aggregate([], OPTS);
  assert.equal(snap.counts.stock, 0);
  assert.equal(snap.counts.flux, 0);
  assert.equal(snap.distributions.techno.angular, 0);
  assert.deepEqual(snap.distributions.cityTop, []);
  assert.equal(snap.hybrid.avgOfficeDaysPerWeek, null);
  assert.deepEqual(snap.salary.cdiMedianBySeniority, {});
});
