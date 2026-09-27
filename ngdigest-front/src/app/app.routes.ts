import { Routes } from '@angular/router';
import { langGuard } from './core/guards/lang.guard';
import { langResolver } from './core/resolvers/lang.resolver';

// by project-worker 2026-09-04 — q178 (lazy-load)
// Every page component is now loaded with `loadComponent` instead of a
// top-level `import` + `component:`. Before this change the 19 page
// components (and their templates + component styles) were all pulled into
// the initial browser bundle, because a static import at the top of the
// routes file is reachable from `main.ts` on every route.
// Prerendering is unaffected: `app.routes.server.ts` keeps the same paths,
// and the SSR renderer awaits the dynamic import like the browser does.

export const routes: Routes = [
  { path: '', redirectTo: 'fr', pathMatch: 'full' },
  // Legacy /resources URL (pre-language-prefix root) → new home.
  // Note: langGuard also catches it as an unknown lang and lands on /fr,
  // so this keeps both paths consistent.
  { path: 'resources', redirectTo: 'fr', pathMatch: 'full' },
  {
    path: ':lang',
    canActivate: [langGuard],
    resolve: { lang: langResolver },
    children: [
      // New career-copilot home.
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/presentation/pages/home/home').then((m) => m.HomeComponent),
      },
      // Tech-watch feed (former home).
      {
        path: 'veille',
        loadComponent: () =>
          import('./features/resources/presentation/pages/resource-list/resource-list').then(
            (m) => m.ResourceListComponent
          ),
      },
      // Creators & blogs catalog (FR + EN slugs).
      {
        path: 'ressources',
        loadComponent: () =>
          import('./features/catalog/presentation/pages/catalog/catalog').then(
            (m) => m.CatalogComponent
          ),
      },
      {
        path: 'resources',
        loadComponent: () =>
          import('./features/catalog/presentation/pages/catalog/catalog').then(
            (m) => m.CatalogComponent
          ),
      },
      // Career hub + sub-pages (FR + EN slugs).
      {
        path: 'carriere',
        loadComponent: () =>
          import('./features/career/presentation/pages/career-hub/career-hub').then(
            (m) => m.CareerHubComponent
          ),
      },
      {
        path: 'career',
        loadComponent: () =>
          import('./features/career/presentation/pages/career-hub/career-hub').then(
            (m) => m.CareerHubComponent
          ),
      },
      {
        path: 'carriere/guide',
        loadComponent: () =>
          import('./features/career/guide/presentation/pages/guide/guide').then(
            (m) => m.GuideComponent
          ),
      },
      {
        path: 'career/guide',
        loadComponent: () =>
          import('./features/career/guide/presentation/pages/guide/guide').then(
            (m) => m.GuideComponent
          ),
      },
      {
        path: 'carriere/certifications',
        loadComponent: () =>
          import('./features/career/certifications/presentation/pages/certifications/certifications').then(
            (m) => m.CertificationsComponent
          ),
      },
      {
        path: 'career/certifications',
        loadComponent: () =>
          import('./features/career/certifications/presentation/pages/certifications/certifications').then(
            (m) => m.CertificationsComponent
          ),
      },
      {
        path: 'carriere/formations',
        loadComponent: () =>
          import('./features/career/formations/presentation/pages/formations/formations').then(
            (m) => m.FormationsComponent
          ),
      },
      {
        path: 'career/trainings',
        loadComponent: () =>
          import('./features/career/formations/presentation/pages/formations/formations').then(
            (m) => m.FormationsComponent
          ),
      },
      {
        path: 'carriere/plateformes',
        loadComponent: () =>
          import('./features/career/plateformes/presentation/pages/plateformes/plateformes').then(
            (m) => m.PlateformesComponent
          ),
      },
      {
        path: 'career/platforms',
        loadComponent: () =>
          import('./features/career/plateformes/presentation/pages/plateformes/plateformes').then(
            (m) => m.PlateformesComponent
          ),
      },
      {
        path: 'carriere/entretien',
        loadComponent: () =>
          import('./features/career/interview/presentation/pages/interview-prep/interview-prep').then(
            (m) => m.InterviewPrepComponent
          ),
      },
      {
        path: 'career/interview',
        loadComponent: () =>
          import('./features/career/interview/presentation/pages/interview-prep/interview-prep').then(
            (m) => m.InterviewPrepComponent
          ),
      },
      {
        path: 'carriere/observatoire',
        loadComponent: () =>
          import('./features/career/observatoire/presentation/pages/observatoire/observatoire').then(
            (m) => m.ObservatoireComponent
          ),
      },
      {
        path: 'career/observatory',
        loadComponent: () =>
          import('./features/career/observatoire/presentation/pages/observatoire/observatoire').then(
            (m) => m.ObservatoireComponent
          ),
      },
      // by project-worker 2026-08-21 — q176
      {
        path: 'carriere/toolkit',
        loadComponent: () =>
          import('./features/career/toolkit/presentation/pages/toolkit/toolkit').then(
            (m) => m.ToolkitComponent
          ),
      },
      {
        path: 'career/toolkit',
        loadComponent: () =>
          import('./features/career/toolkit/presentation/pages/toolkit/toolkit').then(
            (m) => m.ToolkitComponent
          ),
      },
      {
        path: 'sources',
        loadComponent: () =>
          import('./features/sources/sources.component').then((m) => m.SourcesComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./features/blog/presentation/pages/blog-list/blog-list.component').then(
            (m) => m.BlogListComponent
          ),
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import('./features/blog/presentation/pages/blog-post/blog-post.component').then(
            (m) => m.BlogPostComponent
          ),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/presentation/pages/job-list/job-list.component').then(
            (m) => m.JobListComponent
          ),
      },
      {
        path: 'jobs/:slug',
        loadComponent: () =>
          import('./features/jobs/presentation/pages/job-detail/job-detail.component').then(
            (m) => m.JobDetailComponent
          ),
      },
      // Legal pages — FR slugs
      {
        path: 'mentions-legales',
        loadComponent: () =>
          import('./features/legal/presentation/legal-notice/legal-notice.component').then(
            (m) => m.LegalNoticeComponent
          ),
      },
      {
        path: 'politique-confidentialite',
        loadComponent: () =>
          import('./features/legal/presentation/privacy-policy/privacy-policy.component').then(
            (m) => m.PrivacyPolicyComponent
          ),
      },
      // Legal pages — EN slugs
      {
        path: 'legal-notice',
        loadComponent: () =>
          import('./features/legal/presentation/legal-notice/legal-notice.component').then(
            (m) => m.LegalNoticeComponent
          ),
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./features/legal/presentation/privacy-policy/privacy-policy.component').then(
            (m) => m.PrivacyPolicyComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'fr' },
];
