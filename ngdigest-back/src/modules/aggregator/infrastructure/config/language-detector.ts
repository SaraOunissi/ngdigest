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
