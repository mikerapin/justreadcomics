---
name: jrc-conventions
description: JRC monorepo conventions — commit format, build order, import patterns, env config, deploy rules. Load when making commits, adding packages, touching Lambda code, or when conventions are unclear.
user-invocable: false
---

## Commit Format

Conventional Commits, enforced by commitlint. Format: `<type>(<scope>): <subject>`

- All lowercase, subject ≤72 chars total, no trailing period
- Allowed types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`
- Scope = affected package (e.g. `scraper`, `client`, `server`, `common`, `lambda`)
- **Never commit or push automatically.** Draft message → present to Mike → wait for explicit approval before `git commit`. Never run `git push` without instruction.

## Build Order

`@justreadcomics/common` and `@justreadcomics/shared-node` must build first — all other packages import from their `dist/`. Always run `npm run common` before starting or building anything else.

```bash
npm run common          # build shared packages first
npm run start:dev       # start all in dev mode
nx test @justreadcomics/scraper   # test a specific package
npx jest packages/scraper/src/__tests__/file.test.ts  # single test file
```

## Import Pattern from @justreadcomics/common

Package is built as CJS. Use default or namespace imports — named imports fail in some contexts:

```typescript
// ✓ correct
import CommonTypes from '@justreadcomics/common';
import * as CommonExports from '@justreadcomics/common';

// ✗ avoid
import { MARVEL_UNLIMITED_SERVICE_ID } from '@justreadcomics/common';
```

## Env Config

Each backend package loads from `./config/.env.${NODE_ENV}.local`. `dotenv.config()` must stay at the top of `server.ts`, before any imports that need env vars. Required vars: `DATABASE_URL`, `TOKEN_KEY`, `MASS_IMPORT_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`.

## Packages

| Package                       | Purpose                                          | Port |
| ----------------------------- | ------------------------------------------------ | ---- |
| `@justreadcomics/common`      | Shared types, constants, browser+node utils      | —    |
| `@justreadcomics/shared-node` | Mongoose models, DB, auth middleware, S3, logger | —    |
| `@justreadcomics/client`      | React SPA (Vite)                                 | 3000 |
| `@justreadcomics/server`      | Express REST API                                 | 8090 |
| `@justreadcomics/scraper`     | Express scraping (Puppeteer + Cheerio)           | 9090 |
| `justreadcomics-lambda`       | AWS Lambda handlers (SAM)                        | —    |

## Scraper Pattern

Each service has a file in `packages/scraper/src/scrape/` (mirrored in `packages/lambda/src/scrape/`). Three action types in `packages/scraper/src/actions/`: `search` (find + update or queue), `refresh` (re-fetch metadata), `indexed` (bulk import, mostly disabled). Use `initScraperPage` (Puppeteer) or `cleanSearch` from `scrape/util.ts`.

## Session Memory

Read `.claude/memory/MEMORY.md` at session start to catch decisions from prior sessions. Write architectural decisions, constraints, and in-progress work back to `.claude/memory/` — these files are committed and shared with all contributors.
