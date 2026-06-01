import { JobRemote, JobType, JobZone } from './job.model';

/**
 * Value object holding the current filter state for the jobs list.
 * Persisted in localStorage under key `ngdigest:jobs:filters:v1`.
 */
export interface JobFilter {
  readonly type: JobType | 'all';
  readonly remote: JobRemote | 'all';
  readonly zone: JobZone | 'all';
  readonly sort: 'recent' | 'salaryDesc';
}

export const DEFAULT_JOB_FILTER: JobFilter = {
  type: 'all',
  remote: 'all',
  zone: 'all',
  sort: 'recent',
};
