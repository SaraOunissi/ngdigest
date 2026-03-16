# NgDigest — Frontend

Angular 21 application for the NgDigest tech-watch platform.

🌐 **[ngdigest.co](https://ngdigest.co)** · Deployed on Vercel

---

## Stack

- **Angular 21** — standalone components, Signals for all state management
- **@ngx-translate** — FR/EN i18n (74 translation keys, zero hardcoded strings)
- **SCSS BEM** — pure SCSS design system, no inline styles
- **OnPush** change detection throughout
- **ESLint + Prettier** — linting and formatting enforced

---

## Routes

| Route | Description |
|---|---|
| `/resources` | Main feed — search, infinite scroll, relevance scores |
| `/sources` | Whitelisted domains + source suggestion form |
| `/about` | Static project overview |
| `/` | Redirects to `/resources` |

---

## Architecture

Feature modules follow Domain-Driven Design layering:

```
src/app/
├── core/                          # Singleton services, guards, interceptors
├── shared/                        # Shared components, pipes, directives
├── features/
│   └── resources/                 # "Resources" bounded context
│       ├── domain/                # Entities, value objects, interfaces
│       ├── application/           # Use cases, state management
│       ├── infrastructure/        # HTTP adapters, API calls
│       └── presentation/          # Components, pages, UI logic
├── app.ts
├── app.config.ts
└── app.routes.ts
```

| Layer | Role | Example |
|-------|------|---------|
| **Domain** | Business logic, entities, interfaces | `Resource` model, `ResourceRepository` interface |
| **Application** | Use cases, orchestration | `GetResourcesUseCase`, state store |
| **Infrastructure** | External communication | `ResourceHttpRepository`, HTTP adapters |
| **Presentation** | UI components | `ResourceListComponent`, pages |

Core services (singleton, root-provided):
- `SeoService` — dynamic meta/og/hreflang updates, reactive to language signal
- `LanguageService` — lang signal, persisted in localStorage

---

## Setup

```bash
npm install
npm start
```

Application runs at `http://localhost:4200`.

---

## Scripts

```bash
npm start            # Dev server on http://localhost:4200
npm run build        # Production build
npm test             # Run tests (Vitest via Angular CLI)
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint with ESLint
npm run format       # Format with Prettier
npm run format:check # Check formatting
```

---

## Environment

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

---

## Key implementation details

**Signals everywhere** — no RxJS Subjects for state, pure Angular 21 Signals pattern.

**Search** — debounced 300ms input, resets pagination on new query, backend `?search=` param.

**Infinite scroll** — IntersectionObserver on a sentinel element, appends pages to existing results.

**Score badge** — relevance score (0–6) displayed on each card with a tooltip explaining the scoring breakdown.

**SEO** — `SeoService` updates title, description, og:tags, twitter:tags, canonical URL, and `html[lang]` reactively via `effect()` on the language signal. Covers all 3 routes.
