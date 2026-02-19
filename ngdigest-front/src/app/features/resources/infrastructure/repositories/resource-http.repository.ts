import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resource } from '../../domain/models/resource.model';

@Injectable({ providedIn: 'root' })
export class ResourceHttpRepository {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/resources';

  getAll(): Observable<Resource[]> {
    return this.httpClient.get<Resource[]>(this.apiUrl);
  }
}
