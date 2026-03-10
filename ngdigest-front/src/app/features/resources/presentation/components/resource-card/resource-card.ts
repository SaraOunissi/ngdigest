import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Resource } from '@features/resources/domain/models/resource.model';

@Component({
  selector: 'app-resource-card',
  imports: [DatePipe],
  templateUrl: './resource-card.html',
  styleUrl: './resource-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceCard {
  readonly resource = input.required<Resource>();
}
