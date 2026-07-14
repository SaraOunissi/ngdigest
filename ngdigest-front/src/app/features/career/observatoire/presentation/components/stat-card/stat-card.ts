import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { IconComponent } from '@shared/components/icon/icon';
import { Kpi } from '../../../domain/models/observatoire.model';

/**
 * One giant KPI: number (brand gradient) + label + Sara's read + dated source.
 * Presentational only — reused across snapshots so the live v2 can feed it
 * without template changes.
 */
@Component({
  selector: 'app-stat-card',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  private readonly languageService = inject(LanguageService);

  readonly kpi = input.required<Kpi>();

  protected readonly value = computed(() => this.kpi().value[this.languageService.lang()]);
  protected readonly label = computed(() => this.kpi().label[this.languageService.lang()]);
  protected readonly angle = computed(() => this.kpi().angle[this.languageService.lang()]);
}
