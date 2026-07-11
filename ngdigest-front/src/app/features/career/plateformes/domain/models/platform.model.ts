import { LocalizedText } from '@shared/models/localized-text';

/**
 * The /carriere/plateformes directory lists the *channels* to find dev work
 * (freelance marketplaces, permanent job boards, consultancies) plus umbrella
 * employment ("portage salarial") as a status tool — not the job listings
 * themselves (those live on /jobs, driven by the observatory workers).
 *
 * Two editorial families:
 * - "work"   → find gigs or a role  (freelance · cdi · esn)
 * - "status" → pick your status     (portage)
 *
 * Pure domain model — no Angular imports.
 */
export type PlatformCategory = 'freelance' | 'cdi' | 'esn' | 'portage';

/** Region a channel primarily serves. Drives the FR / Intl toggle. */
export type PlatformGeo = 'fr' | 'intl';

/** How the user pays (or doesn't) to use the channel. */
export type PlatformModel =
  | 'commission' // freelance marketplace (a % is taken on the mission)
  | 'gratuit' // job board / free for the candidate
  | 'forfait' // flat monthly fee (e.g. Jump umbrella)
  | 'frais-gestion' // classic umbrella (% of revenue)
  | 'na'; // not applicable (e.g. a consultancy)

/** Remote policy — meaningful mostly for cdi/esn, honest about hybrid. */
export type PlatformRemote = 'oui' | 'hybride' | 'non' | 'na';

/** Kind of affiliate relationship, when the channel is `affiliable`. */
export type PlatformAffiliateType = 'parrainage' | 'affiliation' | 'apport-affaires';

export interface Platform {
  readonly id: string;
  readonly name: string;
  readonly category: PlatformCategory;
  readonly geo: PlatformGeo;
  readonly model: PlatformModel;
  /** Approx. commission or management fee in % (null for forfait/gratuit/na). */
  readonly feePct: number | null;
  /** Flat monthly fee in € when `model === 'forfait'` (e.g. Jump). */
  readonly flatFeeEur: number | null;
  readonly remoteFriendly: PlatformRemote;
  /** Public URL (untracked). */
  readonly url: string;
  readonly affiliable: boolean;
  readonly affiliateType: PlatformAffiliateType | null;
  /** Pre-tracked affiliate/referral link — takes precedence over `url` when set. */
  readonly affiliateUrl: string | null;
  /** One-line "what it is / why it's worth it". */
  readonly blurb: LocalizedText;
  readonly featured: boolean;
  /** True for the human-sized, craft-reputed "pépite" consultancies. */
  readonly pepite: boolean;
  /** Free-text tags, used by search. */
  readonly tags: readonly string[];
}
