import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from './../src/app.setup';
import { ApiErrorResponse } from './../src/common/interfaces/api-response.interface';
import { ResourceController } from './../src/modules/resources/presentation/controllers/resource.controller';
import { GetResourcesUseCase } from './../src/modules/resources/application/use-cases/get-resources.use-case';
import { RedetectLanguagesUseCase } from './../src/modules/resources/application/use-cases/redetect-languages.use-case';
import { PurgeNonArticlesUseCase } from './../src/modules/resources/application/use-cases/purge-non-articles.use-case';

const ADMIN_KEY = 'test-admin-key';
const RESOURCE_PAGE = {
  items: [{ title: 'Angular Signals in practice' }],
  meta: { page: 1, limit: 20, total: 1 },
};

/**
 * Exercises the real HTTP pipeline (prefix, validation, response envelope,
 * error filter, admin guard) with the use cases mocked, so no database is needed.
 */
describe('Resources API (e2e)', () => {
  let app: INestApplication<App>;
  const getResources = { execute: jest.fn() };
  const redetectLanguages = { execute: jest.fn() };
  const purgeNonArticles = { execute: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    getResources.execute.mockResolvedValue(RESOURCE_PAGE);
    purgeNonArticles.execute.mockResolvedValue({ archived: 2, total: 10 });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ResourceController],
      providers: [
        { provide: GetResourcesUseCase, useValue: getResources },
        { provide: RedetectLanguagesUseCase, useValue: redetectLanguages },
        { provide: PurgeNonArticlesUseCase, useValue: purgeNonArticles },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'ADMIN_SECRET' ? ADMIN_KEY : undefined,
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/resources wraps the page in { data, meta } and applies query defaults', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/resources')
      .expect(200);

    expect(response.body).toEqual({
      data: RESOURCE_PAGE.items,
      meta: RESOURCE_PAGE.meta,
    });
    expect(getResources.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        lang: 'all',
        sort: '-publishedAt',
      }),
    );
  });

  it('GET /api/resources converts numeric query params', async () => {
    await request(app.getHttpServer())
      .get('/api/resources?page=2&limit=5&lang=fr')
      .expect(200);

    expect(getResources.execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5, lang: 'fr' }),
    );
  });

  it('GET /api/resources rejects an unsupported language with 400', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/resources?lang=de')
      .expect(400);

    const body = response.body as ApiErrorResponse;
    expect(body.error).toEqual(
      expect.objectContaining({ code: 'BAD_REQUEST', statusCode: 400 }),
    );
    expect(getResources.execute).not.toHaveBeenCalled();
  });

  it('GET /api/resources rejects unknown query params with 400', async () => {
    await request(app.getHttpServer())
      .get('/api/resources?unknown=1')
      .expect(400);

    expect(getResources.execute).not.toHaveBeenCalled();
  });

  it('serves routes only under the /api prefix', async () => {
    await request(app.getHttpServer()).get('/resources').expect(404);
  });

  it('POST /api/resources/purge-non-articles requires the admin key', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/resources/purge-non-articles')
      .expect(401);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('UNAUTHORIZED');
    expect(purgeNonArticles.execute).not.toHaveBeenCalled();
  });

  it('POST /api/resources/purge-non-articles runs with a valid admin key', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/resources/purge-non-articles')
      .set('X-Admin-Key', ADMIN_KEY)
      .expect(200);

    expect(response.body).toEqual({ data: { archived: 2, total: 10 } });
  });
});
