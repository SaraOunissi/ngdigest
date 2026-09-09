// by project-worker 2026-09-09
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  Severity,
  classifySize,
  extractStyleUrls,
  formatBytes,
  parseBudgetSize,
  readComponentStyleBudget,
  summarise,
} from './style-budgets.mjs';

test('parseBudgetSize uses 1024 as the kB factor, like @angular/build', () => {
  assert.equal(parseBudgetSize('4kb'), 4096);
  assert.equal(parseBudgetSize('8KB'), 8192);
  assert.equal(parseBudgetSize('1mb'), 1024 * 1024);
  assert.equal(parseBudgetSize('500b'), 500);
  assert.equal(parseBudgetSize('2048'), 2048);
  assert.equal(parseBudgetSize(' 1.5 kb '), 1536);
});

test('parseBudgetSize rejects percentages and nonsense', () => {
  assert.throws(() => parseBudgetSize('10%'), /baseline/);
  assert.throws(() => parseBudgetSize('big'), /Unsupported budget size/);
  assert.throws(() => parseBudgetSize(''), /Unsupported budget size/);
});

test('readComponentStyleBudget reads the production anyComponentStyle entry', () => {
  const angularJson = {
    projects: {
      app: {
        architect: {
          build: {
            configurations: {
              production: {
                budgets: [
                  { type: 'initial', maximumWarning: '500kB', maximumError: '1MB' },
                  { type: 'anyComponentStyle', maximumWarning: '4kB', maximumError: '8kB' },
                ],
              },
            },
          },
        },
      },
    },
  };

  assert.deepEqual(readComponentStyleBudget(angularJson, 'app'), {
    maximumWarning: 4096,
    maximumError: 8192,
  });
});

test('readComponentStyleBudget fails loudly rather than silently passing', () => {
  assert.throws(() => readComponentStyleBudget({ projects: {} }, 'app'), /not found/);
  assert.throws(
    () => readComponentStyleBudget({ projects: { app: {} } }, 'app'),
    /No budgets declared/
  );
  assert.throws(
    () =>
      readComponentStyleBudget(
        {
          projects: {
            app: { architect: { build: { configurations: { production: { budgets: [] } } } } },
          },
        },
        'app'
      ),
    /anyComponentStyle/
  );
});

test('extractStyleUrls handles styleUrl, styleUrls and deduplicates', () => {
  const source = `
    @Component({
      selector: 'app-thing',
      templateUrl: './thing.html',
      styleUrl: './thing.scss',
    })
    export class Thing {}

    @Component({
      selector: 'app-other',
      styleUrls: ['./other.scss', '../shared/shared.css', './thing.scss'],
    })
    export class Other {}
  `;

  assert.deepEqual(extractStyleUrls(source), [
    './thing.scss',
    './other.scss',
    '../shared/shared.css',
  ]);
});

test('extractStyleUrls ignores non-stylesheet and computed values', () => {
  const source = `
    @Component({ templateUrl: './thing.html', styleUrl: STYLE_PATH })
    export class Thing {}
  `;

  assert.deepEqual(extractStyleUrls(source), []);
});

test('classifySize breaches only when strictly over the threshold', () => {
  const budget = { maximumWarning: 4096, maximumError: 8192 };

  assert.equal(classifySize(4096, budget), Severity.OK);
  assert.equal(classifySize(4097, budget), Severity.WARNING);
  assert.equal(classifySize(8192, budget), Severity.WARNING);
  assert.equal(classifySize(8193, budget), Severity.ERROR);
});

test('classifySize tolerates a half-declared budget', () => {
  assert.equal(classifySize(9000, { maximumWarning: null, maximumError: 8192 }), Severity.ERROR);
  assert.equal(classifySize(9000, { maximumWarning: 4096, maximumError: null }), Severity.WARNING);
  assert.equal(classifySize(9000, { maximumWarning: null, maximumError: null }), Severity.OK);
});

test('summarise reports the worst severity and the counts', () => {
  assert.deepEqual(summarise([{ severity: 'ok' }, { severity: 'ok' }]), {
    worst: Severity.OK,
    ok: 2,
    warning: 0,
    error: 0,
  });

  assert.deepEqual(summarise([{ severity: 'ok' }, { severity: 'warning' }]), {
    worst: Severity.WARNING,
    ok: 1,
    warning: 1,
    error: 0,
  });

  assert.deepEqual(summarise([{ severity: 'warning' }, { severity: 'error' }]), {
    worst: Severity.ERROR,
    ok: 0,
    warning: 1,
    error: 1,
  });

  assert.equal(summarise([]).worst, Severity.OK);
});

test('formatBytes uses the same 1024 factor as the budgets', () => {
  assert.equal(formatBytes(6099), '5.96 kB');
  assert.equal(formatBytes(4096), '4.00 kB');
});
