import { AllExceptionsFilter } from './all-exceptions.filter.js';
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle HttpException with correct status and message', () => {
    // Arrange
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    // Act
    filter.catch(exception, mockHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: 'Not Found',
        code: 'NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      },
    });
  });

  it('should handle unknown exceptions as 500 Internal Server Error', () => {
    // Arrange
    const exception = new Error('Something broke');

    // Act
    filter.catch(exception, mockHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    });
  });

  it('should handle HttpException with object response (validation errors)', () => {
    // Arrange
    const exception = new HttpException(
      { message: ['field must not be empty', 'field must be a string'] },
      HttpStatus.BAD_REQUEST,
    );

    // Act
    filter.catch(exception, mockHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: 'field must not be empty, field must be a string',
        code: 'BAD_REQUEST',
        statusCode: HttpStatus.BAD_REQUEST,
      },
    });
  });
});
