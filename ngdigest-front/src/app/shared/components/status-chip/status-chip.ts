import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type ChipStatus = 'new' | 'soon' | 'online';

/** Small mono-uppercase status pill — "Nouveau", "Bientôt", "En ligne". */
@Component({
  selector: 'app-status-chip',
  imports: [TranslatePipe],
  templateUrl: './status-chip.html',
  styleUrl: './status-chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  readonly status = input.required<ChipStatus>();

  protected readonly labelKey = computed(() => `status.${this.status()}`);
}
