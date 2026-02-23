import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Resource } from '../../domain/models/resource.model';

interface ApiResponse<T> {
  data: T;
  meta?: { page: number; limit: number; total: number };
}

@Injectable({ providedIn: 'root' })
export class ResourceHttpRepository {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/resources';

  getAll(): Observable<Resource[]> {
    return this.httpClient
      .get<ApiResponse<Resource[]>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }
}
