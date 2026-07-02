import { CreateSuggestionUseCase } from './create-suggestion.use-case.js';
import { SuggestionRepository } from '../../infrastructure/repositories/suggestion.repository.js';
import { SuggestSourceDto } from '../../presentation/dtos/suggest-source.dto.js';

describe('CreateSuggestionUseCase', () => {
  let useCase: CreateSuggestionUseCase;
  let mockRepository: jest.Mocked<SuggestionRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<SuggestionRepository>;

    useCase = new CreateSuggestionUseCase(mockRepository);
  });

  it('persists the suggestion via the repository', async () => {
    // Arrange
    const dto: SuggestSourceDto = { url: 'https://example.com/blog', reason: 'Great Angular content' };
    mockRepository.create.mockResolvedValue(undefined as never);

    // Act
    await useCase.execute(dto);

    // Assert
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
  });

  it('propagates repository errors instead of swallowing them', async () => {
    // Arrange
    const dto: SuggestSourceDto = { url: 'https://example.com/blog' };
    mockRepository.create.mockRejectedValue(new Error('db down'));

    // Act + Assert
    await expect(useCase.execute(dto)).rejects.toThrow('db down');
  });
});
