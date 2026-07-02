import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AdminGuard } from './admin.guard.js';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockConfigService: jest.Mocked<ConfigService>;

  /** Builds an ExecutionContext whose request carries the given admin key header. */
  function contextWithKey(key: string | undefined): ExecutionContext {
    const request = { headers: key === undefined ? {} : { 'x-admin-key': key } };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    mockConfigService = { get: jest.fn() } as unknown as jest.Mocked<ConfigService>;
    guard = new AdminGuard(mockConfigService);
  });

  it('allows the request when the header matches ADMIN_SECRET', () => {
    // Arrange
    mockConfigService.get.mockReturnValue('s3cret');

    // Act + Assert
    expect(guard.canActivate(contextWithKey('s3cret'))).toBe(true);
  });

  it('rejects when the provided key does not match', () => {
    // Arrange
    mockConfigService.get.mockReturnValue('s3cret');

    // Act + Assert
    expect(() => guard.canActivate(contextWithKey('wrong'))).toThrow(UnauthorizedException);
  });

  it('rejects when no key header is present', () => {
    // Arrange
    mockConfigService.get.mockReturnValue('s3cret');

    // Act + Assert
    expect(() => guard.canActivate(contextWithKey(undefined))).toThrow(UnauthorizedException);
  });

  it('rejects (fails closed) when ADMIN_SECRET is not configured', () => {
    // Arrange — no secret set on the server side.
    mockConfigService.get.mockReturnValue(undefined);

    // Act + Assert — even an empty provided key must not open the door.
    expect(() => guard.canActivate(contextWithKey(undefined))).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(contextWithKey(''))).toThrow(UnauthorizedException);
  });
});
