# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Just Read Comics is a utility for comic fans to discover where they can read the comics they want. Users search for a series and see which external services carry it — including subscription services (Marvel Unlimited, ComiXology Unlimited, DC Universe Infinite, Hoopla, Shonen Jump) and retailers (Amazon, Sweet Shop, Image, IDW, and others). The goal is to give readers a single place to answer "where can I read this?" without checking every service manually.

This project is actively in progress.

## Monorepo Structure

npm workspaces + Nx + Lerna. Packages must be built in dependency order — `common` and `shared-node` always first, since all other packages import from their `dist/` output.

| Package                       | Purpose                                                                | Port |
| ----------------------------- | ---------------------------------------------------------------------- | ---- |
| `@justreadcomics/common`      | Shared types, constants, browser+node utilities                        | —    |
| `@justreadcomics/shared-node` | Node-only: Mongoose models, DB connection, auth middleware, S3, logger | —    |
| `@justreadcomics/client`      | React SPA (Create React App)                                           | 3000 |
| `@justreadcomics/server`      | Express REST API                                                       | 8090 |
| `@justreadcomics/scraper`     | Express scraping service (Puppeteer + Cheerio)                         | 9090 |
| `justreadcomics-lambda`       | AWS Lambda handlers (AWS SAM)                                          | —    |

## Commands

```bash
# Build shared packages first (required before starting/building anything else)
npm run common

# Start all packages in dev mode
npm run start:dev

# Run all tests
npm test

# Run tests for a specific package
nx test @justreadcomics/scraper

# Run a single test file
npx jest packages/scraper/src/__tests__/myfile.test.ts

# Lint / format
npm run lint
npm run lint:fix
npm run format
```

## Environment Config

Each backend package loads its config from `./config/.env.${NODE_ENV}.local` (e.g. `packages/server/config/.env.development.local`). The `dotenv.config()` call in each `server.ts` **must stay at the top**, before any module imports that need env vars — this is a known constraint noted in comments.

Required env vars: `DATABASE_URL`, `TOKEN_KEY`, `MASS_IMPORT_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`.

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

### Auth

JWT-based. `verifyTokenMiddleware` in `shared-node` validates the `Authorization` header bearer token against `TOKEN_KEY`. `keyChecker` validates a query param key for mass import operations.

## Git Workflow

**Never push to the remote repository automatically.** Always:

1. Draft a detailed commit message describing what changed and why.
2. Present the message to the user for approval before committing.
3. Wait for explicit user instruction before running `git push`.

This applies to all branches and all contributors.

## Memory & Progress

Always save progress, decisions, and context that would be useful to other contributors in project memory (`.claude/` memory files). This includes:

- Architectural decisions and the reasoning behind them
- Known constraints, workarounds, or non-obvious behaviors
- In-progress work or partially completed features
- Any context that isn't obvious from reading the code or git history

## Commit Messages

Follows Conventional Commits (enforced by commitlint + husky):

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Subject must be lowercase, max 72 chars total header.

## Testing

Tests live in `src/__tests__/` in each package. Scraper tests use `ts-jest` with a 30s timeout (Puppeteer is slow). Client tests use `jsdom` and enforce 80% coverage thresholds. Tests import from `@justreadcomics/common/dist/` and `@justreadcomics/shared-node/dist/`, so those packages must be built before running tests.
