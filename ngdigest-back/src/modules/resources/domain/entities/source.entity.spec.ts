import { Source, SourceType } from './source.entity.js';

describe('Source entity', () => {
  it('should instantiate a Source', () => {
    const source = new Source();

    expect(source).toBeDefined();
  });

  it('should accept all properties', () => {
    const source = new Source();
    source.name = 'Angular Blog';
    source.type = SourceType.RSS;
    source.url = 'https://blog.angular.dev/feed';
    source.language = 'en';
    source.active = true;

    expect(source.name).toBe('Angular Blog');
    expect(source.type).toBe(SourceType.RSS);
    expect(source.url).toBe('https://blog.angular.dev/feed');
    expect(source.language).toBe('en');
    expect(source.active).toBe(true);
  });

  it('should have correct enum values', () => {
    expect(SourceType.API).toBe('api');
    expect(SourceType.RSS).toBe('rss');
  });
});
