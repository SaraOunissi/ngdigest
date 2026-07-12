import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { LanguageService } from '@core/services/language.service';
import { translateRoutePath } from '@core/i18n/route-slugs';
import { BlogService } from '@features/blog/infrastructure/blog.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {
  protected readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly blogService = inject(BlogService);

  protected readonly menuOpen = signal(false);

  constructor() {
    // Collapse the mobile menu whenever a navigation completes.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected homeRoute(): string[] {
    return ['/', this.languageService.lang()];
  }

  protected veilleRoute(): string[] {
    return ['/', this.languageService.lang(), 'veille'];
  }

  protected jobsRoute(): string[] {
    return ['/', this.languageService.lang(), 'jobs'];
  }

  protected blogRoute(): string[] {
    return ['/', this.languageService.lang(), 'blog'];
  }

  protected careerRoute(): string[] {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'carriere' : 'career'];
  }

  protected catalogRoute(): string[] {
    const lang = this.languageService.lang();
    return ['/', lang, lang === 'fr' ? 'ressources' : 'resources'];
  }

  protected switchLang(targetLang: 'fr' | 'en'): void {
    const currentUrl = this.router.url;

    // Blog post pages have language-specific slugs — look up the alternate slug
    // rather than blindly swapping the language prefix.
    const blogPostMatch = currentUrl.match(/^\/(fr|en)\/blog\/([^/?#]+)/);
    if (blogPostMatch) {
      const currentLang = blogPostMatch[1] as 'fr' | 'en';
      const currentSlug = blogPostMatch[2];
      const article = this.blogService.getArticle(currentLang, currentSlug);
      const alternateSlug = article?.alternate;

      if (alternateSlug && this.blogService.getArticle(targetLang, alternateSlug)) {
        this.router.navigateByUrl(`/${targetLang}/blog/${alternateSlug}`);
      } else {
        this.router.navigateByUrl(`/${targetLang}/blog`);
      }
      return;
    }

    // Translate "/<lang>/<path><suffix>", swapping the slug when it differs
    // between languages (career, certifications, interview, catalog, legal…).
    this.router.navigateByUrl(translateRoutePath(currentUrl, targetLang));
  }
}
