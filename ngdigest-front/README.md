# NgDigest - Frontend

Angular 21 frontend for NgDigest, a developer-focused content aggregation platform.

## Tech Stack

- **Framework**: Angular 21 (standalone components)
- **Styling**: SCSS
- **Linting**: ESLint with Angular recommended rules
- **Formatting**: Prettier (with SCSS & Angular HTML support)
- **Testing**: Vitest (via `@angular/build:unit-test`)

## Project Structure (DDD)

```
src/app/
├── core/                          # Singleton services, guards, interceptors
├── shared/                        # Shared components, pipes, directives
├── features/
│   └── resources/                 # "Resources" bounded context
│       ├── domain/                # Entities, value objects, interfaces
│       ├── application/           # Use cases, state management
│       ├── infrastructure/        # API services, adapters, mappers
│       └── presentation/          # Components, pages, UI logic
├── app.ts
├── app.config.ts
└── app.routes.ts
```

### Layer Responsibilities

| Layer | Role | Example |
|-------|------|---------|
| **Domain** | Business logic, entities, interfaces | `Resource` model, `ResourceRepository` interface |
| **Application** | Use cases, orchestration | `GetResourcesUseCase`, state store |
| **Infrastructure** | External communication | `ResourceApiService`, HTTP adapters |
| **Presentation** | UI components | `ResourceListComponent`, pages |

## Scripts

```bash
npm start           # Dev server on http://localhost:4200
npm run build       # Production build
npm test            # Run tests (Vitest via Angular CLI)
npm run test:watch  # Run tests in watch mode
npm run lint        # Lint with ESLint
npm run format      # Format with Prettier
npm run format:check # Check formatting
```

## Getting Started

```bash
npm install
npm start
```
