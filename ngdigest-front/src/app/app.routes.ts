import { Routes } from '@angular/router';
import { ResourceListComponent } from './features/resources/presentation/pages/resource-list/resource-list';
import { SourcesComponent } from './features/sources/sources.component';
import { AboutComponent } from './features/about/about.component';
import { BlogListComponent } from './features/blog/presentation/pages/blog-list/blog-list.component';
import { BlogPostComponent } from './features/blog/presentation/pages/blog-post/blog-post.component';
import { JobListComponent } from './features/jobs/presentation/pages/job-list/job-list.component';
import { JobDetailComponent } from './features/jobs/presentation/pages/job-detail/job-detail.component';
import { LegalNoticeComponent } from './features/legal/presentation/legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './features/legal/presentation/privacy-policy/privacy-policy.component';
import { langGuard } from './core/guards/lang.guard';
import { langResolver } from './core/resolvers/lang.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'fr', pathMatch: 'full' },
  // 301-equivalent redirect for old /resources URL
  { path: 'resources', redirectTo: 'fr', pathMatch: 'full' },
  {
    path: ':lang',
    canActivate: [langGuard],
    resolve: { lang: langResolver },
    children: [
      { path: '', component: ResourceListComponent, pathMatch: 'full' },
      // Redirect /fr/resources → /fr (and /en/resources → /en)
      { path: 'resources', redirectTo: '', pathMatch: 'full' },
      { path: 'sources', component: SourcesComponent },
      { path: 'about', component: AboutComponent },
      { path: 'blog', component: BlogListComponent },
      { path: 'blog/:slug', component: BlogPostComponent },
      { path: 'jobs', component: JobListComponent },
      { path: 'jobs/:slug', component: JobDetailComponent },
      // Legal pages — FR slugs
      { path: 'mentions-legales', component: LegalNoticeComponent },
      { path: 'politique-confidentialite', component: PrivacyPolicyComponent },
      // Legal pages — EN slugs
      { path: 'legal-notice', component: LegalNoticeComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
    ],
  },
  { path: '**', redirectTo: 'fr' },
];
