import { Injectable } from '@angular/core';

import { Job } from '../domain/models/job.model';
import { IJobRepository } from '../domain/ports/job.repository';
import { JOBS_DATA } from './jobs-data.generated';

/**
 * Local repository — reads the build-time generated JSON of jobs.
 * No HTTP calls, no Mongo. Pure SSG.
 */
@Injectable({ providedIn: 'root' })
export class JobsLocalRepository implements IJobRepository {
  getAll(): readonly Job[] {
    return JOBS_DATA;
  }

  getBySlug(slug: string): Job | undefined {
    return JOBS_DATA.find((job) => job.slug === slug);
  }
}
