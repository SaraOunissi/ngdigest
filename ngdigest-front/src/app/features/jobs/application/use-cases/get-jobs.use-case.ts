import { Injectable, inject } from '@angular/core';

import { Job } from '../../domain/models/job.model';
import { JobsLocalRepository } from '../../infrastructure/jobs-local.repository';

/**
 * Returns all active jobs (excludes expired by default).
 * Use `getArchive()` to read expired ones for /jobs/archive.
 */
@Injectable({ providedIn: 'root' })
export class GetJobsUseCase {
  private readonly repository = inject(JobsLocalRepository);

  execute(): readonly Job[] {
    return this.repository.getAll().filter((job) => job.status === 'active');
  }

  executeArchive(): readonly Job[] {
    return this.repository.getAll().filter((job) => job.status === 'expired');
  }

  executeBySlug(slug: string): Job | undefined {
    return this.repository.getBySlug(slug);
  }

  /** Returns jobs with at least one tag in common — for the "similar" sidebar. */
  executeSimilar(slug: string, max = 3): readonly Job[] {
    const reference = this.repository.getBySlug(slug);
    if (!reference) return [];

    const referenceTags = new Set(reference.tags);
    return this.repository
      .getAll()
      .filter((job) => job.slug !== slug && job.status === 'active')
      .filter((job) => job.tags.some((tag) => referenceTags.has(tag)))
      .slice(0, max);
  }
}
