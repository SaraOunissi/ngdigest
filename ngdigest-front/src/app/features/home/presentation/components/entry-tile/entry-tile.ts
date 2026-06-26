import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { IconComponent, IconName } from '@shared/components/icon/icon';
import { ChipStatus, StatusChipComponent } from '@shared/components/status-chip/status-chip';

export interface HomeEntry {
  readonly id: string;
  readonly icon: IconName;
  readonly titleKey: string;
  readonly descKey: string;
  readonly status: ChipStatus | null;
  /** Localised router link, or null when the entry is not yet available. */
  readonly route: string[] | null;
}

/** A single entry tile on the Home "how I can help" grid. */
@Component({
  selector: 'app-entry-tile',
  imports: [NgTemplateOutlet, RouterLink, TranslatePipe, IconComponent, StatusChipComponent],
  templateUrl: './entry-tile.html',
  styleUrl: './entry-tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryTileComponent {
  readonly entry = input.required<HomeEntry>();

  protected readonly clickable = computed(
    () => this.entry().status !== 'soon' && this.entry().route !== null,
  );
}
