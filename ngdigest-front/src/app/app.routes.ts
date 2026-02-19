import { Routes } from '@angular/router';
import { ResourceListComponent } from './features/resources/presentation/pages/resource-list/resource-list';

export const routes: Routes = [
  { path: '', redirectTo: 'resources', pathMatch: 'full' },
  { path: 'resources', component: ResourceListComponent },
];
