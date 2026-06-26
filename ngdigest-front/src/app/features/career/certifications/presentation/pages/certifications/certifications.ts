import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { AffiliateService } from '@core/services/affiliate.service';
import { Certification } from '../../../domain/models/certification.model';
import { CERTIFICATIONS, CERT_CATEGORIES, CERT_VERDICT } from '../../../infrastructure/certifications.data';
import { CertCardComponent } from '../../components/cert-card/cert-card';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Certifications Angular & front — lesquelles valent le coup — NgDigest',
  en: 'Angular & frontend certifications — which ones are worth it — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'La certif Angular officielle (Certificates.dev × Angular Training, 3 niveaux) et les certifs transverses qui font décoller un profil front senior — avec les vrais prix.',
  en: 'The official Angular certification (Certificates.dev × Angular Training, 3 levels) and the cross-cutting certs that lift a senior frontend profile — with real prices.',
};

const CERTIFICATES_DEV_URL = 'https://certificates.dev/angular';

interface CertSection {
  readonly category: (typeof CERT_CATEGORIES)[number];
  readonly certs: Certification[];
}

interface PodiumRow {
  readonly rank: string;
  readonly name: string;
  readonly org: string;
  readonly cost: string;
  readonly line: string;
}

@Component({
  selector: 'app-certifications',
  imports: [RouterLink, TranslatePipe, CertCardComponent],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificationsComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  private readonly affiliate = inject(AffiliateService);

  protected readonly sections = computed<CertSection[]>(() =>
    CERT_CATEGORIES.map((category) => ({
      category,
      certs: CERTIFICATIONS.filter((cert) => cert.cat === category.id),
    })).filter((section) => section.certs.length > 0),
  );

  protected readonly podium = computed<PodiumRow[]>(() => {
    const lang = this.languageService.lang();
    return CERT_VERDICT.map((entry) => {
      const cert = CERTIFICATIONS.find((candidate) => candidate.id === entry.certId);
      return {
        rank: entry.rank,
        name: cert ? cert.name[lang] : '',
        org: cert ? cert.org : '',
        cost: cert ? cert.cost[lang] : '',
        line: entry.line[lang],
      };
    });
  });

  protected readonly certificatesDevUrl = this.affiliate.buildUrl(CERTIFICATES_DEV_URL, 'certificates-dev');
  protected readonly certificatesDevRel = this.affiliate.rel(true);

  protected readonly careerRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career'];
  });

  protected readonly catalogRoute = computed<string[]>(() => {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'ressources' : 'resources'];
  });

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.seoService.setJsonLd('certifications-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: SEO_TITLES[lang],
        itemListElement: CERTIFICATIONS.map((cert, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: cert.name[lang],
          description: cert.verdict[lang],
        })),
      });
    });
  }
}
