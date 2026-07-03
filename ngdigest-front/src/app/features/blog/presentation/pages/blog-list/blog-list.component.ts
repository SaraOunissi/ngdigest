import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
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

/** Max number of tag pills shown per row/card (charte). */
const MAX_TAGS = 3;

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

  /** All articles for the current language (newest-first). */
  protected readonly articles = signal<Article[]>([]);

  /** The featured article (pinned via `featured: true`, else most recent). */
  protected readonly featured = signal<Article | null>(null);

  /** Every article except the featured one, for the editorial rows. */
  protected readonly otherArticles = computed(() => {
    const featuredSlug = this.featured()?.slug;
    return this.articles().filter((article) => article.slug !== featuredSlug);
  });

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      this.seoService.updateMeta(SEO_TITLES[lang], SEO_DESCRIPTIONS[lang], lang);
      this.articles.set(this.blogService.getArticles(lang));
      this.featured.set(this.blogService.getFeatured(lang) ?? null);
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

  /** Uppercase initials derived from the author's name (e.g. "Sara Ounissi" → "SO"). */
  protected authorInitials(author: string): string {
    return author
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  protected visibleTags(tags: readonly string[]): readonly string[] {
    return tags.slice(0, MAX_TAGS);
  }
}
