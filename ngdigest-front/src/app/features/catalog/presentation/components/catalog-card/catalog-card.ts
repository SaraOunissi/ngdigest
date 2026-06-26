import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { AffiliateService } from '@core/services/affiliate.service';
import { LangBadgeComponent } from '@shared/components/lang-badge/lang-badge';
import { IconComponent } from '@shared/components/icon/icon';
import { CatalogResource } from '../../../domain/models/catalog-resource.model';

/** A single catalog entry card (creator / blog / channel / newsletter). */
@Component({
  selector: 'app-catalog-card',
  imports: [TranslatePipe, LangBadgeComponent, IconComponent],
  templateUrl: './catalog-card.html',
  styleUrl: './catalog-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogCardComponent {
  private readonly languageService = inject(LanguageService);
  private readonly affiliate = inject(AffiliateService);

  readonly resource = input.required<CatalogResource>();

  protected readonly shortDesc = computed(() => this.resource().shortDesc[this.languageService.lang()]);
  protected readonly value = computed(() => this.resource().value[this.languageService.lang()]);

  protected readonly href = computed(() =>
    this.affiliate.buildUrl(this.resource().url, this.resource().affiliateNetwork),
  );
  protected readonly rel = computed(() => this.affiliate.rel(this.resource().affiliable));

  protected readonly initials = computed(() => {
    const cleaned = this.resource()
      .name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '')
      .trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  });
}
