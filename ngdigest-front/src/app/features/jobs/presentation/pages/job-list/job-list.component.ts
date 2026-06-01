import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { JobsStore } from '../../../application/jobs.store';
import { Job } from '../../../domain/models/job.model';
import { JobFiltersComponent } from '../../components/job-filters/job-filters.component';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Offres Angular curated — NgDigest',
  en: 'Curated Angular Jobs — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr:
    'Sélection bi-mensuelle d’offres Angular front pur, remote ou hybride, ' +
    'curated humainement par Sara Ounissi — pas de fullstack déguisé.',
  en:
    'Bi-monthly hand-picked Angular frontend jobs (remote or hybrid), reviewed ' +
    'by Sara Ounissi — no disguised fullstack.',
};

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, JobFiltersComponent],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobListComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  protected readonly store = inject(JobsStore);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
    });
  }

  protected formatDate(isoDate: string): string {
    const lang = this.languageService.lang();
    return new Date(isoDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  protected compensationLabel(job: Job): string {
    return job.type === 'CDI' ? (job.salary ?? '') : (job.tjm ?? '');
  }

  protected compensationKindKey(job: Job): string {
    return job.type === 'CDI' ? 'jobs.fact.salary' : 'jobs.fact.tjm';
  }

  protected remoteLabelKey(remote: Job['remote']): string {
    switch (remote) {
      case '100':
        return 'jobs.badge.remote100';
      case 'hybride':
        return 'jobs.badge.hybrid';
      default:
        return 'jobs.badge.onsite';
    }
  }

  protected initials(company: string): string {
    return company.trim().charAt(0).toUpperCase();
  }
}
