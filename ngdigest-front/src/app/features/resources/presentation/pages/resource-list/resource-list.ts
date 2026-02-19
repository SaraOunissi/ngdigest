import { Component, inject, OnInit, signal } from '@angular/core';
import { ResourceHttpRepository } from '../../../infrastructure/repositories/resource-http.repository';
import { Resource } from '../../../domain/models/resource.model';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.html',
  styleUrl: './resource-list.scss',
})
export class ResourceListComponent implements OnInit {
  private readonly resourceRepository = inject(ResourceHttpRepository);

  protected readonly resources = signal<Resource[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadResources();
  }

  private loadResources(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.resourceRepository.getAll().subscribe({
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
