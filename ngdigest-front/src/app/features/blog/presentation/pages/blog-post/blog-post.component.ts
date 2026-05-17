import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ViewEncapsulation,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { BlogService } from '../../../infrastructure/blog.service';
import { Article } from '../../../domain/models/article.model';
import { environment } from '../../../../../../environments/environment';

const BASE_URL = environment.baseUrl;

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss',
  // ViewEncapsulation.None is required so that styles apply to the dynamically
  // injected innerHTML content (rendered Markdown). Scoping is ensured by the
  // .blog-post__content BEM class used as a selector prefix in the SCSS file.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  private readonly blogService = inject(BlogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);

  protected readonly currentArticle = signal<Article | null>(null);

  constructor() {
    effect(() => {
      const lang = this.languageService.lang();
      const slug = this.route.snapshot.params['slug'] as string;
      const article = this.blogService.getArticle(lang, slug);

      if (!article) {
        // Article not found in this language — navigate to the blog list.
        this.router.navigate(['/', lang, 'blog']);
        return;
      }

      this.currentArticle.set(article);

      const alternateUrl = `${BASE_URL}/${lang === 'fr' ? 'en' : 'fr'}/blog/${article.alternate}`;
      this.seoService.updateMeta(article.title, article.description, lang, alternateUrl);
      this.injectJsonLd(article);
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

  private injectJsonLd(article: Article): void {
    const selector = 'script[data-blog-jsonld]';
    const existing = this.doc.head.querySelector(selector);
    if (existing) existing.remove();

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-blog-jsonld', '');
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      url: `${BASE_URL}/${article.lang}/blog/${article.slug}`,
      inLanguage: article.lang === 'fr' ? 'fr-FR' : 'en-GB',
      publisher: {
        '@type': 'Organization',
        name: 'NgDigest',
        url: BASE_URL,
      },
    });
    this.doc.head.appendChild(script);
  }
}
