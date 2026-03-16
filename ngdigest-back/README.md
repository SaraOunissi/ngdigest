# NgDigest — Backend

NestJS 11 REST API for the NgDigest tech-watch platform.

🚀 **Deployed on Railway** · API prefix: `/api`

---

## Stack

- **NestJS 11** — modular architecture, dependency injection
- **Mongoose** — MongoDB Atlas ODM
- **@nestjs/schedule** — cron-based aggregation pipeline
- **class-validator** — DTO validation (error messages in French)
- **SerpApi** — Google Search results via API (core data source)

---

## Architecture

Strict DDD / Clean Architecture layering across all modules:

```
Domain → Application → Infrastructure → Presentation
```

```
src/
├── config/                        # Config loaders (database, auth, serpapi)
├── common/                        # Shared utilities
│   ├── filters/                   # Exception filters
│   ├── interceptors/              # Response interceptors
│   └── pipes/                     # Validation pipes
└── modules/
    ├── resources/                 # Resource CRUD, pagination, search, filtering
    │   ├── domain/
    │   │   ├── entities/          # Business entities
    │   │   └── interfaces/        # Repository interfaces
    │   ├── application/
    │   │   └── use-cases/         # Business use cases
    │   ├── infrastructure/
    │   │   └── repositories/      # Mongoose repository implementations
    │   └── presentation/
    │       ├── controllers/       # REST controllers
    │       └── dto/               # Request/response DTOs
    ├── aggregator/                # Content collection pipeline (SerpApi + Dev.to + RSS)
    │   ├── application/services/  # Aggregation logic, cron jobs
    │   └── infrastructure/        # Fetchers, language detection, trusted sources
    └── sources/                   # Whitelist management + suggestion form
```

---

## API endpoints

```
GET  /api/resources              # Paginated resources (search, lang, source filters)
GET  /api/sources                # Whitelisted domains
POST /api/sources/suggest        # Submit a source suggestion
POST /api/aggregator/trigger     # Manually trigger aggregation
```

---

## SerpApi integration

The aggregator runs **3 parallel SerpApi queries** per cycle using Google Search (`engine: google`):

| Query | Target |
|---|---|
| `"Angular" expert blogs {year}` | Community expert content |
| `"Angular" community news {year}` | Ecosystem announcements |
| `"Angular" tutorials fr {year}` | French-language resources |

All queries use `tbs=qdr:w` to restrict results to the past week, with dynamic year injection to reduce stale results.

**Date extraction** uses a cascade fallback strategy:
1. Snippet date pattern match
2. URL date pattern match
3. Relative date parsing ("2 days ago")

---

## Relevance scoring

Each resource is scored 0–6 before storage:

```
score += 3  // domain is in whitelist (48 curated sources)
score += 2  // title contains Angular keyword (20 signal words)
score += 1  // published within the last 7 days
```

Resources scoring < 3 are discarded. Resources are upserted by URL (no duplicates).

---

## Aggregation schedule

```
Cron: 0 */12 * * *   →  every 12 hours (~180 requests/month)
```

Fits comfortably within SerpApi's free tier (250 req/month).

Weekly retention cron performs soft-delete cleanup by score + age threshold.

---

## Configuration

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `http://localhost:4200` | Allowed CORS origins (comma-separated) |
| `MONGODB_URI` | `mongodb://localhost:27017/ngdigest` | MongoDB connection string |
| `JWT_SECRET` | — | JWT signing secret |
| `JWT_EXPIRES_IN` | `1d` | JWT token expiry |
| `AGGREGATOR_CRON` | `0 */12 * * *` | Cron schedule for feed aggregation |
| `SERPAPI_KEY` | — | SerpApi API key |
| `DEV_TO_ENABLED` | `false` | Enable Dev.to fetcher |

---

## Scripts

```bash
npm run start:dev   # Dev server with hot reload
npm run start       # Production server
npm run build       # Compile TypeScript
npm test            # Run unit tests
npm run test:e2e    # Run e2e tests
npm run lint        # Lint with ESLint
```

---

## Getting started

```bash
cd ngdigest-back
cp .env.example .env
npm install
npm run start:dev
```

API is available at `http://localhost:3000/api`.

---

## CORS

Production CORS uses a dynamic origin callback that reads `CORS_ORIGIN` as a comma-separated list. Both `https://ngdigest.co` and `https://www.ngdigest.co` are configured in production.

---

## Tests

```bash
npm test
```

Coverage includes: services, use cases, fetchers, controllers (8 spec files).
