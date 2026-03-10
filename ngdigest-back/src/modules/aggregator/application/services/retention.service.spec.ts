import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RetentionService } from './retention.service.js';
import { ResourceRepository } from '../../../resources/infrastructure/repositories/resource.repository.js';

const FIXED_NOW = new Date('2026-03-05T12:00:00.000Z');
const EXPECTED_14_DAYS_AGO = new Date(
  FIXED_NOW.getTime() - 14 * 24 * 60 * 60 * 1000,
);
const EXPECTED_60_DAYS_AGO = new Date(
  FIXED_NOW.getTime() - 60 * 24 * 60 * 60 * 1000,
);

describe('RetentionService', () => {
  let service: RetentionService;
  let resourceRepository: { archiveByRetentionRules: jest.Mock };

  beforeEach(async () => {
    resourceRepository = {
      archiveByRetentionRules: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetentionService,
        {
          provide: SchedulerRegistry,
          useValue: { addCronJob: jest.fn() },
        },
        {
          provide: ResourceRepository,
          useValue: resourceRepository,
        },
      ],
    }).compile();

    service = module.get<RetentionService>(RetentionService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call archiveByRetentionRules with correct cutoff dates', async () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(FIXED_NOW);

    // Act
    await service.cleanOldResources();

    // Assert
    expect(resourceRepository.archiveByRetentionRules).toHaveBeenCalledWith(
      EXPECTED_14_DAYS_AGO,
      EXPECTED_60_DAYS_AGO,
    );
  });

  it('should log the number of archived articles', async () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(FIXED_NOW);
    resourceRepository.archiveByRetentionRules.mockResolvedValue(7);
    const logSpy = jest.spyOn(service['logger'], 'log');

    // Act
    await service.cleanOldResources();

    // Assert
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('7 articles archived'),
    );
  });

  it('should log 0 archived when no articles match the policy', async () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(FIXED_NOW);
    resourceRepository.archiveByRetentionRules.mockResolvedValue(0);
    const logSpy = jest.spyOn(service['logger'], 'log');

    // Act
    await service.cleanOldResources();

    // Assert
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('0 articles archived'),
    );
  });
});
