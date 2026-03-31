import { RenderMode, ServerRoute } from '@angular/ssr';

import { BLOG_DATA } from './features/blog/infrastructure/blog-data.generated';

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
  // Blog post pages — derived automatically from the generated article index
  {
    path: ':lang/blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () =>
      Promise.resolve(
        BLOG_DATA.map((article) => ({ lang: article.lang, slug: article.slug })),
      ),
  },
  // Catch-all (/, /resources, unknown langs → redirect to /fr)
  { path: '**', renderMode: RenderMode.Server },
];
