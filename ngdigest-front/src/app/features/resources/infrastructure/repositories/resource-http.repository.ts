import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Resource } from '../../domain/models/resource.model';
import { environment } from '../../../../../environments/environment';

export interface PagedResources {
  resources: Resource[];
  total: number;
}

interface ApiResponse {
  data: Resource[];
  meta: { page: number; limit: number; total: number };
}

@Injectable({ providedIn: 'root' })
export class ResourceHttpRepository {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/resources`;

  getAll(lang: 'fr' | 'en' | 'all' = 'all', page = 1, limit = 20): Observable<PagedResources> {
    return this.httpClient
      .get<ApiResponse>(this.apiUrl, { params: { lang, page, limit } })
      .pipe(
        map(response => ({
          resources: response.data ?? [],
          total: response.meta?.total ?? 0,
        })),
      );
  }
}
