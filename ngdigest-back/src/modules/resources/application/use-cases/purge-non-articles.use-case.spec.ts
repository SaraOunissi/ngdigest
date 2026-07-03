import { PurgeNonArticlesUseCase } from './purge-non-articles.use-case.js';
import { ResourceRepository } from '../../infrastructure/repositories/resource.repository.js';
import { Resource } from '../../domain/entities/resource.entity.js';

describe('PurgeNonArticlesUseCase', () => {
  let useCase: PurgeNonArticlesUseCase;
  let mockRepository: jest.Mocked<ResourceRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      archiveByIds: jest.fn(),
    } as unknown as jest.Mocked<ResourceRepository>;

    useCase = new PurgeNonArticlesUseCase(mockRepository);
  });

  it('archives active non-article pages and leaves real articles untouched', async () => {
    // Arrange
    const resources = [
      mockResource('a1', 'https://blog.angular.dev/angular-21-signals-guide', 'Angular 21 Signals Guide'),
      mockResource('a2', 'https://blog.angular.dev/latest', 'Latest'), // listing page
      mockResource('a3', 'https://blog.angular.dev/tag/rxjs', 'RxJS'), // tag page
    ];
    mockRepository.findAll.mockResolvedValue(resources);
    mockRepository.archiveByIds.mockResolvedValue(2);

    // Act
    const result = await useCase.execute();

    // Assert — only the two non-article pages are archived, by id.
    expect(mockRepository.archiveByIds).toHaveBeenCalledWith(['a2', 'a3']);
    expect(result).toEqual({ archived: 2, total: 3 });
  });

  it('skips resources that are already archived', async () => {
    // Arrange — a non-article that is already archived must not be re-archived.
    const resources = [
      mockResource('a1', 'https://blog.angular.dev/latest', 'Latest', new Date('2026-01-01')),
      mockResource('a2', 'https://blog.angular.dev/tag/rxjs', 'RxJS'),
    ];
    mockRepository.findAll.mockResolvedValue(resources);
    mockRepository.archiveByIds.mockResolvedValue(1);

    // Act
    await useCase.execute();

    // Assert
    expect(mockRepository.archiveByIds).toHaveBeenCalledWith(['a2']);
  });

  it('archives nothing when every active resource is a real article', async () => {
    // Arrange
    const resources = [
      mockResource('a1', 'https://blog.angular.dev/signals-in-depth', 'Signals in depth'),
    ];
    mockRepository.findAll.mockResolvedValue(resources);
    mockRepository.archiveByIds.mockResolvedValue(0);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockRepository.archiveByIds).toHaveBeenCalledWith([]);
    expect(result).toEqual({ archived: 0, total: 1 });
  });
});

/** A Resource stub with just the fields the use case reads. */
function mockResource(
  id: string,
  url: string,
  title: string,
  archivedAt: Date | null = null,
): Resource {
  return { _id: id, url, title, archivedAt } as unknown as Resource;
}
