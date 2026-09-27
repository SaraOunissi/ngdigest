// by project-worker 2026-09-09
/**
 * Offline `anyComponentStyle` budget checker.
 *
 * `ng build --configuration production` is normally the only thing that reports
 * the `anyComponentStyle` budget, and it cannot run in an offline worker
 * sandbox (`@angular/build` inlines Google Fonts over the network at build
 * time) nor inside a short command timeout. This script answers the same
 * question in a couple of seconds and with no network: for every component
 * stylesheet, compile the Sass and minify the CSS exactly as the application
 * builder does, then compare the result against the budget declared in
 * `angular.json`.
 *
 * Usage:
 *   node scripts/check-style-budgets.mjs           # table + exit 1 if over the error budget
 *   node scripts/check-style-budgets.mjs --all     # list every stylesheet, not just breaches
 *   node scripts/check-style-budgets.mjs --json    # machine-readable output
 *
 * Exit code: 1 when a stylesheet exceeds `maximumError` (same failure the real
 * build would produce), 0 otherwise — warnings are printed but do not fail, so
 * the script can be wired into CI as a gate without flipping red on a 4 kB
 * warning.
 *
 * ⚠️ Proxy, not the build. Same Sass compiler, same esbuild CSS minifier, but
 * the real production build stays the source of truth; a result within a few
 * hundred bytes of a threshold deserves a real build before you trust it.
 *
 * All decision logic lives in ./lib/style-budgets.mjs (unit-tested).
 */

import { readdir, readFile } from 'fs/promises';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

import {
  Severity,
  classifySize,
  extractStyleUrls,
  formatBytes,
  readComponentStyleBudget,
  summarise,
} from './lib/style-budgets.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const APP_DIR = join(ROOT, 'src', 'app');
const PROJECT_NAME = 'ngdigest-app';
const CONFIGURATION = 'production';
/** Mirrors `stylePreprocessorOptions.includePaths` in angular.json. */
const SASS_LOAD_PATHS = [join(ROOT, 'src', 'styles')];

const require = createRequire(import.meta.url);

const showAll = process.argv.includes('--all');
const asJson = process.argv.includes('--json');

/**
 * Every `.ts` file under `src/app`, recursively.
 *
 * @param {string} dir
 * @returns {Promise<string[]>} absolute paths
 */
async function collectTsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return collectTsFiles(full);
      if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
        return [full];
      }
      return [];
    })
  );
  return files.flat();
}

/**
 * Compile one stylesheet and return its minified byte size.
 *
 * @param {string} file absolute path to a `.scss`/`.css` file
 * @param {{ compile: Function }} sass
 * @param {{ transform: Function }} esbuild
 * @returns {Promise<number>} bytes after compilation + minification
 */
async function measure(file, sass, esbuild) {
  const css = file.endsWith('.css')
    ? await readFile(file, 'utf8')
    : sass.compile(file, { loadPaths: SASS_LOAD_PATHS, style: 'expanded' }).css;

  const { code } = await esbuild.transform(css, { loader: 'css', minify: true });
  return Buffer.byteLength(code);
}

async function main() {
  // Resolved lazily so the pure lib (and its unit tests) never pull these in.
  const sass = require('sass');
  const esbuild = require('esbuild');

  const angularJson = JSON.parse(await readFile(join(ROOT, 'angular.json'), 'utf8'));
  const budget = readComponentStyleBudget(angularJson, PROJECT_NAME, CONFIGURATION);

  const tsFiles = await collectTsFiles(APP_DIR);
  const stylesheets = new Map(); // absolute path -> component that declares it

  for (const tsFile of tsFiles) {
    const source = await readFile(tsFile, 'utf8');
    for (const styleUrl of extractStyleUrls(source)) {
      const absolute = resolve(dirname(tsFile), styleUrl);
      if (!stylesheets.has(absolute)) {
        stylesheets.set(absolute, relative(ROOT, tsFile));
      }
    }
  }

  const results = [];
  for (const [file, component] of stylesheets) {
    let bytes;
    try {
      bytes = await measure(file, sass, esbuild);
    } catch (error) {
      // A stylesheet that does not compile is a real problem, but it is the
      // build's problem to report — here it must not be silently counted as 0.
      console.error(`✖ could not compile ${relative(ROOT, file)}: ${error.message}`);
      process.exitCode = 1;
      continue;
    }

    results.push({
      file: relative(ROOT, file).split('\\').join('/'),
      component: component.split('\\').join('/'),
      bytes,
      severity: classifySize(bytes, budget),
    });
  }

  results.sort((a, b) => b.bytes - a.bytes);
  const summary = summarise(results);

  if (asJson) {
    console.log(JSON.stringify({ budget, summary, results }, null, 2));
  } else {
    const shown = showAll ? results : results.filter((r) => r.severity !== Severity.OK);

    console.log(
      `anyComponentStyle budget — warning > ${formatBytes(budget.maximumWarning ?? 0)}, ` +
        `error > ${formatBytes(budget.maximumError ?? 0)} (compiled + minified)`
    );
    console.log(`${results.length} component stylesheets measured\n`);

    if (shown.length === 0) {
      console.log('✔ every component stylesheet is under the warning threshold.');
    } else {
      for (const result of shown) {
        const mark =
          result.severity === Severity.ERROR
            ? '✖'
            : result.severity === Severity.WARNING
              ? '⚠'
              : ' ';
        console.log(`${mark} ${formatBytes(result.bytes).padStart(9)}  ${result.file}`);
      }
      if (!showAll) console.log('\n(pass --all to list the stylesheets that are within budget)');
    }

    console.log(
      `\n${summary.error} over the error budget · ${summary.warning} over the warning budget · ${summary.ok} fine`
    );
    console.log('Proxy measurement — confirm with a real production build before acting.');
  }

  if (summary.worst === Severity.ERROR) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
