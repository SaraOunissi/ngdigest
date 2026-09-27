// by project-worker 2026-09-09
/**
 * Pure decision logic for the offline `anyComponentStyle` budget check.
 *
 * Why this exists: `ng build --configuration production` is the only thing that
 * normally reports the `anyComponentStyle` budget, and that build cannot run in
 * an offline worker sandbox (`@angular/build` inlines Google Fonts at build
 * time and the network call fails) nor within the per-command time limit. The
 * budget therefore went unmeasured for months while component stylesheets kept
 * growing. This module reproduces the *measurement* — compiled + minified size
 * of each component stylesheet, compared against the budget declared in
 * `angular.json` — without a build.
 *
 * Kept free of any I/O (no fs, no sass, no esbuild) so it can be unit-tested
 * with the built-in Node test runner. The CLI wrapper
 * `scripts/check-style-budgets.mjs` does the file walking and the compilation,
 * delegating every *decision* to the functions below.
 *
 * ⚠️ This is a faithful proxy, not the build itself: it uses the same Sass
 * compiler and the same esbuild CSS minifier the application builder uses, but
 * a real production build stays the source of truth. Treat a result close to a
 * threshold as "verify with a real build", not as gospel.
 */

/** Severity of a stylesheet against the budget. */
export const Severity = Object.freeze({
  /** Under `maximumWarning`. */
  OK: 'ok',
  /** At or over `maximumWarning`, under `maximumError`. Build prints a warning. */
  WARNING: 'warning',
  /** At or over `maximumError`. Build FAILS. */
  ERROR: 'error',
});

/**
 * Parse an Angular budget size into bytes.
 *
 * Mirrors `calculateBytes` in `@angular/build` — notably the fact that `kb`
 * means 1024 bytes, not 1000. Percentages are rejected: they only make sense
 * against a baseline, which `anyComponentStyle` does not have.
 *
 * @param {string} input e.g. `'4kb'`, `'8 KB'`, `'1mb'`, `'2048'`
 * @returns {number} size in bytes
 * @throws {Error} when the value is not a size Angular would accept here
 */
export function parseBudgetSize(input) {
  const matches = String(input).match(/^\s*(\d+(?:\.\d+)?)\s*(%|[mkg]?b)?\s*$/i);
  if (!matches) {
    throw new Error(`Unsupported budget size: ${JSON.stringify(input)}`);
  }

  const unit = (matches[2] ?? '').toLowerCase();
  if (unit === '%') {
    throw new Error('Percentage budgets need a baseline and are not supported here.');
  }

  const value = Number(matches[1]);
  switch (unit) {
    case 'kb':
      return value * 1024;
    case 'mb':
      return value * 1024 * 1024;
    case 'gb':
      return value * 1024 * 1024 * 1024;
    default:
      return value;
  }
}

/**
 * Extract the `anyComponentStyle` budget of a build configuration.
 *
 * @param {object} angularJson parsed `angular.json`
 * @param {string} projectName e.g. `'ngdigest-app'`
 * @param {string} [configuration='production']
 * @returns {{ maximumWarning: number|null, maximumError: number|null }} bytes
 * @throws {Error} when the project or the budget entry is missing — a silent
 *   `null` here would make the checker pass on a misconfigured repo.
 */
export function readComponentStyleBudget(angularJson, projectName, configuration = 'production') {
  const project = angularJson?.projects?.[projectName];
  if (!project) {
    throw new Error(`Project "${projectName}" not found in angular.json`);
  }

  const budgets = project.architect?.build?.configurations?.[configuration]?.budgets;
  if (!Array.isArray(budgets)) {
    throw new Error(`No budgets declared for ${projectName}:build:${configuration}`);
  }

  const budget = budgets.find((entry) => entry?.type === 'anyComponentStyle');
  if (!budget) {
    throw new Error(`No "anyComponentStyle" budget in ${projectName}:build:${configuration}`);
  }

  return {
    maximumWarning:
      budget.maximumWarning === undefined ? null : parseBudgetSize(budget.maximumWarning),
    maximumError: budget.maximumError === undefined ? null : parseBudgetSize(budget.maximumError),
  };
}

/**
 * Collect the component stylesheet paths declared by a TypeScript source.
 *
 * Handles both `styleUrl: '…'` (Angular 17+, the form used across this repo)
 * and the legacy `styleUrls: ['…', '…']`. Paths are returned verbatim, still
 * relative to the component file — resolving them is the caller's job.
 *
 * Only `.scss`/`.css` string literals are returned, so a computed value can
 * never be mistaken for a path.
 *
 * @param {string} source contents of a `.ts` file
 * @returns {string[]} declared stylesheet paths, in source order, deduplicated
 */
export function extractStyleUrls(source) {
  const found = [];

  const single = /styleUrl\s*:\s*(['"`])([^'"`]+\.s?css)\1/g;
  for (const match of source.matchAll(single)) {
    found.push(match[2]);
  }

  const many = /styleUrls\s*:\s*\[([^\]]*)\]/g;
  for (const match of source.matchAll(many)) {
    const literals = /(['"`])([^'"`]+\.s?css)\1/g;
    for (const literal of match[1].matchAll(literals)) {
      found.push(literal[2]);
    }
  }

  return [...new Set(found)];
}

/**
 * Grade a compiled stylesheet size against the budget.
 *
 * Angular reports a budget as breached when the size is **strictly greater**
 * than the threshold, so a stylesheet landing exactly on 4096 bytes is still
 * OK. Same convention here.
 *
 * @param {number} bytes minified size of the component stylesheet
 * @param {{ maximumWarning: number|null, maximumError: number|null }} budget
 * @returns {string} one of {@link Severity}
 */
export function classifySize(bytes, budget) {
  if (budget?.maximumError != null && bytes > budget.maximumError) {
    return Severity.ERROR;
  }
  if (budget?.maximumWarning != null && bytes > budget.maximumWarning) {
    return Severity.WARNING;
  }
  return Severity.OK;
}

/**
 * Human-readable byte count using the same 1024 factor as the budgets.
 *
 * @param {number} bytes
 * @returns {string} e.g. `'5.96 kB'`
 */
export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

/**
 * Summarise a run: worst severity + counts, so the CLI's exit code and the
 * one-line verdict come from a single tested place.
 *
 * @param {Array<{ severity: string }>} results
 * @returns {{ worst: string, ok: number, warning: number, error: number }}
 */
export function summarise(results) {
  const counts = { ok: 0, warning: 0, error: 0 };
  for (const { severity } of results) {
    counts[severity] = (counts[severity] ?? 0) + 1;
  }

  const worst =
    counts.error > 0 ? Severity.ERROR : counts.warning > 0 ? Severity.WARNING : Severity.OK;

  return { worst, ...counts };
}
