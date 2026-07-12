import { ROUTE_SLUG_TRANSLATIONS, translateRoutePath } from './route-slugs';

describe('translateRoutePath', () => {
  it('translates the home root, swapping only the language prefix', () => {
    expect(translateRoutePath('/fr', 'en')).toBe('/en');
    expect(translateRoutePath('/en', 'fr')).toBe('/fr');
  });

  it('keeps a slug that is identical in both languages (veille)', () => {
    expect(translateRoutePath('/fr/veille', 'en')).toBe('/en/veille');
    expect(translateRoutePath('/en/veille', 'fr')).toBe('/fr/veille');
  });

  it('translates a top-level slug that differs (carriere ↔ career)', () => {
    expect(translateRoutePath('/fr/carriere', 'en')).toBe('/en/career');
    expect(translateRoutePath('/en/career', 'fr')).toBe('/fr/carriere');
  });

  it('translates the catalog slug (ressources ↔ resources)', () => {
    expect(translateRoutePath('/fr/ressources', 'en')).toBe('/en/resources');
    expect(translateRoutePath('/en/resources', 'fr')).toBe('/fr/ressources');
  });

  it('translates the parent segment for career sub-pages sharing the leaf (guide)', () => {
    expect(translateRoutePath('/fr/carriere/guide', 'en')).toBe('/en/career/guide');
    expect(translateRoutePath('/en/career/guide', 'fr')).toBe('/fr/carriere/guide');
  });

  it('translates career sub-pages whose leaf also differs', () => {
    expect(translateRoutePath('/fr/carriere/entretien', 'en')).toBe('/en/career/interview');
    expect(translateRoutePath('/en/career/interview', 'fr')).toBe('/fr/carriere/entretien');
    expect(translateRoutePath('/fr/carriere/formations', 'en')).toBe('/en/career/trainings');
    expect(translateRoutePath('/fr/carriere/plateformes', 'en')).toBe('/en/career/platforms');
  });

  it('translates the legal pages', () => {
    expect(translateRoutePath('/fr/mentions-legales', 'en')).toBe('/en/legal-notice');
    expect(translateRoutePath('/en/privacy-policy', 'fr')).toBe('/fr/politique-confidentialite');
  });

  it('preserves a query string / hash suffix', () => {
    expect(translateRoutePath('/fr/veille?tag=rxjs', 'en')).toBe('/en/veille?tag=rxjs');
    expect(translateRoutePath('/fr/carriere/guide#faq', 'en')).toBe('/en/career/guide#faq');
  });

  it('strips a trailing slash before looking up the slug', () => {
    expect(translateRoutePath('/fr/carriere/', 'en')).toBe('/en/career');
  });

  it('every mapping is symmetric (a→b implies b→a)', () => {
    for (const [from, to] of Object.entries(ROUTE_SLUG_TRANSLATIONS)) {
      expect(ROUTE_SLUG_TRANSLATIONS[to]).toBe(from);
    }
  });
});
