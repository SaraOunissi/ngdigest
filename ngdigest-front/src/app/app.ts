import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from './core/services/language.service';
import { FooterComponent } from './shared/components/footer/footer';
import { BlogService } from './features/blog/infrastructure/blog.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly blogService = inject(BlogService);

  switchLang(targetLang: 'fr' | 'en'): void {
    const currentUrl = this.router.url;

    // Blog post pages have language-specific slugs — look up the alternate slug
    // rather than blindly swapping the language prefix in the URL.
    const blogPostMatch = currentUrl.match(/^\/(fr|en)\/blog\/([^/?#]+)/);
    if (blogPostMatch) {
      const currentLang = blogPostMatch[1] as 'fr' | 'en';
      const currentSlug = blogPostMatch[2];
      const article = this.blogService.getArticle(currentLang, currentSlug);
      const alternateSlug = article?.alternate;

      if (alternateSlug && this.blogService.getArticle(targetLang, alternateSlug)) {
        this.router.navigateByUrl(`/${targetLang}/blog/${alternateSlug}`);
      } else {
        // No translated version exists — fall back to the blog list.
        this.router.navigateByUrl(`/${targetLang}/blog`);
      }
      return;
    }

    // Default: swap the /fr or /en prefix for all other routes.
    const newUrl = currentUrl.replace(/^\/(fr|en)(\/|$)/, `/${targetLang}$2`);
    this.router.navigateByUrl(newUrl);
  }
}
