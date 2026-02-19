import { Resource } from './resource.entity.js';

describe('Resource entity', () => {
  it('should instantiate with default values', () => {
    const resource = new Resource();

    expect(resource).toBeDefined();
    expect(resource.score).toBeUndefined();
    expect(resource.tags).toBeUndefined();
    expect(resource.isRead).toBeUndefined();
    expect(resource.isFavorite).toBeUndefined();
  });

  it('should accept all properties', () => {
    const resource = new Resource();
    resource.title = 'Angular Signals Guide';
    resource.url = 'https://angular.dev/guide/signals';
    resource.source = 'Angular Blog';
    resource.publishedAt = new Date('2025-12-01');
    resource.score = 10;
    resource.tags = ['angular', 'signals'];
    resource.isRead = true;
    resource.isFavorite = false;

    expect(resource.title).toBe('Angular Signals Guide');
    expect(resource.url).toBe('https://angular.dev/guide/signals');
    expect(resource.source).toBe('Angular Blog');
    expect(resource.publishedAt).toEqual(new Date('2025-12-01'));
    expect(resource.score).toBe(10);
    expect(resource.tags).toEqual(['angular', 'signals']);
    expect(resource.isRead).toBe(true);
    expect(resource.isFavorite).toBe(false);
  });
});
