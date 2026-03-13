import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { Resource } from '@features/resources/domain/models/resource.model';

@Component({
  selector: 'app-resource-card',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './resource-card.html',
  styleUrl: './resource-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceCard {
  readonly resource = input.required<Resource>();

  readonly scoreColorModifier = computed<'high' | 'medium' | 'low'>(() => {
    const score = this.resource().score;
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  });
}
