import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { StatusChipComponent } from '@shared/components/status-chip/status-chip';
import { InterviewQuestion, InterviewTheme } from '../../../domain/models/interview-question.model';
import { INTERVIEW_QUESTIONS, INTERVIEW_THEMES } from '../../../infrastructure/interview-questions.data';
import { splitAnswer, stripMarkdown } from '../../../application/light-markdown';
import { InterviewAccordionItemComponent } from '../../components/interview-accordion-item/interview-accordion-item';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Préparation entretien Angular 2026 — 69 questions FR/EN — NgDigest',
  en: 'Angular interview prep 2026 — 69 questions FR/EN — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Les questions qui tombent vraiment en entretien Angular senior — réponses claires et à jour (zoneless, signals, control flow), en FR & EN. Déplie, révise, recommence.',
  en: 'The questions that actually come up in senior Angular interviews — clear, up-to-date answers (zoneless, signals, control flow), in FR & EN. Expand, revise, repeat.',
};

interface InterviewGroup {
  readonly theme: InterviewTheme;
  readonly questions: InterviewQuestion[];
}

@Component({
  selector: 'app-interview-prep',
  imports: [RouterLink, TranslatePipe, StatusChipComponent, InterviewAccordionItemComponent],
  templateUrl: './interview-prep.html',
  styleUrl: './interview-prep.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterviewPrepComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);

  protected readonly themes = INTERVIEW_THEMES;
  protected readonly totalQuestions = INTERVIEW_QUESTIONS.length;
  protected readonly totalThemes = INTERVIEW_THEMES.length;

  protected readonly search = signal('');
  protected readonly answerLang = signal<'fr' | 'en'>(this.languageService.lang());
  protected readonly modernOnly = signal(false);
  protected readonly theme = signal<'all' | string>('all');
  protected readonly open = signal<ReadonlySet<string>>(new Set<string>());

  protected readonly filtered = computed<InterviewQuestion[]>(() =>
    INTERVIEW_QUESTIONS.filter((question) => this.matches(question)),
  );

  protected readonly numberById = computed<Map<string, number>>(() => {
    const map = new Map<string, number>();
    this.filtered().forEach((question, index) => map.set(question.id, index + 1));
    return map;
  });

  protected readonly groups = computed<InterviewGroup[]>(() => {
    const list = this.filtered();
    return INTERVIEW_THEMES.map((theme) => ({
      theme,
      questions: list.filter((question) => question.theme === theme.id),
    })).filter((group) => group.questions.length > 0);
  });

  protected readonly chipCounts = computed<Record<string, number>>(() => {
    const pool = INTERVIEW_QUESTIONS.filter((question) => this.matchesExceptTheme(question));
    const counts: Record<string, number> = { all: pool.length };
    for (const theme of INTERVIEW_THEMES) {
      counts[theme.id] = pool.filter((question) => question.theme === theme.id).length;
    }
    return counts;
  });

  protected readonly resultCount = computed(() => this.filtered().length);

  protected readonly allVisibleOpen = computed<boolean>(() => {
    const list = this.filtered();
    const open = this.open();
    return list.length > 0 && list.every((question) => open.has(question.id));
  });

  protected readonly learnRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'ressources' : 'resources'];
  });

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.seoService.setJsonLd('qa-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        mainEntity: INTERVIEW_QUESTIONS.map((question) => ({
          '@type': 'Question',
          name: question.q[lang],
          acceptedAnswer: {
            '@type': 'Answer',
            text: stripMarkdown(splitAnswer(question.a[lang]).main),
          },
        })),
      });
    });
  }

  protected isOpen(id: string): boolean {
    return this.open().has(id);
  }

  protected displayIndex(id: string): number {
    return this.numberById().get(id) ?? 0;
  }

  protected chipCount(themeId: string): number {
    return this.chipCounts()[themeId] ?? 0;
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

  protected toggleExpandAll(): void {
    const visibleIds = this.filtered().map((question) => question.id);
    if (this.allVisibleOpen()) {
      const next = new Set(this.open());
      visibleIds.forEach((id) => next.delete(id));
      this.open.set(next);
    } else {
      const next = new Set(this.open());
      visibleIds.forEach((id) => next.add(id));
      this.open.set(next);
    }
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected reset(): void {
    this.search.set('');
    this.theme.set('all');
    this.modernOnly.set(false);
  }

  private matches(question: InterviewQuestion): boolean {
    if (this.theme() !== 'all' && question.theme !== this.theme()) {
      return false;
    }
    return this.matchesExceptTheme(question);
  }

  private matchesExceptTheme(question: InterviewQuestion): boolean {
    if (this.modernOnly() && !question.modern) {
      return false;
    }
    const query = this.search().trim().toLowerCase();
    if (query) {
      const haystack =
        `${question.q.fr} ${question.q.en} ${question.a.fr} ${question.a.en} ${question.fine}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  }
}
