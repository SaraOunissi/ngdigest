import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ResourceHttpRepository } from '../../../infrastructure/repositories/resource-http.repository';
import { Resource } from '../../../domain/models/resource.model';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.html',
  styleUrl: './resource-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceListComponent implements OnInit {
  private readonly resourceRepository = inject(ResourceHttpRepository);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly resources = signal<Resource[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadResources();
  }

  private loadResources(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.resourceRepository
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resources) => {
          this.resources.set(resources);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Impossible de charger les ressources.');
          this.isLoading.set(false);
        },
      });
  }
}
