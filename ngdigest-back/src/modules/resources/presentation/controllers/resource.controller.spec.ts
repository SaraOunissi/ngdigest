import { ResourceController } from './resource.controller.js';
import { GetResourcesUseCase } from '../../application/use-cases/get-resources.use-case.js';
import { RedetectLanguagesUseCase } from '../../application/use-cases/redetect-languages.use-case.js';
import { Resource } from '../../domain/entities/resource.entity.js';

describe('ResourceController', () => {
  let controller: ResourceController;
  let mockUseCase: jest.Mocked<GetResourcesUseCase>;
  let mockRedetectUseCase: jest.Mocked<RedetectLanguagesUseCase>;

  beforeEach(() => {
    mockUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetResourcesUseCase>;

    mockRedetectUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RedetectLanguagesUseCase>;

    controller = new ResourceController(mockUseCase, mockRedetectUseCase);
  });

  describe('findAll', () => {
    it('should delegate to GetResourcesUseCase and return result', async () => {
      // Arrange
      const mockResource = new Resource();
      mockResource.title = 'Test Resource';
      mockResource.url = 'https://example.com';
      mockResource.source = 'Test';
      mockResource.publishedAt = new Date();
      mockResource.score = 0;
      mockResource.tags = [];
      mockResource.isRead = false;
      mockResource.isFavorite = false;

      const expectedResult = {
        items: [mockResource],
        meta: { page: 1, limit: 20, total: 1 },
      };
      mockUseCase.execute.mockResolvedValue(expectedResult);

      const query = { page: 1, limit: 20, sort: '-publishedAt' };

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(mockUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('should forward query parameters to use case', async () => {
      // Arrange
      mockUseCase.execute.mockResolvedValue({
        items: [],
        meta: { page: 2, limit: 10, total: 0 },
      });

      const query = { page: 2, limit: 10, source: 'Angular Blog', sort: 'score', lang: 'fr' as const };

      // Act
      await controller.findAll(query);

      // Assert
      expect(mockUseCase.execute).toHaveBeenCalledWith(query);
    });
  });
});
