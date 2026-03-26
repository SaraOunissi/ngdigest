import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // All 6 routes prerendered at build time (both languages)
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
  // Catch-all (/, /resources, unknown langs → redirect to /fr)
  { path: '**', renderMode: RenderMode.Server },
];
