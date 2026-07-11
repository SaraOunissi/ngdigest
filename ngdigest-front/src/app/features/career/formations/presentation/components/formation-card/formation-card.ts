import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { AffiliateService } from '@core/services/affiliate.service';
import { LangBadgeComponent } from '@shared/components/lang-badge/lang-badge';
import { IconComponent } from '@shared/components/icon/icon';
import { Formation } from '../../../domain/models/formation.model';

/** A single training entry card (course, workshop, channel, bootcamp…). */
@Component({
  selector: 'app-formation-card',
  imports: [TranslatePipe, LangBadgeComponent, IconComponent],
  templateUrl: './formation-card.html',
  styleUrl: './formation-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormationCardComponent {
  private readonly languageService = inject(LanguageService);
  private readonly affiliate = inject(AffiliateService);

  readonly formation = input.required<Formation>();

  protected readonly blurb = computed(() => this.formation().blurb[this.languageService.lang()]);

  protected readonly priceLabel = computed(() => {
    const label = this.formation().priceLabel;
    return label ? label[this.languageService.lang()] : null;
  });

  /**
   * Destination link. A pre-tracked `affiliateUrl` wins; otherwise, for a known
   * network the referral param is appended (e.g. certificates-dev); otherwise
   * the plain public URL. Non-affiliate entries always use the public URL.
   */
  protected readonly href = computed(() => {
    const formation = this.formation();
    if (!formation.affiliable) {
      return formation.url;
    }
    return (
      formation.affiliateUrl ?? this.affiliate.buildUrl(formation.url, formation.affiliateNetwork)
    );
  });

  protected readonly rel = computed(() => this.affiliate.rel(this.formation().affiliable));

  protected readonly pickKey = computed(() => {
    const pick = this.formation().featuredPick;
    return pick ? `formations.pick.${pick}` : null;
  });

  protected readonly initials = computed(() => {
    const cleaned = this.formation()
      .title.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '')
      .trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  });
}
