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
  'easyangularkit.com',
  'bonjour-angular.com',
  'monsieurangular.com',
  'blog.liksi.io',
] as const;

/** Matches common French grammatical function words using word boundaries. */
const FRENCH_FUNCTION_WORD_RE =
  /\b(le|la|les|des|du|un|une|et|en|de|pour|par|sur|avec|dans)\b/gi;

/** Matches French-specific accent characters that are strong language indicators. */
const FRENCH_ACCENT_RE = /[àâäéèêëîïôùûüç]/;

/**
 * Matches characters that only appear in languages other than French or English.
 * - Spanish: á í ó ú ñ ¿ ¡  (acute on a/i/o/u is not used in French)
 * - Arabic, Cyrillic, CJK and other non-Latin scripts
 */
const OTHER_LANGUAGE_RE = /[áíóúñ¿¡\u0600-\u06FF\u0400-\u04FF\u4E00-\u9FFF]/;

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
 * Detects language from article text (title + optional snippet).
 * Priority order:
 * 1. French accent character (àâäéèêëîïôùûüç) → 'fr'
 * 2. 2+ French grammatical function words → 'fr'
 * 3. Clearly non-EN/FR character (Spanish á/ñ, Arabic, Cyrillic, CJK…) → 'unknown'
 * 4. No signal → null (caller defaults to 'en')
 */
export function detectLanguageFromText(
  title: string | undefined,
  snippet?: string | undefined,
): ResourceLanguage | null {
  if (!title) return null;
  const combined = snippet ? `${title} ${snippet}` : title;

  if (FRENCH_ACCENT_RE.test(combined)) return 'fr';

  // Check for non-EN/FR characters BEFORE function words:
  // "diseño en Angular" has "en" (French function word) AND "ñ" (Spanish) —
  // the other-language signal takes priority over ambiguous function words.
  if (OTHER_LANGUAGE_RE.test(combined)) return 'unknown';

  const matches = combined.match(FRENCH_FUNCTION_WORD_RE);
  if (matches && matches.length >= 2) return 'fr';

  return null;
}

/**
 * @deprecated Use detectLanguageFromText instead.
 * Kept for backward compatibility — delegates to detectLanguageFromText(title).
 */
export function detectLanguageFromTitle(
  title: string | undefined,
): ResourceLanguage | null {
  return detectLanguageFromText(title);
}

/**
 * Combined language detection using URL (primary) and text (fallback for multilingual domains).
 * Prefer this over detectLanguageFromUrl when an article title is available.
 *
 * Resolution order:
 * 1. If URL indicates French (.fr TLD or known French domain) → 'fr'
 * 2. If URL is unparseable → 'unknown'
 * 3. If title/snippet contains a French accent or 2+ French function words → 'fr'
 * 4. Otherwise → 'en'
 *
 * Note: this title-based heuristic is a fallback. When a source declares the
 * article language (e.g. the Dev.to API), trust that instead — see DevtoFetcher.
 */
export function detectLanguage(
  url: string | undefined,
  title?: string | undefined,
  snippet?: string | undefined,
): ResourceLanguage {
  const urlLang = detectLanguageFromUrl(url);

  if (urlLang === 'fr') return 'fr';
  if (urlLang === 'unknown') return 'unknown';

  // URL defaults to 'en' — cross-check with text for multilingual platforms
  const textLang = detectLanguageFromText(title, snippet);
  if (textLang !== null) return textLang;

  return 'en';
}
