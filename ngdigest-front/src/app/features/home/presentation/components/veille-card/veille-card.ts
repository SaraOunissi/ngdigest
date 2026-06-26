import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { IconComponent } from '@shared/components/icon/icon';
import { Resource } from '@features/resources/domain/models/resource.model';

/** Compact card for the Home "Veille" band — featured pick or secondary item. */
@Component({
  selector: 'app-veille-card',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './veille-card.html',
  styleUrl: './veille-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VeilleCardComponent {
  private readonly languageService = inject(LanguageService);

  readonly resource = input.required<Resource>();
  readonly featured = input(false);

  protected readonly publishedLabel = computed<string>(() => {
    const publishedAt = this.resource().publishedAt;
    if (!publishedAt) {
      return '';
    }
    const locale = this.languageService.lang() === 'fr' ? 'fr-FR' : 'en-GB';
    return new Date(publishedAt).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  });
}
