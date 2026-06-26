import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { IconComponent, IconName } from '@shared/components/icon/icon';
import { ChipStatus, StatusChipComponent } from '@shared/components/status-chip/status-chip';

export interface CareerStep {
  readonly id: string;
  readonly icon: IconName;
  readonly status: ChipStatus;
  readonly nodeLabel: string;
  readonly titleKey: string;
  readonly journeyKey: string;
  readonly descKey: string;
  readonly route: string[] | null;
  readonly clickable: boolean;
}

/** One node of the Career hub guided timeline. */
@Component({
  selector: 'app-career-step',
  imports: [NgTemplateOutlet, RouterLink, TranslatePipe, IconComponent, StatusChipComponent],
  templateUrl: './career-step.html',
  styleUrl: './career-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerStepComponent {
  readonly step = input.required<CareerStep>();
}
