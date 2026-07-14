import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { IconComponent } from '@shared/components/icon/icon';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip';
import { lightMarkdown } from '@features/career/interview/application/light-markdown';
import { GUIDE_DECISION_TREE } from '../../../infrastructure/decision-tree.data';
import { FOREIGN_MARKET_CALLOUT, REALITY_CHECKS } from '../../../infrastructure/reality-checks.data';
import { DecisionTreeComponent } from '../../components/decision-tree/decision-tree';
import { RealityCheckItemComponent } from '../../components/reality-check-item/reality-check-item';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Guide carrière Angular — CDI, freelance, ESN, statut — NgDigest',
  en: 'Angular career guide — permanent, freelance, consultancy, status — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Oriente-toi en 3 questions (CDI ou freelance, ESN ou client final, statut) et lis les vérités du marché dev FR que personne ne te dit. Honnête, vécu, bilingue.',
  en: 'Orient yourself in 3 questions (permanent or freelance, consultancy or end client, status) and read the honest truths about the French dev market nobody tells you. Lived, bilingual.',
};

@Component({
  selector: 'app-guide',
  imports: [
    RouterLink,
    TranslatePipe,
    IconComponent,
    StatusChipComponent,
    DecisionTreeComponent,
    RealityCheckItemComponent,
  ],
  templateUrl: './guide.html',
  styleUrl: './guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly tree = GUIDE_DECISION_TREE;
  protected readonly realityChecks = REALITY_CHECKS;
  protected readonly callout = FOREIGN_MARKET_CALLOUT;

  protected readonly questionSteps = 3;
  protected readonly truthsCount = REALITY_CHECKS.length + 1;

  protected readonly open = signal<ReadonlySet<string>>(new Set<string>());

  protected readonly careerRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career'];
  });

  protected readonly observatoireRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career', lang === 'fr' ? 'observatoire' : 'observatory'];
  });

  // Callout copy is authored in our data file and escaped before markdown is
  // applied, so trusting the resulting HTML is safe.
  protected readonly calloutParagraphs = computed<SafeHtml[]>(() =>
    this.callout.body[this.languageService.lang()].map((paragraph) =>
      this.sanitizer.bypassSecurityTrustHtml(lightMarkdown(paragraph)),
    ),
  );

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
    });
  }

  protected isOpen(id: string): boolean {
    return this.open().has(id);
  }

  protected toggle(id: string): void {
    const next = new Set(this.open());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.open.set(next);
  }
}
