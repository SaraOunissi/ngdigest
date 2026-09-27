// by project-worker 2026-08-19
//
// Guard against "shipped but still advertised as Bientôt" drift.
//
// Real regression this spec was written for (found 2026-08-19): `/carriere/formations`
// and `/carriere/observatoire` were live — routed, prerendered, in the sitemap and
// clickable from the career hub — while the home page still rendered them as dead
// "Bientôt" tiles, and the certifications page still linked "Se préparer aux certifs"
// to the hub with the copy "bientôt dans le hub carrière".
//
// The invariant below is what makes that state impossible to re-introduce silently:
// an entry point is "soon" **iff** its page is not routable.

import { Routes } from '@angular/router';

import { routes } from '../../app.routes';
import { ENTRY_DEFINITIONS } from '../../features/home/presentation/pages/home/home';
import { STEP_DEFINITIONS } from '../../features/career/presentation/pages/career-hub/career-hub';

const LANGS = ['fr', 'en'] as const;

/**
 * FR path each entry-point id would live at once shipped, keyed by id.
 *
 * This is what makes the guard bite: a tile can advertise "Bientôt" *and* hand
 * out `route: () => null`, which is self-consistent — yet the page is live and
 * reachable from every other surface. Comparing the id to the router's declared
 * paths is the only way to catch that.
 */
const EXPECTED_PATH_BY_ID: Readonly<Record<string, string>> = {
  guide: 'carriere/guide',
  formations: 'carriere/formations',
  certifications: 'carriere/certifications',
  interview: 'carriere/entretien',
  entretien: 'carriere/entretien',
  plateformes: 'carriere/plateformes',
  observatoire: 'carriere/observatoire',
  toolkit: 'carriere/toolkit',
  jobs: 'jobs',
  resources: 'ressources',
};

/** Every declared path under the `:lang` shell, e.g. `carriere/formations`. */
function declaredLangPaths(allRoutes: Routes): Set<string> {
  const langShell = allRoutes.find((route) => route.path === ':lang');
  const children = langShell?.children ?? [];
  return new Set(children.map((child) => child.path ?? '').filter((path) => path !== ''));
}

/** `['/', 'fr', 'carriere', 'formations']` → `carriere/formations`. */
function commandsToPath(commands: readonly string[]): string {
  return commands
    .slice(2)
    .filter((segment) => segment !== '')
    .join('/');
}

describe('navigation consistency', () => {
  const paths = declaredLangPaths(routes);

  const entryPoints = [
    ...ENTRY_DEFINITIONS.map((entry) => ({ source: 'home', ...entry })),
    ...STEP_DEFINITIONS.map((step) => ({ source: 'career-hub', ...step })),
  ];

  it('declares at least one entry point per surface (guards against an empty import)', () => {
    expect(ENTRY_DEFINITIONS.length).toBeGreaterThan(0);
    expect(STEP_DEFINITIONS.length).toBeGreaterThan(0);
  });

  for (const entry of entryPoints) {
    for (const lang of LANGS) {
      it(`${entry.source}/${entry.id} (${lang}): every linked route is declared in app.routes`, () => {
        const commands = entry.route(lang);
        if (commands === null) {
          return;
        }
        expect(paths.has(commandsToPath(commands))).toBe(true);
      });
    }

    it(`${entry.source}/${entry.id}: chip status matches whether the page is clickable`, () => {
      const hasDestination = LANGS.some((lang) => entry.route(lang) !== null);
      if (entry.status === 'soon') {
        // A "soon" chip on a clickable tile is one half of the drift.
        expect(hasDestination).toBe(false);
      } else {
        expect(hasDestination).toBe(true);
      }
    });

    it(`${entry.source}/${entry.id}: is not advertised as "soon" once its page ships`, () => {
      const expectedPath = EXPECTED_PATH_BY_ID[entry.id];
      // An id with no known landing path can't be checked — fail loudly rather
      // than skip, so a new entry point has to be declared above.
      expect(typeof expectedPath).toBe('string');
      if (paths.has(expectedPath)) {
        expect(entry.status).not.toBe('soon');
        expect(entry.route('fr')).not.toBeNull();
      }
    });
  }

  it('keeps the FR and EN slug pair in sync for every linked entry point', () => {
    for (const entry of entryPoints) {
      const fr = entry.route('fr');
      const en = entry.route('en');
      expect(fr === null).toBe(en === null);
      if (fr && en) {
        expect(fr.length).toBe(en.length);
      }
    }
  });
});
