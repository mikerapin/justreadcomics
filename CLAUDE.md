# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Just Read Comics is a utility for comic fans to discover where they can read the comics they want. Users search for a series and see which external services carry it — including subscription services (Marvel Unlimited, ComiXology Unlimited, DC Universe Infinite, Hoopla, Shonen Jump) and retailers (Amazon, Sweet Shop, Image, IDW, and others). The goal is to give readers a single place to answer "where can I read this?" without checking every service manually.

This project is actively in progress.

## Monorepo Structure

npm workspaces + Nx. Packages must be built in dependency order — `common` and `shared-node` always first, since all other packages import from their `dist/` output.

| Package                       | Purpose                                                                | Port |
| ----------------------------- | ---------------------------------------------------------------------- | ---- |
| `@justreadcomics/common`      | Shared types, constants, browser+node utilities                        | —    |
| `@justreadcomics/shared-node` | Node-only: Mongoose models, DB connection, auth middleware, S3, logger | —    |
| `@justreadcomics/client`      | React SPA (Vite + React)                                               | 3000 |
| `@justreadcomics/server`      | Express REST API                                                       | 8090 |
| `@justreadcomics/scraper`     | Express scraping service (Puppeteer + Cheerio)                         | 9090 |
| `justreadcomics-lambda`       | AWS Lambda handlers (AWS SAM); mirrors scraper service scrapers        | —    |

## Commands

```bash
# Build shared packages first (required before starting/building anything else)
npm run common

# Start all packages in dev mode
npm run start:dev

# Run all tests
npm test

# Watch mode for active development
npm run test:watch

# Run tests for a specific package
nx test @justreadcomics/scraper

# Run a single test file
npx jest packages/scraper/src/__tests__/myfile.test.ts

# Lint / format
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Known Constraints & Gotchas

### Environment Config

Each backend package loads its config from `./config/.env.${NODE_ENV}.local` (e.g. `packages/server/config/.env.development.local`). The `dotenv.config()` call in each `server.ts` **must stay at the top**, before any module imports that need env vars — this is a known constraint noted in comments.

Required env vars: `DATABASE_URL`, `TOKEN_KEY`, `MASS_IMPORT_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`.

### CommonJS Imports from `@justreadcomics/common`

When importing from `@justreadcomics/common`, use default imports or `import * as` syntax to avoid CJS compatibility issues:

```typescript
// ✓ Good
import CommonTypes from '@justreadcomics/common';
import * as CommonExports from '@justreadcomics/common';

// ✗ Avoid
import { MARVEL_UNLIMITED_SERVICE_ID } from '@justreadcomics/common';
```

The package is built as CJS; named imports may fail in some contexts. Default or namespace imports are stable.

## Architecture

### Data Flow

The client talks to `server` for data (series, services, auth, queue management). The admin UI in the client triggers scrape operations against the `scraper` service. The scraper then updates MongoDB directly and uploads series images to S3.

### Key Domain Concepts

- **Series**: A comic series (`comic_series` collection), uniquely indexed by `seriesName`. Each series has a `services` subdocument array mapping service IDs to the URL of that series on the service.
- **Service IDs**: Hardcoded MongoDB ObjectId constants in `packages/common/src/const.ts` (e.g. `CORPO_SERVICE_ID`, `MARVEL_UNLIMITED_SERVICE_ID`). These are fixture IDs from the production DB.
- **Queue**: When a scraper finds a potential match but the string distance exceeds the threshold, the result is saved to a queue for admin review instead of auto-applying.
- **User Queue**: Separate from the admin queue — tracks user-submitted series edit suggestions.

### Scraper Pattern

Each service has a file in `packages/scraper/src/scrape/` (and mirrored in `packages/lambda/src/scrape/`). Scrapers use either Puppeteer (for JS-heavy pages) or Cheerio (for static HTML). `scrape/util.ts` provides `initScraperPage` (Puppeteer) and `cleanSearch` (strips parentheses from titles before searching).

The three scraper action types in `packages/scraper/src/actions/`:

- **search** (`search.ts`): Looks up a series by name on a service; if found and distance is within threshold, updates the series directly; otherwise queues for review.
- **refresh** (`refresh.ts`): Re-fetches metadata (description, credits, image) from a service URL that's already stored on a series.
- **indexed** (`indexed.ts`): Bulk-scrapes a service's own series index (one-time mass import, mostly disabled).

### Client Structure

`packages/client/src/` is organized as:

- `pages/` — top-level route views
- `components/` — shared UI components
- `admin/` — admin-only UI (triggers scrape operations against the scraper service)
- `hooks/`, `providers/` — React hooks and context providers
- `router/` — React Router config
- `styles/` — SCSS theming (see below)

### SCSS Theming

Design tokens live in `packages/client/src/styles/_variables.scss` as `$jrc-*` SCSS variables. Bootstrap 5.3 theming is applied in `_themes.scss` by overriding `--bs-*` CSS custom properties under `[data-bs-theme="dark"]` and `[data-bs-theme="light"]` selectors — this is how brand colors win over Bootstrap's defaults. `_typography.scss`, `_buttons.scss`, and `_components.scss` extend the theme. All partials are imported via `custom.scss`.

### Server Structure

`packages/server/src/controllers/` contains one file per domain: `auth.ts`, `series.ts`, `services.ts`, `queue.ts`, `user-queue.ts`. Each controller exports route handlers mounted in `server.ts`.

### Auth

JWT-based. `verifyTokenMiddleware` in `shared-node` validates the `Authorization` header bearer token against `TOKEN_KEY`. `keyChecker` validates a query param key for mass import operations.

## Git Workflow

**Never push to the remote repository automatically.** Always:

1. Draft a detailed commit message describing what changed and why.
2. Present the message to the user for approval before committing.
3. Wait for explicit user instruction before running `git push`.

This applies to all branches and all contributors.

## Memory & Progress

Session progress, decisions, and context are saved in `.claude/memory/` (see the index at `.claude/memory/MEMORY.md`). These files are **committed to git** and shared with all contributors. They include:

- Architectural decisions and the reasoning behind them
- Known constraints, workarounds, or non-obvious behaviors
- In-progress work or partially completed features
- Any context that isn't obvious from reading the code or git history

**Read `.claude/memory/MEMORY.md` to catch up on decisions from prior sessions.**

## Commit Messages

Follows Conventional Commits (enforced by commitlint + husky):

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Subject must be lowercase, max 72 chars total header.

## Testing

Tests live in `src/__tests__/` in each package.

- **Client** — Vitest + jsdom. Config in `packages/client/vite.config.ts`. Run with `npm run test --workspace=@justreadcomics/client`.
- **Server** — Jest + ts-jest. Config in `packages/server/jest.config.ts`.
- **Scraper** — Jest + ts-jest with a 30s timeout (Puppeteer is slow). Run with `nx test @justreadcomics/scraper`.

All packages import from `@justreadcomics/common/dist/` and `@justreadcomics/shared-node/dist/`, so those packages must be built (`npm run common`) before running tests.

To run a single scraper or server test file:
```bash
npx jest packages/scraper/src/__tests__/myfile.test.ts
```
