---
name: project-vuln-backlog
description: npm audit vulnerability backlog — updated 2026-05-21 after major dep upgrade session
metadata:
  type: project
---

## Completed in 2026-05-21 session

- nx 18→22: DONE (`159b653`)
- vite 5→8 + vitest 1→4: DONE (`f7800a4`)
- puppeteer 21→25: DONE (`03a68d0`)
- scraper tsconfig exclude **tests**: DONE (`703c0fb`)
- npm audit fix (non-breaking): reduced 74→29 vulns
- lerna 8→9: IN PROGRESS (this session)

## Remaining known risks (as of 2026-05-21)

| Package                                  | Severity            | Fix                                                                     | Notes                                                                                                                                                                 |
| ---------------------------------------- | ------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@typescript-eslint/*` / `minimatch`     | High (devtool only) | Upgrade `@testing-library/react` 13→16, `@testing-library/jest-dom` 5→6 | Root cause: old testing libs require `@types/node@^18.x`, which cascades to local `@typescript-eslint@6.x` installs. Linting-only risk, zero production blast radius. |
| `react-router-dom` / `@remix-run/router` | High                | Upgrade to react-router-dom v7                                          | Excluded from current scope — requires RR7 migration work                                                                                                             |
| `brace-expansion` via `nx@22.7.2`        | Moderate            | Wait for nx patch; override would downgrade                             | Build-tool only. No safe upgrade path yet.                                                                                                                            |
| `js-yaml` / `yaml`                       | Moderate            | Fixed by lerna@9 upgrade                                                | In progress                                                                                                                                                           |
| `lerna` / `tar` chain                    | High                | lerna 8→9                                                               | In progress                                                                                                                                                           |

## TODO: @testing-library upgrade (tracked)

**Root cause identified:** `@testing-library/react@13.4.0` + `@testing-library/jest-dom@5.17.0` require `@types/node@^18.x`, which npm installs locally in the client package. This cascades to npm installing `@typescript-eslint@6.21.0` locally (incompatible peer chain with the hoisted `@typescript-eslint@8.30.1`).

**Fix:** Upgrade in client's `package.json`:

- `@testing-library/react`: `^13.4.0` → `^16.0.0`
- `@testing-library/jest-dom`: `^5.17.0` → `^6.0.0`
- `@testing-library/user-event`: `^13.5.0` → `^14.0.0`

Tackle as a dedicated session — these libraries have their own breaking changes between major versions.
