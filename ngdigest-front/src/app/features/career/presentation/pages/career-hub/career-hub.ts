import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { IconName } from '@shared/components/icon/icon';
import { ChipStatus } from '@shared/components/status-chip/status-chip';
import { CERTIFICATIONS } from '@features/career/certifications/infrastructure/certifications.data';
import { INTERVIEW_QUESTIONS } from '@features/career/interview/infrastructure/interview-questions.data';
import { CareerStep, CareerStepComponent } from '../../components/career-step/career-step';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Carrière Angular — le parcours, étape par étape — NgDigest',
  en: 'Angular career — the path, step by step — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'De la montée en compétence au poste signé : un chemin clair pour avancer dans ta carrière Angular — formations, certifications, entretien, missions.',
  en: 'From upskilling to a signed offer: a clear path to grow your Angular career — training, certifications, interview prep, gigs.',
};

interface StepDefinition {
  readonly id: string;
  readonly icon: IconName;
  readonly status: ChipStatus;
  readonly route: (lang: 'fr' | 'en') => string[] | null;
}

/**
 * Guided path (direction B). Plateformes, Observatoire & Toolkit are deferred
 * until their data is ready, so they are marked "soon" and not clickable yet.
 */
const STEP_DEFINITIONS: readonly StepDefinition[] = [
  {
    id: 'formations',
    icon: 'formations',
    status: 'new',
    route: (lang) => ['/', lang, lang === 'fr' ? 'carriere' : 'career', lang === 'fr' ? 'formations' : 'trainings'],
  },
  {
    id: 'certifications',
    icon: 'certifications',
    status: 'new',
    route: (lang) => ['/', lang, lang === 'fr' ? 'carriere' : 'career', 'certifications'],
  },
  {
    id: 'entretien',
    icon: 'entretien',
    status: 'new',
    route: (lang) => ['/', lang, lang === 'fr' ? 'carriere' : 'career', lang === 'fr' ? 'entretien' : 'interview'],
  },
  {
    id: 'plateformes',
    icon: 'plateformes',
    status: 'new',
    route: (lang) => ['/', lang, lang === 'fr' ? 'carriere' : 'career', lang === 'fr' ? 'plateformes' : 'platforms'],
  },
  { id: 'observatoire', icon: 'observatoire', status: 'soon', route: () => null },
  { id: 'toolkit', icon: 'toolkit', status: 'soon', route: () => null },
];

@Component({
  selector: 'app-career-hub',
  imports: [RouterLink, TranslatePipe, CareerStepComponent],
  templateUrl: './career-hub.html',
  styleUrl: './career-hub.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHubComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  protected readonly meta = {
    spaces: STEP_DEFINITIONS.length,
    questions: INTERVIEW_QUESTIONS.length,
    certLevels: CERTIFICATIONS.filter((cert) => cert.cat === 'angular').length,
  };

  protected readonly steps = computed<CareerStep[]>(() => {
    const lang = this.languageService.lang();
    let liveIndex = 0;
    return STEP_DEFINITIONS.map((definition) => {
      const clickable = definition.status !== 'soon';
      const nodeLabel = clickable ? String(++liveIndex).padStart(2, '0') : '·';
      return {
        id: definition.id,
        icon: definition.icon,
        status: definition.status,
        nodeLabel,
        titleKey: `career.step.${definition.id}.title`,
        journeyKey: `career.step.${definition.id}.journey`,
        descKey: `career.step.${definition.id}.desc`,
        route: definition.route(lang),
        clickable,
      };
    });
  });

  protected readonly homeRoute = computed<string[]>(() => ['/', this.languageService.lang()]);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
    });
  }
}
