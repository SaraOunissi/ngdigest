import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SourcesHttpRepository } from '../../infrastructure/repositories/sources-http.repository';

@Injectable({ providedIn: 'root' })
export class GetSourcesUseCase {
  private readonly sourcesRepository = inject(SourcesHttpRepository);

  execute(): Observable<string[]> {
    return this.sourcesRepository.getSources();
  }
}
