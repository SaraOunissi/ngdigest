import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { DEFAULT_JOB_FILTER, JobFilter } from '../../../domain/models/job-filter.model';
import { JobsStore } from '../../../application/jobs.store';

type ChipKey = 'all' | 'cdi' | 'freelance' | 'remote100';

interface Chip {
  readonly key: ChipKey;
  readonly labelKey: string;
}

const CHIPS: readonly Chip[] = [
  { key: 'all', labelKey: 'jobs.filters.all' },
  { key: 'cdi', labelKey: 'jobs.filters.cdi' },
  { key: 'freelance', labelKey: 'jobs.filters.freelance' },
  { key: 'remote100', labelKey: 'jobs.filters.remote100' },
];

@Component({
  selector: 'app-job-filters',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './job-filters.component.html',
  styleUrl: './job-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobFiltersComponent {
  protected readonly store = inject(JobsStore);
  protected readonly chips = CHIPS;

  protected readonly activeKey = computed<ChipKey>(() => this.chipForFilter(this.store.filter()));

  protected select(key: ChipKey): void {
    this.store.setFilter(this.filterForChip(key));
  }

  private filterForChip(key: ChipKey): JobFilter {
    switch (key) {
      case 'cdi':
        return { ...DEFAULT_JOB_FILTER, type: 'CDI' };
      case 'freelance':
        return { ...DEFAULT_JOB_FILTER, type: 'Freelance' };
      case 'remote100':
        return { ...DEFAULT_JOB_FILTER, remote: '100' };
      case 'all':
      default:
        return DEFAULT_JOB_FILTER;
    }
  }

  private chipForFilter(filter: JobFilter): ChipKey {
    if (filter.type === 'CDI') return 'cdi';
    if (filter.type === 'Freelance') return 'freelance';
    if (filter.remote === '100') return 'remote100';
    return 'all';
  }
}
