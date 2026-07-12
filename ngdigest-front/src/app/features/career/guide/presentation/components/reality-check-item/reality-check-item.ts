import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { lightMarkdown } from '@features/career/interview/application/light-markdown';
import { RealityCheck, RealityCheckSource } from '../../../domain/models/reality-check.model';

/** A single "market truth" row: title header + collapsible body (kept in DOM). */
@Component({
  selector: 'app-reality-check-item',
  imports: [TranslatePipe],
  templateUrl: './reality-check-item.html',
  styleUrl: './reality-check-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RealityCheckItemComponent {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly languageService = inject(LanguageService);

  readonly check = input.required<RealityCheck>();
  readonly displayIndex = input.required<number>();
  readonly open = input.required<boolean>();

  readonly toggled = output<void>();

  protected readonly paddedIndex = computed(() => String(this.displayIndex()).padStart(2, '0'));

  protected readonly title = computed(() => this.check().title[this.languageService.lang()]);

  protected readonly sources = computed<readonly RealityCheckSource[]>(() => this.check().sources ?? []);

  // Copy comes from our static data file and is escaped before markdown is
  // applied, so trusting the resulting HTML is safe.
  protected readonly paragraphs = computed<SafeHtml[]>(() =>
    this.check().body[this.languageService.lang()].map((paragraph) =>
      this.sanitizer.bypassSecurityTrustHtml(lightMarkdown(paragraph)),
    ),
  );
}
