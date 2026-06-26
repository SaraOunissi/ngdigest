import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type Roi = 'top' | 'good' | 'opt' | 'skip';

/** Return-on-investment badge used on certification cards. */
@Component({
  selector: 'app-roi-badge',
  imports: [TranslatePipe],
  templateUrl: './roi-badge.html',
  styleUrl: './roi-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoiBadgeComponent {
  readonly roi = input.required<Roi>();

  protected readonly labelKey = computed(() => `certifications.roi.${this.roi()}`);
}
