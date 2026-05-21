---
name: project-vuln-backlog
description: npm audit vulnerability backlog — updated 2026-05-21 after major dep upgrade session
metadata:
  type: project
---

## Session summary (2026-05-21)

Started at 74 vulns, ended at 9. 8 commits landed on `v2`.

| Upgrade                      | Commit    | Vulns fixed                                                    |
| ---------------------------- | --------- | -------------------------------------------------------------- |
| nx 18→22                     | `159b653` | lerna/nx chain                                                 |
| vite 5→8 + vitest 1→4        | `f7800a4` | esbuild chain                                                  |
| puppeteer 21→25              | `03a68d0` | tar-fs chain                                                   |
| scraper tsconfig fix         | `703c0fb` | pre-existing bug                                               |
| npm audit fix (non-breaking) | —         | fast-xml-parser, undici, fast-uri, diff, body-parser, tmp, ajv |
| lerna 8→9                    | `62b5bf7` | tar / js-yaml / sigstore chain                                 |

---

## Remaining 9 vulnerabilities (as of 2026-05-21)

### HIGH — @typescript-eslint cascade (6 vulns)

**Packages:** `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@typescript-eslint/type-utils`, `@typescript-eslint/typescript-estree`, `@typescript-eslint/utils`, `minimatch`

**Root cause:** `@testing-library/react@13.4.0` + `@testing-library/jest-dom@5.17.0` require `@types/node@^18.x`. npm installs `@types/node@18.x` locally in the client package, which creates a peer dep conflict — npm falls back to installing `@typescript-eslint@6.21.0` locally (incompatible with the hoisted `@typescript-eslint@8.30.1`). `@typescript-eslint@6.x` brings in a vulnerable `minimatch@9.0.0–9.0.6`.

**Risk:** Linting-only. Zero production blast radius. Exploitation requires crafting malicious glob patterns inside the lint process.

**Fix:** Upgrade in `packages/client/package.json`:

- `@testing-library/react`: `^13.4.0` → `^16.0.0`
- `@testing-library/jest-dom`: `^5.17.0` → `^6.0.0`
- `@testing-library/user-event`: `^13.5.0` → `^14.0.0`

Tackle as a dedicated session — these have their own breaking changes between major versions.

---

### MODERATE — brace-expansion via nx@22.7.2 (1 vuln)

**Package:** `brace-expansion@5.0.2–5.0.5` bundled inside `nx@22.7.2`

**CVE:** Large numeric range defeats documented `max` DoS protection (GHSA-jxxr-4gwj-5jf2)

**Root cause:** nx@22.7.2 ships with vulnerable brace-expansion. The only available fix is downgrading to `nx@22.6.5` — we don't want that.

**Risk:** Build-tool only (nx internals). Not in production runtime. No safe upgrade path exists as of 2026-05-21.

**Fix:** Wait for nx to release a patch with brace-expansion ≥5.0.6. Check periodically with `npm outdated nx`.

---

### MODERATE — yaml / js-yaml via nx chain (2 vulns)

**Packages:** `yaml@2.0.0–2.8.2`, `js-yaml@4.0.0–4.1.0`

**CVEs:** yaml stack overflow via deeply nested collections; js-yaml prototype pollution in merge

**Root cause:** Both are transitive deps of nx and its lerna sub-dependencies. `npm audit fix` reports these as fixable but loops — the fix requires force-installing an older nx (which we don't want).

**Risk:** Build-tool only. Not in production runtime.

**Fix:** Same as brace-expansion — wait for nx patch, or revisit after nx releases a new minor.

---

## Deferred upgrades (out of scope, tracked for future sessions)

### react-router-dom v6 → v7

**Vuln:** XSS via open redirect in `@remix-run/router ≤1.23.1` (GHSA-2w69-qvjg-hvjx) — HIGH severity

**Why deferred:** React Router v7 is a major rewrite. Requires dedicated migration work (new file-based routing API, loader/action patterns). Not a drop-in upgrade.

**Fix path:**

1. Read React Router v7 migration guide
2. Update `packages/client/package.json`: `react-router-dom@^6.17.0` → `^7.0.0`
3. Migrate route definitions, loaders, and any RR6-specific APIs in `packages/client/src/`

---

## Priority order for next session

1. **@testing-library 13→16** — fixes 6 HIGH vulns, low blast radius (test code only)
2. **react-router-dom v6→v7** — fixes 1 HIGH vuln, moderate migration effort
3. **nx patch watch** — passive; check `npm outdated nx` monthly
