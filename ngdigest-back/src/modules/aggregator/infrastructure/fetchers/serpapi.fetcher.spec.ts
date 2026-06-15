import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SerpapiNewsFetcher } from './serpapi.fetcher.js';

jest.mock('serpapi', () => ({
  getJson: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getJson } = require('serpapi') as { getJson: jest.Mock };

const MOCK_API_KEY = 'test-api-key';

const MOCK_FRAMEWORK_RESPONSE = {
  organic_results: [
    {
      title: 'Angular framework 2026 best practices',
      link: 'https://angular.dev/guide/best-practices',
      date: '2026-03-01',
    },
    {
      title: 'Item without link',
      link: undefined,
    },
  ],
};

const MOCK_COMMUNITY_RESPONSE = {
  organic_results: [
    {
      title: 'Angular Signals in depth',
      link: 'https://dev.to/angular/signals-in-depth',
      date: '2026-02-28',
    },
  ],
};

const MOCK_FRENCH_RESPONSE = {
  organic_results: [
    {
      title: 'Angular en français sur Grafikart',
      link: 'https://grafikart.fr/angular-tutorial',
      date: '2026-03-01',
    },
  ],
};

const EMPTY = { organic_results: [] };

describe('SerpapiNewsFetcher', () => {
  let fetcher: SerpapiNewsFetcher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SerpapiNewsFetcher,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(MOCK_API_KEY),
          },
        },
      ],
    }).compile();

    fetcher = module.get<SerpapiNewsFetcher>(SerpapiNewsFetcher);
    getJson.mockReset();
  });

  it('should map framework search results to Resource shape', async () => {
    // Arrange — 3 calls run in parallel: framework, community, french
    getJson
      .mockResolvedValueOnce(MOCK_FRAMEWORK_RESPONSE)
      .mockResolvedValueOnce(EMPTY)
      .mockResolvedValueOnce(EMPTY);

    // Act
    const results = await fetcher.fetch();

    // Assert
    expect(results[0]).toMatchObject({
      title: 'Angular framework 2026 best practices',
      url: 'https://angular.dev/guide/best-practices',
      source: 'angular.dev',
      tags: ['angular', 'expert'],
      language: 'en',
      score: 0,
      isRead: false,
      isFavorite: false,
    });
    expect(results[0]?.publishedAt).toBeInstanceOf(Date);
  });

  it('should filter out results with no link', async () => {
    // Arrange
    getJson
      .mockResolvedValueOnce(MOCK_FRAMEWORK_RESPONSE)
      .mockResolvedValueOnce(EMPTY)
      .mockResolvedValueOnce(EMPTY);

    // Act
    const results = await fetcher.fetch();

    // Assert — only the valid item passes (one has no link)
    expect(results.length).toBe(1);
    expect(results[0]?.url).toBeDefined();
  });

  it('should map community search results to Resource shape', async () => {
    // Arrange
    getJson
      .mockResolvedValueOnce(EMPTY)
      .mockResolvedValueOnce(MOCK_COMMUNITY_RESPONSE)
      .mockResolvedValueOnce(EMPTY);

    // Act
    const results = await fetcher.fetch();

    // Assert
    expect(results[0]).toMatchObject({
      title: 'Angular Signals in depth',
      url: 'https://dev.to/angular/signals-in-depth',
      source: 'dev.to',
      tags: ['angular', 'community'],
      language: 'en',
    });
  });

  it('should map french community search results with language=fr', async () => {
    // Arrange
    getJson
      .mockResolvedValueOnce(EMPTY)
      .mockResolvedValueOnce(EMPTY)
      .mockResolvedValueOnce(MOCK_FRENCH_RESPONSE);

    // Act
    const results = await fetcher.fetch();

    // Assert
    expect(results[0]).toMatchObject({
      title: 'Angular en français sur Grafikart',
      url: 'https://grafikart.fr/angular-tutorial',
      source: 'grafikart.fr',
      tags: ['angular', 'french'],
      language: 'fr',
    });
  });

  it('should return [] for framework search if the call throws', async () => {
    // Arrange
    getJson
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(MOCK_COMMUNITY_RESPONSE)
      .mockResolvedValueOnce(EMPTY);

    // Act
    const results = await fetcher.fetch();

    // Assert — community results still returned
    expect(results.length).toBe(1);
    expect(results[0]?.tags).toContain('community');
  });

  it('should return [] for community search if the call throws', async () => {
    // Arrange
    getJson
      .mockResolvedValueOnce(MOCK_FRAMEWORK_RESPONSE)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(EMPTY);

    // Act
    const results = await fetcher.fetch();

    // Assert — expert-blog results still returned
    expect(results.length).toBe(1);
    expect(results[0]?.tags).toContain('expert');
  });

  it('should return [] when all calls throw', async () => {
    // Arrange
    getJson
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'));

    // Act
    const results = await fetcher.fetch();

    // Assert
    expect(results).toEqual([]);
  });
});
