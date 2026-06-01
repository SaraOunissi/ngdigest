import { Injectable, computed, inject, signal } from '@angular/core';

import { DEFAULT_JOB_FILTER, JobFilter } from '../domain/models/job-filter.model';
import { Job } from '../domain/models/job.model';
import { FilterJobsUseCase } from './use-cases/filter-jobs.use-case';
import { GetJobsUseCase } from './use-cases/get-jobs.use-case';

const FILTER_STORAGE_KEY = 'ngdigest:jobs:filters:v1';

/**
 * Signal-based store for the /jobs feature.
 * - Reads active jobs from the local repository (build-time data).
 * - Holds the current filter state (typed Signal).
 * - Persists filters in localStorage when the browser is available.
 *
 * SSR-safe: localStorage access is guarded.
 */
@Injectable({ providedIn: 'root' })
export class JobsStore {
  private readonly getJobs = inject(GetJobsUseCase);
  private readonly filterJobs = inject(FilterJobsUseCase);

  private readonly _filter = signal<JobFilter>(this.loadInitialFilter());
  readonly filter = this._filter.asReadonly();

  /** All active jobs (unfiltered). */
  readonly activeJobs = computed<readonly Job[]>(() => this.getJobs.execute());

  /** Active jobs after applying the current filter. */
  readonly filteredJobs = computed<readonly Job[]>(() =>
    this.filterJobs.execute(this.activeJobs(), this._filter()),
  );

  /** Expired jobs — used for /jobs/archive. */
  readonly archivedJobs = computed<readonly Job[]>(() => this.getJobs.executeArchive());

  setFilter(filter: JobFilter): void {
    this._filter.set(filter);
    this.persistFilter(filter);
  }

  resetFilter(): void {
    this.setFilter(DEFAULT_JOB_FILTER);
  }

  private loadInitialFilter(): JobFilter {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_JOB_FILTER;
    }
    try {
      const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
      if (!raw) return DEFAULT_JOB_FILTER;
      const parsed = JSON.parse(raw) as Partial<JobFilter>;
      return { ...DEFAULT_JOB_FILTER, ...parsed };
    } catch {
      return DEFAULT_JOB_FILTER;
    }
  }

  private persistFilter(filter: JobFilter): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filter));
    } catch {
      // localStorage may throw in private mode — fail silently.
    }
  }
}
