import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { AffiliateService } from '@core/services/affiliate.service';
import { LanguageService } from '@core/services/language.service';
import { IconComponent } from '@shared/components/icon/icon';
import { Platform } from '../../../domain/models/platform.model';

/** i18n key + interpolation params for the fee/model chip. */
interface FeeLabel {
  readonly key: string;
  readonly params?: { readonly pct?: number; readonly eur?: number };
}

/** A single channel card (freelance platform, job board, consultancy, umbrella). */
@Component({
  selector: 'app-platform-card',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './platform-card.html',
  styleUrl: './platform-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformCardComponent {
  private readonly languageService = inject(LanguageService);
  private readonly affiliate = inject(AffiliateService);

  readonly platform = input.required<Platform>();

  protected readonly blurb = computed(() => this.platform().blurb[this.languageService.lang()]);

  /**
   * Destination link. A pre-tracked `affiliateUrl` wins; otherwise the plain
   * public URL. Non-affiliate entries always use the public URL.
   */
  protected readonly href = computed(() => {
    const platform = this.platform();
    if (!platform.affiliable) {
      return platform.url;
    }
    return platform.affiliateUrl ?? platform.url;
  });

  protected readonly rel = computed(() => this.affiliate.rel(this.platform().affiliable));

  /** Fee/model chip — null when the model carries no relevant figure (na). */
  protected readonly feeLabel = computed<FeeLabel | null>(() => {
    const platform = this.platform();
    switch (platform.model) {
      case 'gratuit':
        return { key: 'platforms.fee.free' };
      case 'commission':
        return platform.feePct === 0
          ? { key: 'platforms.fee.commissionZero' }
          : { key: 'platforms.fee.commission', params: { pct: platform.feePct ?? 0 } };
      case 'forfait':
        return { key: 'platforms.fee.flat', params: { eur: platform.flatFeeEur ?? 0 } };
      case 'frais-gestion':
        return { key: 'platforms.fee.mgmt', params: { pct: platform.feePct ?? 0 } };
      case 'na':
        return null;
    }
  });

  /** Remote badge shown only when the policy is meaningful (not `na`). */
  protected readonly remoteKey = computed<string | null>(() => {
    const remote = this.platform().remoteFriendly;
    return remote === 'na' ? null : `platforms.remote.${remote}`;
  });

  protected readonly affiliateKey = computed<string | null>(() => {
    const platform = this.platform();
    return platform.affiliable && platform.affiliateType
      ? `platforms.affiliate.${platform.affiliateType}`
      : null;
  });

  protected readonly initials = computed(() => {
    const cleaned = this.platform()
      .name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '')
      .trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  });
}
