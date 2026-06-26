import { LocalizedText } from '@shared/models/localized-text';
import { Roi } from '@shared/components/roi-badge/roi-badge';

/**
 * Certifications relevant to an Angular frontend (or front/fullstack) profile.
 * Pure domain model — no Angular imports. Editorial fields are bilingual;
 * proper-noun fields (org, lang code) and numeric costs stay plain strings.
 */
export type CertCategoryId = 'angular' | 'a11y' | 'scrum' | 'autres';
export type CertCpf = 'oui' | 'non' | 'verifier';
export type CertAff = 'oui' | 'non' | 'indirecte';

export type { Roi };

export interface CertPrepOption {
  readonly title: LocalizedText;
  readonly desc: LocalizedText;
}

export interface CertCategory {
  readonly id: CertCategoryId;
  readonly featured?: boolean;
  readonly title: LocalizedText;
  readonly tag: LocalizedText;
  readonly intro: LocalizedText;
  /** Only the featured Angular section carries a provider line + prep block. */
  readonly provider?: LocalizedText;
  readonly prep?: readonly CertPrepOption[];
  readonly prepNote?: LocalizedText;
}

export interface Certification {
  readonly id: string;
  readonly cat: CertCategoryId;
  readonly roi: Roi;
  /** Level label for the 3-tier Angular program ("Niveau 1"…). */
  readonly level?: LocalizedText;
  readonly name: LocalizedText;
  readonly full: LocalizedText;
  readonly org: string;
  /** Display language code of the exam: "EN" | "FR" | "—". */
  readonly lang: string;
  readonly cost: LocalizedText;
  readonly costNote: LocalizedText;
  readonly validity: LocalizedText;
  readonly cpf: CertCpf;
  readonly aff: CertAff;
  readonly who: LocalizedText;
  readonly verdict: LocalizedText;
  readonly detail: LocalizedText;
}

export interface CertVerdictEntry {
  readonly rank: string;
  readonly certId: string;
  readonly line: LocalizedText;
}
