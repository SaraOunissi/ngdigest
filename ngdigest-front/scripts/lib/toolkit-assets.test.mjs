// by project-worker 2026-08-21
/**
 * Tests for the toolkit download guard (q176).
 * Run: `npm run test:scripts` (or `node --test "scripts/lib/*.test.mjs"`).
 *
 * The last test is the one that matters day-to-day: it runs the guard against the
 * real repository, so renaming or deleting a toolkit markdown file turns red here
 * instead of turning into a 404 in production.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkToolkitAssets, declaredFiles, declaredIds } from './toolkit-assets.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const frontRoot = join(here, '..', '..');
const REAL_DATA = join(
  frontRoot,
  'src',
  'app',
  'features',
  'career',
  'toolkit',
  'infrastructure',
  'toolkit.data.ts'
);
const REAL_PUBLIC = join(frontRoot, 'public');

/** Builds a throwaway fixture: a data file + a public/assets/toolkit tree. */
function fixture({ dataSource, files }) {
  const root = mkdtempSync(join(tmpdir(), 'toolkit-guard-'));
  const dataFile = join(root, 'toolkit.data.ts');
  writeFileSync(dataFile, dataSource, 'utf8');
  const assetsDir = join(root, 'public', 'assets', 'toolkit');
  mkdirSync(assetsDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(assetsDir, name), content, 'utf8');
  }
  return { root, dataFile, publicDir: join(root, 'public') };
}

const sourceFor = (entries) =>
  entries
    .map(
      ([id, base]) => `    id: '${id}',
    files: [
      { lang: 'fr', path: '/assets/toolkit/${base}-fr.md', format: 'markdown' },
      { lang: 'en', path: '/assets/toolkit/${base}-en.md', format: 'markdown' },
    ],`
    )
    .join('\n');

test('declaredFiles reads every language variant', () => {
  const files = declaredFiles(sourceFor([['cv-angular', 'cv-angular']]));
  assert.deepEqual(
    files.map((file) => `${file.lang}:${file.path}`),
    ['fr:/assets/toolkit/cv-angular-fr.md', 'en:/assets/toolkit/cv-angular-en.md']
  );
});

test('declaredIds reads the asset ids in order', () => {
  const ids = declaredIds(
    sourceFor([
      ['cv-angular', 'cv-angular'],
      ['checklist-cv', 'checklist-cv'],
    ])
  );
  assert.deepEqual(ids, ['cv-angular', 'checklist-cv']);
});

test('a coherent declaration reports no problem', () => {
  const fx = fixture({
    dataSource: sourceFor([['cv-angular', 'cv-angular']]),
    files: { 'cv-angular-fr.md': '# CV', 'cv-angular-en.md': '# Resume' },
  });
  assert.deepEqual(checkToolkitAssets(fx), []);
  rmSync(fx.root, { recursive: true, force: true });
});

test('a declared file missing from public/ is caught (the 404 download)', () => {
  const fx = fixture({
    dataSource: sourceFor([['cv-angular', 'cv-angular']]),
    files: { 'cv-angular-fr.md': '# CV' },
  });
  const problems = checkToolkitAssets(fx);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /cv-angular-en\.md: declared but missing/);
  rmSync(fx.root, { recursive: true, force: true });
});

test('an empty file is caught (a download that opens on nothing)', () => {
  const fx = fixture({
    dataSource: sourceFor([['cv-angular', 'cv-angular']]),
    files: { 'cv-angular-fr.md': '', 'cv-angular-en.md': '# Resume' },
  });
  const problems = checkToolkitAssets(fx);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /cv-angular-fr\.md: file is empty/);
  rmSync(fx.root, { recursive: true, force: true });
});

test('an orphan markdown left in public/ is reported (forgotten card)', () => {
  const fx = fixture({
    dataSource: sourceFor([['cv-angular', 'cv-angular']]),
    files: {
      'cv-angular-fr.md': '# CV',
      'cv-angular-en.md': '# Resume',
      'lettre-motivation-fr.md': '# Orphan',
    },
  });
  const problems = checkToolkitAssets(fx);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /lettre-motivation-fr\.md: present in public/);
  rmSync(fx.root, { recursive: true, force: true });
});

test('a single-language asset is reported', () => {
  const dataSource = `    id: 'cv-angular',
    files: [
      { lang: 'fr', path: '/assets/toolkit/cv-angular-fr.md', format: 'markdown' },
    ],`;
  const fx = fixture({ dataSource, files: { 'cv-angular-fr.md': '# CV' } });
  const problems = checkToolkitAssets(fx);
  assert.deepEqual(problems, ['cv-angular: no EN file declared']);
  rmSync(fx.root, { recursive: true, force: true });
});

test('a path declared outside /assets/toolkit/ is refused', () => {
  const dataSource = `    id: 'cv-angular',
    files: [
      { lang: 'fr', path: '/assets/cv/cv-angular-fr.md', format: 'markdown' },
      { lang: 'en', path: '/assets/toolkit/cv-angular-en.md', format: 'markdown' },
    ],`;
  const fx = fixture({ dataSource, files: { 'cv-angular-en.md': '# Resume' } });
  const problems = checkToolkitAssets(fx);
  assert.match(problems[0], /declared outside \/assets\/toolkit\//);
  rmSync(fx.root, { recursive: true, force: true });
});

test('the real toolkit data matches the real files on disk', () => {
  const problems = checkToolkitAssets({ dataFile: REAL_DATA, publicDir: REAL_PUBLIC });
  assert.deepEqual(problems, []);
});

test('the real toolkit ships every asset in FR and EN', () => {
  const source = readFileSync(REAL_DATA, 'utf8');
  const ids = declaredIds(source);
  const files = declaredFiles(source);
  assert.ok(ids.length >= 6, `expected at least 6 assets, got ${ids.length}`);
  assert.equal(files.length, ids.length * 2, 'every asset must ship an FR and an EN file');
});
