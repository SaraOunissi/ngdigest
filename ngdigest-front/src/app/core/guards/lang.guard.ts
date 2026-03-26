import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const langGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const lang = route.paramMap.get('lang');

  if (lang === 'fr' || lang === 'en') return true;

  // Unknown lang segment — redirect to /fr, preserving the rest of the path
  const segments = state.url.split('/').filter(Boolean);
  const rest = segments.slice(1).join('/');
  return router.createUrlTree(['/fr', ...(rest ? [rest] : [])]);
};
