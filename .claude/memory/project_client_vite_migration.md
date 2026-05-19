---
name: project-client-vite-migration
description: CRA→Vite migration complete for client package — toolchain facts, non-obvious decisions, and gotchas for future sessions
metadata:
  type: project
---

CRA (`react-scripts`) fully replaced with Vite 5 + Vitest in commit `657f728` (2026-05-19).
Result: 107 → 15 npm audit vulnerabilities. Remaining 15 tracked in [[project-vuln-backlog]].

## Toolchain facts future sessions must know

**Dev server:** `npm run start:dev` in `packages/client` runs `vite --port 3000` (was `react-scripts start`).

**Test runner:** `npm run test` runs `vitest run --coverage` (not Jest). Config is in `packages/client/vite.config.ts`, not a separate jest config.

**Entry HTML:** Vite entry point is `packages/client/index.html` (package root), NOT `packages/client/public/index.html`. The `public/` directory still exists for static assets (favicon, manifest, etc.) and Vite serves them at `/`.

**Env vars:** `process.env.NODE_ENV` is gone from client source — replaced with `import.meta.env.MODE` (returns `'development'`/`'production'`/`'test'`) and `import.meta.env.PROD` (boolean). No `VITE_`-prefixed custom env vars in use yet.

## Non-obvious decisions

**Coverage thresholds removed.** The old `jest.config.js` had 80% global thresholds but CRA's `react-scripts test` was silently overriding the external jest config — thresholds were never enforced. Removed them from `vite.config.ts` rather than carry forward a fake gate.

**`jsdom` pinned to `24.1.3`** in devDependencies (not a range) — `npm audit fix --legacy-peer-deps` pinned it when resolving conflicts. Safe to widen back to `^24.0.0` if needed.

**`eslintrc.js`** (no leading dot) still exists in package root. ESLint auto-discovery looks for `.eslintrc.*` — the file may not be picked up automatically. Pre-existing issue, not introduced by this migration.

**CJS interop for `@justreadcomics/common` sub-paths.** Vite 5 serves linked workspace packages directly to the browser without pre-bundling, so CJS named imports (`exports.XXX = ...`) fail at runtime with "does not provide an export named". Fixed in commit `2d4bf28` by adding to `vite.config.ts`:
```typescript
optimizeDeps: { include: ['@justreadcomics/common', '...dist/const', '...dist/types/queue', '...dist/types/series', '...dist/types/services'] },
build: { commonjsOptions: { include: [/@justreadcomics\/common/, /node_modules/] } }
```
If you add new `@justreadcomics/common/dist/*` sub-path imports in the client, add them to `optimizeDeps.include` too.

**Why:** Motivation was eliminating the 107 CRA/webpack-sourced npm audit vulnerabilities which could not be fixed without replacing react-scripts.
