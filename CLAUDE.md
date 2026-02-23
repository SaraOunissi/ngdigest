# NgDigest - Conventions & Rules

## CSS / SCSS

- **BEM** (Block Element Modifier) naming for all CSS classes: `.resource-card`, `.resource-card__title`, `.resource-card--highlighted`
- **No inline styles** in templates (no `<style>` blocks, no `[style]`, no `style=""` attributes). All styling goes in `.scss` files only.
- Variable names must be **readable and descriptive** in camelCase: `$primaryColor`, `$cardBorderRadius`, `$headerHeight` — never single letters or abbreviations.
- Shared/global styles live in `src/styles/`:
  - `_variables.scss` — design tokens (spacing, typography, breakpoints)
  - `_colors.scss` — color palette variables
  - `_mixins.scss` — reusable SCSS mixins
  - `_overrides.scss` — overrides for third-party component library styles (Material, or whatever UI lib is used)
  - `index.scss` — barrel file that forwards all partials
- To use shared styles in a component `.scss` file, import the specific partials needed: `@use "variables" as *;`, `@use "colors" as *;`, `@use "mixins" as *;` (resolved via `stylePreprocessorOptions.includePaths` in angular.json).

## Components

- When a component template becomes long or complex, **split it into smaller child components** to improve readability.
- If a child component can be reused in other features, move it to `src/app/shared/components/`.
- Feature-specific components stay in their feature's `presentation/` folder.
- **Prefer Signals** over traditional reactive patterns for component state (Angular 21 best practice).
- Components should be **dumb/presentational** when possible — delegate business logic to use cases.

## Naming

- All variable and property names must be **readable and descriptive** in camelCase. No single-letter names except loop iterators (`i`, `j`) or well-known conventions (`e` for event).
- Component selectors: `app-` prefix, kebab-case (enforced by ESLint).
- File names: kebab-case (Angular convention).
- **Interfaces**: prefix with `I` (e.g., `IResourceRepository`) or suffix with descriptive name (e.g., `ResourceData`).
- **Types**: descriptive PascalCase (e.g., `ResourceFilter`, `SortOrder`).
- **Enums**: PascalCase for enum name, UPPER_SNAKE_CASE for values (e.g., `enum ResourceType { ARTICLE = 'ARTICLE', VIDEO = 'VIDEO' }`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `const MAX_RESULTS = 50;`).

## Architecture (DDD)

- `core/` — singleton services, guards, interceptors, app-wide concerns
- `shared/` — reusable components, pipes, directives
- `features/<context>/domain/` — entities, value objects, repository interfaces
- `features/<context>/application/` — use cases, state management
- `features/<context>/infrastructure/` — API services, adapters, mappers
- `features/<context>/presentation/` — components, pages, UI logic
- **No direct HTTP calls** in components — always go through use cases.
- **Domain layer** must be framework-agnostic (no Angular imports in domain models).

## TypeScript

- **Strict mode** enabled (`"strict": true` in tsconfig.json).
- **Explicit return types** on all functions and methods (except simple arrow functions where type is obvious).
- **No `any` type** — use `unknown` if type is truly unknown, then narrow with type guards.
- **Prefer `const`** over `let` when variable won't be reassigned.
- **Use optional chaining** (`?.`) and nullish coalescing (`??`) for cleaner null/undefined handling.
- **Readonly properties** when appropriate (e.g., `readonly id: string;` in domain entities).

## Imports

- **Absolute imports** for cross-feature imports: `import { Resource } from '@app/features/resources/domain';`
- **Relative imports** for same-feature imports: `import { ResourceMapper } from '../mappers/resource.mapper';`
- Configure path aliases in `tsconfig.json`:
```json
  "paths": {
    "@app/*": ["src/app/*"],
    "@core/*": ["src/app/core/*"],
    "@shared/*": ["src/app/shared/*"],
    "@features/*": ["src/app/features/*"]
  }
```
- **Import order**: Angular imports → third-party → application imports → relative imports.

## State Management (Signals)

- Use **Signals** for component state (Angular 21 standard).
- For shared state across features, create **store services** using Signals:
```typescript
  @Injectable({ providedIn: 'root' })
  export class ResourceStore {
    private _resources = signal<Resource[]>([]);
    readonly resources = this._resources.asReadonly();
    
    updateResources(resources: Resource[]) {
      this._resources.set(resources);
    }
  }
```
- Use **computed signals** for derived state.
- Use **effect()** sparingly — prefer reactive chains.

## RxJS

- **Complete all subscriptions** — use `takeUntilDestroyed()` in components (Angular 16+).
- **Avoid nested subscriptions** — use operators like `switchMap`, `mergeMap`, `concatMap`.
- **Prefer async pipe** in templates over manual subscriptions.
- **Error handling**: always include error handling in subscribe or use `catchError` operator.

## Testing

- **File naming**: `*.spec.ts` for unit tests, `*.e2e.ts` for E2E tests.
- **Test structure**: Arrange → Act → Assert (AAA pattern).
- **What to test**:
  - ✅ Domain models business logic
  - ✅ Use cases orchestration
  - ✅ Mappers transformations
  - ✅ Pipes and directives
  - ✅ Component user interactions (click, input)
  - ❌ Framework behaviors (Angular itself)
  - ❌ Third-party libraries internals
- **Mock external dependencies** (HTTP, repositories) in unit tests.
- **Test file location**: next to the file being tested (e.g., `resource.model.spec.ts` next to `resource.model.ts`).
- **E2E tests** for critical user flows only (login, main feature flow).

## Error Handling

- **Never catch and ignore** errors silently — always log or display to user.
- **HTTP errors**: handle via interceptor and display user-friendly messages.
- **Domain errors**: throw custom domain exceptions (e.g., `ResourceNotFoundException`).
- **UI errors**: show toast/snackbar notifications (not alerts).

## Git Conventions

- **Branch naming**: `feature/resource-list`, `fix/scoring-bug`, `refactor/clean-architecture`.
- **Commit messages**: [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat: add resource filtering`
  - `fix: correct scoring algorithm`
  - `refactor: move mapper to infrastructure`
  - `test: add unit tests for Resource model`
  - `docs: update architecture documentation`
  - `style: format code with prettier`
- **Commit often** with small, focused commits.
- **Never commit** `.env` files, `node_modules`, or IDE-specific files.

## Backend (NestJS) - Additional Rules

- **Clean Architecture** structure: domain → application → infrastructure → presentation.
- **DTOs** for all request/response payloads (use `class-validator` decorators).
- **No business logic** in controllers — delegate to use cases.
- **Environment variables** for all configuration (database URL, JWT secret, API keys).
- **Validation**: global validation pipe enabled.
- **Error handling**: global exception filter for consistent error responses.
- **Logging**: use NestJS Logger, not `console.log`.
- **Testing**: unit tests for services/use cases, E2E tests for controllers.

## API Conventions

- **RESTful endpoints**: `/api/resources`, `/api/resources/:id`, `/api/auth/login`.
- **Consistent response format**:
```typescript
  {
    data: T | T[],
    meta?: { page, limit, total },
    error?: { message, code }
  }
```
- **HTTP status codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error).
- **Pagination**: query params `?page=1&limit=20`.
- **Filtering**: query params `?source=ninja-squad&language=fr`.
- **Sorting**: query param `?sort=-publishedAt` (minus for descending).

## Performance

- **Lazy load** feature modules when possible.
- **OnPush change detection** strategy for components when feasible.
- **trackBy** functions for `*ngFor` loops.
- **Avoid large bundle sizes** — monitor with `ng build --stats-json` and webpack-bundle-analyzer.
- **Optimize images** — use WebP format, lazy loading for images.

## Documentation

- **JSDoc comments** for public APIs (use cases, services).
- **README.md** in each feature folder explaining the domain.
- **Architecture diagrams** in `/docs` for complex flows.
- Update `ARCHITECTURE.md` when making structural changes.

## Security

- **Never commit secrets** (use `.env` and `.env.example`).
- **Sanitize user inputs** in backend (use validation pipes).
- **CORS configuration** — only allow frontend origin.
- **JWT tokens**: store in httpOnly cookies (not localStorage).
- **Content Security Policy** (CSP) headers configured.

---

**Last updated**: 2025-02-19  
**Project**: NgDigest - Tech Watch Platform