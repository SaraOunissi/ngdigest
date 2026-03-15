import {
  detectLanguage,
  detectLanguageFromText,
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

describe('detectLanguageFromText', () => {
  it('should return "fr" when title contains a French accent character', () => {
    // Key regression case: single accent is sufficient
    expect(
      detectLanguageFromText('Les 6 étapes pour bien démarrer un projet Angular 17'),
    ).toBe('fr');
    expect(detectLanguageFromText('Découvrir Angular')).toBe('fr');
    expect(detectLanguageFromText('créer un composant Angular')).toBe('fr');
  });

  it('should return "fr" when title contains 2+ French function words (no accent)', () => {
    // "les" + "avec" + "des" = 3 matches
    expect(
      detectLanguageFromText('Utiliser les Signals Angular avec des exemples dans votre app'),
    ).toBe('fr');
    // "les" + "avec" + "des" = 3 matches
    expect(
      detectLanguageFromText('Comprendre les Signals Angular avec des exemples'),
    ).toBe('fr');
  });

  it('should return "fr" when accent is in the snippet', () => {
    expect(
      detectLanguageFromText('Angular tutorial', 'Apprenez à créer des composants'),
    ).toBe('fr');
  });

  it('should return null when only 1 French function word and no accent', () => {
    // "avec" alone = 1 match
    expect(detectLanguageFromText('Angular Signals avec RxJS')).toBeNull();
    // "pour" alone = 1 match
    expect(detectLanguageFromText('Angular Signals pour application')).toBeNull();
  });

  it('should return null for clearly English titles', () => {
    expect(detectLanguageFromText('Introduction to Angular Signals')).toBeNull();
    expect(detectLanguageFromText('Building standalone components in Angular')).toBeNull();
    expect(detectLanguageFromText("Angular v17 is here: what's new")).toBeNull();
    expect(detectLanguageFromText('Getting started with Angular HttpClient')).toBeNull();
  });

  it('should be case-insensitive for function words', () => {
    // "LES" + "AVEC" + "DES" = 3 matches
    expect(
      detectLanguageFromText('COMPRENDRE LES SIGNALS ANGULAR AVEC DES EXEMPLES'),
    ).toBe('fr');
  });

  it('should return "unknown" for Spanish titles (no French signal)', () => {
    expect(detectLanguageFromText('Introducción a Angular Signals')).toBe('unknown');
    expect(detectLanguageFromText('Cómo usar Angular con RxJS')).toBe('unknown');
    expect(detectLanguageFromText('Los mejores patrones de diseño en Angular')).toBe('unknown');
  });

  it('should return "unknown" for titles with Arabic, Cyrillic or CJK characters', () => {
    expect(detectLanguageFromText('Angular مقدمة')).toBe('unknown');
    expect(detectLanguageFromText('Angular введение')).toBe('unknown');
  });

  it('should return null for undefined or empty title', () => {
    expect(detectLanguageFromText(undefined)).toBeNull();
    expect(detectLanguageFromText('')).toBeNull();
  });
});

describe('detectLanguageFromTitle (deprecated alias)', () => {
  it('should delegate to detectLanguageFromText', () => {
    expect(
      detectLanguageFromTitle('Les 6 étapes pour bien démarrer un projet Angular 17'),
    ).toBe('fr');
    expect(detectLanguageFromTitle('Introduction to Angular Signals')).toBeNull();
    expect(detectLanguageFromTitle(undefined)).toBeNull();
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

  it('should detect French via title accent for multilingual platforms', () => {
    expect(
      detectLanguage(
        'https://dev.to/user/article',
        'Les 6 étapes pour bien démarrer un projet Angular 17',
      ),
    ).toBe('fr');
    expect(
      detectLanguage('https://medium.com/@user/article', 'Créer des composants Angular'),
    ).toBe('fr');
  });

  it('should detect French via 2+ function words for multilingual platforms', () => {
    expect(
      detectLanguage(
        'https://dev.to/user/article',
        'Comment utiliser les Signals Angular avec des exemples',
      ),
    ).toBe('fr');
  });

  it('should detect French via snippet when title is neutral', () => {
    expect(
      detectLanguage(
        'https://dev.to/user/article',
        'Angular Signals',
        'Découvrez les nouvelles fonctionnalités',
      ),
    ).toBe('fr');
  });

  it('should return "en" for English articles on multilingual platforms', () => {
    expect(
      detectLanguage('https://dev.to/user/article', 'Introduction to Angular Signals'),
    ).toBe('en');

    expect(
      detectLanguage(
        'https://medium.com/@user/article',
        'Building standalone Angular components',
      ),
    ).toBe('en');
  });

  it('should return "en" for multilingual platform URLs when no title is provided', () => {
    expect(detectLanguage('https://dev.to/user/article')).toBe('en');
    expect(detectLanguage('https://medium.com/@user/article', undefined)).toBe('en');
  });

  it('should not be fooled by a single French function word in the title', () => {
    // "avec" alone (1 match, no accent) is not enough to classify as French
    expect(detectLanguage('https://dev.to/user/article', 'Angular Signals avec RxJS')).toBe('en');
  });
});
