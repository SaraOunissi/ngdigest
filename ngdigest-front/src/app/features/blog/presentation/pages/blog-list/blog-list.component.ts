import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { BlogService } from '../../../infrastructure/blog.service';
import { Article } from '../../../domain/models/article.model';

const SEO_TITLES: Record<'fr' | 'en', string> = {
  fr: 'Blog Angular — NgDigest',
  en: 'Angular Blog — NgDigest',
};

const SEO_DESCRIPTIONS: Record<'fr' | 'en', string> = {
  fr: 'Articles sur Angular, le développement frontend et le freelance en France.',
  en: 'Articles about Angular, frontend development and freelancing in France.',
};

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  private readonly blogService = inject(BlogService);

  protected readonly articles = signal<Article[]>([]);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.articles.set(this.blogService.getArticles(lang));
    });
  }

  protected formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const lang = this.languageService.lang();
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
