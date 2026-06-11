import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AnalyticsService } from './analytics.service';

const GA_ID = 'G-6MGV02JE0R';
const GTAG_SCRIPT_ID = 'gtag-script';
const CONSENT_KEY = 'cookie_consent';

interface GtagTestWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

function dataLayer(): unknown[] {
  return (window as GtagTestWindow).dataLayer ?? [];
}

// gtag.js pushes the `arguments` object (array-like), NOT a real Array -- which is
// exactly what loadGtag now does (see the analytics.service.ts fix). We normalize
// each entry to a real array before filtering, instead of requiring Array.isArray
// (which would reject the `arguments` objects and hide the real runtime behaviour).
function asArrayLike(entry: unknown): unknown[] | null {
  if (entry === null || typeof entry !== 'object') return null;
  const length = (entry as { length?: unknown }).length;
  if (typeof length !== 'number') return null;
  return Array.from(entry as ArrayLike<unknown>);
}

function eventsOfType(predicate: (entry: unknown[]) => boolean): unknown[][] {
  return dataLayer()
    .map(asArrayLike)
    .filter((entry): entry is unknown[] => entry !== null && predicate(entry));
}

function configEvents(): unknown[][] {
  return eventsOfType(entry => entry[0] === 'config');
}

function pageViewEvents(): unknown[][] {
  return eventsOfType(entry => entry[0] === 'event' && entry[1] === 'page_view');
}

function resetGtagSideEffects(): void {
  const win = window as GtagTestWindow;
  delete win.dataLayer;
  delete win.gtag;
  document.getElementById(GTAG_SCRIPT_ID)?.remove();
  localStorage.removeItem(CONSENT_KEY);
}

function createService(): AnalyticsService {
  TestBed.configureTestingModule({
    providers: [provideRouter([])],
  });
  return TestBed.inject(AnalyticsService);
}

describe('AnalyticsService', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    resetGtagSideEffects();
  });

  afterEach(() => {
    resetGtagSideEffects();
  });

  describe('consent already accepted at boot', () => {
    beforeEach(() => {
      localStorage.setItem(CONSENT_KEY, 'accepted');
    });

    it('loads gtag with send_page_view: false so the router NavigationEnd does not produce a duplicate page_view', () => {
      createService();

      const configs = configEvents();
      expect(configs).toHaveLength(1);
      expect(configs[0]).toEqual(['config', GA_ID, { send_page_view: false }]);
    });

    it('does not emit a page_view on boot (the router subscription owns that)', () => {
      createService();

      expect(pageViewEvents()).toHaveLength(0);
    });
  });

  describe('accept()', () => {
    it('loads gtag AND emits a page_view for the current URL (so a session that consents mid-page is captured)', () => {
      const service = createService();
      const router = TestBed.inject(Router);

      service.accept();

      const configs = configEvents();
      expect(configs).toHaveLength(1);
      expect(configs[0]).toEqual(['config', GA_ID, { send_page_view: false }]);

      const pageViews = pageViewEvents();
      expect(pageViews).toHaveLength(1);
      expect(pageViews[0]).toEqual(['event', 'page_view', { page_path: router.url }]);
    });

    it('persists the accepted state to localStorage', () => {
      const service = createService();

      service.accept();

      expect(localStorage.getItem(CONSENT_KEY)).toBe('accepted');
      expect(service.consentStatus()).toBe('accepted');
    });
  });

  describe('refuse()', () => {
    it('does not load gtag and does not emit any event', () => {
      const service = createService();

      service.refuse();

      expect(document.getElementById(GTAG_SCRIPT_ID)).toBeNull();
      expect(configEvents()).toHaveLength(0);
      expect(pageViewEvents()).toHaveLength(0);
      expect(localStorage.getItem(CONSENT_KEY)).toBe('refused');
    });
  });

  describe('trackPageView()', () => {
    it('early-returns when consent is pending', () => {
      const service = createService();

      service.trackPageView('/somewhere');

      expect(pageViewEvents()).toHaveLength(0);
    });

    it('early-returns when consent is refused', () => {
      const service = createService();
      service.refuse();

      service.trackPageView('/somewhere');

      expect(pageViewEvents()).toHaveLength(0);
    });

    it('emits a page_view when consent is accepted', () => {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      const service = createService();

      service.trackPageView('/blog/foo');

      const pageViews = pageViewEvents();
      expect(pageViews).toHaveLength(1);
      expect(pageViews[0]).toEqual(['event', 'page_view', { page_path: '/blog/foo' }]);
    });
  });
});
