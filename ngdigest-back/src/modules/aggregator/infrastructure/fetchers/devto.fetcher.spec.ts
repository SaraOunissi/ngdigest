import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DevtoFetcher } from './devto.fetcher.js';

const MOCK_ARTICLES = [
  {
    title: 'Angular Signals deep dive',
    url: 'https://dev.to/author/angular-signals-deep-dive',
    published_at: '2026-03-01T10:00:00.000Z',
    positive_reactions_count: 120,
    tag_list: ['angular', 'signals', 'typescript'],
  },
  {
    title: '',
    url: 'https://dev.to/author/no-title',
    published_at: '2026-03-01T10:00:00.000Z',
    positive_reactions_count: 5,
    tag_list: ['angular'],
  },
];

const buildModule = async (devToEnabled: string): Promise<DevtoFetcher> => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      DevtoFetcher,
      {
        provide: ConfigService,
        useValue: {
          get: jest
            .fn()
            .mockImplementation((key: string, defaultValue?: string) =>
              key === 'DEV_TO_ENABLED' ? devToEnabled : (defaultValue ?? ''),
            ),
        },
      },
    ],
  }).compile();

  return module.get<DevtoFetcher>(DevtoFetcher);
};

describe('DevtoFetcher', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return [] without calling fetch when DEV_TO_ENABLED is false', async () => {
    // Arrange
    const fetcher = await buildModule('false');

    // Act
    const results = await fetcher.fetch();

    // Assert
    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should map Dev.to articles to Resource shape', async () => {
    // Arrange
    const fetcher = await buildModule('true');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(MOCK_ARTICLES),
    });

    // Act
    const results = await fetcher.fetch();

    // Assert
    expect(results[0]).toMatchObject({
      title: 'Angular Signals deep dive',
      url: 'https://dev.to/author/angular-signals-deep-dive',
      source: 'dev.to',
      tags: expect.arrayContaining(['angular', 'devto', 'signals']),
      score: 0,
      isRead: false,
      isFavorite: false,
    });
    expect(results[0]?.publishedAt).toBeInstanceOf(Date);
  });

  it('should respect Dev.to declared language and route non-fr/en to unknown', async () => {
    // Arrange
    const fetcher = await buildModule('true');
    const articles = [
      {
        title: 'Migrando um YMS de 5 anos',
        url: 'https://dev.to/erick/migrando-um-yms',
        published_at: '2026-03-01T10:00:00.000Z',
        tag_list: ['angular'],
        language: 'pt',
      },
      {
        title: 'Comprendre les Signals',
        url: 'https://dev.to/marie/comprendre-les-signals',
        published_at: '2026-03-01T10:00:00.000Z',
        tag_list: ['angular'],
        language: 'fr',
      },
      {
        title: 'Angular Signals deep dive',
        url: 'https://dev.to/john/angular-signals-deep-dive',
        published_at: '2026-03-01T10:00:00.000Z',
        tag_list: ['angular'],
        language: 'en',
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(articles),
    });

    // Act
    const results = await fetcher.fetch();

    // Assert — Portuguese is routed to 'unknown' (filtered later), fr/en kept
    expect(results.map((r) => r.language)).toEqual(['unknown', 'fr', 'en']);
  });

  it('should filter out articles with no title', async () => {
    // Arrange
    const fetcher = await buildModule('true');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(MOCK_ARTICLES),
    });

    // Act
    const results = await fetcher.fetch();

    // Assert — only the article with a title passes
    expect(results.length).toBe(1);
  });

  it('should return [] when fetch throws', async () => {
    // Arrange
    const fetcher = await buildModule('true');
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Act
    const results = await fetcher.fetch();

    // Assert
    expect(results).toEqual([]);
  });

  it('should return [] when API responds with non-ok status', async () => {
    // Arrange
    const fetcher = await buildModule('true');
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });

    // Act
    const results = await fetcher.fetch();

    // Assert
    expect(results).toEqual([]);
  });
});
