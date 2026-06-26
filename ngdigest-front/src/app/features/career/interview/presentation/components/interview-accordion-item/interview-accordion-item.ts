import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';

import { InterviewQuestion } from '../../../domain/models/interview-question.model';
import { lightMarkdown, splitAnswer } from '../../../application/light-markdown';

/** A single accordion row: question header + collapsible answer (kept in DOM). */
@Component({
  selector: 'app-interview-accordion-item',
  imports: [TranslatePipe],
  templateUrl: './interview-accordion-item.html',
  styleUrl: './interview-accordion-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterviewAccordionItemComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly question = input.required<InterviewQuestion>();
  readonly answerLang = input.required<'fr' | 'en'>();
  readonly displayIndex = input.required<number>();
  readonly open = input.required<boolean>();

  readonly toggled = output<void>();

  protected readonly dots: readonly number[] = [1, 2, 3];

  protected readonly questionText = computed(() => this.question().q[this.answerLang()]);
  protected readonly paddedIndex = computed(() => String(this.displayIndex()).padStart(2, '0'));

  // Answer copy comes from our static data file and is escaped before markdown
  // is applied, so trusting the resulting HTML is safe.
  private readonly split = computed(() => splitAnswer(this.question().a[this.answerLang()]));
  protected readonly mainHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(lightMarkdown(this.split().main)),
  );
  protected readonly noteHtml = computed<SafeHtml | null>(() => {
    const note = this.split().note;
    return note ? this.sanitizer.bypassSecurityTrustHtml(lightMarkdown(note)) : null;
  });
}
