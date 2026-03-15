import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GetSourcesUseCase } from './application/use-cases/get-sources.use-case';
import { SuggestSourceUseCase } from './application/use-cases/suggest-source.use-case';
import { SeoService } from '@core/services/seo.service';
import { LanguageService } from '@core/services/language.service';

const URL_PATTERN = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/;

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Sources Angular — NgDigest',
  en: 'Angular Sources — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Découvrez les sources Angular de confiance utilisées par NgDigest et suggérez de nouvelles sources à inclure.',
  en: 'Discover the trusted Angular sources used by NgDigest and suggest new sources to include.',
};

@Component({
  selector: 'app-sources',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './sources.component.html',
  styleUrl: './sources.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourcesComponent implements OnInit {
  private readonly getSourcesUseCase = inject(GetSourcesUseCase);
  private readonly suggestSourceUseCase = inject(SuggestSourceUseCase);
  private readonly formBuilder = inject(FormBuilder);
  private readonly seoService = inject(SeoService);
  private readonly languageService = inject(LanguageService);
  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
    });
  }

  readonly sources = signal<string[]>([]);
  readonly isLoadingSources = signal(true);
  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly form: FormGroup = this.formBuilder.group({
    url: ['', [Validators.required, Validators.pattern(URL_PATTERN), Validators.maxLength(500)]],
    reason: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.getSourcesUseCase.execute().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (domains) => {
        this.sources.set(domains);
        this.isLoadingSources.set(false);
      },
      error: () => {
        this.isLoadingSources.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const { url, reason } = this.form.value as { url: string; reason: string };
    const suggestion = { url: url.trim(), reason: reason?.trim() || undefined };

    this.suggestSourceUseCase.execute(suggestion).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.form.reset();
      },
      error: (error: { error?: { error?: { message?: string } } }) => {
        this.isSubmitting.set(false);
        const message =
          error?.error?.error?.message ?? this.translateService.instant('sources.suggest.error');
        this.submitError.set(message);
      },
    });
  }

  resetForm(): void {
    this.submitSuccess.set(false);
    this.submitError.set(null);
    this.form.reset();
  }

  get urlControl(): AbstractControl {
    return this.form.get('url')!;
  }

  get reasonControl(): AbstractControl {
    return this.form.get('reason')!;
  }
}
