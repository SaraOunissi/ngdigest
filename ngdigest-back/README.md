# NgDigest - Backend API

NestJS backend for NgDigest, a developer-focused content aggregation platform.

## Tech Stack

- **Framework**: NestJS (TypeScript strict mode)
- **Database**: MongoDB with Mongoose
- **Auth**: JWT via Passport
- **Scheduling**: @nestjs/schedule (cron jobs for aggregation)
- **Validation**: class-validator + class-transformer
- **Aggregation**: rss-parser + axios

## Project Structure (Clean Architecture)

```
src/
├── config/                        # Config loaders (database, auth)
├── common/                        # Shared utilities
│   ├── decorators/                # Custom decorators
│   ├── filters/                   # Exception filters
│   ├── interceptors/              # Response interceptors
│   └── pipes/                     # Validation pipes
├── modules/
│   ├── resources/                 # Resources bounded context
│   │   ├── domain/
│   │   │   ├── entities/          # Business entities
│   │   │   └── interfaces/        # Repository interfaces
│   │   ├── application/
│   │   │   └── use-cases/         # Business use cases
│   │   ├── infrastructure/
│   │   │   ├── repositories/      # Mongoose repository implementations
│   │   │   └── schemas/           # Mongoose schemas
│   │   └── presentation/
│   │       ├── controllers/       # REST controllers
│   │       └── dto/               # Request/response DTOs
│   ├── aggregator/                # Feed aggregation module
│   │   ├── domain/
│   │   ├── application/services/  # Aggregation logic, cron jobs
│   │   └── infrastructure/        # RSS/HTTP adapters
│   └── auth/                      # Authentication module
│       ├── domain/
│       ├── application/
│       │   ├── strategies/        # Passport strategies (JWT)
│       │   └── guards/            # Auth guards
│       ├── infrastructure/
│       └── presentation/
│           ├── controllers/       # Auth endpoints
│           └── dto/               # Login/register DTOs
├── app.module.ts                  # Root module
└── main.ts                        # Bootstrap (CORS, validation, prefix)
```

## Configuration

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `http://localhost:4200` | Allowed CORS origin |
| `MONGODB_URI` | `mongodb://localhost:27017/ngdigest` | MongoDB connection string |
| `JWT_SECRET` | — | JWT signing secret |
| `JWT_EXPIRES_IN` | `1d` | JWT token expiry |
| `AGGREGATOR_CRON` | `0 */6 * * *` | Cron schedule for feed aggregation |

## Scripts

```bash
npm run start:dev   # Dev server with hot reload
npm run start       # Production server
npm run build       # Compile TypeScript
npm test            # Run unit tests
npm run test:e2e    # Run e2e tests
npm run lint        # Lint with ESLint
```

## Getting Started

```bash
# Prerequisites: MongoDB running locally or via Docker
cp .env.example .env
npm install
npm run start:dev
```

API is available at `http://localhost:3000/api`.
