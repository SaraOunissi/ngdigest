/**
 * Unit tests for the /jobs dead-link monitor decision logic.
 * Run: `node --test scripts/` (or `npm run test:scripts`).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  FAIL_THRESHOLD,
  Outcome,
  classifyOutcome,
  updateHealth,
  decideStatus,
  readFrontmatterField,
  setFrontmatterStatus,
  evaluateOffer,
} from './jobs-link-health.mjs';

test('classifyOutcome: 2xx and 3xx are ALIVE', () => {
  assert.equal(classifyOutcome({ status: 200 }), Outcome.ALIVE);
  assert.equal(classifyOutcome({ status: 204 }), Outcome.ALIVE);
  assert.equal(classifyOutcome({ status: 301 }), Outcome.ALIVE);
  assert.equal(classifyOutcome({ status: 302 }), Outcome.ALIVE);
});

test('classifyOutcome: 404 and 410 are DEAD', () => {
  assert.equal(classifyOutcome({ status: 404 }), Outcome.DEAD);
  assert.equal(classifyOutcome({ status: 410 }), Outcome.DEAD);
});

test('classifyOutcome: a network error is DEAD', () => {
  assert.equal(classifyOutcome({ networkError: true }), Outcome.DEAD);
});

test('classifyOutcome: bot-blocks and server hiccups are INCONCLUSIVE', () => {
  for (const status of [401, 403, 405, 429, 500, 502, 503]) {
    assert.equal(classifyOutcome({ status }), Outcome.INCONCLUSIVE, `status ${status}`);
  }
});

test('classifyOutcome: a missing status is INCONCLUSIVE', () => {
  assert.equal(classifyOutcome({}), Outcome.INCONCLUSIVE);
});

test('updateHealth: ALIVE resets strikes to 0', () => {
  const next = updateHealth({ strikes: 5 }, Outcome.ALIVE, { status: 200 });
  assert.equal(next.strikes, 0);
  assert.equal(next.lastOutcome, Outcome.ALIVE);
  assert.equal(next.lastStatus, 200);
});

test('updateHealth: DEAD increments strikes', () => {
  assert.equal(updateHealth(null, Outcome.DEAD, {}).strikes, 1);
  assert.equal(updateHealth({ strikes: 1 }, Outcome.DEAD, {}).strikes, 2);
});

test('updateHealth: INCONCLUSIVE holds the strike count', () => {
  assert.equal(updateHealth({ strikes: 1 }, Outcome.INCONCLUSIVE, {}).strikes, 1);
  assert.equal(updateHealth(null, Outcome.INCONCLUSIVE, {}).strikes, 0);
});

test('updateHealth: records the probe status', () => {
  const next = updateHealth(null, Outcome.DEAD, { status: 404 });
  assert.equal(next.lastStatus, 404);
  assert.equal(next.lastOutcome, Outcome.DEAD);
});

test('decideStatus: a dead probe flips active to expired only at the threshold', () => {
  assert.equal(decideStatus('active', Outcome.DEAD, { strikes: FAIL_THRESHOLD - 1 }), 'active');
  assert.equal(decideStatus('active', Outcome.DEAD, { strikes: FAIL_THRESHOLD }), 'expired');
  assert.equal(decideStatus('active', Outcome.DEAD, { strikes: FAIL_THRESHOLD + 3 }), 'expired');
});

test('decideStatus: a non-dead outcome never flips, even at the threshold', () => {
  assert.equal(decideStatus('active', Outcome.INCONCLUSIVE, { strikes: FAIL_THRESHOLD }), 'active');
  assert.equal(decideStatus('active', Outcome.ALIVE, { strikes: FAIL_THRESHOLD }), 'active');
});

test('decideStatus: never auto-resurrects an expired offer', () => {
  assert.equal(decideStatus('expired', Outcome.ALIVE, { strikes: 0 }), 'expired');
  assert.equal(decideStatus('expired', Outcome.DEAD, { strikes: 9 }), 'expired');
});

test('readFrontmatterField: reads quoted and unquoted scalars', () => {
  const raw = [
    '---',
    'slug: acme-front-remote',
    'url: "https://example.com/job"',
    'status: active',
    '---',
    '',
    'body',
  ].join('\n');
  assert.equal(readFrontmatterField(raw, 'url'), 'https://example.com/job');
  assert.equal(readFrontmatterField(raw, 'slug'), 'acme-front-remote');
  assert.equal(readFrontmatterField(raw, 'status'), 'active');
  assert.equal(readFrontmatterField(raw, 'missing'), null);
});

test('setFrontmatterStatus: flips status with a minimal, body-preserving diff', () => {
  const raw = [
    '---',
    'slug: acme',
    'status: active',
    'tags:',
    '  - angular',
    '---',
    '',
    'note about status of the world',
  ].join('\n');
  const flipped = setFrontmatterStatus(raw, 'expired');
  assert.match(flipped, /^status: expired$/m);
  // Body word "status" untouched, tags untouched.
  assert.match(flipped, /note about status of the world/);
  assert.match(flipped, /- angular/);
  // Only the frontmatter status line changed.
  assert.equal(flipped, raw.replace('status: active', 'status: expired'));
});

test('setFrontmatterStatus: idempotent when the value already matches', () => {
  const raw = '---\nstatus: expired\n---\n';
  assert.equal(setFrontmatterStatus(raw, 'expired'), raw);
});

test('setFrontmatterStatus: no frontmatter is left untouched', () => {
  const raw = 'no frontmatter here\nstatus: active\n';
  assert.equal(setFrontmatterStatus(raw, 'expired'), raw);
});

test('setFrontmatterStatus: preserves extra spacing after the key', () => {
  const raw = '---\nstatus:   active\n---\n';
  assert.equal(setFrontmatterStatus(raw, 'expired'), '---\nstatus:   expired\n---\n');
});

test('evaluateOffer: two consecutive dead probes expire an active offer', () => {
  const first = evaluateOffer({
    currentStatus: 'active',
    previousHealth: null,
    probe: { status: 404 },
  });
  assert.equal(first.outcome, Outcome.DEAD);
  assert.equal(first.health.strikes, 1);
  assert.equal(first.newStatus, 'active');
  assert.equal(first.changed, false);

  const second = evaluateOffer({
    currentStatus: 'active',
    previousHealth: first.health,
    probe: { networkError: true },
  });
  assert.equal(second.health.strikes, 2);
  assert.equal(second.newStatus, 'expired');
  assert.equal(second.changed, true);
});

test('evaluateOffer: an alive probe between failures prevents expiry', () => {
  let health = evaluateOffer({
    currentStatus: 'active',
    previousHealth: { strikes: 1 },
    probe: { status: 200 },
  }).health;
  assert.equal(health.strikes, 0);

  const next = evaluateOffer({
    currentStatus: 'active',
    previousHealth: health,
    probe: { status: 404 },
  });
  assert.equal(next.health.strikes, 1);
  assert.equal(next.changed, false);
});

test('evaluateOffer: an inconclusive probe never expires an offer', () => {
  const result = evaluateOffer({
    currentStatus: 'active',
    previousHealth: { strikes: FAIL_THRESHOLD },
    probe: { status: 403 },
  });
  // The strike count is held at the threshold, but a 403 (bot-block) is not a
  // DEAD outcome, so the offer stays active — no false expiry.
  assert.equal(result.outcome, Outcome.INCONCLUSIVE);
  assert.equal(result.health.strikes, FAIL_THRESHOLD);
  assert.equal(result.newStatus, 'active');
  assert.equal(result.changed, false);
});
