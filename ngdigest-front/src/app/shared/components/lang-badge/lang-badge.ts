import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ResourceOrigin = 'FR' | 'EN' | 'INTL';

/**
 * Language/origin badge for catalog cards.
 * FR content → "FR", international → "INTL", everything else → "EN".
 */
@Component({
  selector: 'app-lang-badge',
  templateUrl: './lang-badge.html',
  styleUrl: './lang-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangBadgeComponent {
  readonly lang = input.required<'fr' | 'en'>();
  readonly origin = input<ResourceOrigin>('EN');

  protected readonly label = computed<ResourceOrigin>(() =>
    this.lang() === 'fr' ? 'FR' : this.origin() === 'INTL' ? 'INTL' : 'EN',
  );

  protected readonly modifier = computed(() => this.label().toLowerCase());
}
