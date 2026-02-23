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
    });
    expect(result.items).toEqual(mockResources);
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 2 });
  });

  it('should forward custom query parameters', async () => {
    // Arrange
    mockRepository.findPaginated.mockResolvedValue([[], 0]);

    // Act
    await useCase.execute({ page: 3, limit: 10, source: 'Angular Blog', sort: 'score' });

    // Assert
    expect(mockRepository.findPaginated).toHaveBeenCalledWith({
      page: 3,
      limit: 10,
      source: 'Angular Blog',
      sort: 'score',
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
});

function createMockResource(title: string): Resource {
  const resource = new Resource();
  resource.title = title;
  resource.url = `https://example.com/${title.toLowerCase().replace(/\s/g, '-')}`;
  resource.source = 'Test Source';
  resource.publishedAt = new Date('2025-01-01');
  resource.score = 0;
  resource.tags = [];
  resource.isRead = false;
  resource.isFavorite = false;
  return resource;
}
