import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

type LangFilter = 'all' | 'fr' | 'en';

interface FilterOption {
  readonly value: LangFilter;
  readonly labelKey: string;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar {
  protected readonly activeFilter = signal<LangFilter>('all');
  readonly langChange = output<LangFilter>();

  protected readonly filters: FilterOption[] = [
    { value: 'all', labelKey: 'filter.all' },
    { value: 'fr', labelKey: 'filter.fr' },
    { value: 'en', labelKey: 'filter.en' },
  ];

  protected selectFilter(value: LangFilter): void {
    this.activeFilter.set(value);
    this.langChange.emit(value);
  }
}
