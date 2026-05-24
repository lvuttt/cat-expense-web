# Cat Expense Tracker — Developer & Agent Onboarding Guide (`agents.md`)

Welcome! This document provides a complete guide to the architecture, patterns, decisions, and codebase details of the **Cat Expense Tracker** project to help you ramp up instantly.

---

## 1. Project Overview & Environment

The **Cat Expense Tracker** is a React + TypeScript frontend web application that tracks cat expenses, calculates category-level aggregates, integrates with public APIs for cat facts, and stores data locally.

### Technical Runtimes
*   **Node.js**: `22.14.0` (managed via `asdf` with `.tool-versions`).
*   **Package Manager**: `Yarn` (lockfile: `yarn.lock`).
*   **Build Bundler**: Vite (templated react-ts).
*   **CSS Styling**: Pure vanilla CSS styled using strict **BEM (Block-Element-Modifier)** methodology. No external UI library.

### Key API Endpoints
*   **Cat Facts API**: `https://catfact.ninja/fact`
*   **Fallback Cat Fact**: *"Cats sleep for about 13–16 hours a day, making them one of the sleepiest animals! 😴"*

---

## 2. Directory Layout & Architecture

The project is structured around separation of concerns, separating business calculations, service handling, state hooks, and component layouts.

*Note: All unit tests (`*.test.ts` and `*.test.tsx`) are co-located side-by-side with their respective target files inside `src/` (e.g. `App.test.tsx` next to `App.tsx`, `formatUtils.test.ts` next to `formatUtils.ts`).*

```
cat-expense-web/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD to GitHub Pages
├── index.html                    # Entry HTML, custom emoji favicon, SEO tags
├── package.json                  # Dev scripts, project dependencies
├── playwright.config.ts          # Playwright test config (port 5182, headless)
├── tsconfig.json                 # TypeScript compiler options
├── vite.config.ts                # Vite React bundler config
│
├── e2e-tests/
│   └── expenseHighlight.spec.ts  # Playwright browser E2E test suite
│
└── src/
    ├── main.tsx                  # App entry point, wraps in ErrorBoundary
    ├── App.tsx                   # Main orchestrator component
    ├── App.css                   # Main container styles
    ├── index.css                 # Global theme variables, resets, and animations
    │
    ├── types/                    # Discriminated unions and strict TS shapes
    │   ├── index.ts              # Barrel exporter
    │   ├── expense.ts            # Expense, Category, ExpenseFormData
    │   ├── sort.ts               # SortConfig, SortField, SortDirection
    │   └── dialog.ts             # DialogMode union (`add` vs `edit`)
    │
    ├── constants/                # Domain config (categories, validation limits)
    │   ├── index.ts              # Main URLs, localstorage keys, validation numbers
    │   └── categories.ts         # Categories array, CATEGORY_CONFIG metadata map
    │
    ├── services/                 # External service layers (DIP abstractions)
    │   ├── storageService.ts     # IStorageService contract & LocalStorageService
    │   └── catFactService.ts     # fetchCatFact API wrapper
    │
    ├── utils/                    # Pure, deterministic calculations
    │   ├── expenseUtils.ts       # Total sums, top category aggregates, duplicates
    │   ├── sortUtils.ts          # Strategy-based sorting
    │   ├── validationUtils.ts    # Form verification rules
    │   └── formatUtils.ts        # Currency and date formatting helpers
    │
    ├── hooks/                    # Domain lifecycle hooks
    │   ├── useExpenses.ts        # Expense CRUD lifecycle and derived state
    │   ├── useCatFact.ts         # Fetch fact lifecycle (AbortController)
    │   ├── useSelection.ts       # Checkbox multiselect state
    │   └── useSort.ts            # Sort configurations
    │
    └── components/               # Pure UI modules (co-located .tsx & .css)
        ├── ErrorBoundary/        # Handles React render errors gracefully
        ├── Header/               # App brand header with animated cat emoji logo
        ├── ActionBar/            # Actions control row ([+ Add], [Delete])
        ├── ExpenseTable/         # Header columns and grid rows container
        ├── ExpenseRow/           # Individual item renderer
        └── ExpenseDialog/        # Responsive modal dialog with cat fact banner
```

---

## 3. Engineering & Design Principles

### SOLID Design Principles
*   **S — Single Responsibility Principle**:
    *   `useExpenses` coordinates mutations but delegates calculation logic to `expenseUtils.ts` and serialization to `storageService.ts`.
    *   `catFactService.ts` focuses solely on calling the Cat Fact API.
*   **O — Open/Closed Principle**:
    *   **Categories**: The categories system is completely configuration-driven inside [categories.ts](file:///Users/nyoodee/Private/cat-expense-web/src/constants/categories.ts). New categories can be introduced by appending to `CATEGORIES` and `CATEGORY_CONFIG` without modifying UI layout components.
    *   **Sorting**: Uses a strategy pattern inside [sortUtils.ts](file:///Users/nyoodee/Private/cat-expense-web/src/utils/sortUtils.ts) mapping sort keys to comparative sort functions (`SORT_STRATEGIES`).
*   **L — Liskov Substitution Principle**:
    *   The dialog uses a discriminated union `DialogMode` to handle standard "Add" and "Edit" modes type-safely.
*   **I — Interface Segregation Principle**:
    *   `ExpenseRow` receives only the specific `Expense` object and specific event callbacks, not the full list.
*   **D — Dependency Inversion Principle**:
    *   `useExpenses` accepts an injected `IStorageService<Expense[]>` interface rather than communicating directly with `localStorage`. This allows easily swapping `localStorage` for `IndexedDB` or a cloud API service during testing.

### BEM CSS Styling
All stylesheet elements follow strict `.block__element--modifier` format:
*   Flat selector hierarchy to prevent stylesheet pollution and specificity issues.
*   Modifiers are used to indicate active states (e.g., `.expense-row--highlighted`, `.expense-dialog__field--error`).
*   Global design system variables (colors, spaces, transitions, border-radii) are declared in `index.css` and referenced in components.

---

## 4. Key Business Logic

### Highlighting and Tie-Breakers
The app highlights all rows belonging to the category with the **highest total spending**.
*   **Group & Sum**: Expenses are summed by category in [sumByCategory](file:///Users/nyoodee/Private/cat-expense-web/src/utils/expenseUtils.ts#L24) using integer cents arithmetic (`Math.round(val * 100)`) to avoid floating-point rounding issues.
*   **Tie-breaking**: In [getTopSpendingCategories](file:///Users/nyoodee/Private/cat-expense-web/src/utils/expenseUtils.ts#L41), the maximum total is identified, and *all* categories that match this maximum total are added to the `Set`.
*   If multiple categories tie for the highest total spend, all rows belonging to all of those tied categories are highlighted.

### Dialog Layout & Cat Fact
The [ExpenseDialog](file:///Users/nyoodee/Private/cat-expense-web/src/components/ExpenseDialog/ExpenseDialog.tsx) implements:
*   **Side-by-Side View**: On desktop, the dialog splits the layout into two columns: the left column houses the input form, and the right column houses a dynamic "Random cat fact" card (with a custom icon wrapper and loading state animations).
*   **Mobile View**: The layout stacks vertically, transforming the fact card into a compact horizontal banner at the top of the form fields to optimize screen space.
*   **Race Condition Mitigation**: Whenever the dialog is opened, the `useCatFact` hook fetches fresh content. In-flight requests are bound to an `AbortController` and are aborted if the dialog is closed rapidly to prevent background memory leaks.

### Responsive Scaling & Hover Micro-interactions
*   **Large & Ultra-wide Screens**: The application uses centralized CSS tokens in `index.css` (e.g., `--container-max-width`, `--font-size-*`, `--space-*`, `--input-height`, `--col-actions`) that scale up dynamically across media queries at `>= 1400px`, `>= 1800px`, and `>= 2200px` for ultra-wide displays (2000px+).
*   **Action Button Slide-out Hover**: Edit and Duplicate row buttons in `ExpenseRow` automatically slide out their text labels smoothly on desktop hover (`min-width: 768px`) using CSS transitions on the button width and text opacity, while preserving standard layout alignment via coordinated actions column sizing.

---

## 5. Verification & Testing

The project has comprehensive coverage for functional logic and layout highlights.

### Running Unit Tests (Vitest)
*   **Location**: Placed side-by-side with source files in `src/` (e.g., `*.test.ts` and `*.test.tsx` co-located with their targets).
*   **Coverage**: 100% unit and integration coverage for all utilities (`expenseUtils`, `sortUtils`, `formatUtils`, `validationUtils`), services (`storageService`, `catFactService`), custom hooks (`useExpenses`, `useSelection`, `useSort`, `useCatFact`), and UI components (`Header`, `ActionBar`, `ExpenseRow`, `ExpenseTable`, `ExpenseDialog`, `ErrorBoundary`, `App`).
*   **Environment**: Runs under a simulated browser DOM environment (`jsdom`) utilizing `@testing-library/react` for component rendering, interaction, and hook assertion verification.
*   **Command**: `yarn test` (runs with `vitest run`).

### Running E2E Tests (Playwright)
*   **Location**: [expenseHighlight.spec.ts](file:///Users/nyoodee/Private/cat-expense-web/e2e-tests/expenseHighlight.spec.ts).
*   **Coverage**: Verifies user workflows (adding, editing, duplicating, sorting, and deleting expenses) and top spending category highlighting.
*   **Command**: `yarn test:e2e` (runs with `playwright test e2e-tests`).

### Running Visual Regression Tests (Playwright)
*   **Location**: [expenseVisual.spec.ts](file:///Users/nyoodee/Private/cat-expense-web/visual-tests/expenseVisual.spec.ts).
*   **Coverage**: Captures and compares layout screenshot snapshots across desktop and mobile viewports for empty states, populated tables, and open modal dialogs.
*   **Command**: `yarn test:visual` (runs with `playwright test visual-tests`).
*   **Update Baselines**: `yarn test:visual --update-snapshots` (re-generates screenshot baselines).

---

## 6. How to Build & Run Locally

*   **Install Dependencies**: `yarn install`
*   **Start Local Development**: `yarn dev` (launches dev server at `http://localhost:5173`)
*   **Type-check Compiler**: `tsc -b` (or `tsc --noEmit`)
*   **Production Build**: `yarn build` (generates static assets in `/dist`)
*   **Preview Build**: `yarn preview` (serves production build)

---

## 7. CI/CD Deployment

We employ a fully automated Git-triggered workflow to compile, check, and deploy the application to GitHub Pages.

### Configuration
*   **Workflow definition**: [.github/workflows/deploy.yml](file:///Users/nyoodee/Private/cat-expense-web/.github/workflows/deploy.yml).
*   **Routing base**: Resolves dynamically in [vite.config.ts](file:///Users/nyoodee/Private/cat-expense-web/vite.config.ts) based on the presence of `GITHUB_REPOSITORY` environment variable.
*   **Environment Permissions**: Modern GitHub Pages deployment utilizing `pages: write` and `id-token: write` permissions, targeting the `github-pages` environment without committing build artifacts back to source control branches.
