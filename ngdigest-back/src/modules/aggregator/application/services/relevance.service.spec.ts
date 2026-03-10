import { Test, TestingModule } from '@nestjs/testing';
import { RelevanceService } from './relevance.service.js';
import { Resource } from '../../../resources/domain/entities/resource.entity.js';

const dayAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

describe('RelevanceService', () => {
  let service: RelevanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelevanceService],
    }).compile();

    service = module.get<RelevanceService>(RelevanceService);
  });

  describe('scoreArticle', () => {
    it('should give +3 for a trusted domain', () => {
      // Arrange
      const article: Partial<Resource> = {
        url: 'https://dev.to/angular/signals-in-depth',
        title: 'Some generic title',
        publishedAt: dayAgo(30),
      };

      // Act / Assert
      expect(service.scoreArticle(article)).toBe(3);
    });

    it('should give +2 for an Angular keyword in title', () => {
      // Arrange
      const article: Partial<Resource> = {
        url: 'https://unknown-blog.com/article',
        title: 'Understanding Angular Signals',
        publishedAt: dayAgo(30),
      };

      // Act / Assert
      expect(service.scoreArticle(article)).toBe(2);
    });

    it('should give +1 for a recent article (< 7 days)', () => {
      // Arrange
      const article: Partial<Resource> = {
        url: 'https://unknown-blog.com/article',
        title: 'Generic title',
        publishedAt: dayAgo(3),
      };

      // Act / Assert
      expect(service.scoreArticle(article)).toBe(1);
    });

    it('should give 6 for trusted domain + keyword + recent', () => {
      // Arrange
      const article: Partial<Resource> = {
        url: 'https://dev.to/angular/ssr-hydration-2026',
        title: 'Angular SSR and hydration guide',
        publishedAt: dayAgo(2),
      };

      // Act / Assert
      expect(service.scoreArticle(article)).toBe(6);
    });

    it('should give 0 for unknown domain, no keywords, old date', () => {
      // Arrange
      const article: Partial<Resource> = {
        url: 'https://random-site.com/post',
        title: 'Web development tips',
        publishedAt: dayAgo(30),
      };

      // Act / Assert
      expect(service.scoreArticle(article)).toBe(0);
    });

    it('should handle missing url gracefully', () => {
      // Arrange
      const article: Partial<Resource> = {
        title: 'Angular Standalone Components',
        publishedAt: dayAgo(2),
      };

      // Act / Assert — keywords (+2) + recent (+1) = 3
      expect(service.scoreArticle(article)).toBe(3);
    });
  });

  describe('isRelevant', () => {
    it('should return true when score >= 3', () => {
      const article: Partial<Resource> = {
        url: 'https://dev.to/post',
        title: 'Generic title',
        publishedAt: dayAgo(30),
      };
      expect(service.isRelevant(article)).toBe(true);
    });

    it('should return false when score < 3', () => {
      const article: Partial<Resource> = {
        url: 'https://random-site.com/post',
        title: 'Angular tips',
        publishedAt: dayAgo(30),
      };
      // keywords only (+2) → score = 2
      expect(service.isRelevant(article)).toBe(false);
    });
  });
});
