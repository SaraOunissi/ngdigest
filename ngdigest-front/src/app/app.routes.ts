import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/presentation/pages/home/home';
import { ResourceListComponent } from './features/resources/presentation/pages/resource-list/resource-list';
import { CatalogComponent } from './features/catalog/presentation/pages/catalog/catalog';
import { CareerHubComponent } from './features/career/presentation/pages/career-hub/career-hub';
import { CertificationsComponent } from './features/career/certifications/presentation/pages/certifications/certifications';
import { FormationsComponent } from './features/career/formations/presentation/pages/formations/formations';
import { PlateformesComponent } from './features/career/plateformes/presentation/pages/plateformes/plateformes';
import { InterviewPrepComponent } from './features/career/interview/presentation/pages/interview-prep/interview-prep';
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
      { path: '', component: HomeComponent, pathMatch: 'full' },
      // Tech-watch feed (former home).
      { path: 'veille', component: ResourceListComponent },
      // Creators & blogs catalog (FR + EN slugs).
      { path: 'ressources', component: CatalogComponent },
      { path: 'resources', component: CatalogComponent },
      // Career hub + sub-pages (FR + EN slugs).
      { path: 'carriere', component: CareerHubComponent },
      { path: 'career', component: CareerHubComponent },
      { path: 'carriere/certifications', component: CertificationsComponent },
      { path: 'career/certifications', component: CertificationsComponent },
      { path: 'carriere/formations', component: FormationsComponent },
      { path: 'career/trainings', component: FormationsComponent },
      { path: 'carriere/plateformes', component: PlateformesComponent },
      { path: 'career/platforms', component: PlateformesComponent },
      { path: 'carriere/entretien', component: InterviewPrepComponent },
      { path: 'career/interview', component: InterviewPrepComponent },
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
