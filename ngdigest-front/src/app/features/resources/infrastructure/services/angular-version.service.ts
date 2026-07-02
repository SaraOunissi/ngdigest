import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

/**
 * Fetches the latest Angular release tag from the public GitHub API, used for
 * the version badge on the tech-watch page.
 *
 * Best-effort: any failure (offline, GitHub rate limit) is caught here and
 * degraded to `null` so the caller simply hides the badge. The error is handled
 * at this boundary rather than swallowed inside the component — which also keeps
 * the component free of direct HTTP calls (DDD: infrastructure owns I/O).
 */
@Injectable({ providedIn: 'root' })
export class AngularVersionService {
  private static readonly LATEST_RELEASE_URL =
    'https://api.github.com/repos/angular/angular/releases/latest';

  private readonly http = inject(HttpClient);

  /** Emits the latest Angular release tag (e.g. `21.2.6`), or `null` if unavailable. */
  getLatestVersion(): Observable<string | null> {
    return this.http
      .get<{ tag_name: string }>(AngularVersionService.LATEST_RELEASE_URL)
      .pipe(
        map((release) => release.tag_name),
        catchError(() => of(null)),
      );
  }
}
