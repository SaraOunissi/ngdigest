/**
 * FR ↔ EN slug translations for routes whose path differs between languages.
 *
 * Single source of truth, consumed by:
 *  - the header language switcher (keep the user on the same page when toggling)
 *  - {@link SeoService} (emit correct hreflang / alternate-language URLs)
 *
 * Keyed by the full path *after* the `/<lang>/` prefix. Routes whose slug is
 * identical in both languages (`veille`, `sources`, `about`, `blog`, `jobs`)
 * are intentionally absent — callers fall back to the untranslated path.
 *
 * Per-article blog slugs are NOT here (they are dynamic); those pass an explicit
 * alternate URL to the SEO service instead.
 */
/** [French slug, English slug] for every route whose path differs by language. */
const ROUTE_SLUG_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['carriere', 'career'],
  ['ressources', 'resources'],
  ['carriere/guide', 'career/guide'],
  ['carriere/certifications', 'career/certifications'],
  ['carriere/formations', 'career/trainings'],
  ['carriere/plateformes', 'career/platforms'],
  ['carriere/entretien', 'career/interview'],
  ['carriere/observatoire', 'career/observatory'],
  ['carriere/toolkit', 'career/toolkit'],
  ['outils', 'tools'],
  ['outils/support-versions-angular', 'tools/angular-version-support'],
  ['mentions-legales', 'legal-notice'],
  ['politique-confidentialite', 'privacy-policy'],
];

export const ROUTE_SLUG_TRANSLATIONS: Record<string, string> = Object.fromEntries(
  ROUTE_SLUG_PAIRS.flatMap(([frenchSlug, englishSlug]) => [
    [frenchSlug, englishSlug],
    [englishSlug, frenchSlug],
  ]),
);

const SLUG_BY_LANG: Record<'fr' | 'en', Record<string, string>> = {
  fr: Object.fromEntries(
    ROUTE_SLUG_PAIRS.flatMap(([frenchSlug, englishSlug]) => [
      [frenchSlug, frenchSlug],
      [englishSlug, frenchSlug],
    ]),
  ),
  en: Object.fromEntries(
    ROUTE_SLUG_PAIRS.flatMap(([frenchSlug, englishSlug]) => [
      [frenchSlug, englishSlug],
      [englishSlug, englishSlug],
    ]),
  ),
};

/**
 * Translate a `/<lang>/<path><suffix>` URL to the target language, converting
 * the slug when it differs between languages and preserving any query-string or
 * hash suffix. Unmapped slugs (identical across languages) are kept as-is.
 *
 * @param url        - Current URL, e.g. `/fr/carriere/guide` or `/fr/veille?tag=rxjs`
 * @param targetLang - Language to translate to
 * @returns The equivalent URL in `targetLang`, e.g. `/en/career/guide`
 */
export function translateRoutePath(url: string, targetLang: 'fr' | 'en'): string {
  const match = url.match(/^\/(?:fr|en)(?:\/([^?#]*))?([?#].*)?$/);
  const path = (match?.[1] ?? '').replace(/\/$/, '');
  const suffix = match?.[2] ?? '';
  const translatedPath = ROUTE_SLUG_TRANSLATIONS[path] ?? path;
  return translatedPath
    ? `/${targetLang}/${translatedPath}${suffix}`
    : `/${targetLang}${suffix}`;
}

/**
 * Rewrite a `/<lang>/<path>` URL so its slug matches `lang` (e.g.
 * `/en/carriere/entretien` → `/en/career/interview`). Used for canonical URLs:
 * a page reachable under the other language's slug must not be self-canonical.
 *
 * @param url  - Current URL path
 * @param lang - Language whose slug the URL should use
 * @returns The URL with the language-appropriate slug, query/hash preserved
 */
export function localizeRoutePath(url: string, lang: 'fr' | 'en'): string {
  const match = url.match(/^\/(?:fr|en)(?:\/([^?#]*))?([?#].*)?$/);
  const path = (match?.[1] ?? '').replace(/\/$/, '');
  const suffix = match?.[2] ?? '';
  const localizedPath = SLUG_BY_LANG[lang][path] ?? path;
  return localizedPath ? `/${lang}/${localizedPath}${suffix}` : `/${lang}${suffix}`;
}
