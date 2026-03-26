import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static pages — prerendered at build time (both languages)
  {
    path: ':lang',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([{ lang: 'fr' }, { lang: 'en' }]),
  },
  {
    path: ':lang/sources',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([{ lang: 'fr' }, { lang: 'en' }]),
  },
  {
    path: ':lang/about',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([{ lang: 'fr' }, { lang: 'en' }]),
  },
  // Blog list pages
  {
    path: ':lang/blog',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([{ lang: 'fr' }, { lang: 'en' }]),
  },
  // Blog post pages — list every known article slug explicitly
  {
    path: ':lang/blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () =>
      Promise.resolve([
        { lang: 'fr', slug: 'tjm-developpeur-angular-2026' },
        { lang: 'en', slug: 'angular-developer-daily-rate-2026' },
      ]),
  },
  // Catch-all (/, /resources, unknown langs → redirect to /fr)
  { path: '**', renderMode: RenderMode.Server },
];
