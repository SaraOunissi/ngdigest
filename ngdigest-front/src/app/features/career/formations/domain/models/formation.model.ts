import { LocalizedText } from '@shared/models/localized-text';

/**
 * The /carriere/formations directory lists Angular courses & training programs
 * (FR + EN, free + paid), curated editorially, with outbound links — some of
 * which are affiliate links.
 * Distinct from the /ressources catalog (creators · blogs · channels) and from
 * the /carriere/certifications page (exams).
 * Pure domain model — no Angular imports.
 */
export type FormationLang = 'fr' | 'en';
export type FormationPricing = 'free' | 'paid';
export type FormationLevel = 'debutant' | 'intermediaire' | 'senior';
export type FormationFormat = 'video' | 'live' | 'bootcamp' | 'article';

/**
 * Editorial angle a featured formation illustrates in the "Sélection" section:
 * getting started, reaching senior level (Signals), testing, or learning in FR.
 */
export type FormationPick = 'debutant' | 'signals' | 'testing' | 'fr';

export interface Formation {
  readonly id: string;
  readonly title: string;
  /** Author or training provider. */
  readonly author: string;
  readonly lang: FormationLang;
  readonly pricing: FormationPricing;
  /**
   * Indicative displayed price (free string because promos/subscriptions vary),
   * e.g. "~15 € (promo)". `null` when the plain "Gratuit" label is enough.
   */
  readonly priceLabel: LocalizedText | null;
  /** When false, the card shows a discreet "à confirmer" flag next to the price. */
  readonly priceVerified: boolean;
  readonly level: FormationLevel;
  readonly format: FormationFormat;
  /** Public URL (untracked). */
  readonly url: string;
  readonly affiliable: boolean;
  /** Affiliate network identifier, e.g. 'Impact' | 'Direct' | 'certificates-dev'. */
  readonly affiliateNetwork: string | null;
  /** Pre-tracked affiliate link — takes precedence over `url` when set. */
  readonly affiliateUrl: string | null;
  /** Free-text tags, used by search and the "Testing" chip filter. */
  readonly tags: readonly string[];
  /** One-line "what it is / why it's worth it". */
  readonly blurb: LocalizedText;
  readonly featured: boolean;
  /** Category shown on the card and in the "Sélection" section when featured. */
  readonly featuredPick: FormationPick | null;
}
