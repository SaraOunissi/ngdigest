import { Job } from '../models/job.model';

/**
 * Port (interface) for the jobs repository. Implemented in infrastructure/.
 * Keeps the domain framework-agnostic.
 */
export interface IJobRepository {
  /** Returns all jobs (active + expired), unfiltered. */
  getAll(): readonly Job[];

  /** Returns a single job by slug, or undefined if not found. */
  getBySlug(slug: string): Job | undefined;
}

/** Injection token alias — exported as a value for Angular DI. */
export const JOB_REPOSITORY = 'JOB_REPOSITORY';
