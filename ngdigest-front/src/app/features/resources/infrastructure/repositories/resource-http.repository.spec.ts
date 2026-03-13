import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Resource } from '../../domain/models/resource.model';
import { ResourceHttpRepository } from './resource-http.repository';
import { environment } from '../../../../../environments/environment';

const API_URL = `${environment.apiUrl}/resources`;

const MOCK_RESOURCE: Resource = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Introduction to Angular Signals',
  url: 'https://blog.angular.dev/signals',
  source: 'Angular Blog',
  publishedAt: '2025-12-01T10:00:00.000Z',
  score: 42,
  tags: ['angular', 'signals'],
  isRead: false,
  isFavorite: false,
  pinned: false,
  archivedAt: null,
  language: 'en',
};

describe('ResourceHttpRepository', () => {
  let repository: ResourceHttpRepository;
  let httpController: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    repository = TestBed.inject(ResourceHttpRepository);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  describe('search param', () => {
    it('should not include search param when search is undefined', () => {
      repository.getAll('en', 1, 20).subscribe();

      const req = httpController.expectOne(r => r.url === API_URL);
      expect(req.request.params.has('search')).toBe(false);
      req.flush({ data: [], meta: { page: 1, limit: 20, total: 0 } });
    });

    it('should not include search param when search is an empty string', () => {
      repository.getAll('en', 1, 20, '').subscribe();

      const req = httpController.expectOne(r => r.url === API_URL);
      expect(req.request.params.has('search')).toBe(false);
      req.flush({ data: [], meta: { page: 1, limit: 20, total: 0 } });
    });

    it('should include search param when search has a value', () => {
      repository.getAll('en', 1, 20, 'signals').subscribe();

      const req = httpController.expectOne(r => r.url === API_URL);
      expect(req.request.params.get('search')).toBe('signals');
      req.flush({ data: [], meta: { page: 1, limit: 20, total: 0 } });
    });

    it('should pass lang, page and limit alongside search', () => {
      repository.getAll('fr', 2, 10, 'standalone').subscribe();

      const req = httpController.expectOne(r => r.url === API_URL);
      expect(req.request.params.get('lang')).toBe('fr');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('10');
      expect(req.request.params.get('search')).toBe('standalone');
      req.flush({ data: [], meta: { page: 2, limit: 10, total: 0 } });
    });
  });

  describe('response mapping', () => {
    it('should map data array and total from the API response', () => {
      let result: { resources: Resource[]; total: number } | undefined;
      repository.getAll().subscribe(r => (result = r));

      httpController
        .expectOne(r => r.url === API_URL)
        .flush({ data: [MOCK_RESOURCE], meta: { page: 1, limit: 20, total: 1 } });

      expect(result?.resources).toEqual([MOCK_RESOURCE]);
      expect(result?.total).toBe(1);
    });

    it('should return empty resources and zero total when data is missing', () => {
      let result: { resources: Resource[]; total: number } | undefined;
      repository.getAll().subscribe(r => (result = r));

      httpController
        .expectOne(r => r.url === API_URL)
        .flush({ data: null, meta: { page: 1, limit: 20, total: 0 } });

      expect(result?.resources).toEqual([]);
      expect(result?.total).toBe(0);
    });
  });
});
