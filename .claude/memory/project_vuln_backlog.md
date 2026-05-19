---
name: project-vuln-backlog
description: Remaining 15 npm audit vulnerabilities after CRA→Vite migration — each requires a separate major-version upgrade to fix
metadata:
  type: project
---

After CRA→Vite migration (commit 657f728, 2026-05-19), vulns dropped from 107 → 15.
The remaining 15 (6 moderate, 9 high) each require a dedicated major-version upgrade:

| Package | Fix | Notes |
|---|---|---|
| `vite` / `esbuild` | Upgrade to Vite 6.5+ | Vite ≤6.4.1 has esbuild CVE; Node 18 compatible |
| `vitest` | Follows Vite — upgrade together | vitest depends on vite internals |
| `react-router-dom` / `@remix-run/router` | Upgrade react-router-dom (check major) | Pre-existing; check v7 migration guide |
| `@typescript-eslint/*` / `minimatch` | Upgrade @typescript-eslint to v7+ | Dev-only; low blast radius |
| `sort-by` / `object-path` | Replace or patch `sort-by` dep | Small utility; consider lodash alternative |
| `puppeteer` / `tar-fs` | Upgrade puppeteer to v25+ | Scraper package; breaking changes likely |

**Why deferred:** Each fix is a major-version bump with potential breaking changes and its own migration surface. Bundling them into the CRA→Vite commit would have made rollback harder.

**How to apply:** Tackle one package group per session. Suggested order: @typescript-eslint (dev-only, lowest risk) → react-router-dom → Vite 6.5+ + vitest → sort-by → puppeteer (highest risk, needs scraper regression testing).
