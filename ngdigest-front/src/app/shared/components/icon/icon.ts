import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'certif'
  | 'certifications'
  | 'entretien'
  | 'jobs'
  | 'formations'
  | 'ressources'
  | 'observatoire'
  | 'plateformes'
  | 'toolkit'
  | 'arrow-right'
  | 'arrow-up-right';

/**
 * Inline SVG icon set shared by the Home tiles and the Career timeline.
 * Stroke icons inherit `currentColor`; size is driven by the `size` input.
 */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(24);
}
