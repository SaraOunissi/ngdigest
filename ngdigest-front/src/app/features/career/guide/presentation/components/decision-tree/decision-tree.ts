import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { IconComponent } from '@shared/components/icon/icon';
import {
  GuideDecisionTree,
  GuideLinkTarget,
  GuideOption,
  GuideOutcome,
  GuideQuestion,
} from '../../../domain/models/guide-decision.model';

interface AnsweredStep {
  readonly question: GuideQuestion;
  readonly option: GuideOption;
}

/**
 * "Oriente-toi en 3 questions" — a small, keyboard-driven decision tree.
 * State is a signal-held chain of answered steps; the current question and the
 * final outcome are derived from it. Every control is a native button, so it is
 * focusable and operable with the keyboard out of the box.
 */
@Component({
  selector: 'app-decision-tree',
  imports: [RouterLink, TranslatePipe, IconComponent],
  templateUrl: './decision-tree.html',
  styleUrl: './decision-tree.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecisionTreeComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly tree = input.required<GuideDecisionTree>();

  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('stage');

  private readonly answers = signal<readonly AnsweredStep[]>([]);
  /** Bumped on every navigation so we can move focus to the new step. */
  private readonly navTick = signal(0);

  constructor() {
    // After a choice, move focus to the freshly-rendered step so keyboard
    // users continue from there instead of being dropped to the top. Skips the
    // initial render (tick 0) so the page doesn't steal focus on load.
    afterRenderEffect(() => {
      const tick = this.navTick();
      if (tick === 0 || !this.isBrowser) {
        return;
      }
      this.stageRef()?.nativeElement.querySelector<HTMLElement>('[data-focus-target]')?.focus();
    });
  }

  private readonly questionsById = computed<Map<string, GuideQuestion>>(
    () => new Map(this.tree().questions.map((question) => [question.id, question])),
  );

  private readonly outcomesById = computed<Map<string, GuideOutcome>>(
    () => new Map(this.tree().outcomes.map((outcome) => [outcome.id, outcome])),
  );

  protected readonly path = computed<readonly AnsweredStep[]>(() => this.answers());

  /** The question awaiting an answer, or `null` once an outcome is reached. */
  protected readonly currentQuestion = computed<GuideQuestion | null>(() => {
    const chain = this.answers();
    if (chain.length === 0) {
      return this.questionsById().get(this.tree().rootId) ?? null;
    }
    const last = chain[chain.length - 1].option;
    if (last.next === null) {
      return null;
    }
    return this.questionsById().get(last.next) ?? null;
  });

  protected readonly outcome = computed<GuideOutcome | null>(() => {
    const chain = this.answers();
    if (chain.length === 0) {
      return null;
    }
    const last = chain[chain.length - 1].option;
    return last.outcome ? this.outcomesById().get(last.outcome) ?? null : null;
  });

  protected readonly started = computed<boolean>(() => this.answers().length > 0);

  protected select(question: GuideQuestion, option: GuideOption): void {
    this.answers.update((chain) => [...chain, { question, option }]);
    this.navTick.update((tick) => tick + 1);
  }

  protected back(): void {
    this.answers.update((chain) => chain.slice(0, -1));
    this.navTick.update((tick) => tick + 1);
  }

  protected reset(): void {
    this.answers.set([]);
    this.navTick.update((tick) => tick + 1);
  }

  protected linkRoute(target: GuideLinkTarget): string[] {
    const lang = this.languageService.lang();
    const careerSegment = lang === 'fr' ? 'carriere' : 'career';
    const leaf: Record<GuideLinkTarget, string> = {
      formations: lang === 'fr' ? 'formations' : 'trainings',
      plateformes: lang === 'fr' ? 'plateformes' : 'platforms',
      entretien: lang === 'fr' ? 'entretien' : 'interview',
      certifications: 'certifications',
    };
    return ['/', lang, careerSegment, leaf[target]];
  }
}
