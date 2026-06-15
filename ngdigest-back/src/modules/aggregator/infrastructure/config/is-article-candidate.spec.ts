import { isLikelyArticle } from './is-article-candidate.js';

describe('isLikelyArticle', () => {
  describe('rejects non-article pages', () => {
    it('rejects the reported Angular blog "Latest" listing page', () => {
      // Arrange / Act / Assert
      expect(
        isLikelyArticle('https://blog.angular.dev/latest', 'Latest'),
      ).toBe(false);
    });

    it('rejects a generic navigation title regardless of URL', () => {
      expect(
        isLikelyArticle('https://blog.angular.dev/some-path', 'Latest'),
      ).toBe(false);
    });

    it('rejects a domain homepage (no path)', () => {
      expect(isLikelyArticle('https://netbasal.com/', 'Netanel Basal')).toBe(
        false,
      );
    });

    it('rejects tag / tagged listing pages', () => {
      expect(
        isLikelyArticle('https://medium.com/tag/angular', 'Angular'),
      ).toBe(false);
      expect(
        isLikelyArticle('https://blog.angular.dev/tagged/angular', 'Angular'),
      ).toBe(false);
    });

    it('rejects a bare Medium author profile page', () => {
      expect(
        isLikelyArticle('https://medium.com/@angular', 'Angular'),
      ).toBe(false);
    });

    it('rejects pagination and search pages', () => {
      expect(isLikelyArticle('https://example.com/page/2', 'Posts')).toBe(
        false,
      );
      expect(
        isLikelyArticle('https://example.com/search?q=angular', 'Search'),
      ).toBe(false);
    });

    it('rejects when url or title is missing', () => {
      expect(isLikelyArticle(undefined, 'Angular Signals')).toBe(false);
      expect(isLikelyArticle('https://example.com/article', undefined)).toBe(
        false,
      );
    });

    it('rejects an unparseable url', () => {
      expect(isLikelyArticle('not-a-url', 'Angular Signals')).toBe(false);
    });
  });

  describe('keeps real articles', () => {
    it('keeps a Medium-hosted Angular blog article', () => {
      expect(
        isLikelyArticle(
          'https://blog.angular.dev/angular-in-2026-mid-year-reality-check-ff37df480574',
          'Angular in 2026: Mid-Year Reality Check',
        ),
      ).toBe(true);
    });

    it('keeps a Ninja Squad dated article path', () => {
      expect(
        isLikelyArticle(
          'https://blog.ninja-squad.com/2026/06/05/what-is-new-angular-22/',
          'What is new in Angular 22',
        ),
      ).toBe(true);
    });

    it('keeps a real Medium article published under an author handle', () => {
      // /@handle/slug is an article; only the bare /@handle is a profile page.
      expect(
        isLikelyArticle(
          'https://medium.com/@marcomatto/angular-22-embracing-the-signal-first-era-b1c8803acea6',
          'Angular 22: Embracing the Signal Era',
        ),
      ).toBe(true);
    });

    it('keeps a Dev.to article (author/slug path)', () => {
      expect(
        isLikelyArticle(
          'https://dev.to/maxime1992/angular-signals-deep-dive-1abc',
          'Angular Signals deep dive',
        ),
      ).toBe(true);
    });

    it('does not reject a slug that merely contains a reserved word', () => {
      // "about" appears inside the slug, but the whole segment is not "about".
      expect(
        isLikelyArticle(
          'https://netbasal.com/about-angular-signals',
          'About Angular Signals',
        ),
      ).toBe(true);
    });
  });
});
