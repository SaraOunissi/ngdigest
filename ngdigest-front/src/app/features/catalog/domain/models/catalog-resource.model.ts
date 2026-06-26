import { LocalizedText } from '@shared/models/localized-text';

/**
 * The /ressources catalog lists creators · blogs · channels · newsletters only.
 * Courses & training platforms live under /carriere/formations, not here.
 * Pure domain model — no Angular imports.
 */
export type CatalogTier = 'officiel' | 'gros' | 'solo';
export type CatalogResourceType = 'doc' | 'blog' | 'youtube' | 'newsletter';
export type CatalogLevel = 'debutant' | 'intermediaire' | 'avance' | 'tous';
export type CatalogPrice = 'gratuit' | 'freemium' | 'prix-libre' | 'payant';
export type CatalogCpf = 'oui' | 'non' | 'na' | 'a-verifier';
export type CatalogOrigin = 'FR' | 'EN' | 'INTL';

export interface CatalogResource {
  readonly id: string;
  readonly name: string;
  readonly author: string;
  readonly lang: 'fr' | 'en';
  readonly origin: CatalogOrigin;
  readonly type: CatalogResourceType;
  readonly level: CatalogLevel;
  readonly tier: CatalogTier;
  /** One-line description of what it is. */
  readonly shortDesc: LocalizedText;
  /** The "why it's worth your time" angle. */
  readonly value: LocalizedText;
  readonly url: string;
  readonly price: CatalogPrice;
  readonly cpf: CatalogCpf;
  readonly affiliable: boolean;
  readonly affiliateNetwork: string | null;
}
