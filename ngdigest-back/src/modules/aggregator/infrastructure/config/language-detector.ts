import { ResourceLanguage } from '../../../resources/domain/entities/resource.entity.js';

/**
 * Known French-language domains not detectable by TLD alone.
 * Articles from these sources are classified as 'fr'.
 */
export const FRENCH_DOMAINS: readonly string[] = [
  'jesuisundev.com',
  'la-cascade.io',
  'putaindecode.io',
  'alticreation.com',
] as const;

/**
 * French-specific words and substrings that are safe indicators of French language.
 * These are either uniquely French or extremely rare in English tech article titles.
 * Presence of 2+ of these in a title classifies the article as French.
 */
export const FRENCH_TITLE_INDICATORS: readonly string[] = [
  'pour ',       // "pour Angular", "pour créer"
  'avec ',       // "avec Angular"
  'dans ',       // "dans Angular", "dans ce tutoriel"
  'votre ',      // "dans votre application"
  'notre ',      // "dans notre projet"
  'comprendre',  // French tutorial verb
  'découvrir',   // French tutorial verb (with accent)
  'decouvrir',   // French tutorial verb (without accent)
  'utiliser',    // French tutorial verb
  'meilleures',  // "les meilleures pratiques"
  'nouvelle ',   // "nouvelle version" (feminine form, very rare in English titles)
  'nouvelles ',  // "nouvelles fonctionnalités"
] as const;

/**
 * Detects the language of an article based on its URL.
 * Rules (in order):
 * 1. Hostname ends with .fr → 'fr'
 * 2. Hostname matches a known French domain → 'fr'
 * 3. Otherwise → 'en'
 * 4. On parse error → 'unknown'
 */
export function detectLanguageFromUrl(
  url: string | undefined,
): ResourceLanguage {
  if (!url) return 'unknown';
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    if (
      hostname.endsWith('.fr') ||
      (FRENCH_DOMAINS as readonly string[]).includes(hostname)
    ) {
      return 'fr';
    }
    return 'en';
  } catch {
    return 'unknown';
  }
}

/**
 * Detects language from an article title using French-specific word patterns.
 * Returns 'fr' if 2+ French indicators are found in the title, null otherwise.
 * Intended as a complement for articles on multilingual platforms (dev.to, medium.com…).
 */
export function detectLanguageFromTitle(
  title: string | undefined,
): ResourceLanguage | null {
  if (!title) return null;
  const lower = title.toLowerCase();
  const matchCount = (FRENCH_TITLE_INDICATORS as readonly string[]).filter(
    (indicator) => lower.includes(indicator),
  ).length;
  return matchCount >= 2 ? 'fr' : null;
}

/**
 * Combined language detection using URL (primary) and title (fallback for multilingual domains).
 * Prefer this over detectLanguageFromUrl when an article title is available.
 *
 * Resolution order:
 * 1. If URL indicates French (.fr TLD or known French domain) → 'fr'
 * 2. If URL is unparseable → 'unknown'
 * 3. If title contains 2+ French indicators → 'fr'
 * 4. Otherwise → 'en'
 */
export function detectLanguage(
  url: string | undefined,
  title?: string | undefined,
): ResourceLanguage {
  const urlLang = detectLanguageFromUrl(url);

  if (urlLang === 'fr') return 'fr';
  if (urlLang === 'unknown') return 'unknown';

  // URL defaults to 'en' — cross-check with title for multilingual platforms
  if (title) {
    const titleLang = detectLanguageFromTitle(title);
    if (titleLang === 'fr') return 'fr';
  }

  return 'en';
}
