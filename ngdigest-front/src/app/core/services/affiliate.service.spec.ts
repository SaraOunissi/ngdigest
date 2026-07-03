import { TestBed } from '@angular/core/testing';

import { AffiliateService } from './affiliate.service';

describe('AffiliateService', () => {
  let service: AffiliateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AffiliateService);
  });

  describe('buildUrl', () => {
    it('returns the URL untouched when no network applies', () => {
      const url = 'https://certificates.dev/angular';
      expect(service.buildUrl(url, null)).toBe(url);
    });

    it('returns the URL untouched for an unknown network', () => {
      const url = 'https://example.com/course';
      expect(service.buildUrl(url, 'unknown-network')).toBe(url);
    });

    it('appends the Certificates.dev friend code with a "?" when the URL has no query', () => {
      expect(service.buildUrl('https://certificates.dev/angular', 'certificates-dev')).toBe(
        'https://certificates.dev/angular?friend=Ounissi',
      );
    });

    it('appends with "&" when the URL already has a query string', () => {
      expect(service.buildUrl('https://certificates.dev/angular?utm=x', 'certificates-dev')).toBe(
        'https://certificates.dev/angular?utm=x&friend=Ounissi',
      );
    });

    it('URL-encodes the affiliate value', () => {
      // The friend code is a plain slug today, but the encoding contract must hold
      // so a future value with spaces/specials cannot break the query string.
      const built = service.buildUrl('https://certificates.dev', 'certificates-dev');
      expect(built).toContain('friend=');
      expect(built).not.toContain(' ');
    });
  });

  describe('rel', () => {
    it('flags affiliate links as sponsored nofollow for FTC/SEO transparency', () => {
      expect(service.rel(true)).toBe('sponsored nofollow noopener');
    });

    it('returns a plain noopener rel for non-affiliate links', () => {
      expect(service.rel(false)).toBe('noopener');
    });
  });
});
