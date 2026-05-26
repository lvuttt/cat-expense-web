# Cat Expense Tracker — Developer & Agent Onboarding Guide (`agents.md`)

Welcome! This document provides a complete guide to the architecture, patterns, decisions, and codebase details of the **Cat Expense Tracker** project to help you ramp up instantly.

---

## 1. Project Overview & Environment

The **Cat Expense Tracker** is a **Svelte 5 + SvelteKit + TypeScript** frontend web application that tracks cat expenses, calculates category-level aggregates, integrates with public APIs for cat facts, and stores data locally.

### Technical Runtimes

- **Node.js**: `22.14.0` (managed via `asdf` with `.tool-versions`).
- **Package Manager**: `Yarn` Classic 1.x (lockfile: `yarn.lock`).
- **Framework**: SvelteKit 2 (SPA mode via `@sveltejs/adapter-static`).
- **Build Bundler**: Vite 6.
- **CSS/SCSS Styling**: SCSS styled using strict **BEM (Block-Element-Modifier)** methodology. In Svelte components, these styles are co-located in `<style lang="scss">` blocks. Global layout styles are in `src/App.scss`.

### Key API Endpoints

- **Cat Facts API**: `https://catfact.ninja/fact`
- **Fallback Cat Fact**: _"Cats sleep for about 13–16 hours a day, making them one of the sleepiest animals! 😴"_

### Import Conventions

Domain types and app constants use explicit module names (not React-style `index.ts` barrels):

```ts
import type { Expense, DialogMode } from '$lib/types/models';
import { STORAGE_KEY, VALIDATION } from '$lib/constants/app';
import { CATEGORIES, CATEGORY_CONFIG } from '$lib/constants/app';
```

---

## 2. Directory Layout & Architecture

The project is structured around separation of concerns: business calculations, service handling, Svelte 5 Runes state managers, and presentational components.

**Unit tests** (`*.test.ts`) are co-located beside their targets (e.g. `ExpenseRow.test.ts` next to `ExpenseRow.svelte`). Route tests live in `src/routes/` without a `+` prefix (`page.test.ts`, `layout.test.ts`) because SvelteKit reserves `+` filenames for routes.

```
cat-expense-web/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD to GitHub Pages
├── e2e-tests/
│   └── expenseHighlight.spec.ts  # Playwright browser E2E test suite
├── visual-tests/
│   └── expenseVisual.spec.ts     # Playwright visual regression tests
├── package.json                  # Scripts, dependencies, Yarn resolutions
├── playwright.config.ts          # Playwright config (port 5182, headless)
├── vitest.config.ts              # Vitest + @testing-library/svelte setup
├── vite.config.ts                # Vite + SvelteKit plugin
├── svelte.config.js              # Static adapter → output dir `build/`
├── tsconfig.json
├── .prettierrc / .prettierignore
│
└── src/
    ├── app.html                  # SvelteKit HTML entry template
    ├── App.scss                  # Main container styles
    ├── index.css                 # Global theme variables, resets
    │
    ├── routes/                   # SvelteKit routing (client-side SPA)
    │   ├── +layout.ts            # Disables SSR, enables static prerendering
    │   ├── +layout.svelte        # Global CSS layout shell
    │   ├── +page.svelte          # Dashboard orchestrator
    │   ├── layout.test.ts        # Unit tests for +layout.svelte
    │   └── page.test.ts          # Unit tests for +page.svelte
    │
    └── lib/                      # Shared library ($lib/ path alias)
        ├── components/           # Svelte UI (each may have a *.test.ts)
        │   ├── ActionBar.svelte
        │   ├── CatFactPanel.svelte
        │   ├── ExpenseDialog.svelte
        │   ├── ExpenseForm.svelte
        │   ├── ExpenseRow.svelte
        │   ├── ExpenseTable.svelte
        │   ├── Header.svelte
        │   └── SpendingChart.svelte
        │
        ├── state/                # Svelte 5 Runes ($state, $derived, $effect)
        │   ├── catFact.svelte.ts
        │   ├── expenses.svelte.ts
        │   ├── selection.svelte.ts
        │   ├── sort.svelte.ts
        │   └── virtualList.svelte.ts
        │
        ├── types/
        │   ├── models.ts         # Re-exports: Expense, SortConfig, DialogMode, …
        │   ├── expense.ts
        │   ├── sort.ts
        │   └── dialog.ts
        │
        ├── constants/
        │   ├── app.ts            # Storage keys, API URLs, VALIDATION limits
        │   └── categories.ts     # CATEGORIES + CATEGORY_CONFIG
        │
        ├── services/
        │   ├── storageService.ts
        │   └── catFactService.ts
        │
        ├── utils/
        │   ├── expenseUtils.ts
        │   ├── sortUtils.ts
        │   ├── validationUtils.ts
        │   ├── csvUtils.ts
        │   ├── formatUtils.ts
        │   └── focusTrap.ts
        │
        ├── mocks/
        │   └── appPaths.ts       # Vitest alias for `$app/paths`
        │
        └── test/                 # Test-only helpers (not production code)
            ├── fixtures.ts       # Shared sample `Expense` objects
            └── LayoutHost.svelte
```

### Generated / Ignored Paths

Do not commit: `build/`, `.svelte-kit/`, `node_modules/`, `test-results/`, `playwright-report/`. CI builds fresh artifacts on every deploy.

---

## 3. Engineering & Design Principles

### SOLID Design Principles

- **S — Single Responsibility Principle**:
  - `createExpenses` coordinates mutations but delegates calculation logic to `expenseUtils.ts` and serialization to `storageService.ts`.
  - `catFactService.ts` focuses solely on calling the Cat Fact API.
- **O — Open/Closed Principle**:
  - **Categories**: Configuration-driven in [categories.ts](src/lib/constants/categories.ts). Append to `CATEGORIES` and `CATEGORY_CONFIG` without changing UI layout components.
  - **Sorting**: Strategy pattern in [sortUtils.ts](src/lib/utils/sortUtils.ts) via `SORT_STRATEGIES`.
- **L — Liskov Substitution Principle**:
  - `DialogMode` discriminated union handles Add vs Edit modes type-safely.
- **I — Interface Segregation Principle**:
  - `ExpenseRow` receives only the `Expense` and specific callbacks, not the full app state.
- **D — Dependency Inversion Principle**:
  - `createExpenses` accepts `IStorageService<Expense[]>` so storage can be swapped for tests or other backends.

### Scoped CSS Styling

- Styles live in each component's `<style>` block (encapsulated, no global pollution).
- BEM modifiers indicate state (e.g. `.expense-row--highlighted`).
- Design tokens (`--color-*`, `--space-*`, etc.) are defined in `index.css`.

---

## 4. Key Business Logic

### Highlighting and Tie-Breakers

The app highlights all rows in the category (or categories) with the **highest total spending**.

- **Group & Sum**: [sumByCategory](src/lib/utils/expenseUtils.ts) uses integer cents (`Math.round(val * 100)`).
- **Tie-breaking**: [getTopSpendingCategories](src/lib/utils/expenseUtils.ts) adds every category that matches the maximum total to a `Set`.

### Dialog Layout & Cat Fact

[ExpenseDialog](src/lib/components/ExpenseDialog.svelte):

- **Desktop**: Two columns — `ExpenseForm` (left) and `CatFactPanel` (right).
- **Mobile**: Stacked layout; fact card becomes a compact banner above the form.
- **Race conditions**: Opening the dialog triggers `createCatFact().refetch()`; in-flight fetches use `AbortController` and abort when the dialog closes.

### Responsive Scaling & Hover Micro-interactions

- CSS tokens in `index.css` scale at `>= 1400px`, `>= 1800px`, and `>= 2200px`.
- Edit/Duplicate buttons in `ExpenseRow` slide out labels on desktop hover (`min-width: 768px`).

---

## 5. Verification & Testing

### Unit Tests (Vitest + Testing Library)

- **Runner**: Vitest 4 with `jsdom`.
- **Svelte**: `@testing-library/svelte` via `svelteTesting()` in [vitest.config.ts](vitest.config.ts) (browser build of Svelte, auto cleanup).
- **Config**: Tests match `src/**/*.test.{ts,tsx}`; Playwright specs are excluded.
- **Coverage**:
  - Utilities and services (`expenseUtils`, `sortUtils`, `formatUtils`, `validationUtils`, `csvUtils`, `storageService`, `catFactService`).
  - All Svelte components (`*.svelte` + co-located `*.test.ts`).
  - Route orchestration (`page.test.ts`, `layout.test.ts`).
  - Minimum thresholds enforced via `@vitest/coverage-v8`: 80% Statements, 70% Branches, 80% Functions, 80% Lines.
- **Commands**:
  - `yarn test` to run unit tests.
  - `yarn test:cov` to run unit tests with coverage report.

Component test example:

```ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import CatFactPanel from './CatFactPanel.svelte';

render(CatFactPanel, {
  props: { fact: '…', isLoading: false, onRefetch: vi.fn() },
});
```

`ExpenseDialog` tests mock `$lib/state/catFact.svelte` to avoid live API calls.

### E2E Tests (Playwright)

- **Location**: [e2e-tests/expenseHighlight.spec.ts](e2e-tests/expenseHighlight.spec.ts)
- **Coverage**: CRUD, duplicate, sort, delete, highlighting, edge cases.
- **Command**: `yarn test:e2e`

### Visual Regression Tests (Playwright)

- **Location**: [visual-tests/expenseVisual.spec.ts](visual-tests/expenseVisual.spec.ts)
- **Command**: `yarn test:visual`
- **Update baselines**: `yarn test:visual --update-snapshots`

---

## 6. How to Build & Run Locally

| Task                              | Command                                    |
| --------------------------------- | ------------------------------------------ |
| Install dependencies              | `yarn install`                             |
| Dev server                        | `yarn dev` → http://localhost:5173         |
| Lint                              | `yarn lint`                                |
| Format (Prettier + Svelte plugin) | `yarn format`                              |
| Type-check                        | `tsc -b`                                   |
| Unit tests                        | `yarn test`                                |
| Unit tests with coverage          | `yarn test:cov`                            |
| Production build                  | `yarn build` → static site in **`build/`** |
| Preview production build          | `yarn preview`                             |

### Yarn Note (Vitest 4 + Vite)

`package.json` includes `"resolutions": { "vite": "^6.3.5" }` so Yarn 1.x can install Vitest 4.x without the _"could not find a copy of vite to link"_ linker error (Vitest’s `||` peer range on `vite`).

---

## 7. CI/CD Deployment

Automated deploy to **GitHub Pages** on pushes to `main`.

### Pipeline ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))

1. `yarn install --frozen-lockfile`
2. `yarn lint`
3. `yarn test`
4. `yarn build`
5. Upload `./build` and deploy via `actions/deploy-pages`

Build artifacts are **not** committed to git. The `predeploy` / `deploy` scripts in `package.json` are for optional manual `gh-pages` CLI use; CI uses the workflow above.

### Base Path

[svelte.config.js](svelte.config.js) and [vite.config.ts](vite.config.ts) set the app `base` from `GITHUB_REPOSITORY` when building for Pages (e.g. `/cat-expense-web/`), and `/` locally.
