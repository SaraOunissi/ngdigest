import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface.js';

interface PaginatedResult {
  items: unknown;
  meta: { page: number; limit: number; total: number };
}

function isPaginatedResult(value: unknown): value is PaginatedResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    'meta' in value
  );
}

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((responseData) => {
        if (isPaginatedResult(responseData)) {
          return {
            data: responseData.items as T,
            meta: responseData.meta,
          };
        }

        return { data: responseData };
      }),
    );
  }
}
