import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '@core/services/language.service';
import { SeoService } from '@core/services/seo.service';
import { BlogService } from '../../../infrastructure/blog.service';
import { Article } from '../../../domain/models/article.model';
import { environment } from '../../../../../../environments/environment';

const BASE_URL = environment.baseUrl;
const LINKEDIN_URL = 'https://www.linkedin.com/in/sara-ounissi-8b18a9b7/';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss',
  // ViewEncapsulation.None is required so that styles apply to the dynamically
  // injected innerHTML content (rendered Markdown). Scoping is ensured by the
  // global `.blog-view` / `.prose` selectors in src/styles/_blog.scss.
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly currentArticle = signal<Article | null>(null);

  /**
   * Trusted article HTML. The content is generated at build time from Sara's
   * own Markdown (no user input), so we bypass Angular's sanitizer — which would
   * otherwise strip the `id` attributes the TOC anchors and scrollspy rely on.
   */
  protected readonly safeContent = computed<SafeHtml | null>(() => {
    const article = this.currentArticle();
    return article ? this.sanitizer.bypassSecurityTrustHtml(article.contentHtml) : null;
  });

  /** Anchor id of the section currently in view (drives the TOC scrollspy). */
  protected readonly activeTocId = signal<string>('');

  /** Related articles (same language, most shared tags). */
  protected readonly relatedArticles = computed<Article[]>(() => {
    const article = this.currentArticle();
    if (!article) return [];
    return this.blogService.getRelated(article.slug, article.lang, 2);
  });

  protected readonly linkedinUrl = LINKEDIN_URL;

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

    // Reading aids run in the browser only (afterRenderEffect skips SSR) and
    // re-initialise whenever the rendered article changes (e.g. language toggle).
    afterRenderEffect((onCleanup) => {
      const article = this.currentArticle();
      if (!article) return;

      const cleanupScrollspy = this.setupScrollspy();
      const cleanupProgress = this.setupReadingProgress();

      onCleanup(() => {
        cleanupScrollspy();
        cleanupProgress();
      });
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

  /** Highlight the active section as the reader scrolls. */
  private setupScrollspy(): () => void {
    const headings = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('.prose h2[id]'),
    );
    if (headings.length === 0) return () => undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeTocId.set((entry.target as HTMLElement).id);
          }
        }
      },
      { rootMargin: '-15% 0px -75% 0px' },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }

  /** Fill the top progress bar proportionally to the scroll position. */
  private setupReadingProgress(): () => void {
    const readbar = this.host.nativeElement.querySelector<HTMLElement>('.readbar');
    if (!readbar) return () => undefined;

    const update = (): void => {
      const docEl = this.doc.documentElement;
      const scrollable = docEl.scrollHeight - docEl.clientHeight;
      const percent = scrollable > 0 ? (docEl.scrollTop / scrollable) * 100 : 0;
      const clamped = Math.max(0, Math.min(100, percent));
      this.renderer.setStyle(readbar, 'width', `${clamped}%`);
    };

    update();
    const win = this.doc.defaultView;
    win?.addEventListener('scroll', update, { passive: true });
    win?.addEventListener('resize', update);

    return () => {
      win?.removeEventListener('scroll', update);
      win?.removeEventListener('resize', update);
    };
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
