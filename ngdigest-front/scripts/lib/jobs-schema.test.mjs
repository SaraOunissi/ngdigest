/**
 * Unit tests for the /jobs content contract.
 * Run: `npm run test:scripts`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateJob, validateJobCollection, toIsoDate } from './jobs-schema.mjs';

const TODAY = '2026-09-28';

const validOffer = () => ({
  slug: 'acme-senior-frontend-angular',
  title: 'Senior Frontend Engineer',
  company: 'Acme',
  companyLogo: '',
  type: 'CDI',
  remote: 100,
  zone: 'FR',
  location: 'France',
  language: 'fr',
  salary: '60 000 – 70 000 €/an',
  tjm: null,
  stack: ['Angular'],
  url: 'https://jobs.example.com/acme/1',
  scannedAt: new Date('2026-09-25'),
  status: 'active',
  tags: ['angular'],
  editorialHook: 'Hook',
  editorialHookEn: 'Hook EN',
  editorialNote: 'Note',
  editorialNoteEn: 'Note EN',
});

const FILE = '2026-09-25-acme-senior-frontend-angular.md';

test('a complete offer passes without warnings', () => {
  assert.deepEqual(validateJob(validOffer(), FILE, { today: TODAY }), { errors: [], warnings: [] });
});

test('rejects the legacy two-file format (alternate field)', () => {
  const offer = { ...validOffer(), alternate: '/en/jobs/acme' };
  const { errors } = validateJob(offer, FILE, { today: TODAY });
  assert.ok(errors.some((message) => message.includes('unknown field "alternate"')));
});

test('file name must carry the date and the same slug', () => {
  assert.ok(validateJob(validOffer(), 'acme.md', { today: TODAY }).errors.some((m) => m.includes('YYYY-MM-DD')));
  assert.ok(
    validateJob(validOffer(), '2026-09-25-other-slug.md', { today: TODAY }).errors.some((m) => m.includes('does not match')),
  );
});

test('rejects invalid enums, non-https url and future scans', () => {
  const offer = { ...validOffer(), type: 'Contract', remote: 'full', url: 'http://x.io', scannedAt: '2026-12-01' };
  const { errors } = validateJob(offer, FILE, { today: TODAY });
  assert.ok(errors.some((m) => m.startsWith('type')));
  assert.ok(errors.some((m) => m.startsWith('remote')));
  assert.ok(errors.some((m) => m.startsWith('url')));
  assert.ok(errors.some((m) => m.includes('in the future')));
});

test('an active offer needs an amount unless tagged salaire-non-communique', () => {
  const noAmount = { ...validOffer(), salary: null, tjm: '' };
  assert.ok(validateJob(noAmount, FILE, { today: TODAY }).errors.some((m) => m.includes('needs a salary')));
  const tagged = { ...noAmount, tags: ['salaire-non-communique'] };
  assert.deepEqual(validateJob(tagged, FILE, { today: TODAY }).errors, []);
  const expired = { ...noAmount, status: 'expired' };
  assert.deepEqual(validateJob(expired, FILE, { today: TODAY }).errors, []);
});

test('missing English text is a warning, not an error', () => {
  const offer = { ...validOffer(), editorialNoteEn: undefined };
  const result = validateJob(offer, FILE, { today: TODAY });
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings.length, 1);
});

test('duplicated slugs across files are rejected', () => {
  const entries = [
    { fileName: FILE, frontmatter: validOffer() },
    { fileName: FILE, frontmatter: validOffer() },
  ];
  const { errors } = validateJobCollection(entries, { today: TODAY });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /already used/);
});

test('toIsoDate accepts YAML dates and ISO strings only', () => {
  assert.equal(toIsoDate(new Date('2026-09-25')), '2026-09-25');
  assert.equal(toIsoDate('2026-09-25'), '2026-09-25');
  assert.equal(toIsoDate('25/09/2026'), null);
  assert.equal(toIsoDate(undefined), null);
});
