import { Injectable } from '@angular/core';

import { JobFilter } from '../../domain/models/job-filter.model';
import { Job } from '../../domain/models/job.model';

/**
 * Applies a JobFilter to a list of jobs. Pure function-style use case.
 */
@Injectable({ providedIn: 'root' })
export class FilterJobsUseCase {
  execute(jobs: readonly Job[], filter: JobFilter): readonly Job[] {
    let result = jobs;

    if (filter.type !== 'all') {
      result = result.filter((job) => job.type === filter.type);
    }

    if (filter.remote !== 'all') {
      result = result.filter((job) => job.remote === filter.remote);
    }

    if (filter.zone !== 'all') {
      result = result.filter((job) => job.zone === filter.zone);
    }

    const sorted = [...result];
    if (filter.sort === 'salaryDesc') {
      sorted.sort((a, b) => this.extractMaxAmount(b) - this.extractMaxAmount(a));
    } else {
      sorted.sort(
        (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime(),
      );
    }

    return sorted;
  }

  /** Best-effort numeric parsing of "65k-90k€" or "550-650€/j" — keeps the upper bound. */
  private extractMaxAmount(job: Job): number {
    const raw = job.salary ?? job.tjm ?? '';
    const matches = raw.match(/\d+/g);
    if (!matches || matches.length === 0) return 0;
    const numbers = matches.map((m) => Number.parseInt(m, 10));
    return Math.max(...numbers);
  }
}
