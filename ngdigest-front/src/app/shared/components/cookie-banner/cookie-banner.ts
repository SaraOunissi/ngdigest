import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { AnalyticsService } from '@core/services/analytics.service';

@Component({
  selector: 'app-cookie-banner',
  imports: [TranslatePipe],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieBannerComponent {
  private readonly analyticsService = inject(AnalyticsService);

  onAccept(): void {
    this.analyticsService.accept();
  }

  onRefuse(): void {
    this.analyticsService.refuse();
  }
}
