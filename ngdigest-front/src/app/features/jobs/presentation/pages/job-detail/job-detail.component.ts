import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { environment } from '../../../../../../environments/environment';
import { GetJobsUseCase } from '../../../application/use-cases/get-jobs.use-case';
import { Job } from '../../../domain/models/job.model';

const BASE_URL = environment.baseUrl;

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobDetailComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  private readonly getJobs = inject(GetJobsUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);

  protected readonly currentJob = signal<Job | null>(null);
  protected readonly similarJobs = computed<readonly Job[]>(() => {
    const job = this.currentJob();
    return job ? this.getJobs.executeSimilar(job.slug) : [];
  });

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      const slug = this.route.snapshot.params['slug'] as string;
      const job = this.getJobs.executeBySlug(slug);

      if (!job) {
        this.router.navigate(['/', lang, 'jobs']);
        return;
      }

      this.currentJob.set(job);

      const title = `${job.title} — ${job.company} · NgDigest`;
      const description =
        job.editorialHook ||
        `${job.title} chez ${job.company}. Offre Angular curated NgDigest.`;
      this.seoService.updateMeta(title, description, lang);
      this.injectJsonLd(job);
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

  private injectJsonLd(job: Job): void {
    const selector = 'script[data-job-jsonld]';
    const existing = this.doc.head.querySelector(selector);
    if (existing) existing.remove();

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-job-jsonld', '');
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.editorialNote || job.editorialHook,
      datePosted: job.scannedAt,
      employmentType: job.type === 'CDI' ? 'FULL_TIME' : 'CONTRACTOR',
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company,
      },
      jobLocationType: job.remote === '100' ? 'TELECOMMUTE' : undefined,
      applicantLocationRequirements:
        job.zone === 'FR' || job.zone === 'EU'
          ? {
              '@type': 'Country',
              name: job.zone === 'FR' ? 'France' : 'European Union',
            }
          : undefined,
      url: `${BASE_URL}/${this.languageService.lang()}/jobs/${job.slug}`,
      directApply: false,
    });
    this.doc.head.appendChild(script);
  }
}
