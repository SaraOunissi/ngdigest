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
export const ROUTE_SLUG_TRANSLATIONS: Record<string, string> = {
  carriere: 'career',
  career: 'carriere',
  ressources: 'resources',
  resources: 'ressources',
  'carriere/guide': 'career/guide',
  'career/guide': 'carriere/guide',
  'carriere/certifications': 'career/certifications',
  'career/certifications': 'carriere/certifications',
  'carriere/formations': 'career/trainings',
  'career/trainings': 'carriere/formations',
  'carriere/plateformes': 'career/platforms',
  'career/platforms': 'carriere/plateformes',
  'carriere/entretien': 'career/interview',
  'career/interview': 'carriere/entretien',
  'mentions-legales': 'legal-notice',
  'legal-notice': 'mentions-legales',
  'politique-confidentialite': 'privacy-policy',
  'privacy-policy': 'politique-confidentialite',
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
