import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SourceSuggestion } from '../../domain/models/source.model';

interface SourcesApiResponse {
  data: string[];
}

interface SuggestApiResponse {
  data: { message: string };
}

@Injectable({ providedIn: 'root' })
export class SourcesHttpRepository {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sources`;

  getSources(): Observable<string[]> {
    return this.httpClient
      .get<SourcesApiResponse>(this.apiUrl)
      .pipe(map(response => response.data ?? []));
  }

  suggestSource(suggestion: SourceSuggestion): Observable<{ message: string }> {
    return this.httpClient
      .post<SuggestApiResponse>(`${this.apiUrl}/suggest`, suggestion)
      .pipe(map(response => response.data));
  }
}
