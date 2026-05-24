# Cat Expense Tracker 🐾

A premium, responsive React + TypeScript frontend web application to log and track expenses for your feline friends. Features automatic currency calculation, top category highlighting, dynamic cat facts integration, and offline-tolerant storage.

---

## ✨ Features

- **Expense Management**: Easy CRUD operations to Add, Edit, and Delete expenses.
- **Item Duplication**: Quickly duplicate existing expenses to log recurring items.
- **Smart Highlighting & Tie-Breakers**: Automatically highlights all rows belonging to the category with the highest total spend (handling ties dynamically using integer cents arithmetic).
- **Sortable Ledger Table**: Sort by item name, category, or amount in ascending/descending order.
- **Random Cat Facts Panel**: Intergrates with a public API to fetch random cat facts when the dialog is opened (includes loading states, offline fallbacks, and AbortController race-condition mitigation).
- **Responsive Layout**: Adapts smoothly to mobile viewports (stacked layout with compact banner) and desktop/ultra-wide screens (side-by-side split view).
- **Premium Design & Micro-interactions**: Sleek dark mode, custom fonts, glassmorphism overlays, and smooth hover animations.

---

## 🛠️ Tech Stack & Architecture

- **Core**: React 19, TypeScript, Vite
- **Styling**: Pure Vanilla CSS following strict **BEM (Block-Element-Modifier)** naming conventions.
- **SOLID Principles**:
  - *Single Responsibility*: State synchronization, API calls, and calculations are kept isolated from presentation layouts.
  - *Open/Closed*: Adding new categories or sorting strategies is configuration-driven and requires no component changes.
  - *Dependency Inversion*: Custom hooks receive an abstract `IStorageService` interface, allowing easy mocking/swapping of the storage layers.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `22.14.0` (managed via `asdf` with `.tool-versions`)
- **Package Manager**: `Yarn`

### Setup Commands

1. **Install Dependencies**:
   ```bash
   yarn install
   ```

2. **Start Local Development Server**:
   ```bash
   yarn dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Production Build**:
   ```bash
   yarn build
   ```
   Generates production assets in the `/dist` directory.

---

## 🧪 Testing Suites

The project has 100% test coverage across Unit, E2E, and Visual Regression testing levels.

### 1. Unit Tests (Vitest)
Unit tests cover all utilities, service clients, custom hooks, and React UI components. Tests run in a simulated browser DOM (`jsdom`) utilizing React Testing Library.
- **Location**: Co-located side-by-side with source files in `src/` (e.g., `src/App.test.tsx`, `src/utils/expenseUtils.test.ts`).
- **Run Unit Tests**:
  ```bash
  yarn test
  ```

### 2. E2E Tests (Playwright)
End-to-End tests verify user workflows like adding/editing/deplicating rows, multi-select deletion, sorting columns, and reloading persistence.
- **Location**: `e2e-tests/expenseHighlight.spec.ts`.
- **Run E2E Tests**:
  ```bash
  yarn test:e2e
  ```

### 3. Visual Regression Tests (Playwright)
Validates UI and layout consistency across desktop and mobile viewports by taking screenshot diffs. Network calls are mocked to ensure deterministic results.
- **Location**: `visual-tests/expenseVisual.spec.ts`.
- **Run Visual Tests**:
  ```bash
  yarn test:visual
  ```
- **Update Baseline Snapshots**:
  ```bash
  yarn test:visual --update-snapshots
  ```

---

## 🚀 CI/CD & Deployment

The application includes an automated deployment pipeline to host the web app on **GitHub Pages** for free.

### GitHub Actions Pipeline
The deployment workflow is configured in [.github/workflows/deploy.yml](file:///.github/workflows/deploy.yml). When you push code changes to the `main` or `master` branches, it automatically:
1. Installs project dependencies (`yarn install --frozen-lockfile`).
2. Performs lint checks (`yarn lint`).
3. Executes the full unit test suite (`yarn test`).
4. Compiles TypeScript and builds the production bundle (`yarn build`).
5. Deploys the static assets directly to GitHub Pages via the official, modern GitHub Pages deployment API (`actions/deploy-pages`).

### Dynamic Base Paths
To ensure assets load properly when deployed to a custom subpath on GitHub Pages (e.g., `https://<username>.github.io/<repository-name>/`) while maintaining standard root routing during local development, [vite.config.ts](file:///Users/nyoodee/Private/cat-expense-web/vite.config.ts) dynamically resolves the Vite `base` URL using the `GITHUB_REPOSITORY` environment variable provided by GitHub Actions.

