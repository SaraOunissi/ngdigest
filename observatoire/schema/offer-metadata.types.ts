// Offer metadata types for the ngdigest observatoire data layer.
// Source of truth: ngdigest/WORKERS_PEPITES_OBSERVATOIRE_CADRAGE.md §4/§8/§9.
// These TS types are the integration contract when the prototype is ported into
// a NestJS `observatoire` module. Keep in sync with offer-metadata.schema.json.
// by project-worker 2026-06-14

export type Techno = 'angular' | 'react' | 'vue' | 'autre';
export type PosteType = 'front' | 'fullstack' | 'back' | 'inconnu';
export type Seniority = 'junior' | 'confirme' | 'senior' | 'lead' | 'inconnu';
export type Remote = 'full' | 'hybride' | 'onsite' | 'inconnu';
export type Zone = 'FR' | 'EU' | 'WW' | 'inconnu';
export type ContractType = 'cdi' | 'freelance' | 'autre' | 'inconnu';
export type TypeRecruteur = 'esn' | 'cabinet-recrutement' | 'client-final' | 'inconnu';
export type OfferSource =
  | 'france-travail'
  | 'free-work'
  | 'apec'
  | 'wttj'
  | 'linkedin'
  | 'autre';

/**
 * One normalized offer. The SAME shape feeds the LARGE layer (everything, for
 * stats) and — once filtered by the existing selective pass — the SELECTIVE
 * layer (published pépites). `salary`/`tjm` numeric fields drive the stats;
 * display strings stay on the published-offer model.
 */
export interface ObserveOffer {
  /** id source if available, else sha1(company|title|city). Dedup key. */
  fingerprint: string;
  sourceId: string | null;
  source: OfferSource;
  /** AAAA-MM-DD run date */
  scannedAt: string;
  firstSeen: string;
  lastSeen: string;
  title: string | null;
  company: string | null;
  techno: Techno;
  posteType: PosteType;
  seniority: Seniority;
  remote: Remote;
  /** office days/week for hybrid offers (e.g. 2.6); null otherwise */
  officeDaysPerWeek: number | null;
  zone: Zone;
  city: string | null;
  contractType: ContractType;
  salaryMin: number | null;
  salaryMax: number | null;
  tjmMin: number | null;
  tjmMax: number | null;
  typeRecruteur: TypeRecruteur;
  isDevRel: boolean;
  raw: string | null;
}

/** Weekly aggregated snapshot (one photo of the market). */
export interface ObservatoireSnapshot {
  /** ISO week label, e.g. 2026-W24 */
  week: string;
  generatedAt: string;
  methodology: {
    sources: OfferSource[];
    queries: string[];
    offersFound: number;
    period: string;
  };
  /** stock = all live offers (lastSeen within window); flux = new this week */
  counts: { stock: number; flux: number };
  distributions: {
    techno: Record<Techno, number>;
    posteType: Record<PosteType, number>;
    seniority: Record<Seniority, number>;
    remote: Record<Remote, number>;
    contractType: Record<ContractType, number>;
    typeRecruteur: Record<TypeRecruteur, number>;
    cityTop: Array<{ city: string; count: number }>;
  };
  salary: {
    /** median CDI annual salary by seniority (k€) */
    cdiMedianBySeniority: Partial<Record<Seniority, number>>;
    /** median TJM by seniority (€/day) */
    tjmMedianBySeniority: Partial<Record<Seniority, number>>;
  };
  hybrid: {
    avgOfficeDaysPerWeek: number | null;
  };
  devRelCount: number;
}
