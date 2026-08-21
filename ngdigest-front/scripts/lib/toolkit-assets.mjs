// by project-worker 2026-08-21
/**
 * Integrity guard for the /carriere/toolkit downloads (q176).
 *
 * The toolkit page is nothing but download links: `toolkit.data.ts` declares a
 * `path` per asset and per language, and the file behind it lives in `public/`.
 * Nothing in the TypeScript build checks that the two agree — rename or delete a
 * markdown file and the page keeps rendering a button that 404s. A dead download
 * is worse than no download: the visitor has already given us their click.
 *
 * So the paths are extracted from the data file and confronted with the disk:
 *  - every declared path must exist and be non-empty,
 *  - every path must live under `/assets/toolkit/` (a typo'd absolute path would
 *    otherwise silently point at a 404 on the deployed site),
 *  - every asset must be offered in both languages,
 *  - every file actually present in `public/assets/toolkit/` must be declared
 *    (an orphan file means a forgotten card, which is the silent half of the bug).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PATH_PREFIX = '/assets/toolkit/';

/** Extracts `{ lang, path }` pairs declared in `toolkit.data.ts`. */
export function declaredFiles(dataSource) {
  const matches = dataSource.matchAll(
    /lang:\s*'(fr|en)'\s*,\s*path:\s*'([^']+)'\s*,\s*format:\s*'([^']+)'/g
  );
  return [...matches].map(([, lang, path, format]) => ({ lang, path, format }));
}

/** Extracts the asset ids, in declaration order. */
export function declaredIds(dataSource) {
  return [...dataSource.matchAll(/^\s{4}id:\s*'([^']+)'/gm)].map(([, id]) => id);
}

/**
 * Confront the declared downloads with what is really on disk.
 *
 * @param {object} io
 * @param {string} io.dataFile   Absolute path to `toolkit.data.ts`.
 * @param {string} io.publicDir  Absolute path to the `public/` directory.
 * @returns {string[]} Human-readable problems; empty array means everything checks out.
 */
export function checkToolkitAssets({ dataFile, publicDir }) {
  const source = readFileSync(dataFile, 'utf8');
  const files = declaredFiles(source);
  const problems = [];

  if (files.length === 0) {
    return ['no download declared in toolkit.data.ts (the page would render empty cards)'];
  }

  for (const file of files) {
    if (!file.path.startsWith(PATH_PREFIX)) {
      problems.push(`${file.path}: declared outside ${PATH_PREFIX}`);
      continue;
    }
    const onDisk = join(publicDir, file.path.replace(/^\//, ''));
    let size = -1;
    try {
      size = statSync(onDisk).size;
    } catch {
      problems.push(`${file.path}: declared but missing from public/ (download would 404)`);
      continue;
    }
    if (size === 0) {
      problems.push(`${file.path}: file is empty`);
    }
  }

  // Both languages per asset.
  const byBasename = new Map();
  for (const file of files) {
    const key = file.path.replace(PATH_PREFIX, '').replace(/-(fr|en)\.md$/, '');
    byBasename.set(key, [...(byBasename.get(key) ?? []), file.lang]);
  }
  for (const [asset, langs] of byBasename) {
    for (const lang of ['fr', 'en']) {
      if (!langs.includes(lang)) {
        problems.push(`${asset}: no ${lang.toUpperCase()} file declared`);
      }
    }
  }

  // Orphan files on disk.
  const declared = new Set(files.map((file) => file.path.replace(PATH_PREFIX, '')));
  let onDiskNames = [];
  try {
    onDiskNames = readdirSync(join(publicDir, 'assets', 'toolkit'));
  } catch {
    problems.push('public/assets/toolkit/ does not exist');
  }
  for (const name of onDiskNames) {
    if (!declared.has(name)) {
      problems.push(
        `${name}: present in public/assets/toolkit/ but not declared in toolkit.data.ts`
      );
    }
  }

  return problems;
}
