import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { Resource } from '../../../domain/models/resource.model';

export interface HeroStats {
  readonly resources: number;
  readonly sources: number;
  readonly frequencyHours: number;
}

@Component({
  selector: 'app-hero-section',
  imports: [TranslatePipe, DatePipe],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  readonly searchValue = model<string>('');
  readonly stats = input<HeroStats | null>(null);
  readonly weeklyPick = input<Resource | null>(null);

  protected scoreModifier(score: number): 'high' | 'medium' | 'low' {
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }
}
