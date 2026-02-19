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

## Naming

- All variable and property names must be **readable and descriptive** in camelCase. No single-letter names except loop iterators (`i`, `j`) or well-known conventions (`e` for event).
- Component selectors: `app-` prefix, kebab-case (enforced by ESLint).
- File names: kebab-case (Angular convention).

## Architecture (DDD)

- `core/` — singleton services, guards, interceptors, app-wide concerns
- `shared/` — reusable components, pipes, directives
- `features/<context>/domain/` — entities, value objects, repository interfaces
- `features/<context>/application/` — use cases, state management
- `features/<context>/infrastructure/` — API services, adapters, mappers
- `features/<context>/presentation/` — components, pages, UI logic
