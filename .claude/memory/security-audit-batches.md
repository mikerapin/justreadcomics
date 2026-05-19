---
name: security-audit-batches
description: Security and code-quality audit findings for justreadcomics, structured as 4 executable batches ordered by priority. Process one batch per session.
metadata:
  type: project
---

# Security & Code-Quality Audit — Batch Processing Queue

Findings from a full-stack audit of the justreadcomics TypeScript monorepo. Process **one batch per session**, top to bottom. Mark items `[x]` as completed. Do not start a lower batch until the batch above it is fully done and committed.

Use context7 MCP to verify current API docs for any library before editing (helmet, express-rate-limit, bcrypt, cheerio, mongoose, jsonwebtoken).

---

## Batch 1 — CRITICAL: Credential Exposure & Auth Fundamentals
**Findings addressed:** C1a, C1b, C1c, C2, C3, H3, H4
**Status:** 🟢 Done (committed 2026-05-18)

### Pre-work (user must do manually before Claude touches code)
- [ ] Rotate MongoDB Atlas connection string (new password)
- [ ] Rotate AWS IAM access key — deactivate `AKIA2XPRKN3DWEVBFDOQ`, create new key
- [ ] Generate new `TOKEN_KEY`: `openssl rand -base64 64`
- [ ] Generate new `MASS_IMPORT_KEY`: `openssl rand -hex 32`
- [ ] Update all local `.env.development.local` files with new values

### Code changes (Claude executes after user rotates secrets)

**1. Fix Claude Code deny rules** — `.claude/settings.json`
- Add to deny array: `"Read(packages/**/config/.env*)"`, `"Read(packages/**/config/*.env*)"`

**2. Audit git history for committed credentials**
- Run: `git log --all -p -- 'server/config.env' 'packages/server/config/.env*' 'packages/scraper/config/.env*'`
- If real secrets found in history: `git filter-repo --path server/config.env --invert-paths` (requires `pip install git-filter-repo`)

**3. Audit `packages/client/public/.env` (tracked by git)**
- Read file — if it contains only `REACT_APP_*` public vars it's safe; if secrets exist, remove from git with filter-repo

**4. Harden `.gitignore`** — add explicit lines after the existing `.env.*` rule:
```
.env.*.local
packages/**/config/.env*
```
- Add `.env.example` files for `packages/server/config/` and `packages/scraper/config/` documenting all required vars with placeholder values

**5. Restrict CORS** — `packages/server/src/server.ts` + `packages/scraper/src/server.ts`
```typescript
// Before:
app.use(cors())
// After:
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }))
```
Add `ALLOWED_ORIGINS=http://localhost:3000` to `.env.example`

**6. Hash admin password** — `packages/server/src/controllers/auth.ts`
- Install `bcrypt` + `@types/bcrypt` in server package
- Replace plain-text comparison with `await bcrypt.compare(password, process.env.PASSWORD_HASH)`
- Add a one-time hash script: `packages/server/scripts/hash-password.ts` that reads `PASSWORD` env var and prints the bcrypt hash to stdout so the user can store it as `PASSWORD_HASH`

**7. Move MASS_IMPORT_KEY to request header** — `packages/shared-node/src/middleware/auth.ts`
```typescript
// Before: req.query.key !== key
// After:  req.headers['x-api-key'] !== key
```
- Update all callers that pass `?key=` query param to send `x-api-key` header instead

**Verification after Batch 1:**
```bash
npm run lint && npx tsc --noEmit
npm test
npm audit --audit-level=high
# Confirm new CORS: start server, curl -H "Origin: https://evil.com" http://localhost:8090/api/series
# Expect: no Access-Control-Allow-Origin: https://evil.com
```

---

## Batch 2 — HIGH: Security Hardening Middleware
**Findings addressed:** H1, H2, M1, M2, M3, M7
**Status:** 🟢 Done (committed 2026-05-19)

**1. Add helmet** — `packages/server/src/server.ts` + `packages/scraper/src/server.ts`
- Install `helmet` in both packages
- `app.use(helmet())` before all routes; use context7 to verify helmet v7 CSP config if setting custom policy

**2. Add rate limiting** — `packages/server/src/server.ts`
- Install `express-rate-limit` in server package; use context7 for current v7 API
- Auth route: `rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })` on `/api/auth/login`
- Write routes: `rateLimit({ windowMs: 60 * 1000, max: 30 })` on mutating endpoints

**3. Set body size limits** — both `server.ts` files
```typescript
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ limit: '100kb', extended: true }))
```

**4. Fix image URL validation** — `packages/server/src/controllers/queue.ts:97`
```typescript
// Before: !imageUrl?.match(/justreadcomics/gi)
// After: proper URL parse + allowlist
const allowedHosts = ['s3.amazonaws.com', 'www.justreadcomics.com']
const parsed = new URL(imageUrl)
if (!allowedHosts.some(h => parsed.hostname.endsWith(h))) throw new Error('Invalid image URL')
```

**5. Fix common circular self-dependency** — `packages/common/package.json`
- Remove `"@justreadcomics/common": "1.0.0"` from its own `dependencies`

**Verification after Batch 2:**
```bash
npm run lint && npx tsc --noEmit
npm test
# Confirm helmet headers: curl -I http://localhost:8090/api/series
# Expect: X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security
# Confirm rate limit: loop 15 POST /api/auth/login, expect 429 after threshold
```

---

## Batch 3 — HIGH/MEDIUM: Pattern Modernization
**Findings addressed:** H5 (partial), H6, L2, L4, L5
**Status:** 🟢 Done (committed 2026-05-19)

**1. Update CI pipeline** — `ci.yml`
- Change `ubuntu-18.04` → `ubuntu-latest`
- Change node version `14` → `18` (matches root `engines >= 18`)

**2. Upgrade cheerio** — `packages/scraper/package.json`
- Change `cheerio@1.0.0-rc.12` → `cheerio@1.0.0` (stable)
- Use context7 to verify no breaking API changes; check all `cheerio.load()` usages in `packages/scraper/src/scrape/*.ts`

**3. Add 401 expiry UX to client** — `packages/client/src/data/fetch.ts`
- Wrap fetch calls; on 401 response: clear localStorage token, redirect to `/admin` login, show toast via existing `useToast` hook
- Note: switching from localStorage to httpOnly cookies is a larger arch change — log as future work, do not attempt here

**4. Type Lambda event properly** — `packages/lambda/src/index.ts:3`
- Replace `event: any` with `APIGatewayProxyEvent` from `@types/aws-lambda` (already installed)
- Replace hardcoded `{ beans: 'cool' }` stub with `{ statusCode: 501, body: JSON.stringify({ error: 'Not implemented' }) }`

**5. Fix username-as-user-ID** — `packages/server/src/controllers/user-queue.ts:70`
- Replace `res.locals.auth.username` with `res.locals.auth.sub` (JWT subject) as the user identifier
- Verify the JWT payload in `shared-node/src/middleware/auth.ts` includes `sub` when signing; if not, add it to the sign payload in `packages/server/src/controllers/auth.ts`

**Verification after Batch 3:**
```bash
npm run lint && npx tsc --noEmit
npm test
# Confirm CI change: review ci.yml diff
# Confirm cheerio still works: nx test @justreadcomics/scraper
```

---

## Batch 4 — MEDIUM/LOW: Code Quality
**Findings addressed:** M4, M5, M6, L1, L3, L6
**Status:** 🟢 Done (committed 2026-05-19)

**1. Add shared error helper** — new file `packages/common/src/util/error.ts`
```typescript
export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
```
Export from `packages/common/src/index.ts`

**2. Replace `catch (err: any)` with `catch (err: unknown)`** — all packages
- Grep: `grep -r "catch (err: any)" packages/*/src --include="*.ts" -l`
- Replace pattern: `catch (err: any)` → `catch (err: unknown)`, use `getErrorMessage(err)` from common where message is needed

**3. Add scraper retry logic** — `packages/scraper/src/scrape/util.ts`
- Add a small `withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T>` helper
- Wrap `page.goto()` calls in `corpo.ts`, `marvel.ts`, `dc.ts`, etc. with `withRetry`
- Use context7 for `p-retry` if a library is preferred over an inline helper

**4. Add server tests** — new `packages/server/src/__tests__/`
- `auth.test.ts` — login success (mock bcrypt + jwt), bad password returns 401, missing fields returns 400
- `queue.test.ts` — image URL validation: valid host passes, unknown host throws
- Follow scraper test patterns (jest + jest.mock) as the template

**5. Address scraper TODOs** — `packages/scraper/src/actions/search.ts`
- Document the unfinished items formally (availability search, scan-date updates, scanner override) as GitHub issues or inline `// NOT IMPLEMENTED: <description>` comments; remove vague `// TODO` stubs that imply imminent work

**Verification after Batch 4:**
```bash
npm run lint && npx tsc --noEmit
npm test
# Check coverage: nx test @justreadcomics/server --coverage
# Expect new auth + queue tests pass
```

---

## Strengths — No Action Needed

- `strict: true` TypeScript across all packages
- Mongoose ODM — all DB calls parameterized (safe from injection)
- React default JSX escaping — no `dangerouslySetInnerHTML` usage
- `.npmrc`: `ignore-scripts=true`, `strict-ssl=true`, `audit=true`
- `escapeRegex()` helper used on user-controlled search input before DB queries
- S3 for all file uploads — no local disk writes

**Why:** [[security-audit-batches]]
**How to apply:** Reference this file at the start of each implementation session. Pick up the next incomplete batch, complete it fully (lint + typecheck + tests + commit), then stop.
