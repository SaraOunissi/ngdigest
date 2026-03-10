import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-angular-banner',
  imports: [TranslatePipe],
  templateUrl: './angular-banner.html',
  styleUrl: './angular-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularBanner {
  readonly version = input.required<string>();
  readonly changelogUrl = input<string>('');
}
