// by project-worker 2026-09-04 — q178
//
// Guard against "routed but not prerendered" drift.
//
// Real regression this spec was written for (found 2026-09-04): the four legal
// pages (`mentions-legales`, `politique-confidentialite`, `legal-notice`,
// `privacy-policy`) were declared in `app.routes.ts` and reachable from the
// footer, but had no entry in `app.routes.server.ts`. They therefore fell
// through to the `**` catch-all — `RenderMode.Server` — and were rendered on
// demand by the serverless handler on every hit, for two pages whose content is
// entirely static. Nothing was visibly broken, which is exactly why it survived
// the refonte: the only symptom is a page that is not in the prerendered output.
//
// The invariant below makes that state impossible to re-introduce silently:
// every child route declared under the `:lang` shell must have a matching
// `ServerRoute`, unless it is listed in EXPECTED_NON_PRERENDERED with a reason.
//
// The second suite guards the lazy-loading work done in the same pass: a page
// route must use `loadComponent`, never an eager `component:`, otherwise the
// component (and its template + styles) lands back in the initial bundle.

import { Route, Routes } from '@angular/router';

import { routes } from '../../app.routes';
import { serverRoutes } from '../../app.routes.server';

/** Child routes under `:lang` that are deliberately NOT prerendered. */
const EXPECTED_NON_PRERENDERED: Readonly<Record<string, string>> = {
  // No page of its own: `''` is served by the `:lang` ServerRoute itself.
};

/** Every child route declared under the `:lang` shell. */
function langChildren(allRoutes: Routes): readonly Route[] {
  const langShell = allRoutes.find((route) => route.path === ':lang');
  return langShell?.children ?? [];
}

/** `carriere/guide` → `:lang/carriere/guide`, `''` → `:lang`. */
function toServerPath(childPath: string): string {
  return childPath === '' ? ':lang' : `:lang/${childPath}`;
}

describe('prerender coverage', () => {
  const children = langChildren(routes);
  const serverPaths = new Set(serverRoutes.map((route) => route.path));

  it('finds the :lang shell and its children (guards against an empty import)', () => {
    expect(children.length).toBeGreaterThan(0);
    expect(serverPaths.size).toBeGreaterThan(1);
  });

  for (const child of children) {
    const path = child.path ?? '';

    // Redirect-only entries have no page to render.
    if (child.redirectTo !== undefined) {
      continue;
    }

    it(`${path || '(index)'}: is declared in app.routes.server.ts`, () => {
      if (path in EXPECTED_NON_PRERENDERED) {
        expect(serverPaths.has(toServerPath(path))).toBe(false);
        return;
      }
      expect(serverPaths.has(toServerPath(path))).toBe(true);
    });
  }

  it('does not declare a ServerRoute for a path the router does not know', () => {
    const declared = new Set(
      children
        .filter((child) => child.redirectTo === undefined)
        .map((child) => toServerPath(child.path ?? ''))
    );

    const orphans = serverRoutes
      .map((route) => route.path)
      .filter((path) => path !== '**' && !declared.has(path));

    expect(orphans).toEqual([]);
  });
});

describe('route code-splitting', () => {
  const children = langChildren(routes);

  for (const child of children) {
    if (child.redirectTo !== undefined) {
      continue;
    }

    const path = child.path ?? '';

    it(`${path || '(index)'}: is lazy-loaded, not pulled into the initial bundle`, () => {
      expect(child.component).toBeUndefined();
      expect(typeof child.loadComponent).toBe('function');
    });
  }
});
