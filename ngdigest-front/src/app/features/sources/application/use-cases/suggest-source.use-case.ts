import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SourcesHttpRepository } from '../../infrastructure/repositories/sources-http.repository';
import { SourceSuggestion } from '../../domain/models/source.model';

@Injectable({ providedIn: 'root' })
export class SuggestSourceUseCase {
  private readonly sourcesRepository = inject(SourcesHttpRepository);

  execute(suggestion: SourceSuggestion): Observable<{ message: string }> {
    return this.sourcesRepository.suggestSource(suggestion);
  }
}
