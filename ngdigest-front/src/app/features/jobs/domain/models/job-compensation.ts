import { Job } from './job.model';

export type JobCompensationKind = 'salary' | 'tjm';

export interface JobCompensation {
  readonly kind: JobCompensationKind;
  readonly label: string;
}

/**
 * Picks the compensation to display for an offer.
 *
 * A daily rate wins when one is published. Otherwise the yearly amount is shown,
 * including for freelance or contractor offers that only publish an annual range
 * (e.g. SerpApi's independent-contractor roles).
 */
export function resolveJobCompensation(job: Job, lang: string): JobCompensation {
  const dailyRate = job.tjm?.trim() ?? '';
  if (dailyRate !== '') {
    return { kind: 'tjm', label: dailyRate };
  }
  const salary = lang === 'en' && job.salaryEn ? job.salaryEn : (job.salary ?? '');
  return { kind: 'salary', label: salary };
}
