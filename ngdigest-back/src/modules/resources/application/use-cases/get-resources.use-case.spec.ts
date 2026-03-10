import { GetResourcesUseCase } from './get-resources.use-case.js';
import { ResourceRepository } from '../../infrastructure/repositories/resource.repository.js';
import { Resource } from '../../domain/entities/resource.entity.js';

describe('GetResourcesUseCase', () => {
  let useCase: GetResourcesUseCase;
  let mockRepository: jest.Mocked<ResourceRepository>;

  beforeEach(() => {
    mockRepository = {
      findPaginated: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<ResourceRepository>;

    useCase = new GetResourcesUseCase(mockRepository);
  });

  it('should return paginated resources with default parameters', async () => {
    // Arrange
    const mockResources = [createMockResource('Resource 1'), createMockResource('Resource 2')];
    mockRepository.findPaginated.mockResolvedValue([mockResources, 2]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockRepository.findPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      source: undefined,
      sort: '-publishedAt',
      lang: 'all',
    });
    expect(result.items).toHaveLength(2);
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 2 });
  });

  it('should forward custom query parameters including lang', async () => {
    // Arrange
    mockRepository.findPaginated.mockResolvedValue([[], 0]);

    // Act
    await useCase.execute({ page: 3, limit: 10, source: 'Angular Blog', sort: 'score', lang: 'en' });

    // Assert
    expect(mockRepository.findPaginated).toHaveBeenCalledWith({
      page: 3,
      limit: 10,
      source: 'Angular Blog',
      sort: 'score',
      lang: 'en',
    });
  });

  it('should return correct meta with total count', async () => {
    // Arrange
    const mockResources = [createMockResource('Resource 1')];
    mockRepository.findPaginated.mockResolvedValue([mockResources, 50]);

    // Act
    const result = await useCase.execute({ page: 2, limit: 5 });

    // Assert
    expect(result.meta).toEqual({ page: 2, limit: 5, total: 50 });
    expect(result.items).toHaveLength(1);
  });

  it('should return empty items when no resources found', async () => {
    // Arrange
    mockRepository.findPaginated.mockResolvedValue([[], 0]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.items).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should set highlighted=true on FR resources when lang=fr', async () => {
    // Arrange
    const frResource = createMockResource('FR Resource', 'fr');
    const enResource = createMockResource('EN Resource', 'en');
    mockRepository.findPaginated.mockResolvedValue([[frResource, enResource], 2]);

    // Act
    const result = await useCase.execute({ lang: 'fr' });

    // Assert
    expect(result.items[0]?.highlighted).toBe(true);
    expect(result.items[1]?.highlighted).toBeUndefined();
  });

  it('should not set highlighted when lang=all', async () => {
    // Arrange
    const frResource = createMockResource('FR Resource', 'fr');
    mockRepository.findPaginated.mockResolvedValue([[frResource], 1]);

    // Act
    const result = await useCase.execute({ lang: 'all' });

    // Assert
    expect(result.items[0]?.highlighted).toBeUndefined();
  });
});

function createMockResource(
  title: string,
  language: 'fr' | 'en' | 'unknown' = 'en',
): Resource {
  const resource = new Resource();
  resource.title = title;
  resource.url = `https://example.com/${title.toLowerCase().replace(/\s/g, '-')}`;
  resource.source = 'Test Source';
  resource.publishedAt = new Date('2025-01-01');
  resource.score = 0;
  resource.tags = [];
  resource.isRead = false;
  resource.isFavorite = false;
  resource.language = language;
  return resource;
}
