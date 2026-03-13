import { Resource } from './resource.model';

describe('Resource model', () => {
  it('should create a valid Resource object', () => {
    const resource: Resource = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Introduction to Angular Signals',
      url: 'https://blog.angular.dev/signals',
      source: 'Angular Blog',
      publishedAt: '2025-12-01T10:00:00.000Z',
      score: 42,
      tags: ['angular', 'signals'],
      isRead: false,
      isFavorite: true,
      pinned: false,
      archivedAt: null,
      language: 'en',
    };

    expect(resource._id).toBe('507f1f77bcf86cd799439011');
    expect(resource.title).toBe('Introduction to Angular Signals');
    expect(resource.url).toBe('https://blog.angular.dev/signals');
    expect(resource.source).toBe('Angular Blog');
    expect(resource.publishedAt).toBe('2025-12-01T10:00:00.000Z');
    expect(resource.score).toBe(42);
    expect(resource.tags).toEqual(['angular', 'signals']);
    expect(resource.isRead).toBe(false);
    expect(resource.isFavorite).toBe(true);
  });

  it('should allow an empty tags array', () => {
    const resource: Resource = {
      _id: '507f1f77bcf86cd799439012',
      title: 'Some Article',
      url: 'https://example.com/article',
      source: 'Dev.to',
      publishedAt: '2025-11-15T08:00:00.000Z',
      score: 0,
      tags: [],
      isRead: false,
      isFavorite: false,
      pinned: false,
      archivedAt: null,
      language: 'en',
    };

    expect(resource.tags).toEqual([]);
    expect(resource.score).toBe(0);
  });
});
