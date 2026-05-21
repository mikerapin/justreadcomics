# Just Read Comics — Engineer & AI Context

## What this is

**Just Read Comics (JRC)** is the JustWatch.com for digital comics.

Comic book readers who want to read digitally face a fragmented landscape: content is scattered across unlimited subscription services (Marvel Unlimited, DC Universe Infinite), library apps (Hoopla, Libby), storefronts (ComiXology, Google Play Books), publisher direct sites (Shonen Jump, Webtoon), and more. It's often impossible to know which service carries a given series, whether it's free, paid, or requires membership — without checking each platform manually.

JRC solves this by letting users search for any comic book series, original graphic novel, collected edition, anthology, or graphic album and get back:

- **Basic metadata** — title, description, issue count, publication dates
- **Creators** — writer, artist, penciller, inker, letterer, editor, colorist, etc.
- **Cover image(s)**
- **Availability list** — which digital services carry it, and on what terms (free, paid, subscription-included, library borrow, etc.)

If a title has no digital availability anywhere, that's still a valid and useful result — the goal is consolidating all options into one place so fans can make informed decisions about where to read legally.

The product model follows JustWatch closely: a neutral aggregator that links out to sources rather than hosting content itself. The name says it all — the goal is to get people to **Just Read Comics**.

## Monorepo structure

```
packages/
  client/       React SPA (Vite 8 + Vitest 4)
  server/       Express 5 API
  scraper/      Express 5 service — Puppeteer-based scraper
  shared-node/  Shared Express/Mongoose/AWS utilities (server + scraper)
  common/       Shared types and constants (all packages)
  lambda/       AWS Lambda handlers — currently stubs returning 501
```

**Build order is mandatory:** `common` must build before `shared-node`, and both before `server`/`scraper`. Always run:

```bash
npm run common   # builds @justreadcomics/common + @justreadcomics/shared-node
```

## Active branch

`v2` is the active development branch. `main` has the previous stable state. `develop` exists but is behind v2.

## Key commands

```bash
npm run common              # build common + shared-node (required first)
npm run start:dev           # start all packages in dev mode
npm run build               # build all packages
npm run test                # run all tests via nx
npm audit                   # check vulnerabilities (9 remaining as of 2026-05-21)
```

## Environment variables

Each package has `config/.env.development.local` (gitignored). Key vars:

| Var               | Package        | Notes                                                                                                                      |
| ----------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `PASSWORD_HASH`   | server         | bcrypt hash — plain `PASSWORD` is gone. Generate: `PASSWORD=<pw> npx ts-node scripts/hash-password.ts`                     |
| `ALLOWED_ORIGINS` | server/scraper | Comma-separated allowed CORS origins. **Must set in production** (`https://justreadcomics.com`) or CORS defaults to `'*'`. |
| `MASS_IMPORT_KEY` | server         | Now a request header (`x-api-key`), not a query param                                                                      |
| `MONGO_URI`       | server/scraper | MongoDB connection string                                                                                                  |

## Import patterns

`@justreadcomics/common` is CJS. Use default/namespace imports, not named:

```typescript
// ✓ correct
import CommonModule from '@justreadcomics/common';
import * as Common from '@justreadcomics/common';

// ✗ breaks at runtime in Vite
import { SomeType } from '@justreadcomics/common';
```

If you add new `@justreadcomics/common/dist/*` sub-path imports in the client, add them to `optimizeDeps.include` in `packages/client/vite.config.ts`.

## Known constraints and gotchas

**cheerio pinned to exact `1.0.0`** in scraper — do NOT add caret or upgrade without confirming Node ≥ 20. `^1.0.0-rc.12` resolves to `1.2.0` which crashes on Node 18.

**Express 5 requires handlers on every route.** Routes registered without a handler throw at startup. Three scraper routes are intentionally commented out as stubs — do not uncomment without implementing the handler.

**`packages/client/eslintrc.js`** (no leading dot) — likely dead. ESLint auto-discovery skips non-dotfiles. Uses `airbnb-typescript` and `plugin:jest/recommended` which aren't in devDependencies. Client is picking up root eslint config instead.

**`packages/lambda`** — all handlers return 501 Not Implemented. Has pre-existing ESLint and typecheck failures. Not in production use.

**Root `package.json` dependencies** includes `react`, `react-dom`, `bootstrap`, `react-bootstrap` — these are legacy artifacts, the canonical versions live in `packages/client/package.json`.

## NOT IMPLEMENTED scraper stubs

Before touching search/scrape logic in `packages/scraper/src/`, check that these are still stubs:

- Availability-only search (`fetchMetaData` path for corpo)
- Scan date update after queue insertion
- Scanner override to force image re-upload
- Credits normalization for corpo scraper
- DC, Shonen Jump, Hoopla refresh routes (commented out in `scraper.ts`)

## npm vulnerability status (2026-05-21)

9 remaining (0 critical, 6 high devtool-only, 3 moderate build-tool-only). Full analysis in `.claude/memory/project_vuln_backlog.md`.

Next: `@testing-library` 13→16 (fixes 6 high), then `react-router-dom` v6→v7.

## Commit conventions

Conventional Commits enforced via commitlint — **72 char max header**, scope = package name (`client`, `scraper`, `server`, `deps`, etc.). Subject must be lowercase.

Never commit or push automatically. Draft message → present to Mike → wait for explicit approval.
