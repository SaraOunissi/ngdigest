// by project-worker 2026-08-14
/**
 * Unit tests for the blog draft gate.
 * Run: `npm run test:scripts` (or `node --test "scripts/**\/*.test.mjs"`).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { draftReason, REQUIRED_FRONTMATTER } from './blog-draft-gate.mjs';

/** A complete, publishable frontmatter. */
const publishable = () => ({
  slug: 'tjm-developpeur-angular-2026',
  title: 'TJM développeur Angular 2026',
  description: 'Ce que gagne vraiment un dev Angular freelance en France.',
  date: '2026-07-03',
  author: 'Sara Ounissi',
  lang: 'fr',
  alternate: 'angular-developer-daily-rate-2026',
});

test('a complete article without draft marker is publishable', () => {
  assert.equal(draftReason('tjm-developpeur-angular-2026.md', publishable()), null);
});

test('status: draft keeps a fully-filled article out of the index', () => {
  const reason = draftReason('createurs-angular-francophones-2026.md', {
    ...publishable(),
    status: 'draft',
  });
  assert.match(String(reason), /status: draft/);
});

test('status is matched case-insensitively and trimmed, and wip counts too', () => {
  assert.ok(draftReason('a.md', { ...publishable(), status: '  Draft ' }));
  assert.ok(draftReason('a.md', { ...publishable(), status: 'WIP' }));
});

test('draft: true is honoured as well', () => {
  assert.match(String(draftReason('a.md', { ...publishable(), draft: true })), /draft: true/);
});

test('the draft- file name prefix wins over a complete frontmatter', () => {
  const reason = draftReason('draft-angular-22-selectorless-components.md', publishable());
  assert.match(String(reason), /file name prefix/);
});

test('a missing required field still marks the file as a draft', () => {
  for (const key of REQUIRED_FRONTMATTER) {
    const frontmatter = publishable();
    delete frontmatter[key];
    assert.match(String(draftReason('a.md', frontmatter)), new RegExp(key));
  }
});

test('an empty string counts as missing (not as a value)', () => {
  assert.match(String(draftReason('a.md', { ...publishable(), alternate: '' })), /alternate/);
});

test('a file with no frontmatter at all is a draft, never a crash', () => {
  assert.ok(draftReason('draft-whatever.md'));
  assert.ok(draftReason('whatever.md', {}));
});

test('status: published does not bypass the required-fields check', () => {
  const frontmatter = { ...publishable(), status: 'published' };
  delete frontmatter.alternate;
  assert.match(String(draftReason('a.md', frontmatter)), /alternate/);
});
