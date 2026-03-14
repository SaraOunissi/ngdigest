import {
  detectLanguage,
  detectLanguageFromTitle,
  detectLanguageFromUrl,
} from './language-detector.js';

describe('detectLanguageFromUrl', () => {
  it('should return "fr" for .fr TLD', () => {
    expect(detectLanguageFromUrl('https://grafikart.fr/article')).toBe('fr');
    expect(detectLanguageFromUrl('https://www.grafikart.fr/article')).toBe('fr');
  });

  it('should return "fr" for known French domains', () => {
    expect(detectLanguageFromUrl('https://jesuisundev.com/post')).toBe('fr');
    expect(detectLanguageFromUrl('https://la-cascade.io/article')).toBe('fr');
    expect(detectLanguageFromUrl('https://putaindecode.io/post')).toBe('fr');
    expect(detectLanguageFromUrl('https://alticreation.com/article')).toBe('fr');
  });

  it('should return "en" for common English-language domains', () => {
    expect(detectLanguageFromUrl('https://dev.to/user/article')).toBe('en');
    expect(detectLanguageFromUrl('https://medium.com/@user/article')).toBe('en');
    expect(detectLanguageFromUrl('https://angular.dev/guide')).toBe('en');
    expect(detectLanguageFromUrl('https://indepth.dev/posts/article')).toBe('en');
  });

  it('should return "unknown" for undefined or invalid URLs', () => {
    expect(detectLanguageFromUrl(undefined)).toBe('unknown');
    expect(detectLanguageFromUrl('')).toBe('unknown');
    expect(detectLanguageFromUrl('not-a-url')).toBe('unknown');
  });
});

describe('detectLanguageFromTitle', () => {
  it('should return "fr" when 2+ French indicators are found', () => {
    // "avec " + "dans " = 2 matches
    expect(detectLanguageFromTitle('Utiliser les Signals Angular avec des exemples dans votre app')).toBe('fr');
    // "comprendre" + "avec " = 2 matches
    expect(detectLanguageFromTitle('Comprendre les Signals Angular avec des exemples')).toBe('fr');
    // "découvrir" + "nouvelle " = 2 matches
    expect(detectLanguageFromTitle('Découvrir la nouvelle version d\'Angular')).toBe('fr');
    // "pour " + "votre " = 2 matches
    expect(detectLanguageFromTitle('Angular Signals pour votre application')).toBe('fr');
    // "utiliser" + "notre " = 2 matches
    expect(detectLanguageFromTitle('Comment utiliser notre nouveau composant Angular')).toBe('fr');
  });

  it('should return null when fewer than 2 French indicators are found', () => {
    // Only "avec " = 1 match
    expect(detectLanguageFromTitle('Angular Signals avec RxJS')).toBeNull();
    // Only "nouvelle " = 1 match
    expect(detectLanguageFromTitle('Angular nouvelle version released')).toBeNull();
  });

  it('should return null for clearly English titles', () => {
    expect(detectLanguageFromTitle('Introduction to Angular Signals')).toBeNull();
    expect(detectLanguageFromTitle('Building standalone components in Angular')).toBeNull();
    expect(detectLanguageFromTitle('Angular v17 is here: what\'s new')).toBeNull();
    expect(detectLanguageFromTitle('Getting started with Angular HttpClient')).toBeNull();
  });

  it('should be case-insensitive', () => {
    expect(detectLanguageFromTitle('COMPRENDRE LES SIGNALS ANGULAR AVEC DES EXEMPLES')).toBe('fr');
    expect(detectLanguageFromTitle('UTILISER DANS VOTRE APPLICATION')).toBe('fr');
  });

  it('should return null for undefined or empty title', () => {
    expect(detectLanguageFromTitle(undefined)).toBeNull();
    expect(detectLanguageFromTitle('')).toBeNull();
  });
});

describe('detectLanguage', () => {
  it('should return "fr" when URL is a .fr domain regardless of title', () => {
    expect(detectLanguage('https://grafikart.fr/article', 'Angular signals tutorial')).toBe('fr');
    expect(detectLanguage('https://grafikart.fr/article')).toBe('fr');
  });

  it('should return "fr" when URL is a known French domain', () => {
    expect(detectLanguage('https://jesuisundev.com/post', undefined)).toBe('fr');
  });

  it('should return "unknown" for invalid URLs regardless of title', () => {
    expect(detectLanguage(undefined, 'comprendre utiliser Angular')).toBe('unknown');
    expect(detectLanguage('not-a-url', 'utiliser dans votre application')).toBe('unknown');
  });

  it('should detect French via title for multilingual platforms', () => {
    // dev.to URL defaults to "en" via URL detection, but title has 2+ French words
    expect(
      detectLanguage('https://dev.to/user/article', 'Comment utiliser les Signals Angular avec des exemples'),
    ).toBe('fr');

    expect(
      detectLanguage('https://medium.com/@user/article', 'Comprendre Angular avec votre premier composant'),
    ).toBe('fr');
  });

  it('should return "en" for English articles on multilingual platforms', () => {
    expect(
      detectLanguage('https://dev.to/user/article', 'Introduction to Angular Signals'),
    ).toBe('en');

    expect(
      detectLanguage('https://medium.com/@user/article', 'Building standalone Angular components'),
    ).toBe('en');
  });

  it('should return "en" for multilingual platform URLs when no title is provided', () => {
    expect(detectLanguage('https://dev.to/user/article')).toBe('en');
    expect(detectLanguage('https://medium.com/@user/article', undefined)).toBe('en');
  });

  it('should not be fooled by a single French word in the title', () => {
    // "avec" alone (1 match) is not enough to classify as French
    expect(detectLanguage('https://dev.to/user/article', 'Angular Signals avec RxJS')).toBe('en');
  });
});
