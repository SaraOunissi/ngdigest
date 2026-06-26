import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { RoiBadgeComponent } from '@shared/components/roi-badge/roi-badge';
import { Certification } from '../../../domain/models/certification.model';

/** A single certification card with ROI, verdict and key specs. */
@Component({
  selector: 'app-cert-card',
  imports: [TranslatePipe, RoiBadgeComponent],
  templateUrl: './cert-card.html',
  styleUrl: './cert-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertCardComponent {
  private readonly languageService = inject(LanguageService);

  readonly cert = input.required<Certification>();

  private readonly lang = this.languageService.lang;

  protected readonly name = computed(() => this.cert().name[this.lang()]);
  protected readonly full = computed(() => this.cert().full[this.lang()]);
  protected readonly who = computed(() => this.cert().who[this.lang()]);
  protected readonly verdict = computed(() => this.cert().verdict[this.lang()]);
  protected readonly detail = computed(() => this.cert().detail[this.lang()]);
  protected readonly cost = computed(() => this.cert().cost[this.lang()]);
  protected readonly costNote = computed(() => this.cert().costNote[this.lang()]);
  protected readonly validity = computed(() => this.cert().validity[this.lang()]);
  protected readonly level = computed(() => {
    const level = this.cert().level;
    return level ? level[this.lang()] : null;
  });

  protected readonly affLabelKey = computed(() =>
    this.cert().aff === 'non' ? null : `certifications.aff.${this.cert().aff}`,
  );

  protected readonly cpfLabelKey = computed(() => `certifications.cpf.${this.cert().cpf}`);

  protected readonly cpfDotModifier = computed(() => {
    switch (this.cert().cpf) {
      case 'oui':
        return 'y';
      case 'verifier':
        return 'v';
      default:
        return 'n';
    }
  });
}
