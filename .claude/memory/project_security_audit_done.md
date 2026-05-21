---
name: project-security-audit-done
description: Security audit complete — key constraints, deferred risks, and env var requirements that future sessions must know about
metadata:
  type: project
---

All 4 security audit batches committed on 2026-05-18/19 (commits on branch `v2`). Findings from [[security-audit-batches]].

## Constraints future sessions must know

**PASSWORD_HASH env var required.** Auth now uses bcrypt — plain-text `PASSWORD` is gone. If `PASSWORD_HASH` is missing on startup, the server warns and all logins fail. To generate: `PASSWORD=<pw> npx ts-node scripts/hash-password.ts` in `packages/server`. Store the output as `PASSWORD_HASH` in `packages/server/config/.env.development.local`.

**Why:** Plain-text password comparison was a P0 credential exposure risk.

**MASS_IMPORT_KEY is now a request header, not a query param.** Any caller outside this repo that previously used `?key=<value>` must switch to `x-api-key: <value>` header.

**Why:** Query params appear in server logs and browser history.

**cheerio pinned to exact `1.0.0` (no caret) in scraper.** `^1.0.0-rc.12` resolves to `1.2.0` which pulls in undici/`File` global — crashes on Node 18. Do NOT change to a range or upgrade without first confirming Node ≥ 20.

**Why:** Discovered when bcrypt install triggered lockfile resolution to cheerio 1.2.0.

**CORS defaults to `'*'` when `ALLOWED_ORIGINS` is unset.** Production deploy must set `ALLOWED_ORIGINS=https://justreadcomics.com` (comma-separated) or the CORS restriction is a no-op.

**Why:** First attempt used `undefined` as origin which blocked all requests; fallback to `'*'` was the safe default.

## Deferred risks (non-trivial, known, not addressed)

**httpOnly cookie migration.** Auth tokens are still in `localStorage` — vulnerable to XSS. Batch 3 deferred a full httpOnly cookie rewrite as a separate architectural change. This is the highest-remaining auth risk.

**9 npm audit vulnerabilities remaining** (reduced from 107 via CRA→Vite migration on 2026-05-19, then 74→9 via dep upgrade session on 2026-05-21). All remaining are devtool or build-tool scope — zero production runtime vulns. Tracked in [[project-vuln-backlog]].

**lambda package has pre-existing ESLint + typecheck failures.** Not introduced by this audit. The lambda scrape functions are stubs returning 501 — likely not in production use.

## NOT IMPLEMENTED items in scraper (from search.ts)

- Availability-only search (`fetchMetaData` path for corpo)
- Scan date update after queue insertion
- Scanner override to force image re-upload
- Credits normalization for corpo scraper
- Distance check + queue for hoopla `fetchMetaData` path

**How to apply:** Before touching search/scrape logic, check these are still stubs — don't assume they're implemented.
