# Cat Expense Tracker 🐾

A premium, responsive **Svelte 5 + SvelteKit + TypeScript** web app to log and track expenses for your feline friends. Features automatic currency calculation, top-category highlighting, dynamic cat facts, and offline-tolerant local storage.

---

## ✨ Features

- **Expense management**: Add, edit, delete, and duplicate expenses.
- **Smart highlighting**: Highlights all rows in the highest-spending category, including ties (integer-cents arithmetic).
- **Sortable table**: Sort by item name, category, or amount (asc/desc).
- **Random cat facts**: Fetches a fact when the expense dialog opens, with loading UI, offline cache, and `AbortController` cleanup.
- **Responsive layout**: Mobile stacked dialog; desktop side-by-side form and fact panel; ultra-wide scaling via CSS tokens.
- **Premium UI**: Dark theme, glassmorphism, BEM-scoped component CSS, and hover micro-interactions.

---

## 🛠️ Tech Stack

| Layer           | Choice                                            |
| --------------- | ------------------------------------------------- |
| UI              | Svelte 5 (Runes: `$state`, `$derived`, `$effect`) |
| Routing / build | SvelteKit 2, `@sveltejs/adapter-static`           |
| Language        | TypeScript                                        |
| Bundler         | Vite 6                                            |
| Styling         | Vanilla CSS (BEM), co-located in `.svelte` files  |
| Unit tests      | Vitest, `@testing-library/svelte`, jsdom          |
| E2E / visual    | Playwright                                        |
| Formatting      | Prettier + `prettier-plugin-svelte`               |

**Architecture highlights**: SOLID-oriented modules — pure utils, injectable `IStorageService`, configuration-driven categories and sort strategies, discriminated `DialogMode` for add/edit.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `22.14.0` (see `.tool-versions` if you use `asdf`)
- **Yarn** 1.x

### Commands

```bash
# Install dependencies
yarn install

# Start dev server (http://localhost:5173)
yarn dev

# Lint
yarn lint

# Format source with Prettier
yarn format

# Unit tests (utilities, services, all Svelte components, routes)
yarn test

# Production build → ./build
yarn build

# Preview production build locally
yarn preview
```

---

## 📁 Project Layout (summary)

```
src/
├── routes/           # +page.svelte (dashboard), +layout.svelte (shell)
└── lib/
    ├── components/   # Svelte UI + *.test.ts
    ├── state/        # Runes state (*.svelte.ts)
    ├── types/        # models.ts re-exports expense, sort, dialog types
    ├── constants/    # app.ts (keys, API, validation), categories.ts
    ├── services/     # localStorage + cat fact API
    ├── utils/        # Pure helpers
    ├── mocks/        # Vitest shims (e.g. $app/paths)
    └── test/         # Shared test fixtures & snippet hosts
```

Import types and shared constants from explicit modules:

```ts
import type { Expense } from '$lib/types/models';
import { STORAGE_KEY } from '$lib/constants/app';
```

See [agents.md](agents.md) for full onboarding detail.

---

## 🧪 Testing

### Unit tests (Vitest)

- Co-located `*.test.ts` next to components, utils, services, and routes.
- Svelte components tested with `@testing-library/svelte` in a real DOM (`jsdom`).
- **Run**: `yarn test`

### E2E tests (Playwright)

- User flows: add/edit/duplicate/delete, sort, selection, highlighting, persistence.
- **Location**: `e2e-tests/expenseHighlight.spec.ts`
- **Run**: `yarn test:e2e`

### Visual regression (Playwright)

- Screenshot baselines for desktop/mobile layouts.
- **Location**: `visual-tests/expenseVisual.spec.ts`
- **Run**: `yarn test:visual`
- **Update baselines**: `yarn test:visual --update-snapshots`

---

## 🚀 CI/CD & Deployment

Pushes to **`main`** trigger [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

1. `yarn install --frozen-lockfile`
2. `yarn lint`
3. `yarn test`
4. `yarn build`
5. Deploy `./build` to **GitHub Pages**

The app `base` path is set from `GITHUB_REPOSITORY` in CI so assets load under `https://<user>.github.io/<repo>/`. Local dev uses `/`.

Generated folders (`build/`, `.svelte-kit/`) are gitignored — do not commit build output.

Optional manual deploy (CLI): `yarn deploy` (uses `gh-pages` and the `build/` directory).

---

## 📜 Scripts Reference

| Script             | Description                                   |
| ------------------ | --------------------------------------------- |
| `yarn dev`         | Vite dev server                               |
| `yarn build`       | `tsc -b` + static production build → `build/` |
| `yarn preview`     | Serve `build/` locally                        |
| `yarn lint`        | ESLint                                        |
| `yarn format`      | Prettier (includes `.svelte`)                 |
| `yarn test`        | Vitest unit tests                             |
| `yarn test:e2e`    | Playwright E2E                                |
| `yarn test:visual` | Playwright visual regression                  |
