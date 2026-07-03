// Observatoire — end-to-end demo / smoke test. Runs the full pipeline WITHOUT
// France Travail credentials, on the bundled fixtures, so the data layer is
// verifiable tonight:
//   fixtures → ftToLoose → normalizeOffer → market store (dedup) → aggregate → snapshot
//
// Usage:  node observatoire/src/run-demo.mjs
// If FT_CLIENT_ID/FT_CLIENT_SECRET are set, it ALSO pulls a live FT batch.
// by project-worker 2026-06-14

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert';

import { normalizeOffer } from './normalizer.mjs';
import { ftToLoose, collect, hasCredentials, DEFAULT_QUERIES } from './france-travail.collector.mjs';
import { loadStore, mergeBatch, saveStore } from './market-store.mjs';
import { aggregate } from './aggregator.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SCAN_DATE = '2026-06-14';

const rawFt = JSON.parse(readFileSync(join(ROOT, 'fixtures', 'sample-offers.json'), 'utf8'));
const loose = rawFt.map((o) => ftToLoose(o, SCAN_DATE));
const offers = loose.map(normalizeOffer);

console.log('=== normalized offers ===');
for (const o of offers) {
  console.log(
    `${o.fingerprint}  ${o.techno.padEnd(7)} ${o.posteType.padEnd(9)} ${o.seniority.padEnd(8)} ` +
      `${o.remote.padEnd(7)} ${o.contractType.padEnd(9)} ${o.typeRecruteur.padEnd(18)} ` +
      `${o.isDevRel ? 'DEVREL ' : '       '} ` +
      `sal=${o.salaryMin ?? '-'}/${o.salaryMax ?? '-'} tjm=${o.tjmMin ?? '-'}/${o.tjmMax ?? '-'}`,
  );
}

// --- market store round-trip (in-memory, no disk pollution in repo) ---------
const store = new Map();
const m1 = mergeBatch(store, offers, SCAN_DATE);
// simulate a 2nd weekly run: same offers still online + 1 brand-new offer
const newOffer = normalizeOffer({
  sourceId: 'FT-0009',
  source: 'france-travail',
  title: 'Développeur Angular Confirmé',
  company: 'Back Market',
  description: 'Angular, full remote France. CDI. 3 ans. 52k-62k€.',
  city: 'Remote FR',
  contractCode: 'CDI',
  scannedAt: '2026-06-21',
});
const m2 = mergeBatch(store, [...offers, newOffer], '2026-06-21');

console.log('\n=== market store ===');
console.log('run 1:', m1, '| run 2:', m2, '| total:', store.size);

const snapshot = aggregate([...store.values()], {
  asOf: '2026-06-21',
  windowDays: 21,
  queries: DEFAULT_QUERIES,
  sources: ['france-travail'],
});
console.log('\n=== weekly snapshot ===');
console.log(JSON.stringify(snapshot, null, 2));

// --- assertions (smoke test) -----------------------------------------------
assert.equal(store.size, 9, 'expected 9 unique offers after dedup');
assert.equal(m1.newCount, 8, 'run 1 should see 8 new');
assert.equal(m2.newCount, 1, 'run 2 should add only the 1 brand-new offer');
assert.equal(m2.updatedCount, 8, 'run 2 should bump 8 still-online offers');
assert.equal(snapshot.counts.flux, 1, 'flux this week = 1 (the new offer)');
assert.equal(snapshot.devRelCount, 1, 'exactly 1 DevRel offer');
assert.equal(snapshot.distributions.techno.angular, 5, 'expected 5 angular offers (4 fixtures + new)');
assert.equal(
  snapshot.distributions.typeRecruteur.esn,
  4,
  'expected 4 ESN (Norsys, Capgemini, Sopra Steria, Octo) — Doctolib must NOT false-match "octo"',
);
assert.equal(snapshot.distributions.typeRecruteur['client-final'], 4, 'Doctolib/Algolia/BNP/Back Market = client-final');
assert.equal(snapshot.distributions.seniority.confirme, 4, 'Doctolib(3ans) + Vue(confirmé) + BNP(confirmé) + new(3ans) = 4 confirmé (accent-safe)');
assert.equal(snapshot.distributions.seniority.inconnu, 0, 'accent-safe detection leaves no inconnu seniority on these fixtures');
assert.ok(snapshot.salary.tjmMedianBySeniority.senior, 'should have a senior TJM median');
console.log('\n✅ all assertions passed');

if (hasCredentials()) {
  console.log('\n=== live France Travail batch (credentials detected) ===');
  const res = await collect({ scannedAt: SCAN_DATE });
  console.log(res.skipped ? res.reason : `fetched ${res.offersFound} live offers`);
} else {
  console.log('\nℹ️  No FT credentials → live fetch skipped (set FT_CLIENT_ID / FT_CLIENT_SECRET).');
}
